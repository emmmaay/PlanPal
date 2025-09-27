import { NotificationPanel } from '../NotificationPanel';
import { ThemeProvider } from '../ThemeProvider';

export default function NotificationPanelExample() {
  const sampleNotifications = [
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
    {
      id: "3",
      type: "post" as const,
      title: "New Discussion Post",
      message: "Someone commented on your post about recursion",
      timestamp: "3 days ago",
      isRead: true,
    },
  ];

  return (
    <ThemeProvider>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-lg">
          <NotificationPanel notifications={sampleNotifications} />
        </div>
      </div>
    </ThemeProvider>
  );
}
