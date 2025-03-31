import { Coordinate, Layer, Line } from "@/miniGIS/lib/models";
import "./App.css";
import { useEffect, useState } from "react";
import { useDrawMap } from "@/miniGIS/events/drawMap";
import { useMapInteractions } from "@/miniGIS/events/mapInteractions";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Icon from "@mdi/react";
import { mdiDelete, mdiDrag, mdiEye, mdiEyeOff, mdiPalette } from "@mdi/js";
import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { LayerStyleEditor } from "./miniGIS/components/LayerStyleEditor";
import { LayerStyle } from "@/miniGIS/lib/models/style/layer";
import { parseGeoJSON } from "@/miniGIS/lib/parser";

const PASTEL_COLORS = [
  '#FFB3BA',
  '#BAFFC9',
  '#BAE1FF',
  '#FFFFBA',
  '#E2BAFF',
  '#FFD1BA',
  '#F0FFF0',
  '#FFE4E1',
];

const getRandomPastelColor = () => {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
};

function App() {
  const { canvasRef, canvasHeight, canvasWidth, map, drawCanvas } = useDrawMap();
  const [editingLayer, setEditingLayer] = useState<Layer | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleModalMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.modal-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - modalPosition.x,
        y: e.clientY - modalPosition.y
      });
    }
  };

  const handleModalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleModalMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(()=> {
    const lines1 = new Line([
      new Coordinate(0, 0),
      new Coordinate(5, 0)
    ])
    const lines2 = new Line([
      new Coordinate(0, 0),
      new Coordinate(-5, 0)
    ])
    const lines3 = new Line([
      new Coordinate(0, 0),
      new Coordinate(0, 35)
    ])
    const lines4 = new Line([
      new Coordinate(0, 0),
      new Coordinate(0, -5)
    ])
    const layer = new Layer("sadsa");
    layer.addGeometry(lines1);
    layer.addGeometry(lines2);

    layer.addGeometry(lines3);

    layer.addGeometry(lines4);

    map.current.addLayer(layer);

  }, [])

  useEffect(() => {
    if (editingLayer) {
      // При открытии окна центрируем его
      setModalPosition({
        x: window.innerWidth / 2 - 200,
        y: window.innerHeight / 2 - 200
      });
    }
  }, [editingLayer]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 100 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { infoScreenString, selectedFeatures, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDragEnd, clearSelected } =
    useMapInteractions(map.current, drawCanvas, canvasRef);

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'GeoJSON',
          extensions: ['geojson', 'json']
        }]
      });
      
      if (selected) {
        const content = await invoke('open_geojson_file', { path: selected });
        const jsonData = JSON.parse(content as string);
        const layer = parseGeoJSON(jsonData, selected.toString().split('/').pop()?.split('\\').pop()?.split('.')[0] || 'New Layer');
        const randomColor = getRandomPastelColor();
        layer.style = {
          lineStyle: { color: '#023047', type: 'solid', width: 2 },
          polygonStyle: { fillColor: randomColor, strokeColor: '#000', strokeWidth: 1 },
          pointStyle: { color: 'black', size: 1, symbolCode: 0x6E }
        };
        map.current.addLayer(layer);
        drawCanvas();
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

 
  const handleStyleChange = (layer: Layer, newStyle: LayerStyle) => {
    layer.style = newStyle;
    drawCanvas();
  };

  return (
    <div className="flex flex-row rounded-2xl">
      <div className="relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={map.current.getLayers().map((layer) => layer.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-[250px] h-screen bg-white flex flex-col gap-8 p-4">
              <button
                onClick={handleOpenFile}
                className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600"
              >
                Открыть GeoJSON
              </button>
              {map.current.getLayers().map((layer) => (
                <SortableLayer 
                  key={layer.id} 
                  layer={layer} 
                  handleClick={() => {
                    map.current.center = layer.getCenter()!;
                    map.current.scale = layer.getScaleToFit(canvasWidth, canvasHeight);
                    map.current.changeScaleNotify();
                    drawCanvas();
                  }}
                  onEditStyle={() => setEditingLayer(layer)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {selectedFeatures.length > 0 && 
          <button onClick={clearSelected} className="absolute bottom-10 cursor-pointer left-1/2 -translate-x-1/2 rounded-3xl text-white h-[50px] bg-black/70 w-full">
            Удалить выделенное
          </button>
        }
      </div>
      <div className="relative overflow-hidden" style={{ width: canvasWidth, height: canvasHeight }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
        <div className="absolute bottom-0 rounded-t left-0 w-full h-[25px] text-center bg-white pointer-events-none">
          {infoScreenString}
        </div>
      </div>
      {editingLayer && (
        <div 
          className="fixed z-50"
          style={{ 
            left: modalPosition.x,
            top: modalPosition.y,
            cursor: isDragging ? 'grabbing' : 'auto'
          }}
          onMouseDown={handleModalMouseDown}
          onMouseMove={handleModalMouseMove}
          onMouseUp={handleModalMouseUp}
          onMouseLeave={handleModalMouseUp}
        >
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[400px]">
            <div className="flex justify-between items-center mb-4 modal-header cursor-grab">
              <h3 className="text-lg font-medium select-none">Редактирование стиля слоя: {editingLayer.name}</h3>
              <button
                onClick={() => setEditingLayer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <LayerStyleEditor
              layer={editingLayer}
              onStyleChange={(newStyle) => handleStyleChange(editingLayer, newStyle)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const SortableLayer = ({ layer, handleClick, onEditStyle }: { layer: Layer; handleClick: () => void; onEditStyle: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: layer.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-row items-center justify-between border border-[#e0e0e0] bg-[#b5e48c] p-1 rounded cursor-grab"
      {...attributes}
      {...listeners}
    >
        <Icon path={mdiDrag} size={2}/>
      <div className="w-full cursor-pointer" onClick={handleClick}>{layer.name}</div>
      <section className="inline-flex gap-1" >
        <button type='button' className="z-10 cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          layer.changeVisibility()
        }}>
          <Icon path={layer.isVisible ? mdiEye : mdiEyeOff} size={1}/>
        </button>
        <button type='button' className="z-10 cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onEditStyle();
        }}>
          <Icon path={mdiPalette} size={1}/>
        </button>
        <button type='button' className="z-10 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault()
            layer.map?.removeLayer(layer)
          }}>
          <Icon path={mdiDelete} size={1} color='#f08080'/>
        </button>
      </section>
    </div>
  );
};

export default App;