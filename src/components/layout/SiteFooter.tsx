import { useAuth } from "@/contexts/AuthContext";
import { ENV_CONFIG } from "@/lib/config";

const SiteFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/50" role="contentinfo">
      <div className="container py-12">
        {/* Google Maps Section - Now First */}
        <div className="pb-8">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-sm mb-2">Our Location</h4>
            <p className="text-sm text-muted-foreground">Visit Bizooma Digital Marketing Agency</p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5672.395785425484!2d-81.6591862!3d30.3283615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e5b7ba8c79c7b7%3A0x29d0d337ce7701c4!2sBizooma%20Digital%20Marketing%20Agency!5e1!3m2!1sen!2sus!4v1758071711766!5m2!1sen!2sus" 
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Bizooma Digital Marketing Agency Location"
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Main footer content - Now Second */}
        <div className="border-t pt-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <img 
                src="/lovable-uploads/4ffe9938-1a7b-48ff-bede-e8a8b46f4d7a.png" 
                alt="Amicus Edge - Law Firm Technology logo" 
                className="h-12 w-auto" 
                width={240} 
                height={48}
                loading="lazy"
              />
              <p className="text-sm text-muted-foreground">
                AI-powered legal document generation platform for demonstration purposes.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                <strong>Demo Only:</strong> Not for actual legal use.
              </div>
            </div>
            
            {/* Products */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Products</h4>
              <nav className="flex flex-col space-y-2">
                <a href="/will-creator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Will & Trust Creator
                </a>
                <a href="/alexa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Alexa Skill Demo
                </a>
                <a href="/mobile-app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mobile App
                </a>
                <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </nav>
            </div>
            
            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Company</h4>
              <nav className="flex flex-col space-y-2">
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
                {user && (
                  <>
                    <a href="/production-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </a>
                    <a href="/data-privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Settings
                    </a>
                  </>
                )}
              </nav>
            </div>
            
            {/* Legal & Environment */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </nav>
              
              <div className="pt-2">
                <h5 className="font-semibold text-xs mb-2">Environment</h5>
                <div className="flex flex-wrap gap-1">
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
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t bg-background/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-muted-foreground">
              © 2025 <a href="https://legallyinnovative.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Legally Innovative</a>, A Bizooma, LLC Company | All rights reserved.
            </div>
            
            <div className="text-xs text-muted-foreground">
              <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded border border-red-200">
                DEMO ONLY - Not for actual legal use
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
