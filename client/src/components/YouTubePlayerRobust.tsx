import React, { useState, useEffect, useRef } from 'react';

interface YouTubePlayerRobustProps {
  videoId: string;
  title: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export function YouTubePlayerRobust({ 
  videoId, 
  title, 
  onLoad, 
  onError, 
  className = '' 
}: YouTubePlayerRobustProps) {
  const [currentMethod, setCurrentMethod] = useState(0);
  const [playerState, setPlayerState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const maxRetries = 3;

  // Multiple embedding approaches
  const embeddingMethods = [
    {
      name: 'youtube-nocookie.com (ChatGPT Fix)',
      getUrl: () => `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`,
      referrerPolicy: 'no-referrer-when-downgrade' as const
    },
    {
      name: 'youtube.com with origin',
      getUrl: () => {
        const params = new URLSearchParams({
          enablejsapi: '1',
          modestbranding: '1',
          rel: '0',
          showinfo: '0'
        });
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          params.set('origin', window.location.origin);
        }
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      },
      referrerPolicy: 'strict-origin-when-cross-origin' as const
    },
    {
      name: 'youtube-nocookie.com minimal',
      getUrl: () => `https://www.youtube-nocookie.com/embed/${videoId}`,
      referrerPolicy: 'no-referrer-when-downgrade' as const
    },
    {
      name: 'youtube.com minimal',
      getUrl: () => `https://www.youtube.com/embed/${videoId}`,
      referrerPolicy: 'no-referrer-when-downgrade' as const
    }
  ];

  const currentEmbedMethod = embeddingMethods[currentMethod];

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    let loadTimer: NodeJS.Timeout;

    const handleLoad = () => {
      clearTimeout(loadTimer);
      console.log(`✅ YouTube embed loaded with method: ${currentEmbedMethod.name}`);
      setPlayerState('loaded');
      onLoad?.();
    };

    const handleError = (e: Event) => {
      clearTimeout(loadTimer);
      console.error(`❌ YouTube embed failed with method: ${currentEmbedMethod.name}`, e);
      
      if (currentMethod < embeddingMethods.length - 1) {
        console.log(`🔄 Trying next method: ${embeddingMethods[currentMethod + 1].name}`);
        setCurrentMethod(prev => prev + 1);
        setPlayerState('loading');
      } else if (retryCount < maxRetries) {
        console.log(`🔄 Retrying from beginning (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setCurrentMethod(0);
        setPlayerState('loading');
      } else {
        console.error('❌ All YouTube embedding methods failed');
        setPlayerState('error');
        onError?.(new Error('All embedding methods failed'));
      }
    };

    // Set timeout for iframe loading
    loadTimer = setTimeout(() => {
      console.warn(`⏰ YouTube embed timeout with method: ${currentEmbedMethod.name}`);
      handleError(new Event('timeout'));
    }, 10000);

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(loadTimer);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [currentMethod, retryCount, onLoad, onError, currentEmbedMethod.name]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading state */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm">Loading YouTube video...</p>
            <div className="text-xs text-gray-400 mt-2">
              Method: {currentEmbedMethod.name}
            </div>
            <div className="text-xs text-gray-400">
              Try {retryCount + 1}/{maxRetries + 1} | Approach {currentMethod + 1}/{embeddingMethods.length}
            </div>
          </div>
        </div>
      )}

      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        key={`youtube-${videoId}-${currentMethod}-${retryCount}`}
        width="560"
        height="315"
        src={currentEmbedMethod.getUrl()}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy={currentEmbedMethod.referrerPolicy}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
          display: playerState === 'error' ? 'none' : 'block'
        }}
      />

      {/* Error state with fallback */}
      {playerState === 'error' && (
        <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="text-center text-white p-6 max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">YouTube Video Unavailable</h3>
            <p className="text-sm text-gray-300 mb-4">
              Unable to embed this video. This may be due to domain restrictions or video settings.
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
                  setCurrentMethod(0);
                  setPlayerState('loading');
                }}
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
            
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                Debug Information
              </summary>
              <div className="mt-2 text-xs text-gray-400 bg-gray-800 p-3 rounded">
                <div>Video ID: {videoId}</div>
                <div>Domain: {typeof window !== 'undefined' ? window.location.hostname : 'unknown'}</div>
                <div>Methods Tried: {embeddingMethods.slice(0, currentMethod + 1).map(m => m.name).join(', ')}</div>
                <div>Retry Attempts: {retryCount}</div>
                <div>Current URL: {currentEmbedMethod.getUrl()}</div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}