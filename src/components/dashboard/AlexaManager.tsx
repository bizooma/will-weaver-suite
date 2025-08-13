import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Play, Settings, Download, ExternalLink } from "lucide-react";

export function AlexaManager() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alexa Skill</h1>
          <p className="text-muted-foreground">
            Voice-enabled legal assistance through Amazon Alexa
          </p>
        </div>
        <Badge variant="secondary">Active</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Legal Assistant Skill</CardTitle>
                <CardDescription>
                  Voice-powered legal guidance and FAQ responses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/alexa">
                  <Play className="h-4 w-4 mr-2" />
                  Try Demo
                </Link>
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer common legal questions</li>
                <li>• Guide through document creation</li>
                <li>• Provide legal resource recommendations</li>
                <li>• Voice-activated legal forms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Guide</CardTitle>
            <CardDescription>
              How to set up the Alexa skill for your clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Enable the Skill</p>
                  <p className="text-xs text-muted-foreground">
                    Ask Alexa to "Enable Legal Assistant skill"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Test Basic Commands</p>
                  <p className="text-xs text-muted-foreground">
                    "Alexa, ask Legal Assistant about wills"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Customize Responses</p>
                  <p className="text-xs text-muted-foreground">
                    Configure for your specific practice area
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Setup Guide
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>
            Voice interaction statistics and popular queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">1,247</div>
              <div className="text-sm text-muted-foreground">Total Interactions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">89%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-foreground">2.3s</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}