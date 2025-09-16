import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Calendar,
  Loader2,
  Trash2
} from "lucide-react";
import { getUserDrafts, deleteDraft, WillDraft } from "@/hooks/useWillDrafts";
import { exportWillDocx } from "@/utils/docxExport";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
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

export function WillManager() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<WillDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDraft, setDeletingDraft] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const userDrafts = await getUserDrafts();
      setDrafts(userDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      setDeletingDraft(draftId);
      await deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    } finally {
      setDeletingDraft(null);
    }
  };

  const handleExportDocx = async (draft: WillDraft) => {
    try {
      const data = draft.data as any;
      let content = `Will for ${data?.fullName || 'Unknown'}`;
      
      if (typeof draft.data === 'object' && draft.data !== null) {
        content = JSON.stringify(draft.data, null, 2);
      }
      
      await exportWillDocx({
        title: `Will for ${data?.fullName || 'Unknown'}`,
        content,
        filename: `will-${draft.slug}.docx`
      });
      
      toast.success('Will exported successfully');
    } catch (error) {
      console.error('Error exporting will:', error);
      toast.error('Failed to export will');
    }
  };

  const getDisplayTitle = (draft: WillDraft) => {
    try {
      const data = draft.data as any;
      if (data?.fullName) {
        return `Will for ${data.fullName}`;
      }
    } catch (error) {
      console.error('Error parsing draft data:', error);
    }
    return `Will Draft`;
  };

  const getStatus = (draft: WillDraft) => {
    if (draft.step === null || draft.step === undefined) return 'draft';
    if (draft.step >= 10) return 'completed';
    return 'in-progress';
  };

  if (loading) {
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

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
                    <CardTitle className="text-lg">{getDisplayTitle(draft)}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">Will</Badge>
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={getStatus(draft) === 'completed' ? 'default' : 'secondary'}
                >
                  {getStatus(draft)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/draft/${draft.slug}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/will-creator?draft=${draft.slug}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExportDocx(draft)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/will-creator?draft=${draft.slug}&white-label=1`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  White Label
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this will draft? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteDraft(draft.id)}
                        disabled={deletingDraft === draft.id}
                      >
                        {deletingDraft === draft.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drafts.length === 0 && (
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
      )}
    </div>
  );
}