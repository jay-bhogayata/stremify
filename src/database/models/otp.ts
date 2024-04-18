import { varchar, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const otpTable = pgTable("otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  otp: varchar("otp", { length: 6 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
