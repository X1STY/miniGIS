import { Style } from '@/miniGIS/lib/models/style';

interface IPolygonStyle {
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export class PolygonStyle implements Style {
  public fillColor: string;
  public strokeColor: string;
  public strokeWidth: number;

  constructor(styles?: IPolygonStyle) {
    this.fillColor = styles?.fillColor ?? '#FFFFFF';
    this.strokeColor = styles?.strokeColor ?? '#000000';
    this.strokeWidth = styles?.strokeWidth ?? 1;
  }
}
