import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Plus, 
  Settings, 
  UserCheck, 
  UserX, 
  Shield, 
  Crown, 
  User,
  Filter,
  MoreVertical,
  UserPlus,
  Ban,
  Check,
  X,
  Calendar,
  Activity,
  TrendingUp,
  Users2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

// Role assignment schema
const assignRoleSchema = z.object({
  userId: z.string(),
  roleType: z.enum(["user", "course_admin", "top_admin"]),
  scope: z.string().optional(),
});

type AssignRoleFormData = z.infer<typeof assignRoleSchema>;

// Mock users data - will be replaced with real API calls
const mockUsers = [
  {
    id: "user-1",
    username: "alice_coder",
    email: "alice@university.edu",
    isCreator: false,
    isBanned: false,
    createdAt: "2024-01-15T10:30:00Z",
    lastActive: "2024-12-27T14:20:00Z",
    roles: [{ roleType: "top_admin", scope: null, assignedBy: "creator", assignedAt: "2024-01-20T09:00:00Z" }],
    stats: {
      totalPosts: 42,
      totalReactions: 186,
      coursesEnrolled: 4,
      badgesEarned: 8,
    },
  },
  {
    id: "user-2",
    username: "bob_dev",
    email: "bob@university.edu",
    isCreator: false,
    isBanned: false,
    createdAt: "2024-01-22T08:15:00Z",
    lastActive: "2024-12-27T11:45:00Z",
    roles: [
      { roleType: "course_admin", scope: "Database Systems", assignedBy: "creator", assignedAt: "2024-02-01T10:00:00Z" },
      { roleType: "course_admin", scope: "Algorithms", assignedBy: "alice_coder", assignedAt: "2024-03-15T14:30:00Z" }
    ],
    stats: {
      totalPosts: 28,
      totalReactions: 94,
      coursesEnrolled: 3,
      badgesEarned: 5,
    },
  },
  {
    id: "user-3",
    username: "charlie_prog",
    email: "charlie@university.edu",
    isCreator: false,
    isBanned: false,
    createdAt: "2024-02-10T16:20:00Z",
    lastActive: "2024-12-26T19:10:00Z",
    roles: [{ roleType: "user", scope: null, assignedBy: "system", assignedAt: "2024-02-10T16:20:00Z" }],
    stats: {
      totalPosts: 15,
      totalReactions: 67,
      coursesEnrolled: 2,
      badgesEarned: 3,
    },
  },
  {
    id: "user-4",
    username: "diana_script",
    email: "diana@university.edu",
    isCreator: false,
    isBanned: true,
    createdAt: "2024-03-05T12:00:00Z",
    lastActive: "2024-12-20T08:30:00Z",
    roles: [{ roleType: "user", scope: null, assignedBy: "system", assignedAt: "2024-03-05T12:00:00Z" }],
    stats: {
      totalPosts: 3,
      totalReactions: 12,
      coursesEnrolled: 1,
      badgesEarned: 1,
    },
  },
];

