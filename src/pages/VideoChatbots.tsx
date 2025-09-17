import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Bot, MessageCircle, Settings, Users, BarChart3, ArrowRight, CheckCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";

const VideoChatbots = () => {
  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "AI Video Avatars",
      description: "Lifelike AI avatars that speak and interact naturally with your website visitors."
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Intelligent Responses",
      description: "Advanced AI that understands context and provides accurate, helpful answers."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Natural Conversations",
      description: "Seamless voice and text interactions that feel like talking to a real person."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Custom Branding",
      description: "Fully customizable avatars, voices, and interfaces to match your brand."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Never miss a lead with round-the-clock customer support and engagement."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Detailed insights into conversations, engagement, and conversion rates."
    }
  ];

  const benefits = [
    "Reduce customer service costs by up to 80%",
    "Increase website engagement and conversion rates",
    "Provide instant responses to visitor questions",
    "Capture leads even when you're unavailable",
    "Scale customer support without hiring staff",
    "Improve user experience with interactive help",
    "Multilingual support for global audiences",
    "Easy integration with existing websites"
  ];

  const useCases = [
    {
      title: "Legal Consultations",
      description: "Provide initial legal guidance and intake for potential clients seeking legal services."
    },
    {
      title: "Customer Support",
      description: "Answer frequently asked questions and guide users through your services instantly."
    },
    {
      title: "Lead Generation",
      description: "Engage visitors proactively and capture contact information for follow-up."
    },
    {
      title: "Product Demos",
      description: "Showcase your services with interactive video demonstrations and explanations."
    },
    {
      title: "Appointment Booking",
      description: "Help visitors schedule consultations and appointments through conversational interface."
    },
    {
      title: "Document Assistance",
      description: "Guide users through document preparation and legal form completion."
    }
  ];

  return (
    <>
      <Helmet>
        <title>AI Video Chatbots | Interactive Customer Engagement Solutions</title>
        <meta name="description" content="Deploy AI-powered video chatbots with lifelike avatars for 24/7 customer support, lead generation, and enhanced website engagement." />
        <meta name="keywords" content="AI chatbots, video chatbots, customer support AI, website engagement, lead generation" />
        <meta property="og:title" content="AI Video Chatbots | Interactive Customer Engagement Solutions" />
        <meta property="og:description" content="Deploy AI-powered video chatbots with lifelike avatars for enhanced customer engagement." />
        <link rel="canonical" href="/video-chatbots" />
      </Helmet>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6">
                <Video className="w-4 h-4 mr-2" />
                AI Video Technology
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AI Video Chatbots That Engage & Convert
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Transform your website with lifelike AI video avatars that provide instant support, 
                capture leads, and create memorable customer experiences 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    <Play className="w-5 h-5 mr-2" />
                    See Demo
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
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
                Advanced AI Video Technology
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our video chatbots combine cutting-edge AI with lifelike avatars to create 
                engaging customer experiences that drive results.
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
                Perfect for Every Business Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From customer support to lead generation, our video chatbots adapt 
                to your specific business requirements and goals.
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
                  Why Businesses Choose Our Video Chatbots
                </h2>
                <p className="text-lg text-muted-foreground">
                  Transform your customer engagement with proven results and 
                  measurable business impact.
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
                Ready to Revolutionize Customer Engagement?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join hundreds of businesses using our AI video chatbots to increase 
                conversions, reduce costs, and delight customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="text-lg px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Request Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
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

export default VideoChatbots;