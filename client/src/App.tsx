import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/components/AuthProvider";
import { useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import Discussions from "@/pages/Discussions";
import AnonymousHub from "@/pages/AnonymousHub";
import PinnedPosts from "@/pages/PinnedPosts";
import Users from "@/pages/admin/Users";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function AuthenticatedApp() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={() => <Login />} />
      </Switch>
    );
  }

  return (
    <Router />
  );
}

function Router() {
  const { logout } = useAuth();

  // Custom sidebar width for educational platform
  const style = {
    "--sidebar-width": "20rem",       // 320px for better navigation
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground"
                data-testid="button-logout"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/courses" component={Courses} />
              <Route path="/discussions" component={Discussions} />
              <Route path="/anonymous" component={AnonymousHub} />
              <Route path="/pinned" component={PinnedPosts} />
              <Route path="/admin/users" component={Users} />
              {/* Fallback to 404 */}
              <Route component={NotFound} />
            </Switch>
          </main>
          
          {/* Footer */}
          <footer className="border-t bg-card p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Built by students for students</span>
                <span>•</span>
                <span>YCT ND1 Computer Science</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Contact: cs@yct.edu.ng</span>
                <span>•</span>
                <span>© 2024</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <AuthenticatedApp />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
