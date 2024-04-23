import express, { Router } from "express";
import { signUp, verifyUser } from "../controllers/auth.controller";
const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/verify/:userID", verifyUser);

export default authRouter;
