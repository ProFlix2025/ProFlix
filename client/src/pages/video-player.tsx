import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Plus, X, Eye, MessageCircle, Bell, BellOff, Share } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VideoPlayer() {
  const params = useParams();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasTriggeredPaywall, setHasTriggeredPaywall] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [showEmbedFallback, setShowEmbedFallback] = useState(false);
  const videoId = params.id;

  // Only show fallback for localhost - production should work
  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🔧 Development mode: Auto-showing YouTube fallback');
      setShowEmbedFallback(true);
    } else {
      console.log('🚀 Production mode: YouTube iframe should work');
      setShowEmbedFallback(false);
    }
  }, []);

  const { data: video, isLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });

  const { data: likeStatus } = useQuery({
    queryKey: [`/api/videos/${videoId}/like-status`],
    enabled: !!videoId && isAuthenticated,
  });

  const { data: hasPurchased } = useQuery({
    queryKey: [`/api/videos/${videoId}/purchased`],
    enabled: !!videoId && isAuthenticated,
  });

  const { data: comments } = useQuery({
    queryKey: [`/api/videos/${videoId}/comments`],
    enabled: !!videoId,
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/videos/${videoId}/view`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}`] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.userLike) {
        await apiRequest('DELETE', `/api/videos/${videoId}/like`);
      } else {
        await apiRequest('POST', `/api/videos/${videoId}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/like-status`] });
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

  const dislikeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.userDislike) {
        await apiRequest('DELETE', `/api/videos/${videoId}/dislike`);
      } else {
        await apiRequest('POST', `/api/videos/${videoId}/dislike`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/like-status`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to rate videos",
          variant: "destructive",
        });
      }
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (subscriptionStatus?.isSubscribed) {
        await apiRequest('DELETE', `/api/subscribe/${video?.creatorId}`);
      } else {
        await apiRequest('POST', `/api/subscribe/${video?.creatorId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/channel/${video?.creatorId}/subscription-status`] });
      toast({
        title: subscriptionStatus?.isSubscribed ? "Unsubscribed" : "Subscribed",
        description: subscriptionStatus?.isSubscribed 
          ? "You will no longer receive notifications from this channel"
          : "You will receive notifications when this channel uploads new videos",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to subscribe to channels",
          variant: "destructive",
        });
      }
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/videos/${videoId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${videoId}/comments`] });
      setComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to comment on videos",
          variant: "destructive",
        });
      }
    },
  });

  // Increment view count when video starts playing (only for non-LearnTube videos)
  useEffect(() => {
    if (video && videoRef.current && !video.isLearnTube) {
      const handlePlay = () => {
        viewMutation.mutate();
      };
      
      videoRef.current.addEventListener('play', handlePlay);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', handlePlay);
        }
      };
    }
  }, [video, viewMutation]);

  // Monitor video time for preview restrictions (only for non-LearnTube videos)
  useEffect(() => {
    if (video && videoRef.current && !video.isLearnTube) {
      const handleTimeUpdate = () => {
        const time = videoRef.current?.currentTime || 0;
        setCurrentTime(time);
        
        // Check if user needs to purchase (2 minutes = 120 seconds)
        const needsPurchase = !hasPurchased && video.offerFreePreview && time >= 120;
        
        if (needsPurchase && !hasTriggeredPaywall) {
          setHasTriggeredPaywall(true);
          setShowPaywall(true);
          // Pause the video
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      };

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [video, hasPurchased, hasTriggeredPaywall]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading video...</p>
          </div>
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
            <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
            <p className="text-netflix-light-gray mb-6">
              The video you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} className="bg-netflix-red hover:bg-red-700">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-0">
                <div className="relative video-aspect rounded-lg overflow-hidden">
                  {/* Check if this is a LearnTube video (YouTube embed) */}
                  {video.isLearnTube ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                      <iframe
                        src={video.videoUrl?.replace(/\?si=.*$/, '')} // Remove ?si= parameter
                        title={video.title}
                        className="w-full h-full min-h-[400px]"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        onLoad={() => {
                          console.log('✅ YouTube iframe loaded successfully:', video.title);
                          console.log('Video details:', { title: video.title, youtubeId: video.youtubeId });
                          console.log('📍 Current hostname:', window.location.hostname);
                          setIframeError(false);
                          setShowEmbedFallback(false);
                          // Track view when iframe loads
                          viewMutation.mutate();
                        }}
                        onError={(e) => {
                          console.error('❌ YouTube iframe failed to load:', video.title, e);
                          console.error('Failed video URL:', video.videoUrl);
                          console.error('📍 Current hostname:', window.location.hostname);
                          console.error('🔍 Video ID:', video.youtubeId);
                          setIframeError(true);
                          setShowEmbedFallback(true);
                        }}
                      />
                      
                      {/* Fallback for embedding issues */}
                      {showEmbedFallback && (
                        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
                          <div className="text-center text-white p-6 max-w-sm">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
                            <p className="text-sm text-gray-300 mb-3">
                              {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                                ? "YouTube embedding is blocked on localhost. This video will work properly in production."
                                : "This video cannot be embedded. YouTube may have restricted this video from being embedded on external sites."
                              }
                            </p>
                            <a 
                              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                              onClick={() => {
                                // Track view when user clicks to watch on YouTube
                                viewMutation.mutate();
                              }}
                            >
                              Watch on YouTube
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      poster={video.thumbnailUrl}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  
                  {/* Preview Time Indicator - only for non-LearnTube videos */}
                  {video.offerFreePreview && !hasPurchased && !showPaywall && currentTime > 0 && !video.isLearnTube && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-sm px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Preview: {Math.max(0, 120 - Math.floor(currentTime))}s left</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Preview Paywall Overlay - only for non-LearnTube videos */}
                  {showPaywall && !video.isLearnTube && (
                    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
                      <div className="text-center p-8 max-w-md">
                        <div className="mb-6">
                          <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Preview Ended</h3>
                          <p className="text-netflix-light-gray">
                            You've watched the 2-minute free preview. Purchase this course to continue watching.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-netflix-gray rounded-lg p-4">
                            <p className="text-lg font-semibold text-white">
                              ${(video.price / 100).toFixed(2)}
                            </p>
                            <p className="text-sm text-netflix-light-gray">
                              One-time purchase • Lifetime access
                            </p>
                          </div>
                          
                          <Button 
                            onClick={() => navigate(`/course-purchase/${video.id}`)}
                            className="w-full bg-netflix-red hover:bg-red-700 text-white"
                          >
                            Purchase Course
                          </Button>
                          
                          <Button 
                            onClick={() => {
                              setShowPaywall(false);
                              if (videoRef.current) {
                                videoRef.current.currentTime = 0;
                              }
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            Watch Preview Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Video Info */}
            <div className="mt-6">
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-netflix-light-gray" />
                  <span className="text-netflix-light-gray">{video.views || 0} views</span>
                </div>
                <Badge variant="secondary">{video.category?.name}</Badge>
                <Badge variant="outline">{video.subcategory?.name}</Badge>
                {video.isLearnTube && (
                  <Badge variant="destructive" className="bg-orange-600 hover:bg-orange-700">
                    LearnTube (Temporary)
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-netflix-gray rounded-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeMutation.mutate()}
                      disabled={likeMutation.isPending}
                      className={`rounded-l-full px-4 ${likeStatus?.userLike ? 'text-netflix-red' : 'text-white'}`}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {likeStatus?.likes || 0}
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dislikeMutation.mutate()}
                      disabled={dislikeMutation.isPending}
                      className={`rounded-r-full px-4 ${likeStatus?.userDislike ? 'text-netflix-red' : 'text-white'}`}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      {likeStatus?.dislikes || 0}
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="rounded-full">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button variant="outline" className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>

                {video?.creatorId !== user?.id && (
                  <Button
                    onClick={() => subscribeMutation.mutate()}
                    disabled={subscribeMutation.isPending}
                    className={`rounded-full px-6 ${
                      subscriptionStatus?.isSubscribed 
                        ? 'bg-netflix-gray hover:bg-netflix-red text-white' 
                        : 'bg-netflix-red hover:bg-red-700 text-white'
                    }`}
                  >
                    {subscriptionStatus?.isSubscribed ? (
                      <>
                        <BellOff className="w-4 h-4 mr-2" />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {video.description && (
                <div className="bg-netflix-gray p-4 rounded-lg mb-6">
                  <p className="text-sm leading-relaxed">{video.description}</p>
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {comments?.length || 0} Comments
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowComments(!showComments)}
                    className="text-netflix-light-gray"
                  >
                    {showComments ? 'Hide' : 'Show'} Comments
                  </Button>
                </div>

                {showComments && (
                  <div className="space-y-4">
                    {/* Add Comment Form */}
                    {isAuthenticated && (
                      <div className="bg-netflix-gray p-4 rounded-lg">
                        <Textarea
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="bg-netflix-black border-netflix-border text-white mb-3"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() => setComment("")}
                            disabled={!comment}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => commentMutation.mutate(comment)}
                            disabled={!comment || commentMutation.isPending}
                            className="bg-netflix-red hover:bg-red-700"
                          >
                            {commentMutation.isPending ? 'Posting...' : 'Comment'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments?.map((comment: any) => (
                        <div key={comment.id} className="bg-netflix-gray p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {comment.user?.firstName?.charAt(0) || comment.user?.email?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-white">
                                  {comment.user?.firstName 
                                    ? `${comment.user.firstName} ${comment.user.lastName || ''}`.trim()
                                    : comment.user?.email || 'Anonymous'}
                                </span>
                                <span className="text-netflix-light-gray text-sm">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-white">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!comments || comments.length === 0) && (
                        <div className="text-center py-8 text-netflix-light-gray">
                          No comments yet. Be the first to share your thoughts!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Video Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-netflix-light-gray">Duration</p>
                    <p className="font-medium">{video.duration || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-netflix-light-gray">Category</p>
                    <p className="font-medium">{video.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-netflix-light-gray">Subcategory</p>
                    <p className="font-medium">{video.subcategory?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-netflix-light-gray">Views</p>
                    <p className="font-medium">{video.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-netflix-light-gray">Uploaded</p>
                    <p className="font-medium">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
