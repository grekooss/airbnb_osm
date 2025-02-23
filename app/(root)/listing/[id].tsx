import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ActivityIndicator, Share, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PopupMap from '@/components/PopupMap';
import { Marker } from '@/types/map';
import { ListingModel } from '@/types/listing';
import { database, getPhotosForMarker } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  SlideInDown
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 300;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const ListingPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<ListingModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const scrollY = useSharedValue(0);

  const shareListing = async () => {
    if (!listing) return;
    try {
      await Share.share({
        title: listing.name || listing.building,
        message: `Sprawdź ten obiekt: ${listing.name || listing.building} przy ${listing.addr_street} ${listing.addr_housenumber}`,
      });
    } catch (err) {
      console.error('Błąd podczas udostępniania:', err);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollY.value, [-IMG_HEIGHT, 0, IMG_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, IMG_HEIGHT / 1.5], [0, 1]),
      backgroundColor: 'white',
    };
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await database.listDocuments(
          process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
          [Query.equal('osm_id', id)]
        );

        if (response.documents.length === 0) {
          throw new Error('Nie znaleziono obiektu');
        }

        const listingData = response.documents[0] as ListingModel;
        setListing(listingData);

        // Pobierz zdjęcia
        const listingPhotos = await getPhotosForMarker('photos', id);
        setPhotos(listingPhotos);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania danych');
        console.error('Error fetching listing:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error || 'Nie znaleziono obiektu'}</Text>
        <Pressable 
          className="mt-4 bg-primary-60 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Wróć</Text>
        </Pressable>
      </View>
    );
  }

  const wayPoints = listing.way ? JSON.parse(listing.way) : [];
  const [lat, lon] = wayPoints.length > 0 ? wayPoints[0] : [0, 0];

  const marker: Marker = {
    id: listing.osm_id,
    position: [lat, lon],
    title: listing.name || `${listing.building} ${listing.addr_housenumber || ''}`,
    wayPoints: wayPoints,
    icon: listing.building || 'home'
  };

  return (
    <View className="flex-1 bg-neutral-10">
      {/* Przyciski nawigacji */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-10"
        style={headerAnimatedStyle}
      >
        <SafeAreaView className="flex-row justify-between items-center px-4 pt-2">
          <Pressable 
            className="w-9 h-9 bg-neutral-10/90 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FF385C" />
          </Pressable>
          
          <View className="flex-row gap-4">
            <Pressable 
              className="w-9 h-9 bg-neutral-10/90 rounded-full items-center justify-center"
              onPress={shareListing}
            >
              <Ionicons name="share-outline" size={24} color="#FF385C" />
            </Pressable>
            <Pressable className="w-9 h-9 bg-neutral-10/90 rounded-full items-center justify-center">
              <Ionicons name="heart-outline" size={24} color="#FF385C" />
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Mapa z animacją */}
        <Animated.View 
          className="w-full h-[300px]"
          style={mapAnimatedStyle}
        >
          <PopupMap
            marker={marker}
            center={[lat, lon]}
            zoom={17}
          />
        </Animated.View>

        <View className="bg-neutral-10 -mt-5 rounded-t-3xl">
          <View className="p-5">
            <Text className="text-2xl font-bold">
              {listing.name || `${listing.building} ${listing.addr_housenumber || ''}`}
            </Text>
            
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={20} color="#FF385C" />
              <Text className="ml-1 text-base">
                {listing.addr_street}
                {listing.addr_housenumber ? ` ${listing.addr_housenumber}` : ''}
              </Text>
            </View>

            <View className="mb-5 mt-6">
              <Text className="text-lg font-bold mb-2">
                Szczegóły:
              </Text>
              <View className="space-y-2">
                {listing.building && (
                  <View className="flex-row items-center">
                    <Ionicons name="business" size={20} color="#FF385C" />
                    <Text className="ml-2 text-base">Typ budynku: {listing.building}</Text>
                  </View>
                )}
                {listing.amenity && (
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={20} color="#FF385C" />
                    <Text className="ml-2 text-base">Udogodnienia: {listing.amenity}</Text>
                  </View>
                )}
                {listing.way_area && (
                  <View className="flex-row items-center">
                    <Ionicons name="resize" size={20} color="#FF385C" />
                    <Text className="ml-2 text-base">
                      Powierzchnia: {Math.round(listing.way_area)} m²
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Pressable 
              className="bg-primary-60 p-4 rounded-lg items-center mt-2 mb-5"
              onPress={() => {
                router.push({
                  pathname: "/(root)/(tabs)",
                  params: { markerId: id }
                });
              }}
            >
              <Text className="text-neutral-10 text-base font-bold">
                Zobacz na mapie
              </Text>
            </Pressable>
          </View>
        </View>
      </AnimatedScrollView>

      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-neutral-10 border-t border-neutral-30 p-4"
        entering={SlideInDown}
      >
        <Pressable 
          className="bg-primary-60 p-4 rounded-lg items-center"
          onPress={() => {
            router.push({
              pathname: "/(root)/(tabs)",
              params: { markerId: id }
            });
          }}
        >
          <Text className="text-neutral-10 text-base font-bold">
            Zobacz na mapie
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default ListingPage;
