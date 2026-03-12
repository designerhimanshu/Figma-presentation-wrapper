import React, { useRef, useEffect, useState } from 'react';

interface FigmaIframeProps {
  figmaUrl: string;
  viewMode: 'contain' | 'min-zoom';
  activeArtboardId?: string | null;
}

export const FigmaIframe: React.FC<FigmaIframeProps> = ({ figmaUrl, viewMode, activeArtboardId }) => {
  if (!figmaUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#121212] border-2 border-dashed border-zinc-700 text-zinc-400">
        <p className="text-xl mb-4 text-white font-medium">No Prototype Loaded</p>
        <p>Paste a Figma prototype link in the toolbar below to start.</p>
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
