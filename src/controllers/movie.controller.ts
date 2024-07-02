import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { z } from "zod";
import {
  getAllMovies,
  getMovieById,
  insertMovie,
} from "../database/models/movie";
import { db } from "../database/connection";
import { s3 } from "./vod.controller";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import CustomError from "../utils/customError";

const addMovieReqBody = z.object({
  title: z.string().min(1, {
    message: "Title must be at least 1 character long",
  }),
  releaseYear: z.string().min(4, {
    message: "Release year must be at least 4 characters long",
  }),
  duration: z.string().min(1, {
    message: "Duration must be at least 1 character long",
  }),
  synopsis: z.string().min(10, {
    message: "Synopsis must be at least 10 characters long",
  }),
  ageRating: z.string().min(1, {
    message: "Age rating must be at least 1 character long",
  }),
  genre: z.string().min(1, {
    message: "Genre must be at least 1 character long",
  }),
  actors: z.string().min(3, {
    message: "Actors must be at least 3 characters long",
  }),
  warnings: z.string().min(3, {
    message: "Warnings must be at least 3 characters long",
  }),
  additional_info: z
    .object({
      origin_country: z.string(),
      original_title: z.string(),
      origin_country_certification: z.string(),
      production_companies: z.array(z.string()),
      director: z.string(),
    })
    .optional(),
});

/**
 * @openapi
 * /api/v1/content/movies:
 *   post:
 *     summary: Insert a movie
 *     description: Add a movie to the database.
 *     tags:
 *       - movies
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       description: The movie details.
 *       required: true
 *       content:
 *        multipart/form-data:
 *          schema:
 *            $ref: '#/components/schemas/MovieReqBody'
 *     responses:
 *       200:
 *         description: Movie added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Movie added
 *       400:
 *         description: Validation error in the request body.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: synopsis
 *                       message:
 *                         type: string
 *                         example: Synopsis must be at least 10 characters long
 *       401:
 *         description: Unauthorized access. requires login and admin access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const addMovie = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (typeof req.body?.additional_info === "string") {
      try {
        req.body.additional_info = JSON.parse(req.body.additional_info);
      } catch (error) {
        console.error("Error parsing additional_info", error);
        throw new CustomError("Error parsing additional_info", 400);
      }
    }
    const {
      title,
      releaseYear,
      duration,
      synopsis,
      ageRating,
      genre,
      actors,
      warnings,
      additional_info,
    } = addMovieReqBody.parse(req.body);

    const genreArr = genre.toLocaleLowerCase().trim().split(",");
    const actorsArr = actors.toLocaleLowerCase().trim().split(",");
    const warningsArr = warnings.toLocaleLowerCase().trim().split(",");

    const poster = Array.isArray(req.files) ? req.files[0] : undefined;
    const backdrop = Array.isArray(req.files) ? req.files[1] : undefined;

    if (!poster || !backdrop) {
      throw new CustomError("Please provide both a poster and a backdrop", 400);
    }

    const posterParams = {
      Bucket: "stremify-master-images",
      Key: `${title}-poster.${poster.mimetype.split("/")[1]}`,
      Body: poster.buffer,
      ContentType: poster.mimetype,
    };

    const backdropParams = {
      Bucket: "stremify-master-images",
      Key: `${title}-backdrop.${backdrop.mimetype.split("/")[1]}`,
      Body: backdrop.buffer,
      ContentType: backdrop.mimetype,
    };

    await s3.send(new PutObjectCommand(posterParams));
    await s3.send(new PutObjectCommand(backdropParams));

    const poster_url = `https://stremify-master-images.s3.amazonaws.com/${title}-poster.${
      poster.mimetype.split("/")[1]
    }`;
    const backdrop_url = `https://stremify-master-images.s3.amazonaws.com/${title}-backdrop.${
      backdrop.mimetype.split("/")[1]
    }`;

    await insertMovie(
      title,
      parseInt(releaseYear),
      parseInt(duration),
      synopsis,
      ageRating,
      genreArr,
      actorsArr,
      warningsArr,
      poster_url,
      backdrop_url,
      db,
      additional_info
    );
    res.status(201).json({ message: "Movie added" });
  } catch (error: unknown) {
    res.status(400).json({ message: error });
  }
});

/**
 * @openapi
 * api/v1/content/movies/all:
 *   get:
 *     summary: Get all movies
 *     description: Get all movies from the database.
 *     tags:
 *      - movies
 *     responses:
 *       200:
 *         description: Successfully retrieved list of movies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllMoviesResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting movies"
 */
export const getAllMovie = asyncHandler(async (req: Request, res: Response) => {
  try {
    const resp = await getAllMovies(db);
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ message: "Error getting movies" });
  }
});

/**
 * @openapi
 * /api/v1/content/movies/{id}:
 *   get:
 *     summary: Fetch a movie by its ID
 *     tags:
 *      - movies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 11
 *         description: The ID of the movie to fetch
 *     responses:
 *       200:
 *         description: Successfully retrieved movie details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailMovieInfo'
 *       400:
 *         description: Bad request - Missing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Please provide an id"
 *       404:
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movie not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting movie"
 */
export const fetchMovieById = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Please provide an id" });
        return;
      }
      const movie = await getMovieById(parseInt(id), db);
      if (!movie) {
        res.status(404).json({ message: "Movie not found" });
      } else {
        res.status(200).json(movie);
      }
    } catch (error) {
      res.status(500).json({ message: "Error getting movie" });
    }
  }
);
