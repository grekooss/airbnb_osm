import { Models } from 'react-native-appwrite';

export interface ListingModel extends Models.Document {
  osm_id: string;
  name: string;
  building: string;
  amenity: string;
  addr_housename: string;
  addr_housenumber: string;
  addr_street: string;
  way_area: number;
  center_point: string;
  way: string;
}
