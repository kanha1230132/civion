import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import HeaderWithBackButton from '../../components/HeaderWithBackButton'
import { appColor } from '../../theme/appColor';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { SCREENS } from '../../utils/ScreenNames';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { endPoints } from '../../api/endPoints';
import apiClient from '../../api/apiClient';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';
import LoaderModal from '../../components/modal/Loader';

const ViewAllPhoto = ({ navigation, route }) => {
    const { images, location, date } = route?.params?.item;
    const [Images, setImages] = useState([...images])
      const [selectedPhotos, setSelectedPhotos] = useState([]);
        const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
        const { SuccessPopup, showSuccessPopup, isSuccessVisible } =
          useSuccessPopup();
            const [loadingMessage, setLoadingMessage] = useState("");
            const [isLoading, setIsLoading] = useState(false);
          
   

      const handlelongPress = (item,index) => {
          try {
            const isExist = selectedPhotos.findIndex((image) => image.uri === item.uri);
            if (isExist != -1) {
              setSelectedPhotos(selectedPhotos.filter((image) => image.uri !== item.uri));
              const item1 = {...item,selected: false};
              let tempImages = [...Images];
              tempImages[index] = item1;
              setImages(tempImages);


            } else {
              setSelectedPhotos([...selectedPhotos, item]);
              const item1 = {...item,selected: true};
              let tempImages = [...Images];
              tempImages[index] = item1;
              setImages(tempImages);

            }
          } catch (error) {
            console.log("Error in handlelongPress: ", error);
          }
      }

      const refreshList = () => {
        setSelectedPhotos([]);
        const images = Images.filter((item)=> item?.selected == false);
        setImages([...images]);
      };

      const deleteSelectedPhotos = async () => {
    setIsLoading(true);

    try {
      const deleteRequests = selectedPhotos.map((photo) => {
        const photoId = photo._id;
        const response = apiClient.delete(
          `${endPoints.URL_GET_PHOTO_FILE}/${photoId}`
        );
        return response;
      });

      const results = await Promise.all(deleteRequests);

      let allSuccess = true;

      results.forEach(async (response) => {
        if (response.status == 401 || response.status == 403) {
          const result = await showErrorPopup(response?.data?.message);
          if (result) {
            util.logoutUser();
            navigation.navigate(SCREENS.LOGIN_SCREEN);
          }
          return;
        }
        if (
          !(response.status === 200 || response.status === 201) ||
          !response.data.status
        ) {
          allSuccess = false;
        }
      });

      if (allSuccess) {
        await showSuccessPopup("All selected photos deleted successfully.");
        refreshList();
      } else {
        showErrorPopup("Some photos could not be deleted.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showErrorPopup("Failed to delete photos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

    const renderImages = ({ item,index }) => {
        return (
            <TouchableOpacity 
            onLongPress={() => handlelongPress(item,index)}
            onPress={()=>{
                if(selectedPhotos.length > 0){
                    handlelongPress(item,index)
                }else{
                navigation.navigate(SCREENS.IMAGE_VIEWER, { uri: item.uri });
                }
            }} style={styles.imageWrapper} key={index.toString()}>
                <Image
                    source={{ uri: item.uri }}
                    style={styles.photo}
                    onError={(e) =>
                        console.log("Error loading image:", item.uri, e.nativeEvent.error)
                    }
                />
                <View style={styles.photoOverlay}>
                    <Text style={styles.photoTime}>{item.time}</Text>
                </View>

                {item?.selected && (
                                    <View
                                      style={{
                                        position: "absolute",
                                        top: 5,
                                        right: 5,
                                      }}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color="green"
                                      />
                                    </View>
                                  )}
               
            </TouchableOpacity>
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithBackButton title={date} onBackClick={() => navigation.goBack()} />

            <View style={{
                flexDirection: 'row', width: '100%', justifyContent: 'space-between', backgroundColor: "#f3f4f6", paddingHorizontal: 10,
                alignItems: "center",
                paddingVertical: 15,
                marginTop: 20
            }}>
                <Text style={styles.photoLocation}>{location == "Unknown Location" ? "Photo Files": location}</Text>

 {selectedPhotos.length > 0 && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteSelectedPhotos()}
            >
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
            </View>

            <ScrollView style={{ flex: 1 }}>
                {/* <View style={styles.photoList}> */}
                    <FlatList
                        data={Images}
                        keyExtractor={(item, index) => `${item._id}-${index}`}
                        renderItem={renderImages}
                        style={{
                            paddingBottom: 10,
                            marginBottom: 10
                        }}
                        contentContainerStyle={styles.photoList}
                        numColumns={2}
                        showsVerticalScrollIndicator={false}
                    />

                {/* </View> */}

            </ScrollView>

 {errorPopupVisible ? ErrorPopup() : null}
      {isSuccessVisible ? SuccessPopup() : null}
      {isLoading && (
              <LoaderModal visible={isLoading} message={loadingMessage} />
            )}
        </SafeAreaView>
    )
}

export default ViewAllPhoto

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: 15,
    },
    photoLocation: {
        fontSize: 14,
        color: appColor.primary,
    },
    photoList: {
        width:'100%',
        flexDirection:'row',
        flexWrap:'wrap',
        paddingHorizontal: 10,
        paddingBottom: 20,
        marginTop:10,
        height: '100%',

       
    },
    imageWrapper: {
        width: '48%',
        margin: '1%',
        borderWidth:0.2,
        borderColor: appColor.disabled,
        borderRadius:10,
        elevation:3,
        
        
    },
    photo: {
        width: '100%',
        height: 180,
        borderRadius: 10,
    },
    photoOverlay: {
        position: "absolute",
        bottom: 0,
        width: '100%',
        backgroundColor: '#00000050',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    photoTime: {
        color: 'white',
        fontSize: 12,
    },
});
