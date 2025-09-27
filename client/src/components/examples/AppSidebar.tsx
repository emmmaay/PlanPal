import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '../ThemeProvider';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <ThemeProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 p-8 bg-background">
            <h2 className="text-2xl font-bold">Main Content Area</h2>
            <p className="text-muted-foreground mt-2">This is where the main application content would be displayed.</p>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
