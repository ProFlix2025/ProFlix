import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Youtube, Plus, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface LearnTubeVideo {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  categoryId: number;
  subcategoryId: number;
  youtubeId: string;
  views: number;
  likes: number;
  createdAt: string;
  source: string;
  canRunAds: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Analytics {
  totalVideos: number;
  totalViews: number;
  avgViewsPerVideo: number;
  topCategories: Array<{ name: string; count: number }>;
}

export default function LearnTubeAdmin() {
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [newVideo, setNewVideo] = useState({
    embedCode: '',
    categoryId: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch LearnTube videos
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['admin', 'learntube', 'videos'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/learntube/videos');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      return response.json();
    }
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin', 'learntube', 'analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/learntube/analytics');
      return response.json();
    }
  });

  // Add YouTube video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (videoData: typeof newVideo) => {
      const response = await apiRequest('POST', '/api/admin/learntube/add-embed', videoData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'YouTube video added successfully',
      });
      setNewVideo({ embedCode: '', categoryId: '' });
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'learntube'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add YouTube video',
        variant: 'destructive',
      });
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (videoIds: number[]) => {
      const response = await apiRequest('POST', '/api/admin/learntube/bulk-delete', { videoIds });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Deleted ${data.deletedCount} videos successfully`,
      });
      setSelectedVideos([]);
      queryClient.invalidateQueries({ queryKey: ['admin', 'learntube'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete videos',
        variant: 'destructive',
      });
    }
  });

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/learntube/delete-all');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Deleted ${data.deletedCount} videos successfully`,
      });
      setSelectedVideos([]);
      queryClient.invalidateQueries({ queryKey: ['admin', 'learntube'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete all videos',
        variant: 'destructive',
      });
    }
  });

  const handleAddVideo = () => {
    if (!newVideo.embedCode || !newVideo.categoryId) {
      toast({
        title: 'Error',
        description: 'Please provide embed code and select a category',
        variant: 'destructive',
      });
      return;
    }
    addVideoMutation.mutate(newVideo);
  };

  const handleVideoSelect = (videoId: number) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVideos.length === videos?.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos?.map((v: LearnTubeVideo) => v.id) || []);
    }
  };

  const handleBulkDelete = () => {
    if (selectedVideos.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select videos to delete',
        variant: 'destructive',
      });
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedVideos.length} videos?`);
    if (confirmed) {
      bulkDeleteMutation.mutate(selectedVideos);
    }
  };

  const handleDeleteAll = () => {
    const confirmed = window.confirm('Are you sure you want to delete ALL LearnTube videos? This action cannot be undone.');
    if (confirmed) {
      deleteAllMutation.mutate();
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">LearnTube Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add YouTube Video
            </Button>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'learntube'] })}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300">Total Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.totalVideos}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300">Avg Views/Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{analytics.avgViewsPerVideo}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">
                  {analytics.topCategories[0]?.name || 'None'}
                </div>
                <div className="text-sm text-gray-400">
                  {analytics.topCategories[0]?.count || 0} videos
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Video Form */}
        {showAddForm && (
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle>Add YouTube Video (Admin Only - Temporary System)</CardTitle>
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mt-2">
                <p className="text-yellow-300 text-sm">
                  ⚠️ <strong>TEMPORARY SYSTEM:</strong> This LearnTube content will be deleted once you have sufficient original ProFlix content. 
                  No ad revenue is generated from these videos.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">YouTube Embed Code *</label>
                <Textarea
                  placeholder='Paste YouTube embed code here: <iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...'
                  value={newVideo.embedCode || ''}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, embedCode: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Copy the full embed code from YouTube's share → embed option
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={newVideo.categoryId} onValueChange={(value) => setNewVideo(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.emoji} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleAddVideo}
                  disabled={addVideoMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {addVideoMutation.isPending ? 'Adding...' : 'Add Video'}
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {videos && videos.length > 0 && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedVideos.length === videos.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">
                      {selectedVideos.length === videos.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {selectedVideos.length} of {videos.length} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBulkDelete}
                    disabled={selectedVideos.length === 0 || bulkDeleteMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    onClick={handleDeleteAll}
                    disabled={deleteAllMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Videos Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">LearnTube Videos ({videos?.length || 0})</h2>
          </div>

          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : !videos || videos.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Youtube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No LearnTube videos found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Add YouTube videos to build your educational content library
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video: LearnTubeVideo) => (
                <Card key={video.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => handleVideoSelect(video.id)}
                      />
                      <div className="flex-1">
                        <div className="aspect-video bg-gray-700 rounded-lg mb-3 overflow-hidden">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{video.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(video.categoryId)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {video.views} views
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>YouTube ID: {video.youtubeId}</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="mt-8 bg-gray-800 border-gray-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-gray-300">
            <strong>ADMIN-ONLY LearnTube System:</strong> This is a temporary content management system for admin use ONLY. 
            Creators cannot embed YouTube videos - only you as admin can manage LearnTube content.
            LearnTube videos generate no ad revenue and are designed to be easily deleted once you have sufficient original ProFlix content.
            All videos are marked with source "learntube" for easy bulk removal operations.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}