import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ThumbsUp, 
  ThumbsDown, 
  Share2,
  Heart,
  MessageCircle,
  ShoppingCart,
  DollarSign,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
// Removed YouTube player - focusing on original content only

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  shareCount: number;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    channelName: string;
    profileImageUrl: string;
    isProCreator: boolean;
  };
  isAddedToStreaming: boolean;
  streamingRevenue: number;
  categoryId: number;
  subcategoryId: number;
  createdAt: string;
}

export default function VideoPlayerNew() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  // Fetch video data
  const { data: video, isLoading } = useQuery<Video>({
    queryKey: [`/api/videos/${id}`],
    enabled: !!id,
  });

  // Check if user is premium viewer (ad-free)
  const isPremiumViewer = user?.isPremiumViewer || false;

  // Show ad before video for non-premium viewers
  useEffect(() => {
    if (video && !isPremiumViewer) {
      setShowAd(true);
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAd(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [video, isPremiumViewer]);

  // Increment view count
  const incrementViewMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${id}/view`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}`] });
    },
  });

  // Like/Unlike video
  const likeMutation = useMutation({
    mutationFn: (action: "like" | "unlike") => 
      apiRequest("POST", `/api/videos/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to like videos",
          variant: "destructive",
        });
      }
    },
  });

  // Share video
  const shareMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${id}/share`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}`] });
      toast({
        title: "Video shared!",
        description: "Share link copied to clipboard",
      });
      navigator.clipboard.writeText(window.location.href);
    },
  });

  // Purchase course
  const purchaseCourseMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/videos/${id}/purchase`),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to purchase courses",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Purchase failed",
          description: "Unable to process purchase. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handlePlay = () => {
    setIsPlaying(true);
    incrementViewMutation.mutate();
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleLike = () => {
    likeMutation.mutate("like");
  };

  const handleShare = () => {
    shareMutation.mutate();
  };

  const handlePurchaseCourse = () => {
    purchaseCourseMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Video not found</h1>
            <p className="text-netflix-light-gray">The video you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = isPremiumViewer 
    ? Math.round(video.coursePrice * 0.9) 
    : video.coursePrice;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-6">
          {showAd && !isPremiumViewer ? (
            /* Ad Display */
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-netflix-red px-4 py-2 rounded-lg mb-4">
                  <p className="text-white font-semibold">Advertisement</p>
                </div>
                <div className="bg-gray-800 p-8 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Sample Ad Content</h3>
                  <p className="text-gray-300 mb-4">
                    This is where video ads will appear for free users
                  </p>
                  <div className="text-sm text-gray-400">
                    Video starts in {adCountdown} seconds
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Video Player */
            <div className="aspect-video bg-black">
              <video
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className="w-full h-full"
                controls
                autoPlay={isPlaying}
                muted={isMuted}
                onPlay={() => {
                  setIsPlaying(true);
                  incrementViewMutation.mutate();
                }}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={() => {
                  console.log('✅ Original video loaded:', video.title);
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>{video.views?.toLocaleString() || 0} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                {video.isAddedToStreaming && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white text-xs">
                      Added to Streaming
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {video.likes || 0}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share ({video.shareCount || 0})
                </Button>
                
                {/* Add to Streaming Button - Only show if creator owns this video */}
                {isAuthenticated && user?.id === video.creatorId && !video.isAddedToStreaming && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await apiRequest("POST", `/api/videos/${video.id}/add-to-streaming`);
                        toast({
                          title: "Added to Streaming!",
                          description: "Your video will appear in our future Netflix-style streaming section for additional revenue!",
                        });
                        // Refresh the video data
                        window.location.reload();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to add video to streaming. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Add to Streaming
                  </Button>
                )}
              </div>
              
              {/* Description */}
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            </div>

            {/* Creator Info */}
            {video.creator && (
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={video.creator.profileImageUrl || "/default-avatar.png"}
                  alt={video.creator.channelName || "Creator"}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{video.creator.channelName || "Creator"}</h3>
                    {video.creator.isProCreator && (
                      <Badge className="bg-netflix-red">Pro Creator</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    {video.creator.firstName} {video.creator.lastName}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Subscribe
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Tier Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-netflix-red" />
                  <h3 className="font-semibold">Creator Info</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Creator Type:</span>
                    <Badge className={video.creator?.isProCreator ? "bg-green-600" : "bg-blue-600"}>
                      {video.creator?.isProCreator ? "Pro Creator" : "New Creator"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Revenue Share:</span>
                    <span className="text-sm font-semibold">
                      {video.creator.isProCreator ? "100%" : "70%"} to creator
                    </span>
                  </div>
                  
                  {video.isAddedToStreaming && (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-white">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span className="text-sm font-semibold">Added to Streaming</span>
                      </div>
                      <p className="text-xs text-gray-200 mt-1">
                        Part of our future Netflix-style section
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pro Creator Upgrade */}
            {!video.creator.isProCreator && (
              <Card className="bg-gradient-to-r from-netflix-red to-red-700 border-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">Become Pro Creator</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <ul className="text-sm space-y-2 text-white">
                      <li>• Keep 100% of revenue</li>
                      <li>• Unlimited video uploads</li>
                      <li>• Priority streaming consideration</li>
                    </ul>
                    
                    <div className="text-white">
                      <span className="text-2xl font-bold">$99</span>
                      <span className="text-sm">/month</span>
                    </div>
                    
                    <Button
                      onClick={() => window.location.href = "/pro-creator-portal"}
                      className="w-full bg-white text-netflix-red hover:bg-gray-100"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}