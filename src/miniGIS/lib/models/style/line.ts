import { Style } from '@/miniGIS/lib/models/style';

interface ILineStyle {
  color?: string;
  width?: number;
  type?: 'solid' | 'dashed' | 'dotted' | 'dashdot' | 'longdash' | 'doubledash';
}

export class LineStyle implements Style {
  public readonly color: string;
  public readonly width: number;
  public readonly type: 'solid' | 'dashed' | 'dotted' | 'dashdot' | 'longdash' | 'doubledash';

  constructor(styles?: ILineStyle) {
    this.color = styles?.color ?? 'black';
    this.width = styles?.width ?? 1;
    this.type = styles?.type ?? 'solid';
  }
}
