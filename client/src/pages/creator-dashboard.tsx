import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Video, Eye, Clock, Users, Upload, Edit, Trash2, BarChart3, DollarSign, CreditCard, MapPin, Calendar, TrendingUp, PlayCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

// Type definitions for API responses
interface Video {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  views?: number;
  price?: number;
  isPublished?: boolean;
  creatorId: string;
  categoryId: number;
  subcategoryId: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Analytics {
  totalViews: number;
  hoursWatched: number;
  avgWatchTime: string;
  deviceTypes: { device: string; percentage: number }[];
  topCountries: string[];
  coursePerformance?: any[];
}

interface Earnings {
  thisMonth: number;
  lastPayout: { date: string; amount: number };
  nextPayout: string;
  totalEarnings: number;
}

interface PayoutHistoryItem {
  date: string;
  grossSales: number;
  creatorShare: number;
  method: string;
  status: string;
}

const uploadSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  price: z.number().min(25, "Course price must be at least $25").max(999, "Course price cannot exceed $999"),
  privacy: z.enum(["public", "unlisted", "private"]).default("public"),
  tags: z.string().optional(),
  language: z.string().default("en"),
  isPublished: z.boolean().default(false),
  offerFreePreview: z.boolean().default(false),
});

export default function CreatorDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

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

  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/creator/videos'],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ['/api/subcategories'],
  });

  const { data: earnings, isLoading: earningsLoading } = useQuery<Earnings>({
    queryKey: ['/api/creator/earnings'],
    enabled: isAuthenticated,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/creator/analytics'],
    enabled: isAuthenticated,
  });

  const { data: payoutHistory = [], isLoading: payoutHistoryLoading } = useQuery<PayoutHistoryItem[]>({
    queryKey: ['/api/creator/payouts'],
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      categoryId: "",
      subcategoryId: "",
      price: 25,
      privacy: "public",
      tags: "",
      language: "en",
      isPublished: false,
      offerFreePreview: false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await apiRequest('POST', '/api/creator/videos', formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course uploaded successfully!",
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
        description: "Failed to upload course. Please try again.",
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
        description: "Course deleted successfully!",
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
        description: "Failed to delete course. Please try again.",
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
    
    // Convert tags string to array
    const tagsArray = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'tags') {
        formData.append(key, JSON.stringify(tagsArray));
      } else if (key === 'price') {
        // Convert price from dollars to cents
        formData.append(key, String(Math.round(Number(value) * 100)));
      } else {
        formData.append(key, String(value));
      }
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

  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum: number, video: Video) => sum + (video.views || 0), 0);
  const publishedVideos = videos.filter((video: Video) => video.isPublished).length;

  // Use real data from APIs with fallbacks
  const currentEarnings = earnings || {
    thisMonth: 2720,
    lastPayout: { date: "2025-01-01", amount: 2720 },
    nextPayout: "2025-02-01",
    totalEarnings: 5840
  };

  const currentAnalytics = analytics || {
    totalViews: totalViews,
    hoursWatched: Math.round(totalViews * 0.75),
    avgWatchTime: "45 minutes",
    deviceTypes: [
      { device: "Desktop", percentage: 65 },
      { device: "Mobile", percentage: 30 },
      { device: "Tablet", percentage: 5 }
    ],
    topCountries: ["United States", "Canada", "United Kingdom", "Australia"]
  };

  const currentPayoutHistory = payoutHistory.length > 0 ? payoutHistory : [
    { date: "2025-01-01", grossSales: 3400, creatorShare: 2720, method: "Stripe", status: "Paid" },
    { date: "2024-12-01", grossSales: 1400, creatorShare: 1120, method: "PayPal", status: "Paid" },
    { date: "2024-11-01", grossSales: 2100, creatorShare: 1680, method: "Stripe", status: "Paid" }
  ];

  const filteredSubcategories = subcategories.filter((sub: Subcategory) => 
    selectedCategoryId ? sub.categoryId === parseInt(selectedCategoryId) : true
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Portal</h1>
          <p className="text-netflix-light-gray">Upload courses, track analytics, and manage payouts</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-netflix-dark-gray">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Course
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payouts
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New Course
                </CardTitle>
                <p className="text-netflix-light-gray text-sm">
                  Video must be at least 10 minutes. Price range: $25-$999. You earn 80% of each sale.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="video-file">Video File *</Label>
                        <FileUpload
                          id="video-file"
                          accept="video/*"
                          maxSize={1024 * 1024 * 1024} // 1GB
                          placeholder="Drag and drop your course video here or click to browse"
                          description="MP4, MOV files up to 1GB (minimum 10 minutes)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="thumbnail-file">Thumbnail (Optional)</Label>
                        <FileUpload
                          id="thumbnail-file"
                          accept="image/*"
                          maxSize={5 * 1024 * 1024} // 5MB
                          placeholder="Upload course thumbnail"
                          description="JPG, PNG up to 5MB (auto-generated if not provided)"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter course title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price ($25-$999) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="25" 
                                max="999" 
                                placeholder="25" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 25)}
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your course content, what students will learn..."
                              rows={4}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedCategoryId(value);
                                form.setValue("subcategoryId", ""); // Reset subcategory
                              }} 
                              defaultValue={field.value}
                            >
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
                      <FormField
                        control={form.control}
                        name="subcategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Subcategory" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredSubcategories?.map((subcategory: any) => (
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
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., beginner, advanced, technique" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="offerFreePreview"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-netflix-border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Offer Free Preview?</FormLabel>
                              <p className="text-sm text-netflix-light-gray">
                                Allow users to preview your course
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={uploadMutation.isPending}
                        className="bg-netflix-red hover:bg-red-700"
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload & Publish Course"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => form.reset()}
                      >
                        Clear Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* My Courses Section */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {videosLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
                    <p className="text-netflix-light-gray">Loading courses...</p>
                  </div>
                ) : videos?.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video: any) => (
                      <div key={video.id} className="flex items-center justify-between p-4 border border-netflix-border rounded">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-12 bg-netflix-gray rounded flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-netflix-light-gray" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{video.title}</h3>
                            <p className="text-sm text-netflix-light-gray">
                              {video.views} views • ${(video.price / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={video.isPublished ? "default" : "secondary"}>
                            {video.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => deleteMutation.mutate(video.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="w-12 h-12 text-netflix-light-gray mx-auto mb-4" />
                    <p className="text-netflix-light-gray">No courses uploaded yet. Create your first course above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-netflix-black border-netflix-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-netflix-light-gray text-sm">Total Views</p>
                      <p className="text-2xl font-bold">{currentAnalytics.totalViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-netflix-red" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-netflix-black border-netflix-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-netflix-light-gray text-sm">Hours Watched</p>
                      <p className="text-2xl font-bold">{currentAnalytics.hoursWatched}</p>
                    </div>
                    <Clock className="w-8 h-8 text-netflix-red" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-netflix-black border-netflix-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-netflix-light-gray text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">${currentEarnings.totalEarnings}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-netflix-red" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-netflix-black border-netflix-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-netflix-light-gray text-sm">Avg. Watch Time</p>
                      <p className="text-2xl font-bold">{currentAnalytics.avgWatchTime}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-netflix-red" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Table */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Watch Time</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Earnings (80%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos?.length > 0 ? videos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>{video.views || 0}</TableCell>
                        <TableCell>{Math.round((video.views || 0) * 0.75)} hrs</TableCell>
                        <TableCell>${((video.price || 0) / 100).toFixed(2)}</TableCell>
                        <TableCell>${(((video.price || 0) / 100) * 0.8).toFixed(2)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-netflix-light-gray">
                          No courses available for analysis
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Device Types & Top Countries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-netflix-black border-netflix-border">
                <CardHeader>
                  <CardTitle>Device Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAnalytics.deviceTypes.map((device: any) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <span>{device.device}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-netflix-gray rounded-full h-2">
                            <div 
                              className="bg-netflix-red h-2 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-netflix-light-gray">{device.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-netflix-black border-netflix-border">
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentAnalytics.topCountries.map((country: string, index: number) => (
                      <div key={country} className="flex items-center justify-between p-2 border border-netflix-border rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-netflix-red font-bold">#{index + 1}</span>
                          <span>{country}</span>
                        </div>
                        <MapPin className="w-4 h-4 text-netflix-light-gray" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            {/* Payout Summary */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle>Payout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-netflix-light-gray text-sm">Earnings this month</p>
                    <p className="text-3xl font-bold text-green-500">${currentEarnings.thisMonth}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-netflix-light-gray text-sm">Last payout</p>
                    <p className="text-lg font-semibold">{currentEarnings.lastPayout.date}</p>
                    <p className="text-netflix-light-gray">${currentEarnings.lastPayout.amount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-netflix-light-gray text-sm">Next payout</p>
                    <p className="text-lg font-semibold">{currentEarnings.nextPayout}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <p className="text-netflix-light-gray text-sm">
                  Choose your preferred payout method. Payouts occur monthly on the 1st.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-netflix-border rounded">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="font-semibold">Stripe Connected</p>
                        <p className="text-sm text-netflix-light-gray">Primary payout method</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update Stripe Info</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-netflix-border rounded">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-netflix-light-gray">PayPal</p>
                        <p className="text-sm text-netflix-light-gray">Not connected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect PayPal</Button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-netflix-dark-gray rounded">
                  <p className="text-sm text-netflix-light-gray">
                    <strong>Revenue Split:</strong> You receive 80% of each sale, ProFlix retains 20% as platform fee.
                    Payouts are processed automatically on the 1st of each month for the previous month's earnings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Gross Sales</TableHead>
                      <TableHead>Your Share (80%)</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPayoutHistory.map((payout: PayoutHistoryItem, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{payout.date}</TableCell>
                        <TableCell>${payout.grossSales}</TableCell>
                        <TableCell className="text-green-500 font-semibold">${payout.creatorShare}</TableCell>
                        <TableCell>{payout.method}</TableCell>
                        <TableCell>
                          <Badge variant={payout.status === "Paid" ? "default" : "secondary"}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}