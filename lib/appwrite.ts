import { Platform } from 'react-native';
import { Client, Databases } from 'react-native-appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

switch (Platform.OS) {
  case 'ios':
    client.setPlatform('com.grekoss.airbnb-osm');
    break;
  case 'android':
    client.setPlatform('com.grekoss.airbnb-osm');
    break;
}

export { client, database };
