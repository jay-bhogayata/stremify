import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { eq, relations } from "drizzle-orm";
import { otpTable } from "./otp";
import { db } from "../connection";
import { PostgresError } from "postgres";
import { SignUpUserRequest, User } from "../../types";
import CustomError from "../../utils/customError";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const userRoles = pgEnum("role", ["guest", "subscriber", "admin"]);

export const userTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    role: userRoles("role").notNull().default("guest"),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return {
      emailIdx: index("email_idx").on(table.email),
    };
  }
);

export async function createUser(
  user: SignUpUserRequest,
  db: PostgresJsDatabase<any>
): Promise<User> {
  try {
    const createdUser = await db
      .insert(userTable)
      .values({
        name: user.name,
        email: user.email,
        password: user.password,
      })
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
      });

    return createdUser[0];
  } catch (error: unknown) {
    if (error instanceof PostgresError && error.code === "23505") {
      throw new CustomError("user with this email already exists", 409);
    } else {
      console.log(error);
      throw new CustomError("error in creating user", 500);
    }
  }
}

export async function deleteUserById(
  userId: string,
  db: PostgresJsDatabase<any>
) {
  await db.delete(userTable).where(eq(userTable.id, userId));
}