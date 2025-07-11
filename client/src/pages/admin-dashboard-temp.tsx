import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Youtube, Trash2, Users, BarChart3, Settings, Eye } from 'lucide-react';
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Category {
  id: number;
  name: string;
  slug: string;
  emoji: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  source: string;
  youtubeId?: string;
  categoryId: number;
  createdAt: string;
}

export default function AdminDashboardTemp() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch LearnTube videos
  const { data: learnTubeVideos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos/learntube'],
  });

  // Add YouTube video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (data: { url: string; categoryId: number }) => {
      const response = await fetch('/api/admin/learntube/add-youtube-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add video');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'YouTube video embedded successfully',
      });
      // Reset form
      setYoutubeUrl('');
      setSelectedCategory('');
      // Refresh videos
      queryClient.invalidateQueries({ queryKey: ['/api/videos/learntube'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to embed video',
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl || !selectedCategory) {
      toast({
        title: 'Error',
        description: 'Please provide YouTube URL and select a category',
        variant: 'destructive',
      });
      return;
    }

    addVideoMutation.mutate({
      url: youtubeUrl,
      categoryId: parseInt(selectedCategory),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-netflix-red" />
            <h1 className="text-3xl font-bold">ProFlix Admin Dashboard (Test)</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-netflix-light-gray">Total Videos</p>
                  <p className="text-2xl font-bold text-white">{learnTubeVideos.length}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-netflix-light-gray">Total Views</p>
                  <p className="text-2xl font-bold text-white">
                    {learnTubeVideos.reduce((sum, video) => sum + video.views, 0)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-netflix-light-gray">Total Likes</p>
                  <p className="text-2xl font-bold text-white">
                    {learnTubeVideos.reduce((sum, video) => sum + video.likes, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-netflix-light-gray">Categories</p>
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                </div>
                <Settings className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add YouTube Video Section */}
        <Card className="bg-netflix-gray border-netflix-border mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Plus className="w-6 h-6 mr-2 text-netflix-red" />
              Embed YouTube Video to LearnTube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="youtube-url" className="text-white">YouTube URL</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="bg-netflix-dark-gray border-netflix-border text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                    <SelectTrigger className="bg-netflix-dark-gray border-netflix-border text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-netflix-dark-gray border-netflix-border">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.emoji} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-netflix-red hover:bg-red-700 text-white"
                disabled={addVideoMutation.isPending}
              >
                {addVideoMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Embedding Video...
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4 mr-2" />
                    Embed Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LearnTube Videos List */}
        <Card className="bg-netflix-gray border-netflix-border">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Youtube className="w-6 h-6 mr-2 text-netflix-red" />
              LearnTube Videos ({learnTubeVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learnTubeVideos.length === 0 ? (
                <p className="text-netflix-light-gray text-center py-8">
                  No LearnTube videos yet. Add your first YouTube video above!
                </p>
              ) : (
                learnTubeVideos.map((video) => (
                  <div key={video.id} className="flex items-center space-x-4 p-4 bg-netflix-dark-gray rounded-lg">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{video.title}</h3>
                      <p className="text-sm text-netflix-light-gray line-clamp-2">
                        {video.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-netflix-light-gray">
                        <span>👁️ {video.views} views</span>
                        <span>👍 {video.likes} likes</span>
                        <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-netflix-border text-netflix-light-gray hover:bg-netflix-dark-gray"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}