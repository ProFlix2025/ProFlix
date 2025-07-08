import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, DollarSign, Clock, TrendingUp, Users, Video, Eye, Heart } from "lucide-react";
import { useState } from "react";

interface CreatorStats {
  totalVideos: number;
  totalViews: number;
  totalEarnings: number;
  uploadHoursUsed: number;
  uploadHoursLimit: number;
  accountType: string;
  streamingVideos: number;
  basicVideos: number;
  premiumVideos: number;
  streamingEarnings: number;
  basicEarnings: number;
}

interface VideoUploadData {
  title: string;
  description: string;
  categoryId: number;
  subcategoryId: number;
  videoType: 'streaming' | 'basic' | 'premium';
  price?: number;
  externalPaymentUrl?: string;
  externalPrice?: number;
  isDonatedToStreaming: boolean;
}

export default function CreatorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadForm, setUploadForm] = useState<VideoUploadData>({
    title: '',
    description: '',
    categoryId: 0,
    subcategoryId: 0,
    videoType: 'streaming',
    price: 0,
    isDonatedToStreaming: false
  });

  // Fetch creator stats
  const { data: stats } = useQuery<CreatorStats>({
    queryKey: ['/api/creator/stats'],
    enabled: isAuthenticated,
  });

  // Fetch creator videos
  const { data: videos } = useQuery({
    queryKey: ['/api/creator/videos'],
    enabled: isAuthenticated,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Account upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async (type: 'pro' | 'streaming') => {
      return apiRequest('POST', '/api/creator/upgrade', { accountType: type });
    },
    onSuccess: () => {
      toast({
        title: "Account Upgraded",
        description: "Your account has been successfully upgraded!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Video upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/creator/upload', formData);
    },
    onSuccess: () => {
      toast({
        title: "Video Uploaded",
        description: "Your video has been uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/stats'] });
      setUploadForm({
        title: '',
        description: '',
        categoryId: 0,
        subcategoryId: 0,
        videoType: 'streaming',
        price: 0,
        isDonatedToStreaming: false
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Add video type specific data
    Object.entries(uploadForm).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    uploadMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Creator Dashboard</CardTitle>
            <CardDescription>
              Please sign in to access your creator dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const uploadProgress = stats ? (stats.uploadHoursUsed / stats.uploadHoursLimit) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your content and track your earnings across all three tiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={stats?.accountType === 'pro' ? 'default' : 'secondary'}>
            {stats?.accountType === 'pro' ? 'Pro Creator' : 'Free Creator'}
          </Badge>
          {stats?.accountType === 'free' && (
            <Button 
              onClick={() => upgradeMutation.mutate('pro')}
              disabled={upgradeMutation.isPending}
            >
              Upgrade to Pro ($199/month)
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVideos || 0}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Streaming: {stats?.streamingVideos || 0}</div>
              <div>Basic: {stats?.basicVideos || 0}</div>
              <div>Premium: {stats?.premiumVideos || 0}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((stats?.totalEarnings || 0) / 100).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Streaming: ${((stats?.streamingEarnings || 0) / 100).toFixed(2)}</div>
              <div>Basic: ${((stats?.basicEarnings || 0) / 100).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.uploadHoursUsed || 0}h / {stats?.uploadHoursLimit || 5}h
            </div>
            <Progress value={uploadProgress} className="mt-2" />
            {stats?.accountType === 'free' && uploadProgress > 80 && (
              <p className="text-xs text-orange-600 mt-1">
                Consider upgrading to Pro for 500h limit
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="videos">My Videos</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Video</CardTitle>
              <CardDescription>
                Choose your monetization strategy: streaming royalties, direct sales, or premium pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File</Label>
                    <Input
                      id="video"
                      name="video"
                      type="file"
                      accept="video/*"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Video Type & Pricing</Label>
                  <Select
                    value={uploadForm.videoType}
                    onValueChange={(value: 'streaming' | 'basic' | 'premium') => 
                      setUploadForm({...uploadForm, videoType: value, price: 0, externalPrice: 0})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="streaming">
                        Streaming (Royalties based on watch time)
                      </SelectItem>
                      <SelectItem value="basic">
                        Basic Video (&lt; $99 - 70% revenue)
                      </SelectItem>
                      <SelectItem value="premium">
                        Premium Course ($100-$4000 - 100% revenue)
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {uploadForm.videoType === 'basic' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="1"
                        max="99"
                        value={uploadForm.price || ''}
                        onChange={(e) => setUploadForm({...uploadForm, price: parseInt(e.target.value) || 0})}
                        placeholder="e.g., 29"
                      />
                      <p className="text-sm text-muted-foreground">
                        You'll receive 70% (${((uploadForm.price || 0) * 0.7).toFixed(2)})
                      </p>
                    </div>
                  )}

                  {uploadForm.videoType === 'premium' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="externalPrice">Course Price (USD)</Label>
                        <Input
                          id="externalPrice"
                          type="number"
                          min="100"
                          max="4000"
                          value={uploadForm.externalPrice || ''}
                          onChange={(e) => setUploadForm({...uploadForm, externalPrice: parseInt(e.target.value) || 0})}
                          placeholder="e.g., 297"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="externalPaymentUrl">Your PayPal/Stripe Checkout URL</Label>
                        <Input
                          id="externalPaymentUrl"
                          type="url"
                          value={uploadForm.externalPaymentUrl || ''}
                          onChange={(e) => setUploadForm({...uploadForm, externalPaymentUrl: e.target.value})}
                          placeholder="https://buy.stripe.com/your-link or https://paypal.me/your-link"
                          required={uploadForm.videoType === 'premium'}
                        />
                        <p className="text-sm text-muted-foreground">
                          You keep 100% of the revenue from premium courses
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDonatedToStreaming"
                    checked={uploadForm.isDonatedToStreaming}
                    onChange={(e) => setUploadForm({...uploadForm, isDonatedToStreaming: e.target.checked})}
                  />
                  <Label htmlFor="isDonatedToStreaming" className="text-sm">
                    Donate this video to streaming library (required for one video per creator)
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>My Videos</CardTitle>
              <CardDescription>
                Manage your content across all three tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videos && videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map((video: any) => (
                    <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{video.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <Badge variant={
                            video.videoType === 'premium' ? 'default' : 
                            video.videoType === 'basic' ? 'secondary' : 'outline'
                          }>
                            {video.videoType}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {video.videoType === 'basic' 
                              ? `$${(video.price / 100).toFixed(2)}`
                              : video.videoType === 'premium'
                              ? `$${(video.externalPrice / 100).toFixed(2)}`
                              : 'Streaming'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No videos uploaded yet. Start creating content to build your audience!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>
                Track your revenue across all monetization methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium text-blue-600">Streaming Royalties</h3>
                    <p className="text-2xl font-bold mt-2">
                      ${((stats?.streamingEarnings || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">70% of subscription revenue</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium text-green-600">Basic Video Sales</h3>
                    <p className="text-2xl font-bold mt-2">
                      ${((stats?.basicEarnings || 0) / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">70% of direct sales</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium text-purple-600">Premium Courses</h3>
                    <p className="text-2xl font-bold mt-2">External</p>
                    <p className="text-sm text-muted-foreground">100% via your payment links</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Payment Information</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      • Streaming and basic video earnings are paid monthly via Stripe
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Premium course payments go directly to your PayPal/Stripe account
                    </p>
                    <p className="text-sm text-muted-foreground">
                      • Minimum payout threshold: $50
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Creator Settings</CardTitle>
              <CardDescription>
                Manage your payment methods and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Premium Course Payment URLs</h3>
                  <div className="space-y-2">
                    <Label htmlFor="paypalUrl">PayPal Checkout URL</Label>
                    <Input
                      id="paypalUrl"
                      placeholder="https://paypal.me/yourusername"
                      defaultValue={user?.paypalPaymentUrl || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeUrl">Stripe Payment Link</Label>
                    <Input
                      id="stripeUrl"
                      placeholder="https://buy.stripe.com/your-link"
                      defaultValue={user?.stripePaymentUrl || ''}
                    />
                  </div>
                  <Button>Save Payment URLs</Button>
                </div>

                {stats?.accountType === 'free' && (
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Upgrade Your Account</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Pro Creator - $199/month</h4>
                        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                          <li>• 500 hours of upload space</li>
                          <li>• Advanced analytics dashboard</li>
                          <li>• Course building tools</li>
                          <li>• Priority support</li>
                        </ul>
                        <Button 
                          className="mt-4"
                          onClick={() => upgradeMutation.mutate('pro')}
                          disabled={upgradeMutation.isPending}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}