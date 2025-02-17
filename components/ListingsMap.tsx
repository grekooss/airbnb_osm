import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapBounds, Marker } from '../types/map';

interface ListingsMapProps {
  markers: Marker[];
  onBoundsChange?: (bounds: MapBounds) => void;
  onMapStateChange?: (state: any) => void;
  initialState: {
    center: [number, number];
    zoom: number;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default function ListingsMap({
  markers,
  onBoundsChange,
  onMapStateChange,
  initialState,
}: ListingsMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [mapType, setMapType] = useState<'carto' | 'standard' | 'satellite'>(
    'carto'
  );
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status === 'granted');
  };

  const updateLocation = async () => {
    if (!locationPermission) {
      await checkLocationPermission();
      if (!locationPermission) return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      webViewRef.current?.injectJavaScript(`
        updateCurrentLocation({
          coords: {
            latitude: ${location.coords.latitude},
            longitude: ${location.coords.longitude}
          }
        });
        map.setView([${location.coords.latitude}, ${location.coords.longitude}], map.getZoom());
        true;
      `);
    } catch (error) {
      console.error('Błąd podczas pobierania lokalizacji:', error);
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .custom-marker {
            background-color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .custom-marker svg {
            width: 18px;
            height: 18px;
            fill: #1e1e1e;
          }
          .current-location {
            width: 20px;
            height: 20px;
            background-color: #4a90e2;
            border: 2px solid white;
            border-radius: 50%;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(3);
              opacity: 0;
            }
          }
          .pulse {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: rgba(74, 144, 226, 0.3);
            animation: pulse 2s ease-out infinite;
          }
          .marker-cluster {
            background-clip: padding-box;
            border-radius: 50%;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .marker-cluster div {
            width: 32px;
            height: 32px;
            margin: 0;
            text-align: center;
            border-radius: 50%;
            font-size: 14px;
            color: #1e1e1e;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            center: [${initialState.center[0]}, ${initialState.center[1]}],
            zoom: ${initialState.zoom},
            zoomControl: false,
          });
          
          let standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ' OpenStreetMap contributors'
          });

