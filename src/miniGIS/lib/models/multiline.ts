import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { Line } from '@/miniGIS/lib/models/line';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { LineStyle, Style } from '@/miniGIS/lib/models/style';

export class Multiline implements MapObject {
  public lines: Line[];
  layer?: Layer;
  style?: LineStyle;

  public getEffectiveStyle(): Style {
    return (this.style || this.layer?.style)!;
  }

  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    const style = this.getEffectiveStyle() as LineStyle;
    ctx.save();
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;

    this.lines.forEach((line) => {
      ctx.beginPath();
      const startScreenCoord = map.worldToScreen(line.coordinates[0]);
      ctx.moveTo(startScreenCoord.x, startScreenCoord.y);
      for (let i = 1; i < line.coordinates.length; i++) {
        const screenCoord = map.worldToScreen(line.coordinates[i]);
        ctx.lineTo(screenCoord.x, screenCoord.y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  getBounds(): { min: Coordinate; max: Coordinate } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.lines.forEach((line) => {
      for (const coord of line.coordinates) {
        minX = Math.min(minX, coord.x);
        minY = Math.min(minY, coord.y);
        maxX = Math.max(maxX, coord.x);
        maxY = Math.max(maxY, coord.y);
      }
    });

    return {
      min: new Coordinate(minX, minY),
      max: new Coordinate(maxX, maxY),
    };
  }

  constructor(lines: Line[]) {
    if (lines.length === 0) {
      throw new Error('Multiline must contain at least one line');
    }
    this.lines = lines;
    this.layer = undefined;
  }
  clone(): MapObject {
    throw new Error('Method not implemented.');
  }

  public area(): number {
    return 0.0;
  }

  public length(): number {
    return this.lines.reduce((sum, line) => sum + line.length(), 0);
  }

  public centroid(): Coordinate {
    const totalLength = this.length();
    const { sumX, sumY } = this.lines.reduce(
      (acc, line) => {
        const cl = line.centroid();
        const lineLength = line.length();
        return {
          sumX: acc.sumX + cl.x * lineLength,
          sumY: acc.sumY + cl.y * lineLength,
        };
      },
      { sumX: 0.0, sumY: 0.0 }
    );

    return new Coordinate(sumX / totalLength, sumY / totalLength);
  }

  public setLayer(layer: Layer): void {
    this.layer = layer;
    for (const line of this.lines) {
      line.setLayer(layer);
    }
  }

  public toString(): string {
    let result = `Multiline with ${this.lines.length} segments:`;
    this.lines.forEach((line, i) => {
      result += `\n  Segment ${i + 1}: ${line.coordinates.map((coord) => coord.toString()).join(' to ')}`;
    });
    return result;
  }

  public toPlainObject(): object {
    return {
      type: 'Multiline',
      lines: this.lines.map((line) => line.toPlainObject()),
      layer: this.layer ? this.layer.name : null,
    };
  }
}
