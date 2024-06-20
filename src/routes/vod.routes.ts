import express, { Router, Request, Response } from "express";
import {
  completeUpload,
  getSignedUrls,
  init,
} from "../controllers/vod.controller";

const vodRouter: Router = express.Router();

vodRouter.post("/initialize", init);
vodRouter.post("/getPreSignedUrls", getSignedUrls);
vodRouter.post("/finalize", completeUpload);

export default vodRouter;