          let satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: ' Esri'
          });

          let cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: ' CARTO'
          });

          let currentLayer = cartoLayer;
          currentLayer.addTo(map);

          let currentLocationMarker = null;

          function updateCurrentLocation(position) {
            const { latitude, longitude } = position.coords;
            
            if (currentLocationMarker) {
              map.removeLayer(currentLocationMarker);
            }

            const pulseIcon = L.divIcon({
              className: '',
              html: '<div class="pulse"></div><div class="current-location"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            currentLocationMarker = L.marker([latitude, longitude], {
              icon: pulseIcon,
              zIndexOffset: 1000
            }).addTo(map);
          }

          function handleLocationError(error) {
            console.error('Błąd podczas pobierania lokalizacji:', error);
          }

          // Inicjalizacja klastra markerów
          var markers = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function(cluster) {
              return L.divIcon({
                html: '<div><span>' + cluster.getChildCount() + '</span></div>',
                className: 'marker-cluster',
                iconSize: L.point(32, 32)
              });
            }
          });

          // Funkcja do aktualizacji markerów
          function updateMarkers(markersData) {
            // Usuwamy wszystkie istniejące markery i obrysy
            markers.clearLayers();
            map.eachLayer((layer) => {
              if (layer instanceof L.Polygon) {
                map.removeLayer(layer);
              }
            });
            
            // Dodajemy nowe markery i obrysy
            markersData.forEach(marker => {
              // Tworzymy niestandardowy marker z SVG
              const markerHtml = \`
                <div class="custom-marker">
                  <svg viewBox="0 0 24 24">
                    <path d="\${getIconPath(marker.icon)}" />
                  </svg>
                </div>
              \`;

              const customIcon = L.divIcon({
                html: markerHtml,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
              });

              // Dodajemy marker w środku budynku
              const markerLayer = L.marker(marker.position, {
                icon: customIcon,
                zIndexOffset: 100
              })
                .bindPopup(marker.title);
              
              markers.addLayer(markerLayer);

              // Jeśli mamy punkty way, dodajemy obrys budynku
              if (marker.wayPoints && marker.wayPoints.length > 2) {
                L.polygon(marker.wayPoints, {
                  color: '#2563eb',
                  weight: 2,
                  opacity: 0.8,
                  fillColor: '#3b82f6',
                  fillOpacity: 0.35
                }).addTo(map);
              }
            });

            // Dodajemy klaster markerów do mapy
            map.addLayer(markers);
          }

          // Funkcja zwracająca ścieżkę SVG dla danej ikony
          function getIconPath(iconName) {
            const icons = {
              business: 'M14 11h-4v3h4v-3zm0-4h-4v3h4V7zm0 8h-4v3h4v-3zm6-8h-4v3h4V7zm0 4h-4v3h4v-3zm0 4h-4v3h4v-3zM10 7H6v3h4V7zm0 4H6v3h4v-3zm0 4H6v3h4v-3z',
              home: 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z',
              'home-outline': 'M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z',
              bed: 'M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 19h1l.67-2h12.67l.66 2h1l.67-2H22v-5c0-1.1-.9-2-2-2zm-9 0H6V7h5v3zm7 0h-5V7h5v3z',
              boat: 'M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z',
              leaf: 'M17.09 11.07c-.17-.35-.44-.65-.8-.85-.61-.35-1.35-.35-1.96 0L12 11.57 9.67 10.22c-.61-.35-1.35-.35-1.96 0-.36.2-.63.5-.8.85L12 13.15l5.09-2.08zM12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3z',
              bonfire: 'M12 23c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v1.68C7.64 6.36 6 8.92 6 12v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z',
              umbrella: 'M14.5 6.92L13 5.77V3.88V3.4c0-0.26 0.22-0.48 0.5-0.48c0.28 0 0.5 0.21 0.5 0.48V4h2v-.6C16 2.07 14.88 1 13.5 1c-1.38 0-2.5 1.07-2.5 2.4v2.37L9.5 6.92 6 6.07l5.05 15.25c0.15 0.45.55 0.68 1.45 0.68s1.3-0.23 1.45-0.68L19 6.07l-3.5 0.85z',
              map: 'M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z',
              car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
              'business-outline': 'M14 11h-4v3h4v-3zm0-4h-4v3h4V7zm0 8h-4v3h4v-3zm6-8h-4v3h4V7zm0 4h-4v3h4v-3zm0 4h-4v3h4v-3zM10 7H6v3h4V7zm0 4H6v3h4v-3zm0 4H6v3h4v-3z'
            };
            return icons[iconName] || icons['map'];
          }

          // Nasłuchiwanie zmian granic mapy
          map.on('moveend', function() {
            const bounds = map.getBounds();
            const mapBounds = {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            };
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'boundsChanged',
              bounds: mapBounds
            }));
          });

          // Nasłuchiwanie zmian stanu mapy
          map.on('zoomend', function() {
            const state = {
              zoom: map.getZoom(),
              center: map.getCenter()
            };
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapStateChanged',
              state: state
            }));
          });

          // Funkcja do zmiany typu mapy
          function changeMapType(type) {
            map.removeLayer(currentLayer);
            
            switch(type) {
              case 'standard':
                currentLayer = standardLayer;
                break;
              case 'satellite':
                currentLayer = satelliteLayer;
                break;
              default:
                currentLayer = cartoLayer;
            }
            
            currentLayer.addTo(map);
          }
        </script>
      </body>
    </html>
  `;

  const injectMarkersJS = (markers: Marker[]) => {
    const js = `updateMarkers(${JSON.stringify(markers)})`;
    webViewRef.current?.injectJavaScript(js);
    return true;
  };

  useEffect(() => {
    if (markers) {
      injectMarkersJS(markers);
    }
  }, [markers]);

  const changeMapType = (type: 'carto' | 'standard' | 'satellite') => {
    setMapType(type);
    webViewRef.current?.injectJavaScript(`changeMapType('${type}')`);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        scrollEnabled={false}
        onMessage={event => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'boundsChanged' && onBoundsChange) {
            onBoundsChange(data.bounds);
          } else if (data.type === 'mapStateChanged' && onMapStateChange) {
            onMapStateChange(data.state);
          }
        }}
      />
      <TouchableOpacity
        style={styles.locationButton}
        onPress={updateLocation}
      >
        <Ionicons name="locate" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.mapTypeButton}
        onPress={() => {
          const types: ('carto' | 'standard' | 'satellite')[] = [
            'carto',
            'standard',
            'satellite',
          ];
          const currentIndex = types.indexOf(mapType);
          const nextType = types[(currentIndex + 1) % types.length];
          changeMapType(nextType);
        }}
      >
        <Ionicons name="map-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}
