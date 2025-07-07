import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Mail, AlertTriangle, FileText } from "lucide-react";

export default function DMCAPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-8 h-8 text-netflix-red" />
            DMCA Takedown Policy
          </h1>
          <p className="text-netflix-light-gray text-sm">
            Effective Date: July 10, 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-netflix-black border-netflix-border">
            <CardContent className="p-6">
              <p className="text-netflix-light-gray leading-relaxed">
                ProFlix ("we", "our", or "us") respects the intellectual property rights of others and complies with the provisions of the Digital Millennium Copyright Act ("DMCA") applicable to internet service providers. If you believe that your copyrighted work has been infringed upon on our platform, you may submit a written DMCA notice to our Designated Agent as outlined below.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-netflix-red" />
                🔒 How to File a DMCA Takedown Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-netflix-light-gray">
                If you are a copyright owner (or authorized to act on behalf of one), please provide a written notice containing the following:
              </p>
              <ul className="space-y-3 text-netflix-light-gray">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Identification of the copyrighted work you claim has been infringed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>A description of where the infringing material is located on our platform (e.g., a direct link).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <div>
                    <span>Your contact information, including:</span>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Full legal name</li>
                      <li>• Address</li>
                      <li>• Phone number</li>
                      <li>• Email address</li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>A statement that the information in your notice is accurate, and under penalty of perjury, that you are the copyright owner or authorized to act on their behalf.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Your physical or electronic signature.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-netflix-red" />
                📬 DMCA Notices Should Be Sent To:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-netflix-dark-gray p-4 rounded">
                <p className="font-semibold mb-2">Designated DMCA Agent</p>
                <p className="mb-1">ProFlix Legal</p>
                <p className="mb-1">Email: legal@proflix.com</p>
                <p className="text-sm text-netflix-light-gray">Subject Line: "DMCA Takedown Request"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle>⚖️ Counter-Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-netflix-light-gray">
                If you believe that your content was removed or disabled in error, you may file a counter-notification. To be valid under the DMCA, your counter-notification must include:
              </p>
              <ul className="space-y-3 text-netflix-light-gray mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Your name, address, phone number, and email.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Identification of the material that was removed and the location before it was removed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>A statement under penalty of perjury that you believe the content was mistakenly removed or misidentified.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>A statement that you consent to the jurisdiction of the federal district court in your area (or, if outside the U.S., in any judicial district in which we may be found).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-netflix-red mt-1">•</span>
                  <span>Your electronic or physical signature.</span>
                </li>
              </ul>
              <p className="text-netflix-light-gray">
                Upon receipt of a valid counter-notice, we may reinstate the content unless the original complainant files a court action within 10 business days.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-netflix-red" />
                🚫 Repeat Infringer Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-netflix-light-gray">
                We may disable or terminate user accounts that are repeat infringers or who are found to upload infringing content, at our sole discretion.
              </p>
            </CardContent>
          </Card>

          <Separator className="bg-netflix-border" />

          <div className="text-center">
            <p className="text-sm text-netflix-light-gray">
              <strong>Note:</strong> This policy is subject to change without notice. For questions, contact us at legal@proflix.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}