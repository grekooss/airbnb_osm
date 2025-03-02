import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Marker } from '../types/map';
import { router } from 'expo-router';
import { storage, getPhotosForMarker } from '../lib/appwrite';
import { mapConfig, getGoogle3DMapHtml, getCesiumMapHtml } from '../config/maps';

interface PopupMapProps {
  marker: Marker;
  center: [number, number];
  zoom: number;
}

type ViewMode = 'appwrite-image' | 'satellite' | 'carto' | 'osm' | 'google' | 'google3d' | 'cesium';

const SWIPE_THRESHOLD = 50;

export default function PopupMap({ marker, center, zoom }: PopupMapProps) {
  const [currentMode, setCurrentMode] = useState<ViewMode>('google');
  const [appwriteImages, setAppwriteImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const startXRef = useRef(0);

  useEffect(() => {
    console.log('PopupMap mounted with marker:', marker);
    const loadImages = async () => {
      setIsLoading(true);
      try {
        const images = await getPhotosForMarker('photos', marker.id);
        console.log(`Found ${images.length} images for marker ${marker.id}`);
        
        setAppwriteImages(images);
        if (images.length > 0) {
          setCurrentMode('appwrite-image');
          setCurrentImageIndex(0);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [marker.id]);

  useEffect(() => {
    if (currentMode === 'google') {
      try {
        const [lat, lng] = center;
        const url = mapConfig.mapStyles.google
          .replace('{lat}', lat.toString())
          .replace('{lng}', lng.toString())
          .replace('{zoom}', zoom.toString());
        setMapError(null);
      } catch (error) {
        console.error('Google Maps error:', error);
        setMapError('Błąd konfiguracji Google Maps API. Sprawdź klucz API.');
        setCurrentMode('satellite'); // Fallback to satellite view
      }
    }
  }, [currentMode]);

  const handlePress = () => {
    router.push(`/listing/${marker.id}`);
  };

  const getCurrentZoom = () => {
    return currentMode === 'satellite' ? 19 : 18;
  };

  const changeMode = (direction: 'prev' | 'next') => {
    // Tworzymy pełną sekwencję widoków
    const allModes: ViewMode[] = [];
    const mapModes: ViewMode[] = ['satellite', 'carto', 'osm', 'google', 'google3d', 'cesium'];
    
    // Dodajemy zdjęcia z Appwrite jeśli istnieją
    if (appwriteImages.length > 0) {
      for (let i = 0; i < appwriteImages.length; i++) {
        allModes.push('appwrite-image');
      }
    }
    
    // Dodajemy tryby map
    allModes.push(...mapModes);

    // Znajdujemy aktualną pozycję w sekwencji
    let currentPosition = 0;
    if (currentMode === 'appwrite-image') {
      currentPosition = currentImageIndex;
    } else {
      const mapIndex = mapModes.indexOf(currentMode);
      currentPosition = appwriteImages.length + mapIndex;
    }
    
    // Obliczamy nową pozycję
    let newPosition;
    if (direction === 'next') {
      newPosition = (currentPosition + 1) % allModes.length;
    } else {
      newPosition = (currentPosition - 1 + allModes.length) % allModes.length;
    }
    
    // Ustawiamy nowy tryb
    if (newPosition < appwriteImages.length) {
      setCurrentMode('appwrite-image');
      setCurrentImageIndex(newPosition);
    } else {
      const mapIndex = newPosition - appwriteImages.length;
      setCurrentMode(mapModes[mapIndex]);
      setCurrentImageIndex(0);
      setKey(prev => prev + 1);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: (evt) => {
      startXRef.current = evt.nativeEvent.pageX;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) <= 10) {
        handlePress();
        return;
      }
      
      const dx = evt.nativeEvent.pageX - startXRef.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        const direction = dx > 0 ? 'prev' : 'next';
        changeMode(direction);
      }
    },
  });

  const getCurrentMapStyle = () => {
    if (currentMode === 'google') {
      const [lat, lng] = center;
      return mapConfig.mapStyles.google
        .replace('{lat}', lat.toString())
        .replace('{lng}', lng.toString())
        .replace('{zoom}', zoom.toString());
    }
    if (currentMode === 'appwrite-image') {
      return mapConfig.mapStyles.satellite;
    }
    return mapConfig.mapStyles[currentMode as keyof typeof mapConfig.mapStyles];
  };

  const getMapAttribution = (style: string) => {
    switch (style) {
      case 'carto':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
      case 'osm':
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      default:
        return 'Esri';
    }
  };

  const getMapHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            html, body { 
              margin: 0; 
              padding: 0; 
              width: 100%; 
              height: 100%; 
            }
            #map { 
              width: 100%; 
              height: 100%; 
              position: absolute; 
              top: 0; 
              left: 0; 
            }
            .leaflet-container {
              background: #f0f0f0;
            }
            .leaflet-fade-anim .leaflet-tile,.leaflet-zoom-anim .leaflet-zoom-animated {
              will-change: auto !important;
              transition: none !important;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', {
              center: [${center[0]}, ${center[1]}],
              zoom: ${getCurrentZoom()},
              zoomControl: false,
              dragging: false,
              scrollWheelZoom: false,
              touchZoom: false,
              doubleClickZoom: false,
              fadeAnimation: false,
              zoomAnimation: false,
              markerZoomAnimation: false
            });
            
            L.tileLayer('${getCurrentMapStyle()}', {
              maxZoom: 19,
              attribution: '${getMapAttribution(currentMode === 'appwrite-image' ? 'satellite' : currentMode)}',
              fadeAnimation: false
            }).addTo(map);

            const wayPoints = ${JSON.stringify(marker.wayPoints)};
            if (wayPoints && wayPoints.length > 0) {
              const polygon = L.polygon(wayPoints, {
                color: '${currentMode === 'satellite' ? 'transparent' : '#FF385C'}',
                weight: ${currentMode === 'satellite' ? 0 : 2},
                fillColor: '#FF385C',
                fillOpacity: ${currentMode === 'satellite' ? 0.2 : 0.3}
              }).addTo(map);

              map.fitBounds(polygon.getBounds(), {
                padding: [20, 20],
                animate: false,
                maxZoom: ${getCurrentZoom()}
              });

              // Ustaw odpowiedni zoom po dopasowaniu do granic
              map.setZoom(${getCurrentZoom()}, { animate: false });
            }
          </script>
        </body>
      </html>
    `;
  };

  const renderDots = () => {
    const allModes: ViewMode[] = [];
    const mapModes: ViewMode[] = ['satellite', 'carto', 'osm', 'google', 'google3d', 'cesium'];
    
    // Dodajemy zdjęcia z Appwrite jeśli istnieją
    if (appwriteImages.length > 0) {
      for (let i = 0; i < appwriteImages.length; i++) {
        allModes.push('appwrite-image');
      }
    }
    
    // Dodajemy tryby map
    allModes.push(...mapModes);

    return (
      <View style={styles.dotsContainer}>
        {allModes.map((mode, index) => (
          <View
            key={`${mode}-${index}`}
            style={[
              styles.dot,
              (mode === 'appwrite-image' && currentMode === 'appwrite-image' && currentImageIndex === index) ||
              (mode !== 'appwrite-image' && currentMode === mode)
                ? styles.activeDot
                : undefined
            ]}
          />
        ))}
      </View>
    );
  };

  const renderMap = () => {
    if (currentMode === 'google') {
      return (
        <Image
          source={{ uri: getCurrentMapStyle() }}
          style={styles.mapImage}
          resizeMode="cover"
        />
      );
    }

    if (currentMode === 'google3d') {
      const [lat, lng] = center;
      return (
        <WebView
          key={key}
          source={{ html: getGoogle3DMapHtml(lat, lng, zoom) }}
          style={styles.webView}
          scrollEnabled={false}
          onError={(error) => {
            console.error('Google Maps 3D error:', error);
            setMapError('Błąd ładowania mapy 3D');
            setCurrentMode('google');
          }}
        />
      );
    }

    if (currentMode === 'cesium') {
      const [lat, lng] = center;
      return (
        <WebView
          key={key}
          source={{ html: getCesiumMapHtml(lat, lng, zoom) }}
          style={styles.webView}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onError={(error) => {
            console.error('Cesium error:', error);
            setMapError('Błąd ładowania mapy Cesium');
            setCurrentMode('osm');
          }}
          onMessage={(event) => {
            console.log('Cesium message:', event.nativeEvent.data);
          }}
          injectedJavaScript={`
            window.onerror = function(message, source, lineno, colno, error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: message,
                source: source,
                lineno: lineno,
                colno: colno,
                error: error ? error.toString() : null
              }));
              return true;
            };
            true;
          `}
        />
      );
    }
    
    return (
      <WebView
        key={key}
        source={{ html: getMapHtml() }}
        style={styles.webView}
      />
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={styles.mapContainer} {...panResponder.panHandlers}>
          {renderMap()}
          {mapError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{mapError}</Text>
            </View>
          )}
          {renderDots()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  webView: {
    backgroundColor: '#f0f0f0',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: 'white',
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
});
