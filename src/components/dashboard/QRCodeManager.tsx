import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Plus, Eye, Edit, Trash2, Copy, BarChart3, Download, Palette, Settings } from "lucide-react";
import { useDemoSupabase } from "@/hooks/useDemoSupabase";
import { useDemoEdgeFunctions } from "@/hooks/useDemoEdgeFunctions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ColorPicker } from "@/components/ui/color-picker";
import { PatternSelector } from "@/components/ui/pattern-selector";
import QRCodeStyling from "qr-code-styling";
import { generateSlug } from "@/utils/slug";
import { QRCodeAnalyticsDashboard, type QRAnalyticsData } from "./QRCodeAnalyticsDashboard";

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

// Analytics data now uses the rich QRAnalyticsData type from the dashboard component

export function QRCodeManager() {
  const supabase = useDemoSupabase();
  const { invoke } = useDemoEdgeFunctions();
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null);
  const [analytics, setAnalytics] = useState<QRAnalyticsData | null>(null);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
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
    eyeColor: "#000000",
    eyeInnerColor: "#000000",
    size: 256,
    eyePattern: "square",
    dataPattern: "square",
    errorCorrectionLevel: "M",
    margin: 4,
  });

  // Real-time preview state
  const [livePreview, setLivePreview] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

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
    
    return new Promise((resolve) => {
      const qrCodeStyling = new QRCodeStyling({
        width: qrCode.qr_config.size || 256,
        height: qrCode.qr_config.size || 256,
        data: redirectUrl,
        margin: qrCode.qr_config.margin || 4,
        qrOptions: {
          errorCorrectionLevel: qrCode.qr_config.errorCorrectionLevel || "M"
        },
        dotsOptions: {
          color: qrCode.qr_config.foregroundColor || "#000000",
          type: qrCode.qr_config.dataPattern as any || "square"
        },
        backgroundOptions: {
          color: qrCode.qr_config.backgroundColor || "#ffffff"
        },
        cornersSquareOptions: {
          color: qrCode.qr_config.eyeColor || qrCode.qr_config.foregroundColor || "#000000",
          type: qrCode.qr_config.eyePattern as any || "square"
        },
        cornersDotOptions: {
          color: qrCode.qr_config.eyeInnerColor || qrCode.qr_config.foregroundColor || "#000000",
          type: qrCode.qr_config.eyePattern as any || "square"
        }
      });

      const canvas = document.createElement('canvas');
      qrCodeStyling.append(canvas);
      qrCodeStyling.getRawData('png').then((blob) => {
        if (blob && blob instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        }
      });
    });
  };

  // Generate live preview
  const generateLivePreview = async () => {
    if (!formData.target_url) {
      setLivePreview("");
      return;
    }

    setPreviewLoading(true);
    try {
      const qrCodeStyling = new QRCodeStyling({
        width: formData.size,
        height: formData.size,
        data: formData.target_url,
        margin: formData.margin,
        qrOptions: {
          errorCorrectionLevel: formData.errorCorrectionLevel as any
        },
        dotsOptions: {
          color: formData.foregroundColor,
          type: formData.dataPattern as any || "square"
        },
        backgroundOptions: {
          color: formData.backgroundColor
        },
        cornersSquareOptions: {
          color: formData.eyeColor,
          type: formData.eyePattern as any || "square"
        },
        cornersDotOptions: {
          color: formData.eyeInnerColor,
          type: formData.eyePattern as any || "square"
        }
      });

      const canvas = document.createElement('canvas');
      qrCodeStyling.append(canvas);
      const blob = await qrCodeStyling.getRawData('png');
      if (blob && blob instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => setLivePreview(reader.result as string);
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error generating live preview:', error);
      setLivePreview("");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Update live preview when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateLivePreview();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.target_url, formData.foregroundColor, formData.backgroundColor, formData.eyeColor, formData.eyeInnerColor, formData.size, formData.margin, formData.errorCorrectionLevel, formData.eyePattern, formData.dataPattern]);

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
      
      const { data, error } = await invoke('qr-generate', {
        body: {
          name: formData.name,
          target_url: formData.target_url,
          slug,
          qr_config: {
            foregroundColor: formData.foregroundColor,
            backgroundColor: formData.backgroundColor,
            eyeColor: formData.eyeColor,
            eyeInnerColor: formData.eyeInnerColor,
            size: formData.size,
            eyePattern: formData.eyePattern,
            dataPattern: formData.dataPattern,
            errorCorrectionLevel: formData.errorCorrectionLevel,
            margin: formData.margin,
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
        eyeColor: "#000000",
        eyeInnerColor: "#000000",
        size: 256,
        eyePattern: "square",
        dataPattern: "square",
        errorCorrectionLevel: "M",
        margin: 4,
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

  /** Fetch rich analytics from the edge function and open the full dashboard. */
  const fetchAnalytics = async (qrCode: QRCodeData) => {
    try {
      const response = await fetch(
        `https://fmcgsxdtyvssvwtxufll.supabase.co/functions/v1/qr-analytics?qr_code_id=${qrCode.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtY2dzeGR0eXZzc3Z3dHh1ZmxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTk2MjcsImV4cCI6MjA3MDMzNTYyN30.VC_lIcDwR_0EJrIROf7E8809pxkUPco8mPKd_s30UVU',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data: QRAnalyticsData = await response.json();
      setAnalytics(data);
      setSelectedQRCode(qrCode);
      setShowAnalyticsDashboard(true);
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

  // If the full analytics dashboard is open, render it instead of the QR list
  if (showAnalyticsDashboard && analytics) {
    return (
      <div className="p-6">
        <QRCodeAnalyticsDashboard
          data={analytics}
          onBack={() => setShowAnalyticsDashboard(false)}
        />
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Create New QR Code
              </DialogTitle>
              <DialogDescription>
                Generate a customized QR code with advanced styling options and analytics tracking
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="colors">
                      <Palette className="h-4 w-4 mr-2" />
                      Colors
                    </TabsTrigger>
                    <TabsTrigger value="advanced">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
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
                    <div>
                      <Label htmlFor="size">Size (pixels)</Label>
                      <Input
                        id="size"
                        type="number"
                        value={formData.size}
                        onChange={(e) => setFormData({...formData, size: parseInt(e.target.value)})}
                        min="128"
                        max="1024"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <ColorPicker
                        label="Foreground Color"
                        value={formData.foregroundColor}
                        onChange={(color) => setFormData({...formData, foregroundColor: color})}
                      />
                      <ColorPicker
                        label="Background Color"
                        value={formData.backgroundColor}
                        onChange={(color) => setFormData({...formData, backgroundColor: color})}
                      />
                      <Separator />
                      <ColorPicker
                        label="Eye Color"
                        value={formData.eyeColor}
                        onChange={(color) => setFormData({...formData, eyeColor: color})}
                      />
                      <ColorPicker
                        label="Eye Inner Color"
                        value={formData.eyeInnerColor}
                        onChange={(color) => setFormData({...formData, eyeInnerColor: color})}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <PatternSelector
                      label="Eye Pattern"
                      value={formData.eyePattern}
                      onChange={(pattern) => setFormData({...formData, eyePattern: pattern})}
                      options={[
                        { id: "square", name: "Square", preview: <div className="w-4 h-4 bg-foreground"></div> },
                        { id: "rounded", name: "Rounded", preview: <div className="w-4 h-4 bg-foreground rounded"></div> },
                        { id: "circle", name: "Circle", preview: <div className="w-4 h-4 bg-foreground rounded-full"></div> }
                      ]}
                    />
                    
                    <PatternSelector
                      label="Data Pattern"
                      value={formData.dataPattern}
                      onChange={(pattern) => setFormData({...formData, dataPattern: pattern})}
                      options={[
                        { id: "square", name: "Square", preview: <div className="w-3 h-3 bg-foreground"></div> },
                        { id: "rounded", name: "Rounded", preview: <div className="w-3 h-3 bg-foreground rounded-sm"></div> },
                        { id: "circle", name: "Circle", preview: <div className="w-3 h-3 bg-foreground rounded-full"></div> }
                      ]}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="margin">Margin</Label>
                        <Input
                          id="margin"
                          type="number"
                          value={formData.margin}
                          onChange={(e) => setFormData({...formData, margin: parseInt(e.target.value)})}
                          min="0"
                          max="20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="errorCorrection">Error Correction</Label>
                        <select
                          id="errorCorrection"
                          value={formData.errorCorrectionLevel}
                          onChange={(e) => setFormData({...formData, errorCorrectionLevel: e.target.value})}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="L">Low (7%)</option>
                          <option value="M">Medium (15%)</option>
                          <option value="Q">Quartile (25%)</option>
                          <option value="H">High (30%)</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Button onClick={createQRCode} className="w-full" size="lg">
                  Create QR Code
                </Button>
              </div>
              
              {/* Preview Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <Label className="text-sm font-medium mb-3 block">Live Preview</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 flex items-center justify-center bg-muted/30 min-h-[300px]">
                    {previewLoading ? (
                      <div className="animate-pulse text-muted-foreground">Generating preview...</div>
                    ) : livePreview ? (
                      <img 
                        src={livePreview} 
                        alt="QR Code Preview" 
                        className="max-w-[200px] max-h-[200px] object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Enter a URL to see preview</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {formData.target_url && (
                  <div className="w-full p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Target URL:</span>
                      <p className="text-muted-foreground break-all mt-1">{formData.target_url}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Size:</span> {formData.size}px
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Error Correction:</span> {formData.errorCorrectionLevel}
                    </div>
                  </div>
                )}
              </div>
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
                  <Badge variant={qrCode.is_active ? "default" : "secondary"} className={qrCode.is_active ? "bg-green-600 hover:bg-green-700" : ""}>
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

      {/* Analytics Dialog removed — replaced by inline dashboard below */}

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