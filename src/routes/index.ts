import { Router } from "express";
import { handleHealthCheck } from "../controllers";

const router = Router();

router.get("/health", handleHealthCheck);

export default router;
