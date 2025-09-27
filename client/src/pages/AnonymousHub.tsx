import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Settings, 
  Power, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Shield,
  AlertTriangle,
  Clock,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { z } from "zod";

// Anonymous post creation schema
const createAnonymousPostSchema = z.object({
  content: z.string().min(10, "Post content must be at least 10 characters").max(1000, "Post too long"),
  type: z.enum(["thought", "question", "confession", "advice"]).default("thought"),
});

type CreateAnonymousPostFormData = z.infer<typeof createAnonymousPostSchema>;

// Admin settings schema
const adminSettingsSchema = z.object({
  anonymousHubEnabled: z.boolean(),
  postCooldownMinutes: z.number().min(0).max(1440).default(5),
  moderationEnabled: z.boolean().default(true),
});

type AdminSettingsFormData = z.infer<typeof adminSettingsSchema>;

// Mock data for anonymous posts
const mockAnonymousPosts = [
  {
    id: "anon-1",
    author: "Anonymous",
    content: "I'm struggling with imposter syndrome in my computer science program. Sometimes I feel like everyone else understands concepts faster than me. Anyone else feeling this way?",
    timestamp: "3 hours ago",
    reactions: 45,
    comments: 12,
    isLiked: false,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
    type: "confession",
  },
  {
    id: "anon-2",
    author: "Anonymous",
    content: "Quick question - what's the best way to approach algorithm problems? Should I focus on understanding the theory first or jump straight into coding practice?",
    timestamp: "5 hours ago",
    reactions: 23,
    comments: 8,
    isLiked: true,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
    type: "question",
  },
  {
    id: "anon-3",
    author: "Anonymous",
    content: "Just wanted to share that I finally understand recursion! It clicked after drawing out the call stack for the 100th time. Don't give up if you're struggling with it.",
    timestamp: "1 day ago",
    reactions: 67,
    comments: 15,
    isLiked: false,
    isPinned: false,
    isAnonymous: true,
    canPin: false,
    canDelete: false,
    type: "advice",
  },
];

// Mock admin settings - will be replaced with real API
const mockAdminSettings = {
  anonymousHubEnabled: true,
  postCooldownMinutes: 5,
  moderationEnabled: true,
  lastResetTime: "2024-12-27T12:00:00Z",
};

