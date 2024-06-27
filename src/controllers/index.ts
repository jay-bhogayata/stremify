import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     tags:
 *      - Health
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 */
export const handleHealthCheck = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json({ message: "OK" });
  }
);
