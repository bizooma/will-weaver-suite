import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Settings, 
  Download, 
  Eye,
  Edit,
  Calendar
} from "lucide-react";

export function WillManager() {
  const drafts = [
    {
      id: "1",
      title: "Johnson Family Trust",
      status: "completed",
      lastModified: "2 days ago",
      type: "Trust"
    },
    {
      id: "2",
      title: "Personal Will Draft",
      status: "in-progress", 
      lastModified: "1 week ago",
      type: "Will"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Will Creator</h1>
          <p className="text-muted-foreground">
            Create and manage wills and trust documents
          </p>
        </div>
        <Button asChild>
          <Link to="/will-creator">
            <Plus className="h-4 w-4 mr-2" />
            Create New Will
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {drafts.map((draft) => (
          <Card key={draft.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{draft.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{draft.type}</Badge>
                      <Calendar className="h-3 w-3" />
                      {draft.lastModified}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={draft.status === 'completed' ? 'default' : 'secondary'}
                >
                  {draft.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  White Label
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="font-medium">Create Your First Will</h3>
            <p className="text-sm text-muted-foreground">
              Get started with our guided will creation process
            </p>
          </div>
          <Button asChild>
            <Link to="/will-creator">Start Creating</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}