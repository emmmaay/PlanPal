import { z } from "zod";
import { pgTable, text, boolean, integer, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// ========================================
// MAIN SUPABASE DATABASE SCHEMA
// ========================================

// Users table (linked to Supabase Auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // This will match auth.users.id from Supabase Auth
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: text("email").notNull(),
  isCreator: boolean("is_creator").default(false).notNull(), // Immutable creator flag
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Role types for the platform
export enum RoleType {
  CREATOR = "creator",           // Ultimate admin (you) - cannot be removed
  TOP_ADMIN = "top_admin",       // Executive admins
  COURSE_ADMIN = "course_admin", // Course-specific admins
  USER = "user"                  // Normal users
}

// Roles table
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  roleType: text("role_type").notNull(), // creator, top_admin, course_admin, user
  scope: uuid("scope"), // null for global roles, course_id for course-specific roles
  assignedBy: uuid("assigned_by").references(() => users.id), // Who assigned this role
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Course registry (public info only - no sensitive credentials)
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  lecturer: text("lecturer"),
  courseRep: text("course_rep"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course credentials (sensitive data - service role only access)
export const courseCredentials = pgTable("course_credentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id).notNull().unique(),
  supabaseUrl: text("supabase_url").notNull(),
  supabaseAnonKey: text("supabase_anon_key").notNull(),
  supabaseServiceKey: text("supabase_service_key").notNull(), // Encrypted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course memberships (who belongs to which course)
export const courseMemberships = pgTable("course_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  courseId: uuid("course_id").references(() => courses.id).notNull(),
  role: text("role").default("student").notNull(), // student, course_admin
  status: text("status").default("active").notNull(), // active, suspended
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Global platform settings
export const platformSettings = pgTable("platform_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Global notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // assignment, post, reaction, system, etc.
  data: jsonb("data"), // Additional data (course_id, post_id, etc.)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Global pinned posts (cross-platform announcements)
export const globalPinnedPosts = pgTable("global_pinned_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: uuid("author").references(() => users.id).notNull(),
  isPinned: boolean("is_pinned").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User badges and achievements (global)
export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  badgeType: text("badge_type").notNull(), // first_post, top_contributor, etc.
  badgeData: jsonb("badge_data"), // Additional badge metadata
  courseId: uuid("course_id"), // null for global badges, course_id for course-specific
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// ========================================
// SCHEMAS AND TYPES FOR MAIN DATABASE
// ========================================

export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const selectRoleSchema = createSelectSchema(roles);
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type SelectRole = typeof roles.$inferSelect;

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCourseSchema = createSelectSchema(courses);
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type SelectCourse = typeof courses.$inferSelect;

export const insertCourseCredentialsSchema = createInsertSchema(courseCredentials).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCourseCredentialsSchema = createSelectSchema(courseCredentials);
export type InsertCourseCredentials = z.infer<typeof insertCourseCredentialsSchema>;
export type SelectCourseCredentials = typeof courseCredentials.$inferSelect;

export const insertCourseMembershipSchema = createInsertSchema(courseMemberships).omit({ id: true, joinedAt: true });
export const selectCourseMembershipSchema = createSelectSchema(courseMemberships);
export type InsertCourseMembership = z.infer<typeof insertCourseMembershipSchema>;
export type SelectCourseMembership = typeof courseMemberships.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const selectNotificationSchema = createSelectSchema(notifications);
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = typeof notifications.$inferSelect;

export const insertGlobalPinnedPostSchema = createInsertSchema(globalPinnedPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const selectGlobalPinnedPostSchema = createSelectSchema(globalPinnedPosts);
export type InsertGlobalPinnedPost = z.infer<typeof insertGlobalPinnedPostSchema>;
export type SelectGlobalPinnedPost = typeof globalPinnedPosts.$inferSelect;

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const selectUserBadgeSchema = createSelectSchema(userBadges);
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type SelectUserBadge = typeof userBadges.$inferSelect;

export const insertPlatformSettingSchema = createInsertSchema(platformSettings).omit({ id: true, updatedAt: true });
export const selectPlatformSettingSchema = createSelectSchema(platformSettings);
export type InsertPlatformSetting = z.infer<typeof insertPlatformSettingSchema>;
export type SelectPlatformSetting = typeof platformSettings.$inferSelect;

// ========================================
// PER-COURSE DATABASE SCHEMA DEFINITIONS
// (These will be created in each course's Supabase instance)
// ========================================

// Posts table (for assignments, information posts, etc.)
export const coursePosts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "assignment", "post", "announcement"
  authorId: uuid("author_id").notNull(), // References users.id from main DB
  deadline: timestamp("deadline"), // For assignments
  mediaUrls: text("media_urls").array(), // Array of media file URLs
  isPinned: boolean("is_pinned").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comments on posts
export const courseComments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => coursePosts.id).notNull(),
  authorId: uuid("author_id").notNull(), // References users.id from main DB
  content: text("content").notNull(),
  parentId: uuid("parent_id"), // For nested comments
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reactions on posts and comments
export const courseReactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetId: uuid("target_id").notNull(), // post_id or comment_id
  targetType: text("target_type").notNull(), // "post" or "comment"
  userId: uuid("user_id").notNull(), // References users.id from main DB
  reactionType: text("reaction_type").notNull(), // "like", "love", "laugh", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assignment completion tracking
export const assignmentStatus = pgTable("assignment_status", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => coursePosts.id).notNull(),
  userId: uuid("user_id").notNull(), // References users.id from main DB
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  submissionNote: text("submission_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Course-specific user stats for leaderboard
export const courseUserStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(), // References users.id from main DB
  postsCount: integer("posts_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  reactionsReceived: integer("reactions_received").default(0).notNull(),
  assignmentsCompleted: integer("assignments_completed").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========================================
// SCHEMAS FOR PER-COURSE TABLES
// ========================================

export const insertCoursePostSchema = createInsertSchema(coursePosts).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCoursePostSchema = createSelectSchema(coursePosts);
export type InsertCoursePost = z.infer<typeof insertCoursePostSchema>;
export type SelectCoursePost = typeof coursePosts.$inferSelect;

export const insertCourseCommentSchema = createInsertSchema(courseComments).omit({ id: true, createdAt: true, updatedAt: true });
export const selectCourseCommentSchema = createSelectSchema(courseComments);
export type InsertCourseComment = z.infer<typeof insertCourseCommentSchema>;
export type SelectCourseComment = typeof courseComments.$inferSelect;

export const insertCourseReactionSchema = createInsertSchema(courseReactions).omit({ id: true, createdAt: true });
export const selectCourseReactionSchema = createSelectSchema(courseReactions);
export type InsertCourseReaction = z.infer<typeof insertCourseReactionSchema>;
export type SelectCourseReaction = typeof courseReactions.$inferSelect;

export const insertAssignmentStatusSchema = createInsertSchema(assignmentStatus).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAssignmentStatusSchema = createSelectSchema(assignmentStatus);
export type InsertAssignmentStatus = z.infer<typeof insertAssignmentStatusSchema>;
export type SelectAssignmentStatus = typeof assignmentStatus.$inferSelect;

export const insertCourseUserStatsSchema = createInsertSchema(courseUserStats).omit({ id: true, updatedAt: true });
export const selectCourseUserStatsSchema = createSelectSchema(courseUserStats);
export type InsertCourseUserStats = z.infer<typeof insertCourseUserStatsSchema>;
export type SelectCourseUserStats = typeof courseUserStats.$inferSelect;

// ========================================
// API REQUEST/RESPONSE SCHEMAS
// ========================================

// Authentication
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(50),
});

// Course management
export const createCourseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  lecturer: z.string().optional(),
  courseRep: z.string().optional(),
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceKey: z.string().min(1),
});

// Course membership management
export const addCourseMemberSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().uuid(),
  role: z.enum(["student", "course_admin"]).default("student"),
});

// Role assignment
export const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleType: z.enum(["top_admin", "course_admin", "user"]),
  scope: z.string().optional(), // course_id for course_admin
});

// Platform settings
export const updateSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

// Post creation
export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["assignment", "post", "announcement"]),
  deadline: z.string().datetime().optional(),
  mediaUrls: z.array(z.string().url()).default([]),
});

// Comment creation
export const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1),
  parentId: z.string().uuid().optional(),
});

// Reaction creation
export const createReactionSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(["post", "comment"]),
  reactionType: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type CreateCourseRequest = z.infer<typeof createCourseSchema>;
export type AssignRoleRequest = z.infer<typeof assignRoleSchema>;
export type UpdateSettingRequest = z.infer<typeof updateSettingSchema>;
export type CreatePostRequest = z.infer<typeof createPostSchema>;
export type CreateCommentRequest = z.infer<typeof createCommentSchema>;
export type CreateReactionRequest = z.infer<typeof createReactionSchema>;