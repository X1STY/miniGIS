import { Coordinate } from '@/miniGIS/lib/models/coordinate';
import { Layer } from '@/miniGIS/lib/models/layer';

export type IEventType = 'scale' | 'changeLayers';

export class Map {
  private layers: Layer[];
  public center: Coordinate;
  public scale: number;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(center: Coordinate, canvasWidth: number, canvasHeight: number, scale?: number) {
    this.layers = [];
    this.center = center;
    this.scale = scale ?? 1;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }
  private observers: Array<(event: { type: IEventType; data: any }) => void> = [];

  addObserver(observer: (event: { type: IEventType; data: any }) => void) {
    this.observers.push(observer);
  }

  removeObserver(observer: (event: { type: IEventType; data: any }) => void) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  private notifyObservers(event: { type: IEventType; data: any }) {
    this.observers.forEach((observer) => observer(event));
  }
  public addLayer(layer: Layer): void {
    layer.setMap(this);
    this.layers.unshift(layer);
    const layerCenter = layer.getCenter();
    if (layerCenter) {
      this.center = layerCenter;
      this.scale = layer.getScaleToFit(this.canvasWidth, this.canvasHeight);
    }
    this.notifyObservers({ type: 'changeLayers', data: this.layers });
  }

  public getLayer(index: number): Layer | undefined {
    return this.layers[index];
  }

  public getLayers(): Layer[] {
    return this.layers;
  }

  public changeVisibilityNotify() {
    this.notifyObservers({ type: 'changeLayers', data: this.layers });
  }

  public changeScaleNotify() {
    this.notifyObservers({ type: 'scale', data: this.scale });
  }

  public removeLayer(layer: Layer) {
    const index = this.layers.findIndex((val) => val.id === layer.id);
    this.layers.splice(index, 1);
    this.notifyObservers({ type: 'changeLayers', data: this.layers });
  }

  public move(deltaX: number, deltaY: number): void {
    this.center.x += deltaX;
    this.center.y += deltaY;
  }

  public zoom(factor: number): void {
    this.scale *= factor;
    this.notifyObservers({ type: 'scale', data: this.scale * factor });
  }

  public moveLayer(currentIndex: number, newIndex: number): void {
    if (
      currentIndex < 0 ||
      currentIndex >= this.layers.length ||
      newIndex < 0 ||
      newIndex >= this.layers.length
    ) {
      throw new Error('Index out of bounds');
    }

    const [layer] = this.layers.splice(currentIndex, 1);
    this.layers.splice(newIndex, 0, layer);
    this.notifyObservers({ type: 'changeLayers', data: this.layers });
  }

  public worldToScreen(coordinate: Coordinate): Coordinate {
    const screenX = (coordinate.x - this.center.x) * this.scale + this.canvasWidth / 2;
    const screenY = this.canvasHeight / 2 - (coordinate.y - this.center.y) * this.scale;
    return new Coordinate(screenX, screenY);
  }

  public screenToWorld(coordinate: Coordinate): Coordinate {
    const worldX = (coordinate.x - this.canvasWidth / 2) / this.scale + this.center.x;
    const worldY = this.center.y - (coordinate.y - this.canvasHeight / 2) / this.scale;
    return new Coordinate(worldX, worldY);
  }

  public toString(): string {
    return `Map with ${this.layers.length} layers`;
  }

  public getScale(): number {
    return this.scale;
  }
}
