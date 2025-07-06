import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import VideoGrid from "@/components/VideoGrid";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/videos'],
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
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

  const featuredVideo = videos?.[0];

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

      {/* Categories Section */}
      <div className="px-8 py-8">
        {categories?.map((category: any) => (
          <VideoGrid
            key={category.id}
            title={category.name}
            categoryId={category.id}
            viewAllLink={`/category/${category.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
