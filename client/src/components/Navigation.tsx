import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, User, Settings, LogOut, Video, Home, Grid3X3 } from "lucide-react";

export default function Navigation() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <nav className="bg-netflix-black border-b border-netflix-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <Link href="/">
          <h1 className="text-2xl font-bold text-netflix-red cursor-pointer">ProFlix</h1>
        </Link>
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-white hover:text-netflix-light-gray transition-colors">
            <div className="flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:text-netflix-light-gray">
                <Grid3X3 className="w-4 h-4 mr-1" />
                Categories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-netflix-black border-netflix-border">
              {categories?.map((category: any) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/category/${category.slug}`} className="text-white hover:bg-netflix-gray">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {user?.role === 'creator' && (
            <Link href="/creator" className="text-white hover:text-netflix-light-gray transition-colors">
              <div className="flex items-center space-x-1">
                <Video className="w-4 h-4" />
                <span>Creator Dashboard</span>
              </div>
            </Link>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-netflix-gray border-netflix-border text-white placeholder-netflix-light-gray w-64 pr-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-netflix-light-gray hover:text-white"
          >
            <Search className="w-4 h-4" />
          </Button>
        </form>
        
        {/* User Menu */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.profileImageUrl} alt={user.firstName || user.email} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-white">
                  {user.firstName || user.email}
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
    </nav>
  );
}
