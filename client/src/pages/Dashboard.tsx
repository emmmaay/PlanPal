import { useState } from "react";
import { Calendar, TrendingUp, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/CourseCard";
import { AssignmentCard } from "@/components/AssignmentCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { Badge } from "@/components/ui/badge";

// Mock data - todo: remove mock functionality
const mockCourses = [
  {
    id: "cs101",
    title: "Data Structures & Algorithms",
    lecturer: "Dr. John Smith",
    courseRep: "Alice Johnson",
    assignmentCount: 8,
    pendingAssignments: 2,
    studentsCount: 45,
    nextDeadline: "Dec 15",
    description: "Learn fundamental data structures and algorithms essential for computer science.",
  },
  {
    id: "cs102",
    title: "Object-Oriented Programming",
    lecturer: "Prof. Sarah Wilson",
    courseRep: "Bob Chen",
    assignmentCount: 6,
    pendingAssignments: 1,
    studentsCount: 52,
    nextDeadline: "Dec 18",
    description: "Master OOP concepts with Java and design patterns.",
  },
  {
    id: "cs103",
    title: "Database Systems",
    lecturer: "Dr. Michael Brown",
    courseRep: "Carol Davis",
    assignmentCount: 5,
    pendingAssignments: 0,
    studentsCount: 38,
    description: "Database design, SQL, and modern database technologies.",
  },
];

const mockAssignments = [
  {
    id: "assignment-1",
    title: "Binary Search Tree Implementation",
    course: "Data Structures",
    dueDate: "Dec 20, 2024",
    description: "Implement a binary search tree with insert, delete, and search operations.",
    isCompleted: false,
    priority: "high" as const,
    submissionType: "Code",
  },
  {
    id: "assignment-2",
    title: "Java GUI Application",
    course: "OOP",
    dueDate: "Dec 22, 2024",
    description: "Create a desktop application using Swing with MVC pattern.",
    isCompleted: false,
    priority: "medium" as const,
    submissionType: "Project",
  },
];

const mockNotifications = [
  {
    id: "1",
    type: "assignment" as const,
    title: "New Assignment Posted",
    message: "Dr. Smith has posted a new assignment: Binary Tree Traversal",
    timestamp: "2 hours ago",
    isRead: false,
    course: "Data Structures",
  },
  {
    id: "2",
    type: "deadline" as const,
    title: "Assignment Due Soon",
    message: "Your assignment 'Graph Algorithms' is due in 2 days",
    timestamp: "1 day ago",
    isRead: false,
    course: "Algorithms",
  },
];

const mockLeaderboard = [
  {
    id: "1",
    username: "alice_coder",
    points: 2850,
    badges: 12,
    rank: 1,
    contributions: 45,
  },
  {
    id: "2",
    username: "bob_dev",
    points: 2340,
    badges: 8,
    rank: 2,
    contributions: 38,
  },
  {
    id: "3",
    username: "charlie_prog",
    points: 2100,
    badges: 6,
    rank: 3,
    contributions: 32,
  },
];

export default function Dashboard() {
  const [assignments, setAssignments] = useState(mockAssignments);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const totalPendingAssignments = mockCourses.reduce((total, course) => total + course.pendingAssignments, 0);
  const totalCourses = mockCourses.length;
  const completedAssignments = assignments.filter(a => a.isCompleted).length;
  
  const handleToggleAssignmentComplete = (assignmentId: string) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, isCompleted: !assignment.isCompleted }
          : assignment
      )
    );
  };
  
  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back, Student!
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
            <div className="text-2xl font-bold" data-testid="stat-user-rank">#12</div>
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
              {mockCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
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
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
          />
          
          <LeaderboardCard 
            title="Class Leaderboard"
            entries={mockLeaderboard}
            maxEntries={5}
          />
        </div>
      </div>
    </div>
  );
}
