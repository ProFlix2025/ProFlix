import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Plus, X, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VideoPlayer() {
  const params = useParams();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();
  const videoId = params.id;

  const { data: video, isLoading } = useQuery({
    queryKey: [`/api/videos/${videoId}`],
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
              
              <div className="flex items-center space-x-4 mb-6">
                <Button className="bg-netflix-red hover:bg-red-700">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  My List
                </Button>
              </div>
              
              {video.description && (
                <div className="bg-netflix-gray p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{video.description}</p>
                </div>
              )}
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
