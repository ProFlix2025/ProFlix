import React, { useState, useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export function YouTubePlayer({ videoId, title, onLoad, onError, className = '' }: YouTubePlayerProps) {
  const [playerState, setPlayerState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    hostname: typeof window !== 'undefined' ? window.location.hostname : '',
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString()
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const maxRetries = 3;

  // Reset state when videoId changes
  useEffect(() => {
    setPlayerState('loading');
    setRetryCount(0);
  }, [videoId]);

  // Enhanced iframe load monitoring
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('✅ YouTube Player: iframe loaded successfully');
      console.log('Video ID:', videoId);
      console.log('Debug info:', debugInfo);
      
      // Check if iframe has content
      setTimeout(() => {
        if (iframe.offsetWidth > 0 && iframe.offsetHeight > 0) {
          console.log('✅ YouTube Player: iframe has proper dimensions');
          setPlayerState('loaded');
          onLoad?.();
        } else {
          console.warn('⚠️ YouTube Player: iframe has zero dimensions');
          setPlayerState('error');
          onError?.(new Error('Iframe has zero dimensions'));
        }
      }, 500);
    };

    const handleError = (e: Event) => {
      console.error('❌ YouTube Player: iframe error event triggered');
      console.error('Error details:', { videoId, retryCount, error: e });
      
      if (retryCount < maxRetries) {
        console.log(`🔄 YouTube Player: Retrying (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setPlayerState('loading');
        }, 2000);
      } else {
        console.error('❌ YouTube Player: Max retries reached');
        setPlayerState('error');
        onError?.(new Error('Max retries reached'));
      }
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [videoId, retryCount, onLoad, onError, debugInfo]);

  // Create iframe URL with youtube-nocookie.com for better .app domain compatibility
  const getIframeUrl = () => {
    // Use youtube-nocookie.com for better embedding on .app domains
    const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      enablejsapi: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0'
    });
    
    // Only add origin for localhost, remove for production .app domains
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      params.set('origin', window.location.origin);
      params.set('widgetid', '1');
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading state */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm">Loading YouTube video...</p>
            <div className="text-xs text-gray-400 mt-2">
              Attempt {retryCount + 1}/{maxRetries + 1}
            </div>
          </div>
        </div>
      )}

      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        key={`youtube-${videoId}-${retryCount}`}
        width="560"
        height="315"
        src={getIframeUrl()}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
          display: playerState === 'error' ? 'none' : 'block'
        }}
      />

      {/* Error state */}
      {playerState === 'error' && (
        <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="text-center text-white p-6 max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">YouTube Video</h3>
            <p className="text-sm text-gray-300 mb-4">
              {debugInfo.hostname.includes('localhost') 
                ? "YouTube embedding may be restricted in development. The video will work in production."
                : "This video is available on YouTube. Click below to watch it."
              }
            </p>
            <div className="space-y-3">
              <a 
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Watch on YouTube
              </a>
              <button 
                onClick={() => {
                  setRetryCount(0);
                  setPlayerState('loading');
                }}
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Retry Embed
              </button>
            </div>
            
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                Technical Details
              </summary>
              <div className="mt-2 text-xs text-gray-400 bg-gray-800 p-3 rounded">
                <div>Video ID: {videoId}</div>
                <div>Iframe URL: {getIframeUrl()}</div>
                <div>Domain: {debugInfo.hostname}</div>
                <div>Protocol: {debugInfo.protocol}</div>
                <div>Retries: {retryCount}</div>
                <div>State: {playerState}</div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}