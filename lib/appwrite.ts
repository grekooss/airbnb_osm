import { Platform } from 'react-native';
import { Client, Databases, Storage, Query } from 'react-native-appwrite';

// Dla debugowania
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

console.log('Appwrite config:', {
  endpoint,
  projectId,
  platform: Platform.OS
});

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const database = new Databases(client);
const storage = new Storage(client);

switch (Platform.OS) {
  case 'ios':
    client.setPlatform('com.grekoss.airbnb-osm');
    break;
  case 'android':
    client.setPlatform('com.grekoss.airbnb-osm');
    break;
}

// Funkcja pomocnicza do pobierania URL-a zdjęcia
export const getPhotoUrl = async (bucketId: string, fileId: string) => {
  try {
    // Tworzymy URL do podglądu zdjęcia
    const preview = storage.getFilePreview(bucketId, fileId, 800);
    return preview.toString();
  } catch (error) {
    console.error('Error getting photo URL:', error);
    return null;
  }
};

// Funkcja pomocnicza do pobierania listy zdjęć dla markera
export const getPhotosForMarker = async (bucketId: string, markerId: string) => {
  try {
    // Pobierz listę plików zaczynających się od ID markera
    const files = await storage.listFiles(bucketId, [
      Query.startsWith('$id', markerId)
    ]);

    console.log(`Found ${files.total} files for marker ${markerId}:`, files.files);

    // Dla każdego pliku generujemy URL podglądu
    return files.files.map(file => {
      const preview = storage.getFilePreview(bucketId, file.$id);
      return preview.toString();
    });
  } catch (error) {
    console.error('Error getting photos for marker:', error);
    return [];
  }
};

export { client, database, storage };
