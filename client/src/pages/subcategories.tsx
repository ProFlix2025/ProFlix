import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid, List, Video, Users, TrendingUp, Play, ArrowRight, ArrowLeft, Folder } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  emoji?: string;
}

export default function Subcategories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories"],
  });

  const isLoading = categoriesLoading || subcategoriesLoading;

  const filteredSubcategories = Array.isArray(subcategories) ? subcategories.filter(subcategory => {
    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || subcategory.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryEmoji = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.emoji || '📂';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="bg-netflix-gray border-netflix-border animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-netflix-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-netflix-border rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-netflix-border rounded"></div>
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="/all-categories">
              <Button variant="ghost" className="text-white hover:text-netflix-red">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-netflix-red to-red-400 bg-clip-text text-transparent">
            All Subcategories
          </h1>
          <p className="text-xl text-netflix-light-gray max-w-3xl mx-auto">
            Explore specific topics and content areas across all categories
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-netflix-light-gray w-5 h-5" />
            <Input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-netflix-gray border-netflix-border text-white placeholder-netflix-light-gray"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-netflix-red hover:bg-red-700" : ""}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-netflix-red hover:bg-red-700" : ""}
              >
                <span className="mr-2">{category.emoji || '📂'}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-center">
          <p className="text-netflix-light-gray">
            Showing {filteredSubcategories.length} subcategories
            {selectedCategory && ` in ${getCategoryName(selectedCategory)}`}
          </p>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <Card key={subcategory.id} className="bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 hover:scale-105 cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-netflix-red rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {subcategory.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg font-semibold line-clamp-2">
                      {subcategory.name}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <span className="mr-1">{getCategoryEmoji(subcategory.categoryId)}</span>
                      {getCategoryName(subcategory.categoryId)}
                    </Badge>
                  </div>
                  
                  {subcategory.description && (
                    <p className="text-netflix-light-gray text-sm line-clamp-2">
                      {subcategory.description}
                    </p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Browse Videos
                    </Button>
                    <span className="text-netflix-light-gray text-xs">
                      {subcategory.slug}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubcategories.length === 0 && (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Subcategories Found</h3>
            <p className="text-netflix-light-gray">
              {searchTerm 
                ? `No subcategories match "${searchTerm}"`
                : selectedCategory 
                  ? `No subcategories in ${getCategoryName(selectedCategory)}`
                  : "No subcategories available"
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
                variant="outline"
                className="mt-4 border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-netflix-gray rounded-lg p-6">
            <div className="text-3xl font-bold text-netflix-red mb-2">
              {subcategories.length}
            </div>
            <div className="text-netflix-light-gray">
              Total Subcategories
            </div>
          </div>
          <div className="bg-netflix-gray rounded-lg p-6">
            <div className="text-3xl font-bold text-netflix-red mb-2">
              {categories.length}
            </div>
            <div className="text-netflix-light-gray">
              Main Categories
            </div>
          </div>
          <div className="bg-netflix-gray rounded-lg p-6">
            <div className="text-3xl font-bold text-netflix-red mb-2">
              {filteredSubcategories.length}
            </div>
            <div className="text-netflix-light-gray">
              Matching Results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}