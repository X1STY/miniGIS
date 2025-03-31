import { Layer } from '@/miniGIS/lib/models/layer';
import { FontStyle } from '@/miniGIS/lib/models/style/font';
import { LineStyle } from '@/miniGIS/lib/models/style/line';
import { PointStyle } from '@/miniGIS/lib/models/style/point';
import { PolygonStyle } from '@/miniGIS/lib/models/style/polygon';
import { LayerStyle } from '@/miniGIS/lib/models/style/layer';
import { useEffect, useState } from 'react';

interface LayerStyleEditorProps {
  layer: Layer;
  onStyleChange: (style: LayerStyle) => void;
}

export const LayerStyleEditor = ({ layer, onStyleChange }: LayerStyleEditorProps) => {
  const [activeTab, setActiveTab] = useState<'point' | 'line' | 'polygon' | 'text'>('point');
  
  const [pointStyle, setPointStyle] = useState({
    color: layer.style?.pointStyle?.color || '#FEFEFE',
    size: layer.style?.pointStyle?.size || 1,
    symbolCode: layer.style?.pointStyle?.symbolCode || 0x6E
  });

  const [lineStyle, setLineStyle] = useState({
    color: layer.style?.lineStyle?.color || '#000000',
    width: layer.style?.lineStyle?.width || 1,
    type: layer.style?.lineStyle?.type || 'solid'
  });

  const [polygonStyle, setPolygonStyle] = useState({
    fillColor: layer.style?.polygonStyle?.fillColor || '#FFFFFF',
    strokeColor: layer.style?.polygonStyle?.strokeColor || '#000000',
    strokeWidth: layer.style?.polygonStyle?.strokeWidth || 1
  });

  const [fontStyle, setFontStyle] = useState({
    size: layer.style?.fontStyle?.style.size || '12px',
    fontFamily: layer.style?.fontStyle?.style.fontFamily || 'Arial',
    color: layer.style?.fontStyle?.style.color || '#000000',
    char: layer.style?.fontStyle?.style.char || 0x3d
  });

  useEffect(() => {
    setPointStyle({
      color: layer.style?.pointStyle?.color || '#FEFEFE',
      size: layer.style?.pointStyle?.size || 1,
      symbolCode: layer.style?.pointStyle?.symbolCode || 0x6E
    });
    setLineStyle({
      color: layer.style?.lineStyle?.color || '#000000',
      width: layer.style?.lineStyle?.width || 1,
      type: layer.style?.lineStyle?.type || 'solid'
    });
    setPolygonStyle({
      fillColor: layer.style?.polygonStyle?.fillColor || '#FFFFFF',
      strokeColor: layer.style?.polygonStyle?.strokeColor || '#000000',
      strokeWidth: layer.style?.polygonStyle?.strokeWidth || 1
    });
    setFontStyle({
      size: layer.style?.fontStyle?.style.size || '12px',
      fontFamily: layer.style?.fontStyle?.style.fontFamily || 'Arial',
      color: layer.style?.fontStyle?.style.color || '#000000',
      char: layer.style?.fontStyle?.style.char || 0x3d
    });
  }, [layer]);

  const handlePointStyleChange = (update: Partial<typeof pointStyle>) => {
    const newStyle = { ...pointStyle, ...update };
    setPointStyle(newStyle);
    onStyleChange(new LayerStyle({
      ...layer.style,
      pointStyle: new PointStyle({
        color: newStyle.color,
        size: newStyle.size,
        symbolCode: newStyle.symbolCode
      })
    }));
  };

  const handleLineStyleChange = (update: Partial<typeof lineStyle>) => {
    const newStyle = { ...lineStyle, ...update };
    setLineStyle(newStyle);
    onStyleChange(new LayerStyle({
      ...layer.style,
      lineStyle: new LineStyle(newStyle)
    }));
  };

  const handlePolygonStyleChange = (update: Partial<typeof polygonStyle>) => {
    const newStyle = { 
      ...polygonStyle, 
      ...update,
      strokeWidth: update.strokeWidth ? Math.min(5, update.strokeWidth) : polygonStyle.strokeWidth
    };
    setPolygonStyle(newStyle);
    onStyleChange(new LayerStyle({
      ...layer.style,
      polygonStyle: new PolygonStyle(newStyle)
    }));
  };

  const handleFontStyleChange = (update: Partial<typeof fontStyle>) => {
    const newStyle = { ...fontStyle, ...update };
    setFontStyle(newStyle);
    onStyleChange(new LayerStyle({
      ...layer.style,
      fontStyle: new FontStyle(newStyle)
    }));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${activeTab === 'point' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('point')}
        >
          Точка
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('line')}
        >
          Линия
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'polygon' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('polygon')}
        >
          Полигон
        </button>
        <button
          className={`px-3 py-1 rounded ${activeTab === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('text')}
        >
          Текст
        </button>
      </div>

      {activeTab === 'point' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Цвет точки</label>
            <input
              type="color"
              value={pointStyle.color}
              onChange={(e) => handlePointStyleChange({ color: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Размер точки</label>
            <input
              type="number"
              value={pointStyle.size}
              onChange={(e) => handlePointStyleChange({ size: Number(e.target.value) })}
              className="mt-1 p-2 block w-full rounded-md border-gray-300"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Символ</label>
            <div className="h-[200px] overflow-y-auto mt-2 border rounded-md">
              <div className="grid grid-cols-8 gap-1 p-2">
                {Array.from({ length: 0xFF - 0x21 + 1 }, (_, i) => 0x21 + i).map((code) => (
                  <button
                    key={code}
                    onClick={() => handlePointStyleChange({ symbolCode: code })}
                    className={`p-1 rounded-md border aspect-square flex flex-col items-center justify-center ${
                      pointStyle.symbolCode === code ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <div 
                      className="text-xl leading-none"
                      style={{ 
                        color: pointStyle.color,
                        fontFamily: 'Webdings'
                      }}
                    >
                      {String.fromCharCode(code)}
                    </div>
                    <div className="text-[8px] text-gray-500 mt-1">
                      {`0x${code.toString(16).toUpperCase()}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'line' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Цвет линии</label>
            <input
              type="color"
              value={lineStyle.color}
              onChange={(e) => handleLineStyleChange({ color: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Толщина линии</label>
            <input
              type="number"
              value={lineStyle.width}
              onChange={(e) => handleLineStyleChange({ width: Number(e.target.value) })}
              className="mt-1 p-2 block w-full rounded-md border-gray-300"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Тип линии</label>
            <select
              value={lineStyle.type}
              onChange={(e) => handleLineStyleChange({ type: e.target.value as 'solid' | 'dashed' | 'dotted' | 'dashdot' | 'longdash' | 'doubledash' })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="solid">Сплошная <div className='h-full w-[150px] border-solid border-t border-black mt-auto'/> </option>
              <option value="dashed">Пунктирная</option>
              <option value="dotted">Точечная</option>
              <option value="dashdot">Штрих-пунктирная</option>
              <option value="longdash">Длинное тире</option>
              <option value="doubledash">Двойное тире</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'polygon' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Цвет заливки</label>
            <input
              type="color"
              value={polygonStyle.fillColor}
              onChange={(e) => handlePolygonStyleChange({ fillColor: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Цвет обводки</label>
            <input
              type="color"
              value={polygonStyle.strokeColor}
              onChange={(e) => handlePolygonStyleChange({ strokeColor: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Толщина обводки</label>
            <input
              type="number"
              value={polygonStyle.strokeWidth}
              onChange={(e) => handlePolygonStyleChange({ strokeWidth: Number(e.target.value) })}
              className="mt-1 p-2 block w-full rounded-md border-gray-300"
              min="1"
              max="5"
            />
          </div>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Размер шрифта</label>
            <input
              type="text"
              value={fontStyle.size}
              onChange={(e) => handleFontStyleChange({ size: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Семейство шрифта</label>
            <input
              type="text"
              value={fontStyle.fontFamily}
              onChange={(e) => handleFontStyleChange({ fontFamily: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Цвет текста</label>
            <input
              type="color"
              value={fontStyle.color}
              onChange={(e) => handleFontStyleChange({ color: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}; 