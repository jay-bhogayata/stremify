import express, { Router } from "express";
import { handleHealthCheck } from "../controllers";
import authRouter from "./auth.routes";
import vodRouter from "./vod.routes";
import movieRouter from "./movies.routes";

const router: Router = express.Router();

router.get("/health", handleHealthCheck);

router.use("/auth", authRouter);

router.use("/vod", vodRouter);

router.use("/content/movies", movieRouter);

export default router;
