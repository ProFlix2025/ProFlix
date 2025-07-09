import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Video, Users, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-netflix-red bg-clip-text text-transparent">
            ProFlix
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-netflix-light-gray">
            YouTube-Style Free Video Platform
          </p>
          <p className="text-lg mb-12 text-netflix-light-gray max-w-2xl mx-auto">
            Watch unlimited free videos with YouTube-style features. Like, share, comment, and subscribe to creators. Pro Creators can sell premium courses directly under their videos.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-netflix-red hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Get Started
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose ProFlix?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-8 text-center">
                <Play className="w-12 h-12 text-netflix-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">For Viewers</h3>
                <p className="text-netflix-light-gray">
                  Discover amazing content across 10+ categories. From fitness to entrepreneurship, art to cooking - find your passion.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-8 text-center">
                <Video className="w-12 h-12 text-netflix-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">For Creators</h3>
                <p className="text-netflix-light-gray">
                  Upload your content easily, organize by categories, and build your audience. Professional dashboard to manage everything.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-netflix-black border-netflix-border">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-netflix-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Growing Community</h3>
                <p className="text-netflix-light-gray">
                  Join a thriving community of creators and viewers. Connect, learn, and grow together in our supportive environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Categories Preview */}
      <div className="py-20 px-4 bg-netflix-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              'Art', 'Fitness', 'Entrepreneurship', 'Beauty', 'Construction',
              'Music', 'Film & Media', 'Food', 'Sports', 'Dating & Lifestyle'
            ].map((category) => (
              <div key={category} className="bg-netflix-gray hover:bg-netflix-red transition-colors p-6 rounded-lg text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-netflix-light-gray">
            Join ProFlix today and become part of the creator economy.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-netflix-red hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
          >
            Join Now - It's Free!
          </Button>
        </div>
      </div>
    </div>
  );
}
