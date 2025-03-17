import { Coordinate } from '@/miniGIS/lib';
import { Map } from '@/miniGIS/lib/models/map';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

export const useDrawMap = () => {
  const [canvasWidth, setCanvasWidth] = useState<number>(1440);
  const [canvasHeight, setCanvasHeight] = useState<number>(800);
  const map = useRef(new Map(new Coordinate(0, 0), canvasWidth, canvasHeight));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const layers = map.current.getLayers();

    for (let i = 0; i < layers.length; i++) {
      if (layers[i]?.isVisible) {
        const geoms = layers[i].geometries;
        for (let k = 0; k < geoms.length; k++) {
          geoms[k].draw(ctx, map.current, canvas.width, canvas.height);
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  };

  const drawThrottle = _.throttle(drawCanvas, 16);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(drawThrottle);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    map,
    canvasHeight,
    canvasWidth,
    drawCanvas: drawThrottle,
  };
};
