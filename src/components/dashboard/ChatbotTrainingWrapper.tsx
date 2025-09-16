import React from "react";
import { useParams } from "react-router-dom";
import { ChatbotTraining } from "./ChatbotTraining";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function ChatbotTrainingWrapper() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid Chatbot ID</h2>
          <p className="text-muted-foreground mb-4">The chatbot ID is missing or invalid.</p>
          <Button asChild>
            <Link to="/dashboard/chatbots">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chatbots
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/chatbots">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbots
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Train Chatbot</h1>
          <p className="text-muted-foreground">
            Add content to train your chatbot and improve its responses
          </p>
        </div>
      </div>
      
      <ChatbotTraining chatbotId={id} />
    </div>
  );
}