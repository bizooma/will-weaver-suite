import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"} px-3 py-2 rounded-md transition-colors`;

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/" className="font-serifBrand text-xl">
          LexiTech Demo
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
          <NavLink to="/will-creator">
            <Button variant="hero" size="lg">Create My Will</Button>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
