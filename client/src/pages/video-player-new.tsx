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
  isCourse: boolean;
  coursePrice: number;
  courseDescription: string;
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
                onPlay={handlePlay}
                onPause={handlePause}
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
                <span>{video.views.toLocaleString()} views</span>
                <span>•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
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
                  {video.likes}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share ({video.shareCount})
                </Button>
              </div>
              
              {/* Description */}
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src={video.creator.profileImageUrl || "/default-avatar.png"}
                alt={video.creator.channelName}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{video.creator.channelName}</h3>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Upsell */}
            {video.isCourse && video.creator.isProCreator && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-netflix-red" />
                    <h3 className="font-semibold">Premium Course</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold">
                          ${(discountedPrice / 100).toFixed(2)}
                        </span>
                        {isPremiumViewer && (
                          <Badge className="bg-green-600">
                            10% OFF
                          </Badge>
                        )}
                      </div>
                      {isPremiumViewer && (
                        <p className="text-sm text-gray-400 line-through">
                          ${(video.coursePrice / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-300">
                      {video.courseDescription}
                    </p>
                    
                    <Button
                      onClick={handlePurchaseCourse}
                      className="w-full bg-netflix-red hover:bg-red-700"
                      disabled={purchaseCourseMutation.isPending}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {purchaseCourseMutation.isPending ? "Processing..." : "Buy Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Premium Upgrade */}
            {!isPremiumViewer && (
              <Card className="bg-gradient-to-r from-netflix-red to-red-700 border-none">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-white" />
                    <h3 className="font-semibold text-white">Go Premium</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <ul className="text-sm space-y-2 text-white">
                      <li>• Ad-free viewing</li>
                      <li>• 10% off all courses</li>
                      <li>• Priority support</li>
                    </ul>
                    
                    <div className="text-white">
                      <span className="text-2xl font-bold">$29</span>
                      <span className="text-sm">/month</span>
                    </div>
                    
                    <Button
                      onClick={() => window.location.href = "/premium"}
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