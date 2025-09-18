import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, MessageSquare, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveOperatorLink = () => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Monitor className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Operators</CardTitle>
              <CardDescription>
                Monitor and take over chatbot conversations in real-time
              </CardDescription>
            </div>
          </div>
          <Link to="/dashboard/live-operators">
            <Button>
              Open Dashboard
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Real-time Monitoring</div>
            <div className="text-xs text-muted-foreground">
              See live conversations across all your chatbots
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Human Takeover</div>
            <div className="text-xs text-muted-foreground">
              Seamlessly switch from AI to human support
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-medium">Instant Response</div>
            <div className="text-xs text-muted-foreground">
              Respond to customers in real-time
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Premium feature • Available for all paid users
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOperatorLink;