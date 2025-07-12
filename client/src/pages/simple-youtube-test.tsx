import { useState, useEffect } from 'react';

export default function SimpleYouTubeTest() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    
    const iframe = document.getElementById('test-iframe') as HTMLIFrameElement;
    if (!iframe) return;

    const handleLoad = () => {
      const endTime = Date.now();
      setLoadTime(endTime - startTime);
      setIframeLoaded(true);
      console.log('✅ Simple test iframe loaded in:', endTime - startTime, 'ms');
    };

    const handleError = (e: any) => {
      setIframeError(true);
      console.error('❌ Simple test iframe error:', e);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Simple YouTube Test</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Domain:</strong> {window.location.hostname}
            </div>
            <div>
              <strong>Protocol:</strong> {window.location.protocol}
            </div>
            <div>
              <strong>Load Status:</strong> {iframeLoaded ? '✅ Loaded' : iframeError ? '❌ Error' : '⏳ Loading'}
            </div>
            <div>
              <strong>Load Time:</strong> {loadTime ? `${loadTime}ms` : 'Pending'}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Rick Roll Test (dQw4w9WgXcQ)</h3>
          </div>
          
          <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
            <iframe
              id="test-iframe"
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1&modestbranding=1&rel=0"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}