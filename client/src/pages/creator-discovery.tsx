import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Bell, Star, Users, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";

interface Creator {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  brandName: string;
  description: string;
  categoryName: string;
  videoCount: number;
  subscriberCount: number;
  isPro: boolean;
  heroImageUrl: string;
}

export default function CreatorDiscovery() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>('free');
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const { data: creators, isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/featured-creators'],
  });

  const handleSubscribe = async (creatorId: string, creatorName: string) => {
    if (isAuthenticated) {
      // User is already logged in, just subscribe
      try {
        await apiRequest('POST', '/api/subscribe-to-creator', {
          creatorId,
          tier: selectedTier
        });
        
        toast({
          title: "Subscribed!",
          description: `You're now following ${creatorName}. You'll get notified of new videos!`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Show signup dialog
      setSubscribingTo(creatorId);
    }
  };

  const handleCreateAccount = async () => {
    if (!subscribingTo || !email || !name) return;

    try {
      await apiRequest('POST', '/api/create-viewer-account', {
        email,
        name,
        tier: selectedTier,
        subscribeToCreator: subscribingTo
      });

      toast({
        title: "Account Created!",
        description: `Welcome to ProFlix! You're now following this creator.`,
      });
      
      setSubscribingTo(null);
      setEmail('');
      setName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 overflow-hidden">
                <div className="h-48 bg-gray-700 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-700 rounded mb-4 animate-pulse"></div>
                  <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Creators
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Follow your favorite creators and never miss their latest content
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Bell className="w-4 h-4 mr-2" />
              Free Updates
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Premium Discounts
            </Badge>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Creators</h2>
          <p className="text-gray-400 text-lg">
            Discover creators across all categories making amazing original content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creators?.map((creator) => (
            <Card key={creator.id} className="bg-gray-800 border-gray-700 overflow-hidden hover:border-red-500 transition-all duration-300 group">
              {/* Hero Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={creator.heroImageUrl || creator.profileImageUrl}
                  alt={`${creator.brandName} hero`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                
                {/* Creator Avatar */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={creator.profileImageUrl}
                      alt={creator.brandName}
                      className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    {creator.isPro && (
                      <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{creator.brandName}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {creator.categoryName}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <p className="text-gray-300 mb-4 line-clamp-2">
                  {creator.description}
                </p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>{creator.videoCount} videos</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{creator.subscriberCount} followers</span>
                    </div>
                  </div>
                  {creator.isPro && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  )}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleSubscribe(creator.id, creator.brandName)}
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Subscribe for Free
                    </Button>
                  </DialogTrigger>
                  
                  {subscribingTo === creator.id && (
                    <DialogContent className="bg-gray-800 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl">
                          Subscribe to {creator.brandName}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tier">Account Type</Label>
                          <Select value={selectedTier} onValueChange={(value: 'free' | 'premium') => setSelectedTier(value)}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="free">
                                <div className="flex items-center space-x-2">
                                  <Bell className="w-4 h-4" />
                                  <div>
                                    <div className="font-medium">Free Viewer</div>
                                    <div className="text-sm text-gray-400">Get notified of new videos</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="premium">
                                <div className="flex items-center space-x-2">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <div>
                                    <div className="font-medium">Premium Viewer - $29/month</div>
                                    <div className="text-sm text-gray-400">Course discounts + early access</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            What you'll get:
                          </h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Instant notifications when {creator.brandName} uploads</li>
                            <li>• Access to all free content</li>
                            <li>• Required for course purchases</li>
                            {selectedTier === 'premium' && (
                              <>
                                <li>• 10% discount on all courses</li>
                                <li>• Early access to new content</li>
                                <li>• Priority support</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <Button 
                          onClick={handleCreateAccount}
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={!email || !name}
                        >
                          Create Account & Subscribe
                        </Button>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {!creators?.length && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No creators found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}