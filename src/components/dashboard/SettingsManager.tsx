import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, CreditCard, Shield, Palette } from "lucide-react";

export function SettingsManager() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, billing, and application preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" defaultValue="Doe Law Firm" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Billing & Subscription</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Professional Plan</p>
              </div>
              <Badge>Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">February 15, 2024</p>
              </div>
              <p className="font-medium">$49/month</p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Update Payment</Button>
              <Button variant="outline" className="flex-1">Change Plan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>White Label Settings</CardTitle>
            </div>
            <CardDescription>
              Customize branding across all products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="whiteLabelEnabled">Enable White Label</Label>
                <p className="text-sm text-muted-foreground">Remove Amicus Edge branding</p>
              </div>
              <Switch id="whiteLabelEnabled" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input id="customDomain" placeholder="yourdomain.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input id="brandColor" type="color" defaultValue="#3b82f6" className="w-16" />
                <Input defaultValue="#3b82f6" placeholder="#3b82f6" />
              </div>
            </div>
            <Button>Save Branding</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your account security and privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <Switch id="twoFactor" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">Auto Logout</Label>
                <p className="text-sm text-muted-foreground">Automatically logout after inactivity</p>
              </div>
              <Switch id="sessionTimeout" defaultChecked />
            </div>
            <Separator />
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>API Settings</CardTitle>
          </div>
          <CardDescription>
            Configure API access for your applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">API Access</p>
              <p className="text-sm text-muted-foreground">Enable programmatic access to your data</p>
            </div>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input value="sk-..." className="font-mono text-xs" readOnly />
              <Button variant="outline">Regenerate</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">View Documentation</Button>
            <Button variant="outline">Download SDKs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}