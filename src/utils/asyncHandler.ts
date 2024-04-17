import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler to catch any errors that occur during the execution of the handler.
 * @param fn - The async route handler to wrap.
 * @returns The wrapped async route handler.
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      res.status(error.code || 500).json({
        message: error.message,
      });
    }
  };

export default asyncHandler;
