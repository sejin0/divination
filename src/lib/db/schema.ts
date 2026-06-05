import {
  bigint,
  char,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  name: text("name"),
  gender: text("gender"),
  birthDate: date("birth_date"),
  element: text("element"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const hexagrams = pgTable("hexagrams", {
  code: char("code", { length: 6 }).primaryKey(),
  name: text("name").notNull(),
  hanja: text("hanja"),
  score: integer("score").notNull(),
  meaning: text("meaning").notNull(),
  advice: text("advice").notNull(),
  element: text("element"),
  upperTrigram: char("upper_trigram", { length: 3 }).notNull(),
  lowerTrigram: char("lower_trigram", { length: 3 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const questions = pgTable("questions", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  category: varchar("category", { length: 30 }).notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const divinations = pgTable("divinations", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  questionId: bigint("question_id", { mode: "number" }).references(() => questions.id, {
    onDelete: "cascade"
  }),
  hexagramCode: char("hexagram_code", { length: 6 }).references(() => hexagrams.code),
  aiSummary: text("ai_summary"),
  aiResult: text("ai_result"),
  resultJson: jsonb("result_json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const aiLogs = pgTable("ai_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  model: varchar("model", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type Hexagram = typeof hexagrams.$inferSelect;
