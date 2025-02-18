import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ListingModel } from '../types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Marker } from '../types/map';
import PopupMap from './PopupMap';

interface ListingPopupProps {
  listing: ListingModel;
  onClose: () => void;
}

const ListingPopup = ({ listing, onClose }: ListingPopupProps) => {
  const wayPoints = listing.way ? JSON.parse(listing.way) : [];
  const [lat, lon] = wayPoints.length > 0 ? wayPoints[0] : [0, 0];
  
  const marker: Marker = {
    id: listing.osm_id,
    position: [lat, lon],
    title: listing.name || `${listing.building} ${listing.addr_housenumber || ''}`,
    wayPoints: wayPoints,
    icon: listing.building || 'home'
  };

  return (
    <View className="absolute bottom-5 left-0 right-0 items-center justify-center z-50">
      <View className="bg-white rounded-xl w-[90%] max-w-[400px] overflow-hidden shadow-lg">
        <View className="w-full h-[200px] relative">
          <PopupMap
            marker={marker}
            center={[lat, lon]}
            zoom={17}
          />
          <TouchableOpacity 
            className="absolute top-3 right-3 z-10"
            onPress={onClose}
          >
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
              <MaterialCommunityIcons name="close" size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <View className="mb-4">
            <Text className="text-lg font-bold mb-1">
              {listing.name || `${listing.building} ${listing.addr_housenumber || ''}`}
            </Text>
            <Text className="text-sm text-gray-500">
              {listing.addr_street || 'Brak adresu'}
            </Text>
          </View>

          <View className="space-y-2">
            {listing.amenity && (
              <View className="flex-row items-center space-x-2">
                <MaterialCommunityIcons name="store" size={20} color="#666" />
                <Text className="text-sm text-gray-700">Typ: {listing.amenity}</Text>
              </View>
            )}
            
            {listing.building && (
              <View className="flex-row items-center space-x-2">
                <MaterialCommunityIcons name="home" size={20} color="#666" />
                <Text className="text-sm text-gray-700">Budynek: {listing.building}</Text>
              </View>
            )}

            {listing.addr_housename && (
              <View className="flex-row items-center space-x-2">
                <MaterialCommunityIcons name="tag" size={20} color="#666" />
                <Text className="text-sm text-gray-700">Nazwa budynku: {listing.addr_housename}</Text>
              </View>
            )}

            {listing.way_area && (
              <View className="flex-row items-center space-x-2">
                <MaterialCommunityIcons name="ruler-square" size={20} color="#666" />
                <Text className="text-sm text-gray-700">Powierzchnia: {Math.round(listing.way_area)} m²</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ListingPopup;
