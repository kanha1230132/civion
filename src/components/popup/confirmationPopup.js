import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { appColor } from "../../theme/appColor";
import { appFonts } from "../../theme/appFonts";
import { Button, Dialog, Modal, Portal } from "react-native-paper";

export const useConfirmationPopup = () => {
  const [popupVisible, setPopupVisible] = React.useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Confirmation');
  const [ok, setOk] = useState('OK');
  const [cancel, setCancel] = useState('CANCEL');
  const promiseRef = useRef(null);

  const showConfirmationPopup = (_title,_message, _ok = "OK",_cancel = "CANCEL") => {
    setTitle(_title);
    setMessage(_message);
    setOk(_ok);
    setCancel(_cancel);
    setPopupVisible(true);
    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
    });
  };

    const handleConfirm = () => {
        setPopupVisible(false);
      promiseRef.current?.resolve(true);
  };

  const handleCancel = () => {
    setMessage('')
    setPopupVisible(false);
    promiseRef.current?.resolve(undefined);
  };
  const ConfirmationPopup2 = () => {
    return (
      <Portal>
      <Modal transparent={true} visible={popupVisible}>
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={{fontSize:20,color:appColor.primary,fontFamily:appFonts.SemiBold,marginBottom:10}}>{title}</Text>
            <Text style={styles.message}>{message ? message : "Submission Failed"}</Text>
            <View style={{
                width:'100%',
                flexDirection:'row',
                justifyContent:'flex-end',
                marginTop:20
            }}>
            <TouchableOpacity style={styles.button} onPress={handleCancel}>
              <Text style={styles.buttonText}>{cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button,{marginLeft:10}]} onPress={handleConfirm}>
              <Text style={styles.buttonText}>{ok}</Text>
            </TouchableOpacity>
            </View>
            
          </View>
        </View>
      </Modal>
      </Portal>
    );
  }

    const ConfirmationPopup = () => {
    return (
      <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
      <Portal>
        <Dialog style={{backgroundColor:appColor.white,borderRadius:10}} visible={popupVisible} onDismiss={handleCancel}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Text>{message ? message : "Submission Failed"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancel}>{cancel}</Button>
            <Button onPress={handleConfirm} color="red">{ok}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
    );
  }


  

  return {
    showConfirmationPopup,
    ConfirmationPopup,
    popupVisible,

  }

};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  popup: {
    width: '85%',
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    color: "white",
  },
  message: {
    fontSize: 16,
    color: "black",
    fontFamily: appFonts.Medium,
    marginBottom: 15,
  },
  button: {
    // backgroundColor: appColor.primary,
    borderWidth: 1,
    borderColor: appColor.primary,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: appColor.primary,
    fontFamily: appFonts.Medium,

    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
