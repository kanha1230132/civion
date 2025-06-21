import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { appFonts } from '../../theme/appFonts';
import { Button, Dialog, Modal, Portal } from 'react-native-paper';
import { appColor } from '../../theme/appColor';


export const useSuccessPopup = () => {
    const [isSuccessVisible, setIsSuccessVisible] = React.useState(false);
    const [message, setMessage] = useState('')
    const promiseRef = useRef(null);

    const showSuccessPopup = (_message, _ok = "OK") => {
        setMessage(_message);
        setIsSuccessVisible(true);
        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject };
        });
    };

    const handleConfirm = () => {
        setIsSuccessVisible(false);
        promiseRef.current?.resolve(true);
    };

    // const SuccessPopup = () => {
    //     return (
        
    //     <Portal>
    //         <Modal
    //     style={{
    //         zIndex:5
    //     }}
    //         transparent={true}
    //         visible={isSuccessVisible}
    //         onDismiss={handleConfirm}
    //     >
    //         <View style={styles.modalContainer}>
    //             <View style={styles.modalContent}>
    //                 <FontAwesome name="check-circle" size={50} color="#00cc66" style={styles.modalIcon} />
    //                 <Text style={styles.modalText}>{message ? message : 'Report Submitted Successfully'}</Text>
    //                 <TouchableOpacity style={styles.okButton} onPress={handleConfirm}>
    //                     <Text style={styles.okButtonText}>OK</Text>
    //                 </TouchableOpacity>
    //             </View>
    //         </View>
    //     </Modal>
    //         </Portal>)
    // }

    const SuccessPopup = () => {
  return (
    <Portal>
      <Dialog 
      style={{backgroundColor:appColor.white,borderRadius:6}}
        visible={isSuccessVisible} 
        onDismiss={handleConfirm}
      >
        <Dialog.Content style={styles.content}>
          <FontAwesome
            name="check-circle" 
            size={50} 
            color="#00cc66" 
            style={styles.icon}
          />
          <Text style={styles.message}>
            {message || 'Report Submitted Successfully'}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleConfirm}
            style={styles.button}
            labelStyle={styles.buttonText}
            buttonColor="#00cc66"
          >
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

    return {
        SuccessPopup,
        showSuccessPopup,
        isSuccessVisible
    }
};



const styles = StyleSheet.create({
 dialog: {
    borderRadius: 16,
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  actions: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
