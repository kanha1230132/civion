import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import { Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { appColor } from "../../theme/appColor";
import { screenHeight, screenWidth } from "../../utils/Constants";

import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

const ImageViewer = ({ route, navigation }) => {
  console.log(route.params);
  return (
    <View
      style={{
        height: screenHeight - 100,
        backgroundColor: appColor.white,
        position: "relative",
        marginVertical: "auto",
      }}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="cancel" size={40} color={appColor.primary} />
      </TouchableOpacity>
      {route.params.uri ? (
       
           <ReactNativeZoomableView
          maxZoom={30}
          minZoom={1}
          contentWidth={screenWidth}
          contentHeight={screenHeight}
        >
    <Image
            source={{ uri: route.params.uri }}
            resizeMode="contain"
            style={{
              width: "100%",
              height: "83%",
              alignSelf: "center",
            }}
          />
        </ReactNativeZoomableView>
       

       
      ) : null}
    </View>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    right: 0,
    top: Platform.OS == "ios" ? 50 : 0,
    padding: 10,
    zIndex: 1,
    borderRadius: 0,
  },
  closeText: { fontSize: 30, color: "white" },
   container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
