import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { MapStyleElement, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker as MarkerType } from '../types/map';

interface GoogleMapsViewProps {
  marker: MarkerType;
  center: [number, number];
  zoom?: number;
  mapType?: 'standard' | 'satellite' | 'hybrid' | 'terrain';
  show3DBuildings?: boolean;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Stała minimalna i maksymalna wartość zoom dla GoogleMaps
const MIN_ZOOM = 14;  // Zmniejszono z 15 na 14 dla szerszego widoku
const MAX_ZOOM = 19;  // Obniżono maksimum dla lepszej widoczności

const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  marker,
  center,
  zoom = 18,
  mapType = 'hybrid',
  show3DBuildings = true,
}) => {
  // Przeliczenie poziomu zoom z wartości Leaflet na odpowiednik Google Maps
  const getGoogleZoomLevel = (leafletZoom: number) => {
    // Teraz używamy minimalnej wartości zoom (14), jeśli mamy dostosować widok
    if (show3DBuildings) {
      return Math.min(MAX_ZOOM, leafletZoom + 1);
    }
    return leafletZoom;
  };

  // Przekształcenie wayPoints na format wymagany przez komponent Polygon
  const polygonCoordinates = useMemo(() => 
    marker.wayPoints?.map(point => ({
      latitude: point[0],
      longitude: point[1],
    })) || []
  , [marker.wayPoints]);
  
  // Obliczanie granic wielokąta dla lepszego dopasowania widoku
  const polygonBounds = useMemo(() => {
    if (polygonCoordinates.length === 0) {
      return {
        center: {
          latitude: center[0],
          longitude: center[1]
        },
        delta: {
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        },
        zoomLevel: getGoogleZoomLevel(zoom)
      };
    }
    
    // Znajdujemy maksymalne i minimalne wartości szerokości i długości geograficznej
    let minLat = Number.MAX_VALUE;
    let maxLat = Number.MIN_VALUE;
    let minLng = Number.MAX_VALUE;
    let maxLng = Number.MIN_VALUE;
    
    polygonCoordinates.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    
    // Obliczamy środek wielokąta
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Obliczamy rozpiętość (delty) wielokąta z większym marginesem
    const latDelta = (maxLat - minLat) * 2.0; // Zwiększono margines do 200%
    const lngDelta = (maxLng - minLng) * 2.0; // Zwiększono margines do 200%
    
    // Obliczamy odpowiedni poziom przybliżenia - zmniejszono wartości dla większego oddalenia
    // im niższy zoom, tym bardziej oddalony widok
    const calculatedZoom = Math.max(
      MIN_ZOOM,
      Math.min(
        MAX_ZOOM,
        15 - Math.log2(Math.max(latDelta * 30, lngDelta * 30 / ASPECT_RATIO))
      )
    );
    
    return {
      center: {
        latitude: centerLat,
        longitude: centerLng
      },
      delta: {
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta
      },
      zoomLevel: calculatedZoom
    };
  }, [polygonCoordinates, center, zoom]);

  // Styl mapy, który całkowicie ukrywa wszystkie POI i inne elementy rozpraszające
  const mapStyle: MapStyleElement[] = show3DBuildings ? [
    // Ukrycie wszystkich elementów na mapie
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    
    // Wyłączenie wszystkich POI - kompleksowo
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.attraction",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.government",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.park",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.place_of_worship",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.school",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "poi.sports_complex",
      stylers: [{ visibility: "off" }]
    },
    
    // Wyłączenie wszystkich elementów transportu
    {
      featureType: "transit",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit.line",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit.station",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit.station.airport",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit.station.bus",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit.station.rail",
      stylers: [{ visibility: "off" }]
    },
    
    // Wyłączenie etykiet administracyjnych i biznesowych
    {
      featureType: "administrative",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "business",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    
    // Zachowanie tylko podstawowych elementów mapy
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "building",
      elementType: "geometry",
      stylers: [{ visibility: "on" }]
    }
  ] : [];

  // Konfiguracja kamery, używamy wyliczonego środka wielokąta i przybliżenia
  const camera = useMemo(() => ({
    center: polygonBounds.center,
    pitch: 20, // Bez pochylenia kamery
    heading: 0, // Kierunek kamery (0 = północ)
    altitude: show3DBuildings ? 50 : 0, // Zmniejszono wysokość dla lepszej widoczności
    zoom: polygonBounds.zoomLevel,
  }), [polygonBounds, show3DBuildings]);

  // Tworzenie współrzędnych dla "maski" - przyciemnienia wszystkiego poza obiektem
  const createMaskPolygon = () => {
    if (polygonCoordinates.length === 0) return null;

    // Tworzymy "dużą ramkę" wokół całej widocznej mapy, używając obliczonego środka
    const mapBounds = [
      {
        latitude: polygonBounds.center.latitude - LATITUDE_DELTA * 3,
        longitude: polygonBounds.center.longitude - LONGITUDE_DELTA * 3,
      },
      {
        latitude: polygonBounds.center.latitude - LATITUDE_DELTA * 3,
        longitude: polygonBounds.center.longitude + LONGITUDE_DELTA * 3,
      },
      {
        latitude: polygonBounds.center.latitude + LATITUDE_DELTA * 3,
        longitude: polygonBounds.center.longitude + LONGITUDE_DELTA * 3,
      },
      {
        latitude: polygonBounds.center.latitude + LATITUDE_DELTA * 3,
        longitude: polygonBounds.center.longitude - LONGITUDE_DELTA * 3,
      },
    ];

    // Zwracamy polygon z dziurą - dziura to nasz obiekt, reszta jest przyciemniona
    return (
      <Polygon
        coordinates={mapBounds}
        holes={[polygonCoordinates]}
        fillColor="rgba(0, 0, 0, 0.4)"
        strokeColor="transparent"
        strokeWidth={0}
      />
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        mapType={mapType}
        camera={camera}
        initialCamera={camera}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsScale={false}
        showsCompass={false}
        showsPointsOfInterest={false}
      >
        {createMaskPolygon()}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GoogleMapsView;
