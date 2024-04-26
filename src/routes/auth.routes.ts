import express, { Router, Request, Response } from "express";
import { login, signUp, verifyUser } from "../controllers/auth.controller";

const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/verify/:userID", verifyUser);
authRouter.post("/login", login);

export default authRouter;
