import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X, Phone, Mail, Play } from "lucide-react";
import { getVideoThumbnail, type VideoThumbnail } from "@/utils/videoThumbnails";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotData {
  id: string;
  name: string;
  description: string;
  welcomeMessage: string;
  primaryColor: string;
  videoUrl: string;
  suggestedResponses: string[];
  showSuggestedResponses: boolean;
  contactPhone: string;
  contactEmail: string;
  calendlyUrl: string;
}

interface ChatbotWidgetProps {
  chatbotId?: string;
}

const ChatbotWidget = ({ chatbotId = "513bdd2e-9865-432c-810d-707c8360b54e" }: ChatbotWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [videoThumbnail, setVideoThumbnail] = useState<VideoThumbnail | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);

  useEffect(() => {
    loadChatbot();
    
    // Listen for chatbot updates from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CHATBOT_UPDATED' && event.data.chatbotId === chatbotId) {
        loadChatbot();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [chatbotId]);

  useEffect(() => {
    if (chatbotData?.welcomeMessage && messages.length === 0) {
      setMessages([{
        id: "welcome",
        text: chatbotData.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [chatbotData?.welcomeMessage]);

  const loadChatbot = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", chatbotId)
        .single();

      if (error) throw error;

      if (data) {
        const config = data.configuration as any;
        const chatbot = {
          id: data.id,
          name: data.name || "AI Assistant",
          description: data.description || "",
          welcomeMessage: config.welcomeMessage || "Hello! How can I help you today?",
          primaryColor: config.primaryColor || "#3b82f6",
          videoUrl: config.videoUrl || "",
          suggestedResponses: config.suggestedResponses || [],
          showSuggestedResponses: config.showSuggestedResponses || false,
          contactPhone: config.contactPhone || "",
          contactEmail: config.contactEmail || "",
          calendlyUrl: data.calendly_url || ""
        };

        setChatbotData(chatbot);

        // Load video thumbnail if video URL exists
        if (chatbot.videoUrl) {
          setThumbnailLoading(true);
          getVideoThumbnail(chatbot.videoUrl)
            .then(thumbnail => {
              setVideoThumbnail(thumbnail);
            })
            .catch(error => {
              console.error('Error loading video thumbnail:', error);
            })
            .finally(() => {
              setThumbnailLoading(false);
            });
        }
      }
    } catch (error) {
      console.error("Error loading chatbot:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "Thanks for your message! This is a demo response.",
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  const handleSuggestedResponse = (response: string) => {
    sendMessage(response);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button variant="hero" size="lg" disabled>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const renderChatButton = () => {
    // Show video thumbnail if available, otherwise fall back to icon
    if (videoThumbnail && !thumbnailLoading) {
      return (
        <div className="relative group">
          <div 
            className="w-20 h-20 rounded-full overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105 border-4"
            style={{ borderColor: chatbotData?.primaryColor || "#3b82f6" }}
            onClick={() => setOpen(!open)}
          >
            <img 
              src={videoThumbnail.url} 
              alt={`${chatbotData?.name} preview`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full shadow-sm text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Chat
          </div>
        </div>
      );
    }

    // Fallback to original button
    return (
      <Button 
        variant="hero" 
        size="lg" 
        onClick={() => setOpen(!open)}
        className="shadow-lg"
        style={chatbotData?.primaryColor ? { backgroundColor: chatbotData.primaryColor } : {}}
      >
        {open ? <X className="h-5 w-5 mr-2" /> : <MessageCircle className="h-5 w-5 mr-2" />}
        {open ? "Close" : "Chat"}
      </Button>
    );
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {open && chatbotData && (
        <Card className="mb-2 w-80 max-h-[calc(100vh-8rem)] shadow-lg flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 bg-red-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {(chatbotData.contactPhone || chatbotData.contactEmail) ? (
                  <div className="flex gap-2">
                    {chatbotData.contactPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 bg-white text-red-800 border-white hover:bg-red-100 hover:text-red-900"
                        asChild
                      >
                        <a href={`tel:${chatbotData.contactPhone}`} className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Call Us
                        </a>
                      </Button>
                    )}
                    {chatbotData.contactEmail && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 bg-white text-red-800 border-white hover:bg-red-100 hover:text-red-900"
                        asChild
                      >
                        <a href={`mailto:${chatbotData.contactEmail}`} className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email Us
                        </a>
                      </Button>
                    )}
                  </div>
                ) : (
                  <h4 className="font-medium text-white">{chatbotData.name}</h4>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Calendly Button - Full Width */}
            {chatbotData.calendlyUrl && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 bg-white text-red-800 border-white hover:bg-red-100 hover:text-red-900"
                asChild
              >
                <a href={chatbotData.calendlyUrl} target="_blank" rel="noopener noreferrer">
                  Schedule a Free Consultation
                </a>
              </Button>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {chatbotData.videoUrl && (
              <div className="p-2">
                <AspectRatio ratio={16 / 9} className="rounded overflow-hidden">
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

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isBot
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {chatbotData.showSuggestedResponses && chatbotData.suggestedResponses.length > 0 && (
              <div className="p-2 border-t">
                <div className="flex flex-wrap gap-1">
                  {chatbotData.suggestedResponses.map((response, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedResponse(response)}
                      className="text-xs h-7"
                    >
                      {response}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
            
            <div className="px-4 border-t-2 border-red-800 bg-red-800">
              <div className="text-xs text-white text-center flex items-center justify-center gap-2">
                Powered by
                <a
                  href="https://legallyinnovative.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/lovable-uploads/22c96565-b032-41c7-85c0-d846886cac6c.png" 
                    alt="Legally Innovative Logo" 
                    className="h-16 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
      {renderChatButton()}
    </div>
  );
};

export default ChatbotWidget;
