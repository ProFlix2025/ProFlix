import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Eye, 
  Video,
  Settings,
  AlertTriangle,
  Ban,
  CheckCircle,
  Crown
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isProCreator: boolean;
  proCreatorEndsAt: string;
  channelName: string;
  createdAt: string;
  totalVideos: number;
  totalEarnings: number;
  totalViews: number;
}

interface Analytics {
  totalUsers: number;
  totalCreators: number;
  totalProCreators: number;
  totalVideos: number;
  totalViews: number;
  totalRevenue: number;
  dailyVisits: Array<{ date: string; visits: number }>;
  hourlyActivity: Array<{ hour: number; activity: number }>;
  topCreators: Array<{ id: string; name: string; earnings: number; videos: number }>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: creators, isLoading: creatorsLoading } = useQuery({
    queryKey: ["/api/admin/creators"],
  });

  const removeCreatorMutation = useMutation({
    mutationFn: async (creatorId: string) => {
      return apiRequest("DELETE", `/api/admin/creators/${creatorId}`);
    },
    onSuccess: () => {
      toast({
        title: "Creator Removed",
        description: "Creator has been permanently removed from the platform",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/creators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      setSelectedCreator(null);
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove creator",
        variant: "destructive",
      });
    },
  });

  const suspendCreatorMutation = useMutation({
    mutationFn: async (creatorId: string) => {
      return apiRequest("POST", `/api/admin/creators/${creatorId}/suspend`);
    },
    onSuccess: () => {
      toast({
        title: "Creator Suspended",
        description: "Creator account has been suspended",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/creators"] });
    },
    onError: (error) => {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend creator",
        variant: "destructive",
      });
    },
  });

  const handleRemoveCreator = (creator: Creator) => {
    if (window.confirm(`Are you sure you want to permanently remove ${creator.firstName} ${creator.lastName}? This action cannot be undone.`)) {
      removeCreatorMutation.mutate(creator.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-netflix-red" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-netflix-light-gray">
                Platform analytics and creator management
              </p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/admin/codes'}
            className="bg-netflix-red hover:bg-red-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Code Generator
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-netflix-gray">
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
            <TabsTrigger value="creators" className="text-white">Creators</TabsTrigger>
            <TabsTrigger value="financial" className="text-white">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full mx-auto" />
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-netflix-light-gray">
                        Total Users
                      </CardTitle>
                      <Users className="w-4 h-4 text-netflix-red" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {analytics?.totalUsers?.toLocaleString() || '0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-netflix-light-gray">
                        Total Videos
                      </CardTitle>
                      <Video className="w-4 h-4 text-netflix-red" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {analytics?.totalVideos?.toLocaleString() || '0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-netflix-light-gray">
                        Total Views
                      </CardTitle>
                      <Eye className="w-4 h-4 text-netflix-red" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {analytics?.totalViews?.toLocaleString() || '0'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-netflix-light-gray">
                        Platform Revenue
                      </CardTitle>
                      <DollarSign className="w-4 h-4 text-netflix-red" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(analytics?.totalRevenue || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-netflix-red" />
                        Peak Activity Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics?.hourlyActivity?.slice(0, 5).map((hour: any) => (
                          <div key={hour.hour} className="flex items-center justify-between">
                            <span className="text-netflix-light-gray">
                              {hour.hour}:00 - {hour.hour + 1}:00
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-netflix-black rounded-full h-2">
                                <div 
                                  className="bg-netflix-red h-2 rounded-full"
                                  style={{ width: `${(hour.activity / Math.max(...(analytics?.hourlyActivity?.map((h: any) => h.activity) || [1]))) * 100}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">{hour.activity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-netflix-gray border-netflix-border">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-netflix-red" />
                        Top Earning Creators
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics?.topCreators?.slice(0, 5).map((creator: any, index: number) => (
                          <div key={creator.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-netflix-red font-bold">#{index + 1}</span>
                              <span className="text-white">{creator.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold">
                                {formatCurrency(creator.earnings)}
                              </div>
                              <div className="text-netflix-light-gray text-xs">
                                {creator.videos} videos
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <Card className="bg-netflix-gray border-netflix-border">
              <CardHeader>
                <CardTitle className="text-white">Creator Management</CardTitle>
              </CardHeader>
              <CardContent>
                {creatorsLoading ? (
                  <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full mx-auto" />
                ) : (
                  <div className="space-y-4">
                    {creators?.map((creator: Creator) => (
                      <div
                        key={creator.id}
                        className="flex items-center justify-between p-4 bg-netflix-black rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-semibold">
                                {creator.firstName} {creator.lastName}
                              </h3>
                              {creator.isProCreator && (
                                <Crown className="w-4 h-4 text-netflix-red" />
                              )}
                            </div>
                            <p className="text-netflix-light-gray text-sm">{creator.email}</p>
                            <p className="text-netflix-light-gray text-xs">
                              Channel: {creator.channelName || 'No channel name'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-white text-sm">
                              {creator.totalVideos} videos • {creator.totalViews} views
                            </div>
                            <div className="text-netflix-light-gray text-xs">
                              Earned: {formatCurrency(creator.totalEarnings || 0)}
                            </div>
                            <div className="text-netflix-light-gray text-xs">
                              Joined: {new Date(creator.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => suspendCreatorMutation.mutate(creator.id)}
                              disabled={suspendCreatorMutation.isPending}
                              className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Suspend
                            </Button>
                            
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCreator(creator)}
                              disabled={removeCreatorMutation.isPending}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {creators?.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-netflix-light-gray mx-auto mb-4" />
                        <p className="text-netflix-light-gray">No creators found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-netflix-gray border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-white text-center">Pro Creator Revenue</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {formatCurrency(analytics?.proCreatorRevenue || 0)}
                  </div>
                  <p className="text-netflix-light-gray text-sm">Monthly subscriptions</p>
                </CardContent>
              </Card>

              <Card className="bg-netflix-gray border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-white text-center">Course Sales</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">
                    {formatCurrency(analytics?.courseSalesRevenue || 0)}
                  </div>
                  <p className="text-netflix-light-gray text-sm">Platform commission</p>
                </CardContent>
              </Card>

              <Card className="bg-netflix-gray border-netflix-border">
                <CardHeader>
                  <CardTitle className="text-white text-center">Premium Viewers</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-netflix-red mb-2">
                    {formatCurrency(analytics?.premiumRevenue || 0)}
                  </div>
                  <p className="text-netflix-light-gray text-sm">Ad-free subscriptions</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}