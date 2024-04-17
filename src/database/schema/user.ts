import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export default user;
