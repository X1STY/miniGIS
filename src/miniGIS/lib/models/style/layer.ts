import { FontStyle } from '@/miniGIS/lib/models/style/font';
import { LineStyle } from '@/miniGIS/lib/models/style/line';
import { PointStyle } from '@/miniGIS/lib/models/style/point';
import { PolygonStyle } from '@/miniGIS/lib/models/style/polygon';
import { Style } from '@/miniGIS/lib/models/style/style';

interface ILayerStyle {
  lineStyle?: LineStyle;
  polygonStyle?: PolygonStyle;
  pointStyle?: PointStyle;
  fontStyle?: FontStyle;
}

export class LayerStyle implements Style {
  public lineStyle?: LineStyle;
  public polygonStyle?: PolygonStyle;
  public pointStyle?: PointStyle;
  public fontStyle?: FontStyle;

  constructor(styles?: ILayerStyle) {
    this.lineStyle = styles?.lineStyle || new LineStyle();
    this.polygonStyle = styles?.polygonStyle || new PolygonStyle();
    this.pointStyle = styles?.pointStyle || new PointStyle();
    this.fontStyle = styles?.fontStyle || new FontStyle();
  }
}
