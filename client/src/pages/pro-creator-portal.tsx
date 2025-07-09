import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Upload, Settings } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ProCreatorPortal() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Check if user is Pro Creator
  const { data: proStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/pro-creator/status"],
    enabled: isAuthenticated,
  });

  const { data: earnings } = useQuery({
    queryKey: ["/api/creator/earnings"],
    enabled: isAuthenticated && proStatus?.isProCreator,
  });

  const { data: videos } = useQuery({
    queryKey: ["/api/creator/videos"],
    enabled: isAuthenticated && proStatus?.isProCreator,
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/pro-creator/subscribe");
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your Pro Creator subscription is now active!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pro-creator/status"] });
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to activate Pro Creator subscription",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 text-netflix-red mx-auto mb-4" />
            <CardTitle className="text-white">Pro Creator Portal</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-netflix-light-gray mb-4">
              Please sign in to access the Pro Creator portal.
            </p>
            <Button onClick={() => window.location.href = "/api/login"} className="bg-netflix-red hover:bg-red-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not a Pro Creator, show subscription page
  if (!proStatus?.isProCreator) {
    return (
      <div className="min-h-screen bg-netflix-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Pro Creator Portal</h1>
            <p className="text-netflix-light-gray text-lg">
              Unlock the power to sell premium courses and keep 100% of your earnings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="bg-netflix-gray border-netflix-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-netflix-red" />
                  Monetization Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-netflix-light-gray space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sell courses from $10 to $4,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Keep 100% of course sales revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Add course upsells under your videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced analytics and creator dashboard</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-netflix-gray border-netflix-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-netflix-red" />
                  Pro Creator Features
                </CardTitle>
              </CardHeader>
              <CardContent className="text-netflix-light-gray space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Priority support and guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Custom branding options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Detailed revenue tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Advanced course management tools</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-netflix-red to-red-700 border-none text-center">
            <CardHeader>
              <CardTitle className="text-white text-3xl">
                Pro Creator Subscription
              </CardTitle>
              <p className="text-red-100">
                Start selling premium courses today
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-5xl font-bold text-white mb-2">$99</div>
                <div className="text-red-100">per month</div>
              </div>
              <Button
                onClick={() => subscribeMutation.mutate()}
                disabled={subscribeMutation.isPending}
                className="bg-white text-netflix-red hover:bg-gray-100 text-lg px-8 py-3 h-auto"
              >
                {subscribeMutation.isPending ? "Processing..." : "Subscribe Now"}
              </Button>
              <p className="text-red-100 text-sm mt-4">
                Cancel anytime • No setup fees • Instant activation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pro Creator Dashboard
  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-netflix-red" />
            <div>
              <h1 className="text-3xl font-bold text-white">Pro Creator Dashboard</h1>
              <p className="text-netflix-light-gray">
                Welcome back, {user?.firstName || "Creator"}!
              </p>
            </div>
          </div>
          <Badge className="bg-netflix-red text-white">
            Pro Creator Active
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-netflix-light-gray">
                Course Revenue
              </CardTitle>
              <DollarSign className="w-4 h-4 text-netflix-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${((earnings?.totalEarnings || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-netflix-light-gray">
                100% of course sales
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-netflix-light-gray">
                Active Courses
              </CardTitle>
              <Upload className="w-4 h-4 text-netflix-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {videos?.filter((v: any) => v.isCourse).length || 0}
              </div>
              <p className="text-xs text-netflix-light-gray">
                Courses available for sale
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-netflix-light-gray">
                Subscription
              </CardTitle>
              <Calendar className="w-4 h-4 text-netflix-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Active</div>
              <p className="text-xs text-netflix-light-gray">
                Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-netflix-red" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => window.location.href = "/creator-dashboard"}
                className="w-full justify-start bg-netflix-red hover:bg-red-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Course
              </Button>
              <Button
                onClick={() => window.location.href = "/creator-dashboard"}
                variant="outline"
                className="w-full justify-start border-netflix-border text-white hover:bg-netflix-gray"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
              <Button
                onClick={() => window.location.href = "/creator-dashboard"}
                variant="outline"
                className="w-full justify-start border-netflix-border text-white hover:bg-netflix-gray"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-netflix-red" />
                Pro Creator Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-netflix-light-gray space-y-3">
              <div className="p-3 bg-netflix-black rounded-lg">
                <h4 className="font-semibold text-white mb-1">Maximize Your Earnings</h4>
                <p className="text-sm">Add course upsells under your free videos to convert viewers into customers.</p>
              </div>
              <div className="p-3 bg-netflix-black rounded-lg">
                <h4 className="font-semibold text-white mb-1">Price Your Courses Right</h4>
                <p className="text-sm">Test different price points between $10-$4,000 to find your sweet spot.</p>
              </div>
              <div className="p-3 bg-netflix-black rounded-lg">
                <h4 className="font-semibold text-white mb-1">Engage Your Audience</h4>
                <p className="text-sm">Respond to comments and build a community around your content.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}