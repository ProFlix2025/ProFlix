import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  CheckCircle, 
  Play, 
  ShoppingCart, 
  Heart,
  DollarSign,
  Clock,
  Users,
  Trophy
} from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Premium() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade to premium",
        variant: "destructive",
      });
      return;
    }

    setIsUpgrading(true);
    // This would integrate with Stripe
    setTimeout(() => {
      toast({
        title: "Premium upgrade",
        description: "Redirecting to payment...",
      });
      setIsUpgrading(false);
    }, 1000);
  };

  const features = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Course Discounts",
      description: "Get 10% off all course purchases from creators"
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Early Access",
      description: "Be first to see new features and content"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Priority Support",
      description: "Get help faster with premium support"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Exclusive Content",
      description: "Access to premium creator content and events"
    }
  ];

  const plans = [
    {
      name: "Free Viewer",
      price: "$0",
      period: "forever",
      features: [
        "Watch all free videos",
        "Like and share videos",
        "Follow creators for updates",
        "Purchase courses (account required)"
      ],
      popular: false,
      cta: "Current Plan"
    },
    {
      name: "Premium Viewer",
      price: "$29",
      period: "month",
      features: [
        "All free features",
        "10% discount on all courses",
        "Early access to new content",
        "Priority support",
        "Exclusive creator events"
      ],
      popular: true,
      cta: "Upgrade Now"
    },

  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-8 h-8 text-netflix-red" />
            <h1 className="text-4xl md:text-6xl font-bold">
              Go Premium
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Unlock the full ProFlix experience with course discounts, early access, and priority support
          </p>
          
          {user?.isPremiumViewer && (
            <Badge className="bg-netflix-red mb-8">
              <CheckCircle className="w-4 h-4 mr-2" />
              You're already a Premium member!
            </Badge>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="text-netflix-red mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`bg-gray-900 border-gray-800 relative ${
                plan.popular ? 'border-netflix-red' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-netflix-red">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={handleUpgrade}
                  disabled={isUpgrading || (plan.name === "Free" && !user?.isPremiumViewer)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-netflix-red hover:bg-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isUpgrading ? "Processing..." : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-netflix-red mb-2">10,000+</div>
            <div className="text-gray-400">Premium Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-netflix-red mb-2">500+</div>
            <div className="text-gray-400">Premium Courses</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-netflix-red mb-2">$2.5M+</div>
            <div className="text-gray-400">Creator Earnings</div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400">
                  Yes, you can cancel your premium subscription at any time. You'll continue to have access until your current billing period ends.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do course discounts work?</h3>
                <p className="text-gray-400">
                  Many creators offer exclusive discounts to premium members as a way to thank you for supporting the platform. When available, you'll see the discount automatically applied at checkout!
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I become a creator?</h3>
                <p className="text-gray-400">
                  Anyone can become a creator on ProFlix! Check out our Creator page to see the different tiers and start uploading videos today.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}