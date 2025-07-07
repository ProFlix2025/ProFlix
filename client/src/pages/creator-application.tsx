import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCreatorApplicationSchema, type InsertCreatorApplication } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Star, Video, DollarSign, Check, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function CreatorApplication() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertCreatorApplication>({
    resolver: zodResolver(insertCreatorApplicationSchema),
    defaultValues: {
      fullName: "",
      stageName: "",
      email: (user as any)?.email || "",
      phoneNumber: "",
      city: "",
      country: "",
      socialLinks: "",
      courseTitle: "",
      professionalBackground: "",
      hasSoldCourses: false,
      previousSales: "",
      priceRange: "under_100",
      contentReadiness: "not_ready",
      whyTopCreator: "",
      hasAudience: false,
      audienceDetails: "",
      freePreview: "maybe",
      supportNeeds: "",
      agreedToTerms: false,
      agreedToRevenue: false,
      agreedToContent: false,
      signatureName: "",
      userId: (user as any)?.id || "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: InsertCreatorApplication) => {
      await apiRequest('POST', '/api/creator-applications', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 3-5 business days.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCreatorApplication) => {
    applicationMutation.mutate({
      ...data,
      userId: (user as any)?.id || "",
    });
  };

  if (isLoading) {
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="bg-netflix-black border-netflix-border text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>
              <p className="text-netflix-light-gray mb-6">
                Thank you for your interest in becoming a ProFlix creator. We'll review your application and get back to you within 3-5 business days.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-netflix-red hover:bg-red-700"
              >
                Return to Home
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">📝 ProFlix Creator Application</h1>
          <p className="text-netflix-light-gray mb-4">
            Welcome to ProFlix – A Course Platform for Real Industry Experts.
          </p>
          <p className="text-netflix-light-gray">
            We're building the go-to platform for everyday professionals to monetize their knowledge through affordable, high-impact video courses. We're currently reviewing applications for our early launch creator program. If selected, you'll get free access to upload your course(s), earn 80% revenue on every sale, and help shape the future of the platform.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info Section */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  👤 Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage Name / Brand Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="socialLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram or Website Link</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Course Details Section */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  🎥 Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="courseTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's the topic of your course? *</FormLabel>
                      <FormDescription>
                        e.g., tattoo shading, haircuts for beginners, DJ mixing tips
                      </FormDescription>
                      <FormControl>
                        <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professionalBackground"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your professional background? *</FormLabel>
                      <FormDescription>
                        Feel free to brag a little – awards, client list, years in industry, etc.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} className="bg-netflix-dark-gray border-netflix-border min-h-24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasSoldCourses"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="border-netflix-border"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have sold courses before</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("hasSoldCourses") && (
                  <FormField
                    control={form.control}
                    name="previousSales"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How many sales have you made?</FormLabel>
                        <FormDescription>
                          Optional: share a link if available
                        </FormDescription>
                        <FormControl>
                          <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What price are you thinking of for your course? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="under_100" id="under_100" />
                            <Label htmlFor="under_100">Under $100</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="100_250" id="100_250" />
                            <Label htmlFor="100_250">$100–$250</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="250_500" id="250_500" />
                            <Label htmlFor="250_500">$250–$500</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="500_1000" id="500_1000" />
                            <Label htmlFor="500_1000">$500–$1,000</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentReadiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you already have video content recorded? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ready" id="ready" />
                            <Label htmlFor="ready">Yes – ready to upload</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="partial" />
                            <Label htmlFor="partial">Some of it</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not_ready" id="not_ready" />
                            <Label htmlFor="not_ready">Not yet, but I will record soon</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vetting & Fit Section */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  🔎 Vetting & Fit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="whyTopCreator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What makes you a top creator in your field? Why should people buy your course over someone else's? *</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-netflix-dark-gray border-netflix-border min-h-24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasAudience"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="border-netflix-border"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have an audience ready to promote to</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("hasAudience") && (
                  <FormField
                    control={form.control}
                    name="audienceDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tell us about your audience</FormLabel>
                        <FormDescription>
                          Instagram followers, YouTube, client list, email list, etc.
                        </FormDescription>
                        <FormControl>
                          <Textarea {...field} className="bg-netflix-dark-gray border-netflix-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="freePreview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Are you open to offering a free preview lesson? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="yes" />
                            <Label htmlFor="yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="maybe" id="maybe" />
                            <Label htmlFor="maybe">Maybe</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="no" />
                            <Label htmlFor="no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Final Check Section */}
            <Card className="bg-netflix-black border-netflix-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  ✅ Final Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="supportNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you need from us to help you succeed?</FormLabel>
                      <FormDescription>
                        Open space for support requests, promo ideas, etc.
                      </FormDescription>
                      <FormControl>
                        <Textarea {...field} className="bg-netflix-dark-gray border-netflix-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="agreedToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="border-netflix-border"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I understand that all courses must be under $1,000</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreedToRevenue"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="border-netflix-border"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I understand this is an early creator program, and I'll earn 80% of every sale</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreedToContent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            className="border-netflix-border"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I agree not to upload spammy or misleading content</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="signatureName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Signature / Name for Confirmation *</FormLabel>
                      <FormDescription>
                        Just type your full name
                      </FormDescription>
                      <FormControl>
                        <Input {...field} className="bg-netflix-dark-gray border-netflix-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={applicationMutation.isPending}
                className="bg-netflix-red hover:bg-red-700 px-8 py-3 text-lg"
              >
                {applicationMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}