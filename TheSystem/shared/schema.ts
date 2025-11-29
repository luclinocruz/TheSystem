import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statsSchema = z.object({
  forca: z.number().default(10),
  inteligencia: z.number().default(10),
  agilidade: z.number().default(10),
  vitalidade: z.number().default(10),
  sentidos: z.number().default(10),
});

export type Stats = z.infer<typeof statsSchema>;

export const players = pgTable("players", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  title: text("title").default("Novato"),
  level: integer("level").default(1),
  currentXp: integer("current_xp").default(0),
  maxXp: integer("max_xp").default(1000),
  hp: integer("hp").default(100),
  maxHp: integer("max_hp").default(100),
  mp: integer("mp").default(50),
  maxMp: integer("max_mp").default(50),
  job: text("job").default("Estudante"),
  stats: jsonb("stats").$type<Stats>().default({ forca: 10, inteligencia: 10, agilidade: 10, vitalidade: 10, sentidos: 10 }),
  pointsAvailable: integer("points_available").default(0),
  gold: integer("gold").default(0),
  mainGoal: text("main_goal"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type QuestDifficulty = "E" | "D" | "C" | "B" | "A" | "S";
export type QuestType = "DIÁRIA" | "URGENTE" | "MAIN" | "OCULTA" | "PENALIDADE";

export const quests = pgTable("quests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  type: text("type").$type<QuestType>().notNull(),
  difficulty: text("difficulty").$type<QuestDifficulty>().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xp: integer("xp").notNull(),
  statReward: text("stat_reward"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestSchema = createInsertSchema(quests).omit({ id: true, createdAt: true });
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  analysis: jsonb("analysis").$type<{
    message: string;
    xpGained: number;
    stats: Partial<Stats>;
    suggestedQuest?: { title: string; difficulty: QuestDifficulty; description: string };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true, analysis: true });
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export const habitLogs = pgTable("habit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  date: text("date").notNull(),
  productivityScore: integer("productivity_score").default(0),
  disciplineScore: integer("discipline_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true, createdAt: true });
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

export const systemMessages = pgTable("system_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  playerId: varchar("player_id", { length: 36 }).notNull(),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSystemMessageSchema = createInsertSchema(systemMessages).omit({ id: true, createdAt: true });
export type InsertSystemMessage = z.infer<typeof insertSystemMessageSchema>;
export type SystemMessage = typeof systemMessages.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
