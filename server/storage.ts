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
  coursePosts,
  courseComments,
  courseReactions,
  assignmentStatus,
  courseUserStats,
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
  type SelectPlatformSetting,
  type InsertCoursePost,
  type SelectCoursePost,
  type InsertCourseComment,
  type SelectCourseComment,
  type InsertCourseReaction,
  type SelectCourseReaction,
  type InsertAssignmentStatus,
  type SelectAssignmentStatus,
  type InsertCourseUserStats,
  type SelectCourseUserStats
} from "@shared/schema";

// Main database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
export const db = drizzle(client);

// Course database connections cache
const courseDbConnections = new Map<string, ReturnType<typeof drizzle>>();

// Function to get course database connection using Supabase service key
export async function getCourseDb(courseId: string): Promise<ReturnType<typeof drizzle> | null> {
  if (courseDbConnections.has(courseId)) {
    return courseDbConnections.get(courseId)!;
  }

  try {
    const credentials = await storage.getCourseCredentials(courseId);
    if (!credentials) {
      console.error(`No credentials found for course ${courseId}`);
      return null;
    }

    // Extract database connection details from Supabase URL
    const dbUrl = credentials.supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    const connectionString = `postgresql://postgres:${credentials.supabaseServiceKey}@db.${dbUrl}.supabase.co:5432/postgres`;
    
    const courseClient = postgres(connectionString);
    const courseDb = drizzle(courseClient);
    
    courseDbConnections.set(courseId, courseDb);
    return courseDb;
  } catch (error) {
    console.error(`Failed to connect to course database ${courseId}:`, error);
    return null;
  }
}

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
  
  // Course-specific operations (connect to course databases)
  // Posts operations
  createCoursePost(courseId: string, post: InsertCoursePost): Promise<SelectCoursePost | null>;
  getCoursePosts(courseId: string, limit?: number): Promise<SelectCoursePost[]>;
  getCoursePostById(courseId: string, postId: string): Promise<SelectCoursePost | null>;
  updateCoursePost(courseId: string, postId: string, updates: Partial<InsertCoursePost>): Promise<SelectCoursePost | null>;
  deleteCoursePost(courseId: string, postId: string): Promise<void>;
  
  // Comments operations
  createCourseComment(courseId: string, comment: InsertCourseComment): Promise<SelectCourseComment | null>;
  getCourseComments(courseId: string, postId: string): Promise<SelectCourseComment[]>;
  updateCourseComment(courseId: string, commentId: string, updates: Partial<InsertCourseComment>): Promise<SelectCourseComment | null>;
  deleteCourseComment(courseId: string, commentId: string): Promise<void>;
  
  // Reactions operations
  createCourseReaction(courseId: string, reaction: InsertCourseReaction): Promise<SelectCourseReaction | null>;
  getCourseReactions(courseId: string, targetId: string, targetType: string): Promise<SelectCourseReaction[]>;
  deleteCourseReaction(courseId: string, reactionId: string): Promise<void>;
  
  // Assignment status operations
  createAssignmentStatus(courseId: string, status: InsertAssignmentStatus): Promise<SelectAssignmentStatus | null>;
  getAssignmentStatus(courseId: string, postId: string, userId: string): Promise<SelectAssignmentStatus | null>;
  updateAssignmentStatus(courseId: string, statusId: string, updates: Partial<InsertAssignmentStatus>): Promise<SelectAssignmentStatus | null>;
  getUserAssignmentStatuses(courseId: string, userId: string): Promise<SelectAssignmentStatus[]>;
  
  // Course stats operations
  getCourseUserStats(courseId: string, userId: string): Promise<SelectCourseUserStats | null>;
  getCourseLeaderboard(courseId: string, limit?: number): Promise<SelectCourseUserStats[]>;
  
  // Dashboard aggregation methods
  getUserDashboardStats(userId: string): Promise<{
    totalCourses: number;
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    userRank: number;
    userPoints: number;
  }>;
  getAllUserAssignments(userId: string): Promise<Array<{
    id: string;
    title: string;
    course: string;
    courseId: string;
    dueDate: string;
    description: string;
    isCompleted: boolean;
    priority: 'high' | 'medium' | 'low';
    submissionType: string;
  }>>;
  getGlobalLeaderboard(): Promise<Array<{
    id: string;
    username: string;
    points: number;
    badges: number;
    rank: number;
    contributions: number;
  }>>;
  
  // User management operations
  getAllUsers(): Promise<SelectUser[]>;
  banUser(userId: string): Promise<void>;
  unbanUser(userId: string): Promise<void>;
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
  
  // Course-specific operations
  async createCoursePost(courseId: string, post: InsertCoursePost): Promise<SelectCoursePost | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.insert(coursePosts).values(post).returning();
      return result[0];
    } catch (error) {
      console.error('Create course post error:', error);
      return null;
    }
  }

  async getCoursePosts(courseId: string, limit: number = 50): Promise<SelectCoursePost[]> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return [];
    
    try {
      return await courseDb.select().from(coursePosts)
        .where(eq(coursePosts.isDeleted, false))
        .orderBy(coursePosts.createdAt)
        .limit(limit);
    } catch (error) {
      console.error('Get course posts error:', error);
      return [];
    }
  }

  async getCoursePostById(courseId: string, postId: string): Promise<SelectCoursePost | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.select().from(coursePosts)
        .where(and(eq(coursePosts.id, postId), eq(coursePosts.isDeleted, false)));
      return result[0] || null;
    } catch (error) {
      console.error('Get course post error:', error);
      return null;
    }
  }

  async updateCoursePost(courseId: string, postId: string, updates: Partial<InsertCoursePost>): Promise<SelectCoursePost | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.update(coursePosts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(coursePosts.id, postId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Update course post error:', error);
      return null;
    }
  }

  async deleteCoursePost(courseId: string, postId: string): Promise<void> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return;
    
    try {
      await courseDb.update(coursePosts)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(coursePosts.id, postId));
    } catch (error) {
      console.error('Delete course post error:', error);
    }
  }

  async createCourseComment(courseId: string, comment: InsertCourseComment): Promise<SelectCourseComment | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.insert(courseComments).values(comment).returning();
      return result[0];
    } catch (error) {
      console.error('Create course comment error:', error);
      return null;
    }
  }

  async getCourseComments(courseId: string, postId: string): Promise<SelectCourseComment[]> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return [];
    
    try {
      return await courseDb.select().from(courseComments)
        .where(and(eq(courseComments.postId, postId), eq(courseComments.isDeleted, false)))
        .orderBy(courseComments.createdAt);
    } catch (error) {
      console.error('Get course comments error:', error);
      return [];
    }
  }

  async updateCourseComment(courseId: string, commentId: string, updates: Partial<InsertCourseComment>): Promise<SelectCourseComment | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.update(courseComments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(courseComments.id, commentId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Update course comment error:', error);
      return null;
    }
  }

  async deleteCourseComment(courseId: string, commentId: string): Promise<void> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return;
    
    try {
      await courseDb.update(courseComments)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(courseComments.id, commentId));
    } catch (error) {
      console.error('Delete course comment error:', error);
    }
  }

  async createCourseReaction(courseId: string, reaction: InsertCourseReaction): Promise<SelectCourseReaction | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.insert(courseReactions).values(reaction).returning();
      return result[0];
    } catch (error) {
      console.error('Create course reaction error:', error);
      return null;
    }
  }

  async getCourseReactions(courseId: string, targetId: string, targetType: string): Promise<SelectCourseReaction[]> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return [];
    
    try {
      return await courseDb.select().from(courseReactions)
        .where(and(eq(courseReactions.targetId, targetId), eq(courseReactions.targetType, targetType)));
    } catch (error) {
      console.error('Get course reactions error:', error);
      return [];
    }
  }

  async deleteCourseReaction(courseId: string, reactionId: string): Promise<void> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return;
    
    try {
      await courseDb.delete(courseReactions).where(eq(courseReactions.id, reactionId));
    } catch (error) {
      console.error('Delete course reaction error:', error);
    }
  }

  async createAssignmentStatus(courseId: string, status: InsertAssignmentStatus): Promise<SelectAssignmentStatus | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.insert(assignmentStatus).values(status).returning();
      return result[0];
    } catch (error) {
      console.error('Create assignment status error:', error);
      return null;
    }
  }

  async getAssignmentStatus(courseId: string, postId: string, userId: string): Promise<SelectAssignmentStatus | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.select().from(assignmentStatus)
        .where(and(eq(assignmentStatus.postId, postId), eq(assignmentStatus.userId, userId)));
      return result[0] || null;
    } catch (error) {
      console.error('Get assignment status error:', error);
      return null;
    }
  }

  async updateAssignmentStatus(courseId: string, statusId: string, updates: Partial<InsertAssignmentStatus>): Promise<SelectAssignmentStatus | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.update(assignmentStatus)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(assignmentStatus.id, statusId))
        .returning();
      return result[0] || null;
    } catch (error) {
      console.error('Update assignment status error:', error);
      return null;
    }
  }

  async getUserAssignmentStatuses(courseId: string, userId: string): Promise<SelectAssignmentStatus[]> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return [];
    
    try {
      return await courseDb.select().from(assignmentStatus)
        .where(eq(assignmentStatus.userId, userId));
    } catch (error) {
      console.error('Get user assignment statuses error:', error);
      return [];
    }
  }

  async getCourseUserStats(courseId: string, userId: string): Promise<SelectCourseUserStats | null> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return null;
    
    try {
      const result = await courseDb.select().from(courseUserStats)
        .where(eq(courseUserStats.userId, userId));
      return result[0] || null;
    } catch (error) {
      console.error('Get course user stats error:', error);
      return null;
    }
  }

  async getCourseLeaderboard(courseId: string, limit: number = 10): Promise<SelectCourseUserStats[]> {
    const courseDb = await getCourseDb(courseId);
    if (!courseDb) return [];
    
    try {
      return await courseDb.select().from(courseUserStats)
        .orderBy(courseUserStats.points)
        .limit(limit);
    } catch (error) {
      console.error('Get course leaderboard error:', error);
      return [];
    }
  }

  // Dashboard aggregation methods
  async getUserDashboardStats(userId: string): Promise<{
    totalCourses: number;
    totalAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    userRank: number;
    userPoints: number;
  }> {
    try {
      // Get user's courses
      const userCourses = await this.getCoursesForUser(userId);
      
      // Get assignments and completions across all courses
      let totalAssignments = 0;
      let completedAssignments = 0;
      let totalPoints = 0;
      
      for (const course of userCourses) {
        // Get course posts (assignments)
        const posts = await this.getCoursePostsPublic(course.id);
        const assignments = posts.filter(post => post.type === 'assignment');
        totalAssignments += assignments.length;
        
        // Get user's assignment completions for this course
        const userStatuses = await this.getUserAssignmentStatuses(course.id, userId);
        const completedInCourse = userStatuses.filter(status => status.isCompleted).length;
        completedAssignments += completedInCourse;
        
        // Get user stats for points
        const userStats = await this.getCourseUserStats(course.id, userId);
        if (userStats) {
          totalPoints += userStats.points;
        }
      }
      
      const pendingAssignments = totalAssignments - completedAssignments;
      
      // Calculate global rank (simplified - should be based on global leaderboard)
      const globalLeaderboard = await this.getGlobalLeaderboard();
      const userRank = globalLeaderboard.findIndex(entry => entry.id === userId) + 1 || 0;
      
      return {
        totalCourses: userCourses.length,
        totalAssignments,
        completedAssignments,
        pendingAssignments,
        userRank,
        userPoints: totalPoints,
      };
    } catch (error) {
      console.error('Get user dashboard stats error:', error);
      return {
        totalCourses: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        userRank: 0,
        userPoints: 0,
      };
    }
  }

  async getAllUserAssignments(userId: string): Promise<Array<{
    id: string;
    title: string;
    course: string;
    courseId: string;
    dueDate: string;
    description: string;
    isCompleted: boolean;
    priority: 'high' | 'medium' | 'low';
    submissionType: string;
  }>> {
    try {
      const userCourses = await this.getCoursesForUser(userId);
      const allAssignments: any[] = [];
      
      for (const course of userCourses) {
        // Get course posts (assignments)
        const posts = await this.getCoursePostsPublic(course.id);
        const assignments = posts.filter(post => post.type === 'assignment');
        
        // Get user's assignment statuses for this course
        const userStatuses = await this.getUserAssignmentStatuses(course.id, userId);
        const statusMap = new Map(userStatuses.map(status => [status.postId, status]));
        
        for (const assignment of assignments) {
          const status = statusMap.get(assignment.id);
          const isCompleted = status?.isCompleted || false;
          const dueDate = assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline';
          
          // Determine priority based on deadline
          let priority: 'high' | 'medium' | 'low' = 'medium';
          if (assignment.deadline) {
            const deadline = new Date(assignment.deadline);
            const now = new Date();
            const daysUntilDue = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysUntilDue <= 3) {
              priority = 'high';
            } else if (daysUntilDue <= 7) {
              priority = 'medium';
            } else {
              priority = 'low';
            }
          }

          allAssignments.push({
            id: assignment.id,
            title: assignment.title,
            course: course.name,
            courseId: course.id,
            dueDate,
            description: assignment.content,
            isCompleted,
            priority,
            submissionType: 'Assignment',
          });
        }
      }
      
      return allAssignments;
    } catch (error) {
      console.error('Get all user assignments error:', error);
      return [];
    }
  }

  async getGlobalLeaderboard(): Promise<Array<{
    id: string;
    username: string;
    points: number;
    badges: number;
    rank: number;
    contributions: number;
  }>> {
    try {
      // Get all users
      const allUsers = await this.getAllUsers();
      const leaderboardEntries: any[] = [];
      
      for (const user of allUsers) {
        let totalPoints = 0;
        let totalContributions = 0;
        
        // Get user's courses and stats
        const userCourses = await this.getCoursesForUser(user.id);
        
        for (const course of userCourses) {
          const userStats = await this.getCourseUserStats(course.id, user.id);
          if (userStats) {
            totalPoints += userStats.points;
            totalContributions += userStats.postsCount + userStats.commentsCount;
          }
        }
        
        const badges = Math.floor(totalPoints / 100); // 1 badge per 100 points
        
        leaderboardEntries.push({
          id: user.id,
          username: user.username,
          points: totalPoints,
          badges,
          rank: 0, // Will be set after sorting
          contributions: totalContributions,
        });
      }
      
      // Sort by points descending and assign ranks
      leaderboardEntries.sort((a, b) => b.points - a.points);
      leaderboardEntries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      
      return leaderboardEntries;
    } catch (error) {
      console.error('Get global leaderboard error:', error);
      return [];
    }
  }

  // Helper method to get courses for a user
  async getCoursesForUser(userId: string): Promise<SelectCourse[]> {
    try {
      const memberships = await this.getCourseMemberships(userId);
      const courses: SelectCourse[] = [];
      
      for (const membership of memberships) {
        const course = await this.getCourseById(membership.courseId);
        if (course) {
          courses.push(course);
        }
      }
      
      return courses;
    } catch (error) {
      console.error('Get courses for user error:', error);
      return [];
    }
  }

  // Helper method to get all users (for leaderboard)
  async getAllUsers(): Promise<SelectUser[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  // User management operations
  async getAllUsers(): Promise<SelectUser[]> {
    return await db.select().from(users);
  }

  async banUser(userId: string): Promise<void> {
    await db.update(users)
      .set({ isBanned: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async unbanUser(userId: string): Promise<void> {
    await db.update(users)
      .set({ isBanned: false, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const storage = new SupabaseStorage();