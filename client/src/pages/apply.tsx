import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  CheckCircle, 
  Users, 
  DollarSign, 
  Star, 
  FileText, 
  Calendar,
  Video
} from "lucide-react";

const preApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  stageName: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  contentLinks: z.string().optional(),
  contentType: z.string().min(1, "Please select content type"),
  sellingElsewhere: z.boolean(),
  sellingWhere: z.string().optional(),
  whyJoin: z.string().min(10, "Please tell us why you want to join ProFlix"),
  socialHandles: z.string().optional(),
  additionalInfo: z.string().optional(),
  specialRequests: z.string().optional(),
});

type PreApplicationFormData = z.infer<typeof preApplicationSchema>;

export default function Apply() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<PreApplicationFormData>({
    resolver: zodResolver(preApplicationSchema),
    defaultValues: {
      sellingElsewhere: false,
    },
  });

  const submitPreApplication = useMutation({
    mutationFn: async (data: PreApplicationFormData) => {
      return apiRequest("POST", "/api/pre-applications", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thanks! Your application has been submitted. We'll be in touch after August 14th.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreApplicationFormData) => {
    submitPreApplication.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">
              Thank You!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-netflix-light-gray text-lg">
              Thanks! Your application has been submitted. We'll be in touch after August 14th.
            </p>
            <div className="bg-netflix-black p-4 rounded-lg">
              <p className="text-white font-medium mb-2">
                📅 What's Next:
              </p>
              <ul className="text-netflix-light-gray space-y-1 text-sm">
                <li>• Applications close August 15th, 2025</li>
                <li>• Selected creators will be contacted shortly after</li>
                <li>• We'll review all applications carefully</li>
                <li>• Approved creators will receive platform access</li>
              </ul>
            </div>
            <p className="text-netflix-light-gray text-sm">
              Questions? Email us at <span className="text-netflix-red">support@proflix.app</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-netflix-red to-red-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🚀 Welcome to ProFlix (Beta)
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 max-w-4xl mx-auto">
            We're building the creator-powered platform for premium video content.
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            If you're a filmmaker, performer, educator, or content creator — we want to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Badge variant="secondary" className="bg-white text-netflix-red px-4 py-2">
              <Video className="w-4 h-4 mr-2" />
              Premium Content
            </Badge>
            <Badge variant="secondary" className="bg-white text-netflix-red px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Exclusive Creators
            </Badge>
            <Badge variant="secondary" className="bg-white text-netflix-red px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Beta Launch
            </Badge>
          </div>
        </div>
      </div>

      {/* Application Deadline Banner */}
      <div className="bg-yellow-600 text-black py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold text-lg">
            <Calendar className="inline w-5 h-5 mr-2" />
            📅 Applications close August 15th, 2025 - Selected creators will be contacted shortly after
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="bg-netflix-gray border-netflix-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white flex items-center justify-center gap-3">
              <FileText className="w-8 h-8" />
              ProFlix Creator Application
            </CardTitle>
            <p className="text-netflix-light-gray text-lg mt-4">
              Tell us about yourself and your content. We're looking for talented creators to join our exclusive beta platform.
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white border-b border-netflix-border pb-3">
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">Full Name (required)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-netflix-black border-netflix-border text-white h-12 text-lg" 
                              placeholder="Your full name"
                            />
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
                          <FormLabel className="text-white text-lg">Stage Name / Creator Name (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-netflix-black border-netflix-border text-white h-12 text-lg" 
                              placeholder="Optional stage name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">Email Address (required)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              className="bg-netflix-black border-netflix-border text-white h-12 text-lg" 
                              placeholder="your@email.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">Phone Number (optional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-netflix-black border-netflix-border text-white h-12 text-lg" 
                              placeholder="Optional phone number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="bg-netflix-border" />

                {/* Content Information */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white border-b border-netflix-border pb-3">
                    Content Information
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="contentLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Links to Your Content (text area)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-netflix-black border-netflix-border text-white text-lg min-h-24" 
                            placeholder="Share links to your existing content, portfolio, or work samples..."
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription className="text-netflix-light-gray">
                          Help us see your content style and quality
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">What kind of content do you create? (dropdown)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-netflix-black border-netflix-border text-white h-12 text-lg">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-netflix-black border-netflix-border">
                            <SelectItem value="fitness" className="text-white">Fitness</SelectItem>
                            <SelectItem value="music" className="text-white">Music</SelectItem>
                            <SelectItem value="education" className="text-white">Education</SelectItem>
                            <SelectItem value="adult" className="text-white">Adult</SelectItem>
                            <SelectItem value="comedy" className="text-white">Comedy</SelectItem>
                            <SelectItem value="vlogging" className="text-white">Vlogging</SelectItem>
                            <SelectItem value="other" className="text-white">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-netflix-border" />

                {/* Current Business */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white border-b border-netflix-border pb-3">
                    Current Business
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="sellingElsewhere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Are you currently selling content anywhere else? (yes/no)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "yes")}
                            defaultValue={field.value ? "yes" : "no"}
                            className="flex flex-col space-y-3"
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="yes" id="selling_yes" className="border-netflix-border" />
                              <Label htmlFor="selling_yes" className="text-white text-lg">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="no" id="selling_no" className="border-netflix-border" />
                              <Label htmlFor="selling_no" className="text-white text-lg">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("sellingElsewhere") && (
                    <FormField
                      control={form.control}
                      name="sellingWhere"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-lg">If yes, where? (text area)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="bg-netflix-black border-netflix-border text-white text-lg min-h-24" 
                              placeholder="Tell us about your current platforms, sales, and experience..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator className="bg-netflix-border" />

                {/* Application Questions */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white border-b border-netflix-border pb-3">
                    Tell Us About You
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="whyJoin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Why do you want to join ProFlix? (text area)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-netflix-black border-netflix-border text-white text-lg min-h-32" 
                            placeholder="Tell us what excites you about ProFlix and what you hope to achieve..."
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="socialHandles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Social media handles (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-netflix-black border-netflix-border text-white text-lg min-h-24" 
                            placeholder="Instagram: @yourhandle, TikTok: @yourhandle, YouTube: @yourchannel..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Anything else we should know? (text area)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-netflix-black border-netflix-border text-white text-lg min-h-24" 
                            placeholder="Share anything else about your background, goals, or what makes you unique..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white text-lg">Any special requests, ideas, or feature recommendations? (text area)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-netflix-black border-netflix-border text-white text-lg min-h-24" 
                            placeholder="Do you have ideas for ProFlix? Special features you'd like to see? Ways we can work together?"
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-netflix-border" />

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={submitPreApplication.isPending}
                    className="bg-netflix-red hover:bg-red-700 text-white px-16 py-4 text-xl font-semibold h-auto"
                  >
                    {submitPreApplication.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}