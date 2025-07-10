import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Crown, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Upload, Settings, Gift } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ProCreatorPortal() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState("");
  
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
    mutationFn: async (planType: string) => {
      return apiRequest("POST", "/api/pro-creator/subscribe", { planType });
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

  const redeemCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/pro-creator/use-code", { code });
    },
    onSuccess: () => {
      toast({
        title: "Code Redeemed!",
        description: "Your free 12-month Pro Creator access is now active!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pro-creator/status"] });
      setPromoCode("");
    },
    onError: (error) => {
      toast({
        title: "Invalid Code",
        description: error.message || "Code is invalid or expired",
        variant: "destructive",
      });
    },
  });

  // Show public application form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 text-netflix-red mx-auto mb-4" />
            <CardTitle className="text-white text-2xl">Become a Pro Creator</CardTitle>
            <p className="text-netflix-light-gray mt-2">
              Join our free-for-all platform! Anyone can apply to become a Pro Creator and start monetizing their content.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-netflix-dark-gray p-4 rounded-lg border-2 border-green-500">
                <h3 className="text-white font-semibold mb-2">Free Pro Creator</h3>
                <p className="text-green-400 text-2xl font-bold">$0/month</p>
                <p className="text-green-400 text-sm">Perfect to get started!</p>
                <ul className="text-netflix-light-gray text-sm mt-2 space-y-1">
                  <li>• Unlimited video uploads</li>
                  <li>• 1 course max (100% profit)</li>
                  <li>• Basic analytics</li>
                  <li>• Community support</li>
                </ul>
              </div>
              <div className="bg-netflix-dark-gray p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Standard Pro Creator</h3>
                <p className="text-netflix-red text-2xl font-bold">$99/month</p>
                <ul className="text-netflix-light-gray text-sm mt-2 space-y-1">
                  <li>• Unlimited video uploads</li>
                  <li>• Up to 20 courses (100% profit)</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <div className="bg-netflix-dark-gray p-4 rounded-lg border-2 border-netflix-red">
                <h3 className="text-white font-semibold mb-2">Pro Plus Creator</h3>
                <p className="text-netflix-red text-2xl font-bold">$297/month</p>
                <p className="text-green-400 text-sm">Most Popular!</p>
                <ul className="text-netflix-light-gray text-sm mt-2 space-y-1">
                  <li>• Unlimited video uploads</li>
                  <li>• Up to 100 courses (100% profit)</li>
                  <li>• Premium analytics</li>
                  <li>• VIP support</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-netflix-dark-gray p-4 rounded-lg text-center">
              <h3 className="text-white font-semibold mb-2">Enterprise Creator</h3>
              <p className="text-netflix-light-gray">Need more than 100 courses? Custom pricing available.</p>
              <p className="text-netflix-red font-semibold">Contact us for enterprise solutions</p>
            </div>
            
            <div className="bg-netflix-dark-gray p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-netflix-red" />
                Have a Promo Code?
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your invitation code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-netflix-black border-netflix-border text-white"
                />
                <Button
                  onClick={() => {
                    if (promoCode.trim()) {
                      // For now, just show success message - user will need to sign in to redeem
                      toast({
                        title: "Code Saved",
                        description: "Sign in to redeem your promo code and get free access!",
                      });
                    }
                  }}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  Save Code
                </Button>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button
                  onClick={() => {
                    // Auto-approve free tier applications
                    fetch('/api/pro-creator/apply', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        email: 'temp@example.com', 
                        fullName: 'Free Creator',
                        planType: 'free' 
                      })
                    }).then(() => {
                      window.location.href = "/api/login";
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Free
                </Button>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  Apply Standard
                </Button>
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-red-800 hover:bg-red-900"
                >
                  Apply Pro Plus
                </Button>
              </div>
              <p className="text-netflix-light-gray text-sm">
                <strong className="text-green-400">Free tier:</strong> Instant approval, 1 course max
                <br />
                <strong className="text-netflix-red">Paid tiers:</strong> Application review required
                <br />
                <strong className="text-white">Free-for-all platform</strong> - anyone can apply!
              </p>
            </div>
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
              Enhanced features for serious creators - Anyone can sell courses now!
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

          <Card className="bg-netflix-gray border-netflix-border mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-netflix-red" />
                Have a Promo Code?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-netflix-light-gray text-sm">
                Redeem your free 12-month Pro Creator access code:
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-netflix-black border-netflix-border text-white"
                />
                <Button
                  onClick={() => redeemCodeMutation.mutate(promoCode)}
                  disabled={!promoCode || redeemCodeMutation.isPending}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  {redeemCodeMutation.isPending ? "..." : "Redeem"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-netflix-gray border-netflix-border">
              <CardHeader>
                <CardTitle className="text-white text-center">Monthly Plan</CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">$99</div>
                  <div className="text-netflix-light-gray">per month</div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => subscribeMutation.mutate('monthly')}
                  disabled={subscribeMutation.isPending}
                  className="w-full bg-netflix-red hover:bg-red-700 text-white"
                >
                  {subscribeMutation.isPending ? 'Processing...' : 'Subscribe Monthly'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-netflix-gray border-netflix-border border-netflix-red">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Yearly Plan
                  <Badge className="ml-2 bg-netflix-red text-white">Save $291</Badge>
                </CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">$897</div>
                  <div className="text-netflix-light-gray">per year</div>
                  <div className="text-sm text-netflix-light-gray">$74.75/month</div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => subscribeMutation.mutate('yearly')}
                  disabled={subscribeMutation.isPending}
                  className="w-full bg-netflix-red hover:bg-red-700 text-white"
                >
                  {subscribeMutation.isPending ? 'Processing...' : 'Subscribe Yearly'}
                </Button>
              </CardContent>
            </Card>
          </div>
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