import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ImagePickerModal({pickImageFromLibrary, takePhoto,isVisible,onClose}) {


  return (
    <View style={styles.container}>
      {/* <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.openBtn}>
        <Text style={styles.openBtnText}>Open Image Picker</Text>
      </TouchableOpacity> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => onClose()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Option</Text>

            <TouchableOpacity style={styles.optionBtn} onPress={pickImageFromLibrary}>
              <Ionicons name="images-outline" size={20} color="#333" />
              <Text style={styles.optionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={20} color="#333" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onClose()} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    openBtn: {
      backgroundColor: '#2e64e5',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    openBtnText: { color: '#fff', fontSize: 16 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 25,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
    },
    optionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    optionText: {
      fontSize: 16,
      marginLeft: 10,
    },
    cancelBtn: {
      marginTop: 20,
      alignItems: 'center',
    },
    cancelText: {
      color: '#2e64e5',
      fontSize: 16,
      fontWeight: '500',
    },
  });
  