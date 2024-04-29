import { varchar, timestamp, pgTable, uuid, index } from "drizzle-orm/pg-core";
import { userTable } from "./user";

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import CustomError from "../../utils/customError";

export const otpTable = pgTable(
  "otp",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    otp: varchar("otp", { length: 6 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      userIdIdx: index("user_id_idx").on(table.userId),
    };
  }
);

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
  try {
    const result = await db
      .select({
        otp: otpTable.otp,
        expiredAt: otpTable.expiresAt,
      })
      .from(otpTable)
      .where(eq(otpTable.userId, userId));

    return result[0];
  } catch (error: any) {
    if (error.code === "22P02") {
      throw new CustomError("Invalid user id", 400);
    }

    throw new CustomError("Failed to get OTP", 500);
  }
}

export async function deleteOTPByUserId(
  userId: string,
  db: PostgresJsDatabase<any>
) {
  try {
    await db.delete(otpTable).where(eq(otpTable.userId, userId));
  } catch (error) {
    console.error(error);
    throw new CustomError("Failed to delete OTP", 500);
  }
}
