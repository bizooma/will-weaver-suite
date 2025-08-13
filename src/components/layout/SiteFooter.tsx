import { useAuth } from "@/contexts/AuthContext";
import { ENV_CONFIG } from "@/lib/config";

const SiteFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/50" role="contentinfo">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div>
          <img 
            src="/lovable-uploads/5e631c94-fd90-4ebb-83cc-cc5005831375.png" 
            alt="Amicus Edge - Law Firm Technology logo" 
            className="h-14 md:h-16 w-auto mb-3" 
            width={360} 
            height={96}
            loading="lazy"
          />
          <p className="text-sm text-muted-foreground mb-3">
            AI-powered legal document generation platform for demonstration purposes.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
            <strong>Demo Only:</strong> Not for actual legal use.
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Products</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><a href="/will-creator" className="hover:text-foreground transition-colors">Will & Trust Creator</a></li>
            <li><a href="/alexa" className="hover:text-foreground transition-colors">Alexa Skill Demo</a></li>
            <li><a href="/mobile-app" className="hover:text-foreground transition-colors">Mobile App</a></li>
            <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Company</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><a href="/about" className="hover:text-foreground transition-colors">About Us</a></li>
            <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
            {user && (
              <li><a href="/production-dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
            )}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Legal</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
          </ul>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2 text-sm">Environment</h5>
            <div className="flex gap-1">
              <span className={`text-xs px-2 py-1 rounded ${ENV_CONFIG.isDevelopment ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {ENV_CONFIG.isDevelopment ? 'Development' : 'Production'}
              </span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                v{ENV_CONFIG.app.version}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            © {currentYear} {ENV_CONFIG.app.name}. All rights reserved.
          </div>
          
          <div className="text-xs text-muted-foreground">
            <span className="bg-red-50 text-red-700 px-2 py-1 rounded">
              DEMO ONLY - Not for actual legal use
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
