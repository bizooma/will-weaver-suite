import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X } from "lucide-react";

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

  useEffect(() => {
    loadChatbot();
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
        setChatbotData({
          id: data.id,
          name: data.name || "AI Assistant",
          description: data.description || "",
          welcomeMessage: config.welcomeMessage || "Hello! How can I help you today?",
          primaryColor: config.primaryColor || "#3b82f6",
          videoUrl: config.videoUrl || "",
          suggestedResponses: config.suggestedResponses || [],
          showSuggestedResponses: config.showSuggestedResponses || false
        });
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
      <div className="fixed bottom-4 right-4 z-50">
        <Button variant="hero" size="lg" disabled>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && chatbotData && (
        <Card className="mb-2 w-80 max-h-[calc(100vh-8rem)] shadow-lg flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 border-b flex items-center justify-between">
            <h4 className="font-medium">{chatbotData.name}</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
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
    </div>
  );
};

export default ChatbotWidget;