// Anonymous post creation dialog
function CreateAnonymousPostDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [lastPostTime, setLastPostTime] = useState<Date | null>(null);
  
  const form = useForm<CreateAnonymousPostFormData>({
    resolver: zodResolver(createAnonymousPostSchema),
    defaultValues: {
      content: '',
      type: 'thought',
    },
  });

  // Calculate cooldown remaining
  const cooldownMinutes = 5; // TODO: Get from admin settings
  const canPost = !lastPostTime || (Date.now() - lastPostTime.getTime()) > (cooldownMinutes * 60 * 1000);
  const cooldownRemaining = lastPostTime 
    ? Math.max(0, cooldownMinutes * 60 - Math.floor((Date.now() - lastPostTime.getTime()) / 1000))
    : 0;

  // TODO: Replace with real API call
  const createPostMutation = useMutation({
    mutationFn: async (data: CreateAnonymousPostFormData) => {
      if (!canPost) {
        throw new Error(`Please wait ${Math.ceil(cooldownRemaining / 60)} more minutes before posting again`);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastPostTime(new Date());
      return {
        id: Date.now().toString(),
        author: "Anonymous",
        content: data.content,
        timestamp: 'Just now',
        reactions: 0,
        comments: 0,
        isLiked: false,
        isPinned: false,
        isAnonymous: true,
        canPin: false,
        canDelete: false,
        type: data.type,
      };
    },
    onSuccess: () => {
      toast({ title: 'Anonymous post created successfully!' });
      form.reset();
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

  const onSubmit = (data: CreateAnonymousPostFormData) => {
    createPostMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Create Anonymous Post
          </DialogTitle>
          <DialogDescription>
            Share your thoughts anonymously. Your identity will never be revealed to other users.
          </DialogDescription>
        </DialogHeader>
        
        {!canPost && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Cooldown Active</AlertTitle>
            <AlertDescription>
              You can post again in {Math.ceil(cooldownRemaining / 60)} minutes to prevent spam.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="thought">Random Thought</SelectItem>
                      <SelectItem value="question">Anonymous Question</SelectItem>
                      <SelectItem value="confession">Confession</SelectItem>
                      <SelectItem value="advice">Advice/Tip</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Anonymous Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts anonymously... Remember to be respectful and constructive."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Max 1000 characters. Your post will be completely anonymous.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPostMutation.isPending || !canPost}>
                {createPostMutation.isPending ? 'Posting...' : 'Post Anonymously'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Admin controls component
function AdminControls() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Check if user is admin (creator or top admin)
  const isAdmin = user?.isCreator || false; // TODO: Check for top_admin role
  
  const form = useForm<AdminSettingsFormData>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: mockAdminSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AdminSettingsFormData) => {
      // TODO: Replace with real API call to update platform settings
      await new Promise(resolve => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Settings updated successfully!' });
      setSettingsOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    },
  });

  const resetTimerMutation = useMutation({
    mutationFn: async () => {
      // TODO: Replace with real API call to reset posting timers
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast({ title: 'Posting timers reset for all users!' });
    },
    onError: () => {
      toast({ title: 'Failed to reset timers', variant: 'destructive' });
    },
  });

  if (!isAdmin) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Shield className="h-5 w-5" />
          Admin Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Anonymous Hub Status</span>
          <div className="flex items-center gap-2">
            <Badge variant={mockAdminSettings.anonymousHubEnabled ? "default" : "secondary"}>
              {mockAdminSettings.anonymousHubEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => resetTimerMutation.mutate()}
            disabled={resetTimerMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All Timers
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Last timer reset: {new Date(mockAdminSettings.lastResetTime).toLocaleString()}
        </p>
      </CardContent>
      
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anonymous Hub Settings</DialogTitle>
            <DialogDescription>
              Control the anonymous posting system for all users.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateSettingsMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="anonymousHubEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Enable Anonymous Hub</FormLabel>
                      <FormDescription>
                        Allow users to create anonymous posts
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="postCooldownMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Cooldown (Minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="1440"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum time between posts per user (0-1440 minutes)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="moderationEnabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Enable Moderation</FormLabel>
                      <FormDescription>
                        Auto-moderate inappropriate content
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function AnonymousHub() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [posts, setPosts] = useState(mockAnonymousPosts);
  
  // Check if anonymous hub is enabled
  const isEnabled = mockAdminSettings.anonymousHubEnabled;
  const isAdmin = user?.isCreator || false; // TODO: Check for top_admin role
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === "questions") {
      return matchesSearch && post.type === "question";
    }
    if (filterBy === "confessions") {
      return matchesSearch && post.type === "confession";
    }
    if (filterBy === "advice") {
      return matchesSearch && post.type === "advice";
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

  return (
    <div className="space-y-6" data-testid="page-anonymous-hub">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-anonymous-title">
              <EyeOff className="h-8 w-8" />
              Anonymous Hub
              {!isEnabled && <Badge variant="secondary">Disabled</Badge>}
            </h1>
            <p className="text-muted-foreground mt-2">
              A safe space to share thoughts anonymously. Your identity is completely protected.
            </p>
          </div>
          {isEnabled && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              data-testid="button-create-anonymous-post"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Anonymously
            </Button>
          )}
        </div>
      </div>
      
      {/* Admin Controls */}
      <AdminControls />
      
      {/* Hub Disabled State */}
      {!isEnabled && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Anonymous Hub Disabled</AlertTitle>
          <AlertDescription>
            The anonymous posting feature has been disabled by administrators. 
            {isAdmin && " You can enable it using the admin controls above."}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main Content */}
      {isEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Posts Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {totalPosts} Anonymous Posts
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {totalReactions} Total Reactions
              </Badge>
              <Badge variant="outline" className="text-sm">
                100% Anonymous
              </Badge>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anonymous posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-anonymous-posts"
                />
              </div>
              
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="questions">Questions</SelectItem>
                  <SelectItem value="confessions">Confessions</SelectItem>
                  <SelectItem value="advice">Advice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Posts Feed */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <EyeOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No anonymous posts found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm ? `Try adjusting your search for "${searchTerm}"` : "Be the first to share something anonymously!"}
                  </p>
                  {!searchTerm && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Anonymous Post
                    </Button>
                  )}
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    {...post}
                    onLike={() => handleLikePost(post.id)}
                    onComment={() => console.log(`Commenting on anonymous post ${post.id}`)}
                    onShare={() => console.log(`Sharing anonymous post ${post.id}`)}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Anonymous Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Anonymous Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-semibold">8 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold">42 posts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Reactions</span>
                  <span className="font-semibold">{totalReactions}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Anonymous Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anonymous Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">• Your identity is completely protected</p>
                <p className="text-muted-foreground">• Be respectful and constructive</p>
                <p className="text-muted-foreground">• No personal attacks or harassment</p>
                <p className="text-muted-foreground">• Avoid sharing personal information</p>
                <p className="text-muted-foreground">• Help create a supportive environment</p>
              </CardContent>
            </Card>
            
            {/* Report System */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Safety & Reporting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  If you see inappropriate content, use the report button on any post. 
                  Our moderation system will review it promptly.
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Anonymous Post Creation Dialog */}
      <CreateAnonymousPostDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}