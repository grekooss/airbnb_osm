import { database } from '@/lib/appwrite';
import BottomSheet from '@gorhom/bottom-sheet';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { categories } from '../constants/categories';
import { useCategory } from '../context/CategoryContext';
import { ListingModel } from '../types/listing';
import { MapBounds, Marker } from '../types/map';
import ListingPopup from './ListingPopup';
import ListingsBottomSheet from './ListingsBottomSheet';
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
  const [selectedListing, setSelectedListing] = useState<ListingModel | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

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
            return (
              listing.latitude >= bounds.south &&
              listing.latitude <= bounds.north &&
              listing.longitude >= bounds.west &&
              listing.longitude <= bounds.east
            );
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

  const handleMarkerPress = (marker: Marker) => {
    const listing = listings.find(l => l.osm_id === marker.id);
    if (listing) {
      // Najpierw ustawiamy selectedListing
      setSelectedListing(listing);
      // Następnie z małym opóźnieniem chowamy BottomSheet
      setTimeout(() => {
        if (bottomSheetRef.current) {
          bottomSheetRef.current.close();
        }
      }, 100);
    }
  };

  const handlePopupClose = () => {
    // Najpierw czyścimy selectedListing
    setSelectedListing(null);
    // Następnie z małym opóźnieniem wysuwamy BottomSheet
    setTimeout(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    }, 100);
  };

  const getActiveIcon = () => {
    const category = categories.find(cat => cat.label === activeCategory);
    return category?.icon || 'map';
  };

  const markers = listings
    .map(listing => {
      try {
        const wayPoints = parseWayPoints(listing.way);
        return {
          id: listing.osm_id,
          position: [listing.latitude, listing.longitude] as [number, number],
          title:
            listing.name ||
            `${listing.building} ${listing.addr_housenumber}`,
          wayPoints,
          icon: getActiveIcon()
        };
      } catch (e) {
        console.error('Błąd parsowania danych:', e);
        return undefined;
      }
    })
    .filter((marker): marker is Marker => marker !== undefined);

  return (
    <View style={{ flex: 1 }}>
      <ListingsMap
        markers={markers}
        onBoundsChange={handleBoundsChange}
        onMarkerPress={handleMarkerPress}
        initialState={{
          center: [51.0926374,17.031611],
          zoom: 14,
        }}
      />
      <ListingsBottomSheet
        ref={bottomSheetRef}
        listings={listings}
      />
      {selectedListing && (
        <ListingPopup
          listing={selectedListing}
          onClose={handlePopupClose}
        />
      )}
    </View>
  );
}
