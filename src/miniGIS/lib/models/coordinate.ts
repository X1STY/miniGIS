export interface ICoordinate {
  x: number;
  y: number;
  distanceTo(other: ICoordinate): number;
  toString(): string;
  toJSON(): object;
}

export class Coordinate implements ICoordinate {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public distanceTo(other: Coordinate): number {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  public toString(): string {
    return `(${this.x.toFixed(6)}, ${this.y.toFixed(6)})`;
  }

  public toJSON(): object {
    return {
      x: this.x,
      y: this.y,
    };
  }

  public static fromJSON(json: any): Coordinate {
    return new Coordinate(json.x, json.y);
  }
}
