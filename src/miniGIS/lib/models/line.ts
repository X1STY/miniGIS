import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { LineStyle, Style } from '@/miniGIS/lib/models/style';

export class Line implements MapObject {
  public readonly coordinates: Coordinate[];
  layer: Layer | undefined;
  style?: LineStyle;
  private isSelected: boolean = false;

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
  }

  public getEffectiveStyle(): Style {
    if (this.isSelected) {
      return new LineStyle({
        color: '#ffc300',
        width: ((this.style || this.layer?.style?.lineStyle)?.width || 1) * 2,
        type: 'solid',
      });
    }
    return (this.style || this.layer?.style?.lineStyle)!;
  }

  constructor(coordinates: Coordinate[], style?: LineStyle) {
    if (coordinates.length < 2) {
      throw new Error('Line must have at least two points');
    }
    this.coordinates = coordinates;
    this.layer = undefined;
    this.style = style;
  }

  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    ctx.save();
    const style = this.getEffectiveStyle() as LineStyle;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;

    // Устанавливаем тип линии
    switch (style.type) {
      case 'solid':
        ctx.setLineDash([]);
        break;
      case 'dashed':
        ctx.setLineDash([style.width * 4, style.width * 2]);
        break;
      case 'dotted':
        ctx.setLineDash([style.width, style.width]);
        break;
      case 'dashdot':
        ctx.setLineDash([style.width * 4, style.width * 2, style.width, style.width * 2]);
        break;
      case 'longdash':
        ctx.setLineDash([style.width * 8, style.width * 4]);
        break;
      case 'doubledash':
        ctx.setLineDash([style.width * 4, style.width, style.width * 4, style.width * 4]);
        break;
    }

    ctx.beginPath();
    const startScreenCoord = map.worldToScreen(this.coordinates[0]);
    ctx.moveTo(startScreenCoord.x, startScreenCoord.y);
    for (let i = 1; i < this.coordinates.length; i++) {
      const screenCoord = map.worldToScreen(this.coordinates[i]);
      ctx.lineTo(screenCoord.x, screenCoord.y);
    }
    ctx.stroke();

    ctx.restore();
  }

  public area(): number {
    return 0.0;
  }

  public length(): number {
    let length = 0;
    for (let i = 1; i < this.coordinates.length; i++) {
      length += this.coordinates[i - 1].distanceTo(this.coordinates[i]);
    }
    return length;
  }

  public centroid(): Coordinate {
    let sumX = 0;
    let sumY = 0;
    for (const coord of this.coordinates) {
      sumX += coord.x;
      sumY += coord.y;
    }
    return new Coordinate(sumX / this.coordinates.length, sumY / this.coordinates.length);
  }

  public setLayer(layer: Layer): void {
    this.layer = layer;
  }

  public clone(): MapObject {
    return new Line([...this.coordinates]);
  }

  public getBounds(): { min: Coordinate; max: Coordinate } {
    let minX = this.coordinates[0].x;
    let minY = this.coordinates[0].y;
    let maxX = this.coordinates[0].x;
    let maxY = this.coordinates[0].y;

    for (const coord of this.coordinates) {
      minX = Math.min(minX, coord.x);
      minY = Math.min(minY, coord.y);
      maxX = Math.max(maxX, coord.x);
      maxY = Math.max(maxY, coord.y);
    }

    return {
      min: new Coordinate(minX, minY),
      max: new Coordinate(maxX, maxY),
    };
  }

  public toString(): string {
    return `Line with points ${this.coordinates.map((coord) => coord.toString()).join(', ')}`;
  }

  public toPlainObject(): object {
    return {
      type: 'Line',
      coordinates: this.coordinates.map((coord) => coord.toJSON()),
      layer: this.layer ? this.layer.name : null,
    };
  }

  public containsPoint(point: Coordinate, map?: Map): boolean {
    const baseThreshold = ((this.style || this.layer?.style?.lineStyle)?.width || 1) / 2;
    // Увеличиваем область выделения при уменьшении масштаба
    const threshold = map ? baseThreshold / map.scale : baseThreshold;

    for (let i = 0; i < this.coordinates.length - 1; i++) {
      const start = this.coordinates[i];
      const end = this.coordinates[i + 1];

      // Вычисляем расстояние от точки до отрезка
      const length = start.distanceTo(end);
      if (length === 0) continue;

      const t = Math.max(
        0,
        Math.min(
          1,
          ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
            (length * length)
        )
      );

      const projection = new Coordinate(
        start.x + t * (end.x - start.x),
        start.y + t * (end.y - start.y)
      );

      if (point.distanceTo(projection) <= threshold) {
        return true;
      }
    }
    return false;
  }
}
