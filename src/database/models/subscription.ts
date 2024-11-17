import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { eq, relations } from "drizzle-orm";
import CustomError from "../../utils/customError";
import { logger } from "../../utils/logger";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "pending",
  "paused",
  "not_started",
]);
export const paymentProviderEnum = pgEnum("payment_provider", ["stripe"]);

export const subscriptionTable = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id),
    customerId: varchar("customer_id", { length: 255 }).notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    planId: varchar("plan_id", { length: 100 }),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at"),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("sub_user_id_idx").on(table.userId),
  })
);

export const paymentProviderTable = pgTable("payment_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: paymentProviderEnum("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptionTable.id),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => paymentProviderTable.id),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    providerCustomerId: varchar("provider_customer_id", { length: 255 }),
    providerPaymentId: varchar("provider_payment_id", { length: 255 }),
    providerSubscriptionId: varchar("provider_subscription_id", {
      length: 255,
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    subscriptionIdIdx: index("subscription_id_idx").on(table.subscriptionId),
    providerIdIdx: index("provider_id_idx").on(table.providerId),
  })
);

export const userRelations = relations(userTable, ({ many }) => ({
  subscriptions: many(subscriptionTable),
}));

export const subscriptionRelations = relations(
  subscriptionTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [subscriptionTable.userId],
      references: [userTable.id],
    }),

    payments: many(paymentTable),
  })
);

export const paymentProviderRelations = relations(
  paymentProviderTable,
  ({ many }) => ({
    payments: many(paymentTable),
  })
);

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  subscription: one(subscriptionTable, {
    fields: [paymentTable.subscriptionId],
    references: [subscriptionTable.id],
  }),
  provider: one(paymentProviderTable, {
    fields: [paymentTable.providerId],
    references: [paymentProviderTable.id],
  }),
}));

export const getSubInfoByUserId = async (
  userId: string,
  db: PostgresJsDatabase<any>
) => {
  try {
    const userSubInfo = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, userId));
    return userSubInfo[0];
  } catch (error) {
    logger.error(
      `failed to get subscription info for user with id: ${userId} : ${error}`
    );
    throw new CustomError("failed to get subscription info", 500);
  }
};
