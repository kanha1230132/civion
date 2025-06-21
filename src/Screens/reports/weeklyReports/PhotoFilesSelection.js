import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Constants } from "../../../utils/Constants";
import { SCREENS } from "../../../utils/ScreenNames";
import { ProjectContext } from "../../../utils/ProjectContext";
import apiClient from "../../../api/apiClient";
import { endPoints } from "../../../api/endPoints";
import moment from "moment";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColor } from "../../../theme/appColor";

const PhotoFilesSelection = ({navigation}) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [userId, setUserId] = useState(null);
   const [isLoading, setIsLoading] = useState(false);
   const isFocused = useIsFocused();
    const { photoSelect, setPhotoSelect} = useContext(ProjectContext);

  useEffect(() => {
    if(isFocused){
      getInitialPhotos();
      setPhotoSelect(photoSelect);
      if(photoSelect){
setSelectedPhotos(photoSelect);

      }
    }
  }, [isFocused]);

  const getInitialPhotos = async () => {
    try {
      setIsLoading(true);
            const savedUserId = await AsyncStorage.getItem(Constants.USER_ID)
            const response =  await apiClient.get(endPoints.URL_GET_PHOTO_FILE+`/${savedUserId}`);
            setUserId(savedUserId);
            if(response.status === 200){
                if(response.data.status === "success"){
                    const output = response.data.data;
                    console.log("output : ", output);
                    const map = new Map();

                    output.map((item) => {
                        if (map.has(item.date)) {
                            map.get(item.date).images.push({ uri: item.file_url, time: item.time });
                        } else {
                            map.set(item.date, {
                                date: item.date,
                                location: item.location,
                                images: [{ uri: item.file_url, time: item.time }],
                            });
                        }
                    });
                     const sortedGroups = Array.from(map.values()).sort((a, b) => {
                                            return moment(b.date, 'DD MMMM YYYY').toDate().getTime() - moment(a.date, 'DD MMMM YYYY').toDate().getTime();
                                        });
                                        console.log("sortedGroups ",sortedGroups)
                    setPhotos(sortedGroups);
                }
            }
      setIsLoading(false);
    } catch (error) {
      console.log("Error ",error)
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }

  const selectHandleImage = (item,index) => {
    // if()
    const { images,...restItem } = item;
    console.log("item : ", item);
    console.log("images : ", images);
    console.log("restItem : ", restItem);
    const mappedImage = { ...restItem, uri: images[index].uri, time: images[index].time };
    console.log("mappedImage : ",mappedImage)
    const indexOfMappedImage = selectedPhotos.findIndex((image) => image.uri === mappedImage.uri);
    console.log("indexOfMappedImage :",indexOfMappedImage)
    if(indexOfMappedImage != -1) {
       setSelectedPhotos(selectedPhotos.filter((item) => item.uri !== mappedImage.uri));
    }else{
        setSelectedPhotos([...selectedPhotos, mappedImage]);
    }
    
}

   const renderPhotoGroup = ({ item }) => (
          <View style={styles.photoSection}>
              <View style={styles.photoHeader}>
                  <Text style={styles.photoDate}>{item.date}</Text>
                  {/* <TouchableOpacity onPress={() => deletePhoto(item._id)}>
                      <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity> */}
              </View>
              <Text style={styles.photoLocation}>{item.location}</Text>
              <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoGrid}>
                  {item.images.map((image, index) => (
                       <TouchableOpacity
                          key={index}
                          // onPress={() => handleImageSelect(item,image.uri)}
                          onPress={() => selectHandleImage(item,index)}
                      >
                          <View style={styles.imageContainer}>
                          <TouchableOpacity onPress={() =>{}}>
                      <Ionicons name="trash" size={20} color="red" />
                  </TouchableOpacity>
                          <Image
                              source={{ uri: image.uri }}
                              style={styles.photo}
                              onError={(e) => console.log("Error loading image:", image.uri, e.nativeEvent.error)}
                          />
                          <Text style={styles.photoTime}>{image.time}</Text>
  
  
                          {console.log("selectedPhotos : ",selectedPhotos)}
  
                              {selectedPhotos.length > 0 && selectedPhotos.map((photo) => photo.uri).includes(image.uri) && (
                                  <View style={styles.selectionOverlay} />
                              )}
                          </View>
                      </TouchableOpacity>
                  ))}
  
              </ScrollView>
          </View>
      );
      const renderEmptyList = () => {
          return (
              <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No photos yet. Take a picture or select one from gallery.</Text>
              </View>
          );
      };
  return (
      <SafeAreaView style={{flex:1, backgroundColor:appColor.white}}>
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Photo Files</Text>
        {
          selectedPhotos.length > 0 && (
            <TouchableOpacity 
            style={{
              elevation: 5,
            }}
            onPress={() =>{
              navigation.goBack();
              setPhotoSelect(selectedPhotos);
            }} >
                <Ionicons name="checkmark" size={25} color="red" />
            </TouchableOpacity>
          )
        }
     
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.photo || item.photo}
        renderItem={renderPhotoGroup}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.photoList}
      />

    </View>
    </SafeAreaView>
  )
}

export default PhotoFilesSelection

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  takePictureButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#486ECD",
    padding: 8,
    borderRadius: 5,
  },
  takePictureText: {
    fontSize: 16,
    color: "#486ECD",
    marginLeft: 8,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#486ECD",
    padding: 8,
    borderRadius: 5,
  },
  galleryText: {
    fontSize: 16,
    color: "#486ECD",
    marginLeft: 8,
  },
  photoList: {
    paddingBottom: 16,
  },
  photoSection: {
    marginBottom: 16,
    backgroundColor: "#f2f4f7",
    padding: 10,
    borderRadius: 8,
  },
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  photoDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  photoTime: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 10,
  },
  photoLocation: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
  },
  photoGrid: {
    flexDirection: "row",
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 5,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 5,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  text: {
    fontSize: 12,
    color: 'white',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 255, 0.3)',
    borderRadius: 5
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadProgressText: {
    fontSize: 16,
    marginTop: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  bulkDeleteButton: {
    padding: 5
  }
});