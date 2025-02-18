import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ListingModel } from '../types/listing';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListingPopupProps {
  listing: ListingModel;
  onClose: () => void;
}

const ListingPopup = ({ listing, onClose }: ListingPopupProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {listing.name || `${listing.building} ${listing.addr_housenumber || ''}`}
          </Text>
          <Text style={styles.subtitle}>
            {listing.addr_street || 'Brak adresu'}
          </Text>
        </View>

        <View style={styles.details}>
          {listing.amenity && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="store" size={20} color="#666" />
              <Text style={styles.detailText}>Typ: {listing.amenity}</Text>
            </View>
          )}
          
          {listing.building && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="home" size={20} color="#666" />
              <Text style={styles.detailText}>Budynek: {listing.building}</Text>
            </View>
          )}

          {listing.addr_housename && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="tag" size={20} color="#666" />
              <Text style={styles.detailText}>Nazwa budynku: {listing.addr_housename}</Text>
            </View>
          )}

          {listing.way_area && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="ruler-square" size={20} color="#666" />
              <Text style={styles.detailText}>Powierzchnia: {Math.round(listing.way_area)} m²</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="pound" size={20} color="#666" />
            <Text style={styles.detailText}>OSM ID: {listing.osm_id}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
});

export default ListingPopup;
