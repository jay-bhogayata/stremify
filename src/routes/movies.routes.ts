import express, { Router } from "express";
import { isAdmin, isAuthenticated } from "../middleware";
import {
  addMovie,
  getAllMovie,
  fetchMovieById as getMovieById,
} from "../controllers/movie.controller";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const movieRouter: Router = express.Router();

movieRouter.get("/all", getAllMovie);
movieRouter.get("/:id", getMovieById);
movieRouter.post(
  "/",
  upload.array("images", 2),
  isAuthenticated,
  isAdmin,
  addMovie
);

export default movieRouter;
