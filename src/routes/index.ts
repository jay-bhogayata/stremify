import { Router } from "express";
import { handleHealthCheck, testDatabase } from "../controllers";

const router = Router();

router.get("/health", handleHealthCheck);
router.get("/db", testDatabase);

export default router;
