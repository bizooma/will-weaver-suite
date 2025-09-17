import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  FileText, 
  Mic, 
  Smartphone, 
  Plus, 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Search,
  QrCode
} from "lucide-react";
import { ProductionReadinessPanel } from "./ProductionReadinessPanel";

export function DashboardOverview() {
  const stats = [
    { label: "Active Chatbots", value: "3", change: "+2", icon: MessageSquare },
    { label: "Will Drafts", value: "12", change: "+4", icon: FileText },
    { label: "Monthly Views", value: "1.2k", change: "+15%", icon: Users },
    { label: "Avg Response Time", value: "0.8s", change: "-0.2s", icon: Clock },
  ];

  const quickActions = [
    {
      title: "AIO SEO Analyzer",
      description: "Analyze websites for SEO, Voice SEO, and AI optimization",
      icon: Search,
      action: "/dashboard/aio",
      color: "bg-indigo-500"
    },
    {
      title: "Create New Chatbot",
      description: "Build a new video chatbot for your website",
      icon: MessageSquare,
      action: "/dashboard/chatbots/new",
      color: "bg-blue-500"
    },
    {
      title: "Generate QR Code",
      description: "Create trackable QR codes with analytics",
      icon: QrCode,
      action: "/dashboard/qr-codes",
      color: "bg-teal-500"
    },
    {
      title: "Start Will Creator",
      description: "Create a new will or trust document",
      icon: FileText,
      action: "/will-creator",
      color: "bg-green-500"
    },
    {
      title: "Test Alexa Skill",
      description: "Try out the Alexa integration demo",
      icon: Mic,
      action: "/dashboard/alexa",
      color: "bg-purple-500"
    },
    {
      title: "Mobile App Demo",
      description: "Download and test the mobile application",
      icon: Smartphone,
      action: "/dashboard/mobile",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your legal tech tools.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Pro Plan
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Get started with your most used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Card key={action.title} className="border border-border/5 hover:border-border/20 transition-colors">
                <CardHeader className="space-y-1">
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button asChild className="w-full" size="sm">
                    <Link to={action.action}>
                      <Plus className="h-4 w-4 mr-2" />
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions across all products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Created new chatbot "Legal Assistant"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Completed will draft "Johnson Family Trust"</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mic className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tested Alexa skill integration</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Readiness Panel */}
        <ProductionReadinessPanel />
      </div>
    </div>
  );
}