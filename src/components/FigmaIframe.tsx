import React from 'react';

interface FigmaIframeProps {
  figmaUrl: string;
  viewMode: 'contain' | 'min-zoom';
}

export const FigmaIframe: React.FC<FigmaIframeProps> = ({ figmaUrl, viewMode }) => {
  if (!figmaUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#121212] border-2 border-dashed border-zinc-700 text-zinc-400">
        <p className="text-xl mb-4 text-white font-medium">No Prototype Loaded</p>
        <p>Paste a Figma prototype link in the toolbar below to start.</p>
      </div>
    );
  }

  let embedUrl = figmaUrl;
  try {
    const url = new URL(figmaUrl);
    
    if (url.pathname === '/embed') {
      // Already an embed link, update the inner URL's scaling param if present
      const innerUrlStr = url.searchParams.get('url');
      if (innerUrlStr) {
        const innerUrl = new URL(decodeURIComponent(innerUrlStr));
        innerUrl.searchParams.set('scaling', viewMode);
        url.searchParams.set('url', innerUrl.toString());
      } else {
        url.searchParams.set('scaling', viewMode);
      }
      embedUrl = url.toString();
    } else {
      // Regular link, convert it to an embed link
      url.searchParams.set('scaling', viewMode);
      embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url.toString())}`;
    }
  } catch (e) {
    console.warn("Invalid Figma URL provided:", e);
  }

  return (
    <iframe
      src={embedUrl}
      className="absolute inset-0 w-full h-full border-none bg-[#121212]"
      allowFullScreen
      title="Figma Prototype Presentation"
    />
  );
};
