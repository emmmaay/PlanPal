import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, TrendingUp, Filter, MessageSquare, Users, Award, Image, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

// Post creation schema
const createPostSchema = z.object({
  content: z.string().min(10, "Post content must be at least 10 characters"),
  course: z.string().optional(),
  type: z.enum(["discussion", "question", "announcement"]).default("discussion"),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

// Mock data for now - will be replaced with real API calls
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
];

// Post creation dialog component
function CreatePostDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      type: 'discussion',
    },
  });

  // TODO: Replace with real API call
  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        author: user?.username || 'unknown',
        content: data.content,
        timestamp: 'Just now',
        reactions: 0,
        comments: 0,
        isLiked: false,
        isPinned: false,
        isAnonymous: false,
        course: data.course,
        canPin: false,
        canDelete: true,
      };
    },
    onSuccess: () => {
      // TODO: Invalidate posts query when real API is implemented
      toast({ title: 'Post created successfully!' });
      form.reset();
      setSelectedFiles([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create post', 
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: CreatePostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a discussion with your classmates.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select post type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Data Structures, OOP" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link this post to a specific course for better organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's on your mind? Share your thoughts, ask questions, or start a discussion..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* File Upload Section */}
            <div className="border p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Attachments</h4>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Image className="h-4 w-4 mr-2" />
                      Images
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </label>
                  </Button>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <File className="h-4 w-4 mr-2" />
                      Files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.py,.js,.java,.cpp,.c"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                You can upload up to 5 files. Supported: Images, PDFs, documents, code files.
              </p>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? 'Posting...' : 'Create Post'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Discussions() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [posts, setPosts] = useState(mockPosts);
  
  // TODO: Replace with real API calls
  // const { data: posts = [], isLoading: postsLoading } = useQuery({
  //   queryKey: ['/api/discussions/posts'],
  //   enabled: !!user,
  // });
  
  // Mock leaderboard - will be replaced with real data
  const mockLeaderboard = [
    {
      id: "1",
      username: user?.username || "alice_coder",
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
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.course && post.course.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterBy === "pinned") {
      return matchesSearch && post.isPinned;
    }
    if (filterBy === "my-posts") {
      return matchesSearch && post.author === user?.username;
    }
    return matchesSearch;
  });
  
  const handleLikePost = async (postId: string) => {
    // TODO: Replace with real API call
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
  const userRank = mockLeaderboard.find(entry => entry.username === user?.username)?.rank || 6;

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
              Connect with classmates, ask questions, and share knowledge. Your identity is shown to build community.
            </p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            data-testid="button-create-post"
          >
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
            <Badge variant="outline" className="text-sm">
              My Rank: #{userRank}
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
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No posts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Be the first to start a discussion!"}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Posts
                </span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Comments
                </span>
                <span className="font-semibold">48</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Reactions
                </span>
                <span className="font-semibold">156</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discussion Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">• Be respectful and constructive</p>
              <p className="text-muted-foreground">• Use clear, descriptive titles</p>
              <p className="text-muted-foreground">• Include relevant course context</p>
              <p className="text-muted-foreground">• Help others by sharing knowledge</p>
              <p className="text-muted-foreground">• React and comment to engage</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Post Creation Dialog */}
      <CreatePostDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}