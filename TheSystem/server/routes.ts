import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeJournalEntry, generateInitialQuests } from "./gemini";
import type { Stats } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/player", async (req, res) => {
    try {
      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/player", async (req, res) => {
    try {
      const { name, job, mainGoal } = req.body;

      if (!name || !job) {
        return res.status(400).json({ error: "Name and job are required" });
      }

      const player = await storage.createPlayer({
        name,
        job,
        mainGoal: mainGoal || null,
        title: "O Desperto",
        level: 1,
        currentXp: 0,
        maxXp: 1000,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        stats: {
          forca: 10,
          inteligencia: 10,
          agilidade: 10,
          vitalidade: 10,
          sentidos: 10,
        },
        pointsAvailable: 0,
        gold: 0,
      });

      const initialQuests = await generateInitialQuests(name, mainGoal || "Desenvolvimento pessoal");
      
      for (const quest of initialQuests) {
        await storage.createQuest({
          playerId: player.id,
          type: quest.type,
          difficulty: quest.difficulty,
          title: quest.title,
          description: quest.description,
          xp: quest.xp,
          statReward: quest.statReward,
          completed: false,
        });
      }

      await storage.createSystemMessage({
        playerId: player.id,
        sender: "system",
        content: `Jogador ${name} registrado. O Sistema está online e monitorando.`,
      });

      res.status(201).json(player);
    } catch (error) {
      console.error("Error creating player:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/player/stat", async (req, res) => {
    try {
      const { stat } = req.body;
      const validStats: (keyof Stats)[] = ["forca", "inteligencia", "agilidade", "vitalidade", "sentidos"];

      if (!stat || !validStats.includes(stat)) {
        return res.status(400).json({ error: "Invalid stat" });
      }

      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      if ((player.pointsAvailable ?? 0) <= 0) {
        return res.status(400).json({ error: "No points available" });
      }

      const currentStats = player.stats as Stats;
      const updatedStats = {
        ...currentStats,
        [stat]: currentStats[stat] + 1,
      };

      const updatedPlayer = await storage.updatePlayer(player.id, {
        stats: updatedStats,
        pointsAvailable: (player.pointsAvailable ?? 0) - 1,
      });

      res.json(updatedPlayer);
    } catch (error) {
      console.error("Error updating stat:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/quests", async (req, res) => {
    try {
      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const quests = await storage.getQuests(player.id);
      res.json(quests);
    } catch (error) {
      console.error("Error fetching quests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/quests/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const quest = await storage.getQuest(id);

      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }

      if (quest.completed) {
        return res.status(400).json({ error: "Quest already completed" });
      }

      await storage.updateQuest(id, { completed: true });

      const player = await storage.getPlayer(quest.playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      let newXp = (player.currentXp ?? 0) + quest.xp;
      let newLevel = player.level ?? 1;
      let newMaxXp = player.maxXp ?? 1000;
      let pointsGained = 0;
      let leveledUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        pointsGained += 3;
        leveledUp = true;
      }

      const currentStats = player.stats as Stats;
      let updatedStats = { ...currentStats };

      if (quest.statReward && quest.statReward in updatedStats) {
        updatedStats[quest.statReward as keyof Stats] += 1;
      }

      const updatedPlayer = await storage.updatePlayer(player.id, {
        currentXp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        pointsAvailable: (player.pointsAvailable ?? 0) + pointsGained,
        stats: updatedStats,
        maxHp: leveledUp ? (player.maxHp ?? 100) + (newLevel - (player.level ?? 1)) * 20 : player.maxHp,
        hp: leveledUp ? (player.maxHp ?? 100) + (newLevel - (player.level ?? 1)) * 20 : player.hp,
      });

      await storage.createSystemMessage({
        playerId: player.id,
        sender: "system",
        content: `Missão "${quest.title}" concluída. +${quest.xp} XP${leveledUp ? ` | LEVEL UP: ${newLevel}` : ""}`,
      });

      res.json({
        quest,
        player: updatedPlayer,
        xpGained: quest.xp,
        leveledUp,
        newLevel,
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
      }

      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const analysis = await analyzeJournalEntry(content, player.mainGoal);

      const entry = await storage.createJournalEntry({
        playerId: player.id,
        content,
        analysis,
      });

      let newXp = (player.currentXp ?? 0) + analysis.xpGained;
      let newLevel = player.level ?? 1;
      let newMaxXp = player.maxXp ?? 1000;
      let pointsGained = 0;
      let leveledUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.5);
        pointsGained += 3;
        leveledUp = true;
      }

      const currentStats = player.stats as Stats;
      const statChanges = analysis.stats || {};
      const updatedStats = { ...currentStats };

      for (const [key, value] of Object.entries(statChanges)) {
        if (key in updatedStats && typeof value === "number") {
          updatedStats[key as keyof Stats] = Math.max(0, updatedStats[key as keyof Stats] + value);
        }
      }

      const updatedPlayer = await storage.updatePlayer(player.id, {
        currentXp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        pointsAvailable: (player.pointsAvailable ?? 0) + pointsGained,
        stats: updatedStats,
        maxHp: leveledUp ? (player.maxHp ?? 100) + (newLevel - (player.level ?? 1)) * 20 : player.maxHp,
        hp: leveledUp ? (player.maxHp ?? 100) + (newLevel - (player.level ?? 1)) * 20 : player.hp,
      });

      if (analysis.suggestedQuest) {
        await storage.createQuest({
          playerId: player.id,
          type: analysis.suggestedQuest.type || "DIÁRIA",
          difficulty: analysis.suggestedQuest.difficulty || "E",
          title: analysis.suggestedQuest.title,
          description: analysis.suggestedQuest.description || "Complete esta missão.",
          xp: analysis.suggestedQuest.xp || 100,
          statReward: analysis.suggestedQuest.statReward || null,
          completed: false,
        });
      }

      const today = new Date().toISOString().split("T")[0];
      await storage.createHabitLog({
        playerId: player.id,
        date: today,
        productivityScore: analysis.productivityScore,
        disciplineScore: analysis.disciplineScore,
      });

      await storage.createSystemMessage({
        playerId: player.id,
        sender: "system",
        content: analysis.message,
      });

      res.json({
        entry,
        analysis,
        player: updatedPlayer,
        leveledUp,
        newLevel,
      });
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/journal", async (req, res) => {
    try {
      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const entries = await storage.getJournalEntries(player.id);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/habits", async (req, res) => {
    try {
      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const logs = await storage.getHabitLogs(player.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching habit logs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/messages", async (req, res) => {
    try {
      const player = await storage.getDefaultPlayer();
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const messages = await storage.getSystemMessages(player.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
