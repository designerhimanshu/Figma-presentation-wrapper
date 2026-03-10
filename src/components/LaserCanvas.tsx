import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface LaserCanvasRef {
  clearCanvas: () => void;
}

interface LaserCanvasProps {
  isLaserActive: boolean;
  laserColor: 'red' | 'green' | 'blue' | 'yellow' | 'fuchsia';
}

interface Point {
  x: number;
  y: number;
  time: number;
}

const COLOR_MAP = {
  red: '255, 0, 0',
  green: '0, 255, 0',
  blue: '0, 150, 255',
  yellow: '234, 179, 8',    // Tailwind yellow-500
  fuchsia: '217, 70, 239'   // Tailwind fuchsia-500
};

export const LaserCanvas = forwardRef<LaserCanvasRef, LaserCanvasProps>(
  ({ isLaserActive, laserColor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const points = useRef<Point[]>([]);
    const animationFrameId = useRef<number>(0);

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        points.current = [];
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resizeListener = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeListener();
      window.addEventListener('resize', resizeListener);
      return () => window.removeEventListener('resize', resizeListener);
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const now = Date.now();
        // Remove points older than 2000ms
        points.current = points.current.filter(p => now - p.time < 2000);

        if (points.current.length > 1) {
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          
          for (let i = 1; i < points.current.length; i++) {
            const p1 = points.current[i - 1];
            const p2 = points.current[i];
            
            // Avoid drawing connecting lines if points are far apart in time
            if (p2.time - p1.time > 50) continue;

            const age = now - p2.time;
            const opacity = Math.max(0, 1 - (age / 2000));
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = 4.2 * opacity + 0.72;
            
            ctx.strokeStyle = `rgba(${COLOR_MAP[laserColor]}, ${opacity})`;
            ctx.stroke();
            
            // Add a glowing effect
            ctx.lineWidth = 1.44 * opacity;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
            ctx.stroke();
          }
        }
        
        animationFrameId.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    }, [laserColor]);

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isLaserActive) return;
      isDrawing.current = true;
      points.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !isLaserActive) return;
      points.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
    };

    const handlePointerUp = () => {
      isDrawing.current = false;
    };

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full z-10 ${
          isLaserActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      />
    );
  }
);
LaserCanvas.displayName = 'LaserCanvas';
