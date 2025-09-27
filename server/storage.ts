import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { 
  users, 
  roles, 
  courses, 
  courseCredentials,
  courseMemberships,
  notifications,
  globalPinnedPosts,
  userBadges,
  platformSettings,
  type InsertUser,
  type SelectUser,
  type InsertRole,
  type SelectRole,
  type InsertCourse,
  type SelectCourse,
  type InsertCourseCredentials,
  type SelectCourseCredentials,
  type InsertCourseMembership,
  type SelectCourseMembership,
  type InsertNotification,
  type SelectNotification,
  type InsertGlobalPinnedPost,
  type SelectGlobalPinnedPost,
  type InsertUserBadge,
  type SelectUserBadge,
  type InsertPlatformSetting,
  type SelectPlatformSetting
} from "@shared/schema";

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
export const db = drizzle(client);

// Storage interface for main database operations
export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<SelectUser>;
  getUserById(id: string): Promise<SelectUser | undefined>;
  getUserByEmail(email: string): Promise<SelectUser | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<SelectUser>;
  
  // Role operations  
  createRole(role: InsertRole): Promise<SelectRole>;
  getUserRoles(userId: string): Promise<SelectRole[]>;
  deleteRole(id: string): Promise<void>;
  
  // Course operations
  createCourse(course: InsertCourse): Promise<SelectCourse>;
  getCourses(): Promise<SelectCourse[]>;
  getCourseById(id: string): Promise<SelectCourse | undefined>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<SelectCourse>;
  deleteCourse(id: string): Promise<void>;
  
  // Course credentials operations (service role only)
  createCourseCredentials(credentials: InsertCourseCredentials): Promise<SelectCourseCredentials>;
  getCourseCredentials(courseId: string): Promise<SelectCourseCredentials | undefined>;
  updateCourseCredentials(courseId: string, updates: Partial<InsertCourseCredentials>): Promise<SelectCourseCredentials>;
  
  // Course membership operations
  createCourseMembership(membership: InsertCourseMembership): Promise<SelectCourseMembership>;
  getCourseMemberships(userId: string): Promise<SelectCourseMembership[]>;
  getCourseMembers(courseId: string): Promise<SelectCourseMembership[]>;
  updateCourseMembership(id: string, updates: Partial<InsertCourseMembership>): Promise<SelectCourseMembership>;
  deleteCourseMembership(id: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<SelectNotification>;
  getUserNotifications(userId: string): Promise<SelectNotification[]>;
  markNotificationRead(id: string): Promise<SelectNotification>;
  deleteNotification(id: string): Promise<void>;
  
  // Global pinned posts operations
  createGlobalPinnedPost(post: InsertGlobalPinnedPost): Promise<SelectGlobalPinnedPost>;
  getGlobalPinnedPosts(): Promise<SelectGlobalPinnedPost[]>;
  updateGlobalPinnedPost(id: string, updates: Partial<InsertGlobalPinnedPost>): Promise<SelectGlobalPinnedPost>;
  deleteGlobalPinnedPost(id: string): Promise<void>;
  
  // User badges operations
  createUserBadge(badge: InsertUserBadge): Promise<SelectUserBadge>;
  getUserBadges(userId: string): Promise<SelectUserBadge[]>;
  
  // Platform settings operations
  getSetting(key: string): Promise<SelectPlatformSetting | undefined>;
  updateSetting(key: string, value: any, updatedBy: string): Promise<SelectPlatformSetting>;
  getAllSettings(): Promise<SelectPlatformSetting[]>;
}

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
  // User operations
  async createUser(user: InsertUser): Promise<SelectUser> {
    // For Supabase Auth integration, the ID should be provided from auth.users
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getUserById(id: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<SelectUser | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<SelectUser> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Role operations
  async createRole(role: InsertRole): Promise<SelectRole> {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }

  async getUserRoles(userId: string): Promise<SelectRole[]> {
    return await db.select().from(roles).where(eq(roles.userId, userId));
  }

  async deleteRole(id: string): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Course operations
  async createCourse(course: InsertCourse): Promise<SelectCourse> {
    const result = await db.insert(courses).values(course).returning();
    return result[0];
  }

  async getCourses(): Promise<SelectCourse[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true));
  }

  async getCourseById(id: string): Promise<SelectCourse | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<SelectCourse> {
    const result = await db.update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return result[0];
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Course credentials operations
  async createCourseCredentials(credentials: InsertCourseCredentials): Promise<SelectCourseCredentials> {
    const result = await db.insert(courseCredentials).values(credentials).returning();
    return result[0];
  }

  async getCourseCredentials(courseId: string): Promise<SelectCourseCredentials | undefined> {
    const result = await db.select().from(courseCredentials).where(eq(courseCredentials.courseId, courseId));
    return result[0];
  }

  async updateCourseCredentials(courseId: string, updates: Partial<InsertCourseCredentials>): Promise<SelectCourseCredentials> {
    const result = await db.update(courseCredentials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courseCredentials.courseId, courseId))
      .returning();
    return result[0];
  }

  // Course membership operations
  async createCourseMembership(membership: InsertCourseMembership): Promise<SelectCourseMembership> {
    const result = await db.insert(courseMemberships).values(membership).returning();
    return result[0];
  }

  async getCourseMemberships(userId: string): Promise<SelectCourseMembership[]> {
    return await db.select().from(courseMemberships).where(eq(courseMemberships.userId, userId));
  }

  async getCourseMembers(courseId: string): Promise<SelectCourseMembership[]> {
    return await db.select().from(courseMemberships).where(eq(courseMemberships.courseId, courseId));
  }

  async updateCourseMembership(id: string, updates: Partial<InsertCourseMembership>): Promise<SelectCourseMembership> {
    const result = await db.update(courseMemberships)
      .set(updates)
      .where(eq(courseMemberships.id, id))
      .returning();
    return result[0];
  }

  async deleteCourseMembership(id: string): Promise<void> {
    await db.delete(courseMemberships).where(eq(courseMemberships.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<SelectNotification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string): Promise<SelectNotification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async markNotificationRead(id: string): Promise<SelectNotification> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0];
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Global pinned posts operations
  async createGlobalPinnedPost(post: InsertGlobalPinnedPost): Promise<SelectGlobalPinnedPost> {
    const result = await db.insert(globalPinnedPosts).values(post).returning();
    return result[0];
  }

  async getGlobalPinnedPosts(): Promise<SelectGlobalPinnedPost[]> {
    return await db.select().from(globalPinnedPosts)
      .where(eq(globalPinnedPosts.isPinned, true))
      .orderBy(globalPinnedPosts.createdAt);
  }

  async updateGlobalPinnedPost(id: string, updates: Partial<InsertGlobalPinnedPost>): Promise<SelectGlobalPinnedPost> {
    const result = await db.update(globalPinnedPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(globalPinnedPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteGlobalPinnedPost(id: string): Promise<void> {
    await db.delete(globalPinnedPosts).where(eq(globalPinnedPosts.id, id));
  }

  // User badges operations
  async createUserBadge(badge: InsertUserBadge): Promise<SelectUserBadge> {
    const result = await db.insert(userBadges).values(badge).returning();
    return result[0];
  }

  async getUserBadges(userId: string): Promise<SelectUserBadge[]> {
    return await db.select().from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(userBadges.earnedAt);
  }

  // Platform settings operations
  async getSetting(key: string): Promise<SelectPlatformSetting | undefined> {
    const result = await db.select().from(platformSettings).where(eq(platformSettings.key, key));
    return result[0];
  }

  async updateSetting(key: string, value: any, updatedBy: string): Promise<SelectPlatformSetting> {
    const result = await db.insert(platformSettings)
      .values({ key, value: JSON.stringify(value), updatedBy })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: JSON.stringify(value), updatedBy, updatedAt: new Date() }
      })
      .returning();
    return result[0];
  }

  async getAllSettings(): Promise<SelectPlatformSetting[]> {
    return await db.select().from(platformSettings);
  }
}

export const storage = new SupabaseStorage();