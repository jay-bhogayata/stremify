import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { relations } from "drizzle-orm";

export const passwordResetTable = pgTable("password_reset", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetRelations = relations(
  passwordResetTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [passwordResetTable.userId],
      references: [userTable.id],
    }),
  })
);
