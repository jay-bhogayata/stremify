import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { z } from "zod";
import CustomError from "../utils/customError";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  verifyUserById,
} from "../database/models/user";
import { SignUpUserRequest, User } from "../types";
import generateOTP from "../utils/generateOTP";
import config from "../config";
import {
  deleteOTPByUserId,
  getOTPByUserId,
  insertOTP,
} from "../database/models/otp";
import { comparePassword, hashPassword } from "../utils/password";
import { sendMail } from "../helpers/mail-helper";
import { db } from "../database/connection";
import { logger } from "../utils/logger";
import { SessionData } from "express-session";
import { PrepareEmailHtmlBody } from "../helpers/verify-mail-template";

const sendVerificationEmail = async (email: string, otp: string) => {
  const verifyUserPageURL = `${config.FRONTEND_URL}/verifyuser`;
  const body: string = PrepareEmailHtmlBody(
    otp,
    Number(config.OTP_EXPIRY_TIME_IN_MINUTES),
    verifyUserPageURL
  );
  try {
    await sendMail({
      to: email,
      subject: "Email Verification for stremify",
      html: body,
    });
  } catch (error: any) {
    throw new CustomError("Failed to send email", 500);
  }
};

const SignUpRequestBody = z.object({
  name: z.string().min(1, "username is required"),
  email: z
    .string()
    .email("Invalid email format. Please provide a valid email address"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, password } = SignUpRequestBody.parse(req.body);

    const hashedPassword = await hashPassword(password);

    const userInfo: SignUpUserRequest = {
      name,
      email,
      password: hashedPassword,
    };

    const createdUser = await createUser(userInfo, db);

    const otp = generateOTP(6);

    const otpExpiry = new Date(
      Date.now() + Number(config.OTP_EXPIRY_TIME_IN_MINUTES) * 60 * 1000
    );

    await insertOTP(createdUser.id, otp, otpExpiry, db);

    try {
      await sendVerificationEmail(email, otp);
    } catch (error: any) {
      await deleteUserById(createdUser.id, db);
      throw error;
    }

    res.status(201).json({ message: "sign up successful", user: createdUser });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const Errors = error.errors.map(({ path, message }) => ({
        field: path[0],
        message,
      }));

      res.status(400).json({ errors: Errors });
    } else if (error instanceof CustomError) {
      res.status(error.code).json({ message: error.message });
    } else {
      throw new CustomError(error, 500);
    }
  }
});
// TODO: if otp is send successfully but user is not verified then send them email about verification after some time use some kind of scheduler mechanism.

const verifyUserReqBody = z.object({
  email: z
    .string()
    .email("Invalid email format. Please provide a valid email address"),
  otp: z.string().length(6, {
    message: "OTP length must be 8",
  }),
});

export const verifyUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { otp, email } = verifyUserReqBody.parse(req.body);

    const user = await getUserByEmail(email, db);

    const userID: string | undefined = user?.id;

    if (userID) {
      const otpInfo = await getOTPByUserId(userID, db);

      if (otpInfo) {
        if (new Date(otpInfo.expiredAt) < new Date()) {
          logger.error("otp is expired", {
            otp: otpInfo,
            user_id: userID,
          });
          res.status(401).json({
            error: "your otp is expired try getting new one",
          });
        } else {
          if (otp !== otpInfo.otp) {
            logger.error("Invalid OTP", {
              otp: otpInfo,
              user_id: userID,
            });

            res.status(401).json({
              error: "Invalid OTP",
            });
          } else {
            const user = await verifyUserById(userID, db);
            if (user) {
              res
                .status(200)
                .json({ message: "user is verified successfully", user: user });
            }
            await deleteOTPByUserId(userID, db);
          }
        }
      } else {
        logger.error("otp is not found", {
          user_id: userID,
        });

        throw new CustomError("otp is not found", 404);
      }
    } else {
      logger.error("user not found", {
        email,
      });

      throw new CustomError("user not found", 404);
    }

    res.status(200).json(req.params.userID);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const Errors = error.errors.map(({ path, message }) => ({
        field: path[0],
        message,
      }));

      res.status(400).json({ errors: Errors });
    } else if (error instanceof CustomError) {
      res.status(error.code).json({ message: error.message });
    }
  }
});

const loginRequestBody = z.object({
  email: z
    .string()
    .email("Invalid email format. Please provide a valid email address"),
  password: z.string().min(8, {
    message: "Invalid password , password must be at least 8 characters long",
  }),
});

export const validateUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email, db);

  if (!user) {
    throw new CustomError("user not found", 404);
  }

  if (!user.verified) {
    throw new CustomError("user is not verified", 401);
  }

  if (user.password) {
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Invalid password", 401);
    }
  } else {
    logger.error("user password is undefined");
    throw new CustomError("Internal server error", 500);
  }

  return user;
};

const createSessionUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified,
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = loginRequestBody.parse(req.body);
    const user = await validateUser(email, password);
    const sessionUser = createSessionUser(user);

    (req.session as SessionData).isLoggedIn = true;
    (req.session as SessionData).user = sessionUser;

    req.session.regenerate((err: unknown) => {
      if (err) {
        throw new CustomError("Failed to login", 500);
      }
    });

    res.status(200).json({ message: "login successful" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const Errors = error.errors.map(({ path, message }) => ({
        field: path[0],
        message,
      }));

      res.status(400).json({ errors: Errors });
    } else if (error instanceof CustomError) {
      res.status(error.code).json({ message: error.message });
    } else {
      throw new CustomError(error, 500);
    }
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  (req.session as SessionData).destroy((err: unknown) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Could not log out, please try again" });
    } else {
      res.clearCookie("sessionId");
      return res.status(200).json({ message: "Logged out successfully" });
    }
  });
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ user: (req.session as SessionData).user });
});
