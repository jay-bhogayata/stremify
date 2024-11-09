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

/**
 * @openapi
 * components:
 *   schemas:
 *     SignUpRequestBody:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The user's full name.
 *           minLength: 1
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           description: The user's password.
 *           minLength: 8
 *           example: password123
 *       example:
 *         name: John Doe
 *         email: john.doe@example.com
 *         password: password123
 */
const SignUpRequestBody = z.object({
  name: z.string().min(1, "username is required"),
  email: z
    .string()
    .email("Invalid email format. Please provide a valid email address"),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
});

/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: User Signup
 *     description: Creates a new user and sends a verification email with an OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: The user information for signing up.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequestBody'
 *     responses:
 *       201:
 *         description: Signup successful. User created and OTP sent for email verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: sign up successful
 *                 user:
 *                   $ref: '#/components/schemas/ResponseUser'
 *       400:
 *         description: Validation error in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: email
 *                       message:
 *                         type: string
 *                         example: Invalid email format. Please provide a valid email address
 *       500:
 *         description: Internal server error or failed to send verification email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to send email
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     VerifyUserRequestBody:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         otp:
 *           type: string
 *           description: The OTP for email verification.
 *           minLength: 6
 *           maxLength: 6
 *           example: "123456"
 */
const verifyUserReqBody = z.object({
  email: z
    .string()
    .email("Invalid email format. Please provide a valid email address"),
  otp: z.string().length(6, {
    message: "OTP length must be 8",
  }),
});

/**
 * @openapi
 * /api/v1/auth/verify:
 *   post:
 *     summary: Verify User
 *     description: Verifies a user using the provided email and OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: The email and OTP for user verification.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyUserRequestBody'
 *     responses:
 *       200:
 *         description: User verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user is verified successfully
 *                 user:
 *                   $ref: '#/components/schemas/ResponseUser'
 *       400:
 *         description: Validation error in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: email
 *                       message:
 *                         type: string
 *                         example: Invalid email format. Please provide a valid email address
 *       401:
 *         description: OTP expired or invalid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: your otp is expired try getting new one
 *       404:
 *         description: User or OTP not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequestBody:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           description: The user's password.
 *           minLength: 8
 *           example: password123
 */
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

export const createSessionUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified,
});

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and starts a session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: The email and password for login.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequestBody'
 *     responses:
 *       200:
 *         description: Login successful.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: sessionID=abcde12345; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: login successful
 *                 user:
 *                   $ref: '#/components/schemas/ResponseUser'
 *       400:
 *         description: Validation error in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: email
 *                       message:
 *                         type: string
 *                         example: Invalid email format. Please provide a valid email address
 *       401:
 *         description: Unauthorized, login failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to login
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
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

    res.status(200).json({ message: "login successful", user: sessionUser });
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

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out a user and destroys the session.
 *     tags:
 *       - Authentication
 *     security:
 *      - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: User not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Could not log out, please try again
 */
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

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of the logged-in user.
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/ResponseUser'
 *       401:
 *         description: Unauthorized, user not logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not logged in
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const profile = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ user: (req.session as SessionData).user });
});

export const updateSession = async (req: Request, res: Response) => {
  const user = await getUserByEmail(
    (req.session as SessionData).user.email,
    db
  );

  if (user) {
    const sessionUser = createSessionUser(user);

    (req.session as SessionData).isLoggedIn = true;
    (req.session as SessionData).user = sessionUser;

    req.session.regenerate((err: unknown) => {
      if (err) {
        throw new CustomError("Failed to login", 500);
      }
    });

    res
      .status(200)
      .json({ message: "session update successful", user: sessionUser });
  } else {
    throw new CustomError("user not found", 404);
  }
};
