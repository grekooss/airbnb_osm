import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Marker } from '../types/map';
import { router } from 'expo-router';

interface PopupMapProps {
  marker: Marker;
  center: [number, number];
  zoom: number;
}

const mapStyles = {
  carto: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
};

const SWIPE_THRESHOLD = 50;

export default function PopupMap({ marker, center, zoom }: PopupMapProps) {
  const [currentMapStyle, setCurrentMapStyle] = useState<'satellite' | 'carto' | 'osm'>('satellite');
  const startXRef = useRef(0);
  const [key, setKey] = useState(0);

  const handlePress = () => {
    router.push(`/listing/${marker.id}`);
  };

  const getCurrentZoom = () => {
    return currentMapStyle === 'satellite' ? 19 : 18;
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
        changeMapStyle(direction);
      }
    },
  });

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

  const mapHTML = `
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
          
          L.tileLayer('${mapStyles[currentMapStyle]}', {
            maxZoom: 19,
            attribution: '${getMapAttribution(currentMapStyle)}',
            fadeAnimation: false
          }).addTo(map);

          const wayPoints = ${JSON.stringify(marker.wayPoints)};
          if (wayPoints && wayPoints.length > 0) {
            const polygon = L.polygon(wayPoints, {
              color: '#FF385C',
              weight: 2,
              fillColor: '#FF385C',
              fillOpacity: 0.3
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

  const changeMapStyle = (direction: 'next' | 'prev') => {
    const styles = ['satellite', 'carto', 'osm'] as const;
    const currentIndex = styles.indexOf(currentMapStyle);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % styles.length;
    } else {
      newIndex = (currentIndex - 1 + styles.length) % styles.length;
    }
    
    setCurrentMapStyle(styles[newIndex]);
    // Wymuszamy przeładowanie WebView przy zmianie stylu
    setKey(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers} style={StyleSheet.absoluteFill}>
        <WebView
          key={key}
          source={{ html: mapHTML }}
          style={styles.webView}
          scrollEnabled={false}
          onNavigationStateChange={(event) => {
            if (event.url !== 'about:blank') {
              handlePress();
            }
          }}
        />
      </View>
      <View style={styles.dotsContainer}>
        {['satellite', 'carto', 'osm'].map((style, index) => (
          <View
            key={style}
            style={[styles.dot, currentMapStyle === style && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  webView: {
    backgroundColor: '#f0f0f0',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#ffffff',
  },
});
