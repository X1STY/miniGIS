import { MapObject } from '@/miniGIS/lib/models/map_object';
import { Coordinate } from './coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { PointStyle, Style } from '@/miniGIS/lib/models/style';
import { Map } from '@/miniGIS/lib/models/map';

export class Point implements MapObject {
  public coordinate: Coordinate;
  layer?: Layer;
  style?: PointStyle;
  private isSelected: boolean = false;

  constructor(x: number, y: number, style?: PointStyle) {
    this.coordinate = new Coordinate(x, y);
    this.layer = undefined;
    this.style = style;
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  public getEffectiveStyle(): Style {
    if (this.isSelected) {
      const currentStyle = this.style || this.layer?.style?.pointStyle;
      return new PointStyle({
        color: '#ffc300',
        size: (currentStyle?.size || 1) * 1.5,
        symbolCode: currentStyle?.symbolCode,
      });
    }
    return (this.style || this.layer?.style?.pointStyle)!;
  }

  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    const screenCoord = map.worldToScreen(this.coordinate);
    const style = this.getEffectiveStyle() as PointStyle;

    ctx.save();
    ctx.font = `${style.size * 2}px Webdings`;
    ctx.fillStyle = style.color;

    const text = String.fromCharCode(style.symbolCode);
    const metrics = ctx.measureText(text);
    const actualHeight = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;
    const offsetX = metrics.width / 2;
    const offsetY = actualHeight / 2;
    console.log(screenCoord, metrics);
    ctx.fillText(text, screenCoord.x - offsetX, screenCoord.y + offsetY);
    ctx.restore();
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

  public containsPoint(point: Coordinate, map?: Map): boolean {
    const baseThreshold = (this.getEffectiveStyle() as PointStyle).size || 1;
    const scaledThreshold = map ? baseThreshold / map.scale : baseThreshold;
    return this.coordinate.distanceTo(point) <= scaledThreshold;
  }
}
