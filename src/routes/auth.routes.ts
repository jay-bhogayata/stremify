import express, { Router, Request, Response } from "express";
import {
  login,
  logout,
  profile,
  signUp,
  updateSession,
  verifyUser,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware";

const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/verify", verifyUser);
authRouter.post("/login", login);
authRouter.post("/logout", isAuthenticated, logout);
authRouter.get("/me", isAuthenticated, profile);
authRouter.get("/updateSession", isAuthenticated, updateSession);

export default authRouter;
