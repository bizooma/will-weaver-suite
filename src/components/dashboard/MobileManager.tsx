import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Settings, QrCode, Apple, Play } from "lucide-react";

export function MobileManager() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mobile App</h1>
          <p className="text-muted-foreground">
            Native mobile application for iOS and Android
          </p>
        </div>
        <Badge variant="secondary">Demo Available</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Legal Assistant Mobile</CardTitle>
                <CardDescription>
                  Full-featured mobile app for legal services
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/mobile-app">
                  <Smartphone className="h-4 w-4 mr-2" />
                  View Demo
                </Link>
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">App Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Document creation and editing</li>
                <li>• Client communication tools</li>
                <li>• Secure document storage</li>
                <li>• Offline document access</li>
                <li>• Push notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Download Links</CardTitle>
            <CardDescription>
              Get the mobile app for your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Apple className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Download for iOS</div>
                  <div className="text-xs text-muted-foreground">Available on App Store</div>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Play className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Download for Android</div>
                  <div className="text-xs text-muted-foreground">Available on Google Play</div>
                </div>
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">QR Code Download</span>
              </div>
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan to download on any device
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>White Label Configuration</CardTitle>
          <CardDescription>
            Customize the app with your branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Branding Options:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom app icon and splash screen</li>
                <li>• Your company colors and fonts</li>
                <li>• Custom app name and description</li>
                <li>• Your contact information</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Distribution:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Publish under your developer account</li>
                <li>• Custom package name</li>
                <li>• White-label app store listings</li>
                <li>• Enterprise distribution options</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure Branding
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}