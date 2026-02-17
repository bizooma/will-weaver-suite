import { useAuth } from "@/contexts/AuthContext";
import { ENV_CONFIG } from "@/lib/config";
import { Link } from "react-router-dom";

const SiteFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/50" role="contentinfo">
      <div className="container py-12">
        {/* Google Maps Section - Now First and Full Width */}
        <div className="pb-8 -mx-4 md:-mx-8 lg:-mx-12">
          <div className="text-center mb-4 px-4 md:px-8 lg:px-12">
            <h4 className="font-semibold text-sm mb-2">Our Location</h4>
            <p className="text-sm text-muted-foreground">Visit Bizooma Digital Marketing Agency</p>
          </div>
          <div className="w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5672.395785425484!2d-81.6591862!3d30.3283615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e5b7ba8c79c7b7%3A0x29d0d337ce7701c4!2sBizooma%20Digital%20Marketing%20Agency!5e1!3m2!1sen!2sus!4v1758071711766!5m2!1sen!2sus" 
              width="100%" 
              height="300" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Bizooma Digital Marketing Agency Location"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Main footer content - Now Second */}
        <div className="border-t pt-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <img 
                src="/lovable-uploads/AE-Logo.png" 
                alt="Amicus Edge - Law Firm Technology logo"
                className="h-12 w-auto" 
                width={240} 
                height={48}
                loading="lazy"
              />
              <p className="text-sm text-muted-foreground">
                AI-powered marketing platform helping law firms grow with chatbots, SEO tools, voice search, QR codes, and branded mobile apps.
              </p>
              
              {/* App Download Buttons */}
              <div className="space-y-3 pt-2">
                <h5 className="font-semibold text-xs">Download Our App and manage your account from your phone or tablet.</h5>
                <div className="flex flex-col space-y-2">
                  <a 
                    href="#" 
                    className="inline-block transition-opacity hover:opacity-80"
                    aria-label="Download on the App Store"
                  >
                    <img 
                      src="/src/assets/app-store.png" 
                      alt="Download on the App Store" 
                      className="h-10 w-auto"
                      width={135}
                      height={40}
                      loading="lazy"
                    />
                  </a>
                  <a 
                    href="#" 
                    className="inline-block transition-opacity hover:opacity-80"
                    aria-label="Get it on Google Play"
                  >
                    <img 
                      src="/src/assets/play-store.png" 
                      alt="Get it on Google Play" 
                      className="h-10 w-auto"
                      width={135}
                      height={40}
                      loading="lazy"
                    />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Products</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/will-creator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Will & Trust Creator
                </Link>
                <Link to="/alexa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Alexa Skill Demo
                </Link>
                <Link to="/mobile-app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mobile App
                </Link>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </nav>
            </div>
            
            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Company</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                {user && (
                  <>
                    <Link to="/production-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/data-privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Settings
                    </Link>
                  </>
                )}
              </nav>
            </div>
            
            {/* Legal & Environment */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
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
          <div className="text-xs text-muted-foreground">
              © 2026 <a href="https://bizooma.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Bizooma, LLC</a> &amp; Amicus Edge | All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
