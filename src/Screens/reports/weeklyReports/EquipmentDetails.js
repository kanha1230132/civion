import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appColor } from '../../../theme/appColor';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '../../../theme/appFonts';

const EquipmentDetails = ({ navigation, route }) => {
  const equipmentDetails = route.params?.equipmentDetails
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: appColor.white }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>{''}Equipment Details</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>View Equipment Details</Text>

        {/* Equipment List */}
        <View style={styles.detailsContainer}>
          {equipmentDetails?.map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.equipmentName}>{item.equipmentName}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
                <View>
                  <Text style={styles.hoursText}>Hours: {item.hours}</Text>
                  <View style={{ width: '100%', height: 1, backgroundColor: '#d3d3d3' }} />
                  <Text style={styles.hoursText}>Total Hours: {item.totalHours}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default EquipmentDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    // fontWeight: 'bold',
    fontFamily:appFonts.Bold,
    marginLeft: 8,
    color: appColor.black,
  },
  title: {
    fontSize: 18,
    color: '#486ECD',
    fontWeight: '500',
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: '#f7f9fc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detailItem: {
    marginBottom: 16,
  },
  equipmentName: {
    fontSize: 16,
    color: '#486ECD',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
});