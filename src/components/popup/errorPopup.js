import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Dialog, Modal, Portal } from "react-native-paper";
import { appColor } from "../../theme/appColor";

export const useErrorPopup = () => {
  const [errorPopupVisible, setErrorPopupVisible] = React.useState(false);
  const [message, setMessage] = useState('')
  const promiseRef = useRef(null);

  const showErrorPopup = (_message, _ok = "OK") => {
    setMessage(_message);
    setErrorPopupVisible(true);
    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
    });
  };

  //   const handleConfirm = (item) => {
  //     setErrorPopupVisible(false);
  //     promiseRef.current?.resolve(item);
  // };

  const handleCancel = () => {
    setMessage('')
    setErrorPopupVisible(false);
    promiseRef.current?.resolve(true);
  };
  // const ErrorPopup = () => {
  //   return (
  //     <Portal>
  //     <Modal transparent={true} visible={errorPopupVisible} animationType="fade">
  //       <View style={styles.overlay}>
  //         <View style={styles.popup}>
  //           <View style={styles.iconContainer}>
  //             <MaterialIcons name="error" size={45} color={"#FF000080"} />
  //           </View>
  //           <Text style={styles.message}>{message ? message : "Submission Failed"}</Text>
  //           <TouchableOpacity style={styles.button} onPress={handleCancel}>
  //             <Text style={styles.buttonText}>OK</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     </Modal>
  //     </Portal>
  //   );
  // }
  const ErrorPopup = () => {
  return (
    <Portal>
      <Dialog 
        style={{backgroundColor:appColor.white,borderRadius:10}}
        visible={errorPopupVisible} 
        onDismiss={handleCancel}
      >
        <Dialog.Content style={styles.content}>
          <MaterialIcons 
            name="error" 
            size={45} 
            color="#FF000080" 
            style={styles.icon}
          />
          <Text style={styles.message}>
            {message || "Submission Failed"}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button 
            mode="text" 
            onPress={handleCancel}
            style={styles.button}
            labelStyle={styles.buttonText}
          >
            OK
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

  return {
    showErrorPopup,
    ErrorPopup,
    errorPopupVisible,

  }

};

const styles = StyleSheet.create({
 dialog: {
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
});
