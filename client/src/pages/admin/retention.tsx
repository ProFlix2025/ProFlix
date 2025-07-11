import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Users, TrendingUp, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DowngradedCreator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  channelName: string;
  previousProCreatorTier: string;
  proCreatorTier: string;
  downgradedAt: string;
  downgradedReason: string;
  reactivationAttempts: number;
  lastReactivationEmail: string;
  currentCourseCount: number;
}

export default function AdminRetention() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string>("");

  const { data: downgradedCreators, isLoading } = useQuery<DowngradedCreator[]>({
    queryKey: ["/api/admin/downgraded-creators"],
    retry: false,
  });

  const reactivateCreatorMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      return await apiRequest("POST", `/api/admin/reactivate-creator/${userId}`, { tier });
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Creator Reactivated",
        description: `Successfully reactivated creator to ${variables.tier} tier`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/downgraded-creators"] });
    },
    onError: (error) => {
      toast({
        title: "Reactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downgradeCreatorMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return await apiRequest("POST", `/api/admin/downgrade-creator/${userId}`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Creator Downgraded",
        description: "Creator has been downgraded to free tier",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/downgraded-creators"] });
    },
    onError: (error) => {
      toast({
        title: "Downgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReactivate = (userId: string, tier: string) => {
    if (!tier) {
      toast({
        title: "Select Tier",
        description: "Please select a tier before reactivating",
        variant: "destructive",
      });
      return;
    }
    reactivateCreatorMutation.mutate({ userId, tier });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'plus': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'payment_failed': return <Badge variant="destructive">Payment Failed</Badge>;
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>;
      case 'expired': return <Badge variant="outline">Expired</Badge>;
      case 'admin_downgrade': return <Badge variant="default">Admin Action</Badge>;
      default: return <Badge variant="outline">{reason}</Badge>;
    }
  };

  const activeCreators = downgradedCreators?.filter(creator => creator.proCreatorTier === 'free') || [];
  const totalReactivationAttempts = downgradedCreators?.reduce((sum, creator) => sum + creator.reactivationAttempts, 0) || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Retention Management</h1>
        <p className="text-gray-600">Manage downgraded Pro Creators and customer retention strategies</p>
      </div>

      {/* Retention Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downgraded</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downgradedCreators?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Creators on free tier after downgrade
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactivation Attempts</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReactivationAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Total outreach attempts made
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {downgradedCreators?.length ? Math.round((activeCreators.length / downgradedCreators.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Creators retained vs. lost
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="downgraded" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="downgraded">Downgraded Creators</TabsTrigger>
          <TabsTrigger value="reactivation">Reactivation Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="downgraded" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Downgraded Pro Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {downgradedCreators?.map((creator) => (
                  <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {creator.firstName} {creator.lastName}
                        </h3>
                        <Badge className={getTierColor(creator.previousProCreatorTier)}>
                          Was: {creator.previousProCreatorTier}
                        </Badge>
                        <Badge className={getTierColor(creator.proCreatorTier)}>
                          Now: {creator.proCreatorTier}
                        </Badge>
                        {getReasonBadge(creator.downgradedReason)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> {creator.email}</p>
                        <p><strong>Channel:</strong> {creator.channelName || 'No channel name'}</p>
                        <p><strong>Courses:</strong> {creator.currentCourseCount}</p>
                        <p><strong>Downgraded:</strong> {new Date(creator.downgradedAt).toLocaleDateString()}</p>
                        <p><strong>Reactivation Attempts:</strong> {creator.reactivationAttempts}</p>
                        {creator.lastReactivationEmail && (
                          <p><strong>Last Contact:</strong> {new Date(creator.lastReactivationEmail).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedTier} onValueChange={setSelectedTier}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free (1 course)</SelectItem>
                          <SelectItem value="standard">Standard ($99)</SelectItem>
                          <SelectItem value="plus">Plus ($297)</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleReactivate(creator.id, selectedTier)}
                        disabled={reactivateCreatorMutation.isPending || !selectedTier}
                        variant="outline"
                      >
                        {reactivateCreatorMutation.isPending ? "Processing..." : "Reactivate"}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {!downgradedCreators?.length && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No downgraded creators to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reactivation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Reactivation Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {downgradedCreators?.filter(creator => creator.reactivationAttempts > 0).map((creator) => (
                  <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {creator.firstName} {creator.lastName}
                        </h3>
                        <Badge variant="secondary">
                          {creator.reactivationAttempts} attempts
                        </Badge>
                        {getReasonBadge(creator.downgradedReason)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Email:</strong> {creator.email}</p>
                        <p><strong>Previous Tier:</strong> {creator.previousProCreatorTier}</p>
                        <p><strong>Last Contact:</strong> {creator.lastReactivationEmail ? new Date(creator.lastReactivationEmail).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Downgraded: {new Date(creator.downgradedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!downgradedCreators?.filter(creator => creator.reactivationAttempts > 0).length && (
                  <div className="text-center py-8 text-gray-500">
                    <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No creators in reactivation queue</p>
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