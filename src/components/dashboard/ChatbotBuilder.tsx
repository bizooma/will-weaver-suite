import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { ChatbotTraining } from "./ChatbotTraining";

export function ChatbotBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotId, setChatbotId] = useState<string | null>(id || null);
  
  const [chatbotData, setChatbotData] = useState({
    name: "",
    description: "",
    welcomeMessage: "Hello! How can I help you today?",
    avatar: "default",
    primaryColor: "#3b82f6",
    videoUrl: "",
    showSuggestedResponses: true,
    contactPhone: "",
    contactEmail: "",
    calendlyUrl: "",
    position: "lower-left",
    suggestedResponses: [
      "Tell me about your services",
      "How can you help me?", 
      "What are your hours?",
      "Contact information",
      "Pricing information",
      "Book a consultation",
      "FAQ",
      "Get started"
    ]
  });
  
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Load existing chatbot data if editing
  useEffect(() => {
    if (chatbotId) {
      loadChatbot(chatbotId);
    }
  }, [chatbotId]);

  // Update welcome message in chat when it changes
  useEffect(() => {
    setMessages(prev => prev.map((msg, index) => 
      index === 0 ? { ...msg, text: chatbotData.welcomeMessage } : msg
    ));
  }, [chatbotData.welcomeMessage]);

  const loadChatbot = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const config = data.configuration as any || {};
        setChatbotData({
          name: data.name || "",
          description: data.description || "",
          welcomeMessage: config.welcomeMessage || "Hello! How can I help you today?",
          avatar: config.avatar || "default",
          primaryColor: config.primaryColor || "#3b82f6",
          videoUrl: config.videoUrl || "",
          showSuggestedResponses: config.showSuggestedResponses ?? true,
          contactPhone: config.contactPhone || "",
          contactEmail: config.contactEmail || "",
          calendlyUrl: data.calendly_url || "",
          position: config.position || "lower-left",
          suggestedResponses: config.suggestedResponses || [
            "Tell me about your services",
            "How can you help me?", 
            "What are your hours?",
            "Contact information",
            "Pricing information",
            "Book a consultation",
            "FAQ",
            "Get started"
          ]
        });
      }
    } catch (error) {
      console.error('Error loading chatbot:', error);
      toast({
        title: "Error loading chatbot",
        description: "Failed to load chatbot data.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = (text: string) => {
    const userMessage = { id: Date.now(), text, isBot: false };
    const botResponse = { id: Date.now() + 1, text: "Thanks for your message! This is a preview response.", isBot: true };
    
    setMessages(prev => [...prev, userMessage, botResponse]);
    setInputMessage("");
  };

  const handleSuggestedResponse = (response: string) => {
    sendMessage(response);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // YouTube URL conversion
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL conversion
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const embedScript = `<script src="https://your-chatbot-domain.com/widget.js" data-chatbot-id="your-chatbot-id" data-name="${chatbotData.name}" data-color="${chatbotData.primaryColor}" data-video-url="${chatbotData.videoUrl}" data-suggested-responses="${chatbotData.showSuggestedResponses}" data-responses='${JSON.stringify(chatbotData.suggestedResponses)}'></script>`;

  const copyEmbedScript = () => {
    navigator.clipboard.writeText(embedScript);
    toast({
      title: "Embed code copied",
      description: "The embed script has been copied to your clipboard."
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const configuration = {
        welcomeMessage: chatbotData.welcomeMessage,
        avatar: chatbotData.avatar,
        primaryColor: chatbotData.primaryColor,
        videoUrl: chatbotData.videoUrl,
        showSuggestedResponses: chatbotData.showSuggestedResponses,
        suggestedResponses: chatbotData.suggestedResponses,
        contactPhone: chatbotData.contactPhone,
        contactEmail: chatbotData.contactEmail,
        position: chatbotData.position
      };

      const embedData = {
        name: chatbotData.name,
        color: chatbotData.primaryColor,
        videoUrl: chatbotData.videoUrl,
        showSuggestedResponses: chatbotData.showSuggestedResponses,
        suggestedResponses: chatbotData.suggestedResponses
      };

      let savedId = chatbotId;

      if (chatbotId) {
        // Update existing chatbot
        const { error } = await supabase
          .from('chatbots')
          .update({
            name: chatbotData.name,
            description: chatbotData.description,
            configuration,
            script_data: embedData,
            embed_code: embedScript,
            calendly_url: chatbotData.calendlyUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', chatbotId);

        if (error) throw error;
      } else {
        // Create new chatbot
        const { data, error } = await supabase
          .from('chatbots')
          .insert({
            name: chatbotData.name,
            description: chatbotData.description,
            configuration,
            script_data: embedData,
            embed_code: embedScript,
            calendly_url: chatbotData.calendlyUrl,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setChatbotId(data.id);
          savedId = data.id;
          // Update URL to reflect we're now editing an existing chatbot
          navigate(`/dashboard/chatbots/edit/${data.id}`, { replace: true });
        }
      }

      // Notify widget to refresh if it exists
      window.postMessage({
        type: 'CHATBOT_UPDATED',
        chatbotId: savedId
      }, '*');

      toast({
        title: "Chatbot saved successfully",
        description: "Your changes have been saved and the chatbot preview will update automatically."
      });
    } catch (error) {
      console.error('Error saving chatbot:', error);
      toast({
        title: "Error saving chatbot",
        description: "Failed to save chatbot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

      
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration">
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
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
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL (YouTube or Vimeo)</Label>
                    <Input
                      id="videoUrl"
                      value={chatbotData.videoUrl}
                      onChange={(e) => setChatbotData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone (optional)</Label>
                    <Input
                      id="contactPhone"
                      value={chatbotData.contactPhone}
                      onChange={(e) => setChatbotData(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="e.g., +1-555-123-4567"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                    <Input
                      id="contactEmail"
                      value={chatbotData.contactEmail}
                      onChange={(e) => setChatbotData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="e.g., contact@example.com"
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calendlyUrl">Calendly URL (optional)</Label>
                    <Input
                      id="calendlyUrl"
                      value={chatbotData.calendlyUrl}
                      onChange={(e) => setChatbotData(prev => ({ ...prev, calendlyUrl: e.target.value }))}
                      placeholder="e.g., https://calendly.com/yourname/consultation"
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will add a "Schedule a Free Consultation" button to your chatbot header
                    </p>
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
                  <div className="space-y-2">
                    <Label>Widget Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'lower-left', label: 'Lower Left' },
                        { value: 'lower-center', label: 'Lower Center' },
                        { value: 'lower-right', label: 'Lower Right' }
                      ].map((position) => (
                        <div
                          key={position.value}
                          className={`p-3 border rounded-lg cursor-pointer text-center text-sm ${
                            chatbotData.position === position.value ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                          onClick={() => setChatbotData(prev => ({ ...prev, position: position.value }))}
                        >
                          {position.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Responses</CardTitle>
                  <CardDescription>
                    Quick response buttons to help users get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="suggested-responses"
                      checked={chatbotData.showSuggestedResponses}
                      onCheckedChange={(checked) => setChatbotData(prev => ({ ...prev, showSuggestedResponses: checked }))}
                    />
                    <Label htmlFor="suggested-responses">Show suggested responses</Label>
                  </div>
                  
                  {chatbotData.showSuggestedResponses && (
                    <div className="space-y-3">
                      <Label>Response Buttons (8 total)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {chatbotData.suggestedResponses.map((response, index) => (
                          <div key={index} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Button {index + 1}</Label>
                            <Input
                              value={response}
                              onChange={(e) => {
                                const newResponses = [...chatbotData.suggestedResponses];
                                newResponses[index] = e.target.value;
                                setChatbotData(prev => ({ ...prev, suggestedResponses: newResponses }));
                              }}
                              placeholder={`Response ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    See how your chatbot will appear to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-muted/30 min-h-[500px] flex flex-col">
                    {/* Video Section */}
                    {chatbotData.videoUrl && (
                      <div className="mb-4">
                        <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                          <iframe
                            src={getEmbedUrl(chatbotData.videoUrl)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </AspectRatio>
                      </div>
                    )}
                    
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
                    
                    <div className="flex-1 space-y-3 max-h-64 overflow-y-auto">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex gap-2 ${message.isBot ? '' : 'justify-end'}`}>
                          {message.isBot && (
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                              style={{ backgroundColor: chatbotData.primaryColor }}
                            >
                              AI
                            </div>
                          )}
                          <div className={`rounded-lg p-3 max-w-[80%] ${
                            message.isBot 
                              ? 'bg-background' 
                              : 'bg-primary text-primary-foreground ml-auto'
                          }`}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      ))}

                      {/* Suggested Response Buttons - only show if it's the first message */}
                      {chatbotData.showSuggestedResponses && messages.length === 1 && (
                        <div className="space-y-2 mt-3">
                          <div className="grid grid-cols-2 gap-2">
                            {chatbotData.suggestedResponses.slice(0, 4).map((response, index) => (
                              <Button
                                key={index}
                                size="sm"
                                onClick={() => handleSuggestedResponse(response)}
                                className="text-xs h-8 justify-start backdrop-blur-sm bg-white/20 border border-white/30 text-foreground hover:bg-white/30 transition-all duration-200 shadow-lg"
                              >
                                {response}
                              </Button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {chatbotData.suggestedResponses.slice(4, 8).map((response, index) => (
                              <Button
                                key={index + 4}
                                size="sm"
                                onClick={() => handleSuggestedResponse(response)}
                                className="text-xs h-8 justify-start backdrop-blur-sm bg-white/20 border border-white/30 text-foreground hover:bg-white/30 transition-all duration-200 shadow-lg"
                              >
                                {response}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t">
                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input 
                          placeholder="Type your message..." 
                          className="flex-1"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                        />
                        <Button type="submit" size="icon" style={{ backgroundColor: chatbotData.primaryColor }}>
                          <span className="text-white">→</span>
                        </Button>
                      </form>
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
                <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Chatbot"}
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="training" className="mt-6">
          {chatbotId ? (
            <ChatbotTraining chatbotId={chatbotId} />
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Please save your chatbot first before adding training data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}