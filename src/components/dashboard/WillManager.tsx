import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Plus, 
  Settings, 
  Download, 
  Eye,
  Edit,
  Calendar,
  Loader2,
  Trash2,
  Code,
  Copy,
  ExternalLink,
  Palette,
  Building2,
  Image,
  Globe
} from "lucide-react";
import { getUserDrafts, deleteDraft, WillDraft } from "@/hooks/useWillDrafts";
import { exportWillDocx } from "@/utils/docxExport";
import { useUserSettings } from "@/hooks/useUserSettings";
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
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const [drafts, setDrafts] = useState<WillDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingDraft, setDeletingDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (settings.company_name) params.set('brand', settings.company_name);
    if (settings.brand_color) {
      params.set('primary', settings.brand_color);
      // Generate accent color (lighter version of primary)
      const hex = settings.brand_color;
      const accent = hex + '80'; // Add transparency or use a lighter shade
      params.set('accent', accent);
    }
    if (settings.logo_url) params.set('logo', settings.logo_url);
    
    return `${window.location.origin}/will-creator${params.toString() ? '?' + params.toString() : ''}`;
  }, [settings]);

  const iframeCode = `<iframe
  src="${previewUrl}&embed=1"
  width="100%"
  height="900"
  style="border:0;"
  loading="lazy"
  title="Will Creator"
></iframe>`;

  const handleCopyEmbedCode = () => {
    navigator.clipboard.writeText(iframeCode);
    toast.success('Embed code copied to clipboard');
  };

  const handlePreview = () => {
    window.open(`${previewUrl}&embed=1`, '_blank');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings(settings);
      toast.success('White-label settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

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

      {/* White Label Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            White Label Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settings.white_label_enabled && (
            <div className="text-center space-y-4 max-w-2xl mx-auto py-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  With our white-label solution, your firm's branding stays front and center. To your clients, it's your technology—modern, professional, and convenient.
                </p>
                <p>
                  Bring your estate planning practice into the digital age. Offer your clients the first step in will creation—guided by you, powered by us. Click the button below to get started.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="white-label-enabled"
              checked={settings.white_label_enabled}
              onCheckedChange={(checked) => 
                updateSettings({ white_label_enabled: checked })
              }
            />
            <Label htmlFor="white-label-enabled">Enable White Label Branding</Label>
          </div>

          {settings.white_label_enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name
                </Label>
                <Input
                  id="company-name"
                  value={settings.company_name || ''}
                  onChange={(e) => updateSettings({ company_name: e.target.value })}
                  placeholder="Your Law Firm Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Brand Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="brand-color"
                    type="color"
                    value={settings.brand_color || '#3b82f6'}
                    onChange={(e) => updateSettings({ brand_color: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={settings.brand_color || '#3b82f6'}
                    onChange={(e) => updateSettings({ brand_color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Logo URL
                </Label>
                <Input
                  id="logo-url"
                  value={settings.logo_url || ''}
                  onChange={(e) => updateSettings({ logo_url: e.target.value })}
                  placeholder="https://your-firm.com/logo.png"
                />
                {settings.logo_url && (
                  <div className="mt-2">
                    <img 
                      src={settings.logo_url} 
                      alt="Logo preview" 
                      className="h-12 w-auto border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-domain" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Custom Domain
                </Label>
                <Input
                  id="custom-domain"
                  value={settings.custom_domain || ''}
                  onChange={(e) => updateSettings({ custom_domain: e.target.value })}
                  placeholder="your-firm.com"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Settings
            </Button>
            
            {settings.white_label_enabled && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Embed Code Section */}
      {!settingsLoading && settings.white_label_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Embed Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use this embed code to integrate the will creator into your website:
              </p>
              <Textarea
                readOnly
                value={iframeCode}
                rows={8}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyEmbedCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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