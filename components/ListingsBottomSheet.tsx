import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, forwardRef, ForwardRefRenderFunction } from 'react';
import { Text, View } from 'react-native';
import { ListingModel } from '../types/listing';

interface ListingsBottomSheetProps {
  listings: ListingModel[];
}

const ListingsBottomSheetComponent: ForwardRefRenderFunction<BottomSheet, ListingsBottomSheetProps> = 
  ({ listings }, ref) => {
    const snapPoints = useMemo(() => ['10%', '50%', '90%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

    const getIconName = (
      building: string
    ): keyof typeof MaterialCommunityIcons.glyphMap => {
      if (building === 'yes') return 'home';
      return (building as keyof typeof MaterialCommunityIcons.glyphMap) || 'home';
    };

    const renderItem = ({ item }: { item: ListingModel }) => (
      <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold">
            {item.name || `${item.building} ${item.addr_housenumber || ''}`}
          </Text>
          <Text className="text-gray-500">
            {item.addr_street || 'Brak adresu'}
          </Text>
        </View>
      </View>
    );

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        handleStyle={{ backgroundColor: 'white' }}
        style={{ zIndex: 1 }}
      >
        <View className="flex-1 bg-white">
          <View className="border-b border-gray-200 pb-2">
            <Text className="text-center text-lg font-semibold">
              Places found: {listings.length}
            </Text>
          </View>
          <BottomSheetFlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={item => item.$id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ backgroundColor: 'white' }}
          />
        </View>
      </BottomSheet>
    );
  };

ListingsBottomSheetComponent.displayName = 'ListingsBottomSheet';

const ListingsBottomSheet = forwardRef(ListingsBottomSheetComponent);

export default ListingsBottomSheet;
