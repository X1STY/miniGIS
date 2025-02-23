import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { FontStyle } from '@/miniGIS/lib/models/style/font';

export class Text implements MapObject {
  private position: Coordinate;
  private content: string;
  layer?: Layer;
  style?: FontStyle;

  constructor(x: number, y: number, content: string) {
    this.position = new Coordinate(x, y);
    this.content = content;
    this.layer = undefined;
  }
  public draw(ctx: CanvasRenderingContext2D, map: Map): void {
    const screenCoord = map.worldToScreen(this.position);
    const { style: effectiveStyle } = this.getEffectiveStyle();

    ctx.fillStyle = effectiveStyle.color;
    ctx.font = `${effectiveStyle.size} ${effectiveStyle.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(this.content, screenCoord.x, screenCoord.y);
  }

  public getEffectiveStyle(): FontStyle {
    return (this.style || this.layer?.style?.fontStyle)!;
  }
  public getPosition(): Coordinate {
    return this.position;
  }

  public getContent(): string {
    return this.content;
  }

  public area(): number {
    return 0.0;
  }

  public length(): number {
    return 0.0;
  }

  public centroid(): Coordinate {
    return this.position;
  }

  public setLayer(layer: Layer): void {
    this.layer = layer;
  }

  public clone(): MapObject {
    return new Text(this.position.x, this.position.y, this.content);
  }

  public toString(): string {
    let result = `Text '${this.content}' at ${this.position.toString()}`;
    return result;
  }
  public getBounds(): { min: Coordinate; max: Coordinate } {
    return {
      min: new Coordinate(this.position.x, this.position.y),
      max: new Coordinate(this.position.x, this.position.y),
    };
  }

  public toPlainObject(): object {
    return {
      position: this.position.toJSON(),
      content: this.content,
    };
  }
}
