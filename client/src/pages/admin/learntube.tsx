import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, Youtube, Play, Eye, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Video, Category } from '@shared/schema';

export default function LearnTubeAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeId: '',
    categoryId: '',
    durationMinutes: 0,
    thumbnailUrl: '',
  });

  // Get all categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get all LearnTube videos
  const { data: learnTubeVideos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/admin/learntube/videos'],
  });

  // Add YouTube video mutation
  const addVideoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!data.youtubeId || !data.title || !data.categoryId) {
        throw new Error('YouTube ID, title, and category are required');
      }
      
      return apiRequest('POST', '/api/admin/learntube/add', {
        ...data,
        thumbnailUrl: data.thumbnailUrl || `https://img.youtube.com/vi/${data.youtubeId}/maxresdefault.jpg`,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'YouTube video added to LearnTube successfully',
      });
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        youtubeId: '',
        categoryId: '',
        durationMinutes: 0,
        thumbnailUrl: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learntube/videos'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete single video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return apiRequest('DELETE', `/api/admin/learntube/delete/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'LearnTube video deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learntube/videos'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk delete all LearnTube content
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/admin/learntube/bulk-delete');
    },
    onSuccess: (data) => {
      toast({
        title: 'LEARNTUBE CLEANUP COMPLETE',
        description: `Successfully deleted ${data.deleted} YouTube videos and all related data`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/learntube/videos'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanYouTubeId = extractYouTubeId(formData.youtubeId);
    addVideoMutation.mutate({
      ...formData,
      youtubeId: cleanYouTubeId,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Youtube className="w-8 h-8 text-red-500" />
            LearnTube Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Manage YouTube educational content. All LearnTube videos are ad-free and easily removable.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add YouTube Video
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total LearnTube Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{learnTubeVideos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Content Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-red-600">YouTube Educational</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ad Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold text-green-600">Ad-Free Content</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Video Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add YouTube Video to LearnTube</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter video title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="youtubeId">YouTube URL or ID</Label>
                  <Input
                    id="youtubeId"
                    value={formData.youtubeId}
                    onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... or video ID"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.emoji} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                    placeholder="Duration in minutes"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={addVideoMutation.isPending}>
                  {addVideoMutation.isPending ? 'Adding...' : 'Add Video'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bulk Delete Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Bulk Delete All LearnTube Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            This will permanently delete ALL YouTube videos and related data (comments, likes, views, etc.).
            Use this when you have enough original content and want to remove all YouTube material.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={learnTubeVideos.length === 0}>
                Delete All LearnTube Content ({learnTubeVideos.length} videos)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all {learnTubeVideos.length} YouTube videos
                  and all related data including comments, likes, views, and watch history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => bulkDeleteMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete All LearnTube Content
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Video List */}
      <Card>
        <CardHeader>
          <CardTitle>LearnTube Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading videos...</div>
          ) : learnTubeVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No LearnTube videos found. Add some YouTube educational content to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {learnTubeVideos.map((video) => (
                <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-32 h-18 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{video.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{video.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {video.viewCount.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {video.durationMinutes} min
                      </span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        LearnTube
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Ad-Free
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://youtube.com/watch?v=${video.youtubeId}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteVideoMutation.mutate(video.id)}
                      disabled={deleteVideoMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}