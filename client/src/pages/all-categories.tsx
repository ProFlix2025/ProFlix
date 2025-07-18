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

  const { data: subcategories = [] } = useQuery({
    queryKey: ['/api/subcategories'],
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

        {/* Categories with Subcategories */}
        <div className="space-y-12">
          {Array.isArray(categories) && categories.map((category: any) => {
            const categorySubcategories = Array.isArray(subcategories) 
              ? subcategories.filter((sub: any) => sub.categoryId === category.id)
              : [];
              
            return (
              <div key={category.id} className="space-y-6">
                {/* Main Category Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-netflix-border">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.emoji || '📂'}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                      <p className="text-netflix-light-gray text-sm">{category.description}</p>
                    </div>
                  </div>
                  <Link href={`/category/${category.slug}`}>
                    <Button 
                      variant="outline"
                      className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white ml-auto"
                    >
                      View All
                    </Button>
                  </Link>
                </div>

                {/* Subcategories Grid */}
                {categorySubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categorySubcategories.map((subcategory: any) => (
                      <Card key={subcategory.id} className="bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {subcategory.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium text-sm line-clamp-1">
                                {subcategory.name}
                              </h3>
                              <p className="text-netflix-light-gray text-xs">
                                {subcategory.slug}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-netflix-light-gray">No subcategories in this category</p>
                  </div>
                )}
              </div>
            );
          })}
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