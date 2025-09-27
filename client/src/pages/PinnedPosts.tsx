import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Pin, 
  Plus, 
  Settings, 
  Megaphone, 
  Filter,
  PinOff,
  Shield,
  Globe,
  BookOpen,
  Trash2,
  Edit
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Global announcement creation schema
const createAnnouncementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(2000, "Content too long"),
  type: z.enum(["global", "course"]).default("global"),
  course: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  expiresAt: z.string().optional(),
});

type CreateAnnouncementFormData = z.infer<typeof createAnnouncementSchema>;

// Mock pinned posts data with enhanced properties
const mockPinnedPosts = [
  {
    id: "pinned-1",
    author: "admin_user",
    title: "Final Exam Schedule Update",
    content: "📢 Important: Final exam schedule has been updated. Check your course pages for the latest information. Make sure to review the new exam guidelines and room assignments.",
    timestamp: "2 days ago",
    reactions: 156,
    comments: 24,
    isLiked: false,
    isPinned: true,
    isAnonymous: false,
    course: undefined, // Global announcement
    canPin: true,
    canDelete: true,
    type: "global",
    priority: "urgent",
    pinnedBy: "admin_user",
    pinnedAt: "2024-12-25T10:00:00Z",
    expiresAt: "2024-12-30T23:59:59Z",
  },
  {
    id: "pinned-2",
    author: "course_admin",
    title: "Database Project Guidelines",
    content: "Important updates for the Database Systems final project. New submission requirements and deadline extension to January 15th. Please read the updated rubric carefully.",
    timestamp: "1 week ago",
    reactions: 89,
    comments: 32,
    isLiked: true,
    isPinned: true,
    isAnonymous: false,
    course: "Database Systems",
    canPin: true,
    canDelete: true,
    type: "course",
    priority: "high",
    pinnedBy: "course_admin",
    pinnedAt: "2024-12-20T14:30:00Z",
  },
  {
    id: "pinned-3",
    author: "student_rep",
    title: "Study Group Formation",
    content: "Study group forming for Algorithms final exam. We'll be meeting every Tuesday and Thursday at 6 PM in the library. DM me if interested! We have study materials and practice problems.",
    timestamp: "1 week ago",
    reactions: 67,
    comments: 18,
    isLiked: false,
    isPinned: true,
    isAnonymous: false,
    course: "Algorithms",
    canPin: true,
    canDelete: false, // Student post, admin can only unpin
    type: "course",
    priority: "medium",
    pinnedBy: "admin_user",
    pinnedAt: "2024-12-19T09:15:00Z",
  },
];

