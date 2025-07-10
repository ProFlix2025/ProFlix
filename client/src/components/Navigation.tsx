import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, User, Settings, LogOut, Video, Home, Grid3X3, Heart, Star, ChevronDown } from "lucide-react";

export default function Navigation() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    // Clear any local storage/session data
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  return (
    <nav className="bg-netflix-black border-b border-netflix-border px-6 py-4">
      {/* Top row with logo, search, and user menu */}
      <div className="flex items-center justify-between mb-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-3xl font-bold text-netflix-red cursor-pointer">ProFlix</h1>
        </Link>

        {/* Centered Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for courses and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-netflix-gray border-netflix-border text-white placeholder-netflix-light-gray w-full h-12 text-lg pr-12 rounded-full"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-netflix-light-gray hover:text-white rounded-full"
            >
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </div>
        
        {/* User Menu */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={(user as any)?.profileImageUrl} alt={(user as any)?.firstName || (user as any)?.email} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-white">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-netflix-black border-netflix-border">
              <DropdownMenuItem className="text-white hover:bg-netflix-gray">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-netflix-gray">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-white hover:bg-netflix-gray"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-netflix-red hover:bg-red-700"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Bottom row with navigation links */}
      <div className="flex items-center justify-center space-x-8">
        <Link href="/" className="text-white hover:text-netflix-red transition-colors">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span className="text-lg">Home</span>
          </div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Link href="/categories" className="text-white hover:text-netflix-red transition-colors">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5" />
                <span className="text-lg">Categories</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </Link>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-netflix-black border-netflix-border max-h-96 overflow-y-auto">
            <DropdownMenuItem asChild>
              <Link href="/categories" className="w-full">
                <div className="flex items-center space-x-2 text-netflix-red hover:text-white font-semibold">
                  <Grid3X3 className="w-4 h-4" />
                  <span>All Categories</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <div className="h-px bg-netflix-border my-1" />
            {Array.isArray(categories) && categories.map((category: any) => (
              <DropdownMenuItem key={category.id} asChild>
                <Link href={`/category/${category.slug}`} className="text-white hover:bg-netflix-gray">
                  {category.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/premium" className="text-white hover:text-netflix-red transition-colors">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="text-lg">Premium</span>
          </div>
        </Link>

        <Link href="/creator-tiers" className="text-white hover:text-netflix-red transition-colors">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span className="text-lg">Creator</span>
          </div>
        </Link>



        {isAuthenticated && (
          <Link href="/favorites" className="text-white hover:text-netflix-red transition-colors">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="text-lg">Favorites</span>
            </div>
          </Link>
        )}

        {user && (user as any)?.role === 'creator' ? (
          <Link href="/creator" className="text-white hover:text-netflix-red transition-colors">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span className="text-lg">Creator Dashboard</span>
            </div>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
