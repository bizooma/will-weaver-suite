import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Search, BarChart3, Target, CheckCircle, ArrowRight, Globe, Smartphone, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function VoiceSearchSimulator() {
  const features = [
    {
      icon: Search,
      title: "Multi-Platform Testing",
      description: "Test how Google, Bing, Siri, and Alexa respond to legal queries in your target market."
    },
    {
      icon: Globe,
      title: "Market-Specific Analysis", 
      description: "Get location-based insights for your city, state, or zip code to understand local competition."
    },
    {
      icon: BarChart3,
      title: "Performance Scoring",
      description: "Receive detailed scores for presence, frequency, and competitive performance across all assistants."
    },
    {
      icon: Target,
      title: "Competitor Intelligence",
      description: "See which competitors dominate voice search and understand why they're winning."
    },
    {
      icon: Zap,
      title: "Optimization Engine",
      description: "Get actionable recommendations with prioritized action items and impact scores."
    },
    {
      icon: CheckCircle,
      title: "Compliance Monitoring",
      description: "Ensure your voice search presence meets legal advertising requirements by state."
    }
  ];

  const benefits = [
    "Increase visibility in voice search results",
    "Outrank competitors in local queries", 
    "Optimize for Google AI Overviews",
    "Improve Siri and Alexa responses",
    "Track performance over time",
    "Generate executive reports"
  ];

  const assistants = [
    { name: "Google Search", icon: Search, description: "AI Overviews & Local Pack" },
    { name: "Bing Copilot", icon: MessageSquare, description: "Chat Responses & Web Results" },
    { name: "Siri", icon: Smartphone, description: "Apple Maps & Business Connect" },
    { name: "Alexa", icon: Mic, description: "Skills & Local Business Finder" }
  ];

  return (
    <>
      <Helmet>
        <title>Voice Search Simulator - Test Legal Marketing Across All Assistants | Amicus Edge</title>
        <meta 
          name="description" 
          content="Test how Google, Bing, Siri, and Alexa respond to legal queries in your market. Get competitive analysis and optimization recommendations for voice search dominance." 
        />
        <meta name="keywords" content="voice search optimization, legal marketing, Google AI Overviews, Siri optimization, Alexa marketing, law firm SEO, voice assistant marketing" />
        <link rel="canonical" href="https://30ecae11-2ec4-4042-9cb5-3f6dd42f16c7.lovableproject.com/voice-search-simulator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl text-center">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium">
              <Mic className="mr-2 h-4 w-4" />
              Voice Search Intelligence
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Voice Search Simulator
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Test how Google, Bing, Siri, and Alexa respond to legal queries in your market. 
              Get competitive analysis and actionable optimization recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/auth">
                  Start Testing Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {assistants.map((assistant, index) => (
                <Card key={index} className="p-4 border-2 border-primary/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-0 text-center">
                    <assistant.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">{assistant.name}</h3>
                    <p className="text-sm text-muted-foreground">{assistant.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Comprehensive Voice Search Analysis
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our advanced simulator tests multiple voice assistants simultaneously, providing deep insights into your law firm's voice search performance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <CardHeader className="p-0 pb-4">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Dominate Voice Search Results
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  With over 50% of searches now voice-based, your law firm needs to be found when potential clients ask legal questions. Our simulator helps you optimize for all major voice platforms.
                </p>
                
                <div className="space-y-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/auth">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-6">
                <Card className="p-6 border-l-4 border-l-green-500">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg text-green-700">Presence Score</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                    <p className="text-muted-foreground">Your firm appears in 85% of voice search results</p>
                  </CardContent>
                </Card>

                <Card className="p-6 border-l-4 border-l-blue-500">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg text-blue-700">Competitive Score</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-blue-600 mb-2">72%</div>
                    <p className="text-muted-foreground">Outranking 72% of local competitors</p>
                  </CardContent>
                </Card>

                <Card className="p-6 border-l-4 border-l-orange-500">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-lg text-orange-700">Optimization Potential</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-orange-600 mb-2">+28%</div>
                    <p className="text-muted-foreground">Potential improvement with our recommendations</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Test Your Voice Search Performance?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join law firms across the country who are using our Voice Search Simulator to dominate local voice search results and attract more clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link to="/auth">
                  Start Your Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}