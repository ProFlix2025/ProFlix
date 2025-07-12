import React, { useState, useEffect, useRef } from 'react';

interface YouTubePlayerDirectProps {
  videoId: string;
  title: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export function YouTubePlayerDirect({ 
  videoId, 
  title, 
  onLoad, 
  onError, 
  className = '' 
}: YouTubePlayerDirectProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Force user interaction for autoplay
  const handlePlayClick = () => {
    console.log('🎯 User clicked play button for video:', videoId);
    setHasInteracted(true);
    setIsLoading(true);
    
    // Try to trigger play via postMessage
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
        console.log('📨 PostMessage sent to YouTube iframe');
      } catch (e) {
        console.log('PostMessage failed, iframe will handle play naturally');
      }
    }
    
    onLoad?.();
    
    // Fallback if still no play after 3 seconds
    setTimeout(() => {
      setIsLoading(false);
      console.log('⏱️ Play timeout reached, showing fallback option');
    }, 3000);
  };

  // Clean YouTube URL without tracking parameters
  const getCleanYouTubeUrl = () => {
    const baseUrl = 'https://www.youtube-nocookie.com/embed/' + videoId;
    const params = new URLSearchParams({
      autoplay: hasInteracted ? '1' : '0',
      mute: hasInteracted ? '0' : '1', // Start muted until user interaction
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      iv_load_policy: '3',
      fs: '1',
      cc_load_policy: '0',
      enablejsapi: '1',
      playsinline: '1'
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      console.log('YouTube iframe loaded successfully');
      if (!hasInteracted) {
        // Iframe loaded but user hasn't clicked play yet
        setIsLoading(false);
      }
    };

    const handleIframeError = (e: Event) => {
      console.error('YouTube iframe error:', e);
      setShowFallback(true);
      onError?.(new Error('YouTube iframe failed to load'));
    };

    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', handleIframeError);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      iframe.removeEventListener('error', handleIframeError);
    };
  }, [hasInteracted, onError]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {/* YouTube iframe */}
      <iframe
        ref={iframeRef}
        key={`youtube-direct-${videoId}-${hasInteracted}`}
        width="100%"
        height="100%"
        src={getCleanYouTubeUrl()}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none'
        }}
      />

      {/* Play overlay for user interaction */}
      {!hasInteracted && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center cursor-pointer z-10"
          onClick={handlePlayClick}
        >
          <div className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-colors mb-4">
            <svg 
              className="w-12 h-12 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div className="text-center text-white">
            <p className="text-lg font-semibold mb-2">Click to Play Video</p>
            <p className="text-sm text-gray-300 max-w-md">
              User interaction required for YouTube playback on this domain
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && hasInteracted && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm">Starting video...</p>
          </div>
        </div>
      )}

      {/* Fallback message */}
      {showFallback && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg z-30">
          <p className="text-sm mb-2">
            Video not playing? Try watching directly on YouTube:
          </p>
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
          >
            Open in YouTube
          </a>
        </div>
      )}
    </div>
  );
}