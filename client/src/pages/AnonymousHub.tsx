import { useState } from "react";
import { Search, Plus, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data - todo: remove mock functionality
const mockAnonymousPosts = [
  {
    id: "anon-post-1",
    content: "I'm really struggling with the complexity of this semester's workload. Anyone else feeling overwhelmed? Looking for study strategies that actually work.",
    timestamp: "1 hour ago",
    reactions: 42,
    comments: 18,
    isLiked: false,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
  {
    id: "anon-post-2",
    content: "Hot take: Group projects are more about managing personalities than actual coding. Change my mind. 😅",
    timestamp: "3 hours ago",
    reactions: 67,
    comments: 24,
    isLiked: true,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
  {
    id: "anon-post-3",
    content: "Does anyone else feel like they're just pretending to understand programming concepts? Imposter syndrome is real in CS.",
    timestamp: "5 hours ago",
    reactions: 89,
    comments: 31,
    isLiked: false,
    isPinned: true,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
  {
    id: "anon-post-4",
    content: "Unpopular opinion: Some lecturers need to update their teaching methods. We're learning 2024 skills with 2010 approaches.",
    timestamp: "8 hours ago",
    reactions: 156,
    comments: 45,
    isLiked: true,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
  {
    id: "anon-post-5",
    content: "Shoutout to whoever left helpful comments on everyone's GitHub repos. You're the real MVP! 🙌",
    timestamp: "12 hours ago",
    reactions: 34,
    comments: 8,
    isLiked: false,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
  },
];

export default function AnonymousHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState(mockAnonymousPosts);
  const [isHubEnabled, setIsHubEnabled] = useState(true); // Only executives can control this
  
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
  const pinnedPosts = posts.filter(post => post.isPinned).length;

  return (
    <div className="space-y-6" data-testid="page-anonymous-hub">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-anonymous-title">
              <Shield className="h-8 w-8 text-primary" />
              Anonymous Hub
              {isHubEnabled ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Eye className="h-3 w-3 mr-1" />
                  ON
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <EyeOff className="h-3 w-3 mr-1" />
                  OFF
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Share thoughts, ask questions, and connect anonymously with your classmates.
            </p>
          </div>
          {isHubEnabled && (
            <Button data-testid="button-create-anonymous-post">
              <Plus className="h-4 w-4 mr-2" />
              Anonymous Post
            </Button>
          )}
        </div>
      </div>
      
      {/* Hub Status Alert */}
      {!isHubEnabled ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The Anonymous Hub is currently disabled by administrators. You can view existing posts but cannot create new ones.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This is a safe space for anonymous discussions. Be respectful and constructive. All posts are moderated.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {totalPosts} Anonymous Posts
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {totalReactions} Total Reactions
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {pinnedPosts} Pinned
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anonymous posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-anonymous-posts"
            />
          </div>
          
          {/* Posts Feed */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No anonymous posts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Be the first to share anonymously!"}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  {...post}
                  onLike={() => handleLikePost(post.id)}
                  onComment={() => console.log(`Commenting on anonymous post ${post.id}`)}
                  onShare={() => console.log(`Sharing anonymous post ${post.id}`)}
                  onReport={() => console.log(`Reporting anonymous post ${post.id}`)}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Hub Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Be respectful and constructive in your discussions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>No harassment, discrimination, or inappropriate content</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Don't share personal information or attempt to identify others</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Report inappropriate content using the report button</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your identity is completely anonymous. Posts cannot be traced back to your account.
              </p>
              <p>
                All content is moderated by administrators to ensure a safe environment.
              </p>
              <p>
                Executives can toggle the hub on/off and reset discussions when needed.
              </p>
            </CardContent>
          </Card>
          
          {/* Hub Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hub Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">23 posts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Reactions</span>
                <span className="font-medium">{totalReactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-medium">67</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
