import { database } from '@/lib/appwrite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { categories } from '../constants/categories';
import { useCategory } from '../context/CategoryContext';
import { ListingModel } from '../types/listing';
import { MapBounds, Marker } from '../types/map';
import ListingsMap from './ListingsMap';

const getCategoryIcon = (category: string): string => {
  const foundCategory = categories.find(
    cat => cat.label.toLowerCase() === category.toLowerCase()
  );
  return foundCategory?.icon || 'map';
};

interface MapWithListingsProps {
  onListingsChange?: (listings: ListingModel[]) => void;
}

export default function MapWithListings({
  onListingsChange,
}: MapWithListingsProps) {
  const [listings, setListings] = useState<ListingModel[]>([]);
  const { activeCategory } = useCategory();
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  const parseWayPoints = (way: string): [number, number][] => {
    try {
      const points = JSON.parse(way);
      return points.map((point: [number, number]) => point);
    } catch (e) {
      console.error('Błąd parsowania punktów way:', e);
      return [];
    }
  };

  const fetchListings = async (bounds: MapBounds | null, category: string) => {
    try {
      console.log('Pobieranie punktów dla kategorii:', category);
      console.log('Aktualne granice mapy:', bounds);

      // Pobieramy punkty z wybranej kategorii
      const response = await database.listDocuments<ListingModel>(
        process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
        'landings',
        [
          // Filtrujemy po kategorii budynku
          Query.equal('building', category),
          Query.limit(1000), // Limit punktów do wyświetlenia
        ]
      );

      // Filtrujemy punkty po stronie klienta, jeśli mamy ustawione granice mapy
      const filteredListings = bounds
        ? response.documents.filter(listing => {
            try {
              const [lat, lon] = JSON.parse(listing.center_point);
              return (
                lat >= bounds.south &&
                lat <= bounds.north &&
                lon >= bounds.west &&
                lon <= bounds.east
              );
            } catch (e) {
              console.error('Błąd parsowania center_point:', e);
              return false;
            }
          })
        : response.documents;

      console.log(
        `Znaleziono ${filteredListings.length} punktów dla kategorii "${category}"`
      );
      setListings(filteredListings);
      if (onListingsChange) {
        onListingsChange(filteredListings);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania punktów:', error);
    }
  };

  // Efekt dla zmiany kategorii
  useEffect(() => {
    fetchListings(currentBounds, activeCategory);
  }, [activeCategory]);

  const handleBoundsChange = async (bounds: MapBounds) => {
    setCurrentBounds(bounds);
    await fetchListings(bounds, activeCategory);
  };

  return (
    <View className="flex-1">
      <ListingsMap
        onBoundsChange={handleBoundsChange}
        onMapStateChange={state => {
          console.log('Map state changed:', state);
        }}
        initialState={{
          center: [54.0381, 21.7644], // Giżycko
          zoom: 13,
        }}
        markers={listings
          .map(listing => {
            try {
              const [lat, lon] = JSON.parse(listing.center_point);
              const wayPoints = parseWayPoints(listing.way);
              return {
                id: listing.$id,
                position: [lat, lon] as [number, number],
                title:
                  listing.name ||
                  `${listing.building} ${listing.addr_housenumber}`,
                wayPoints,
                icon: getCategoryIcon(listing.building),
              };
            } catch (e) {
              console.error('Błąd parsowania center_point:', e);
              return undefined;
            }
          })
          .filter((marker): marker is Marker => marker !== undefined)}
      />
    </View>
  );
}
