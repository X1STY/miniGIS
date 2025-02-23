import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { Map } from '@/miniGIS/lib/models/map';
import { Style } from '@/miniGIS/lib/models/style';

export abstract class MapObject {
  abstract layer?: Layer;
  abstract style?: Style;

  abstract area(): number;
  abstract length(): number;
  abstract centroid(): Coordinate;
  abstract setLayer(layer: Layer): void;
  abstract clone(): MapObject;
  abstract toPlainObject(): object;
  abstract getBounds(): { min: Coordinate; max: Coordinate };
  abstract draw(
    ctx: CanvasRenderingContext2D,
    map: Map,
    canvasWidth: number,
    canvasHeight: number
  ): void;
  public getEffectiveStyle(): Style {
    return (this.style || this.layer?.style)!;
  }
}
