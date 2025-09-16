import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, Calendar, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  session_id: string;
  message_count: number;
  conversation_data: any;
  created_at: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export function ChatbotConversations() {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatbotName, setChatbotName] = useState("");

  useEffect(() => {
    if (chatbotId) {
      fetchChatbotInfo();
      fetchConversations();
    }
  }, [chatbotId]);

  const fetchChatbotInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('chatbots')
        .select('name')
        .eq('id', chatbotId)
        .single();

      if (error) throw error;
      setChatbotName(data.name);
    } catch (error) {
      console.error('Error fetching chatbot info:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportConversations = () => {
    const csvContent = conversations.map(conv => {
      const messages = conv.conversation_data?.messages || [];
      const messageText = messages.map((m: Message) => `${m.type}: ${m.content}`).join(' | ');
      return `${conv.session_id},${conv.message_count},${conv.created_at},"${messageText}"`;
    }).join('\n');

    const header = 'Session ID,Message Count,Created At,Messages\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chatbotName}_conversations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.conversation_data?.messages || []).some((msg: Message) => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderMessage = (message: Message) => (
    <div key={message.timestamp} className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        message.type === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard/chatbots')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbots
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">{chatbotName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConversations}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations ({filteredConversations.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          {conversation.session_id.slice(-8)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conversation.message_count} messages
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(conversation.created_at), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedConversation 
                  ? `Conversation ${selectedConversation.session_id.slice(-8)}`
                  : 'Select a conversation'
                }
              </CardTitle>
              {selectedConversation && (
                <p className="text-sm text-muted-foreground">
                  Started {format(new Date(selectedConversation.created_at), 'MMMM d, yyyy \'at\' HH:mm')}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="max-h-[500px] overflow-y-auto">
                  {selectedConversation.conversation_data?.messages?.length > 0 ? (
                    selectedConversation.conversation_data.messages.map((message: Message) => 
                      renderMessage(message)
                    )
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages in this conversation</p>
                      <p className="text-sm">Conversation data may not be fully logged</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}