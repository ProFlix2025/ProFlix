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
  const videoId = params.id;

  const { data: video, isLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
    enabled: !!videoId,
  });

  const { data: likeStatus } = useQuery({
    queryKey: [`/api/videos/${videoId}/like-status`],
    enabled: !!videoId && isAuthenticated,
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/channel/${video?.creatorId}/subscription-status`],
    enabled: !!video?.creatorId && isAuthenticated,
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

  // Increment view count when video starts playing
  useEffect(() => {
    if (video && videoRef.current) {
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
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    poster={video.thumbnailUrl}
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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
