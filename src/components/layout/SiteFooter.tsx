const SiteFooter = () => {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-serifBrand text-lg mb-2">LexiTech Demo</h3>
          <p className="text-sm text-muted-foreground">
            Legal tech solutions for modern law practices.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Contact</h4>
          <p className="text-sm text-muted-foreground">(555) 123-4567</p>
          <p className="text-sm text-muted-foreground">hello@example.com</p>
          <p className="text-sm text-muted-foreground">123 Main St, Suite 400, Your City</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Quick Links</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><a href="/will-creator">Create My Will</a></li>
            <li><a href="/alexa">Try Alexa Demo</a></li>
            <li><a href="/mobile-app">Download Our App</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LexiTech Demo. All rights reserved.
      </div>
    </footer>
  );
};

export default SiteFooter;
