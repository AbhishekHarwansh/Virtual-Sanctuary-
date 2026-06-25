import type { Express } from "express";
import { storage } from "./storage";
import {
  insertMoodEntrySchema,
  insertMeditationSessionSchema,
  insertBreathingExerciseSchema,
  insertCommunityMessageSchema,
} from "@shared/schema";

// Demo routes that work without authentication for testing
export function registerDemoRoutes(app: Express) {
  console.log("Registering demo routes for testing...");
  
  // Demo user ID for testing
  const DEMO_USER_ID = "demo_user_123";
  
  // Create demo user if it doesn't exist
  app.get("/api/demo/init", async (req, res) => {
    try {
      await storage.upsertUser({
        id: DEMO_USER_ID,
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      });
      res.json({ message: "Demo user created", userId: DEMO_USER_ID });
    } catch (error) {
      console.error("Error creating demo user:", error);
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  // Demo mood tracking
  app.post("/api/demo/mood", async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating demo mood entry:", error);
      res.status(400).json({ message: "Failed to create mood entry" });
    }
  });

  app.get("/api/demo/mood", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const moodEntries = await storage.getUserMoodEntries(DEMO_USER_ID, days);
      res.json(moodEntries);
    } catch (error) {
      console.error("Error fetching demo mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  // Demo meditation sessions
  app.post("/api/demo/meditation", async (req, res) => {
    try {
      const validatedData = insertMeditationSessionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const session = await storage.createMeditationSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating demo meditation session:", error);
      res.status(400).json({ message: "Failed to create meditation session" });
    }
  });

  app.get("/api/demo/meditation", async (req, res) => {
    try {
      const sessions = await storage.getUserMeditationSessions(DEMO_USER_ID);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching demo meditation sessions:", error);
      res.status(500).json({ message: "Failed to fetch meditation sessions" });
    }
  });

  // Demo breathing exercises
  app.post("/api/demo/breathing", async (req, res) => {
    try {
      const validatedData = insertBreathingExerciseSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const exercise = await storage.createBreathingExercise(validatedData);
      res.json(exercise);
    } catch (error) {
      console.error("Error creating demo breathing exercise:", error);
      res.status(400).json({ message: "Failed to create breathing exercise" });
    }
  });

  app.get("/api/demo/breathing", async (req, res) => {
    try {
      const exercises = await storage.getUserBreathingExercises(DEMO_USER_ID);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching demo breathing exercises:", error);
      res.status(500).json({ message: "Failed to fetch breathing exercises" });
    }
  });

  // Demo user stats
  app.get("/api/demo/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(DEMO_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching demo user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Demo community messages
  app.post("/api/demo/community/messages", async (req, res) => {
    try {
      const validatedData = insertCommunityMessageSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const message = await storage.createCommunityMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error creating demo community message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });
}