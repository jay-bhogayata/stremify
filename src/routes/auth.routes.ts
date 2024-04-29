import express, { Router, Request, Response } from "express";
import {
  login,
  logout,
  signUp,
  verifyUser,
} from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware";

const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/verify/:userID", verifyUser);
authRouter.post("/login", login);
authRouter.post("/logout", isAuthenticated, logout);
authRouter.get("/protected", isAuthenticated, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route" });
});

export default authRouter;
