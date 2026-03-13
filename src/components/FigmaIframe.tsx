import React, { useRef, useEffect, useState } from 'react';

interface FigmaIframeProps {
  figmaUrl: string;
  viewMode: 'contain' | 'min-zoom';
  activeArtboardId?: string | null;
}

export const FigmaIframe: React.FC<FigmaIframeProps> = ({ figmaUrl, viewMode, activeArtboardId }) => {
  if (!figmaUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0518] via-[#111116] to-[#1a0b1f] text-zinc-400 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-rose-300 mb-6 tracking-tight drop-shadow-sm">
            Ready to present like a pro?
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 font-medium mb-4">
            No prototype loaded yet.
          </p>
          <p className="text-lg text-zinc-500">
            Drop your Figma link into the toolbar below and let's get this show on the road.
          </p>
        </div>
      </div>
    );
  }

  const [embedUrl, setEmbedUrl] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Generate the base embed URL whenever figmaUrl, viewMode, or activeArtboardId changes.
  useEffect(() => {
    let computedUrl = figmaUrl;
    try {
      const url = new URL(figmaUrl);
      if (url.pathname === '/embed') {
        const innerUrlStr = url.searchParams.get('url');
        if (innerUrlStr) {
          const innerUrl = new URL(decodeURIComponent(innerUrlStr));
          innerUrl.searchParams.set('scaling', viewMode);
          if (activeArtboardId && activeArtboardId !== 'auto-first') {
             innerUrl.searchParams.set('node-id', activeArtboardId);
          }
          innerUrl.searchParams.set('hide-ui', '1');
          url.searchParams.set('url', innerUrl.toString());
        } else {
          url.searchParams.set('scaling', viewMode);
          if (activeArtboardId && activeArtboardId !== 'auto-first') {
             url.searchParams.set('node-id', activeArtboardId);
          }
          url.searchParams.set('hide-ui', '1');
        }
        computedUrl = url.toString();
      } else {
        url.searchParams.set('scaling', viewMode);
        if (activeArtboardId && activeArtboardId !== 'auto-first') {
           url.searchParams.set('node-id', activeArtboardId);
        }
        url.searchParams.set('hide-ui', '1');
        computedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url.toString())}`;
      }
      
      const finalUrl = new URL(computedUrl);
      finalUrl.searchParams.set('client_id', '__NA__'); // Try to allow Embed API
      setEmbedUrl(finalUrl.toString());
    } catch (e) {
      console.warn("Invalid Figma URL provided:", e);
    }
  }, [figmaUrl, viewMode, activeArtboardId]); 

  // 2. Transmit instant "NAVIGATE" API messages to Figma's WebGL engine
  // This is a "best-effort" enhancement. If Figma blocks it, the URL change above
  // will still guarantee the iframe navigates (even if it causes a brief loading flash).
  useEffect(() => {
    if (activeArtboardId && activeArtboardId !== 'auto-first' && iframeRef.current?.contentWindow) {
      // Send the official Embed API navigate command
      iframeRef.current.contentWindow.postMessage(
        { type: "NAVIGATE_TO", data: { nodeId: activeArtboardId } },
        "https://www.figma.com"
      );
    }
  }, [activeArtboardId]);

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      className="absolute inset-0 w-full h-full border-none bg-[#121212]"
      allowFullScreen
      title="Figma Prototype Presentation"
    />
  );
};
