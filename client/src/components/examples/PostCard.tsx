import { PostCard } from '../PostCard';
import { ThemeProvider } from '../ThemeProvider';

export default function PostCardExample() {
  const samplePost = {
    id: "post-1",
    author: "student_dev",
    content: "Just finished implementing my first sorting algorithm! The merge sort was challenging but really helped me understand divide and conquer approaches. Anyone have tips for optimizing the space complexity?",
    timestamp: "2 hours ago",
    reactions: 24,
    comments: 8,
    isLiked: true,
    isPinned: false,
    isAnonymous: false,
    course: "Algorithms",
    canPin: true,
    canDelete: false,
    media: [
      {
        type: "document" as const,
        url: "/uploads/mergesort.py",
        name: "mergesort.py",
      },
    ],
  };

  return (
    <ThemeProvider>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-lg">
          <PostCard {...samplePost} />
        </div>
      </div>
    </ThemeProvider>
  );
}
