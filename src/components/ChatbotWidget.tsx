import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <Card className="mb-2 w-72 shadow-lg p-4">
          <h4 className="font-medium mb-1">Live Chatbot</h4>
          <p className="text-sm text-muted-foreground">
            Coming soon — plug in your preferred AI/chat provider here. This is a demo placeholder.
          </p>
        </Card>
      )}
      <Button variant="hero" size="lg" onClick={() => setOpen(!open)}>
        {open ? "Close Chat" : "Chat with us"}
      </Button>
    </div>
  );
};

export default ChatbotWidget;
