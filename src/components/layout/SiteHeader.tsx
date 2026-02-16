import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ChevronDown, Menu } from "lucide-react";
import { NotificationIcon } from "@/components/NotificationIcon";

/** Helper to generate active/inactive class names for NavLink */
const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"} px-3 py-2 rounded-md transition-colors`;

/** Mobile nav link styles — full-width with larger tap target */
const mobileNavLinkCls = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-primary font-semibold" : "text-foreground/80 hover:text-foreground"} block px-4 py-3 text-base rounded-md transition-colors`;

/** Navigation items shared between desktop and mobile menus */
const NAV_ITEMS = [
  { to: "/about", label: "About" },
  { to: "/will-trust", label: "Will & Trust" },
  { to: "/nonprofit-formation-info", label: "Nonprofit Formation" },
  { to: "/alexa", label: "Alexa Skill" },
  { to: "/mobile-app", label: "Mobile App" },
  { to: "/contact", label: "Contact" },
] as const;

const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2" aria-label="Amicus Edge - Law Firm Technology Home">
          <img
            src="/lovable-uploads/AE-Logo.png"
            alt="Amicus Edge - Law Firm Technology logo"
            className="h-12 md:h-14 w-auto"
            width={240}
            height={56}
          />
          <span className="sr-only">Amicus Edge</span>
        </NavLink>

        {/* Desktop navigation — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkCls}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth buttons — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <NavLink to="/dashboard">Dashboard</NavLink>
              </Button>
              <NotificationIcon />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {user.email}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <NavLink to="/auth">Sign In</NavLink>
              </Button>
              <Button asChild>
                <NavLink to="/auth">Get Started</NavLink>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile hamburger menu — visible only on small screens */}
        <div className="flex md:hidden items-center gap-2">
          {user && <NotificationIcon />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 pt-12">
              {/* Mobile nav links */}
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <NavLink to={item.to} className={mobileNavLinkCls}>
                      {item.label}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-4 border-t" />

              {/* Mobile auth section */}
              {user ? (
                <div className="flex flex-col gap-2 px-4">
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                      <NavLink to="/dashboard">Dashboard</NavLink>
                    </Button>
                  </SheetClose>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <SheetClose asChild>
                    <Button asChild variant="ghost" className="w-full">
                      <NavLink to="/auth">Sign In</NavLink>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <NavLink to="/auth">Get Started</NavLink>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
