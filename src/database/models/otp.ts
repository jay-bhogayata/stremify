import { varchar, timestamp, pgTable, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./user";

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

export const otpTable = pgTable("otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  otp: varchar("otp", { length: 6 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export async function insertOTP(
  userId: string,
  otp: string,
  expiresAt: Date,
  db: PostgresJsDatabase<any>
) {
  await db.insert(otpTable).values({
    userId,
    otp,
    expiresAt,
  });
}

export async function getOTPByUserId(
  userId: string,
  db: PostgresJsDatabase<any>
) {
  const result = await db
    .select({
      otp: otpTable.otp,
      expiredAt: otpTable.expiresAt,
    })
    .from(otpTable)
    .where(eq(otpTable.userId, userId));
  return result[0];
}
