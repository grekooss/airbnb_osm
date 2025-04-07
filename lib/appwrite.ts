import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  Account,
  Avatars,
  Client,
  Databases,
  OAuthProvider,
  Query,
  Storage
} from "react-native-appwrite";

export const config = {
  platform: 'com.airbnb.clone',
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}


export const client = new Client();

client
.setEndpoint(config.endpoint!)
.setProject(config.projectId!)
.setPlatform(config.platform!)


export const database = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export const avatar = new Avatars(client);

export async function loginGoogle(){
  try {
    const redirectUri = Linking.createURL('/');

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );

    if(!response) throw new Error('Failed to login (response)');

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    )

    if (browserResult.type !== 'success') throw new Error('Failed to login (browserResult)')

    const url = new URL(browserResult.url)
    const secret = url.searchParams.get('secret')?.toString()
    const userId = url.searchParams.get('userId')?.toString()

    if (!secret || !userId) throw new Error("Failed to login (!user || !userId)")

    const session = await account.createSession(userId, secret)

    if (!session) throw new Error ('Failed to create a session')
      
    return true

  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function logoutGoogle(){
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
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


