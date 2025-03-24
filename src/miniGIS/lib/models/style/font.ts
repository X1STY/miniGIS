import { Style } from '@/miniGIS/lib/models/style/style';

export interface IFontStyle {
  size: string;
  fontFamily: string;
  char: number;
  color: string;
}

export class FontStyle implements Style {
  public style: IFontStyle;

  constructor(styles?: IFontStyle) {
    this.style = styles ?? {
      size: '12px',
      fontFamily: 'Webdings',
      char: 0x3d,
      color: '#000',
    };
  }
}
