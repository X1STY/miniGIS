import { useNotificationsEvent } from '@/miniGIS/events/handleObservers';
import { Coordinate, Point, Line, Polygon } from '@/miniGIS/lib';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { DragEndEvent } from '@dnd-kit/core';
import _ from 'lodash';
import { RefObject, useMemo, useRef, useState } from 'react';

export const useMapInteractions = (
  map: Map,
  drawCanvas: () => void,
  canvasRef: RefObject<HTMLCanvasElement>
) => {
  const [_, setRerender] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<MapObject[]>([]);
  const { scale } = useNotificationsEvent(map, drawCanvas);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<Coordinate | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<Coordinate>(
    new Coordinate(map.center.x, map.center.y)
  );
  const lastMouseMoveTime = useRef(performance.now());

  const lastMouseWorld = useMemo(() => {
    return map.screenToWorld(currentMousePosition);
  }, [currentMousePosition, map]);

  const infoScreenString = useMemo(() => {
    return `X: ${lastMouseWorld.x.toFixed(4)}\t\t Y: ${lastMouseWorld.y.toFixed(4)}\t\t Scale: ${scale.toFixed(4)}`;
  }, [lastMouseWorld, map, scale]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastMousePosition(new Coordinate(event.clientX, event.clientY));

    const rect = canvasRef.current!.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const worldPoint = map.screenToWorld(new Coordinate(screenX, screenY));

    const layers = map.getLayers();
    let foundObj: MapObject | null = null;

    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (!layer.isVisible) continue;

      for (let j = layer.geometries.length - 1; j >= 0; j--) {
        const obj = layer.geometries[j];
        if (obj instanceof Point && obj.containsPoint(worldPoint, map)) {
          foundObj = obj;
          break;
        }
        if (obj instanceof Line && obj.containsPoint(worldPoint, map)) {
          foundObj = obj;
          break;
        }
        if (obj instanceof Polygon && obj.containsPoint(worldPoint)) {
          foundObj = obj;
          break;
        }
      }
      if (foundObj) break;
    }

    if (foundObj) {
      const ctrlPressed = event.ctrlKey || event.metaKey;
      const shiftPressed = event.shiftKey;

      let newSelected: Set<MapObject> = new Set(selectedFeatures);

      if (ctrlPressed && shiftPressed) {
        newSelected.add(foundObj);
      } else if (ctrlPressed) {
        newSelected = new Set([foundObj]);
      }

      setSelectedFeatures((prevSelected) => {
        prevSelected.forEach((obj) => obj.setSelected(false));
        newSelected.forEach((obj) => obj.setSelected(true));
        drawCanvas();
        return Array.from(newSelected);
      });
    }
  };

  const clearSelected = () => {
    setSelectedFeatures((prevSelected) => {
      prevSelected.forEach((obj) => obj.setSelected(false));
      drawCanvas();
      return [];
    });
    setRerender((prev) => prev + 1);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const now = performance.now();
    if (now - lastMouseMoveTime.current < 16) return;
    lastMouseMoveTime.current = now;

    if (isDragging && lastMousePosition) {
      const deltaX = (event.clientX - lastMousePosition.x) / map.scale;
      const deltaY = -(lastMousePosition.y - event.clientY) / map.scale;

      map.move(Math.max(-10, Math.min(10, -deltaX)), Math.max(-10, Math.min(10, deltaY)));
      setLastMousePosition(new Coordinate(event.clientX, event.clientY));
      drawCanvas();
    }

    setCurrentMousePosition(new Coordinate(event.clientX, event.clientY));
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const layers = map.getLayers();
    const oldIndex = layers.findIndex((l) => l.id === active.id);
    const newIndex = layers.findIndex((l) => l.id === over.id);

    map.moveLayer(oldIndex, newIndex);
  };

  return {
    infoScreenString,
    selectedFeatures,
    handleMouseDown,
    handleWheel,
    handleMouseUp,
    handleMouseMove,
    handleDragEnd,
    clearSelected,
  };
};
