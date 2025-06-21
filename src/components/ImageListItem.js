import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appColor } from '../theme/appColor';
import { appFonts } from '../theme/appFonts';

export default function ImageListItem({ imageUri, fileName, onDelete }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.thumbnail} />

      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
      </View>

      <TouchableOpacity onPress={onDelete}>
        <MaterialCommunityIcons name="trash-can" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#00000010', // Optional based on your screenshot
    marginVertical:10
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    color: appColor.black,
    fontSize: 14,
    fontFamily:appFonts.Regular
  },
});
