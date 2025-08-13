import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, MessageSquare, FileText, Smartphone } from "lucide-react";

export function AnalyticsManager() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights across all your legal tech tools
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chatbot Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Will Completions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Downloads</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">456</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+31%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Product</CardTitle>
            <CardDescription>
              Distribution of user engagement across products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Video Chatbots</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Will Creator</span>
                </div>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "30%" }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Mobile App</span>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Avg. Response Time</p>
                  <p className="text-xs text-muted-foreground">Chatbot interactions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">0.8s</p>
                  <p className="text-xs text-muted-foreground">-0.2s</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-xs text-muted-foreground">Will creation process</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">87%</p>
                  <p className="text-xs text-muted-foreground">+5%</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">User Satisfaction</p>
                  <p className="text-xs text-muted-foreground">Average rating</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">4.6/5</p>
                  <p className="text-xs text-muted-foreground">+0.2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}