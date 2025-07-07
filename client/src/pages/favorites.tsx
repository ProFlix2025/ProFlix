import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Play, Share, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Favorites() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to landing if not authenticated
  if (!isLoading && !isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: isAuthenticated,
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await apiRequest("DELETE", `/api/favorites/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Video removed from your favorites successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove video from favorites.",
        variant: "destructive",
      });
    },
  });

  const shareVideoMutation = useMutation({
    mutationFn: async ({ videoId, recipientEmail, message }: { videoId: number, recipientEmail?: string, message?: string }) => {
      const response = await apiRequest("POST", "/api/share", { videoId, recipientEmail, message });
      return response.json();
    },
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/shared/${data.shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Video shared",
        description: "Share link copied to clipboard!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share video.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Favorites</h1>
          <p className="text-netflix-light-gray">Videos you've saved for later</p>
        </div>

        {Array.isArray(favorites) && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((video: any) => (
              <Card key={video.id} className="bg-netflix-gray border-netflix-border overflow-hidden group">
                <div className="relative aspect-video">
                  <Link href={`/video/${video.id}`}>
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                        <Play className="w-12 h-12 text-netflix-light-gray" />
                      </div>
                    )}
                  </Link>
                  
                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-black/50 hover:bg-black/70"
                      onClick={() => shareVideoMutation.mutate({ videoId: video.id })}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-600/50 hover:bg-red-600/70"
                      onClick={() => removeFromFavoritesMutation.mutate(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <Link href={`/video/${video.id}`}>
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 hover:text-netflix-red transition-colors">
                      {video.title}
                    </h3>
                  </Link>
                  
                  {video.description && (
                    <p className="text-netflix-light-gray text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-netflix-light-gray text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{video.views || 0} views</span>
                      {video.duration && (
                        <>
                          <span>•</span>
                          <span>{video.duration}</span>
                        </>
                      )}
                    </div>
                    
                    {video.price && (
                      <div className="text-netflix-red font-semibold">
                        ${(video.price / 100).toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {video.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-netflix-dark-gray text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-netflix-light-gray mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
            <p className="text-netflix-light-gray mb-6">
              Start adding videos to your favorites to see them here!
            </p>
            <Link href="/">
              <Button className="bg-netflix-red hover:bg-red-700">
                Explore Videos
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}