import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { 
  Play, 
  Clock, 
  CheckCircle, 
  ArrowLeft, 
  Search,
  Filter,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import * as icons from "lucide-react";

// Training interface types
interface TrainingCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  video_count?: number;
  completed_count?: number;
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
  completed?: boolean;
  progress_percentage?: number;
}

interface VideoProgress {
  video_id: string;
  progress_percentage: number;
  completed: boolean;
  watched_at: string | null;
}

/**
 * Training Categories List - Shows all available training categories
 * with progress indicators and video counts
 */
function TrainingCategoriesList() {
  const [categories, setCategories] = useState<TrainingCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * Load training categories with video counts and user progress
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Get categories with video counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('platform_training_categories')
        .select(`
          *,
          videos:platform_training_videos(count)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Get user progress for all videos
      let progressData: VideoProgress[] = [];
      if (user) {
        const { data: userProgress, error: progressError } = await supabase
          .from('user_video_progress')
          .select('video_id, progress_percentage, completed, watched_at')
          .eq('user_id', user.id);
        
        if (!progressError) {
          progressData = userProgress || [];
        }
      }

      // Enhance categories with progress data
      const enhancedCategories = categoriesData?.map(category => {
        const videoCount = category.videos?.[0]?.count || 0;
        const completedCount = progressData.filter(p => p.completed).length;
        
        return {
          ...category,
          video_count: videoCount,
          completed_count: completedCount
        };
      }) || [];

      setCategories(enhancedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load training categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the appropriate icon component for a category
   */
  const getCategoryIcon = (iconName: string | null) => {
    if (!iconName) return BookOpen;
    const IconComponent = icons[iconName as keyof typeof icons] as React.ComponentType<any>;
    return IconComponent || BookOpen;
  };

  /**
   * Filter categories based on search term
   */
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading training categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Training Videos</h1>
        <p className="text-muted-foreground mt-2">
          Learn digital marketing strategies specifically designed for law firms
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search training topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const IconComponent = getCategoryIcon(category.icon);
          const progressPercentage = category.video_count 
            ? Math.round((category.completed_count || 0) / category.video_count * 100)
            : 0;

          return (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/training/category/${category.id}`)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  {category.video_count > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="h-4 w-4" />
                      <span>{category.video_count || 0} videos</span>
                    </div>
                    {category.completed_count && category.completed_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {category.completed_count} completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No training categories found.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Training Category Videos - Shows all videos in a specific category
 */
function CategoryVideos({ categoryId }: { categoryId: string }) {
  const [category, setCategory] = useState<TrainingCategory | null>(null);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [userProgress, setUserProgress] = useState<VideoProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadCategoryVideos();
  }, [categoryId]);

  /**
   * Load category details and videos with user progress
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
        .eq('is_active', true)
        .order('display_order');

      if (videosError) throw videosError;

      // Get user progress
      let progressData: VideoProgress[] = [];
      if (user && videosData) {
        const videoIds = videosData.map(v => v.id);
        const { data: userProgressData, error: progressError } = await supabase
          .from('user_video_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('video_id', videoIds);
        
        if (!progressError) {
          progressData = userProgressData || [];
        }
      }

      setCategory(categoryData);
      setVideos(videosData || []);
      setUserProgress(progressData);
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
   * Get user progress for a specific video
   */
  const getVideoProgress = (videoId: string) => {
    return userProgress.find(p => p.video_id === videoId);
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
        <Button variant="outline" onClick={() => navigate('/dashboard/training')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard/training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description}</p>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const progress = getVideoProgress(video.id);
          const isCompleted = progress?.completed || false;
          const progressPercentage = progress?.progress_percentage || 0;

          return (
            <Card 
              key={video.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/dashboard/training/video/${video.id}`)}
            >
              <div className="relative">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Play className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                </div>
                
                {/* Progress Overlay */}
                {progressPercentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm">
                    <Progress value={progressPercentage} className="h-1" />
                  </div>
                )}

                {/* Completion Badge */}
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </div>
                )}

                {/* Duration */}
                {video.duration_minutes && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Clock className="h-3 w-3 mr-1" />
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
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    {progressPercentage > 0 ? 'Continue' : 'Watch'}
                  </Button>
                  
                  {progressPercentage > 0 && !isCompleted && (
                    <span className="text-xs text-muted-foreground">
                      {progressPercentage}% watched
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos available in this category.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Video Player - Shows individual video with player and navigation
 */
function VideoPlayer({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<TrainingVideo | null>(null);
  const [category, setCategory] = useState<TrainingCategory | null>(null);
  const [categoryVideos, setCategoryVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  /**
   * Load video details and related category information
   */
  const loadVideo = async () => {
    try {
      setLoading(true);
      
      // Get video details
      const { data: videoData, error: videoError } = await supabase
        .from('platform_training_videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (videoError) throw videoError;

      // Get category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('platform_training_categories')
        .select('*')
        .eq('id', videoData.category_id)
        .single();

      if (categoryError) throw categoryError;

      // Get other videos in this category
      const { data: categoryVideosData, error: categoryVideosError } = await supabase
        .from('platform_training_videos')
        .select('*')
        .eq('category_id', videoData.category_id)
        .eq('is_active', true)
        .order('display_order');

      if (categoryVideosError) throw categoryVideosError;

      setVideo(videoData);
      setCategory(categoryData);
      setCategoryVideos(categoryVideosData || []);
      
      // Mark video as watched
      if (user) {
        await markVideoAsWatched(videoId);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast({
        title: "Error",
        description: "Failed to load video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark video as watched and update progress
   */
  const markVideoAsWatched = async (videoId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_video_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress_percentage: 100,
          completed: true,
          watched_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  };

  /**
   * Get next video in the sequence
   */
  const getNextVideo = () => {
    if (!video || !categoryVideos.length) return null;
    const currentIndex = categoryVideos.findIndex(v => v.id === video.id);
    return currentIndex < categoryVideos.length - 1 ? categoryVideos[currentIndex + 1] : null;
  };

  /**
   * Get previous video in the sequence
   */
  const getPreviousVideo = () => {
    if (!video || !categoryVideos.length) return null;
    const currentIndex = categoryVideos.findIndex(v => v.id === video.id);
    return currentIndex > 0 ? categoryVideos[currentIndex - 1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Loading video...</div>
      </div>
    );
  }

  if (!video || !category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Video not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/training')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Button>
      </div>
    );
  }

  const nextVideo = getNextVideo();
  const previousVideo = getPreviousVideo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/dashboard/training/category/${category.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {category.name}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          
          {video.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">About This Video</h3>
                <p className="text-muted-foreground">{video.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            {previousVideo ? (
              <Button 
                variant="outline" 
                onClick={() => navigate(`/dashboard/training/video/${previousVideo.id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}
            
            {nextVideo && (
              <Button onClick={() => navigate(`/dashboard/training/video/${nextVideo.id}`)}>
                Next
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <div className="space-y-4">
          <h3 className="font-semibold">More in {category.name}</h3>
          <div className="space-y-3">
            {categoryVideos.map((relatedVideo) => {
              const isCurrent = relatedVideo.id === video.id;
              return (
                <Card 
                  key={relatedVideo.id}
                  className={`cursor-pointer transition-colors ${
                    isCurrent 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    if (!isCurrent) {
                      navigate(`/dashboard/training/video/${relatedVideo.id}`);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {relatedVideo.thumbnail_url ? (
                          <img 
                            src={relatedVideo.thumbnail_url}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Play className="h-4 w-4 text-primary/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm line-clamp-2 ${
                          isCurrent ? 'text-primary' : ''
                        }`}>
                          {relatedVideo.title}
                        </h4>
                        {relatedVideo.duration_minutes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {relatedVideo.duration_minutes} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Training Manager Component - Routes between different training views
 */
export function TrainingManager() {
  const location = useLocation();

  return (
    <div className="p-6">
      <Routes>
        <Route path="/" element={<TrainingCategoriesList />} />
        <Route 
          path="/category/:categoryId" 
          element={
            <CategoryVideos 
              categoryId={location.pathname.split('/').pop() || ''} 
            />
          } 
        />
        <Route 
          path="/video/:videoId" 
          element={
            <VideoPlayer 
              videoId={location.pathname.split('/').pop() || ''} 
            />
          } 
        />
      </Routes>
    </div>
  );
}