import { MapObject } from '@/miniGIS/lib/models/map_object';
import { Coordinate } from './coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { PointStyle, Style } from '@/miniGIS/lib/models/style';
import { Map } from '@/miniGIS/lib/models/map';

export class Point implements MapObject {
  public coordinate: Coordinate;
  layer?: Layer;
  style?: PointStyle;

  constructor(x: number, y: number, style?: PointStyle) {
    this.coordinate = new Coordinate(x, y);
    this.layer = undefined;
    this.style = style;
  }
  public getEffectiveStyle(): Style {
    return (this.style || this.layer?.style?.pointStyle)!;
  }
  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    const screenCoord = map.worldToScreen(this.coordinate);
    const style = this.getEffectiveStyle() as PointStyle;

    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(screenCoord.x, screenCoord.y, style.size, 0, Math.PI * 2);
    ctx.fill();
  }

  public area(): number {
    return 0.0;
  }

  public length(): number {
    return 0.0;
  }

  public centroid(): Coordinate {
    return this.coordinate;
  }

  public getBounds(): { min: Coordinate; max: Coordinate } {
    return {
      min: new Coordinate(this.coordinate.x, this.coordinate.y),
      max: new Coordinate(this.coordinate.x, this.coordinate.y),
    };
  }

  public setLayer(layer: Layer): void {
    this.layer = layer;
  }

  public clone(): MapObject {
    return new Point(this.coordinate.x, this.coordinate.y);
  }

  public toString(): string {
    return `Point at ${this.coordinate.toString()} in layer ${this.layer?.name}`;
  }
  public toPlainObject(): object {
    return {
      type: 'Point',
      coordinate: this.coordinate.toJSON(),
      layer: this.layer ? this.layer.name : null,
    };
  }
}
