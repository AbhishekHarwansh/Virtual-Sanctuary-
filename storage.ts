import {
  users,
  moodEntries,
  meditationSessions,
  breathingExercises,
  communityMessages,
  achievements,
  challenges,
  userChallenges,
  type User,
  type UpsertUser,
  type MoodEntry,
  type InsertMoodEntry,
  type MeditationSession,
  type InsertMeditationSession,
  type BreathingExercise,
  type InsertBreathingExercise,
  type CommunityMessage,
  type InsertCommunityMessage,
  type Achievement,
  type InsertAchievement,
  type Challenge,
  type UserChallenge,
  type InsertUserChallenge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, between } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Mood tracking
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, days?: number): Promise<MoodEntry[]>;
  
  // Meditation sessions
  createMeditationSession(session: InsertMeditationSession): Promise<MeditationSession>;
  getUserMeditationSessions(userId: string): Promise<MeditationSession[]>;
  getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
  }>;
  
  // Breathing exercises
  createBreathingExercise(exercise: InsertBreathingExercise): Promise<BreathingExercise>;
  getUserBreathingExercises(userId: string): Promise<BreathingExercise[]>;
  
  // Community
  createCommunityMessage(message: InsertCommunityMessage): Promise<CommunityMessage>;
  getCommunityMessages(limit?: number): Promise<CommunityMessage[]>;
  
  // Achievements
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Challenges
  getActiveChallenges(): Promise<Challenge[]>;
  getUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]>;
  createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallengeProgress(userChallengeId: number, progress: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [moodEntry] = await db
      .insert(moodEntries)
      .values(entry)
      .returning();
    return moodEntry;
  }

  async getUserMoodEntries(userId: string, days: number = 30): Promise<MoodEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.date, startDate)
        )
      )
      .orderBy(desc(moodEntries.date));
  }

  async createMeditationSession(session: InsertMeditationSession): Promise<MeditationSession> {
    const [meditationSession] = await db
      .insert(meditationSessions)
      .values(session)
      .returning();
    return meditationSession;
  }

  async getUserMeditationSessions(userId: string): Promise<MeditationSession[]> {
    return await db
      .select()
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId))
      .orderBy(desc(meditationSessions.date));
  }

  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
  }> {
    // Get total sessions count
    const [sessionsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));
    
    // Get total minutes
    const [minutesResult] = await db
      .select({ total: sql<number>`coalesce(sum(duration), 0)` })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId));
    
    // Calculate current streak (simplified - days with at least one session)
    const recentSessions = await db
      .select({ date: meditationSessions.date })
      .from(meditationSessions)
      .where(eq(meditationSessions.userId, userId))
      .orderBy(desc(meditationSessions.date))
      .limit(30);
    
    let currentStreak = 0;
    const today = new Date();
    const sessionDates = new Set(
      recentSessions.map(s => s.date.toDateString())
    );
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (sessionDates.has(checkDate.toDateString())) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalSessions: sessionsResult.count,
      totalMinutes: minutesResult.total,
      currentStreak,
    };
  }

  async createBreathingExercise(exercise: InsertBreathingExercise): Promise<BreathingExercise> {
    const [breathingExercise] = await db
      .insert(breathingExercises)
      .values(exercise)
      .returning();
    return breathingExercise;
  }

  async getUserBreathingExercises(userId: string): Promise<BreathingExercise[]> {
    return await db
      .select()
      .from(breathingExercises)
      .where(eq(breathingExercises.userId, userId))
      .orderBy(desc(breathingExercises.date));
  }

  async createCommunityMessage(message: InsertCommunityMessage): Promise<CommunityMessage> {
    const [communityMessage] = await db
      .insert(communityMessages)
      .values(message)
      .returning();
    return communityMessage;
  }

  async getCommunityMessages(limit: number = 50): Promise<CommunityMessage[]> {
    return await db
      .select()
      .from(communityMessages)
      .orderBy(desc(communityMessages.timestamp))
      .limit(limit);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.completedAt));
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.active, true),
          gte(challenges.endDate, now)
        )
      );
  }

  async getUserChallenges(userId: string): Promise<(UserChallenge & { challenge: Challenge })[]> {
    return await db
      .select()
      .from(userChallenges)
      .leftJoin(challenges, eq(userChallenges.challengeId, challenges.id))
      .where(eq(userChallenges.userId, userId))
      .then(results => 
        results.map(result => ({
          ...result.user_challenges,
          challenge: result.challenges!
        }))
      );
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values(userChallenge)
      .returning();
    return newUserChallenge;
  }

  async updateUserChallengeProgress(userChallengeId: number, progress: number): Promise<void> {
    await db
      .update(userChallenges)
      .set({ progress })
      .where(eq(userChallenges.id, userChallengeId));
  }
}

export const storage = new DatabaseStorage();
