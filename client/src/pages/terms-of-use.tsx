import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, DollarSign, AlertTriangle, Scale, Users } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Scale className="w-8 h-8 text-netflix-red" />
            Terms of Use
          </h1>
          <p className="text-netflix-light-gray text-sm">
            Effective Date: July 10, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <p className="text-netflix-light-gray leading-relaxed mb-4">
                Welcome to ProFlix, operated by Starlite Medical LLC ("ProFlix", "we", "our", or "us"). By accessing or using our website, mobile app, or any of our services (collectively, the "Platform"), you agree to comply with and be bound by the following Terms of Use.
              </p>
              <p className="text-netflix-light-gray leading-relaxed">
                Please read these terms carefully. If you do not agree with them, do not use the Platform.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-netflix-red" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray mb-4">By using the Platform, you confirm that:</p>
              <ul className="space-y-2 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>You are at least 18 years old (or have legal parental/guardian consent).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>You have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-netflix-red" />
                2. Platform Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray">
                ProFlix is a platform that allows verified creators to upload and sell pre-recorded video content, including but not limited to tutorials, mini-courses, and educational material. Viewers may browse, stream, or purchase access to content depending on the creator's settings.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-netflix-red" />
                3. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>All content uploaded by creators remains the intellectual property of the creator, unless otherwise agreed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Users may not download, copy, share, or redistribute content without written permission from the copyright owner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>If you believe content infringes your copyright, please refer to our DMCA Takedown Policy.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>4. User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>You are responsible for maintaining the confidentiality of your account login information. You agree not to share your login or let others access your account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>We reserve the right to suspend or terminate accounts at our sole discretion, including for violations of these Terms or for any illegal, abusive, or inappropriate behavior.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-netflix-red" />
                5. Payments & Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>For now, access to content may be offered free or paid, depending on the creator.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>When payments are enabled, creators will receive 80% of revenue from their content, and ProFlix will retain a 20% service fee.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>All payouts and payment processing will be handled through a third-party provider such as Stripe. You must comply with their terms as well.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-netflix-red" />
                6. Content Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray mb-4">Creators agree not to upload content that is:</p>
              <ul className="space-y-2 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Illegal, obscene, pornographic, or hateful</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Misleading, plagiarized, or stolen from others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>In violation of any law or third-party rights</span>
                </li>
              </ul>
              <p className="text-netflix-light-gray mt-4">
                We reserve the right to remove any content at our discretion.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>7. License to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>By uploading content, you grant ProFlix a non-exclusive, royalty-free license to host, display, and stream your content to users on the platform for the purpose of delivering our service.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>You do not give up ownership of your content.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray mb-4">
                To the fullest extent permitted by law, ProFlix and Starlite Medical LLC are not liable for any damages, losses, or legal claims resulting from:
              </p>
              <ul className="space-y-2 text-netflix-light-gray mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Platform downtime or technical errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>User-generated content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Unauthorized access to your account</span>
                </li>
              </ul>
              <p className="text-netflix-light-gray">
                Use of the Platform is at your own risk.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>9. Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray">
                We may update these Terms at any time. When we do, we will update the "Effective Date" at the top of this page. Continued use of the Platform after changes means you agree to the new terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>10. Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray mb-4">Questions? Reach out to us at:</p>
              <div className="bg-netflix-dark-gray p-4 rounded">
                <p className="mb-2">Email: support@proflix.com</p>
                <p className="text-sm text-netflix-light-gray">Legal Entity: Starlite Medical LLC (soon to be ProFlix LLC)</p>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-netflix-border" />

          <div className="text-center">
            <p className="text-sm text-netflix-light-gray">
              <strong>Note:</strong> These terms are subject to change. For questions about your legal rights and obligations, please contact us at support@proflix.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}