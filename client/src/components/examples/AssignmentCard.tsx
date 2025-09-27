import { AssignmentCard } from '../AssignmentCard';
import { ThemeProvider } from '../ThemeProvider';

export default function AssignmentCardExample() {
  const sampleAssignment = {
    id: "assignment-1",
    title: "Binary Search Tree Implementation",
    course: "Data Structures",
    dueDate: "Dec 20, 2024",
    description: "Implement a binary search tree with insert, delete, and search operations.",
    isCompleted: false,
    priority: "high" as const,
    submissionType: "Code",
  };

  return (
    <ThemeProvider>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-md">
          <AssignmentCard {...sampleAssignment} />
        </div>
      </div>
    </ThemeProvider>
  );
}
