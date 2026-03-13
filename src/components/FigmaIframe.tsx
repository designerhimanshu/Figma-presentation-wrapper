import React, { useRef, useEffect, useState } from 'react';

interface FigmaIframeProps {
  figmaUrl: string;
  viewMode: 'contain' | 'min-zoom';
  activeArtboardId?: string | null;
}

export const FigmaIframe: React.FC<FigmaIframeProps> = ({ figmaUrl, viewMode, activeArtboardId }) => {
  if (!figmaUrl) {
    return (
      <div className="w-full h-full flex flex-col bg-zinc-950 relative overflow-hidden">
        {/* Northern Lights / Aurora Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#021f31] via-[#09475e] to-[#12121e] opacity-90 blur-xl mix-blend-screen" />
        
        {/* Abstract Glow Orbs */}
        <div className="absolute -bottom-[20%] left-[10%] w-[60%] h-[80%] bg-[#088395] rounded-full mix-blend-screen opacity-50 blur-[120px]" />
        <div className="absolute top-[20%] left-[40%] w-[40%] h-[40%] bg-[#37b7c3] rounded-full mix-blend-screen opacity-30 blur-[100px]" />
        <div className="absolute -top-[10%] right-[10%] w-[50%] h-[50%] bg-[#0f2c59] rounded-full mix-blend-screen opacity-60 blur-[100px]" />
        
        {/* Heavy Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-12 md:p-20">
          <div className="flex justify-between items-end w-full">
            {/* Left aligned main text */}
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-8xl font-light text-white mb-2 leading-[1.05] tracking-tight">
                Where Vision and<br />Presentation Align
              </h1>
              <p className="text-sm md:text-base text-zinc-300 font-light max-w-2xl opacity-90">
                Paste your Figma prototype link in the toolbar below to begin.
              </p>
            </div>
            
            {/* Right aligned watermark text */}
            <p className="text-sm font-medium text-white tracking-wider uppercase mb-2">
              Made by Himanshu Agrawal
            </p>
          </div>
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
