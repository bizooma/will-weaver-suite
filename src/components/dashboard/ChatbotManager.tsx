import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Play, 
  Copy, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  MessageCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatbotBuilder } from "./ChatbotBuilder";
import { ChatbotTrainingWrapper } from "./ChatbotTrainingWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  configuration: any;
  embed_code: string | null;
  conversations?: number;
}

export function ChatbotManager() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewChatbot, setPreviewChatbot] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchChatbots();
    }
  }, [user]);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbots')
        .select(`
          id,
          name,
          description,
          is_active,
          created_at,
          updated_at,
          configuration,
          embed_code
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get conversation counts for each chatbot
      const chatbotsWithCounts = await Promise.all(
        (data || []).map(async (chatbot) => {
          const { count } = await supabase
            .from('chatbot_conversations')
            .select('id', { count: 'exact' })
            .eq('chatbot_id', chatbot.id);
          
          return {
            ...chatbot,
            conversations: count || 0
          };
        })
      );

      setChatbots(chatbotsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load chatbots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChatbot = async (chatbotId: string) => {
    try {
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', chatbotId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setChatbots(chatbots.filter(c => c.id !== chatbotId));
      toast({
        title: "Success",
        description: "Chatbot deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive"
      });
    }
  };

  const copyEmbedCode = (chatbot: Chatbot) => {
    // Generate production-ready embed code using JSDelivr CDN
    const embedCode = `<!-- Amicus Edge Chatbot Widget -->
<script 
  src="https://cdn.jsdelivr.net/gh/lovable-dev/amicus-widget@latest/widget.js" 
  data-amicus-chatbot-id="${chatbot.id}"
  async>
</script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed code copied",
      description: "Paste this code on your website to add the chatbot",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <Routes>
      <Route path="/new" element={<ChatbotBuilder />} />
      <Route path="/edit/:id" element={<ChatbotBuilder />} />
      <Route path="/training/:id" element={<ChatbotTrainingWrapper />} />
      <Route path="/" element={
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Video Chatbots</h1>
              <p className="text-muted-foreground">
                Create and manage AI-powered video chatbots for your website
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard/chatbots/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Chatbot
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {chatbots.map((chatbot) => (
                <Card key={chatbot.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/chatbots/edit/${chatbot.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/chatbots/training/${chatbot.id}`}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Train
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/chatbots/conversations/${chatbot.id}`}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View Conversations
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPreviewChatbot(chatbot.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyEmbedCode(chatbot)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Embed Code
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{chatbot.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteChatbot(chatbot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{chatbot.description || "No description"}</CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={chatbot.is_active ? 'default' : 'secondary'}
                        className={`text-xs ${chatbot.is_active ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                        {chatbot.is_active ? 'active' : 'inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {chatbot.conversations} conversations
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setPreviewChatbot(chatbot.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/dashboard/chatbots/edit/${chatbot.id}`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/dashboard/chatbots/training/${chatbot.id}`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Train
                        </Link>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last modified {formatDate(chatbot.updated_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {/* Create New Chatbot Card */}
              <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Create New Chatbot</h3>
                    <p className="text-sm text-muted-foreground">
                      Build an AI-powered video assistant for your website
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/dashboard/chatbots/new">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {chatbots.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No chatbots yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first AI-powered video chatbot to get started
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/chatbots/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Chatbot
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Preview Dialog */}
          <Dialog open={!!previewChatbot} onOpenChange={() => setPreviewChatbot(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chatbot Preview</DialogTitle>
              </DialogHeader>
              {previewChatbot && (
                <div className="relative">
                  <ChatbotWidget chatbotId={previewChatbot} embedded />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      } />
    </Routes>
  );
}