ALTER TABLE "actors" ADD CONSTRAINT "actors_actor_name_unique" UNIQUE("actor_name");--> statement-breakpoint
ALTER TABLE "content_warnings" ADD CONSTRAINT "content_warnings_warning_type_unique" UNIQUE("warning_type");--> statement-breakpoint
ALTER TABLE "genres" ADD CONSTRAINT "genres_genre_name_unique" UNIQUE("genre_name");--> statement-breakpoint
ALTER TABLE "movies" ADD CONSTRAINT "movies_title_unique" UNIQUE("title");