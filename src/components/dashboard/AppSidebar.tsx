import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Mic,
  Smartphone,
  BarChart3,
  Settings,
  LogOut,
  Search,
  QrCode,
  Users,
  Bell,
  MicIcon,
  Calendar,
  Monitor,
  Building2
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "AIO Analyzer", url: "/dashboard/aio", icon: Search },
  { title: "Video Chatbots", url: "/dashboard/chatbots", icon: MessageSquare },
  { title: "Live Operators", url: "/dashboard/live-operators", icon: Monitor },
  { title: "Voice Search", url: "/dashboard/voice-search", icon: MicIcon },
  { title: "QR Codes", url: "/dashboard/qr-codes", icon: QrCode },
  { title: "Marketing Calendar", url: "/dashboard/marketing-calendar", icon: Calendar },
];

const growthToolsItems = [
  { title: "Foundation", url: "/nonprofit-formation", icon: Building2 },
  { title: "Will Creator", url: "/dashboard/wills", icon: FileText },
  { title: "Alexa Skill", url: "/dashboard/alexa", icon: Mic },
  { title: "Mobile App", url: "/dashboard/mobile", icon: Smartphone },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useAdminRole();
  const currentPath = location.pathname;

  const isActive = (path: string, end?: boolean) => {
    if (end) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string, end?: boolean) => 
    isActive(path, end) 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={!open ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/5">
        <div className="flex items-center gap-2 px-3 py-2">
          {open && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Amicus Edge</p>
            </div>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Marketing Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.end}
                      className={getNavCls(item.url, item.end)}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Growth Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {growthToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/users" 
                      className={getNavCls("/dashboard/users")}
                    >
                      <Users className="h-4 w-4" />
                      {open && <span>User Management</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/system-messages" 
                      className={getNavCls("/dashboard/system-messages")}
                    >
                      <Bell className="h-4 w-4" />
                      {open && <span>System Messages</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/analytics" 
                      className={getNavCls("/dashboard/analytics")}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {open && <span>Analytics</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/dashboard/settings" 
                      className={getNavCls("/dashboard/settings")}
                    >
                      <Settings className="h-4 w-4" />
                      {open && <span>Settings</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/5">
        <div className="p-2">
          <Button
            variant="ghost"
            size={!open ? "icon" : "default"}
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {open && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}