import { CourseCard } from '../CourseCard';
import { ThemeProvider } from '../ThemeProvider';

export default function CourseCardExample() {
  const sampleCourse = {
    id: "cs101",
    title: "Data Structures & Algorithms",
    lecturer: "Dr. John Smith",
    courseRep: "Alice Johnson",
    assignmentCount: 8,
    pendingAssignments: 2,
    studentsCount: 45,
    nextDeadline: "Dec 15",
    description: "Learn fundamental data structures and algorithms essential for computer science.",
  };

  return (
    <ThemeProvider>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-md">
          <CourseCard {...sampleCourse} />
        </div>
      </div>
    </ThemeProvider>
  );
}
