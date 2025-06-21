import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  Platform,
} from "react-native";
import {
  EvilIcons,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Constants, ImageType } from "../../utils/Constants";
import { endPoints } from "../../api/endPoints";
import apiClient from "../../api/apiClient";
import LoaderModal from "../../components/modal/Loader";
import { useImageViewer } from "../../components/modal/ImageViewerModal";
import { SCREENS } from "../../utils/ScreenNames";
import { appColor } from "../../theme/appColor";
import { useErrorPopup } from "../../components/popup/errorPopup";
import { useSuccessPopup } from "../../components/popup/successPopup";
import ImagePickerModal from "../../components/modal/PhotoSelectorModal";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import moment from "moment";
import util from "../../utils/util";
import { appFonts } from "../../theme/appFonts";
import { imgURL } from "../../Assets";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

const PHOTO_DATA_KEY = "photoData";
const USER_TOKEN_KEY = "userToken";
const BASE_URL = `${endPoints.BASE_URL}/api/photos`;

const PhotoFiles = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const { SuccessPopup, showSuccessPopup, isSuccessVisible } =
    useSuccessPopup();
  const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
  const { showImageViewerPopup, ImageViewerPopup, imageViewerVisible } =
    useImageViewer();

    const isFocused = useIsFocused();
  useEffect(() => {
    if(isFocused){
        getInitialPhotos();
        setSelectedPhotos([]); 
    }
 
  }, [isFocused]);

  const getInitialPhotos = async () => {
    try {
      setIsLoading(true);
      const savedUserId = await AsyncStorage.getItem(Constants.USER_ID);
      const response = await apiClient.get(
        endPoints.URL_GET_PHOTO_FILE + `/${savedUserId}`
      );
      console.log("response : ", response.data);
      setUserId(savedUserId);
      if (response.status === 200) {
        if (response.data.status === "success") {
          const output = response.data.data;
          const map = new Map();

          output.map((item) => {
            if (map.has(item.date)) {
              map.get(item.date).images.push({
                uri: item.file_url,
                time: item.time,
                _id: item._id,
                selected: false,
              });
            } else {
              map.set(item.date, {
                date: item.date,
                location: item.location,
                images: [
                  {
                    uri: item.file_url,
                    time: item.time,
                    _id: item._id,
                    selected: false,
                  },
                ],
                selected: false,
              });
            }
          });
          for (const [date, group] of map.entries()) {
            group.images.sort((a, b) => {
              return (
                new Date(`1970-01-01T${b.time}`) -
                new Date(`1970-01-01T${a.time}`)
              );
            });
          }

          const sortedGroups = Array.from(map.values()).sort((a, b) => {
            return (
              moment(b.date, "DD MMMM YYYY").toDate().getTime() -
              moment(a.date, "DD MMMM YYYY").toDate().getTime()
            );
          });

          setPhotos(sortedGroups);
        } else {
          showErrorPopup(response?.data?.message || "Something went wrong");
        }
      } else if (response.status === 401 || response.status === 403) {
        await showErrorPopup(response?.data?.message || "Something went wrong");
        util.logoutUser();
        navigation.replace(SCREENS.LOGIN_SCREEN);
      } else {
        showErrorPopup(response?.data?.message || "Something went wrong");
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
      return token;
    } catch (error) {
      console.log("Error while fetching token:", error);
      return null;
    }
  };

  const handleTakePicture = async () => {
    // Request camera permissions

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert(
        "Permission Denied",
        "Camera permissions are required to take a photo."
      );
      return;
    }
    setImagePickerModal(false);
    if (Platform.OS === "ios") {
      await util.delay(1000);
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // Optional: allows user to crop/edit the image
        quality: 0.5, // Initial quality (0 to 1)
        
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // setIsLoading(true);
        let uri = result.assets[0].uri;
        const tempUri = await showImageViewerPopup(uri, '');
        console.log("tempUri : ", tempUri);
        if (tempUri) {
          uri = tempUri;
        }else{
          return;
        }
        setIsLoading(true);
       const formattedDate = moment().format("DD MMMM YYYY");
        const formattedTime = moment().format("HH:mm:ss");
        await uploadAttachments(uri, formattedDate, 'location', formattedTime);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
    // Launch camera
  };
  // Function to handle picking a picture from gallery
  const handlePickImage = async () => {
    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("galleryPermission : ", galleryPermission);
    if (!galleryPermission.granted) {
      Alert.alert(
        "Permission Denied",
        "Gallery permissions are required to select a photo."
      );
      return;
    }
    setImagePickerModal(false);
    if (Platform.OS === "ios") {
      await util.delay(1000);
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        let uri = result.assets[0].uri;
        const tempUri = await showImageViewerPopup(uri, "");
        if (tempUri) {
          uri = tempUri;
        } else {
          return;
        }
        setIsLoading(true);
        const formattedDate = moment().format("DD MMMM YYYY");
        const formattedTime = moment().format("HH:mm:ss");
        await uploadAttachments(uri, formattedDate, '', formattedTime);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error ,", error);
      setIsLoading(false);
    }
  };




  const savePhotoLocalStorage = async (
    imageUrl,
    formattedDate,
    location,
    formattedTime,
  ) => {
    setIsLoading(true);
    try {
      if (!userId) {
        Alert.alert("User ID is not present.");
        return;
      }

      // Provide fallback values if any field is null
      const date =
        formattedDate ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      const time =
        formattedTime ||
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
      const loc = location || "Unknown Location";
      const url = imageUrl.replace(/^.*?\.net\//, "");
      const requestParam = {
        userId: userId,
        imageurl: url,
        location: loc,
        date: date,
        time: time,
        projectId: "67acbfbd46d313f08f682ddf",
      };

      const response = await apiClient.post(
        endPoints.URL_UPLOAD_PHOTO_FILE,
        requestParam
      );
      if (
        (response.status == 200 || response.status == 201) &&
        response.data.status == "success"
      ) {
        showSuccessPopup("Photo saved successfully!").then((res) => {
          console.log("res", res);
        });
        getInitialPhotos();
        
      } else {
        showErrorPopup(response?.data?.message || "Failed to save photo");
      }
    } catch (error) {
      if (error.response) {
        console.log(
          "Error from server during savePhotoData:",
          error.response.data
        );
      } else {
        console.log("Error while saving PhotoData:", error.message);
      }

      showErrorPopup("Failed to save photo data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSelectedPhotos = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem(Constants.USER_TOKEN);

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
        showSuccessPopup("All selected photos deleted successfully.");
      } else {
        showErrorPopup("Some photos could not be deleted.");
      }

      getInitialPhotos();
    } catch (error) {
      console.error("Delete error:", error);
      showErrorPopup("Failed to delete photos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (imageId) => {
    const isSelected = selectedPhotos.includes(imageId);
    if (isSelected) {
      setSelectedPhotos(selectedPhotos.filter((id) => id !== imageId));
    } else {
      setSelectedPhotos([...selectedPhotos, imageId]);
    }
  };

  const selectHandleImage = (item, index) => {
    const { images, ...restItem } = item;
    const mappedImage = {
      ...restItem,
      uri: images[index].uri,
      time: images[index].time,
    };
    navigation.navigate(SCREENS.IMAGE_VIEWER, { uri: mappedImage.uri });
  };

  const handleLongPress = (item, pindex, index) => {
    const { images, ...restItem } = item;
    const mappedImage = {
      ...restItem,
      uri: images[index].uri,
      time: images[index].time,
      _id: images[index]._id,
      selected: true,
    };
    const indexOfMappedImage = selectedPhotos.findIndex(
      (image) => image.uri === mappedImage.uri
    );
    let selectPhotos = [];
    if (indexOfMappedImage != -1) {
      selectPhotos = selectedPhotos.filter(
        (item) => item.uri !== mappedImage.uri
      );
    } else {
      selectPhotos = [...selectedPhotos, mappedImage];
    }

    console.log("selectPhotos ", selectPhotos);
    setSelectedPhotos(selectPhotos);

    const _photos = [...photos];

    _photos[pindex].images[index].selected =
      !photos[pindex].images[index].selected;
    let _images = _photos[pindex].images;
    const isExist = _images.findIndex((image) => image.selected == true);
    if (isExist == -1) {
      _photos[pindex].selected = false;
    } else {
      _photos[pindex].selected = true;
    }
    setPhotos(_photos);
  };

  const uploadAttachments = async (
    uri,
    formattedDate,
    location,
    formattedTime
  ) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "image.jpg",
        type: "image/jpeg",
      });

      formData.append("type", ImageType.COMPANY);
      const response = await apiClient.post(
        endPoints.URL_UPLOAD_ATTACHMENTS,
        formData
      );
      console.log("response : ", response.data);
      if (response.status === 200 || response.status === 201) {
        const output = response.data;
        if (output.status == "success") {
          const url = output.data[0].fileUrl;
          savePhotoLocalStorage(
            url,
            formattedDate,
            location,
            formattedTime,
          );
        } else {
          showErrorPopup(output.message);
        }
      } else {
        showErrorPopup(output.message);
      }
    } catch (error) {}
  };

  // Render photo group
  const renderPhotoGroup = ({ item, index }) => {
    return (
      <View style={styles.photoSection} key={item?._id}>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            backgroundColor: "#f3f4f6",
            paddingHorizontal: 10,
            alignItems: "center",
            paddingVertical: 2,
          }}
        >
          <View
            style={{
              width: "90%",
            }}
          >
            <View style={styles.photoHeader}>
              <Text style={styles.photoDate}>{item.date}</Text>
            </View>

            {/* <Text style={styles.photoLocation}>{item.location}</Text> */}
          </View>

          {selectedPhotos.length > 0 && item?.selected && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteSelectedPhotos()}
            >
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            flexWrap: "wrap",
            // justifyContent: "space-between",
          }}
        >
          {item.images.map((image, innerindex) => {
            if (innerindex > 5) {
              return;
            }
            if (innerindex == 5) {
              return (
                <TouchableOpacity
                  style={{
                    width: "30%",
                    height: 120,
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f3f4f6",
                    borderRadius: 10,
                    flexDirection: "row",
                  }}
                  key={innerindex}
                  onPress={() => {
                    navigation.navigate(SCREENS.VIEW_ALL_PHOTO, { item: item });
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: appColor.primary,
                      fontFamily: appFonts.SemiBold,
                    }}
                  >
                    View All
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={appColor.primary}
                  />
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                style={{
                  width: "30%",
                  height: 120,
                  marginTop: 10,
                  borderWidth: 0.4,
                  borderColor: appColor.disabled,
                  borderRadius: 10,
                  margin: "1.5%",
                }}
                key={innerindex + Math.random().toString()}
                onPress={() => {
                  console.log("selectedPhotos.length ", selectedPhotos.length);
                  if (selectedPhotos.length > 0) {
                    handleLongPress(item, index, innerindex);
                  } else {
                    selectHandleImage(item, innerindex);
                  }
                }}
                onLongPress={() => handleLongPress(item, index, innerindex)}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.photo}
                    // resizeMode="contain"
                    onError={(e) =>
                      console.log(
                        "Error loading image:",
                        image.uri,
                        e.nativeEvent.error
                      )
                    }
                  />
                  <View
                    style={{
                      width: "100%",
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      flexDirection: "row",
                      backgroundColor: "#ffffff20",
                      justifyContent: "space-between",
                      paddingVertical: 2,
                      paddingHorizontal: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.photoTime}>Time : {image.time}</Text>
                  </View>

                  {image?.selected && (
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
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  const renderEmptyList = () => {
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>
          No photos yet. Take a picture or select one from gallery.
        </Text>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBackButton
        title={"Photo Files"}
        onBackClick={() => navigation.goBack()}
      />

      <View
        style={{
          paddingHorizontal: 15,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: appFonts.SemiBold,
            }}
          >
            Photos
          </Text>
          <TouchableOpacity
            onPress={() => setImagePickerModal(true)}
            style={{
              marginRight: 10,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: appColor.primary,
              paddingVertical: 2,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
          >
            <Image
              source={imgURL.ADD_IMAGE_ICON}
              style={{ width: 27, height: 27 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "regular",
              }}
            >
              Take Pictures
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={photos}
          keyExtractor={(item) => item.photo || item.photo}
          renderItem={renderPhotoGroup}
          ListEmptyComponent={renderEmptyList}
          style={styles.photoList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {imageViewerVisible && <ImageViewerPopup />}

      {errorPopupVisible ? ErrorPopup() : null}
      {isSuccessVisible ? SuccessPopup() : null}

      {imagePickerModal ? (
        <ImagePickerModal
          pickImageFromLibrary={() => handlePickImage()}
          takePhoto={() => handleTakePicture()}
          isVisible={imagePickerModal}
          onClose={() => setImagePickerModal(false)}
        />
      ) : null}

      <Modal
        visible={uploadModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#486ECD" />
            {uploadProgress !== null && (
              <Text style={styles.uploadProgressText}>
                Uploading {uploadProgress}%
              </Text>
            )}
          </View>
        </View>
      </Modal>
      {isLoading && (
        <LoaderModal visible={isLoading} message={loadingMessage} />
      )}
    </SafeAreaView>
  );
};
export default PhotoFiles;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 15,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: appFonts.SemiBold,
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
    // marginLeft: 8,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#486ECD",
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  galleryText: {
    fontSize: 16,
    color: "#486ECD",
    marginLeft: 8,
  },
  photoList: {
    width: "100%",
    paddingBottom: 16,
    marginBottom: 100,
  },
  photoSection: {
    width: "100%",
    marginBottom: 16,
    paddingVertical: 10,
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
    fontFamily: appFonts.SemiBold,
    wordWrap: "wrap",
  },
  photoTime: {
    fontFamily: appFonts.Regular,
    fontSize: 9,
    color: "#6b7280",
    marginLeft: 10,
    marginVertical: 0,
  },
  photoLocation: {
    fontFamily: appFonts.Regular,
    fontSize: 12,
    color: "#6b7280",
  },
  photoGrid: {
    flexDirection: "row",
  },
  deleteButton: {
    height: 30,
    backgroundColor: appColor.white,
    borderRadius: 6,
    padding: 3,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    position: "relative",
    marginRight: 10,
    borderRadius: 5,
    height: 120,
  },
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  text: {
    fontSize: 12,
    color: "white",
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 255, 0.3)",
    borderRadius: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadProgressText: {
    fontSize: 16,
    marginTop: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  bulkDeleteButton: {
    padding: 5,
  },
});
