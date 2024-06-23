import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: function (req, res) {
    return req.path === "/api/v1/health";
  },
});
