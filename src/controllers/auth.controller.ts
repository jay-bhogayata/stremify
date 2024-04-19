import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { z } from "zod";
import CustomError from "../utils/customError";
import { createUser, deleteUserById } from "../database/models/user";
import { SignUpUserRequest } from "../types";
import generateOTP from "../utils/generateOTP";
import config from "../config";
import { insertOTP } from "../database/models/otp";
import { hashPassword } from "../utils/password";
import { sendMail, PrepareEmailHtmlBody } from "../helpers/mail-helper";
import { db } from "../database/connection";

const sendVerificationEmail = async (email: string, otp: string) => {
  const body: string = PrepareEmailHtmlBody(otp);
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
