import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { requireAuth, optionalAuth, requireRole, requireCourseAdmin, type AuthenticatedRequest } from "./auth";
import { 
  createCourseSchema,
  assignRoleSchema,
  updateSettingSchema,
  type CreateCourseRequest,
  type AssignRoleRequest,
  type UpdateSettingRequest
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========================================
  // USER PROFILE ROUTES
  // ========================================

  // Get current user (works with Supabase token)
  app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const roles = await storage.getUserRoles(user.id);
      const memberships = await storage.getCourseMemberships(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isCreator: user.isCreator,
        },
        roles,
        memberships,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Update user profile
  app.put("/api/auth/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { username } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }

      const updatedUser = await storage.updateUser(req.user!.id, { username });
      
      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          isCreator: updatedUser.isCreator,
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // ========================================
  // COURSE MANAGEMENT ROUTES
  // ========================================

  // Get all courses (for enrolled users)
  app.get("/api/courses", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const courses = await storage.getCourses();
      
      // Filter courses based on user membership (unless they're top admin)
      if (!req.user!.isCreator) {
        const userRoles = await storage.getUserRoles(req.user!.id);
        const isTopAdmin = userRoles.some(role => role.roleType === 'top_admin');
        
        if (!isTopAdmin) {
          const memberships = await storage.getCourseMemberships(req.user!.id);
          const enrolledCourseIds = memberships.map(m => m.courseId);
          const filteredCourses = courses.filter(course => enrolledCourseIds.includes(course.id));
          return res.json(filteredCourses);
        }
      }

      res.json(courses);
    } catch (error) {
      console.error("Get courses error:", error);
      res.status(500).json({ error: "Failed to get courses" });
    }
  });

  // Create new course (top admins only)
  app.post("/api/courses", requireAuth, requireRole(['creator', 'top_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const data = createCourseSchema.parse(req.body) as CreateCourseRequest;

      // Create course
      const course = await storage.createCourse({
        name: data.name,
        description: data.description,
        lecturer: data.lecturer,
        courseRep: data.courseRep,
        createdBy: req.user!.id,
      });

      // Store course credentials securely
      await storage.createCourseCredentials({
        courseId: course.id,
        supabaseUrl: data.supabaseUrl,
        supabaseAnonKey: data.supabaseAnonKey,
        supabaseServiceKey: data.supabaseServiceKey, // Should be encrypted in production
      });

      res.status(201).json(course);
    } catch (error) {
      console.error("Create course error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data" });
      }
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  // Get course details
  app.get("/api/courses/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if user has access to this course
      if (!req.user!.isCreator) {
        const userRoles = await storage.getUserRoles(req.user!.id);
        const isTopAdmin = userRoles.some(role => role.roleType === 'top_admin');
        
        if (!isTopAdmin) {
          const memberships = await storage.getCourseMemberships(req.user!.id);
          const hasAccess = memberships.some(m => m.courseId === course.id && m.status === 'active');
          
          if (!hasAccess) {
            return res.status(403).json({ error: "Access denied to this course" });
          }
        }
      }

      res.json(course);
    } catch (error) {
      console.error("Get course error:", error);
      res.status(500).json({ error: "Failed to get course" });
    }
  });

  // ========================================
  // ROLE MANAGEMENT ROUTES
  // ========================================

  // Assign role to user (creator and top admins only)
  app.post("/api/roles/assign", requireAuth, requireRole(['creator', 'top_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const data = assignRoleSchema.parse(req.body) as AssignRoleRequest;

      // Prevent removal of creator
      if (data.roleType === 'user') {
        const targetUser = await storage.getUserById(data.userId);
        if (targetUser?.isCreator) {
          return res.status(400).json({ error: "Cannot demote the creator" });
        }
      }

      // Create role
      const role = await storage.createRole({
        userId: data.userId,
        roleType: data.roleType,
        scope: data.scope,
        assignedBy: req.user!.id,
      });

      res.status(201).json(role);
    } catch (error) {
      console.error("Assign role error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data" });
      }
      res.status(500).json({ error: "Failed to assign role" });
    }
  });

  // ========================================
  // PLATFORM SETTINGS ROUTES
  // ========================================

  // Get platform settings
  app.get("/api/settings", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const settings = await storage.getAllSettings();
      
      // Return public settings or all settings for admins
      if (!req.user) {
        // Public settings only
        const publicSettings = settings.filter(s => 
          ['platform_name', 'anonymous_hub_enabled'].includes(s.key)
        );
        return res.json(publicSettings);
      }

      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  // Update platform setting (top admins only)
  app.put("/api/settings/:key", requireAuth, requireRole(['creator', 'top_admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const data = updateSettingSchema.parse(req.body) as UpdateSettingRequest;

      const setting = await storage.updateSetting(req.params.key, data.value, req.user!.id);
      res.json(setting);
    } catch (error) {
      console.error("Update setting error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input data" });
      }
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // ========================================
  // NOTIFICATION ROUTES
  // ========================================

  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ error: "Failed to get notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // ========================================
  // GLOBAL PINNED POSTS ROUTES
  // ========================================

  // Get global pinned posts
  app.get("/api/pinned", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const posts = await storage.getGlobalPinnedPosts();
      res.json(posts);
    } catch (error) {
      console.error("Get pinned posts error:", error);
      res.status(500).json({ error: "Failed to get pinned posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}