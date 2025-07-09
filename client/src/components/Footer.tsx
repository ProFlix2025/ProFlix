import { Link } from "wouter";
import { Shield, FileText, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-netflix-black border-t border-netflix-border px-6 py-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-netflix-red">ProFlix</h3>
            <p className="text-netflix-light-gray text-sm mt-1">
              Free YouTube-style video platform with course monetization
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link href="/dmca-policy" className="text-netflix-light-gray hover:text-white transition-colors">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>DMCA Policy</span>
              </div>
            </Link>
            <Link href="/terms-of-use" className="text-netflix-light-gray hover:text-white transition-colors">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Terms of Use</span>
              </div>
            </Link>
            <Link href="/privacy-policy" className="text-netflix-light-gray hover:text-white transition-colors">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Privacy Policy</span>
              </div>
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-netflix-light-gray text-sm">
              © 2025 ProFlix. All rights reserved.
            </p>
            <p className="text-netflix-light-gray text-xs mt-1">
              Operated by Starlite Medical LLC
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}