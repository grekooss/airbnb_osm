import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import React, { forwardRef, ForwardRefRenderFunction, useCallback, useMemo } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { ListingModel } from '../types/listing';
import PopupMap from './PopupMap';
import { Marker } from '../types/map';

interface ListingsBottomSheetProps {
  listings: ListingModel[];
}

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 200;

const ListingsBottomSheetComponent: ForwardRefRenderFunction<BottomSheet, ListingsBottomSheetProps> = 
  ({ listings }, ref) => {
    const snapPoints = useMemo(() => ['10%', '100%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      console.log('handleSheetChanges', index);
    }, []);

    const getIconName = (
      building: string
    ): keyof typeof MaterialCommunityIcons.glyphMap => {
      if (building === 'yes') return 'home';
      return (building as keyof typeof MaterialCommunityIcons.glyphMap) || 'home';
    };

    const renderItem = ({ item }: { item: ListingModel }) => {
      const wayPoints = item.way ? JSON.parse(item.way) : [];
      const [lat, lon] = wayPoints.length > 0 ? wayPoints[0] : [0, 0];

      const marker: Marker = {
        id: item.osm_id,
        position: [lat, lon],
        title: item.name || `${item.building} ${item.addr_housenumber || ''}`,
        wayPoints: wayPoints,
        icon: item.building || 'home'
      };

      return (
        <View className="border-b border-gray-200 bg-white">
          <View style={{ height: IMG_HEIGHT }}>
            <PopupMap 
              marker={marker} 
              center={[lat, lon]}
              zoom={17}
            />
          </View>
          <View className="p-4">
            <Text className="text-lg font-semibold">
              {item.name || `${item.building} ${item.addr_housenumber || ''}`}
            </Text>
            <Text className="text-gray-500">
              {item.addr_street || 'Brak adresu'}
            </Text>
          </View>
        </View>
      );
    };

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleStyle={{ 
          backgroundColor: 'white',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15
        }}
        style={{ 
          zIndex: 1,
        }}
        backgroundStyle={{
          backgroundColor: 'white',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15
        }}
      >
        <View className="flex-1 bg-white rounded-t-3xl">
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
