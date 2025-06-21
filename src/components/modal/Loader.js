// components/LoaderModal.js
import React from 'react';
import {  View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { appFonts } from '../../theme/appFonts';
import {appColor} from '../../theme/appColor';
import { Modal, Portal } from 'react-native-paper';

export default function LoaderModal({ visible ,message}) {
  return (
     <Portal>
      <Modal 
        visible={visible} 
        dismissable={false}
        contentContainerStyle={styles.modalContainer}
        theme={{ colors: { backdrop: 'rgba(0,0,0,0.5)' } }}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator 
            size="large" 
            animating={true}
            color={appColor.primary} 
          />
          <Text 
            style={styles.loadingText}
            variant="bodyLarge"
          >
            {message || "Loading..."}
          </Text>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
 modalContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  loadingText: {
    marginTop: 15,
    fontFamily: appFonts.Medium,
    color: appColor.primary,
  }
});
