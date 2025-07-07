import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Video, Eye } from "lucide-react";

interface VideoCardProps {
  video: {
    id: number;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: string;
    views?: number;
    price?: number;
    offerFreePreview?: boolean;
    category?: { name: string };
    subcategory?: { name: string };
    creator?: { firstName?: string; lastName?: string; email?: string };
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const creatorName = video.creator?.firstName 
    ? `${video.creator.firstName} ${video.creator.lastName || ''}`.trim()
    : video.creator?.email || 'Unknown Creator';

  return (
    <Link href={`/video/${video.id}`}>
      <Card className="group cursor-pointer transition-transform hover:scale-105 bg-transparent border-none">
        <CardContent className="p-0">
          <div className="relative video-aspect bg-netflix-gray rounded-lg overflow-hidden">
            {video.thumbnailUrl ? (
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-netflix-gray flex items-center justify-center">
                <Video className="w-8 h-8 text-netflix-light-gray" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            )}
            {video.offerFreePreview && (
              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-semibold">
                FREE PREVIEW
              </div>
            )}
          </div>
          <div className="mt-3">
            <h3 className="font-medium text-white truncate">{video.title}</h3>
            <p className="text-sm text-netflix-light-gray truncate">by {creatorName}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Eye className="w-3 h-3 text-netflix-light-gray" />
                <span className="text-xs text-netflix-light-gray">
                  {video.views || 0} views
                </span>
              </div>
              {video.subcategory && (
                <Badge variant="outline" className="text-xs">
                  {video.subcategory.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
