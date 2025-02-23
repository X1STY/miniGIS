import { Style } from '@/miniGIS/lib/models/style';

interface IPointStyle {
  color?: string;
  size?: number;
}

export class PointStyle implements Style {
  public color: string;
  public size: number;

  constructor(style?: IPointStyle) {
    this.color = style?.color ?? '#FEFEFE';
    this.size = style?.size ?? 1;
  }
}
