import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Star, DollarSign, Check } from "lucide-react";
import Navigation from "@/components/Navigation";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ course, onSuccess }: { course: any, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + `/video/${course.id}?purchased=true`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-6" />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-netflix-red hover:bg-red-700"
      >
        {isProcessing ? 'Processing...' : `Purchase Course - $${course.price / 100}`}
      </Button>
    </form>
  );
};

export default function CoursePurchase() {
  const [match, params] = useRoute("/course-purchase/:videoId");
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [purchased, setPurchased] = useState(false);

  const videoId = params?.videoId ? parseInt(params.videoId) : null;

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['/api/videos', videoId],
    enabled: !!videoId,
  });

  // Check if user already purchased this course
  const { data: hasPurchased } = useQuery({
    queryKey: ['/api/my-purchases', videoId],
    enabled: !!videoId && isAuthenticated,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/courses/${videoId}/purchase`);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (course && !hasPurchased && !clientSecret) {
      purchaseMutation.mutate();
    }
  }, [course, hasPurchased, clientSecret]);

  if (isLoading || courseLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="bg-netflix-black border-netflix-border text-center">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
              <p className="text-netflix-light-gray mb-6">
                Please sign in to purchase this course.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-netflix-red hover:bg-red-700"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="bg-netflix-black border-netflix-border text-center">
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
              <p className="text-netflix-light-gray mb-6">
                The course you're looking for doesn't exist or is no longer available.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-netflix-red hover:bg-red-700"
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasPurchased || purchased) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="bg-netflix-black border-netflix-border text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Course Purchased!</h1>
              <p className="text-netflix-light-gray mb-6">
                You now have access to "{course.title}". Start learning!
              </p>
              <Button 
                onClick={() => window.location.href = `/video/${course.id}`}
                className="bg-netflix-red hover:bg-red-700"
              >
                Start Watching
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Preview */}
          <div>
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-0">
                <div className="aspect-video bg-netflix-dark-gray relative">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Play className="w-16 h-16 text-netflix-light-gray" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-2 text-white" />
                      <p className="text-white text-sm">Course Preview</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                  <p className="text-netflix-light-gray mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    {course.duration && (
                      <div className="flex items-center gap-1 text-sm text-netflix-light-gray">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm text-netflix-light-gray">
                      <Star className="w-4 h-4" />
                      {course.views || 0} views
                    </div>
                  </div>

                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-netflix-dark-gray">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div>
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Complete Your Purchase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span>Course Price:</span>
                    <span className="text-2xl font-bold">${course.price / 100}</span>
                  </div>
                  <Separator className="bg-netflix-border" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-netflix-red">${course.price / 100}</span>
                  </div>
                </div>

                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      course={course} 
                      onSuccess={() => setPurchased(true)} 
                    />
                  </Elements>
                ) : (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-4"></div>
                    <p className="text-netflix-light-gray">Setting up payment...</p>
                  </div>
                )}

                <div className="mt-6 text-xs text-netflix-light-gray">
                  <p>• Secure payment processing by Stripe</p>
                  <p>• Lifetime access to course content</p>
                  <p>• 80% of your payment goes directly to the creator</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}