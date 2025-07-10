import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Academy, 
  Upload, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Gift,
  Settings,
  BookOpen,
  Users,
  TrendingUp
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const academyVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.number().min(1, "Category is required"),
  subcategoryId: z.number().min(1, "Subcategory is required"),
  isCourse: z.boolean().default(false),
  coursePrice: z.number().min(0).default(0),
  courseDescription: z.string().optional(),
  isFreeContent: z.boolean().default(false),
  offersPremiumDiscount: z.boolean().default(false),
  tags: z.string().optional(),
});

type AcademyVideoForm = z.infer<typeof academyVideoSchema>;

export default function AdminContent() {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const form = useForm<AcademyVideoForm>({
    resolver: zodResolver(academyVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: 0,
      subcategoryId: 0,
      isCourse: false,
      coursePrice: 0,
      courseDescription: "",
      isFreeContent: false,
      offersPremiumDiscount: false,
      tags: "",
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: subcategories = [] } = useQuery({
    queryKey: ["/api/subcategories"],
  });

  const { data: academyVideos = [], isLoading } = useQuery({
    queryKey: ["/api/admin/academy-videos"],
  });

  const { data: academyStats } = useQuery({
    queryKey: ["/api/admin/academy-stats"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: AcademyVideoForm) => {
      const formData = new FormData();
      
      // Add video and thumbnail files
      if (videoFile) formData.append("video", videoFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      return apiRequest("POST", "/api/admin/academy-videos", formData, {
        headers: {
          // Don't set Content-Type - let browser set it for multipart/form-data
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Content Uploaded!",
        description: "ProFlix Academy content has been successfully uploaded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/academy-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/academy-stats"] });
      setIsUploadDialogOpen(false);
      form.reset();
      setVideoFile(null);
      setThumbnailFile(null);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return apiRequest("DELETE", `/api/admin/academy-videos/${videoId}`);
    },
    onSuccess: () => {
      toast({
        title: "Content Deleted",
        description: "ProFlix Academy content has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/academy-videos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/academy-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AcademyVideoForm) => {
    if (!videoFile) {
      toast({
        title: "Video Required",
        description: "Please select a video file to upload",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(data);
  };

  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: cat.name,
  }));

  const subcategoryOptions = subcategories
    .filter((sub: any) => sub.categoryId === form.watch("categoryId"))
    .map((sub: any) => ({
      value: sub.id,
      label: sub.name,
    }));

  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-netflix-red" />
            <div>
              <h1 className="text-3xl font-bold text-white">ProFlix Academy</h1>
              <p className="text-netflix-light-gray">
                Manage starter content and example courses for the platform
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/admin/dashboard'}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-netflix-red hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-netflix-gray border-netflix-border">
                <DialogHeader>
                  <DialogTitle className="text-white">Upload ProFlix Academy Content</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Title</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Course/Video Title"
                                className="bg-netflix-black border-netflix-border text-white"
                              />
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
                            <FormLabel className="text-white">Category</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger className="bg-netflix-black border-netflix-border text-white">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="subcategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Subcategory</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger className="bg-netflix-black border-netflix-border text-white">
                                  <SelectValue placeholder="Select subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subcategoryOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <Label className="text-white">Video File</Label>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="bg-netflix-black border-netflix-border text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Thumbnail (Optional)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                          className="bg-netflix-black border-netflix-border text-white"
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Tags (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="programming, web development, react"
                                className="bg-netflix-black border-netflix-border text-white"
                              />
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
                          <FormLabel className="text-white">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe your content..."
                              className="bg-netflix-black border-netflix-border text-white"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="bg-netflix-border" />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="isCourse"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-white">This is a course</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="isFreeContent"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-white">Free content</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("isCourse") && (
                      <div className="space-y-4 p-4 bg-netflix-black rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="coursePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Course Price ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    disabled={form.watch("isFreeContent")}
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    className="bg-netflix-gray border-netflix-border text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="offersPremiumDiscount"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 pt-8">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-white">Offer premium discount</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="courseDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Course Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="What will students learn from this course?"
                                  className="bg-netflix-gray border-netflix-border text-white"
                                  rows={2}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsUploadDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={uploadMutation.isPending}
                        className="bg-netflix-red hover:bg-red-700"
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload Content"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Total Videos</p>
                  <p className="text-2xl font-bold text-white">{academyStats?.totalVideos || 0}</p>
                </div>
                <Video className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Total Courses</p>
                  <p className="text-2xl font-bold text-white">{academyStats?.totalCourses || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Free Content</p>
                  <p className="text-2xl font-bold text-white">{academyStats?.freeContent || 0}</p>
                </div>
                <Gift className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-netflix-gray border-netflix-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-netflix-light-gray text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">{academyStats?.totalViews || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-netflix-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Table */}
        <Card className="bg-netflix-gray border-netflix-border">
          <CardHeader>
            <CardTitle className="text-white">ProFlix Academy Content</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
                <p className="text-netflix-light-gray">Loading content...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-netflix-border">
                    <TableHead className="text-netflix-light-gray">Title</TableHead>
                    <TableHead className="text-netflix-light-gray">Type</TableHead>
                    <TableHead className="text-netflix-light-gray">Category</TableHead>
                    <TableHead className="text-netflix-light-gray">Price</TableHead>
                    <TableHead className="text-netflix-light-gray">Views</TableHead>
                    <TableHead className="text-netflix-light-gray">Status</TableHead>
                    <TableHead className="text-netflix-light-gray">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academyVideos.map((video: any) => (
                    <TableRow key={video.id} className="border-netflix-border">
                      <TableCell className="text-white font-medium">{video.title}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {video.isCourse && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              Course
                            </Badge>
                          )}
                          {video.isFreeContent && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              Free
                            </Badge>
                          )}
                          {!video.isCourse && !video.isFreeContent && (
                            <Badge variant="outline" className="text-blue-500 border-blue-500">
                              Video
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-netflix-light-gray">
                        {video.category?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-netflix-light-gray">
                        {video.isFreeContent ? "Free" : video.coursePrice ? `$${(video.coursePrice / 100).toFixed(2)}` : "N/A"}
                      </TableCell>
                      <TableCell className="text-netflix-light-gray">{video.views || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Published
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/video/${video.id}`, '_blank')}
                          >
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(video.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}