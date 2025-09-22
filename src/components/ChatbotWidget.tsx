import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X, Phone, Mail, Play, Youtube, ExternalLink } from "lucide-react";
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
  position: string;
}

interface ChatbotWidgetProps {
  chatbotId?: string;
  embedded?: boolean;
}

const ChatbotWidget = ({ chatbotId = "513bdd2e-9865-432c-810d-707c8360b54e", embedded = false }: ChatbotWidgetProps) => {
  const [open, setOpen] = useState(embedded);
  const [chatbotData, setChatbotData] = useState<ChatbotData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [videoThumbnail, setVideoThumbnail] = useState<VideoThumbnail | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [videoInteractionTracked, setVideoInteractionTracked] = useState(false);
  const [operatorActive, setOperatorActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          calendlyUrl: data.calendly_url || "",
          position: config.position || "lower-left"
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

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    // Prepare loading placeholder
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "Thinking...",
      isBot: true,
      timestamp: new Date()
    };

    // Add user and loading messages together to avoid race conditions
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");

    try {
      // Generate session ID if not exists
      const sessionId = sessionStorage.getItem(`chatbot_session_${chatbotId}`) || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem(`chatbot_session_${chatbotId}`)) {
        sessionStorage.setItem(`chatbot_session_${chatbotId}`, sessionId);
      }

      // Call the chatbot response function
      const { data, error } = await supabase.functions.invoke('chatbot-response', {
        body: {
          message: text,
          chatbotId: chatbotId,
          sessionId: sessionId
        }
      });

      if (error) throw error;

      // Check if operator is active
      if (data.operatorActive !== undefined) {
        setOperatorActive(data.operatorActive);
      }

      const botResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: data.response || "I apologize, but I'm having trouble responding right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      };

      // Replace loading message with actual response; append if placeholder missing
      setMessages(prev => {
        let replaced = false;
        const next = prev.map(msg => {
          if (msg.id === loadingMessage.id) {
            replaced = true;
            return botResponse;
          }
          return msg;
        });
        return replaced ? next : [...prev, botResponse];
      });

    } catch (error) {
      console.error('Error getting bot response:', error);
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again later or contact us directly for assistance.",
        isBot: true,
        timestamp: new Date()
      };

      // Replace loading message with error response; append if placeholder missing
      setMessages(prev => {
        let replaced = false;
        const next = prev.map(msg => {
          if (msg.id === loadingMessage.id) {
            replaced = true;
            return errorResponse;
          }
          return msg;
        });
        return replaced ? next : [...prev, errorResponse];
      });
    }
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

  const getEmbedUrl = (url: string, options: { autoplay?: boolean; muted?: boolean; loop?: boolean; quality?: string } = {}) => {
    const { autoplay = false, muted = false, loop = false, quality = 'hd720' } = options;
    
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        vq: quality,
        ...(autoplay && { autoplay: '1' }),
        ...(muted && { mute: '1' }),
        ...(loop && { loop: '1', playlist: videoId })
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        vq: quality,
        ...(autoplay && { autoplay: '1' }),
        ...(muted && { mute: '1' }),
        ...(loop && { loop: '1', playlist: videoId })
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      const params = new URLSearchParams({
        ...(autoplay && { autoplay: '1' }),
        ...(muted && { muted: '1' }),
        ...(loop && { loop: '1' })
      });
      return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
    }
    return url;
  };

  const getYouTubeChannelUrl = (videoUrl: string) => {
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return videoUrl;
  };

  const trackVideoInteraction = (action: string) => {
    if (!videoInteractionTracked) {
      setVideoInteractionTracked(true);
      // Track interaction for analytics
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'video_interaction', {
          event_category: 'chatbot',
          event_label: chatbotData?.name,
          action: action
        });
      }
    }
  };

  useEffect(() => {
    if (!videoRef.current || !chatbotData?.videoUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackVideoInteraction('video_viewed');
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [chatbotData?.videoUrl, videoInteractionTracked]);
  const getPositionClass = (position: string) => {
    switch (position) {
      case 'lower-center':
        return 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50';
      case 'lower-right':
        return 'fixed bottom-20 right-4 z-50';
      case 'lower-left':
      default:
        return 'fixed bottom-20 left-4 z-50';
    }
  };

  const wrapperClass = embedded ? "relative w-full" : getPositionClass(chatbotData?.position || "lower-left");
  const cardSizeClass = embedded ? "w-full h-[500px]" : "mb-2 w-80 h-[600px]";

  if (loading) {
    return (
      <div className={wrapperClass}>
        <Button variant="hero" size="lg" disabled>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  const renderChatButton = () => {
    if (embedded) return null;
    
    // Enhanced video thumbnail with professional styling
    if (videoThumbnail && !thumbnailLoading) {
      return (
        <div className="relative group">
          {/* Main avatar container with intelligent cropping */}
          <div 
            className="w-20 h-20 rounded-full overflow-hidden shadow-elegant cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm"
            style={{ 
              borderColor: chatbotData?.primaryColor || "#3b82f6",
              boxShadow: `0 8px 32px ${chatbotData?.primaryColor || "#3b82f6"}20`
            }}
            onClick={() => setOpen(!open)}
          >
            {/* Smart cropping wrapper - centers on face area */}
            <div className="relative w-full h-full">
              <img 
                src={videoThumbnail.url} 
                alt={`${chatbotData?.name} support representative`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                style={{
                  objectPosition: 'center 20%' // Focus on upper area where faces usually are
                }}
              />
              {/* Subtle overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          {/* Status indicator */}
          <div 
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-pulse"
            style={{ backgroundColor: chatbotData?.primaryColor || "#3b82f6" }}
          >
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>

          {/* Enhanced tooltip with professional styling */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200/50 whitespace-nowrap">
            <span className="text-primary font-semibold">●</span> Online • Chat with us
          </div>

          {/* Breathing animation ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 opacity-50 animate-ping"
            style={{ borderColor: chatbotData?.primaryColor || "#3b82f6" }}
          />
        </div>
      );
    }

    // Fallback to enhanced button design
    return (
      <div className="relative group">
        <Button 
          variant="hero" 
          size="lg" 
          onClick={() => setOpen(!open)}
          className="shadow-elegant transition-all duration-300 hover:shadow-glow hover:scale-105 relative overflow-hidden"
          style={chatbotData?.primaryColor ? { 
            backgroundColor: chatbotData.primaryColor,
            boxShadow: `0 8px 32px ${chatbotData.primaryColor}20`
          } : {}}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          
          {open ? <X className="h-5 w-5 mr-2 relative z-10" /> : <MessageCircle className="h-5 w-5 mr-2 relative z-10" />}
          <span className="relative z-10">{open ? "Close" : "Chat"}</span>
        </Button>

        {/* Status indicator for button version */}
        {!open && (
          <div 
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-md animate-pulse"
            style={{ backgroundColor: chatbotData?.primaryColor || "#3b82f6" }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={wrapperClass}>
      {open && chatbotData && (
        <Card className={`${cardSizeClass} shadow-lg flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
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
                  <h4 className="font-medium text-white">
                    {operatorActive ? 'Human Operator' : chatbotData.name}
                  </h4>
                )}
                {operatorActive && (
                  <p className="text-xs text-white/80">Human operator is helping you</p>
                )}
              </div>
              {!embedded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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

            <div className="flex-1 flex flex-col min-h-0">
            {chatbotData.videoUrl && (
              <div className="p-2 flex-shrink-0" ref={videoRef}>
                <AspectRatio ratio={16 / 9} className="rounded overflow-hidden relative group">
                  <iframe
                    src={getEmbedUrl(chatbotData.videoUrl, { autoplay: true, muted: true, loop: true, quality: 'hd720' })}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Dialog open={videoExpanded} onOpenChange={setVideoExpanded}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-white/90 hover:bg-white"
                          onClick={() => trackVideoInteraction('video_expanded')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Full Video
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full p-0">
                        <div className="aspect-video">
                          <iframe
                            src={getEmbedUrl(chatbotData.videoUrl, { autoplay: true, quality: 'hd1080' })}
                            className="w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-4 flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              trackVideoInteraction('youtube_channel_visited');
                              window.open(getYouTubeChannelUrl(chatbotData.videoUrl), '_blank');
                            }}
                          >
                            <Youtube className="h-4 w-4 mr-2" />
                            Visit YouTube Channel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              trackVideoInteraction('video_shared');
                              window.open(getYouTubeChannelUrl(chatbotData.videoUrl), '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Watch on YouTube
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AspectRatio>
                <div className="mt-2 flex gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      trackVideoInteraction('subscribe_clicked');
                      window.open(getYouTubeChannelUrl(chatbotData.videoUrl), '_blank');
                    }}
                  >
                    <Youtube className="h-3 w-3 mr-1" />
                    Subscribe for More
                  </Button>
                </div>
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
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {chatbotData.showSuggestedResponses && chatbotData.suggestedResponses.length > 0 && (
              <div className="p-2 border-t flex-shrink-0">
                <div className="flex flex-wrap gap-1">
                  {chatbotData.suggestedResponses
                    .filter(response => response && response.trim() !== '')
                    .map((response, index) => (
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

            <div className="p-4 border-t flex-shrink-0">
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
            
            <div className="px-4 py-3 border-t bg-white flex-shrink-0">
              <div className="text-xs text-gray-600 text-center flex items-center justify-center gap-2">
                Powered by
                <a
                  href="https://legallyinnovative.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="h-8 w-auto"
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
