import React, { useState, useRef, useEffect } from 'react';

export type ShapeType = 'arrow' | 'rectangle' | 'circle';

export interface Shape {
  id: string;
  type: ShapeType;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface AnnotationCanvasProps {
  activeTool: 'none' | ShapeType;
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
}

const colorMap = {
  red: '#ef4444',
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#eab308',
  fuchsia: '#d946ef',
};

// Extract renderShape outside to avoid hooks issues and ensure clean JSX returns
const renderShape = (shape: Shape, isPreview = false) => {
  const { type, color, startX, startY, endX, endY } = shape;
  
  const strokeProps = {
    stroke: color,
    strokeWidth: 4,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: isPreview ? 'opacity-50' : '',
  };

  if (type === 'rectangle') {
    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    return <rect x={minX} y={minY} width={width} height={height} {...strokeProps} />;
  }

  if (type === 'circle') {
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    return <circle cx={startX} cy={startY} r={radius} {...strokeProps} />;
  }

  if (type === 'arrow') {
    // Calculate arrowhead coordinates
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 20;
    const angleOffset = Math.PI / 6; // 30 degrees
    
    const arrowPoint1X = endX - headLength * Math.cos(angle - angleOffset);
    const arrowPoint1Y = endY - headLength * Math.sin(angle - angleOffset);
    
    const arrowPoint2X = endX - headLength * Math.cos(angle + angleOffset);
    const arrowPoint2Y = endY - headLength * Math.sin(angle + angleOffset);

    return (
      <g className={isPreview ? 'opacity-50' : ''}>
        <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={color} strokeWidth={4} strokeLinecap="round" />
        <path 
          d={`M ${arrowPoint1X} ${arrowPoint1Y} L ${endX} ${endY} L ${arrowPoint2X} ${arrowPoint2Y}`}
          stroke={color} 
          strokeWidth={4} 
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    );
  }

  return null;
};

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  activeTool,
  shapes,
  setShapes,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // If the active tool is 'none', this canvas should completely ignore pointer events
  const isAnnotationMode = activeTool !== 'none';

  // Prevent default touch actions (like scrolling) when drawing on touch devices
  useEffect(() => {
    const preventTouch = (e: TouchEvent) => {
      if (isAnnotationMode) e.preventDefault();
    };
    document.addEventListener('touchmove', preventTouch, { passive: false });
    return () => document.removeEventListener('touchmove', preventTouch);
  }, [isAnnotationMode]);

  const getCoordinates = (e: React.PointerEvent<SVGSVGElement> | PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isAnnotationMode) return;
    
    // Allow drawing with primary click (0) or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setCurrentShape({
      id: Date.now().toString(),
      type: activeTool as ShapeType,
      color: colorMap.red,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
    
    // Capture pointer so dragging works even outside the svg bounds briefly
    if (svgRef.current) {
       svgRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentShape) return;
    
    const { x, y } = getCoordinates(e);
    setCurrentShape((prev) => prev ? { ...prev, endX: x, endY: y } : null);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentShape) return;
    
    setIsDrawing(false);
    
    // Only save if it's not a microscopic accidental click
    const dx = currentShape.endX - currentShape.startX;
    const dy = currentShape.endY - currentShape.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      setShapes((prev) => [...prev, currentShape]);
    }
    
    setCurrentShape(null);
    if (svgRef.current) {
       svgRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full z-10"
      style={{
        // If shapes exist, we need the svg to exist visually, but unless we are currently drawing, 
        // we must pass clicks through to the Figma iframe beneath the drawn shapes.
        pointerEvents: isAnnotationMode ? 'auto' : 'none',
        // Optional: show crosshair when in drawing mode
        cursor: isAnnotationMode ? 'crosshair' : undefined
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Existing Persistent Shapes */}
      {shapes.map((shape) => (
        <React.Fragment key={shape.id}>
          {renderShape(shape)}
        </React.Fragment>
      ))}

      {/* Currently Dragging Shape Preview */}
      {isDrawing && currentShape && renderShape(currentShape, true)}
    </svg>
  );
};
