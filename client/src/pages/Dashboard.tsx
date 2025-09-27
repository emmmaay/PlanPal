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
  
  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    enabled: !!user,
  });

  // Fetch user assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['/api/dashboard/assignments'],
    enabled: !!user,
  });

  // Fetch global leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/leaderboard'],
    enabled: !!user,
  });
  
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

  // Assignment completion mutation
  const toggleAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, courseId, isCompleted }: { assignmentId: string; courseId: string; isCompleted: boolean }) => {
      const response = await fetch(`/api/assignments/${assignmentId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, isCompleted }),
      });
      if (!response.ok) {
        throw new Error('Failed to update assignment completion');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });

  // Use dashboard stats or fallback to calculated values
  const totalCourses = dashboardStats?.totalCourses || courses.length;
  const totalPendingAssignments = dashboardStats?.pendingAssignments || assignments.filter(a => !a.isCompleted).length;
  const completedAssignments = dashboardStats?.completedAssignments || assignments.filter(a => a.isCompleted).length;
  const userRank = dashboardStats?.userRank || leaderboard.find(entry => entry.id === user?.id)?.rank || 0;
  
  const handleToggleAssignmentComplete = async (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    toggleAssignmentMutation.mutate({
      assignmentId,
      courseId: assignment.courseId,
      isCompleted: !assignment.isCompleted,
    });
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
