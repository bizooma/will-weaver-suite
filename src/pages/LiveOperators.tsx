import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedContent } from '@/components/ProtectedContent';
import { Search, MessageSquare, Clock, User, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  chatbot_id: string;
  session_id: string;
  message_count: number;
  conversation_data: any;
  operator_status: string;
  operator_user_id?: string;
  operator_taken_at?: string;
  created_at: string;
  chatbot: {
    name: string;
    id: string;
  };
}

interface Message {
  type: 'user' | 'bot' | 'operator';
  content: string;
  timestamp: string;
}

const LiveOperators = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [operatorNote, setOperatorNote] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch conversations for user's chatbots
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select(`
          *,
          chatbot:chatbots(name, id)
        `)
        .eq('chatbots.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations((data || []) as Conversation[]);
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

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Subscribe to conversation updates
    const conversationChannel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbot_conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
    };
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation?.conversation_data?.messages) {
      const formattedMessages: Message[] = selectedConversation.conversation_data.messages.map((msg: any) => ({
        type: msg.type || (msg.role === 'user' ? 'user' : 'bot'),
        content: msg.content || msg.message,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));
      setMessages(formattedMessages);
    }
  }, [selectedConversation]);

  // Take over conversation
  const takeOverConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({
          operator_status: 'human_active',
          operator_user_id: user.id,
          operator_taken_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (error) throw error;

      // Create operator session
      await supabase
        .from('operator_sessions')
        .insert({
          conversation_id: conversationId,
          operator_user_id: user.id,
        });

      toast({
        title: "Success",
        description: "You've taken over this conversation",
      });

      // Update the selected conversation locally so the message input appears immediately
      setSelectedConversation(prev => prev?.id === conversationId ? {
        ...prev,
        operator_status: 'human_active',
        operator_user_id: user.id,
        operator_taken_at: new Date().toISOString(),
      } : prev);

      fetchConversations();
    } catch (error) {
      console.error('Error taking over conversation:', error);
      toast({
        title: "Error",
        description: "Failed to take over conversation",
        variant: "destructive",
      });
    }
  };

  // Hand back to AI
  const handBackToAI = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({
          operator_status: 'ai',
          operator_user_id: null,
          operator_taken_at: null,
        })
        .eq('id', conversationId);

      if (error) throw error;

      // End operator session
      await supabase
        .from('operator_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('ended_at', null);

      toast({
        title: "Success",
        description: "Conversation handed back to AI",
      });

      fetchConversations();
      setSelectedConversation(null);
    } catch (error) {
      console.error('Error handing back to AI:', error);
      toast({
        title: "Error",
        description: "Failed to hand back conversation",
        variant: "destructive",
      });
    }
  };

  // Send operator message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const newMsg: Message = {
        type: 'operator',
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, newMsg];
      
      const { error } = await supabase
        .from('chatbot_conversations')
        .update({
          conversation_data: {
            ...selectedConversation.conversation_data,
            messages: updatedMessages,
          },
          message_count: updatedMessages.length,
        })
        .eq('id', selectedConversation.id);

      if (error) throw error;

      setMessages(updatedMessages);
      setNewMessage('');
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the customer",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Add operator note
  const addNote = async () => {
    if (!operatorNote.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('operator_notes')
        .insert({
          conversation_id: selectedConversation.id,
          operator_user_id: user.id,
          note: operatorNote,
        });

      if (error) throw error;

      setOperatorNote('');
      toast({
        title: "Note added",
        description: "Internal note has been saved",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.chatbot?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.session_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ai':
        return <Badge variant="secondary">AI Active</Badge>;
      case 'human_requested':
        return <Badge variant="outline">Human Requested</Badge>;
      case 'human_active':
        return <Badge variant="default">Human Active</Badge>;
      default:
        return <Badge variant="secondary">AI Active</Badge>;
    }
  };

  return (
    <ProtectedContent 
      requiredRole="user"
      fallbackTitle="Live Operators - Premium Feature"
      fallbackDescription="Monitor and take over chatbot conversations in real-time. Upgrade to access this feature."
    >
      <div className="h-screen flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Live Operators</h1>
                <p className="text-muted-foreground">Monitor and manage chatbot conversations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r bg-muted/30">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Active Conversations</h2>
                <Badge variant="outline">{filteredConversations.length}</Badge>
              </div>
              
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{conversation.chatbot?.name}</span>
                          {getStatusBadge(conversation.operator_status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MessageSquare className="h-3 w-3" />
                          <span>{conversation.message_count} messages</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{formatDistanceToNow(new Date(conversation.created_at))} ago</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          Session: {conversation.session_id}
                        </p>
                        {conversation.operator_status === 'human_active' && conversation.operator_user_id === user?.id && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                            <User className="h-3 w-3" />
                            <span>You're handling this</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No conversations found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Conversation View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selectedConversation.chatbot?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Session: {selectedConversation.session_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedConversation.operator_status)}
                      {selectedConversation.operator_status === 'ai' && (
                        <Button
                          size="sm"
                          onClick={() => takeOverConversation(selectedConversation.id)}
                        >
                          Take Over
                        </Button>
                      )}
                      {selectedConversation.operator_status === 'human_active' && 
                       selectedConversation.operator_user_id === user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handBackToAI(selectedConversation.id)}
                        >
                          Hand Back to AI
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : message.type === 'operator'
                              ? 'bg-accent text-accent-foreground border-2 border-primary'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.type === 'operator' ? 'You' : message.type === 'user' ? 'Customer' : 'AI'} • {' '}
                            {formatDistanceToNow(new Date(message.timestamp))} ago
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                {selectedConversation.operator_status === 'human_active' && 
                 selectedConversation.operator_user_id === user?.id && (
                  <div className="border-t p-4 space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message to the customer..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        Send
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add internal note (not visible to customer)..."
                        value={operatorNote}
                        onChange={(e) => setOperatorNote(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button 
                        variant="outline"
                        onClick={addNote}
                        disabled={!operatorNote.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                  <p>Choose a conversation from the list to monitor and interact with customers</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
};

export default LiveOperators;