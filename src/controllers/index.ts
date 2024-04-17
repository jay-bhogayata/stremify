import { Request, Response } from "express";

import user from "../database/schema/user";
import { db } from "../database/connection";
import asyncHandler from "../utils/asyncHandler";

export const handleHealthCheck = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json({ message: "OK" });
  }
);

export const testDatabase = asyncHandler(
  async (req: Request, res: Response) => {
    await db.insert(user).values({ name: "jay" });
    const u = await db.query.user.findMany();
    res.status(200).json({ message: u });
  }
);
