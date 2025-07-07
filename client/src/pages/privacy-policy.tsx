import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-netflix-black border-netflix-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">Privacy Policy</CardTitle>
            <p className="text-netflix-light-gray">Effective Date: January 07, 2025</p>
            <p className="text-netflix-light-gray">
              Company Name: ProFlix LLC<br />
              Contact Email: support@proflix.app
            </p>
          </CardHeader>
          <CardContent className="text-netflix-light-gray space-y-6">
            <p>
              This Privacy Policy explains how ProFlix LLC ("ProFlix", "we", "our", or "us") collects, uses, and discloses information about users of our website, services, and platform (the "Service"). By using ProFlix, you agree to the terms of this policy.
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">A. Information You Provide</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Account registration (name, email, password)</li>
                  <li>Creator submissions (profile, videos, images)</li>
                  <li>Payment and payout details (Stripe, PayPal, or bank info)</li>
                  <li>Communications with our team or support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">B. Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device/browser info</li>
                  <li>IP address</li>
                  <li>Pages visited, time on site</li>
                  <li>Cookies and analytics data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Operate and improve the ProFlix platform</li>
                <li>Process payments and pay creators</li>
                <li>Provide customer support</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Send updates, offers, and platform news (you may opt out anytime)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Payments & Payouts</h2>
              <p>
                Payments are handled by third-party processors (e.g., Stripe, PayPal). We do not store full credit card numbers or sensitive banking data. All financial transactions are encrypted and processed securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to personalize your experience and gather usage data. You can disable cookies via your browser settings, but this may affect your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Sharing of Information</h2>
              <p className="mb-2">We do not sell your personal data. We may share data with:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Service providers (hosting, analytics, payment processors)</li>
                <li>Legal authorities (if required by law or to protect our platform)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights and Choices</h2>
              <p className="mb-2">You can:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access or update your account information</li>
                <li>Delete your account by contacting support</li>
                <li>Opt out of marketing emails</li>
                <li>Request a copy of your stored data (as required by law)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p>
                We retain data as long as your account is active or as needed to comply with legal obligations and resolve disputes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Security</h2>
              <p>
                We use encryption, access controls, and secure servers to protect your data. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
              <p>
                ProFlix is not intended for users under the age of 18. We do not knowingly collect data from minors. If we become aware that a child has provided us personal info, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy at any time. You will be notified of material changes via email or site notice. Continued use of ProFlix after changes means you accept the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
              <p>
                If you have any questions or concerns about this policy, email us at:<br />
                <a href="mailto:support@proflix.app" className="text-netflix-red hover:underline">
                  support@proflix.app
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}