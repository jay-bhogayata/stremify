import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { PostgresError } from "postgres";
import { ResponseUser, SignUpUserRequest, User } from "../../types";
import CustomError from "../../utils/customError";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { logger } from "../../utils/logger";

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
): Promise<ResponseUser> {
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
        verified: userTable.verified,
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
  try {
    await db.delete(userTable).where(eq(userTable.id, userId));
  } catch (error) {
    logger.error(`failed to delete user with id: ${userId} : ${error}`);
    throw new CustomError("failed to delete user", 500);
  }
}

export async function verifyUserById(
  userId: string,
  db: PostgresJsDatabase<any>
) {
  try {
    const user = await db
      .update(userTable)
      .set({
        verified: true,
      })
      .where(eq(userTable.id, userId))
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        verified: userTable.verified,
      });

    return user[0];
  } catch (error: unknown) {
    console.error(
      `Failed to verify user with id ${userId}: ${(error as Error).message}`
    );
    throw new CustomError("failed to verify user", 500);
  }
}

export async function getUserByEmail(
  email: string,
  db: PostgresJsDatabase<any>
): Promise<User | null> {
  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    return user[0] || null;
  } catch (error) {
    if (error instanceof PostgresError) {
      if (error.code === "P0002") {
        throw new CustomError("user not found", 404);
      }
    }

    logger.error(`failed to get user with email: ${email} : ${error}`);
    throw new CustomError("failed to get user", 500);
  }
}

export async function getUserById(
  userId: string,
  db: PostgresJsDatabase<any>
): Promise<User | null> {
  try {
    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId));
    return user[0] || null;
  } catch (error) {
    if (error instanceof PostgresError) {
      if (error.code === "P0002") {
        throw new CustomError("user not found", 404);
      }
    }

    logger.error(`failed to get user with id: ${userId} : ${error}`);
    throw new CustomError("failed to get user", 500);
  }
}
