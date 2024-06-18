import { Request, Response, NextFunction } from "express";
import { SessionData } from "express-session";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session && (req.session as SessionData).isLoggedIn) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as SessionData).user?.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
