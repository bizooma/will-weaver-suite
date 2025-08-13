import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Eye, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function ChatbotBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatbotData, setChatbotData] = useState({
    name: "",
    description: "",
    welcomeMessage: "Hello! How can I help you today?",
    avatar: "default",
    primaryColor: "#3b82f6"
  });

  const embedScript = `<script src="https://your-chatbot-domain.com/widget.js" data-chatbot-id="your-chatbot-id" data-name="${chatbotData.name}" data-color="${chatbotData.primaryColor}"></script>`;

  const copyEmbedScript = () => {
    navigator.clipboard.writeText(embedScript);
    toast({
      title: "Embed code copied",
      description: "The embed script has been copied to your clipboard."
    });
  };

  const handleSave = () => {
    // Here you would save to the database
    toast({
      title: "Chatbot saved",
      description: "Your chatbot has been saved successfully."
    });
    // Don't navigate away - keep user on this page
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/chatbots")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Video Chatbot</h1>
          <p className="text-muted-foreground">
            Build an AI-powered video assistant for your website
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the basic details for your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chatbot Name</Label>
                <Input
                  id="name"
                  value={chatbotData.name}
                  onChange={(e) => setChatbotData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Legal Assistant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={chatbotData.description}
                  onChange={(e) => setChatbotData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this chatbot does"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea
                  id="welcome"
                  value={chatbotData.welcomeMessage}
                  onChange={(e) => setChatbotData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                  placeholder="First message users will see"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how your chatbot looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Avatar Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {['default', 'professional', 'friendly'].map((style) => (
                    <div
                      key={style}
                      className={`p-3 border rounded-lg cursor-pointer text-center text-sm capitalize ${
                        chatbotData.avatar === style ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setChatbotData(prev => ({ ...prev, avatar: style }))}
                    >
                      {style}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={chatbotData.primaryColor}
                    onChange={(e) => setChatbotData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={chatbotData.primaryColor}
                    onChange={(e) => setChatbotData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your chatbot will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: chatbotData.primaryColor }}
                  >
                    AI
                  </div>
                  <div>
                    <h4 className="font-medium">{chatbotData.name || "Your Chatbot"}</h4>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: chatbotData.primaryColor }}
                    >
                      AI
                    </div>
                    <div className="bg-background rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">{chatbotData.welcomeMessage}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button size="icon" style={{ backgroundColor: chatbotData.primaryColor }}>
                      <span className="text-white">→</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Script</CardTitle>
              <CardDescription>
                Copy this script and paste it into your website's HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4">
                  <code className="text-sm text-muted-foreground break-all">
                    {embedScript}
                  </code>
                </div>
                <Button onClick={copyEmbedScript} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Embed Script
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Chatbot
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}