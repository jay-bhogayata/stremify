import express, { Router } from "express";
import { signUp } from "../controllers/auth.controller";

const authRouter: Router = express.Router();

authRouter.post("/signup", signUp);

export default authRouter;
