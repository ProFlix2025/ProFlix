import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import VideoCard from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CategoryView() {
  const params = useParams();
  const categorySlug = params.slug;
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  const { data: category } = useQuery({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug,
  });

  const { data: subcategories } = useQuery({
    queryKey: [`/api/categories/${category?.id}/subcategories`],
    enabled: !!category?.id,
  });

  const { data: videos } = useQuery({
    queryKey: selectedSubcategory 
      ? [`/api/subcategories/${selectedSubcategory}/videos`]
      : [`/api/categories/${category?.id}/videos`],
    enabled: !!category?.id,
  });

  if (!category) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-netflix-light-gray">{category.description}</p>
          )}
        </div>

        {/* Subcategory Filter */}
        {subcategories && subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubcategory === null ? "default" : "outline"}
                onClick={() => setSelectedSubcategory(null)}
                className={selectedSubcategory === null ? "bg-netflix-red hover:bg-red-700" : ""}
              >
                All
              </Button>
              {subcategories.map((subcategory: any) => (
                <Button
                  key={subcategory.id}
                  variant={selectedSubcategory === subcategory.id ? "default" : "outline"}
                  onClick={() => setSelectedSubcategory(subcategory.id)}
                  className={selectedSubcategory === subcategory.id ? "bg-netflix-red hover:bg-red-700" : ""}
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos && videos.length > 0 ? (
            videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-netflix-black border-netflix-border">
                <CardContent className="p-12 text-center">
                  <p className="text-netflix-light-gray text-lg mb-4">
                    No videos found in this category
                  </p>
                  <p className="text-netflix-light-gray text-sm">
                    Check back later for new content!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
