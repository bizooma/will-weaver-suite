import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, BarChart3, Settings, Globe, Smartphone, MousePointer, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const QRCodes = () => {
  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: "Custom QR Codes",
      description: "Generate professional QR codes with custom colors, logos, and styling options."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track scans, locations, devices, and user behavior with detailed analytics."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Easy Management",
      description: "Create, edit, and manage all your QR codes from one centralized dashboard."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "URL Redirection",
      description: "Link to websites, social media, contact info, or any digital content."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "QR codes work perfectly on all devices and scanning applications."
    },
    {
      icon: <MousePointer className="w-8 h-8" />,
      title: "Click Tracking",
      description: "Monitor engagement with detailed click and scan tracking."
    }
  ];

  const benefits = [
    "Unlimited QR code generation",
    "Real-time analytics dashboard", 
    "Custom branding options",
    "Mobile-responsive design",
    "Secure URL redirection",
    "Export options (PNG, SVG)",
    "Bulk QR code creation",
    "API integration available"
  ];

  const useCases = [
    {
      title: "Marketing Campaigns",
      description: "Bridge offline and online marketing with trackable QR codes on flyers, posters, and ads."
    },
    {
      title: "Event Management", 
      description: "Streamline event check-ins, information sharing, and attendee engagement."
    },
    {
      title: "Business Cards",
      description: "Share contact information instantly with digital business card QR codes."
    },
    {
      title: "Restaurant Menus",
      description: "Provide contactless menu access and ordering with QR code integration."
    },
    {
      title: "Product Information",
      description: "Link physical products to detailed information, reviews, and purchasing options."
    },
    {
      title: "Wi-Fi Sharing",
      description: "Allow guests to connect to your network instantly without sharing passwords."
    }
  ];

  return (
    <>
      <Helmet>
        <title>QR Code Generator & Analytics | Professional QR Solutions</title>
        <meta name="description" content="Create custom QR codes with advanced analytics. Track scans, manage campaigns, and boost engagement with our professional QR code platform." />
        <meta name="keywords" content="QR code generator, QR analytics, custom QR codes, marketing QR codes, trackable QR codes" />
        <meta property="og:title" content="QR Code Generator & Analytics | Professional QR Solutions" />
        <meta property="og:description" content="Create custom QR codes with advanced analytics. Track scans, manage campaigns, and boost engagement." />
        <link rel="canonical" href="/qr-codes" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                <QrCode className="w-4 h-4 mr-2" />
                QR Code Solutions
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Professional QR Code Generator & Analytics
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create custom QR codes with advanced tracking, analytics, and management features. 
                Perfect for marketing campaigns, events, and business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for QR Success
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive QR code platform provides all the tools you need to create, 
                manage, and track your QR campaigns.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Perfect for Every Industry
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover how businesses across industries use our QR code solutions 
                to enhance customer experience and drive growth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {useCase.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-secondary/20">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose Our QR Platform?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get access to enterprise-grade features with an intuitive interface 
                  designed for businesses of all sizes.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Marketing?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of businesses using our QR code platform to connect 
                with customers and drive measurable results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    Start Creating QR Codes
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default QRCodes;