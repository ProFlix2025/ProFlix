import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Play, Grid3X3, ArrowLeft } from "lucide-react";

export default function AllCategories() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-netflix-red">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-netflix-red" />
              <h1 className="text-4xl font-bold">All Categories</h1>
            </div>
          </div>
          <div className="text-netflix-light-gray">
            {categories.length} categories available
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.isArray(categories) && categories.map((category: any) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="w-full h-32 bg-netflix-dark-gray rounded-lg flex items-center justify-center mb-3">
                    <Play className="w-12 h-12 text-netflix-red" />
                  </div>
                  <CardTitle className="text-white text-lg font-semibold line-clamp-2">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-netflix-light-gray text-sm line-clamp-3">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
                    >
                      Browse
                    </Button>
                    <span className="text-netflix-light-gray text-xs">
                      {category.slug}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {Array.isArray(categories) && categories.length === 0 && (
          <div className="text-center py-16">
            <Grid3X3 className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Categories Found</h3>
            <p className="text-netflix-light-gray">
              Categories are being set up. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}