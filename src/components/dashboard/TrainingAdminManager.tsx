import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  GripVertical,
  Youtube,
  Eye,
  EyeOff,
  Users
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as icons from "lucide-react";

// Admin interface types
interface TrainingCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  video_count?: number;
}

interface TrainingVideo {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  youtube_id: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface CategoryForm {
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
}

interface VideoForm {
  title: string;
  description: string;
  youtube_url: string;
  duration_minutes: string;
  category_id: string;
  is_active: boolean;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

/**
 * Generate YouTube thumbnail URL from video ID
 */
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Available Lucide icons for categories
 */
const CATEGORY_ICONS = [
  'Search', 'MousePointer', 'Share2', 'FileText', 'Mail', 
  'MapPin', 'TrendingUp', 'BarChart', 'Users', 'BookOpen',
  'Laptop', 'Smartphone', 'Globe', 'Shield', 'Zap',
  'Target', 'Heart', 'Star', 'Award', 'Briefcase'
];

/**
 * Categories Management - List and manage training categories
 */
function CategoriesManagement() {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<TrainingCategory | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    description: '',
    icon: 'BookOpen',
    is_active: true
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load all training categories with video counts
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const { data: categoriesData, error } = await supabase
        .from('platform_training_categories')
        .select(`
          *,
          videos:platform_training_videos(count)
        `)
        .order('display_order');

      if (error) throw error;

      const enhancedCategories = categoriesData?.map(category => ({
        ...category,
        video_count: category.videos?.[0]?.count || 0
      })) || [];

      setCategories(enhancedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save category (create or update)
   */
  const saveCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast({
          title: "Error",
          description: "Category name is required.",
          variant: "destructive",
        });
        return;
      }

      const categoryData = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        icon: categoryForm.icon,
        is_active: categoryForm.is_active,
        display_order: editingCategory?.display_order || categories.length
      };

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('platform_training_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category updated successfully.",
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('platform_training_categories')
          .insert([categoryData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Category created successfully.",
        });
      }

      // Reset form and reload
      setCategoryForm({ name: '', description: '', icon: 'BookOpen', is_active: true });
      setEditingCategory(null);
      setShowAddDialog(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete category
   */
  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('platform_training_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
      
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Start editing a category
   */
  const startEditCategory = (category: TrainingCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'BookOpen',
      is_active: category.is_active
    });
    setShowAddDialog(true);
  };

