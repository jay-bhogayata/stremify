import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";

export const handleHealthCheck = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json({ message: "OK" });
  }
);
