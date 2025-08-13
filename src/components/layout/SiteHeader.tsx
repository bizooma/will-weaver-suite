import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"} px-3 py-2 rounded-md transition-colors`;

const SiteHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2" aria-label="Amicus Edge - Law Firm Technology Home">
          <img
            src="/lovable-uploads/5e631c94-fd90-4ebb-83cc-cc5005831375.png"
            alt="Amicus Edge - Law Firm Technology logo"
            className="h-12 md:h-14 w-auto"
            width={240}
            height={56}
          />
          <span className="sr-only">Amicus Edge</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/about" className={navLinkCls}>
            About
          </NavLink>
          <NavLink to="/will-creator" className={navLinkCls}>
            Will & Trust
          </NavLink>
          <NavLink to="/alexa" className={navLinkCls}>
            Alexa Skill
          </NavLink>
          <NavLink to="/mobile-app" className={navLinkCls}>
            Mobile App
          </NavLink>
          <NavLink to="/blog" className={navLinkCls}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={navLinkCls}>
            Contact
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/will-creator">
                <Button variant="hero" size="lg">Create My Will</Button>
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavLink to="/auth">
                <Button variant="outline">Sign In</Button>
              </NavLink>
              <NavLink to="/will-creator">
                <Button variant="hero" size="lg">Get Started</Button>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
