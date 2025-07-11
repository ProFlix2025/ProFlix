import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Star, Video, DollarSign, Users, TrendingUp, Crown, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";

const creatorTiers = [
  {
    id: "free",
    name: "Free Creator",
    price: 0,
    billing: "Free Forever",
    popular: false,
    features: [
      "Upload unlimited videos",
      "YouTube-style ad revenue sharing",
      "Basic analytics dashboard",
      "Community features (likes, comments, shares)",
      "Standard video player",
      "Basic creator profile"
    ],
    limitations: [
      "Cannot sell courses",
      "No premium features",
      "Standard support only"
    ],
    cta: "Start Creating",
    description: "Perfect for content creators who want to build their audience"
  },
  {
    id: "pro",
    name: "Pro Creator",
    price: 99,
    billing: "per month",
    popular: true,
    features: [
      "Everything in Free Creator",
      "Sell unlimited courses ($10-$4,000 range)",
      "Keep 100% of course sales revenue",
      "Up to 50 hours of video content",
      "Advanced analytics & insights",
      "Custom course landing pages",
      "Premium creator badge",
      "Priority customer support",
      "Custom upsell buttons under videos",
      "Course progress tracking",
      "Student management tools"
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    description: "For serious creators ready to monetize their expertise"
  },
  {
    id: "enterprise",
    name: "Enterprise Creator",
    price: 799,
    billing: "per month",
    popular: false,
    features: [
      "Everything in Pro Creator",
      "Up to 500 hours of video content",
      "Custom branding options",
      "Advanced student analytics",
      "API access for integrations",
      "Custom payment processing",
      "Enterprise-grade security",
      "Multi-language support",
      "Custom domain support"
    ],
    limitations: [],
    cta: "Contact Sales",
    description: "For organizations and top-tier creators scaling their business"
  }
];

export default function CreatorTiers() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const upgradeMutation = useMutation({
    mutationFn: async (tierId: string) => {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }
      
      if (tierId === 'free') {
        // Free tier - just update user status
        await apiRequest('POST', '/api/creator/upgrade', { tier: 'free' });
      } else if (tierId === 'pro') {
        // Redirect to Pro Creator portal for subscription
        window.location.href = '/pro-creator-portal';
      } else if (tierId === 'enterprise') {
        // Contact sales flow
        window.location.href = 'mailto:sales@proflix.app?subject=Enterprise Creator Inquiry';
      }
    },
    onSuccess: () => {
      if (selectedTier === 'free') {
        toast({
          title: "Welcome to ProFlix!",
          description: "You can now start uploading videos and earning ad revenue.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process upgrade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTierSelect = (tierId: string) => {
    setSelectedTier(tierId);
    upgradeMutation.mutate(tierId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-netflix-red to-red-400 bg-clip-text text-transparent">
            Creator Tiers
          </h1>
          <p className="text-xl text-netflix-light-gray max-w-3xl mx-auto">
            Choose the perfect plan to grow your audience and monetize your content on ProFlix
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {creatorTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative bg-netflix-gray border-netflix-border hover:border-netflix-red transition-all duration-300 ${
                tier.popular ? 'ring-2 ring-netflix-red scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-netflix-red text-white px-4 py-1 text-sm font-semibold">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  {tier.id === 'free' && <Video className="w-12 h-12 text-blue-400" />}
                  {tier.id === 'pro' && <Crown className="w-12 h-12 text-netflix-red" />}
                  {tier.id === 'enterprise' && <Zap className="w-12 h-12 text-purple-400" />}
                </div>
                
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </CardTitle>
                
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold text-white">
                    ${tier.price}
                  </span>
                  <span className="text-netflix-light-gray ml-2">
                    {tier.billing}
                  </span>
                </div>
                
                <p className="text-netflix-light-gray text-sm">
                  {tier.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    What's Included
                  </h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-netflix-light-gray">
                        <Check className="w-4 h-4 mr-2 text-green-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {tier.limitations.length > 0 && (
                  <>
                    <Separator className="bg-netflix-border" />
                    <div>
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-yellow-400" />
                        Upgrade Benefits
                      </h4>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start text-sm text-yellow-400">
                            <TrendingUp className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => handleTierSelect(tier.id)}
                  disabled={upgradeMutation.isPending && selectedTier === tier.id}
                  className={`w-full py-3 font-semibold transition-all duration-300 ${
                    tier.popular
                      ? 'bg-netflix-red hover:bg-red-700 text-white'
                      : 'bg-netflix-border hover:bg-netflix-light-gray text-white'
                  }`}
                >
                  {upgradeMutation.isPending && selectedTier === tier.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      {tier.id === 'free' && <Video className="w-4 h-4 mr-2" />}
                      {tier.id === 'pro' && <Crown className="w-4 h-4 mr-2" />}
                      {tier.id === 'enterprise' && <Users className="w-4 h-4 mr-2" />}
                      {tier.cta}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-netflix-gray rounded-lg border border-netflix-border">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h3>
          <p className="text-netflix-light-gray mb-6 max-w-2xl mx-auto">
            Join thousands of creators who are already earning from their content on ProFlix. 
            Start with our free tier and upgrade when you're ready to monetize.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => handleTierSelect('free')}
              className="bg-netflix-red hover:bg-red-700 text-white px-8 py-3"
            >
              <Video className="w-5 h-5 mr-2" />
              Start Free
            </Button>
            <Button
              onClick={() => handleTierSelect('pro')}
              variant="outline"
              className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white px-8 py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              Go Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}