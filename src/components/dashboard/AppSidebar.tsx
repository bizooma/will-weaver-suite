import React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
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
  Building2,
  GraduationCap,
  Sparkles,
  Lock
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
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";
import { hasTierAccess, SUBSCRIPTION_TIERS, type TierKey } from "@/lib/subscriptionTiers";

/** Map tier keys to human-readable plan names for tooltip display */
const TIER_LABEL: Record<TierKey, string> = {
  basic: SUBSCRIPTION_TIERS.basic.name,
  standard: SUBSCRIPTION_TIERS.standard.name,
  pro_pi: SUBSCRIPTION_TIERS.pro_pi.name,
  pro_estate: SUBSCRIPTION_TIERS.pro_estate.name,
};

/** Sidebar nav items with optional requiredTier for lock icon display */
const items: { title: string; url: string; icon: any; end?: boolean; requiredTier?: TierKey }[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "AIO Analyzer", url: "/dashboard/aio", icon: Search, requiredTier: "basic" },
  { title: "Video Chatbots", url: "/dashboard/chatbots", icon: MessageSquare, requiredTier: "basic" },
  { title: "Live Operators", url: "/dashboard/live-operators", icon: Monitor, requiredTier: "standard" },
  { title: "Voice Search", url: "/dashboard/voice-search", icon: MicIcon, requiredTier: "pro_pi" },
  { title: "QR Codes", url: "/dashboard/qr-codes", icon: QrCode, requiredTier: "basic" },
  { title: "Marketing Calendar", url: "/dashboard/marketing-calendar", icon: Calendar },
];

const growthToolsItems: { title: string; url: string; icon: any; requiredTier?: TierKey }[] = [
  { title: "Foundation", url: "/dashboard/nonprofit-formation", icon: Building2 },
  { title: "Will Creator", url: "/dashboard/wills", icon: FileText, requiredTier: "standard" },
  { title: "Alexa Skill", url: "/dashboard/alexa", icon: Mic, requiredTier: "pro_pi" },
  { title: "Mobile App", url: "/dashboard/mobile", icon: Smartphone, requiredTier: "pro_pi" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { signOut, subscriptionStatus, subscriptionTier, subscriptionEnd } = useAuth();
  const { isAdmin } = useAdminRole();
  const { isDemoMode } = useDemoMode();
  const currentPath = location.pathname;
  
  // Determine base path based on demo mode
  const basePath = isDemoMode ? '/dashboard-tour' : '/dashboard';

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

  /** Returns true if the item's required tier exceeds the user's active tier.
   *  Admins bypass all tier locks. */
  const isLocked = (requiredTier?: TierKey) => {
    if (!requiredTier || isDemoMode || isAdmin) return false;
    if (subscriptionStatus !== 'active') return !!requiredTier;
    return !hasTierAccess(subscriptionTier, requiredTier);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className={!open ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/5">
        <div className="flex items-center gap-2 px-3 py-2">
          {open && (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
                {isDemoMode && (
                  <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3" />
                    Demo
                  </Badge>
                )}
              </div>
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
              {items.map((item) => {
                const itemUrl = item.url.replace('/dashboard', basePath);
                const locked = isLocked(item.requiredTier);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={itemUrl} 
                        end={item.end}
                        className={`${getNavCls(itemUrl, item.end)} ${locked ? 'opacity-60' : ''}`}
                      >
                        <item.icon className="h-4 w-4" />
                        {open && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {locked && item.requiredTier && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  Requires {TIER_LABEL[item.requiredTier]} plan or above
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Growth Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {growthToolsItems.map((item) => {
                const itemUrl = item.url.replace('/dashboard', basePath);
                const locked = isLocked(item.requiredTier);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={itemUrl} 
                        className={`${getNavCls(itemUrl)} ${locked ? 'opacity-60' : ''}`}
                      >
                        <item.icon className="h-4 w-4" />
                        {open && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {locked && item.requiredTier && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  Requires {TIER_LABEL[item.requiredTier]} plan or above
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Training</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to={`${basePath}/training`}
                    className={getNavCls(`${basePath}/training`)}
                  >
                    <GraduationCap className="h-4 w-4" />
                    {open && <span>Training Videos</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                      to={`${basePath}/users`}
                      className={getNavCls(`${basePath}/users`)}
                    >
                      <Users className="h-4 w-4" />
                      {open && <span>User Management</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`${basePath}/system-messages`}
                      className={getNavCls(`${basePath}/system-messages`)}
                    >
                      <Bell className="h-4 w-4" />
                      {open && <span>System Messages</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`${basePath}/analytics`}
                      className={getNavCls(`${basePath}/analytics`)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      {open && <span>Analytics</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`${basePath}/settings`}
                      className={getNavCls(`${basePath}/settings`)}
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
        <div className="p-2 space-y-2">
          {/* Subscription status badge — shows current plan and renewal date */}
          {open && !isDemoMode && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {subscriptionStatus === 'loading'
                    ? 'Loading…'
                    : subscriptionStatus === 'active' && subscriptionTier
                      ? subscriptionTier
                      : 'No Active Plan'}
                </span>
                {isAdmin && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                    Admin
                  </Badge>
                )}
              </div>
              {subscriptionStatus === 'active' && subscriptionEnd ? (
                <p className="text-[11px] text-muted-foreground pl-6">
                  Renews {format(new Date(subscriptionEnd), 'MMM d, yyyy')}
                </p>
              ) : subscriptionStatus !== 'loading' ? (
                <p className="text-[11px] text-muted-foreground pl-6">
                  <NavLink to="/#pricing" className="text-primary hover:underline">
                    Upgrade your plan
                  </NavLink>
                </p>
              ) : null}
            </div>
          )}

          {isDemoMode ? (
            <Button
              asChild
              variant="ghost"
              size={!open ? "icon" : "default"}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Link to="/auth">
                <LogOut className="h-4 w-4" />
                {open && <span className="ml-2">Sign Up to Save</span>}
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size={!open ? "icon" : "default"}
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {open && <span className="ml-2">Sign Out</span>}
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}