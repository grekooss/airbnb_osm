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
  onMarkerPress?: (marker: Marker) => void;
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
  onMarkerPress,
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
        <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
        <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
        <link href="https://unpkg.com/ionicons@5.5.2/dist/ionicons/css/ionicons.min.css" rel="stylesheet">
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
          .custom-marker ion-icon {
            font-size: 18px;
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
              // Tworzymy niestandardowy marker z Ionicons
              const markerHtml = \`
                <div class="custom-marker">
                  <ion-icon name="\${marker.icon}" style="font-size: 18px;"></ion-icon>
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
              
              const markerInstance = createMarker(marker);
              markers.addLayer(markerInstance);

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

          // Funkcja do tworzenia markerów
          function createMarker(marker) {
            const markerInstance = L.marker(marker.position, {
              icon: L.divIcon({
                html: \`
                  <div class="custom-marker">
                    <ion-icon name="\${marker.icon}" style="font-size: 18px;"></ion-icon>
                  </div>
                \`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })
            });

            markerInstance.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                markerId: marker.id
              }));
            });
            
            return markerInstance;
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

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'boundsChanged' && onBoundsChange) {
        onBoundsChange(data.bounds);
      } else if (data.type === 'markerClick' && onMarkerPress) {
        const marker = markers.find(m => m.id === data.markerId);
        if (marker) {
          onMarkerPress(marker);
        }
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        scrollEnabled={false}
        onMessage={handleMessage}
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
