import { useState } from "react";
import { Search, Plus, TrendingUp, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - todo: remove mock functionality
const mockPosts = [
  {
    id: "post-1",
    author: "student_dev",
    content: "Just finished implementing my first sorting algorithm! The merge sort was challenging but really helped me understand divide and conquer approaches. Anyone have tips for optimizing the space complexity?",
    timestamp: "2 hours ago",
    reactions: 24,
    comments: 8,
    isLiked: false,
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
    id: "post-2",
    author: "alice_coder",
    content: "Can someone explain the difference between abstract classes and interfaces in Java? I'm getting confused with when to use which one.",
    timestamp: "4 hours ago",
    reactions: 15,
    comments: 12,
    isLiked: true,
    isPinned: false,
    isAnonymous: false,
    course: "OOP",
    canPin: false,
    canDelete: false,
  },
  {
    id: "post-3",
    author: "bob_dev",
    content: "Working on my database project and wondering about normalization. Should I always aim for 3NF or are there cases where 2NF is sufficient?",
    timestamp: "6 hours ago",
    reactions: 18,
    comments: 6,
    isLiked: false,
    isPinned: false,
    isAnonymous: false,
    course: "Database Systems",
    canPin: false,
    canDelete: false,
  },
  {
    id: "post-4",
    author: "charlie_prog",
    content: "Great lecture today on network protocols! The OSI model finally makes sense. Has anyone tried implementing a simple TCP client-server application?",
    timestamp: "1 day ago",
    reactions: 32,
    comments: 14,
    isLiked: true,
    isPinned: false,
    isAnonymous: false,
    course: "Networks",
    canPin: false,
    canDelete: false,
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
  {
    id: "4",
    username: "diana_script",
    points: 1890,
    badges: 5,
    rank: 4,
    contributions: 28,
  },
  {
    id: "5",
    username: "student_dev",
    points: 1650,
    badges: 4,
    rank: 5,
    contributions: 24,
  },
];

export default function Discussions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [posts, setPosts] = useState(mockPosts);
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.course && post.course.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterBy === "pinned") {
      return matchesSearch && post.isPinned;
    }
    if (filterBy === "my-posts") {
      return matchesSearch && post.author === "student_dev"; // Current user
    }
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
  
  const totalPosts = posts.length;
  const totalReactions = posts.reduce((total, post) => total + post.reactions, 0);

  return (
    <div className="space-y-6" data-testid="page-discussions">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-discussions-title">
              Discussions
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with classmates, ask questions, and share knowledge.
            </p>
          </div>
          <Button data-testid="button-create-post">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {totalPosts} Total Posts
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {totalReactions} Total Reactions
            </Badge>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts, users, or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-posts"
              />
            </div>
            
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48" data-testid="select-filter-posts">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="pinned">Pinned Posts</SelectItem>
                <SelectItem value="my-posts">My Posts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No posts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Be the first to start a discussion!"}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  {...post}
                  onLike={() => handleLikePost(post.id)}
                  onComment={() => console.log(`Commenting on post ${post.id}`)}
                  onShare={() => console.log(`Sharing post ${post.id}`)}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <LeaderboardCard 
            title="Top Contributors"
            entries={mockLeaderboard}
            maxEntries={10}
          />
          
          {/* Discussion Stats */}
          <div className="bg-card rounded-lg p-4 border">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              This Week
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Posts</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comments</span>
                <span className="font-medium">48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reactions</span>
                <span className="font-medium">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
