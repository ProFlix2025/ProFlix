import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X, Play, DollarSign, Clock, Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

export default function Wishlist() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistCourses = [], isLoading } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await apiRequest('DELETE', `/api/wishlist/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({
        title: "Removed from Wishlist",
        description: "Course removed from your wishlist.",
      });
    },
  });

  const filteredCourses = wishlistCourses.filter((course: any) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
            <p className="text-netflix-light-gray mb-6">
              Sign in to add courses to your wishlist and access them anytime.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-netflix-red hover:bg-red-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-netflix-red" />
            <div>
              <h1 className="text-3xl font-bold text-white">Wishlist</h1>
              <p className="text-netflix-light-gray">
                Courses you want to purchase when you're ready
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-netflix-red text-netflix-red">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'}
          </Badge>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-netflix-light-gray w-5 h-5" />
          <Input
            type="text"
            placeholder="Search wishlist courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-netflix-gray border-netflix-border text-white placeholder-netflix-light-gray pl-10"
          />
        </div>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-netflix-gray border-netflix-border animate-pulse">
                <div className="aspect-video bg-netflix-light-gray"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-netflix-light-gray rounded mb-2"></div>
                  <div className="h-3 bg-netflix-light-gray rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-netflix-light-gray rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-netflix-light-gray mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? 'No courses found' : 'Your wishlist is empty'}
            </h2>
            <p className="text-netflix-light-gray mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find the courses you\'re looking for.'
                : 'When you find courses you want to purchase later, add them to your wishlist for easy access.'
              }
            </p>
            <Link href="/categories">
              <Button className="bg-netflix-red hover:bg-red-700">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course: any) => (
              <Card key={course.id} className="bg-netflix-gray border-netflix-border group hover:border-netflix-red transition-colors">
                <div className="relative">
                  <div className="aspect-video bg-netflix-black rounded-t-lg overflow-hidden">
                    <img
                      src={course.thumbnailUrl || '/api/placeholder/400/225'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMutation.mutate(course.id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white hover:bg-netflix-red hover:text-white rounded-full p-1 w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Badge className="absolute top-2 left-2 bg-netflix-red text-white">
                    Course
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-netflix-light-gray text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-netflix-light-gray mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{course.views || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        ${Math.round(course.coursePrice / 100)}
                      </span>
                    </div>
                    <Link href={`/video/${course.id}`}>
                      <Button size="sm" className="bg-netflix-red hover:bg-red-700">
                        Buy Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}