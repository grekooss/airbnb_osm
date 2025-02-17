export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Marker {
  id: string;
  position: [number, number];
  title: string;
  wayPoints: [number, number][]; // punkty tworzące obrys budynku
  icon: string; // nazwa ikony z Material Design Icons
}
