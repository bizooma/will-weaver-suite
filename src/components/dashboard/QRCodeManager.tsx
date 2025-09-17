import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, Plus, Eye, Edit, Trash2, Copy, BarChart3, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCodeLib from "qrcode";
import { generateSlug } from "@/utils/slug";

interface QRCodeData {
  id: string;
  name: string;
  slug: string;
  target_url: string;
  qr_config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface QRScanData {
  totalScans: number;
  scansToday: number;
  scansLastWeek: number;
  topCountries: Array<{ country: string; count: number }>;
  hourlyScans: Array<{ hour: number; count: number }>;
  recentScans: Array<any>;
}

export function QRCodeManager() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null);
  const [analytics, setAnalytics] = useState<QRScanData | null>(null);
  const [qrCodeImage, setQRCodeImage] = useState<string>("");
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<QRCodeData | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    target_url: "",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    size: 256,
  });

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQRCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeImage = async (qrCode: QRCodeData): Promise<string> => {
    const redirectUrl = `https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1/qr-redirect/${qrCode.slug}`;
    return await QRCodeLib.toDataURL(redirectUrl, {
      color: {
        dark: qrCode.qr_config.foregroundColor || '#000000',
        light: qrCode.qr_config.backgroundColor || '#ffffff',
      },
      width: qrCode.qr_config.size || 256,
    });
  };

  const downloadQRCode = async (qrCode: QRCodeData, format: string = 'png') => {
    try {
      const dataUrl = await generateQRCodeImage(qrCode);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${qrCode.name.replace(/\s+/g, '_')}_qr_code.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const showPreview = async (qrCode: QRCodeData) => {
    try {
      const image = await generateQRCodeImage(qrCode);
      setPreviewImage(image);
      setPreviewQRCode(qrCode);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate QR code preview');
    }
  };

  const createQRCode = async () => {
    if (!formData.name || !formData.target_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const slug = generateSlug();
      
      const { data, error } = await supabase.functions.invoke('qr-generate', {
        body: {
          name: formData.name,
          target_url: formData.target_url,
          slug,
          qr_config: {
            foregroundColor: formData.foregroundColor,
            backgroundColor: formData.backgroundColor,
            size: formData.size,
            errorCorrectionLevel: 'M'
          }
        }
      });

      if (error) throw error;

      toast.success('QR code created successfully!');
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        target_url: "",
        foregroundColor: "#000000",
        backgroundColor: "#ffffff",
        size: 256,
      });
      
      // Show preview with the newly created QR code
      if (data?.qrCode) {
        await showPreview(data.qrCode);
      }
      
      fetchQRCodes();
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error('Failed to create QR code');
    }
  };

  const updateQRCode = async (id: string, updates: Partial<QRCodeData>) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('QR code updated successfully!');
      fetchQRCodes();
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast.error('Failed to update QR code');
    }
  };

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('QR code deleted successfully!');
      fetchQRCodes();
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };

  const fetchAnalytics = async (qrCode: QRCodeData) => {
    try {
      const { data, error } = await supabase.functions.invoke('qr-analytics', {
        body: { qr_code_id: qrCode.id }
      });

      if (error) throw error;
      setAnalytics(data);
      setSelectedQRCode(qrCode);
      
      // Generate QR code image
      const qrImage = await generateQRCodeImage(qrCode);
      setQRCodeImage(qrImage);
      setAnalyticsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const copyQRUrl = async (slug: string) => {
    const url = `https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1/qr-redirect/${slug}`;
    await navigator.clipboard.writeText(url);
    toast.success('QR code URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading QR codes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Code Manager</h1>
          <p className="text-muted-foreground">Create and manage dynamic QR codes with analytics</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create QR Code
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New QR Code</DialogTitle>
              <DialogDescription>
                Generate a new QR code with custom styling and tracking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="My QR Code"
                />
              </div>
              <div>
                <Label htmlFor="target_url">Target URL *</Label>
                <Input
                  id="target_url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="foreground">Foreground Color</Label>
                  <Input
                    id="foreground"
                    type="color"
                    value={formData.foregroundColor}
                    onChange={(e) => setFormData({...formData, foregroundColor: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="background">Background Color</Label>
                  <Input
                    id="background"
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="size">Size (pixels)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                  min="128"
                  max="512"
                />
              </div>
              <Button onClick={createQRCode} className="w-full">
                Create QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first QR code to start tracking scans and engagement
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create QR Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="bg-card border border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                  <Badge variant={qrCode.is_active ? "default" : "secondary"}>
                    {qrCode.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="break-all">
                  {qrCode.target_url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchAnalytics(qrCode)}
                    className="gap-1"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Analytics
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyQRUrl(qrCode.slug)}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(qrCode)}
                    className="gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQRCode(qrCode.id, { is_active: !qrCode.is_active })}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {qrCode.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteQRCode(qrCode.id)}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Created: {new Date(qrCode.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Dialog */}
      <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Analytics - {selectedQRCode?.name}</DialogTitle>
            <DialogDescription>
              Scan analytics and performance metrics
            </DialogDescription>
          </DialogHeader>
          {analytics && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                {qrCodeImage && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={qrCodeImage} alt="QR Code" className="w-24 h-24" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => selectedQRCode && downloadQRCode(selectedQRCode)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analytics.totalScans}</div>
                    <div className="text-sm text-muted-foreground">Total Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analytics.scansToday}</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{analytics.scansLastWeek}</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </div>
                </div>
              </div>

              {analytics.topCountries.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Top Countries</h4>
                  <div className="space-y-2">
                    {analytics.topCountries.map((country, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{country.country || 'Unknown'}</span>
                        <Badge variant="secondary">{country.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.recentScans.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recent Scans</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analytics.recentScans.slice(0, 5).map((scan, index) => (
                      <div key={index} className="text-sm text-muted-foreground">
                        {new Date(scan.scanned_at).toLocaleString()}
                        {scan.country && ` - ${scan.country}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>QR Code Created!</DialogTitle>
            <DialogDescription>
              Your QR code "{previewQRCode?.name}" has been created successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewImage && (
              <div className="flex flex-col items-center gap-4">
                <img src={previewImage} alt="Generated QR Code" className="w-48 h-48 border rounded" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => previewQRCode && downloadQRCode(previewQRCode)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => previewQRCode && copyQRUrl(previewQRCode.slug)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}