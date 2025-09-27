import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, TrendingUp, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/CourseCard";
import { AssignmentCard } from "@/components/AssignmentCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { SelectCourse, SelectNotification, SelectCoursePost, SelectCourseUserStats } from "@shared/schema";





export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<SelectCourse[]>({
    queryKey: ['/api/courses'],
    enabled: !!user,
  });
  
  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<SelectNotification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });
  
  // Fetch pinned posts for announcements
  const { data: pinnedPosts = [] } = useQuery({
    queryKey: ['/api/pinned'],
    enabled: !!user,
  });
  
  // Fetch all course posts (assignments) across courses
  const { data: allCoursePosts = [] } = useQuery<SelectCoursePost[]>({
    queryKey: ['/api/courses/posts/all'],
    queryFn: async () => {
      if (!courses.length) return [];
      
      const allPosts: SelectCoursePost[] = [];
      for (const course of courses) {
        try {
          const response = await fetch(`/api/courses/${course.id}/posts`);
          if (response.ok) {
            const posts = await response.json();
            allPosts.push(...posts.map((post: SelectCoursePost) => ({ ...post, courseName: course.name })));
          }
        } catch (error) {
          console.error(`Failed to fetch posts for course ${course.id}:`, error);
        }
      }
      return allPosts;
    },
    enabled: !!user && courses.length > 0,
  });

  // Fetch user stats across all courses for leaderboard
  const { data: userStats = [] } = useQuery<SelectCourseUserStats[]>({
    queryKey: ['/api/courses/stats/all'],
    queryFn: async () => {
      if (!courses.length) return [];
      
      const allStats: SelectCourseUserStats[] = [];
      for (const course of courses) {
        try {
          const response = await fetch(`/api/courses/${course.id}/leaderboard`);
          if (response.ok) {
            const leaderboard = await response.json();
            allStats.push(...leaderboard);
          }
        } catch (error) {
          console.error(`Failed to fetch stats for course ${course.id}:`, error);
        }
      }
      return allStats;
    },
    enabled: !!user && courses.length > 0,
  });

  // Transform course posts into assignment format
  const assignments = useMemo(() => {
    return allCoursePosts
      .filter(post => post.type === 'assignment')
      .map(post => ({
        id: post.id,
        title: post.title,
        course: (post as any).courseName || 'Unknown Course',
        dueDate: post.deadline ? new Date(post.deadline).toLocaleDateString() : 'No deadline',
        description: post.content,
        isCompleted: false, // TODO: Get from assignment status
        priority: post.deadline && new Date(post.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? "high" as const : "medium" as const,
        submissionType: "Assignment",
      }));
  }, [allCoursePosts]);

  // Create leaderboard from user stats
  const leaderboard = useMemo(() => {
    // Aggregate stats by user
    const userStatsMap = new Map<string, { points: number, assignments: number, posts: number, comments: number }>();
    
    userStats.forEach(stat => {
      const existing = userStatsMap.get(stat.userId) || { points: 0, assignments: 0, posts: 0, comments: 0 };
      userStatsMap.set(stat.userId, {
        points: existing.points + stat.points,
        assignments: existing.assignments + stat.assignmentsCompleted,
        posts: existing.posts + stat.postsCount,
        comments: existing.comments + stat.commentsCount,
      });
    });

    // Convert to leaderboard format and sort by points
    return Array.from(userStatsMap.entries())
      .map(([userId, stats], index) => ({
        id: userId,
        username: userId === user?.id ? user.username : `User ${userId.slice(0, 8)}`,
        points: stats.points,
        badges: Math.floor(stats.points / 100), // 1 badge per 100 points
        rank: index + 1,
        contributions: stats.posts + stats.comments,
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [userStats, user]);
  
  // Mark notification as read mutation
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  // Calculate stats
  const totalCourses = courses.length;
  const totalPendingAssignments = assignments.filter(a => !a.isCompleted).length;
  const completedAssignments = assignments.filter(a => a.isCompleted).length;
  const userRank = leaderboard.find(entry => entry.id === user?.id)?.rank || 0;
  
  const handleToggleAssignmentComplete = async (assignmentId: string) => {
    // TODO: Implement assignment completion API call
    // For now, this is handled in individual course pages
    console.log('Assignment completion to be handled in course-specific pages');
  };
  
  const handleMarkNotificationAsRead = (notificationId: string) => {
    markNotificationReadMutation.mutate(notificationId);
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back, {user?.username || 'Student'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your overview for YCT ND1 Computer Science program.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-courses">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-pending-assignments">{totalPendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-completed-assignments">{completedAssignments}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Rank</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-user-rank">#{userRank}</div>
            <p className="text-xs text-muted-foreground">In class leaderboard</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Courses & Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-active-courses-title">
                Active Courses
              </h2>
              <Badge variant="secondary">{totalCourses} enrolled</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coursesLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading courses...</p>
                </div>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    id={course.id}
                    title={course.name}
                    lecturer={course.lecturer || 'TBA'}
                    courseRep={course.courseRep || 'TBA'}
                    description={course.description || ''}
                    assignmentCount={0} // TODO: Get from course-specific DB
                    pendingAssignments={0} // TODO: Get from course-specific DB
                    studentsCount={0} // TODO: Get from course memberships
                    nextDeadline="TBA" // TODO: Get from course-specific DB
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No courses available yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Assignments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-recent-assignments-title">
                Recent Assignments
              </h2>
              <Badge variant="secondary">{assignments.length} total</Badge>
            </div>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id} 
                  {...assignment} 
                  onToggleComplete={() => handleToggleAssignmentComplete(assignment.id)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Notifications & Leaderboard */}
        <div className="space-y-6">
          <NotificationPanel 
            notifications={notifications.map(n => ({
              id: n.id,
              type: n.type as "assignment" | "post" | "reaction" | "deadline" | "system",
              title: n.title,
              message: n.message,
              timestamp: new Date(n.createdAt).toLocaleString(),
              isRead: n.isRead,
              course: undefined, // TODO: Add course info when we have per-course data
            }))}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={() => {/* TODO: Mark all as read API call */}}
          />
          
          <LeaderboardCard 
            title="Class Leaderboard"
            entries={leaderboard.slice(0, 5)}
            maxEntries={5}
          />
        </div>
      </div>
    </div>
  );
}
