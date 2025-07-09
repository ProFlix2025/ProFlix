import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Camera,
  UserCheck,
  Scale
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreatorVerification() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: "",
    email: "",
    residentialAddress: "",
    dateOfBirth: "",
    idDocument: null as File | null,
    idSelfie: null as File | null,
    // Teaching qualifications verification
    socialMediaLinks: "",
    publishedArticles: "",
    teachingQualifications: "",
    professionalExperience: "",
    // Legal agreement checkboxes
    ageConfirmation: false,
    contentOwnership: false,
    nondiscrimination: false,
    responsibilityWaiver: false,
    indemnificationClause: false,
    comprehensiveAgreement: false, // New comprehensive legal agreement
    signatureName: "",
    ipAddress: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/creator/verify", data);
    },
    onSuccess: () => {
      toast({
        title: "Verification Submitted",
        description: "Your creator verification is under review. You'll be notified once approved.",
      });
      navigate("/creator-dashboard");
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to submit verification",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (field: string, file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async () => {
    if (!formData.legalName || !formData.email || !formData.residentialAddress || 
        !formData.dateOfBirth || !formData.idDocument || !formData.idSelfie || 
        !formData.socialMediaLinks || !formData.teachingQualifications || 
        !formData.professionalExperience || !formData.signatureName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including teaching qualifications and social media verification",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ageConfirmation || !formData.contentOwnership || !formData.nondiscrimination || 
        !formData.responsibilityWaiver || !formData.indemnificationClause || !formData.comprehensiveAgreement) {
      toast({
        title: "Legal Agreement Required",
        description: "Please agree to all terms and conditions including the comprehensive agreement",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("legalName", formData.legalName);
    submitData.append("email", formData.email);
    submitData.append("residentialAddress", formData.residentialAddress);
    submitData.append("dateOfBirth", formData.dateOfBirth);
    submitData.append("signatureName", formData.signatureName);
    submitData.append("idDocument", formData.idDocument);
    submitData.append("idSelfie", formData.idSelfie);
    
    // Teaching qualifications
    submitData.append("socialMediaLinks", formData.socialMediaLinks);
    submitData.append("publishedArticles", formData.publishedArticles);
    submitData.append("teachingQualifications", formData.teachingQualifications);
    submitData.append("professionalExperience", formData.professionalExperience);
    
    // Add legal agreement confirmations
    submitData.append("ageConfirmation", formData.ageConfirmation.toString());
    submitData.append("contentOwnership", formData.contentOwnership.toString());
    submitData.append("nondiscrimination", formData.nondiscrimination.toString());
    submitData.append("responsibilityWaiver", formData.responsibilityWaiver.toString());
    submitData.append("indemnificationClause", formData.indemnificationClause.toString());
    submitData.append("comprehensiveAgreement", formData.comprehensiveAgreement.toString());

    submitMutation.mutate(submitData);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-netflix-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-netflix-red mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Creator Verification</h1>
          <p className="text-netflix-light-gray">
            Complete your identity verification to start selling courses on ProFlix
          </p>
          <Progress value={progress} className="mt-4 max-w-md mx-auto" />
        </div>

        {step === 1 && (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-netflix-red" />
                Step 1: Identity Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-netflix-red bg-netflix-red/10">
                <AlertTriangle className="w-4 h-4 text-netflix-red" />
                <AlertDescription className="text-white">
                  <strong>Age Verification Required:</strong> You must be 18 or older to sell courses on ProFlix.
                  Your ID will be securely stored and only used for verification purposes.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legalName" className="text-netflix-light-gray">
                    Legal Name (as shown on ID) *
                  </Label>
                  <Input
                    id="legalName"
                    value={formData.legalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter your full legal name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-netflix-light-gray">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="residentialAddress" className="text-netflix-light-gray">
                    Residential Address *
                  </Label>
                  <Textarea
                    id="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, residentialAddress: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Enter your full residential address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-netflix-light-gray">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-netflix-light-gray">
                    Government ID Document *
                  </Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-netflix-border rounded-lg">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("idDocument", e.target.files?.[0] || null)}
                      className="hidden"
                      id="idDocument"
                    />
                    <label htmlFor="idDocument" className="cursor-pointer">
                      <div className="text-center">
                        <FileText className="w-8 h-8 text-netflix-light-gray mx-auto mb-2" />
                        <p className="text-netflix-light-gray">
                          {formData.idDocument ? formData.idDocument.name : "Upload Driver's License, Passport, or State ID"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-netflix-light-gray">
                    Selfie with ID (Required) *
                  </Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-netflix-border rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("idSelfie", e.target.files?.[0] || null)}
                      className="hidden"
                      id="idSelfie"
                    />
                    <label htmlFor="idSelfie" className="cursor-pointer">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-netflix-light-gray mx-auto mb-2" />
                        <p className="text-netflix-light-gray">
                          {formData.idSelfie ? formData.idSelfie.name : "Upload selfie holding your ID (Required for verification)"}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={!formData.legalName || !formData.email || !formData.residentialAddress || !formData.dateOfBirth || !formData.idDocument || !formData.idSelfie}
                className="w-full bg-netflix-red hover:bg-red-700"
              >
                Next: Teaching Qualifications
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-netflix-red" />
                Step 2: Teaching Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-netflix-red bg-netflix-red/10">
                <AlertTriangle className="w-4 h-4 text-netflix-red" />
                <AlertDescription className="text-white">
                  <strong>Qualification Verification:</strong> We only allow qualified teachers to sell courses. Please provide proof of your expertise.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="socialMediaLinks" className="text-netflix-light-gray">
                    Social Media Links (Required) *
                  </Label>
                  <Textarea
                    id="socialMediaLinks"
                    value={formData.socialMediaLinks}
                    onChange={(e) => setFormData(prev => ({ ...prev, socialMediaLinks: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="List your professional social media profiles (LinkedIn, Twitter, etc.)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="publishedArticles" className="text-netflix-light-gray">
                    Published Articles/Content (Optional)
                  </Label>
                  <Textarea
                    id="publishedArticles"
                    value={formData.publishedArticles}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedArticles: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Links to published articles, blog posts, or content that demonstrates your expertise"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="teachingQualifications" className="text-netflix-light-gray">
                    Teaching Qualifications (Required) *
                  </Label>
                  <Textarea
                    id="teachingQualifications"
                    value={formData.teachingQualifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, teachingQualifications: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="List your degrees, certifications, awards, or other qualifications that prove you're qualified to teach"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="professionalExperience" className="text-netflix-light-gray">
                    Professional Experience (Required) *
                  </Label>
                  <Textarea
                    id="professionalExperience"
                    value={formData.professionalExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, professionalExperience: e.target.value }))}
                    className="bg-netflix-black border-netflix-border text-white"
                    placeholder="Describe your professional experience in your field, including years of experience, companies worked for, projects completed, etc."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-netflix-border text-netflix-light-gray hover:bg-netflix-black"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!formData.socialMediaLinks || !formData.teachingQualifications || !formData.professionalExperience}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  Next: Legal Agreement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-netflix-red" />
                Step 3: Creator Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-netflix-red bg-netflix-red/10">
                <AlertTriangle className="w-4 h-4 text-netflix-red" />
                <AlertDescription className="text-white">
                  <strong>Legal Agreement:</strong> By proceeding, you acknowledge and agree to all terms below.
                  This protects both you and ProFlix from liability issues.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ageConfirmation"
                    checked={formData.ageConfirmation}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ageConfirmation: checked as boolean }))}
                  />
                  <Label htmlFor="ageConfirmation" className="text-white text-sm">
                    I certify that I am at least 18 years old and legally eligible to enter into this agreement.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="contentOwnership"
                    checked={formData.contentOwnership}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, contentOwnership: checked as boolean }))}
                  />
                  <Label htmlFor="contentOwnership" className="text-white text-sm">
                    I am the original creator and owner of all videos and content I will upload to ProFlix.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="nondiscrimination"
                    checked={formData.nondiscrimination}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, nondiscrimination: checked as boolean }))}
                  />
                  <Label htmlFor="nondiscrimination" className="text-white text-sm">
                    I agree not to post content that contains racist, sexist, homophobic language or discriminates against individuals based on disability, gender, race, religion, or other protected characteristics.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="responsibilityWaiver"
                    checked={formData.responsibilityWaiver}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, responsibilityWaiver: checked as boolean }))}
                  />
                  <Label htmlFor="responsibilityWaiver" className="text-white text-sm">
                    I understand that I am solely responsible for the content I publish and that ProFlix is not liable for the accuracy, safety, or results of my teachings.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="indemnificationClause"
                    checked={formData.indemnificationClause}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, indemnificationClause: checked as boolean }))}
                  />
                  <Label htmlFor="indemnificationClause" className="text-white text-sm">
                    I release and indemnify ProFlix from any legal claims resulting from my content and agree to hold ProFlix harmless from any damages.
                  </Label>
                </div>

                <div className="flex items-start gap-3 p-4 border border-netflix-red rounded-lg bg-netflix-red/5">
                  <Checkbox
                    id="comprehensiveAgreement"
                    checked={formData.comprehensiveAgreement}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, comprehensiveAgreement: checked as boolean }))}
                  />
                  <Label htmlFor="comprehensiveAgreement" className="text-white text-sm font-medium">
                    <strong>Comprehensive Creator Agreement:</strong> I confirm that I am at least 18 years old and the legal owner of all content I upload. I agree that I am solely responsible for the accuracy, legality, and ethical standards of my courses. I certify that my content is designed to benefit my professional industry and will not contain hate speech, discriminatory claims, or harmful misinformation. I understand that ProFlix reserves the right to remove any creator or course that violates these standards.
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-netflix-border text-netflix-light-gray hover:bg-netflix-black"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)}
                  disabled={!formData.ageConfirmation || !formData.contentOwnership || !formData.nondiscrimination || 
                           !formData.responsibilityWaiver || !formData.indemnificationClause || !formData.comprehensiveAgreement}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  Next: Review & Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="bg-netflix-gray border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-netflix-red" />
                Step 4: Review & Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-netflix-light-gray">Legal Name</Label>
                  <p className="text-white">{formData.legalName}</p>
                </div>
                <div>
                  <Label className="text-netflix-light-gray">Email</Label>
                  <p className="text-white">{formData.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-netflix-light-gray">Residential Address</Label>
                  <p className="text-white">{formData.residentialAddress}</p>
                </div>
                <div>
                  <Label className="text-netflix-light-gray">Date of Birth</Label>
                  <p className="text-white">{formData.dateOfBirth}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-netflix-light-gray">ID Document</Label>
                  <p className="text-white">{formData.idDocument?.name}</p>
                </div>
                <div>
                  <Label className="text-netflix-light-gray">Selfie with ID</Label>
                  <p className="text-white">{formData.idSelfie?.name || "Not provided"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-netflix-light-gray">Social Media Links</Label>
                  <p className="text-white text-sm">{formData.socialMediaLinks}</p>
                </div>
                <div>
                  <Label className="text-netflix-light-gray">Teaching Qualifications</Label>
                  <p className="text-white text-sm">{formData.teachingQualifications}</p>
                </div>
                <div>
                  <Label className="text-netflix-light-gray">Professional Experience</Label>
                  <p className="text-white text-sm">{formData.professionalExperience}</p>
                </div>
                {formData.publishedArticles && (
                  <div>
                    <Label className="text-netflix-light-gray">Published Articles</Label>
                    <p className="text-white text-sm">{formData.publishedArticles}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-netflix-light-gray">Legal Agreement Status</Label>
                <div className="mt-2 space-y-1">
                  <Badge variant={formData.ageConfirmation ? "default" : "secondary"}>
                    Age Confirmation: {formData.ageConfirmation ? "Agreed" : "Not agreed"}
                  </Badge>
                  <Badge variant={formData.contentOwnership ? "default" : "secondary"}>
                    Content Ownership: {formData.contentOwnership ? "Agreed" : "Not agreed"}
                  </Badge>
                  <Badge variant={formData.nondiscrimination ? "default" : "secondary"}>
                    Non-discrimination: {formData.nondiscrimination ? "Agreed" : "Not agreed"}
                  </Badge>
                  <Badge variant={formData.responsibilityWaiver ? "default" : "secondary"}>
                    Responsibility Waiver: {formData.responsibilityWaiver ? "Agreed" : "Not agreed"}
                  </Badge>
                  <Badge variant={formData.indemnificationClause ? "default" : "secondary"}>
                    Indemnification: {formData.indemnificationClause ? "Agreed" : "Not agreed"}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="signatureName" className="text-netflix-light-gray">
                  Digital Signature (Type your full name) *
                </Label>
                <Input
                  id="signatureName"
                  value={formData.signatureName}
                  onChange={(e) => setFormData(prev => ({ ...prev, signatureName: e.target.value }))}
                  className="bg-netflix-black border-netflix-border text-white"
                  placeholder="Type your full name as digital signature"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-netflix-border text-netflix-light-gray hover:bg-netflix-black"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !formData.signatureName}
                  className="bg-netflix-red hover:bg-red-700"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Verification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}