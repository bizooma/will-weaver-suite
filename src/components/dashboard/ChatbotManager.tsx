import React, { useState } from "react";
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
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatbotBuilder } from "./ChatbotBuilder";

export function ChatbotManager() {
  const [chatbots] = useState([
    {
      id: "1",
      name: "Legal Assistant",
      description: "General legal inquiries and FAQ responses",
      status: "active",
      conversations: 127,
      lastModified: "2 hours ago"
    },
    {
      id: "2", 
      name: "Will Creator Helper",
      description: "Guides users through will creation process",
      status: "draft",
      conversations: 45,
      lastModified: "1 day ago"
    },
    {
      id: "3",
      name: "Contract Review Bot",
      description: "Initial contract review and analysis",
      status: "active",
      conversations: 89,
      lastModified: "3 days ago"
    }
  ]);

  return (
    <Routes>
      <Route path="/new" element={<ChatbotBuilder />} />
      <Route path="/edit/:id" element={<ChatbotBuilder />} />
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{chatbot.description}</CardDescription>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={chatbot.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {chatbot.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {chatbot.conversations} conversations
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last modified {chatbot.lastModified}
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
          </div>
        </div>
      } />
    </Routes>
  );
}