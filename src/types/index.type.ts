export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  geometry: GeoJSON.Point;
}
