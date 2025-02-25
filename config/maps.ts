import Constants from 'expo-constants';

const { googleMapsApiKey } = Constants.expoConfig?.extra || {};

export const mapConfig = {
  apiKey: googleMapsApiKey,
  mapStyles: {
    carto: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    google: 'https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom={zoom}&size=600x400&maptype=satellite&key=' + googleMapsApiKey,
  },
  defaultZoom: 18,
  satelliteZoom: 19,
};

export const getGoogle3DMapHtml = (lat: number, lng: number, zoom: number) => {
  if (!googleMapsApiKey) {
    throw new Error('Google Maps API key is not configured in Expo config');
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=beta&libraries=webgl" async defer></script>
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
          #map { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function initMap() {
            const location = { lat: ${lat}, lng: ${lng} };
            const map = new google.maps.Map(document.getElementById('map'), {
              center: location,
              zoom: 17,
              mapTypeId: 'satellite',
              disableDefaultUI: false,
              mapTypeControl: false,
              streetViewControl: false,
              zoomControl: false,
              fullscreenControl: false,
              gestureHandling: 'none'
            });

            // Włączenie zaawansowanego trybu WebGL z pełnym wsparciem 3D
            map.setOptions({
              mapId: "8e0a97af9386fef",
              tilt: 45,
              heading: 0,
              zoom: 17,
              webgl: true,
              buildings: true,
              center: location
            });

            // Dodatkowa konfiguracja renderowania 3D
            const webglOverlayView = new google.maps.WebGLOverlayView();
            webglOverlayView.setMap(map);
          }
          window.onload = initMap;
        </script>
      </body>
    </html>
  `;
};

export const getCesiumMapHtml = (lat: number, lng: number, zoom: number) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Cesium.js"></script>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
        <style>
          html, body { 
            margin: 0; 
            padding: 0; 
            width: 100%; 
            height: 100%; 
            overflow: hidden;
          }
          #map { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; 
            height: 100%; 
            background: black;
          }
          .cesium-widget-credits { 
            display: none !important; 
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            const viewer = new Cesium.Viewer('map', {
              animation: false,
              baseLayerPicker: false,
              fullscreenButton: false,
              geocoder: false,
              homeButton: false,
              infoBox: false,
              sceneModePicker: false,
              selectionIndicator: false,
              timeline: false,
              navigationHelpButton: false,
              navigationInstructionsInitiallyVisible: false,
              scene3DOnly: true
            });

            viewer.scene.globe.enableLighting = false;
            viewer.scene.moon.show = false;
            viewer.scene.sun.show = false;
            viewer.scene.skyBox.show = false;
            viewer.scene.backgroundColor = Cesium.Color.BLACK;

            viewer.camera.setView({
              destination: Cesium.Cartesian3.fromDegrees(${lng}, ${lat}, 500),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0
              }
            });

            viewer.scene.screenSpaceCameraController.enableRotate = false;
            viewer.scene.screenSpaceCameraController.enableTranslate = false;
            viewer.scene.screenSpaceCameraController.enableZoom = false;
            viewer.scene.screenSpaceCameraController.enableTilt = false;
            viewer.scene.screenSpaceCameraController.enableLook = false;

            window.ReactNativeWebView.postMessage('Cesium initialized successfully');
          } catch (error) {
            window.ReactNativeWebView.postMessage('Cesium error: ' + error.toString());
          }
        </script>
      </body>
    </html>
  `;
};
