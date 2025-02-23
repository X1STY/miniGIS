import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { PolygonStyle, Style } from '@/miniGIS/lib/models/style';

export class Polygon implements MapObject {
  public exterior: Coordinate[];
  public holes?: Coordinate[][];
  layer?: Layer;
  style?: PolygonStyle;

  public getEffectiveStyle(): Style {
    return (this.style || this.layer?.style?.polygonStyle)!;
  }
  constructor(exterior: Coordinate[], style?: PolygonStyle) {
    this.exterior = exterior;
    this.holes = undefined;
    this.layer = undefined;
    this.style = style;
  }
  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    const style = this.getEffectiveStyle() as PolygonStyle;

    ctx.save();

    ctx.fillStyle = style.fillColor;
    ctx.beginPath();
    const firstScreenCoord = map.worldToScreen(this.exterior[0]);
    ctx.moveTo(firstScreenCoord.x, firstScreenCoord.y);

    for (let i = 1; i < this.exterior.length; i++) {
      const screenCoord = map.worldToScreen(this.exterior[i]);
      ctx.lineTo(screenCoord.x, screenCoord.y);
    }

    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    ctx.stroke();

    ctx.restore();
  }

  public addPoint(point: Coordinate): void {
    this.exterior.push(point);
  }

  public withHoles(holes: Coordinate[][]): Polygon {
    this.holes = holes;
    return this;
  }

  public area(): number {
    let sum = 0.0;
    const n = this.exterior.length - 1;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      sum += this.exterior[i].x * this.exterior[j].y;
      sum -= this.exterior[j].x * this.exterior[i].y;
    }

    return Math.abs(sum) / 2.0;
  }

  public length(): number {
    return this.exterior.reduce((sum, _, i) => {
      if (i === this.exterior.length - 1) return sum;
      return sum + this.exterior[i].distanceTo(this.exterior[i + 1]);
    }, 0);
  }
  public getBounds(): { min: Coordinate; max: Coordinate } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const point of this.exterior) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      min: new Coordinate(minX, minY),
      max: new Coordinate(maxX, maxY),
    };
  }

  public centroid(): Coordinate {
    let cx = 0.0;
    let cy = 0.0;
    const area = this.area();

    for (let i = 0; i < this.exterior.length - 1; i++) {
      const j = (i + 1) % (this.exterior.length - 1);
      const cross =
        this.exterior[i].x * this.exterior[j].y - this.exterior[j].x * this.exterior[i].y;
      cx += (this.exterior[i].x + this.exterior[j].x) * cross;
      cy += (this.exterior[i].y + this.exterior[j].y) * cross;
    }

    cx /= 6.0 * area;
    cy /= 6.0 * area;

    return new Coordinate(Math.abs(cx), Math.abs(cy));
  }

  public setLayer(layer: Layer): void {
    this.layer = layer;
  }

  public clone(): MapObject {
    return new Polygon(this.exterior.map((coord) => new Coordinate(coord.x, coord.y)));
  }

  public toString(): string {
    return `Polygon with ${this.exterior.length - 1} exterior points`;
  }
  public toPlainObject(): object {
    return {
      type: 'Polygon',
      exterior: this.exterior.map((coord) => coord.toJSON()),
      holes: this.holes ? this.holes.map((hole) => hole.map((coord) => coord.toJSON())) : null,
      layer: this.layer ? this.layer.name : null,
    };
  }
}
