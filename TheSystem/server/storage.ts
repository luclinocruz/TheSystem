import {
  players,
  quests,
  journalEntries,
  habitLogs,
  systemMessages,
  type Player,
  type InsertPlayer,
  type Quest,
  type InsertQuest,
  type JournalEntry,
  type InsertJournalEntry,
  type HabitLog,
  type InsertHabitLog,
  type SystemMessage,
  type InsertSystemMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getPlayer(id: string): Promise<Player | undefined>;
  getDefaultPlayer(): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;

  getQuests(playerId: string): Promise<Quest[]>;
  getQuest(id: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | undefined>;
  deleteQuest(id: string): Promise<boolean>;

  getJournalEntries(playerId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry & { analysis?: any }): Promise<JournalEntry>;

  getHabitLogs(playerId: string): Promise<HabitLog[]>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;

  getSystemMessages(playerId: string): Promise<SystemMessage[]>;
  createSystemMessage(message: InsertSystemMessage): Promise<SystemMessage>;
}

export class DatabaseStorage implements IStorage {
  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getDefaultPlayer(): Promise<Player | undefined> {
    const [player] = await db.select().from(players).limit(1);
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const [player] = await db
      .insert(players)
      .values({
        id,
        name: insertPlayer.name ?? "Jogador",
        title: insertPlayer.title ?? "Novato",
        level: insertPlayer.level ?? 1,
        currentXp: insertPlayer.currentXp ?? 0,
        maxXp: insertPlayer.maxXp ?? 1000,
        hp: insertPlayer.hp ?? 100,
        maxHp: insertPlayer.maxHp ?? 100,
        mp: insertPlayer.mp ?? 50,
        maxMp: insertPlayer.maxMp ?? 50,
        job: insertPlayer.job ?? "Estudante",
        stats: insertPlayer.stats ?? {
          forca: 10,
          inteligencia: 10,
          agilidade: 10,
          vitalidade: 10,
          sentidos: 10,
        },
        pointsAvailable: insertPlayer.pointsAvailable ?? 0,
        gold: insertPlayer.gold ?? 0,
        mainGoal: insertPlayer.mainGoal ?? null,
      })
      .returning();
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async getQuests(playerId: string): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(eq(quests.playerId, playerId))
      .orderBy(asc(quests.completed), desc(quests.createdAt));
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const id = randomUUID();
    const [quest] = await db
      .insert(quests)
      .values({
        id,
        playerId: insertQuest.playerId,
        type: insertQuest.type,
        difficulty: insertQuest.difficulty,
        title: insertQuest.title,
        description: insertQuest.description,
        xp: insertQuest.xp,
        statReward: insertQuest.statReward ?? null,
        completed: insertQuest.completed ?? false,
      })
      .returning();
    return quest;
  }

  async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest | undefined> {
    const [quest] = await db
      .update(quests)
      .set(updates)
      .where(eq(quests.id, id))
      .returning();
    return quest || undefined;
  }

  async deleteQuest(id: string): Promise<boolean> {
    const result = await db.delete(quests).where(eq(quests.id, id));
    return true;
  }

  async getJournalEntries(playerId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.playerId, playerId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(
    insertEntry: InsertJournalEntry & { analysis?: any }
  ): Promise<JournalEntry> {
    const id = randomUUID();
    const [entry] = await db
      .insert(journalEntries)
      .values({
        id,
        playerId: insertEntry.playerId,
        content: insertEntry.content,
        analysis: insertEntry.analysis ?? null,
      })
      .returning();
    return entry;
  }

  async getHabitLogs(playerId: string): Promise<HabitLog[]> {
    return await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.playerId, playerId))
      .orderBy(desc(habitLogs.createdAt));
  }

  async createHabitLog(insertLog: InsertHabitLog): Promise<HabitLog> {
    const id = randomUUID();
    const [log] = await db
      .insert(habitLogs)
      .values({
        id,
        playerId: insertLog.playerId,
        date: insertLog.date,
        productivityScore: insertLog.productivityScore ?? 0,
        disciplineScore: insertLog.disciplineScore ?? 0,
      })
      .returning();
    return log;
  }

  async getSystemMessages(playerId: string): Promise<SystemMessage[]> {
    return await db
      .select()
      .from(systemMessages)
      .where(eq(systemMessages.playerId, playerId))
      .orderBy(asc(systemMessages.createdAt));
  }

  async createSystemMessage(insertMessage: InsertSystemMessage): Promise<SystemMessage> {
    const id = randomUUID();
    const [message] = await db
      .insert(systemMessages)
      .values({
        id,
        playerId: insertMessage.playerId,
        sender: insertMessage.sender,
        content: insertMessage.content,
      })
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
