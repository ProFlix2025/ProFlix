import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid, List, Video, Users, TrendingUp, Play, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  emoji?: string;
  videoCount?: number;
  creatorCount?: number;
  trending?: boolean;
}

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredCategories = Array.isArray(categories) ? categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const featuredCategories = filteredCategories.slice(0, 3);
  const otherCategories = filteredCategories.slice(3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-netflix-gray border-netflix-border animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-netflix-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-netflix-border rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-netflix-border rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-netflix-red to-red-400 bg-clip-text text-transparent">
            Explore Categories
          </h1>
          <p className="text-xl text-netflix-light-gray max-w-3xl mx-auto">
            Discover amazing content across all categories on ProFlix
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-netflix-light-gray w-5 h-5" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-netflix-gray border-netflix-border text-white placeholder-netflix-light-gray"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="bg-netflix-red hover:bg-red-700 border-netflix-red"
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="bg-netflix-red hover:bg-red-700 border-netflix-red"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* All Categories */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Grid className="w-8 h-8 mr-3 text-netflix-red" />
            All Categories
            <Badge className="ml-3 bg-netflix-red text-white">
              {filteredCategories.length}
            </Badge>
          </h2>
        </div>

        {/* Categories Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 hover:scale-105 cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.emoji || '📂'}</span>
                        <CardTitle className="text-lg text-white group-hover:text-netflix-red transition-colors">
                          {category.name}
                        </CardTitle>
                      </div>
                      <Play className="w-5 h-5 text-netflix-light-gray group-hover:text-netflix-red transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-netflix-light-gray text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-netflix-light-gray">
                      <div className="flex items-center">
                        <Video className="w-3 h-3 mr-1" />
                        {category.videoCount || 0}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {category.creatorCount || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl">{category.emoji || '📂'}</span>
                          <h3 className="text-xl font-semibold text-white group-hover:text-netflix-red transition-colors">
                            {category.name}
                          </h3>
                          {category.trending && (
                            <Badge className="bg-netflix-red text-white">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-netflix-light-gray mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-netflix-light-gray">
                          <div className="flex items-center">
                            <Video className="w-4 h-4 mr-1" />
                            {category.videoCount || 0} videos
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {category.creatorCount || 0} creators
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-netflix-light-gray group-hover:text-netflix-red transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No categories found
            </h3>
            <p className="text-netflix-light-gray mb-6">
              Try adjusting your search term or browse all categories
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-netflix-red hover:bg-red-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCategories.length === 0 && !searchTerm && (
          <div className="text-center py-12">
            <Grid className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No categories available
            </h3>
            <p className="text-netflix-light-gray mb-6">
              Categories are being set up. Please check back later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-netflix-red hover:bg-red-700 text-white"
            >
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}