import { Coordinate } from "@/miniGIS/lib/models";
import "./App.css";
import { Map } from "@/miniGIS/lib/models/map";
import { useRef, useEffect, useState, useMemo } from "react";
import TestJSON from '@/miniGIS/test/world.json';
import { parseGeoJSON } from "@/miniGIS/lib/parser";

function App() {
  const [canvasWidth, canvasHeight] = [800, 600];
  const [map] = useState(new Map(new Coordinate(0, 0), canvasWidth, canvasHeight));
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<Coordinate | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<Coordinate>(new Coordinate(map.center.x, map.center.y));

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lastMouseWorld = useMemo(() => {
    return currentMousePosition ? map.screenToWorld(currentMousePosition) : new Coordinate(0, 0);
  }, [currentMousePosition, map]);

  const infoScreenString = useMemo(() => {
    return `X: ${lastMouseWorld.x.toFixed(4)}\t\t Y: ${lastMouseWorld.y.toFixed(4)}\t\t Scale: ${map.scale.toFixed(4)}`;
  }, [lastMouseWorld, map.scale]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    map.getLayers().forEach(layer => {
      if (layer.isVisible) {
        layer.geometries.forEach(geometry => {
          ctx.strokeStyle = 'white';
          ctx.save();
          geometry.draw(ctx, map, canvas.width, canvas.height);
          ctx.restore();
        });
      }
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [map]);

  useEffect(() => {
    const layer = parseGeoJSON(TestJSON, map, "name 1");
    layer.style = {
      ...layer.style,
      lineStyle: {
        color: 'lightgreen',
        type: 'solid',
        width: 1
      },
      polygonStyle: {
        fillColor: 'blue',
        strokeColor: "black",
        strokeWidth: 2
      }

    }
    map.addLayer(layer);
  }, []);

  // Mouse interaction handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePosition(new Coordinate(event.clientX, event.clientY));
  };

  const debouncedHandleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && lastMousePosition) {
      const deltaX = (event.clientX - lastMousePosition.x) / map.scale;
      const deltaY = (lastMousePosition.y - event.clientY) / map.scale;

      const limitedDeltaX = Math.max(-10, Math.min(10, deltaX));
      const limitedDeltaY = Math.max(-10, Math.min(10, deltaY));

      map.move(-limitedDeltaX, -limitedDeltaY);
      setLastMousePosition(new Coordinate(event.clientX, event.clientY));
      drawCanvas();
    }

    setCurrentMousePosition(new Coordinate(event.clientX, event.clientY));
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    debouncedHandleMouseMove(event);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastMousePosition(null);
  };

  const handleWheel = (event: React.WheelEvent) => {
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    map.zoom(zoomFactor);
    drawCanvas();
  };

  return (
    <div className="relative overflow-hidden" style={{ width: canvasWidth, height: canvasHeight }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundColor: 'lightgray'
        }}
      />
      <div className="absolute bottom-0 left-0 w-full h-[25px] text-center bg-white pointer-events-none">
        {infoScreenString}
      </div>
    </div>
  );
}

export default App;