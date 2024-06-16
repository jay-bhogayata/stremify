DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('guest', 'subscriber', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'guest' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "otp_otp_unique" UNIQUE("otp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "actors" (
	"actor_id" serial PRIMARY KEY NOT NULL,
	"actor_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content_warnings" (
	"content_warning_id" serial PRIMARY KEY NOT NULL,
	"warning_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genres" (
	"genre_id" serial PRIMARY KEY NOT NULL,
	"genre_name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_actors" (
	"movie_id" integer NOT NULL,
	"actor_id" integer NOT NULL,
	CONSTRAINT "movie_actors_movie_id_actor_id_pk" PRIMARY KEY("movie_id","actor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_content_warnings" (
	"movie_id" integer NOT NULL,
	"content_warning_id" integer NOT NULL,
	CONSTRAINT "movie_content_warnings_movie_id_content_warning_id_pk" PRIMARY KEY("movie_id","content_warning_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_genres" (
	"movie_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "movie_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"image_type" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movies" (
	"movie_id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"release_year" integer NOT NULL,
	"duration" integer,
	"synopsis" text,
	"rating" numeric(2, 1),
	"age_rating" varchar(5),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "otp" ADD CONSTRAINT "otp_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_movie_id_movies_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("movie_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_actors" ADD CONSTRAINT "movie_actors_actor_id_actors_actor_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."actors"("actor_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_content_warnings" ADD CONSTRAINT "movie_content_warnings_movie_id_movies_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("movie_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_content_warnings" ADD CONSTRAINT "movie_content_warnings_content_warning_id_content_warnings_content_warning_id_fk" FOREIGN KEY ("content_warning_id") REFERENCES "public"."content_warnings"("content_warning_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("movie_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("genre_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "movie_images" ADD CONSTRAINT "movie_images_movie_id_movies_movie_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("movie_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree (email);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "otp" USING btree (user_id);