  /**
   * Get icon component for display
   */
  const getIconComponent = (iconName: string) => {
    const IconComponent = icons[iconName as keyof typeof icons] as React.ComponentType<any>;
    return IconComponent || icons.BookOpen;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage training video categories and organization
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: '', description: '', icon: 'BookOpen', is_active: true });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the category details below.' 
                  : 'Create a new training category for organizing videos.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Search Engine Optimization"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select 
                  value={categoryForm.icon} 
                  onValueChange={(value) => setCategoryForm(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ICONS.map(iconName => {
                      const IconComponent = getIconComponent(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={categoryForm.is_active}
                  onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveCategory}>
                <Save className="h-4 w-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon || 'BookOpen');
          
          return (
            <Card key={category.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {category.name}
                        {!category.is_active && (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {category.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"? 
                            This will also delete all videos in this category. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCategory(category.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{category.video_count || 0} videos</span>
                    <span>Order: {category.display_order}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/dashboard/training/admin/category/${category.id}`)}
                  >
                    Manage Videos
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No categories created yet.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Category
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Videos Management - Manage videos within a specific category
 */
function VideosManagement({ categoryId }: { categoryId: string }) {
  const [category, setCategory] = useState<TrainingCategory | null>(null);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [videoForm, setVideoForm] = useState<VideoForm>({
    title: '',
    description: '',
    youtube_url: '',
    duration_minutes: '',
    category_id: categoryId,
    is_active: true
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategoryVideos();
  }, [categoryId]);

  /**
   * Load category and its videos
   */
  const loadCategoryVideos = async () => {
    try {
      setLoading(true);
      
      // Get category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('platform_training_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;

      // Get videos in this category
      const { data: videosData, error: videosError } = await supabase
        .from('platform_training_videos')
        .select('*')
        .eq('category_id', categoryId)
        .order('display_order');

      if (videosError) throw videosError;

      setCategory(categoryData);
      setVideos(videosData || []);
    } catch (error) {
      console.error('Error loading category videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save video (create or update)
   */
  const saveVideo = async () => {
    try {
      if (!videoForm.title.trim()) {
        toast({
          title: "Error",
          description: "Video title is required.",
          variant: "destructive",
        });
        return;
      }

      if (!videoForm.youtube_url.trim()) {
        toast({
          title: "Error",
          description: "YouTube URL is required.",
          variant: "destructive",
        });
        return;
      }

      // Extract YouTube ID
      const youtubeId = extractYouTubeId(videoForm.youtube_url);
      if (!youtubeId) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL. Please provide a valid YouTube video URL.",
          variant: "destructive",
        });
        return;
      }

      const videoData = {
        title: videoForm.title,
        description: videoForm.description || null,
        youtube_url: videoForm.youtube_url,
        youtube_id: youtubeId,
        thumbnail_url: getYouTubeThumbnail(youtubeId),
        duration_minutes: videoForm.duration_minutes ? parseInt(videoForm.duration_minutes) : null,
        category_id: categoryId,
        is_active: videoForm.is_active,
        display_order: editingVideo?.display_order || videos.length
      };

      if (editingVideo) {
        // Update existing video
        const { error } = await supabase
          .from('platform_training_videos')
          .update(videoData)
          .eq('id', editingVideo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video updated successfully.",
        });
      } else {
        // Create new video
        const { error } = await supabase
          .from('platform_training_videos')
          .insert([videoData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video added successfully.",
        });
      }

      // Reset form and reload
      setVideoForm({
        title: '',
        description: '',
        youtube_url: '',
        duration_minutes: '',
        category_id: categoryId,
        is_active: true
      });
      setEditingVideo(null);
      setShowAddDialog(false);
      loadCategoryVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Error",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Delete video
   */
  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('platform_training_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully.",
      });
      
      loadCategoryVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Start editing a video
   */
  const startEditVideo = (video: TrainingVideo) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      duration_minutes: video.duration_minutes?.toString() || '',
      category_id: video.category_id,
      is_active: video.is_active
    });
    setShowAddDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading videos...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Category not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/training/admin')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard/training/admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground mt-1">Manage videos in this category</p>
          </div>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVideo(null);
              setVideoForm({
                title: '',
                description: '',
                youtube_url: '',
                duration_minutes: '',
                category_id: categoryId,
                is_active: true
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </DialogTitle>
              <DialogDescription>
                {editingVideo 
                  ? 'Update the video details below.' 
                  : 'Add a new training video to this category.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to SEO for Law Firms"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube URL</Label>
                <Input
                  id="youtube_url"
                  value={videoForm.youtube_url}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={videoForm.description}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this video covers..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={videoForm.duration_minutes}
                  onChange={(e) => setVideoForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  placeholder="e.g., 15"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={videoForm.is_active}
                  onCheckedChange={(checked) => setVideoForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveVideo}>
                <Save className="h-4 w-4 mr-2" />
                {editingVideo ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-muted">
              {video.thumbnail_url ? (
                <img 
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Youtube className="h-12 w-12 text-primary/60" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {video.is_active ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Eye className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
              </div>
              
              {/* Duration */}
              {video.duration_minutes && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {video.duration_minutes}m
                  </Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
              {video.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {video.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Order: {video.display_order}
                </span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditVideo(video)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{video.title}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteVideo(video.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No videos in this category yet.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Video
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Main Training Admin Manager Component - Routes between admin views
 * Only accessible to joe@bizooma.com
 */
export function TrainingAdminManager() {
  const { user } = useAuth();
  const location = useLocation();

  // Check if user is authorized admin (joe@bizooma.com)
  const isAuthorized = user?.email === 'joe@bizooma.com';

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Training administration is only available to platform administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Routes>
        <Route path="/" element={<CategoriesManagement />} />
        <Route 
          path="/category/:categoryId" 
          element={
            <VideosManagement 
              categoryId={location.pathname.split('/').pop() || ''} 
            />
          } 
        />
      </Routes>
    </div>
  );
}