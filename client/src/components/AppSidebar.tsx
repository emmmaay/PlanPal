import {
  Bell,
  BookOpen,
  Crown,
  GraduationCap,
  Home,
  MessageSquare,
  Pin,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock user data - todo: remove mock functionality
const currentUser = {
  username: "student123",
  role: "student", // "creator", "executive", "course_admin", "student"
  avatar: "",
  initials: "ST",
};

// Menu items for different user roles
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ["creator", "executive", "course_admin", "student"],
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
    roles: ["creator", "executive", "course_admin", "student"],
  },
  {
    title: "Discussions",
    url: "/discussions",
    icon: MessageSquare,
    roles: ["creator", "executive", "course_admin", "student"],
  },
  {
    title: "Anonymous Hub",
    url: "/anonymous",
    icon: Users,
    roles: ["creator", "executive", "course_admin", "student"],
  },
  {
    title: "Pinned Posts",
    url: "/pinned",
    icon: Pin,
    roles: ["creator", "executive", "course_admin", "student"],
  },
];

const adminItems = [
  {
    title: "Manage Users",
    url: "/admin/users",
    icon: Users,
    roles: ["creator", "executive"],
  },
  {
    title: "Course Management",
    url: "/admin/courses",
    icon: GraduationCap,
    roles: ["creator", "executive"],
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: Settings,
    roles: ["creator", "executive"],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  
  const userRole = currentUser.role;
  const visibleMainItems = menuItems.filter(item => item.roles.includes(userRole));
  const visibleAdminItems = adminItems.filter(item => item.roles.includes(userRole));
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "creator":
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case "executive":
        return <Crown className="h-3 w-3 text-blue-500" />;
      case "course_admin":
        return <GraduationCap className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground" data-testid="text-app-title">
              YCT ND1
            </h1>
            <p className="text-sm text-muted-foreground">Computer Science</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`link-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.title === "Anonymous Hub" && (
                          <Badge variant="secondary" className="ml-auto">
                            ON
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {visibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdminItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        data-testid={`link-admin-${item.title.toLowerCase().replace(' ', '-')}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
            <AvatarFallback className="text-xs">{currentUser.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium truncate" data-testid="text-username">
                {currentUser.username}
              </p>
              {getRoleIcon(userRole)}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {userRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
