import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface YouTubeEmbedTestProps {
  videoId: string;
  title: string;
  description: string;
}

export function YouTubeEmbedTest({ videoId, title, description }: YouTubeEmbedTestProps) {
  const [embedState, setEmbedState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [iframeVisible, setIframeVisible] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();
    setEmbedState('loading');
    setLoadTime(null);
    setErrorMessage('');
    setIframeVisible(false);
    
    const timer = setTimeout(() => {
      if (embedState === 'loading') {
        setEmbedState('error');
        setErrorMessage('Timeout after 15 seconds');
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [videoId]);

  const handleIframeLoad = () => {
    const endTime = Date.now();
    setLoadTime(endTime - Date.now());
    setEmbedState('loaded');
    setIframeVisible(true);
    console.log(`✅ YouTube embed loaded: ${title} (${videoId})`);
  };

  const handleIframeError = (error: any) => {
    setEmbedState('error');
    setErrorMessage(error.toString());
    console.error(`❌ YouTube embed error: ${title} (${videoId})`, error);
  };

  const resetTest = () => {
    setEmbedState('loading');
    setLoadTime(null);
    setErrorMessage('');
    setIframeVisible(false);
  };

  return (
    <Card className="bg-netflix-black border-netflix-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{title}</CardTitle>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={embedState === 'loaded' ? 'default' : embedState === 'error' ? 'destructive' : 'secondary'}>
              {embedState === 'loaded' && '✅ Loaded'}
              {embedState === 'error' && '❌ Failed'}
              {embedState === 'loading' && '⏳ Loading'}
            </Badge>
            <Button onClick={resetTest} size="sm" variant="outline" className="text-xs">
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Iframe Container */}
        <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {/* Loading State */}
          {embedState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
              <div className="text-center text-white">
                <div className="animate-spin w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading YouTube video...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {embedState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50 z-10">
              <div className="text-center text-white p-4">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Failed to Load</p>
                <p className="text-xs text-gray-300 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* YouTube Iframe */}
          <iframe
            key={`test-${videoId}-${Date.now()}`}
            width="560"
            height="315"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            style={{ 
              width: '100%', 
              height: '100%',
              display: embedState === 'error' ? 'none' : 'block'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>

        {/* Test Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Video ID:</span>
            <div className="text-white font-mono">{videoId}</div>
          </div>
          <div>
            <span className="text-gray-400">State:</span>
            <div className="text-white">{embedState}</div>
          </div>
          <div>
            <span className="text-gray-400">Load Time:</span>
            <div className="text-white">{loadTime ? `${loadTime}ms` : 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-400">Visible:</span>
            <div className="text-white">{iframeVisible ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Error Details */}
        {embedState === 'error' && errorMessage && (
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded p-3">
            <h4 className="text-red-400 font-medium text-sm">Error Details</h4>
            <p className="text-red-300 text-xs mt-1 font-mono">{errorMessage}</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium text-center transition-colors"
          >
            Watch on YouTube
          </a>
          <a
            href={`https://www.youtube.com/embed/${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium text-center transition-colors"
          >
            Direct Embed
          </a>
        </div>
      </CardContent>
    </Card>
  );
}