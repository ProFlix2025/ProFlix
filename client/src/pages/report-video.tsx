import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReportVideo() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    videoId: "",
    videoTitle: "",
    videoUrl: "",
    reportType: "",
    description: "",
    reporterEmail: "",
    reporterName: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/report-video", data);
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this content. Our team will review it within 24 hours.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Report Failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.videoId || !formData.reportType || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-netflix-red mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Report Content</h1>
          <p className="text-netflix-light-gray">
            Help us keep ProFlix safe by reporting inappropriate content
          </p>
        </div>

        <Card className="bg-netflix-gray border-netflix-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-netflix-red" />
              Report Video Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert className="border-netflix-red bg-netflix-red/10">
                <AlertTriangle className="w-4 h-4 text-netflix-red" />
                <AlertDescription className="text-white">
                  <strong>False reports may result in account suspension.</strong> Please only report content that violates our community guidelines.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="videoId" className="text-netflix-light-gray">
                    Video ID *
                  </Label>
                  <Input
                    id="videoId"
                    value={formData.videoId}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoId: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter video ID"
                  />
                </div>

                <div>
                  <Label htmlFor="videoTitle" className="text-netflix-light-gray">
                    Video Title (if known)
                  </Label>
                  <Input
                    id="videoTitle"
                    value={formData.videoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoTitle: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter video title"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl" className="text-netflix-light-gray">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="bg-netflix-black border-netflix-border text-white"
                  placeholder="Paste video URL"
                />
              </div>

              <div>
                <Label className="text-netflix-light-gray">
                  Report Type *
                </Label>
                <RadioGroup
                  value={formData.reportType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="copyright" id="copyright" />
                    <Label htmlFor="copyright" className="text-white">Copyright Infringement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hate-speech" id="hate-speech" />
                    <Label htmlFor="hate-speech" className="text-white">Hate Speech or Discrimination</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inappropriate" id="inappropriate" />
                    <Label htmlFor="inappropriate" className="text-white">Inappropriate Content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spam" id="spam" />
                    <Label htmlFor="spam" className="text-white">Spam or Misleading Content</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fraud" id="fraud" />
                    <Label htmlFor="fraud" className="text-white">Fraud or Scam</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-white">Other Violation</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="description" className="text-netflix-light-gray">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-netflix-black border-netflix-border text-white min-h-[120px]"
                  placeholder="Please describe the issue in detail..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName" className="text-netflix-light-gray">
                    Your Name
                  </Label>
                  <Input
                    id="reporterName"
                    value={formData.reporterName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="reporterEmail" className="text-netflix-light-gray">
                    Your Email
                  </Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    value={formData.reporterEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="border-netflix-border text-netflix-light-gray hover:bg-netflix-black"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}