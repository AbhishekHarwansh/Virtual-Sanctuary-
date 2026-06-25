import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { registerDemoRoutes } from "./demo-routes";
import {
  insertMoodEntrySchema,
  insertMeditationSessionSchema,
  insertBreathingExerciseSchema,
  insertCommunityMessageSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register demo routes for testing functionality
  registerDemoRoutes(app);
  
  // Auth middleware
  try {
    await setupAuth(app);
  } catch (error) {
    console.warn("Auth setup failed, continuing with demo mode:", error);
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mood tracking routes
  app.post("/api/mood", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId,
      });
      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ message: "Failed to create mood entry" });
    }
  });

  app.get("/api/mood", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const moodEntries = await storage.getUserMoodEntries(userId, days);
      res.json(moodEntries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  // Meditation session routes
  app.post("/api/meditation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMeditationSessionSchema.parse({
        ...req.body,
        userId,
      });
      const session = await storage.createMeditationSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating meditation session:", error);
      res.status(400).json({ message: "Failed to create meditation session" });
    }
  });

  app.get("/api/meditation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserMeditationSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching meditation sessions:", error);
      res.status(500).json({ message: "Failed to fetch meditation sessions" });
    }
  });

  // User stats route
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Breathing exercise routes
  app.post("/api/breathing", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBreathingExerciseSchema.parse({
        ...req.body,
        userId,
      });
      const exercise = await storage.createBreathingExercise(validatedData);
      res.json(exercise);
    } catch (error) {
      console.error("Error creating breathing exercise:", error);
      res.status(400).json({ message: "Failed to create breathing exercise" });
    }
  });

  app.get("/api/breathing", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const exercises = await storage.getUserBreathingExercises(userId);
      res.json(exercises);
    } catch (error) {
      console.error("Error fetching breathing exercises:", error);
      res.status(500).json({ message: "Failed to fetch breathing exercises" });
    }
  });

  // Community routes
  app.post("/api/community/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCommunityMessageSchema.parse({
        ...req.body,
        userId,
      });
      const message = await storage.createCommunityMessage(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating community message:", error);
      res.status(400).json({ message: "Failed to create message" });
    }
  });

  app.get("/api/community/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getCommunityMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching community messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Challenges routes
  app.get("/api/challenges", async (req, res) => {
    try {
      const challenges = await storage.getActiveChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/user/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChallenges = await storage.getUserChallenges(userId);
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  // External API routes
  app.get("/api/meditation-content", async (req, res) => {
    try {
      // Integration with meditation content API
      const apiKey = process.env.MEDITATION_API_KEY || process.env.VITE_MEDITATION_API_KEY || "demo_key";
      
      // Mock response for demo - replace with actual API call
      const content = {
        guided_meditations: [
          {
            id: "forest_calm",
            title: "Forest Sanctuary Meditation",
            duration: 900, // 15 minutes
            description: "Find peace among ancient trees with gentle forest sounds",
            audio_url: "https://example.com/forest_meditation.mp3"
          },
          {
            id: "ocean_waves",
            title: "Ocean Retreat Meditation", 
            duration: 1200, // 20 minutes
            description: "Let rhythmic waves wash away your stress",
            audio_url: "https://example.com/ocean_meditation.mp3"
          }
        ]
      };
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching meditation content:", error);
      res.status(500).json({ message: "Failed to fetch meditation content" });
    }
  });

  app.get("/api/crisis-resources", async (req, res) => {
    try {
      // Integration with mental health resources API
      const apiKey = process.env.CRISIS_API_KEY || process.env.VITE_CRISIS_API_KEY || "demo_key";
      
      // Mock response for demo - replace with actual API call
      const resources = {
        hotlines: [
          {
            name: "National Suicide Prevention Lifeline",
            phone: "988",
            available: "24/7",
            description: "Free and confidential emotional support"
          },
          {
            name: "Crisis Text Line",
            phone: "741741",
            text: "HOME",
            available: "24/7",
            description: "Text-based crisis support"
          }
        ],
        local_resources: [
          {
            name: "Local Mental Health Services",
            phone: "211",
            description: "Find local mental health resources"
          }
        ]
      };
      
      res.json(resources);
    } catch (error) {
      console.error("Error fetching crisis resources:", error);
      res.status(500).json({ message: "Failed to fetch crisis resources" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'join_community':
            // Client joined community chat
            ws.send(JSON.stringify({
              type: 'welcome',
              message: 'Connected to community chat'
            }));
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
