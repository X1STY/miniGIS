import { IEventType, Map } from '@/miniGIS/lib/models/map';
import { useEffect, useState } from 'react';

export const useNotificationsEvent = (map: Map, redraw: () => void) => {
  const [scale, setScale] = useState<number>(map.scale);
  const [_, serLayerVer] = useState<number>(0);
  useEffect(() => {
    const handleMapChange = (event: { type: IEventType; data: any }) => {
      switch (event.type) {
        case 'scale': {
          setScale(event.data);
          redraw();
          break;
        }
        case 'changeLayers': {
          serLayerVer((prev) => prev + 1);
          redraw();
          break;
        }
      }
    };

    map.addObserver(handleMapChange);

    return () => {
      map.removeObserver(handleMapChange);
    };
  }, []);

  return {
    scale,
  };
};