// Role assignment dialog
function RoleAssignmentDialog({ 
  open, 
  onOpenChange, 
  user 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  user: any;
}) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const form = useForm<AssignRoleFormData>({
    resolver: zodResolver(assignRoleSchema),
    defaultValues: {
      userId: user?.id || '',
      roleType: 'user',
    },
  });

  const watchRoleType = form.watch('roleType');

  const assignRoleMutation = useMutation({
    mutationFn: async (data: AssignRoleFormData) => {
      // TODO: Replace with real API call
      const response = await fetch('/api/roles/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // TODO: Get from auth context
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign role');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Role assigned successfully!' });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to assign role', 
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    },
  });

  const onSubmit = (data: AssignRoleFormData) => {
    assignRoleMutation.mutate(data);
  };

  if (!user) return null;

  const canAssignRoles = currentUser?.isCreator || false; // TODO: Check for top_admin role

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role to {user.username}
          </DialogTitle>
          <DialogDescription>
            Assign or update roles for this user. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>
        
        {!canAssignRoles && (
          <Alert>
            <X className="h-4 w-4" />
            <AlertTitle>Insufficient Permissions</AlertTitle>
            <AlertDescription>
              Only Creators and Top Admins can assign roles to users.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <h4 className="font-semibold mb-2">Current Roles:</h4>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {role.roleType}
                    {role.scope && ` (${role.scope})`}
                  </Badge>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="roleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Regular User
                        </div>
                      </SelectItem>
                      <SelectItem value="course_admin">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Course Admin
                        </div>
                      </SelectItem>
                      <SelectItem value="top_admin">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Top Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchRoleType === 'course_admin' && (
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Scope</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Database Systems, Algorithms" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify which course this admin role applies to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={assignRoleMutation.isPending || !canAssignRoles}
              >
                {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// User actions dropdown component
function UserActionsDropdown({ user, onAssignRole, onToggleBan }: { 
  user: any; 
  onAssignRole: () => void;
  onToggleBan: () => void;
}) {
  const { user: currentUser } = useAuth();
  const canManageUsers = currentUser?.isCreator || false; // TODO: Check for top_admin role
  
  if (!canManageUsers) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAssignRole}>
          <Shield className="h-4 w-4 mr-2" />
          Assign Role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onToggleBan}
          className={user.isBanned ? "text-green-600" : "text-red-600"}
        >
          {user.isBanned ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Unban User
            </>
          ) : (
            <>
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  
  const isAdmin = currentUser?.isCreator || false; // TODO: Check for top_admin role
  
  // TODO: Replace with real API calls
  // const { data: users = [], isLoading } = useQuery({
  //   queryKey: ['/api/users'],
  //   enabled: isAdmin,
  // });
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || 
                       user.roles.some(role => role.roleType === roleFilter);
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "banned" && user.isBanned) ||
                         (statusFilter === "active" && !user.isBanned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const handleToggleBan = async (userId: string) => {
    // TODO: Replace with real API call
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isBanned: !user.isBanned }
          : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    toast({ 
      title: `User ${user?.isBanned ? 'unbanned' : 'banned'} successfully!` 
    });
  };

  const openRoleDialog = (user: any) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };
  
  const totalUsers = users.length;
  const activeUsers = users.filter(user => !user.isBanned).length;
  const bannedUsers = users.filter(user => user.isBanned).length;
  const topAdmins = users.filter(user => 
    user.roles.some(role => role.roleType === "top_admin")
  ).length;

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case "top_admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "course_admin": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "top_admin": return <Crown className="h-3 w-3" />;
      case "course_admin": return <UserCheck className="h-3 w-3" />;
      case "user": return <User className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 text-center">
          <X className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access user management.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-admin-users">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-users-title">
              <Users2 className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage users, assign roles, and monitor platform activity.
            </p>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeUsers / totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Administrative users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Regular Users</SelectItem>
            <SelectItem value="course_admin">Course Admins</SelectItem>
            <SelectItem value="top_admin">Top Admins</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Users</SelectItem>
            <SelectItem value="banned">Banned Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.isCreator && (
                        <Badge variant="outline" className="mt-1">
                          <Crown className="h-3 w-3 mr-1" />
                          Creator
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <Badge key={index} className={getRoleColor(role.roleType)}>
                          {getRoleIcon(role.roleType)}
                          <span className="ml-1">{role.roleType}</span>
                          {role.scope && <span className="ml-1">({role.scope})</span>}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.stats.totalPosts} posts</div>
                      <div className="text-muted-foreground">{user.stats.totalReactions} reactions</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isBanned ? (
                      <Badge variant="destructive">
                        <Ban className="h-3 w-3 mr-1" />
                        Banned
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserActionsDropdown
                      user={user}
                      onAssignRole={() => openRoleDialog(user)}
                      onToggleBan={() => handleToggleBan(user.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog 
        open={roleDialogOpen} 
        onOpenChange={setRoleDialogOpen}
        user={selectedUser}
      />
    </div>
  );
}