/**
 * Utility functions for extracting video thumbnails from different platforms
 */

export interface VideoThumbnail {
  url: string;
  width: number;
  height: number;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

/**
 * Extract Vimeo video ID from Vimeo URL
 */
export const getVimeoVideoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
};

/**
 * Get YouTube video thumbnail URL
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): VideoThumbnail => {
  const thumbnailUrls = {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`, // 120x90
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // 320x180
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // 480x360
    standard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, // 640x480
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` // 1280x720
  };

  const dimensions = {
    default: { width: 120, height: 90 },
    medium: { width: 320, height: 180 },
    high: { width: 480, height: 360 },
    standard: { width: 640, height: 480 },
    maxres: { width: 1280, height: 720 }
  };

  return {
    url: thumbnailUrls[quality],
    ...dimensions[quality]
  };
};

/**
 * Get Vimeo video thumbnail URL using oEmbed API
 */
export const getVimeoThumbnail = async (videoId: string): Promise<VideoThumbnail | null> => {
  try {
    const response = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`);
    const data = await response.json();
    
    if (data.thumbnail_url) {
      return {
        url: data.thumbnail_url,
        width: data.thumbnail_width || 320,
        height: data.thumbnail_height || 180
      };
    }
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error);
  }
  
  return null;
};

/**
 * Get video thumbnail from any supported video URL
 */
export const getVideoThumbnail = async (videoUrl: string): Promise<VideoThumbnail | null> => {
  if (!videoUrl) return null;

  // Try YouTube first
  const youtubeId = getYouTubeVideoId(videoUrl);
  if (youtubeId) {
    return getYouTubeThumbnail(youtubeId, 'medium');
  }

  // Try Vimeo
  const vimeoId = getVimeoVideoId(videoUrl);
  if (vimeoId) {
    return await getVimeoThumbnail(vimeoId);
  }

  return null;
};

/**
 * Check if a URL is a supported video platform
 */
export const isSupportedVideoUrl = (url: string): boolean => {
  return !!(getYouTubeVideoId(url) || getVimeoVideoId(url));
};