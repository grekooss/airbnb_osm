import ExploreHeader from '@/components/ExploreHeader';
import ListingsBottomSheet from '@/components/ListingsBottomSheet';
import MapWithListings from '@/components/MapWithListings';
import { ListingModel } from '@/types/listing';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

const IndexPage = () => {
  const [listings, setListings] = useState<ListingModel[]>([]);

  return (
    <View className="flex-1">
      <Stack.Screen options={{ header: () => <ExploreHeader /> }} />
      <MapWithListings onListingsChange={setListings} />
      <ListingsBottomSheet listings={listings} />
    </View>
  );
};

export default IndexPage;
