import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Pressable, ActivityIndicator, Share, Dimensions, ScrollView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PopupMap from '@/components/PopupMap';
import { Marker } from '@/types/map';
import { ListingModel } from '@/types/listing';
import { database, getPhotosForMarker } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withTiming,
  SlideInDown
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 320;

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

  const handleGoBack = () => {
    router.back();
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 350],
            [0, -350],
            'clamp'
          ),
        },
      ],
      zIndex: 1,
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

  useEffect(() => {
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

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
    <View className="flex-1" style={{ backgroundColor: 'white' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View 
        style={[
          { 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: IMG_HEIGHT,
            zIndex: 1
          }
        ]}
      >
        <PopupMap 
          marker={marker} 
          center={[lat, lon]}
          zoom={17}
        />
        <Pressable 
          onPress={handleGoBack}
          className="absolute top-16 left-4 bg-white rounded-full p-2 shadow-md z-50"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Pressable 
          onPress={shareListing}
          className="absolute top-16 right-4 bg-white rounded-full p-2 shadow-md z-50"
        >
          <Ionicons name="share-outline" size={24} color="black" />
        </Pressable>
      </Animated.View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: IMG_HEIGHT
        }}
      >
        <Animated.View 
          className="bg-white"
          style={contentAnimatedStyle}
        >
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

            <View className="border-t border-neutral-30 pt-6">
              <Text className="text-neutral-100 text-xl font-bold mb-2">
                Opis obiektu
              </Text>
              <Text className="text-neutral-60">
                Wyobraź sobie poranek, gdy budzisz się w drewnianej chacie pośród majestatycznych gór. Przez duże okna wpada złote światło, a przed Tobą rozpościera się niepowtarzalny widok na zielone doliny i skaliste szczyty otulone delikatną mgłą. Powietrze jest rześkie i czyste, przesiąknięte zapachem lasu i żywicy, a jedynym dźwiękiem, jaki słyszysz, jest śpiew ptaków i szum pobliskiego strumienia.{'\n\n'}
                Nasza drewniana chata to idealne miejsce dla tych, którzy pragną uciec od miejskiego zgiełku i zanurzyć się w naturze. Wykonana z naturalnych materiałów, łączy tradycyjny, górski styl z nowoczesnym komfortem. W środku czeka na Ciebie przytulny salon z kominkiem, którego ciepło uprzyjemni chłodne wieczory. Duży, drewniany taras to natomiast idealne miejsce, by delektować się poranną kawą lub podziwiać zachód słońca, gdy niebo nabiera ognistych barw.{'\n\n'}
                Bez względu na porę roku, widoki z tej chaty zapierają dech w piersiach. Zimą otaczające wzgórza pokrywają się śnieżnym puchem, tworząc bajkowy krajobraz, który zachęca do długich spacerów lub wypadów na narty. Wiosną i latem przyroda budzi się do życia, a soczysta zieleń drzew i łąk wypełnionych kwiatami sprawia, że każda chwila spędzona tutaj jest pełna harmonii. Jesień natomiast maluje góry złotem, czerwienią i brązem, czyniąc każdą panoramę niemal malarskim arcydziełem.{'\n\n'}
                Po dniu spędzonym na odkrywaniu uroków górskiego otoczenia możesz zrelaksować się w wygodnej sypialni z widokiem na gwiaździste niebo lub spędzić wieczór przy ognisku, słuchając dźwięków natury. To miejsce stworzone z myślą o tych, którzy szukają spokoju, inspiracji i bliskości z naturą.{'\n\n'}
                Jeśli marzysz o odpoczynku w wyjątkowym miejscu, gdzie czas płynie wolniej, a widoki zapierają dech w piersiach, nasza drewniana chata w górach czeka właśnie na Ciebie!
              </Text>
            </View>
          </View>
        </Animated.View>
      </AnimatedScrollView>

      <Animated.View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-30"
        entering={SlideInDown}
      >
        <View className="flex-row justify-between items-center bg-neutral-10 p-4">
          <View>
            <Text className="text-neutral-100 text-2xl font-bold">837 zł noc</Text>
            <Text className="text-neutral-60">29 mar–3 kwi</Text>
          </View>
          <Pressable 
            className="bg-primary-60 px-6 py-3 rounded-lg"
            onPress={() => {
              console.log('Kliknięto przycisk rezerwacji dla id:', id);
            }}
          >
            <Text className="text-neutral-10 text-base font-bold">
              Rezerwuj
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default ListingPage;
