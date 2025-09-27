import { useState } from "react";
import { Search, Pin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";

// Mock data - todo: remove mock functionality
const mockPinnedPosts = [
  {
    id: "pinned-1",
    author: "admin_user",
    content: "📢 Important: Final exam schedule has been updated. Check your course pages for the latest information. Make sure to review the new exam guidelines.",
    timestamp: "2 days ago",
    reactions: 156,
    comments: 24,
    isLiked: false,
    isPinned: true,
    isAnonymous: false,
    course: "General",
    canPin: false,
    canDelete: false,
  },
  {
    id: "pinned-2",
    author: "student_dev",
    content: "Just finished implementing my first sorting algorithm! The merge sort was challenging but really helped me understand divide and conquer approaches. Anyone have tips for optimizing the space complexity?",
    timestamp: "1 week ago",
    reactions: 89,
    comments: 32,
    isLiked: true,
    isPinned: true,
    isAnonymous: false,
    course: "Algorithms",
    canPin: false,
    canDelete: false,
    media: [
      {
        type: "document" as const,
        url: "/uploads/mergesort.py",
        name: "mergesort.py",
      },
    ],
  },
  {
    id: "pinned-3",
    content: "Does anyone else feel like they're just pretending to understand programming concepts? Imposter syndrome is real in CS.",
    timestamp: "1 week ago",
    reactions: 145,
    comments: 67,
    isLiked: false,
    isPinned: true,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
  {
    id: "pinned-4",
    author: "course_rep",
    content: "Study group forming for Database Systems final exam. We'll be meeting every Tuesday and Thursday at 6 PM in the library. DM me if interested!",
    timestamp: "2 weeks ago",
    reactions: 67,
    comments: 18,
    isLiked: true,
    isPinned: true,
    isAnonymous: false,
    course: "Database Systems",
    canPin: false,
    canDelete: false,
  },
];

export default function PinnedPosts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState(mockPinnedPosts);
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.author && post.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (post.course && post.course.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });
  
  const handleLikePost = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              reactions: post.isLiked ? post.reactions - 1 : post.reactions + 1
            }
          : post
      )
    );
  };
  
  const totalReactions = posts.reduce((total, post) => total + post.reactions, 0);
  const anonymousPosts = posts.filter(post => post.isAnonymous).length;
  const publicPosts = posts.filter(post => !post.isAnonymous).length;

  return (
    <div className="space-y-6" data-testid="page-pinned-posts">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-pinned-title">
          <Pin className="h-8 w-8 text-primary" />
          Pinned Posts
        </h1>
        <p className="text-muted-foreground mt-2">
          Important announcements and highlighted discussions from administrators and the community.
        </p>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="text-sm">
          {posts.length} Pinned Posts
        </Badge>
        <Badge variant="secondary" className="text-sm">
          {publicPosts} Public
        </Badge>
        <Badge variant="secondary" className="text-sm">
          {anonymousPosts} Anonymous
        </Badge>
        <Badge variant="secondary" className="text-sm">
          {totalReactions} Total Reactions
        </Badge>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pinned posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-pinned-posts"
        />
      </div>
      
      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Pin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No pinned posts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Administrators haven't pinned any posts yet."}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl">
            {filteredPosts.map((post) => (
              <div key={post.id} className="mb-4">
                <PostCard 
                  {...post}
                  onLike={() => handleLikePost(post.id)}
                  onComment={() => console.log(`Commenting on pinned post ${post.id}`)}
                  onShare={() => console.log(`Sharing pinned post ${post.id}`)}
                  onReport={() => console.log(`Reporting pinned post ${post.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
