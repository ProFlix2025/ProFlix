import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { YouTubeEmbedTest } from '@/components/YouTubeEmbedTest';

export default function YouTubeDebug() {
  const [debugData, setDebugData] = useState({
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    origin: window.location.origin,
    userAgent: navigator.userAgent,
    cookiesEnabled: navigator.cookieEnabled,
    timestamp: new Date().toISOString()
  });

  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const testVideos = [
    { id: 'dQw4w9WgXcQ', title: 'Rick Roll', description: 'Most famous YouTube video' },
    { id: 'jNQXAC9IVRw', title: 'Me at the zoo', description: 'First YouTube video' },
    { id: '9bZkp7q19f0', title: 'Gangnam Style', description: 'Popular K-pop video' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito', description: 'Popular music video' },
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', description: 'Queen official video' }
  ];

  const testIframeLoad = (videoId: string, title: string) => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.width = '560';
      iframe.height = '315';
      iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&widgetid=1`;
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.style.display = 'none';

      let loadTimer: NodeJS.Timeout;
      let hasResolved = false;

      const resolveTest = (result: any) => {
        if (hasResolved) return;
        hasResolved = true;
        clearTimeout(loadTimer);
        document.body.removeChild(iframe);
        resolve(result);
      };

      iframe.onload = () => {
        console.log(`✅ Test iframe loaded: ${title}`);
        setTimeout(() => {
          resolveTest({
            success: true,
            dimensions: { width: iframe.offsetWidth, height: iframe.offsetHeight },
            visible: iframe.offsetWidth > 0 && iframe.offsetHeight > 0
          });
        }, 1000);
      };

      iframe.onerror = (error) => {
        console.error(`❌ Test iframe error: ${title}`, error);
        resolveTest({
          success: false,
          error: error.toString()
        });
      };

      // Timeout after 10 seconds
      loadTimer = setTimeout(() => {
        console.warn(`⏱️ Test iframe timeout: ${title}`);
        resolveTest({
          success: false,
          error: 'Timeout after 10 seconds'
        });
      }, 10000);

      document.body.appendChild(iframe);
    });
  };

  const runAllTests = async () => {
    console.log('🧪 Starting comprehensive YouTube embedding tests...');
    const results: Record<string, any> = {};

    for (const video of testVideos) {
      console.log(`🔍 Testing video: ${video.title} (${video.id})`);
      try {
        const result = await testIframeLoad(video.id, video.title);
        results[video.id] = { ...result, title: video.title, description: video.description };
      } catch (error) {
        results[video.id] = { 
          success: false, 
          error: error.toString(), 
          title: video.title, 
          description: video.description 
        };
      }
    }

    setTestResults(results);
    console.log('🧪 All tests completed:', results);
  };

  const testNetworkConnectivity = async () => {
    try {
      console.log('🌐 Testing network connectivity...');
      const response = await fetch('https://www.youtube.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log('✅ Network connectivity test passed');
      return true;
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error);
      return false;
    }
  };

  const checkCSPHeaders = async () => {
    try {
      const response = await fetch(window.location.href, { method: 'HEAD' });
      const csp = response.headers.get('content-security-policy');
      console.log('CSP Header:', csp);
      return csp;
    } catch (error) {
      console.error('Error checking CSP:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔧 YouTube Debug Page loaded');
    console.log('Debug data:', debugData);
    testNetworkConnectivity();
    checkCSPHeaders();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-red-500">YouTube Embedding Debug Center</h1>
          <p className="text-gray-400">Comprehensive testing and debugging for YouTube iframe embedding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Environment Information */}
          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white">Environment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Hostname:</span>
                  <div className="text-white font-mono">{debugData.hostname}</div>
                </div>
                <div>
                  <span className="text-gray-400">Protocol:</span>
                  <div className="text-white font-mono">{debugData.protocol}</div>
                </div>
                <div>
                  <span className="text-gray-400">Origin:</span>
                  <div className="text-white font-mono text-xs">{debugData.origin}</div>
                </div>
                <div>
                  <span className="text-gray-400">Cookies:</span>
                  <div className="text-white font-mono">{debugData.cookiesEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-400">User Agent:</span>
                <div className="text-white font-mono text-xs mt-1 break-all">{debugData.userAgent}</div>
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="bg-netflix-black border-netflix-border">
            <CardHeader>
              <CardTitle className="text-white">Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runAllTests}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Run All YouTube Embedding Tests
              </Button>
              
              <div className="space-y-2">
                <Button 
                  onClick={testNetworkConnectivity}
                  variant="outline"
                  className="w-full"
                >
                  Test Network Connectivity
                </Button>
                
                <Button 
                  onClick={checkCSPHeaders}
                  variant="outline"
                  className="w-full"
                >
                  Check CSP Headers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card className="bg-netflix-black border-netflix-border mt-8">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(testResults).map(([videoId, result]) => (
                  <div key={videoId} className="border border-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{result.title}</h3>
                        <p className="text-gray-400 text-sm">{result.description}</p>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Video ID:</span>
                        <div className="text-white font-mono">{videoId}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <div className="text-white font-mono">{result.success ? 'Success' : 'Failed'}</div>
                      </div>
                      {result.dimensions && (
                        <div>
                          <span className="text-gray-400">Dimensions:</span>
                          <div className="text-white font-mono">{result.dimensions.width}×{result.dimensions.height}</div>
                        </div>
                      )}
                      {result.visible !== undefined && (
                        <div>
                          <span className="text-gray-400">Visible:</span>
                          <div className="text-white font-mono">{result.visible ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                    </div>
                    
                    {result.error && (
                      <div className="mt-2">
                        <span className="text-gray-400">Error:</span>
                        <div className="text-red-400 font-mono text-xs mt-1">{result.error}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Embedding Tests */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Live Embedding Tests</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {testVideos.slice(0, 4).map((video) => (
              <YouTubeEmbedTest
                key={video.id}
                videoId={video.id}
                title={video.title}
                description={video.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}