import React, { useRef, useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from "react-native";
import { appColor } from "../../theme/appColor";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import ViewShot, { captureRef } from "react-native-view-shot";
import { ImageBackground } from "react-native";
import { ScreenHeight, ScreenWidth } from "react-native-elements/dist/helpers";

export const useImageViewer = () => {
  const [imageViewerVisible, setImageViewerVisible] = React.useState(false);
  const [Uri, setUri] = useState('')
  const promiseRef = useRef(null);
  const imageRef = useRef(null);
  const [ImgWidth, setImgWidth] = useState(300);
  const [ImgHeight, setImgHeight] = useState(400);
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('')


  const showImageViewerPopup = (uri,location, _ok = "OK") => {
    setUri(uri);
    setLocation(location);
    setImageViewerVisible(true);
    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
    });
  };

  const handleCapture = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!imageRef.current) {
      console.warn('View ref not available');
      return '';
    }
    try {
      const uri = await captureRef(imageRef, {
        quality: 1,
        format: 'png',
      });
      console.log('Captured image uri:', uri);
      return uri
    } catch (error) {
      console.error('Error capturing view:', error);
      return ''
    }
  };

  const handleOK = async () => {
    const uri = await handleCapture();
      setImageViewerVisible(false);
      promiseRef.current?.resolve(uri);

  };

  const handleCancel = () => {
    setUri('')
    setImageViewerVisible(false);
    promiseRef.current?.resolve(undefined);
  };
  const ImageViewerPopup = () => {
    return (
      <Modal transparent={true} visible={imageViewerVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.popup}>

            <View  
                   style={[styles.iconContainer, {  
                    height: ImgHeight,
                width: ImgWidth}]} 
                   ref={imageRef} collapsable={false}>
              {Uri ?
              <>
                <Image
                  onLayout={(e) => {
                    e.preventDefault();
                    const { width, height } = e.nativeEvent.layout;
                    console.log("first", width, height);
                    setImgWidth(width);
                    setImgHeight(height)
                  }}

                  resizeMode='contain'
                  source={{ uri: Uri }} 
                  style={{
                    height: ImgHeight,
                    width: ImgWidth,
                  }}
                   />
                {time ? null : <Text style={{ position:'absolute',bottom:10,fontWeight:'600', fontSize: 12, color: 'red',alignSelf:'center' }}>{moment().format("YYYY/MM/DD hh:mm A")}</Text>} 

                    
               

                  </>
                : null}
            </View>

            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              position: "absolute",
              bottom: 20
            }}>
              <TouchableOpacity style={styles.button} onPress={handleCancel}>
                <MaterialIcons name="cancel" size={40} color="red" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleOK}>
                <MaterialIcons name="check" size={40} color={appColor.primary} />
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    );
  }

  return {
    showImageViewerPopup,
    ImageViewerPopup,
    imageViewerVisible,

  }

};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 1,
    // backgroundColor: 'white',
    
  },
  popup: {
    height: '100%',
    width: '100%',
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    paddingTop:120
  },
  iconContainer: {
    borderRadius: 25,
    backgroundColor: 'white',
  },
  icon: {
    fontSize: 24,
    color: "white",
  },
  message: {
    fontSize: 16,
    color: "black",
    marginBottom: 15,
  },
  button: {
    // backgroundColor: appColor.primary,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
