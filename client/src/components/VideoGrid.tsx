import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import VideoCard from "./VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface VideoGridProps {
  title: string;
  categoryId?: number;
  subcategoryId?: number;
  viewAllLink?: string;
}

export default function VideoGrid({ title, categoryId, subcategoryId, viewAllLink }: VideoGridProps) {
  const { data: videos, isLoading } = useQuery({
    queryKey: subcategoryId 
      ? [`/api/subcategories/${subcategoryId}/videos`]
      : [`/api/categories/${categoryId}/videos`],
    enabled: !!(categoryId || subcategoryId),
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-netflix-gray rounded-lg video-aspect mb-2"></div>
              <div className="h-4 bg-netflix-gray rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-netflix-gray rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">{title}</h3>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="ghost" className="text-netflix-red hover:text-red-400">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {videos.slice(0, 6).map((video: any) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
