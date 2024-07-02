import { eq, sql } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import CustomError from "../../utils/customError";
import { redisClient } from "../kv";
import {
  decimal,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { AdditionalInfo } from "../../types";

export const MovieTable = pgTable("movies", {
  movie_id: serial("movie_id").primaryKey(),
  title: varchar("title").notNull().unique(),
  release_year: integer("release_year").notNull(),
  duration: integer("duration"),
  synopsis: text("synopsis"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  age_rating: varchar("age_rating"),
  additional_info: jsonb("additional_info"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const GenreTable = pgTable("genres", {
  genre_id: serial("genre_id").primaryKey(),
  genre_name: varchar("genre_name", { length: 100 }).notNull(),
});

export const MovieGenreTable = pgTable(
  "movie_genres",
  {
    movie_id: integer("movie_id")
      .notNull()
      .references(() => MovieTable.movie_id, {
        onDelete: "cascade",
      }),
    genre_id: integer("genre_id")
      .notNull()
      .references(() => GenreTable.genre_id, {
        onDelete: "cascade",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.genre_id] }),
    };
  }
);

export const ActorTable = pgTable("actors", {
  actor_id: serial("actor_id").primaryKey(),
  actor_name: varchar("actor_name", { length: 100 }).notNull(),
});

export const MovieActorTable = pgTable(
  "movie_actors",
  {
    movie_id: integer("movie_id")
      .notNull()
      .references(() => MovieTable.movie_id, { onDelete: "cascade" }),
    actor_id: integer("actor_id")
      .notNull()
      .references(() => ActorTable.actor_id, {
        onDelete: "cascade",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.actor_id] }),
    };
  }
);

export const ContentWarningTable = pgTable("content_warnings", {
  content_warning_id: serial("content_warning_id").primaryKey(),
  warning_type: varchar("warning_type", { length: 100 }).notNull(),
});

export const MovieContentWarningTable = pgTable(
  "movie_content_warnings",
  {
    movie_id: integer("movie_id")
      .notNull()
      .references(() => MovieTable.movie_id, {
        onDelete: "cascade",
      }),
    content_warning_id: integer("content_warning_id")
      .notNull()
      .references(() => ContentWarningTable.content_warning_id, {
        onDelete: "cascade",
      }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.content_warning_id] }),
    };
  }
);

export const MovieImageTable = pgTable("movie_images", {
  image_id: serial("image_id").primaryKey(),
  movie_id: integer("movie_id")
    .notNull()
    .references(() => MovieTable.movie_id, {
      onDelete: "cascade",
    }),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  image_type: varchar("image_type", { length: 100 }).notNull(),
});

export async function insertMovie(
  title: string,
  release_year: number,
  duration: number,
  synopsis: string,
  ageRating: string,
  genres: string[],
  actors: string[],
  warnings: string[],
  poster_url: string,
  backdrop_url: string,
  db: PostgresJsDatabase<any>,
  additional_info?: AdditionalInfo
) {
  try {
    await db.transaction(async (tx) => {
      const [movie] = await tx
        .insert(MovieTable)
        .values({
          title,
          release_year,
          duration,
          synopsis,
          age_rating: ageRating,
          additional_info: additional_info,
        })
        .returning({
          movie_id: MovieTable.movie_id,
        });

      for (const genre of genres) {
        const [existingGenre] = await tx
          .select({ genre_id: GenreTable.genre_id })
          .from(GenreTable)
          .where(eq(GenreTable.genre_name, genre.trim()));

        let genre_id;
        if (existingGenre) {
          genre_id = existingGenre.genre_id;
        } else {
          const [g] = await tx
            .insert(GenreTable)
            .values({ genre_name: genre.trim() })
            .returning({ genre_id: GenreTable.genre_id });
          genre_id = g.genre_id;
        }

        await tx.insert(MovieGenreTable).values({
          movie_id: movie.movie_id,
          genre_id,
        });
      }

      for (const actorName of actors) {
        const [existingActor] = await tx
          .select({ actor_id: ActorTable.actor_id })
          .from(ActorTable)
          .where(eq(ActorTable.actor_name, actorName.trim()));

        let actor_id;
        if (existingActor) {
          actor_id = existingActor.actor_id;
        } else {
          const [actor] = await tx
            .insert(ActorTable)
            .values({ actor_name: actorName.trim() })
            .returning({ actor_id: ActorTable.actor_id });
          actor_id = actor.actor_id;
        }

        await tx.insert(MovieActorTable).values({
          movie_id: movie.movie_id,
          actor_id,
        });
      }

      for (const warning of warnings) {
        const [existingWarning] = await tx
          .select({
            content_warning_id: ContentWarningTable.content_warning_id,
          })
          .from(ContentWarningTable)
          .where(eq(ContentWarningTable.warning_type, warning.trim()));

        let content_warning_id;
        if (existingWarning) {
          content_warning_id = existingWarning.content_warning_id;
        } else {
          const [cw] = await tx
            .insert(ContentWarningTable)
            .values({ warning_type: warning.trim() })
            .returning({
              content_warning_id: ContentWarningTable.content_warning_id,
            });
          content_warning_id = cw.content_warning_id;
        }

        await tx.insert(MovieContentWarningTable).values({
          movie_id: movie.movie_id,
          content_warning_id,
        });
      }

      await tx.insert(MovieImageTable).values({
        movie_id: movie.movie_id,
        image_url: poster_url,
        image_type: "poster",
      });
      await tx.insert(MovieImageTable).values({
        movie_id: movie.movie_id,
        image_url: backdrop_url,
        image_type: "backdrop",
      });
    });
  } catch (error: any) {
    console.error("Error inserting movie", error);
    if (error.code === "23505") {
      throw new CustomError("Movie already exists", 400);
    }
    throw new CustomError("Error inserting movie", 500);
  }
}

