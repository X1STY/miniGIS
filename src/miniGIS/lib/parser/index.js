import { Coordinate, Layer, Line, Point, Polygon } from '@/miniGIS/lib/models';
import { Map } from '@/miniGIS/lib/models/map';

export const parseGeoJSON = (geoJSON, map, layerName) => {
  const layer = new Layer(layerName);

  geoJSON.features.forEach((feature) => {
    const geometry = feature.geometry;

    switch (geometry.type) {
      case 'Point':
        if (geometry.coordinates.length === 2) {
          const point = new Point(geometry.coordinates[0], geometry.coordinates[1]);
          layer.addGeometry(point);
        }
        break;

      case 'LineString':
        if (Array.isArray(geometry.coordinates)) {
          const lineCoords = geometry.coordinates.map(
            (coord) => new Coordinate(coord[0], coord[1])
          );
          layer.addGeometry(new Line(lineCoords));
        }
        break;

      case 'Polygon':
        if (Array.isArray(geometry.coordinates) && Array.isArray(geometry.coordinates[0])) {
          const polygonCoords = geometry.coordinates[0].map(
            (coord) => new Coordinate(coord[0], coord[1])
          );
          layer.addGeometry(new Polygon(polygonCoords));
        }
        break;

      case 'MultiLineString':
        if (Array.isArray(geometry.coordinates)) {
          geometry.coordinates.forEach((lineCoords) => {
            if (Array.isArray(lineCoords)) {
              const linePoints = lineCoords.map((coord) => new Coordinate(coord[0], coord[1]));
              layer.addGeometry(new Line(linePoints));
            }
          });
        }
        break;

      case 'MultiPolygon':
        if (Array.isArray(geometry.coordinates)) {
          geometry.coordinates.forEach((polygonCoords) => {
            if (Array.isArray(polygonCoords) && Array.isArray(polygonCoords[0])) {
              const polygonPoints = polygonCoords[0].map(
                (coord) => new Coordinate(coord[0], coord[1])
              );
              layer.addGeometry(new Polygon(polygonPoints));
            }
          });
        }
        break;

      default:
        console.warn(`Unsupported geometry type: ${geometry.type}`);
    }
  });

  return layer;
};
