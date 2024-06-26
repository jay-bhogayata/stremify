import {
  login,
  logout,
  signUp,
  validateUser,
  verifyUser,
} from "../../src/controllers/auth.controller";
import { Request, Response } from "express";
import { db } from "../../src/database/connection";
import {
  createUser,
  deleteUserById,
  getUserByEmail,
  verifyUserById,
} from "../../src/database/models/user";
import {
  deleteOTPByUserId,
  getOTPByUserId,
  insertOTP,
} from "../../src/database/models/otp";
import { comparePassword, hashPassword } from "../../src/utils/password";
import { sendMail } from "../../src/helpers/mail-helper";
import generateOTP from "../../src/utils/generateOTP";
import CustomError from "../../src/utils/customError";

jest.mock("../../src/database/models/user");
jest.mock("../../src/database/models/otp");
jest.mock("../../src/utils/password");
jest.mock("../../src/helpers/mail-helper");
jest.mock("../../src/utils/generateOTP");
jest.mock("../../src/database/connection");
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

describe("validateUser", () => {
  it("returns the user object when the user is verified and the password is valid", async () => {
    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
      verified: true,
      role: "guest" as const,
    };

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(mockUser);
    (
      comparePassword as jest.MockedFunction<typeof comparePassword>
    ).mockResolvedValueOnce(true);

    const validatedUser = await validateUser("test@example.com", "password");
    expect(validatedUser).toEqual(mockUser);
  });
  it("throws an error when the user is not verified", async () => {
    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
      verified: false,
      role: "guest" as const,
    };

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(mockUser);

    await expect(validateUser("test@example.com", "password")).rejects.toThrow(
      new CustomError("user is not verified", 401)
    );
  });
});

describe("login", () => {
  it("logs in the user successfully", async () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "password",
      },
      session: {
        isLoggedIn: false,
        user: null,
        regenerate: jest.fn(),
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
      verified: true,
      role: "guest" as const,
    };

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(mockUser);
    (
      comparePassword as jest.MockedFunction<typeof comparePassword>
    ).mockResolvedValueOnce(true);

    await login(mockReq, mockRes, jest.fn());

    expect(getUserByEmail).toHaveBeenCalledWith(mockReq.body.email, db);
    expect(comparePassword).toHaveBeenCalledWith(
      mockReq.body.password,
      mockUser.password
    );

    const mockResponseUser = {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      verified: mockUser.verified,
    };
    expect(mockReq.session.isLoggedIn).toBe(true);
    expect(mockReq.session.regenerate).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "login successful",
      user: mockResponseUser,
    });
  });

  it("returns an error for an unverified user", async () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      role: "guest" as const,
      verified: false,
      password: "hashedPassword",
    };

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(mockUser);

    await login(mockReq, mockRes, jest.fn());

    expect(getUserByEmail).toHaveBeenCalledWith(mockReq.body.email, db);
    expect(comparePassword).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "user is not verified",
    });
  });

  it("returns an error for an invalid password", async () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "wrongPassword",
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockUser = {
      id: "11f49ff-2cbb-4b66-8b73-53a3bee6103b",
      name: "Test User",
      email: "test@example.com",
      role: "guest" as const,
      verified: true,
      password: "hashedPassword",
    };

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(mockUser);
    (
      comparePassword as jest.MockedFunction<typeof comparePassword>
    ).mockResolvedValueOnce(false);

    await login(mockReq, mockRes, jest.fn());

    expect(getUserByEmail).toHaveBeenCalledWith(mockReq.body.email, db);
    expect(comparePassword).toHaveBeenCalledWith(
      mockReq.body.password,
      mockUser.password
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid password" });
  });

  it("returns an error for a non-existent user", async () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockResolvedValueOnce(null);

    await login(mockReq, mockRes, jest.fn());

    expect(getUserByEmail).toHaveBeenCalledWith(mockReq.body.email, db);
    expect(comparePassword).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "user not found" });
  });

  it("handles unexpected errors", async () => {
    const mockReq = {
      body: {
        email: "test@example.com",
        password: "password",
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockError = new CustomError("Internal server error", 500);

    (
      getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
    ).mockRejectedValueOnce(mockError);

    await login(mockReq, mockRes, jest.fn());

    expect(getUserByEmail).toHaveBeenCalledWith(mockReq.body.email, db);
    expect(comparePassword).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});

describe("logout", () => {
  it("logs out the user successfully", async () => {
    const mockReq = {
      session: {
        destroy: jest.fn((callback) => callback()),
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    await logout(mockReq, mockRes, jest.fn());

    expect(mockReq.session.destroy).toHaveBeenCalled();
    expect(mockRes.clearCookie).toHaveBeenCalledWith("sessionId");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });

  it("handles an error during logout", async () => {
    const mockReq = {
      session: {
        destroy: jest.fn((callback) => callback(new Error("Logout error"))),
      },
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;

    await logout(mockReq, mockRes, jest.fn());

    expect(mockReq.session.destroy).toHaveBeenCalled();
    expect(mockRes.clearCookie).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Could not log out, please try again",
    });
  });
});
