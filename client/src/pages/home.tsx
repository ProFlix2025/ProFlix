import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import VideoGrid from "@/components/VideoGrid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Plus, TrendingUp, History, Heart, Home as HomeIcon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/videos'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: trendingVideos = [] } = useQuery({
    queryKey: ['/api/trending'],
  });

  const { data: recommendedVideos = [] } = useQuery({
    queryKey: ['/api/recommended'],
    // Always load recommendations - returns trending for unauthenticated users
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    // Always load - returns empty array for unauthenticated users
  });

  const { data: watchHistory = [] } = useQuery({
    queryKey: ['/api/watch-history'],
    // Always load - returns empty array for unauthenticated users
  });

  // Setup categories on first load
  useEffect(() => {
    fetch('/api/setup', { method: 'POST' });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = Array.isArray(videos) && videos.length > 0 ? videos[0] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      {featuredVideo && (
        <div className="relative h-96 bg-gradient-to-r from-black via-transparent to-transparent">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8 max-w-lg">
            <h2 className="text-4xl font-bold mb-4">{featuredVideo.title}</h2>
            <p className="text-lg text-netflix-light-gray mb-6 line-clamp-3">
              {featuredVideo.description}
            </p>
            <div className="flex space-x-4">
              <Link href={`/video/${featuredVideo.id}`}>
                <Button className="bg-white text-black hover:bg-netflix-light-gray">
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </Link>
              <Button className="bg-netflix-gray hover:bg-netflix-red">
                <Plus className="w-4 h-4 mr-2" />
                My List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube-Style Content Tabs */}
      <div className="px-8 py-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-netflix-gray">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            {isAuthenticated && (
              <>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="recommended" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  For You
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="home" className="mt-8">
            {/* Viral Feed - Instagram/TikTok Style */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Discover</h3>
                <Link href="/all-categories">
                  <Button variant="outline" className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white">
                    Browse Categories
                  </Button>
                </Link>
              </div>
              
              {/* Instagram-style Grid Feed */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.isArray(videos) && videos.map((video: any) => (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <div className="relative group cursor-pointer">
                      {/* Thumbnail */}
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-netflix-gray">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                            <Play className="w-8 h-8 text-netflix-red" />
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                      
                      {/* Title below thumbnail */}
                      <div className="mt-2">
                        <h4 className="text-white text-sm font-medium line-clamp-2 leading-tight">
                          {video.title}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Empty state for no videos */}
              {Array.isArray(videos) && videos.length === 0 && (
                <div className="text-center py-16">
                  <Play className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">No Content Yet</h3>
                  <p className="text-netflix-light-gray mb-6">
                    Be the first to upload and go viral! New creators get priority placement.
                  </p>
                  <Link href="/creator-new">
                    <Button className="bg-netflix-red hover:bg-red-700">
                      Upload Your First Video
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Trending Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.isArray(trendingVideos) && trendingVideos.map((video: any) => (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <div className="bg-netflix-gray rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                      <div className="aspect-video relative">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                            <Play className="w-12 h-12 text-netflix-light-gray" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h4>
                        <div className="flex items-center text-netflix-light-gray text-sm">
                          <span>{video.views || 0} views</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </TabsContent>

          {isAuthenticated && (
            <>
              <TabsContent value="favorites" className="mt-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Your Favorites</h3>
                  {Array.isArray(favorites) && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {favorites.map((video: any) => (
                        <Link key={video.id} href={`/video/${video.id}`}>
                          <div className="bg-netflix-gray rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                            <div className="aspect-video relative">
                              {video.thumbnailUrl ? (
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                                  <Play className="w-12 h-12 text-netflix-light-gray" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h4>
                              <div className="flex items-center text-netflix-light-gray text-sm">
                                <span>{video.views || 0} views</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
                      <p className="text-netflix-light-gray">No favorites yet. Add videos to your favorites to see them here!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Watch History</h3>
                  {Array.isArray(watchHistory) && watchHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {watchHistory.map((video: any) => (
                        <Link key={video.id} href={`/video/${video.id}`}>
                          <div className="bg-netflix-gray rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                            <div className="aspect-video relative">
                              {video.thumbnailUrl ? (
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                                  <Play className="w-12 h-12 text-netflix-light-gray" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h4>
                              <div className="flex items-center text-netflix-light-gray text-sm">
                                <span>{video.views || 0} views</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
                      <p className="text-netflix-light-gray">No watch history yet. Start watching videos to see them here!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommended" className="mt-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">Recommended for You</h3>
                  {Array.isArray(recommendedVideos) && recommendedVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {recommendedVideos.map((video: any) => (
                        <Link key={video.id} href={`/video/${video.id}`}>
                          <div className="bg-netflix-gray rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                            <div className="aspect-video relative">
                              {video.thumbnailUrl ? (
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-netflix-dark-gray flex items-center justify-center">
                                  <Play className="w-12 h-12 text-netflix-light-gray" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h4>
                              <div className="flex items-center text-netflix-light-gray text-sm">
                                <span>{video.views || 0} views</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Plus className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
                      <p className="text-netflix-light-gray">Watch more videos to get personalized recommendations!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