// Admin announcement creation dialog
function CreateAnnouncementDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<CreateAnnouncementFormData>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'global',
      priority: 'medium',
    },
  });

  const watchType = form.watch('type');

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: CreateAnnouncementFormData) => {
      // TODO: Replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Date.now().toString(),
        author: user?.username || 'admin',
        title: data.title,
        content: data.content,
        timestamp: 'Just now',
        reactions: 0,
        comments: 0,
        isLiked: false,
        isPinned: true,
        isAnonymous: false,
        course: data.type === 'course' ? data.course : undefined,
        canPin: true,
        canDelete: true,
        type: data.type,
        priority: data.priority,
        pinnedBy: user?.username || 'admin',
        pinnedAt: new Date().toISOString(),
        expiresAt: data.expiresAt,
      };
    },
    onSuccess: () => {
      toast({ title: 'Announcement created successfully!' });
      form.reset();
      onOpenChange(false);
      // TODO: Invalidate pinned posts query
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to create announcement', 
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: CreateAnnouncementFormData) => {
    createAnnouncementMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Create Global Announcement
          </DialogTitle>
          <DialogDescription>
            Create important announcements that will be pinned across the platform.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select announcement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Global Announcement
                        </div>
                      </SelectItem>
                      <SelectItem value="course">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Course-Specific
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchType === 'course' && (
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Database Systems, Algorithms" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify which course this announcement is for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief, descriptive title for your announcement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed announcement content. Be clear and include all necessary information..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed prominently to all relevant users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    When should this announcement be automatically unpinned?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAnnouncementMutation.isPending}>
                {createAnnouncementMutation.isPending ? 'Creating...' : 'Create Announcement'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Pin management component for individual posts
function PinManagement({ post, onPin, onUnpin, onDelete }: { 
  post: any; 
  onPin: () => void; 
  onUnpin: () => void; 
  onDelete: () => void; 
}) {
  const { user } = useAuth();
  const isAdmin = user?.isCreator || false; // TODO: Check for top_admin role
  
  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      {post.isPinned ? (
        <Button
          size="sm"
          variant="outline"
          onClick={onUnpin}
          className="text-orange-600 hover:text-orange-700"
        >
          <PinOff className="h-4 w-4 mr-2" />
          Unpin
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={onPin}
          className="text-blue-600 hover:text-blue-700"
        >
          <Pin className="h-4 w-4 mr-2" />
          Pin Post
        </Button>
      )}
      
      {post.canDelete && (
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </div>
  );
}

export default function PinnedPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [posts, setPosts] = useState(mockPinnedPosts);
  
  const isAdmin = user?.isCreator || false; // TODO: Check for top_admin role
  
  // TODO: Replace with real API calls
  // const { data: pinnedPosts = [], isLoading } = useQuery({
  //   queryKey: ['/api/pinned-posts'],
  // });
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = (post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.author && post.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (post.course && post.course.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterBy === "global") {
      return matchesSearch && post.type === "global";
    }
    if (filterBy === "course") {
      return matchesSearch && post.type === "course";
    }
    if (filterBy === "urgent") {
      return matchesSearch && post.priority === "urgent";
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

  const handlePinPost = (postId: string) => {
    // TODO: Replace with real API call
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isPinned: true,
              pinnedBy: user?.username || 'admin',
              pinnedAt: new Date().toISOString()
            }
          : post
      )
    );
    toast({ title: 'Post pinned successfully!' });
  };

  const handleUnpinPost = (postId: string) => {
    // TODO: Replace with real API call
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isPinned: false,
              pinnedBy: '',
              pinnedAt: ''
            }
          : post
      )
    );
    toast({ title: 'Post unpinned successfully!' });
  };

  const handleDeletePost = (postId: string) => {
    // TODO: Replace with real API call
    setPosts(prev => prev.filter(post => post.id !== postId));
    toast({ title: 'Post deleted successfully!' });
  };
  
  const totalReactions = posts.reduce((total, post) => total + post.reactions, 0);
  const globalPosts = posts.filter(post => post.type === "global").length;
  const coursePosts = posts.filter(post => post.type === "course").length;
  const urgentPosts = posts.filter(post => post.priority === "urgent").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "low": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6" data-testid="page-pinned-posts">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-pinned-title">
              <Pin className="h-8 w-8 text-primary" />
              Pinned Posts & Announcements
            </h1>
            <p className="text-muted-foreground mt-2">
              Important announcements and highlighted discussions from administrators and the community.
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-create-announcement"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          )}
        </div>
      </div>
      
      {/* Admin Controls */}
      {isAdmin && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Shield className="h-5 w-5" />
              Admin Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              As a Top Admin, you can create global announcements, pin/unpin any post, and manage all pinned content across the platform.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                Global Announcement
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => console.log('Bulk management')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Bulk Management
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          {posts.length} Total Pinned
        </Badge>
        <Badge variant="secondary" className="text-sm">
          <Globe className="h-3 w-3 mr-1" />
          {globalPosts} Global
        </Badge>
        <Badge variant="secondary" className="text-sm">
          <BookOpen className="h-3 w-3 mr-1" />
          {coursePosts} Course-Specific
        </Badge>
        {urgentPosts > 0 && (
          <Badge variant="destructive" className="text-sm">
            {urgentPosts} Urgent
          </Badge>
        )}
        <Badge variant="outline" className="text-sm">
          {totalReactions} Total Reactions
        </Badge>
      </div>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pinned posts and announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-pinned-posts"
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="global">Global Announcements</SelectItem>
            <SelectItem value="course">Course-Specific</SelectItem>
            <SelectItem value="urgent">Urgent Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Pin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No pinned posts found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "No announcements have been pinned yet."}
            </p>
            {isAdmin && !searchTerm && (
              <Button 
                className="mt-4" 
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Announcement
              </Button>
            )}
          </div>
        ) : (
          <div className="max-w-4xl space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative">
                {/* Priority and Type Indicators */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getPriorityColor(post.priority)}>
                    {post.priority.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {post.type === "global" ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Global
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-3 w-3 mr-1" />
                        {post.course}
                      </>
                    )}
                  </Badge>
                  {post.pinnedBy && (
                    <Badge variant="secondary" className="text-xs">
                      Pinned by {post.pinnedBy}
                    </Badge>
                  )}
                </div>
                
                <PostCard 
                  {...post}
                  onLike={() => handleLikePost(post.id)}
                  onComment={() => console.log(`Commenting on pinned post ${post.id}`)}
                  onShare={() => console.log(`Sharing pinned post ${post.id}`)}
                />
                
                {/* Admin Controls */}
                {isAdmin && (
                  <div className="mt-2 flex justify-end">
                    <PinManagement
                      post={post}
                      onPin={() => handlePinPost(post.id)}
                      onUnpin={() => handleUnpinPost(post.id)}
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Announcement Dialog */}
      <CreateAnnouncementDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}