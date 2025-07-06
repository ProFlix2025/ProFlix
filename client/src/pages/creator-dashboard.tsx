import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Video, Eye, Clock, Users, Upload, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  isPublished: z.boolean().default(false),
});

export default function CreatorDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['/api/creator/videos'],
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories } = useQuery({
    queryKey: ['/api/subcategories'],
  });

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      categoryId: "",
      subcategoryId: "",
      isPublished: false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await apiRequest('POST', '/api/creator/videos', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/creator/videos'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: number) => {
      await apiRequest('DELETE', `/api/creator/videos/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/videos'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof uploadSchema>) => {
    const formData = new FormData();
    
    // Get files from file inputs
    const videoFile = (document.getElementById('video-file') as HTMLInputElement)?.files?.[0];
    const thumbnailFile = (document.getElementById('thumbnail-file') as HTMLInputElement)?.files?.[0];
    
    if (!videoFile) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    uploadMutation.mutate(formData);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
            <p className="text-netflix-light-gray">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalVideos = videos?.length || 0;
  const totalViews = videos?.reduce((sum: number, video: any) => sum + (video.views || 0), 0) || 0;
  const publishedVideos = videos?.filter((video: any) => video.isPublished).length || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Dashboard</h1>
          <p className="text-netflix-light-gray">Manage your content and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Total Videos</p>
                  <p className="text-2xl font-bold">{totalVideos}</p>
                </div>
                <Video className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Published</p>
                  <p className="text-2xl font-bold">{publishedVideos}</p>
                </div>
                <Clock className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Subscribers</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Users className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="bg-netflix-black border-netflix-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="video-file">Video File</Label>
                    <FileUpload
                      id="video-file"
                      accept="video/*"
                      maxSize={1024 * 1024 * 1024} // 1GB
                      placeholder="Drag and drop your video file here or click to browse"
                      description="MP4 files up to 1GB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thumbnail-file">Thumbnail (Optional)</Label>
                    <FileUpload
                      id="thumbnail-file"
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                      placeholder="Upload thumbnail image"
                      description="JPG, PNG up to 5MB"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter video title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories?.map((subcategory: any) => (
                              <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15:30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your video content..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-4">
                  <Button 
                    type="submit" 
                    disabled={uploadMutation.isPending}
                    className="bg-netflix-red hover:bg-red-700"
                  >
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.setValue('isPublished', true)}
                  >
                    Upload & Publish
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* My Videos Section */}
        <Card className="bg-netflix-black border-netflix-border">
          <CardHeader>
            <CardTitle>My Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {videosLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
                <p className="text-netflix-light-gray">Loading videos...</p>
              </div>
            ) : !videos || videos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-netflix-gray mx-auto mb-4" />
                <p className="text-netflix-light-gray">No videos uploaded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-netflix-border">
                      <th className="text-left py-3 px-4">Video</th>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video: any) => (
                      <tr key={video.id} className="border-b border-netflix-border hover:bg-netflix-gray/50">
                        <td className="py-3 px-4">
                          <div className="w-16 h-9 bg-netflix-gray rounded overflow-hidden">
                            {video.thumbnailUrl ? (
                              <img 
                                src={video.thumbnailUrl} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-netflix-gray flex items-center justify-center">
                                <Video className="w-4 h-4 text-netflix-light-gray" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-netflix-light-gray">{video.duration}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{video.category?.name}</Badge>
                        </td>
                        <td className="py-3 px-4 text-netflix-light-gray">{video.views || 0}</td>
                        <td className="py-3 px-4">
                          <Badge variant={video.isPublished ? "default" : "outline"}>
                            {video.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="text-netflix-red hover:text-red-400">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-netflix-light-gray hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-netflix-light-gray hover:text-red-400"
                              onClick={() => deleteMutation.mutate(video.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
