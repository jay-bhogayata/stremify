import express, { Router } from "express";
import { handleHealthCheck } from "../controllers";
import authRouter from "./auth.routes";

const router: Router = express.Router();

router.get("/health", handleHealthCheck);

router.use("/auth", authRouter);

export default router;
