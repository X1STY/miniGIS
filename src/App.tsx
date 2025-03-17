import {  Layer } from "@/miniGIS/lib/models";
import "./App.css";
import {  useEffect} from "react";
import TestJSON from '@/miniGIS/test/tomsk.json';
import Test2JSON from '@/miniGIS/test/world.json';
import { parseGeoJSON } from "@/miniGIS/lib/parser";
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
import { mdiDelete, mdiEye, mdiEyeOff } from "@mdi/js";

function App() {
  const { canvasRef, canvasHeight,canvasWidth, map, drawCanvas } = useDrawMap();

  useEffect(() => {
    const layer = parseGeoJSON(TestJSON, "tomsk");
    layer.style = {
      lineStyle: { color: '#023047', type: 'solid', width: 2 },
      polygonStyle: { fillColor: '#2a9d8f', strokeColor: '#000', strokeWidth: 1 },
    };
    const layer2 = parseGeoJSON(Test2JSON, "world");
    layer2.style = {
      lineStyle: { color: 'black', type: 'solid', width: 8 },
      polygonStyle: { fillColor: '#3D62C1', strokeColor: '#000', strokeWidth: 2 },
      pointStyle: {color: 'white', size: 0}
    };
    map.current.addLayer(layer2);
    map.current.addLayer(layer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {delay: 100, tolerance: 100}
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  

  const { infoScreenString, selectedFeatures, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleDragEnd, clearSelected } =
    useMapInteractions(map.current, drawCanvas, canvasRef);

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
            <div className="w-[200px] h-screen bg-white flex flex-col gap-8 p-4">
              {map.current.getLayers().map((layer) => (
                <SortableLayer key={layer.id} layer={layer} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        { selectedFeatures.length > 0 && 
          <button onClick={clearSelected} className="absolute bottom-10 cursor-pointer left-1/2 -translate-x-1/2 rounded-3xl text-white h-[50px] bg-black/70 w-full">Удалить выделенное</button>
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
          style={{ backgroundColor: '#F5D1D8', borderRadius: '8px' }}
        />
        <div className="absolute bottom-0 rounded-t left-0 w-full h-[25px] text-center bg-white pointer-events-none">
          {infoScreenString}
        </div>
      </div>
    </div>
  );
}

const SortableLayer = ({ layer }: {layer: Layer}) => {
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
      className="flex flex-row items-center justify-between border border-[#e0e0e0] bg-[#b5e48c] p-1 rounded"
      {...attributes}
      {...listeners}
    >
      <div className="w-full cursor-grab">{layer.name}</div>
      <section className="inline-flex gap-1" >
        <button type='button' className="z-10 cursor-pointer"  onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          layer.changeVisibility()
        } }>
          <Icon path={layer.isVisible ? mdiEye : mdiEyeOff} size={1}/>
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