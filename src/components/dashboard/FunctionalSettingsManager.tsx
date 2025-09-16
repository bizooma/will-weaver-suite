import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, User, CreditCard, Shield, Palette, Copy, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ApiDocumentation } from "./ApiDocumentation";
import { SdkDownloader } from "./SdkDownloader";

interface UserSettings {
  white_label_enabled: boolean;
  custom_domain: string;
  brand_color: string;
  company_name: string;
  logo_url: string;
  hide_branding: boolean;
  api_access_enabled: boolean;
}

interface UserProfile {
  display_name: string;
  email: string;
}

interface ApiKey {
  id: string;
  api_key: string;
  key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export function FunctionalSettingsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    white_label_enabled: false,
    custom_domain: '',
    brand_color: '#3b82f6',
    company_name: '',
    logo_url: '',
    hide_branding: false,
    api_access_enabled: false,
  });
  
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    email: '',
  });
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [showSdkDownloader, setShowSdkDownloader] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        setProfile({
          display_name: profileData.display_name || '',
          email: profileData.email || user.email || '',
        });
      }
      
      // Load settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsData) {
        setSettings({
          white_label_enabled: settingsData.white_label_enabled,
          custom_domain: settingsData.custom_domain || '',
          brand_color: settingsData.brand_color || '#3b82f6',
          company_name: settingsData.company_name || '',
          logo_url: settingsData.logo_url || '',
          hide_branding: settingsData.hide_branding,
          api_access_enabled: settingsData.api_access_enabled,
        });
      }
      
      // Load API keys
      const { data: keysData } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (keysData) {
        setApiKeys(keysData);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          email: profile.email,
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateApiKey = async () => {
    if (!user) return;
    
    try {
      // Generate a new API key using the database function
      const { data: newKey, error: keyError } = await supabase.rpc('generate_api_key');
      
      if (keyError) throw keyError;
      
      // Insert the new API key
      const { error: insertError } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          api_key: newKey,
          key_name: `API Key ${apiKeys.length + 1}`,
        });
      
      if (insertError) throw insertError;
      
      // Reload API keys
      await loadUserData();
      
      toast({
        title: "Success",
        description: "New API key generated",
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive",
      });
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const toggleApiKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: !isActive })
        .eq('id', keyId);
      
      if (error) throw error;
      
      await loadUserData();
      
      toast({
        title: "Success",
        description: `API key ${!isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

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
              <Input 
                id="displayName" 
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              />
            </div>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
              <Switch 
                id="whiteLabelEnabled" 
                checked={settings.white_label_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, white_label_enabled: checked })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain</Label>
              <Input 
                id="customDomain" 
                placeholder="yourdomain.com" 
                value={settings.custom_domain}
                onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input 
                  id="brandColor" 
                  type="color" 
                  value={settings.brand_color} 
                  className="w-16"
                  onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                />
                <Input 
                  value={settings.brand_color} 
                  placeholder="#3b82f6" 
                  onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Branding"}
            </Button>
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
            <Switch 
              checked={settings.api_access_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, api_access_enabled: checked })}
            />
          </div>
          
          {settings.api_access_enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Your API Keys</h4>
                  <Button onClick={generateApiKey} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
                
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No API keys generated yet</p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{key.api_key.substring(0, 12)}...</span>
                            <Badge variant={key.is_active ? "default" : "secondary"}>
                              {key.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyApiKey(key.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={key.is_active}
                          onCheckedChange={() => toggleApiKeyStatus(key.id, key.is_active)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowApiDocs(!showApiDocs)}>
              {showApiDocs ? 'Hide Documentation' : 'View Documentation'}
            </Button>
            <Button variant="outline" onClick={() => setShowSdkDownloader(!showSdkDownloader)}>
              {showSdkDownloader ? 'Hide SDKs' : 'Download SDKs'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showApiDocs && (
        <ApiDocumentation apiKey={apiKeys.find(key => key.is_active)?.api_key} />
      )}

      {showSdkDownloader && (
        <SdkDownloader apiKey={apiKeys.find(key => key.is_active)?.api_key} />
      )}
    </div>
  );
}