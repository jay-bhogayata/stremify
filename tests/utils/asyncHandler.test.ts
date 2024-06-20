import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../src/utils/asyncHandler";
import { logger } from "../../src/utils/logger";

jest.mock("../../src/utils/logger", () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe("asyncHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNextFunction = jest.fn();
  });

  it("should call the async function without error", async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue(undefined);

    await asyncHandler(mockAsyncFunction as any)(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction
    );

    expect(mockAsyncFunction).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockNextFunction
    );
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should handle the error when the async function throws an error", async () => {
    const mockError = { message: "Test error", code: 500 };
    const mockAsyncFunction = jest.fn().mockRejectedValue(mockError);

    await asyncHandler(mockAsyncFunction as any)(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction
    );

    expect(mockAsyncFunction).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockNextFunction
    );
    expect(mockResponse.status).toHaveBeenCalledWith(mockError.code);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: mockError.message,
    });
    expect(logger.error).toHaveBeenCalledWith(mockError.message, {
      error: mockError,
    });
  });

  it("should handle the error when the async function throws an error without code", async () => {
    const mockError = { message: "Test error" };
    const mockAsyncFunction = jest.fn().mockRejectedValue(mockError);

    await asyncHandler(mockAsyncFunction as any)(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction
    );

    expect(mockAsyncFunction).toHaveBeenCalledWith(
      mockRequest,
      mockResponse,
      mockNextFunction
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: mockError.message,
    });
    expect(logger.error).toHaveBeenCalledWith(mockError.message, {
      error: mockError,
    });
  });
});
