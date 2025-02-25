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
