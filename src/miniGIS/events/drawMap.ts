import { Coordinate } from '@/miniGIS/lib';
import { Map } from '@/miniGIS/lib/models/map';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';

export const useDrawMap = () => {
  const [canvasWidth] = useState<number>(1440);
  const [canvasHeight] = useState<number>(800);
  const map = useRef(new Map(new Coordinate(0, 0), canvasWidth, canvasHeight));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isDirty = useRef<boolean>(true);

  useEffect(() => {
    bufferCanvasRef.current = document.createElement('canvas');
    bufferCanvasRef.current.width = canvasWidth;
    bufferCanvasRef.current.height = canvasHeight;
  }, [canvasWidth, canvasHeight]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    if (!canvas || !bufferCanvas) return;

    const ctx = canvas.getContext('2d');
    const bufferCtx = bufferCanvas.getContext('2d');
    if (!ctx || !bufferCtx) return;

    if (isDirty.current) {
      bufferCtx.clearRect(0, 0, canvas.width, canvas.height);

      const layers = map.current.getLayers();
      for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].draw(bufferCtx, map.current, canvas.width, canvas.height);
      }

      isDirty.current = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bufferCanvas, 0, 0);

    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  };

  const drawThrottle = _.throttle(() => {
    isDirty.current = true;
    drawCanvas();
  }, 32);

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
    drawCanvas: () => {
      isDirty.current = true;
      drawThrottle();
    },
  };
};