export async function getAllMovies(db: PostgresJsDatabase<any>) {
  try {
    const data = await redisClient.get("movies");

    if (data) {
      return JSON.parse(data);
    }

    const movies = await db
      .select({
        movie_id: MovieTable.movie_id,
        title: MovieTable.title,
        release_year: MovieTable.release_year,
        duration: MovieTable.duration,
        synopsis: MovieTable.synopsis,
        rating: MovieTable.rating,
        age_rating: MovieTable.age_rating,
        created_at: MovieTable.created_at,
        updated_at: MovieTable.updated_at,
        images: sql`array_agg(distinct jsonb_build_object('image_id', ${MovieImageTable.image_id}, 'image_url', ${MovieImageTable.image_url}, 'image_type', ${MovieImageTable.image_type}))`,
      })
      .from(MovieTable)
      .leftJoin(
        MovieImageTable,
        eq(MovieTable.movie_id, MovieImageTable.movie_id)
      )
      .groupBy(
        MovieTable.movie_id,
        MovieTable.title,
        MovieTable.release_year,
        MovieTable.duration,
        MovieTable.synopsis,
        MovieTable.rating,
        MovieTable.age_rating,
        MovieTable.created_at,
        MovieTable.updated_at
      );

    redisClient.set("movies", JSON.stringify(movies), {
      EX: 60 * 60 * 24,
    });

    return movies;
  } catch (error) {
    console.error("Error getting movies", error);
    throw new CustomError("Error getting movies", 500);
  }
}

export async function getMovieById(
  movieId: number,
  db: PostgresJsDatabase<any>
) {
  try {
    const data = await redisClient.get(`movie:${movieId}`);

    if (data) {
      return JSON.parse(data);
    }

    const movie = await db
      .select({
        movie_id: MovieTable.movie_id,
        title: MovieTable.title,
        release_year: MovieTable.release_year,
        duration: MovieTable.duration,
        synopsis: MovieTable.synopsis,
        rating: MovieTable.rating,
        age_rating: MovieTable.age_rating,
        additional_info: MovieTable.additional_info,
        created_at: MovieTable.created_at,
        updated_at: MovieTable.updated_at,
        genres: sql`array_agg(distinct jsonb_build_object('genre_id', ${GenreTable.genre_id}, 'genre_name', ${GenreTable.genre_name}))`,
        actors: sql`array_agg(distinct jsonb_build_object('actor_id', ${ActorTable.actor_id}, 'actor_name', ${ActorTable.actor_name}))`,
        warnings: sql`array_agg(distinct jsonb_build_object('content_warning_id', ${ContentWarningTable.content_warning_id}, 'warning_type', ${ContentWarningTable.warning_type}))`,
        images: sql`array_agg(distinct jsonb_build_object('image_id', ${MovieImageTable.image_id}, 'image_url', ${MovieImageTable.image_url}, 'image_type', ${MovieImageTable.image_type}))`,
      })
      .from(MovieTable)
      .leftJoin(
        MovieGenreTable,
        eq(MovieTable.movie_id, MovieGenreTable.movie_id)
      )
      .leftJoin(GenreTable, eq(MovieGenreTable.genre_id, GenreTable.genre_id))
      .leftJoin(
        MovieActorTable,
        eq(MovieTable.movie_id, MovieActorTable.movie_id)
      )
      .leftJoin(ActorTable, eq(MovieActorTable.actor_id, ActorTable.actor_id))
      .leftJoin(
        MovieContentWarningTable,
        eq(MovieTable.movie_id, MovieContentWarningTable.movie_id)
      )
      .leftJoin(
        ContentWarningTable,
        eq(
          MovieContentWarningTable.content_warning_id,
          ContentWarningTable.content_warning_id
        )
      )
      .leftJoin(
        MovieImageTable,
        eq(MovieTable.movie_id, MovieImageTable.movie_id)
      )
      .where(eq(MovieTable.movie_id, movieId))
      .groupBy(
        MovieTable.movie_id,
        MovieTable.title,
        MovieTable.release_year,
        MovieTable.duration,
        MovieTable.synopsis,
        MovieTable.rating,
        MovieTable.age_rating,
        MovieTable.additional_info,
        MovieTable.created_at,
        MovieTable.updated_at
      )
      .limit(1);

    if (!movie.length) {
      throw new CustomError("Movie not found", 404);
    }

    redisClient.set(`movie:${movieId}`, JSON.stringify(movie[0]), {
      EX: 60 * 60 * 24,
    });

    return movie[0];
  } catch (error) {
    console.error("Error getting movie by ID", error);
    throw new CustomError("Error getting movie by ID", 500);
  }
}
