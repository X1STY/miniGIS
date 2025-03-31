import { Style } from '@/miniGIS/lib/models/style';

export interface IPointStyle {
  color?: string;
  size?: number;
  symbolCode?: number;
}

export class PointStyle implements Style {
  public color: string;
  public size: number;
  public symbolCode: number;

  constructor(style?: IPointStyle) {
    this.color = style?.color ?? '#FEFEFE';
    this.size = style?.size ?? 1;
    this.symbolCode = style?.symbolCode ?? 0x6e;
  }
}
