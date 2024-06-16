import {
  decimal,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const MovieTable = pgTable("movies", {
  movie_id: serial("movie_id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  release_year: integer("release_year").notNull(),
  duration: integer("duration"),
  synopsis: text("synopsis"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  age_rating: varchar("age_rating", { length: 5 }),
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
    movie_id: integer("movie_id").notNull(),
    genre_id: integer("genre_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.genre_id] }),
      fk_movie_id: foreignKey({
        columns: [table.movie_id],
        foreignColumns: [MovieTable.movie_id],
      }),
      fk_genre_id: foreignKey({
        columns: [table.genre_id],
        foreignColumns: [GenreTable.genre_id],
      }),
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
    movie_id: integer("movie_id").notNull(),
    actor_id: integer("actor_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.actor_id] }),
      fk_movie_id: foreignKey({
        columns: [table.movie_id],
        foreignColumns: [MovieTable.movie_id],
      }),
      fk_actor_id: foreignKey({
        columns: [table.actor_id],
        foreignColumns: [ActorTable.actor_id],
      }),
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
    movie_id: integer("movie_id").notNull(),
    content_warning_id: integer("content_warning_id").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.movie_id, table.content_warning_id] }),
      fk_movie_id: foreignKey({
        columns: [table.movie_id],
        foreignColumns: [MovieTable.movie_id],
      }),
      fk_content_warning_id: foreignKey({
        columns: [table.content_warning_id],
        foreignColumns: [ContentWarningTable.content_warning_id],
      }),
    };
  }
);

export const MovieImageTable = pgTable(
  "movie_images",
  {
    image_id: serial("image_id").primaryKey(),
    movie_id: integer("movie_id").notNull(),
    image_url: varchar("image_url", { length: 255 }).notNull(),
    image_type: varchar("image_type", { length: 100 }).notNull(),
  },
  (table) => {
    return {
      fk_movie_id: foreignKey({
        columns: [table.movie_id],
        foreignColumns: [MovieTable.movie_id],
      }),
    };
  }
);
