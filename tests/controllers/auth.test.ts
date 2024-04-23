import { signUp, verifyUser } from "../../src/controllers/auth.controller";
import { Request, Response } from "express";
import { db } from "../../src/database/connection";
import {
  createUser,
  deleteUserById,
  verifyUserById,
} from "../../src/database/models/user";
import {
  deleteOTPByUserId,
  getOTPByUserId,
  insertOTP,
} from "../../src/database/models/otp";
import { hashPassword } from "../../src/utils/password";
import { sendMail } from "../../src/helpers/mail-helper";
import generateOTP from "../../src/utils/generateOTP";
import CustomError from "../../src/utils/customError";

jest.mock("../../src/database/models/user");
jest.mock("../../src/database/models/otp");
jest.mock("../../src/utils/password");
jest.mock("../../src/helpers/mail-helper");
jest.mock("../../src/utils/generateOTP");
jest.mock("../../src/database/connection");

afterEach(() => {
  jest.clearAllMocks();
});

describe("signUp", () => {
  it("handles a successful sign up", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const hashedPassword = "hashedPassword";
    const otp = "123456";
    const user = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    };

    (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
    (generateOTP as jest.Mock).mockReturnValue(otp);
    (createUser as jest.Mock).mockResolvedValue(user);
    (insertOTP as jest.Mock).mockResolvedValue({});
    (sendMail as jest.Mock).mockResolvedValue({});

    await signUp(req, res, jest.fn()); // Add `jest.fn()` as the third argument

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "sign up successful",
      user,
    });
  });

  it("handles invalid request body", async () => {
    const req = {
      body: {
        name: "",
        email: "invalid email",
        password: "short",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await signUp(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        { field: "name", message: "username is required" },
        {
          field: "email",
          message: "Invalid email format. Please provide a valid email address",
        },
        {
          field: "password",
          message: "Password must be at least 8 characters long",
        },
      ],
    });
  });

  it("handles error when sending verification email", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const hashedPassword = "hashedPassword";
    const otp = "123456";
    const user = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    };

    (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
    (generateOTP as jest.Mock).mockReturnValue(otp);
    (createUser as jest.Mock).mockResolvedValue(user);
    (insertOTP as jest.Mock).mockResolvedValue({});
    (sendMail as jest.Mock).mockRejectedValue(
      new Error("Failed to send email")
    );

    await signUp(req, res, jest.fn());

    expect(deleteUserById).toHaveBeenCalledWith(user.id, db);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to send email" });
  });

  it("handles unexpected error", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const error = new CustomError("Unexpected error", 500);

    (createUser as jest.Mock).mockRejectedValue(error);

    await signUp(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Unexpected error" });
  });

  it("handles email already exists error", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@exmaple.com",
        password: "password",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const error = new CustomError("user with this email already exists", 409);

    (createUser as jest.Mock).mockRejectedValue(error);

    await signUp(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "user with this email already exists",
    });

    expect(deleteUserById).not.toHaveBeenCalled();
  });
});

describe("verifyUser", () => {
  it("verifies a user successfully", async () => {
    const mockReq = {
      params: { userID: "11f49ff-2cbb-4b66-8b73-53a3bee6103b" },
      body: { otp: "123456" },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockOTPInfo = {
      otp: "123456",
      expiredAt: new Date(Date.now() + 10000),
    };

    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      role: "guest",
      verified: true,
    };

    (
      getOTPByUserId as jest.MockedFunction<typeof getOTPByUserId>
    ).mockResolvedValueOnce(mockOTPInfo);
    (
      verifyUserById as jest.MockedFunction<typeof verifyUserById>
    ).mockResolvedValueOnce({
      ...mockUser,
      role: "guest",
    });
    (
      deleteOTPByUserId as jest.MockedFunction<typeof deleteOTPByUserId>
    ).mockResolvedValueOnce(undefined);

    await verifyUser(mockReq, mockRes, jest.fn());

    expect(getOTPByUserId).toHaveBeenCalledWith(mockReq.params.userID, db);
    expect(verifyUserById).toHaveBeenCalledWith(mockReq.params.userID, db);
    expect(deleteOTPByUserId).toHaveBeenCalledWith(mockReq.params.userID, db);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "user is verified successfully",
      user: mockUser,
    });
  });
  it("response with error when user id not found", async () => {
    const mockReq = {
      params: { userID: "11f49ff-2cbb-4b66-8b73-53a3bee6103b" },
      body: { otp: "123456" },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockErrorInfo = {
      code: "22P02",
      message: "Invalid user id",
    };

    (
      getOTPByUserId as jest.MockedFunction<typeof getOTPByUserId>
    ).mockRejectedValue(new CustomError(mockErrorInfo.message, 400));

    await verifyUser(mockReq, mockRes, jest.fn());

    expect(verifyUserById).not.toHaveBeenCalled();
    expect(deleteOTPByUserId).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user id",
    });
  });
});
