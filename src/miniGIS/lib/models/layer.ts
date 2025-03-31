import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Map } from '@/miniGIS/lib/models/map';
import { MapObject } from '@/miniGIS/lib/models/map_object';
import { LayerStyle } from '@/miniGIS/lib/models/style/layer';
import _ from 'lodash';

export class Layer {
  public id: string;
  public name: string;
  public readonly geometries: MapObject[];
  public isVisible: boolean;
  public style?: LayerStyle;
  public map?: Map;

  constructor(name: string, style?: LayerStyle) {
    this.name = name;
    this.geometries = [];
    this.isVisible = true;
    this.style = style ?? new LayerStyle();
    this.id = crypto.randomUUID();
  }

  public addGeometry<T extends MapObject>(geometry: T): void {
    geometry.setLayer(this);
    this.geometries.push(geometry);
  }
  public getIsVisivble = () => this.isVisible;
  public removeGeometry(index: number): MapObject | undefined {
    if (index < this.geometries.length) {
      return this.geometries.splice(index, 1)[0];
    }
    return undefined;
  }

  public getGeometry(index: number): MapObject | undefined {
    return this.geometries[index];
  }

  public totalArea(): number {
    return this.geometries.reduce((sum, g) => sum + g.area(), 0);
  }

  public totalLength(): number {
    return this.geometries.reduce((sum, g) => sum + g.length(), 0);
  }

  public centroids(): Coordinate[] {
    return this.geometries.map((g) => g.centroid());
  }

  public getCenter(): Coordinate | undefined {
    const centroids = this.centroids();
    if (centroids.length === 0) {
      return undefined;
    }

    const sumX = centroids.reduce((sum, c) => sum + c.x, 0);
    const sumY = centroids.reduce((sum, c) => sum + c.y, 0);
    const centerX = sumX / centroids.length;
    const centerY = sumY / centroids.length;

    return new Coordinate(centerX, centerY);
  }

  public getScaleToFit(canvasWidth: number, canvasHeight: number): number {
    if (this.geometries.length === 0) {
      return 1;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const geometry of this.geometries) {
      const bounds = geometry.getBounds();
      minX = Math.min(minX, bounds.min.x);
      minY = Math.min(minY, bounds.min.y);
      maxX = Math.max(maxX, bounds.max.x);
      maxY = Math.max(maxY, bounds.max.y);
    }

    const layerWidth = maxX - minX;
    const layerHeight = maxY - minY;

    const scaleX = canvasWidth / layerWidth;
    const scaleY = canvasHeight / layerHeight;

    return Math.min(scaleX, scaleY);
  }

  public changeVisibility(): void {
    this.isVisible = !this.isVisible;
    if (this.map) this.map.changeVisibilityNotify();
  }

  public toString(): string {
    return `Layer(name: ${this.name}, isVisible: ${this.isVisible}, geometryCount: ${this.geometries.length})`;
  }
  public setMap(map: Map) {
    this.map = map;
  }
  public toPlainObject(): object {
    return {
      name: this.name,
      isVisible: this.isVisible,
      style: this.style,
      geometries: this.geometries.map((geometry) => geometry.toPlainObject()),
    };
  }

  public draw(bufferCtx: CanvasRenderingContext2D, map: Map, width: number, height: number) {
    if (this.isVisible) {
      const geoms = this.geometries;
      const geometriesByType = _.groupBy(geoms, (g) => g.constructor.name);

      Object.entries(geometriesByType).forEach(([_, geometries]) => {
        bufferCtx.save();
        geometries.forEach((geom) => {
          geom.draw(bufferCtx, map, width, height);
        });
        bufferCtx.restore();
      });
    }
  }
}
