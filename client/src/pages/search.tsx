import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import VideoCard from "@/components/VideoCard";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const q = urlParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/search', searchQuery],
    enabled: !!searchQuery,
  });

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navigation />
      
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-netflix-red" />
              <h1 className="text-3xl font-bold text-white">
                Search Results
              </h1>
            </div>
            
            {searchQuery && (
              <p className="text-netflix-light-gray text-lg">
                Results for: "<span className="text-white font-semibold">{searchQuery}</span>"
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && searchQuery && (
            <div>
              {(searchResults as any[])?.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-netflix-light-gray">
                      Found {(searchResults as any[]).length} course{(searchResults as any[]).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(searchResults as any[]).map((video: any) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-netflix-gray mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
                  <p className="text-netflix-light-gray">
                    Try searching with different keywords or browse our categories
                  </p>
                </div>
              )}
            </div>
          )}

          {/* No Search Query */}
          {!searchQuery && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-netflix-gray mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Search for Courses</h2>
              <p className="text-netflix-light-gray">
                Use the search bar above to find premium video courses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}