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
    Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { Constants, ImageType } from "../utils/Constants";
import { endPoints } from "../api/endPoints";
import apiClient from "../api/apiClient";
import LoaderModal from "../components/modal/Loader";
import { useImageViewer } from "../components/modal/ImageViewerModal";
import { SCREENS } from "../utils/ScreenNames";
import { appColor } from "../theme/appColor";
import { useSuccessPopup } from "../components/popup/successPopup";
import { useErrorPopup } from "../components/popup/errorPopup";

const PHOTO_DATA_KEY = "photoData";
const USER_TOKEN_KEY = "userToken";
const USER_ID_KEY = "userId";
const BASE_URL = `${endPoints.BASE_URL}/api/photos`;

const PhotosF = ({ navigation }) => {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const viewRef = useRef(null);
    const { SuccessPopup,showSuccessPopup,isSuccessVisible} = useSuccessPopup();
    const {showErrorPopup,ErrorPopup,errorPopupVisible} = useErrorPopup();
    const { showImageViewerPopup,
        ImageViewerPopup,
        imageViewerVisible,} = useImageViewer()

    useEffect(() => {
        getInitialPhotos()
    }, []);

    const getInitialPhotos = async () => {
        try {
            setIsLoading(true);
            const savedUserId = await AsyncStorage.getItem(USER_ID_KEY)
            const response =  await apiClient.get(endPoints.URL_GET_PHOTO_FILE+`/${savedUserId}`);
            setUserId(savedUserId);
            if(response.status === 200){
                if(response.data.status === "success"){
                    const output = response.data.data;
                    const map = new Map();

                    output.map((item) => {
                        if (map.has(item.date)) {
                            map.get(item.date).images.push({ uri: item.file_url, time: item.time, _id: item._id });
                        } else {
                            map.set(item.date, {
                                date: item.date,
                                location: item.location,
                                images: [{ uri: item.file_url, time: item.time, _id: item._id }],
                            });
                        }
                    });
                    setPhotos(Array.from(map.values()));
                }
            }

          
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }finally{
            setIsLoading(false);
        }
    }

   

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const savedUserId = await AsyncStorage.getItem(USER_ID_KEY)
            setUserId(savedUserId)
            const savedData = await getData(PHOTO_DATA_KEY);
            if (savedData) {
                setPhotos(savedData);
            }
            if (savedUserId) {
                fetchPhotos(savedUserId);
            }
        } catch (error) {
            console.log("Error fetching initial data : ", error)
            Alert.alert("Error while loading Initial data, please try again later.")
        } finally {
            setIsLoading(false);
        }
    };

    const saveData = async (key, value) => {
        try {
            const jsonValue = JSON.stringify(value)
            console.log("saving local storage with:", jsonValue)
            await AsyncStorage.setItem(key, jsonValue)
        } catch (e) {
            console.log("error storing data:", e)
        }
    };
    const getData = async (key) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key)
            const savedData = jsonValue != null ? JSON.parse(jsonValue) : null;
            console.log("Loaded photos from local storage:", savedData);
            return savedData
        } catch (e) {
            console.log("Error getting data:", e)
        }
    };
    const fetchPhotos = async (userId) => {
        try {
            const token = await getToken();
            if (!token) {
                Alert.alert("Failed to authenticate user, please login again.");
                return;
            }

            const response = await axios.get(`${BASE_URL}/photo-files/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("response : ", response.data)

            if (response.data.status === "success") {
                const cachedPhotos = response.data.data.map((item) => {
                    const correctedImagePath = `${endPoints.BASE_URL}/${item.photo.replace(/\\/g, "/")}`;
                    return { ...item, images: [{ uri: correctedImagePath }] };
                });
                 console.log("Cached photos from fetchPhotos:", cachedPhotos);
                setPhotos(cachedPhotos);
                saveData(PHOTO_DATA_KEY, cachedPhotos);
            } else {
                Alert.alert("Error loading data from server, please try again later.");
                console.log("Error response:", response);
            }
        } catch (error) {
            if (error.response) {
                console.log("Error fetching photos (Server Response):", error.response.data);
            } else {
                console.log("Error fetching photos (General):", error.message);
            }
            Alert.alert("Failed to fetch images from server, please try again later.");
        }
    };


    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem(USER_TOKEN_KEY)
            return token
        } catch (error) {
            console.log("Error while fetching token:", error)
            return null
        }
    };

    const moveImage = async (imageUri) => {
        try {
          const fileName = imageUri.split('/').pop(); // Get the file name from URI
          const newPath = FileSystem.documentDirectory + fileName;
      
          await FileSystem.copyAsync({
            from: imageUri,
            to: newPath,
          });
      
          console.log('Image moved to:', newPath);
          return newPath; // This is the new path you can use later
        } catch (error) {
          console.error('Error moving image:', error);
        }
      };
      
    // Function to handle taking a picture
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
        try {
            
            const result = await ImagePicker.launchCameraAsync();

            if (!result.canceled && result.assets && result.assets.length > 0) {
            setIsLoading(true);
                let uri = result.assets[0].uri;
                console.log("uri : ", uri);
                const tempUri = await showImageViewerPopup(uri);
                console.log("tempUri : ", tempUri);
                if(tempUri == undefined){
                    setIsLoading(false);
                    return;
                }
                if(tempUri){
                    uri = tempUri   
                }
                // Extract EXIF data
                const exifData = await extractExifData(uri);
                const location = exifData.location || await getLocation();
                const formattedDate = exifData.date
                const formattedTime = exifData.time;
    
                // Upload image and get the URL
                // uploadImage(uri, formattedDate, location, formattedTime);
                // const newPath = await moveImage(uri);
                // console.log("new Path Loc : ", newPath)
                await uploadAttachments(uri, formattedDate, location, formattedTime);
            setIsLoading(false);

            } 
        } catch (error) {
            setIsLoading(false);
        }
        // Launch camera
        
    };
    // Function to handle picking a picture from gallery
    const handlePickImage = async () => {
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPermission.granted) {
            Alert.alert(
                "Permission Denied",
                "Gallery permissions are required to select a photo."
            );
            return;
        }
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                // allowsEditing: true,
                // aspect: [4, 3],/
                quality: 1,
            });
            
            if (!result.canceled && result.assets && result.assets.length > 0) {
                let  uri = result.assets[0].uri;
                setIsLoading(true);
                const tempUri = await showImageViewerPopup(uri);
                console.log("tempUri : ", tempUri);
                if(tempUri == undefined){
                    setIsLoading(false);
                    return;
                }
                if(tempUri){
                    uri = tempUri   
                }

                console.log("imageInfo : ", uri)
                const exifData = await extractExifData(uri);
                const location = exifData.location || await getLocation();
                const formattedDate = exifData.date
                const formattedTime = exifData.time
                // Upload image and get the URL
                // uploadImage(uri, formattedDate, location, formattedTime)
                await uploadAttachments(uri, formattedDate, location, formattedTime);
                setIsLoading(false);

    
    
            }
        } catch (error) {
            console.log("Error ,",error);
            setIsLoading(false)
        }
        
    };
    const extractExifData = async (imageUri) => {
        try {

            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [],
                {
                    base64: false,
                    exif: true,
                }
            );
            console.log("Image Manipulation Result:", manipResult);
            if (manipResult.exif) {
                const exif = manipResult.exif
                let location = null
                let date = null;
                let time = null
                //extract the location if present in exif data
                if (exif.GPSLongitude && exif.GPSLatitude) {
                    location = { latitude: exif.GPSLatitude, longitude: exif.GPSLongitude }
                    const address = await Location.reverseGeocodeAsync(location);
                    location = address[0]?.city || "Unknown Location";
                }
                //extract the date and time if present in exif data
                if (exif.DateTimeOriginal) {
                    let exifDateTime = new Date(exif.DateTimeOriginal)
                    date = exifDateTime.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    });
                    time = exifDateTime.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                }
                return { location: location, date: date, time: time }
            } else {
                return { location: null, date: null, time: null }
            }
        } catch (error) {
            console.log("Error extracting EXIF data:", error);
            return { location: null, date: null, time: null }
        }
    };
    const getLocation = async () => {
        try {
            // Request location permissions
            const locationPermission =
                await Location.requestForegroundPermissionsAsync();
            if (!locationPermission.granted) {
                Alert.alert(
                    "Permission Denied",
                    "Location permissions are required to add location data."
                );
                return "Unknown Location"
            }
            // Fetch location
            const location = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync(location.coords);
            const locationName = address[0]?.city || "Unknown Location";
            return locationName
        } catch (error) {
            console.log("Error fetching location:", error);
            return "Unknown Location";
        }
    };
    const uploadImage = async (uri, formattedDate, location, formattedTime) => {
        setUploadModalVisible(true);

        try {
            const token = await getToken()
            
            if (!token) {
                Alert.alert("Failed to authenticate user, please login again.");
                return;
            }
            const uploadData = new FormData();


            uploadData.append("photo", {
                uri: uri,
                name: "image.jpg",
                type: "image/jpeg",
            });

            const response = await axios.post(
                `${BASE_URL}/upload-photo`,
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                }
            );
            console.log("Upload response:", response.data);
            if (response.data.status === 'success') {
                const imageUrl = response.data.data;
                // const cachedImagePath = await uploadAndCacheImage(imageUrl)
                const cachedImagePath = getCorrectPath(imageUrl);
                // savePhotoData(cachedImagePath, formattedDate, location, formattedTime, token);
                savePhotoLocalStorage(cachedImagePath, formattedDate, location, formattedTime, token);
                console.log('Upload successful:', response.data.message);
                Alert.alert("Image uploaded successfully.");
            } else {
                console.log('Upload Failed:', response.data.message)
                Alert.alert("Failed to upload image. Try again later.");
            }
        } catch (error) {
            console.log("Error uploading image:", error);
            Alert.alert(
                "Upload Failed",
                "Failed to upload Image. Try Again Later."
            );
        } finally {
            setUploadProgress(null);
            setUploadModalVisible(false);
        }
    };
    const uploadAndCacheImage = async (imageUrl) => {
        try {
            const correctedImageUrl = `${imageUrl.replace("http://0.0.0.0:5001", endPoints.BASE_URL)}`;
            console.log("Corrected Image URL:", correctedImageUrl);

            const imageName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            const cachedImagePath = `${FileSystem.cacheDirectory}${imageName}`;

            const image = await FileSystem.downloadAsync(correctedImageUrl, cachedImagePath);
            if (image.status === 200) {
                console.log("Image cached successfully:", cachedImagePath);
                return cachedImagePath;
            } else {
                console.log("Failed to cache image:", correctedImageUrl);
                return correctedImageUrl; // Fallback to URL
            }
        } catch (error) {
            console.log("Error caching image:", error);
            return imageUrl; // Fallback to original URL
        }
    };


    const getCorrectPath = (imageUrl)=>{
        const correctedImageUrl = `${imageUrl.replace("http://0.0.0.0:5001", endPoints.BASE_URL)}`;
        console.log("Corrected Image URL:", correctedImageUrl);
        return correctedImageUrl
    }

    const savePhotoLocalStorage = async (imageUrl, formattedDate, location, formattedTime, token) => {
        setIsLoading(true);
        try {
            if (!userId) {
                Alert.alert("User ID is not present.");
                return;
            }

            // Provide fallback values if any field is null
            const date = formattedDate || new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
            const time = formattedTime || new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const loc = location || "Unknown Location";
            const url = imageUrl.replace(/^.*?\.net\//, "");
            const requestParam = {
                "userId": userId,
                "imageurl" : url,
                "location": loc,
                "date": date,
                "time":time
            }

            const response = await apiClient.post(endPoints.URL_UPLOAD_PHOTO_FILE, requestParam);
            console.log("response : ",response);
            if((response.status == 200 || response.status == 201) && response.data.status == "success"){
                getInitialPhotos();
                showSuccessPopup("Photo saved successfully!").then((res)=>{
                    console.log("res",res)
                })
            }else{
                showErrorPopup('Failed to save photo');
            }
            // const photos = await AsyncStorage.getItem(Constants.LOCAL_PHOTOS);
            // if(photos){
            //     const parsedPhotos = JSON.parse(photos);
            //     const index = parsedPhotos.findIndex((item) => item.date == payload.date);
            //     console.log("Index found : ", index);
            //     if (index !== -1) {

            //         parsedPhotos[index].images.push({ uri: imageUrl,time:time })
            //     }else{
            //         parsedPhotos.push({
            //             userId: userId,
            //             images: [{ uri: imageUrl, time: time }],
            //             location: loc,  
            //             date: date,
            //         })
            //     }
            //     await AsyncStorage.setItem(Constants.LOCAL_PHOTOS, JSON.stringify(parsedPhotos));
            //     Alert.alert("Photo saved successfully.");
            //     setPhotos(parsedPhotos);
            //     return parsedPhotos
            // }else{
            //     const updatedPhoto = {
            //         userId: userId,
            //         images: [{ uri: imageUrl, time: time }],
            //         location: loc,  
            //         date: date,}
            //     await AsyncStorage.setItem(Constants.LOCAL_PHOTOS, JSON.stringify([updatedPhoto]));
            //     Alert.alert("Photo saved successfully.");
            //     setPhotos([updatedPhoto]);
            //     return [updatedPhoto]
            // }



        } catch (error) {
            if (error.response) {
                console.log("Error from server during savePhotoData:", error.response.data);
            } else {
                console.log("Error while saving PhotoData:", error.message);
            }

            showErrorPopup('Failed to save photo data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }


    const deletePhoto = async (photoId) => {
        setIsLoading(true);
        try {
            const token = await getToken()
            if (!token) {
                showErrorPopup("Failed to authenticate user, please login again.");
                return;
            }
            const url = `${BASE_URL}/photo-files/${photoId}`;
            console.log("url : ", url)
            const response = await axios.delete(
                `${BASE_URL}/photo-files/${photoId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            if(response.status == 200 || response.status == 201){
                if(response.data.status){
                    getInitialPhotos();
                    showSuccessPopup("Photo deleted successfully.");
                    return;
                }
            }

            showErrorPopup("Failed to delete the photo, try again later.");
        } catch (error) {
            console.log("Error deleting image:", error);
            showErrorPopup("Failed to delete the photo, try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleBulkDelete = async () => {
        if (selectedPhotos.length === 0) {
            Alert.alert("No images selected", "Please select images to delete.");
            return;
        }
        setIsLoading(true);
        try {
            const token = await getToken()
            if (!token) {
                Alert.alert("Failed to authenticate user, please login again.");
                return;
            }
            const deletePromises = selectedPhotos.map(photoId =>
                axios.delete(
                    `${BASE_URL}/photo-files/${photoId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                )
            );
            const response = await Promise.all(deletePromises);
            const allSuccess = response.every((res) => res.data.status === "success");
            if (allSuccess) {
                Alert.alert("Photos deleted successfully.");
                fetchPhotos(userId);
                setSelectedPhotos([]);
            } else {
                Alert.alert("Failed to delete all images. Please try again.");
                console.log("Failed to delete images response:", response)
            }
        } catch (error) {
            console.log("Error deleting images:", error);
            Alert.alert("Failed to delete images, try again later.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleImageSelect = (imageId) => {
        const isSelected = selectedPhotos.includes(imageId)
        if (isSelected) {
            setSelectedPhotos(selectedPhotos.filter((id) => id !== imageId))
        } else {
            setSelectedPhotos([...selectedPhotos, imageId])
        }
    };

    const selectHandleImage = (item,index) => {
        const { images,...restItem } = item;
        const mappedImage = { ...restItem, uri: images[index].uri, time: images[index].time };
        navigation.navigate(SCREENS.IMAGE_VIEWER, { uri: mappedImage.uri });
    }

    const handleLongPress = (item,index)=>{
        const { images,...restItem } = item;
        const mappedImage = { ...restItem, uri: images[index].uri, time: images[index].time };
        const indexOfMappedImage = selectedPhotos.findIndex((image) => image.uri === mappedImage.uri);
        if(indexOfMappedImage != -1) {
           setSelectedPhotos(selectedPhotos.filter((item) => item.uri !== mappedImage.uri));
        }else{
            setSelectedPhotos([...selectedPhotos, mappedImage]);
        }
    }
   

    const uploadAttachments = async (uri, formattedDate, location, formattedTime) => {
        try {
            const token = await getToken()
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: 'image.jpg',
                type: 'image/jpeg',
            });

            formData.append('type', ImageType.COMPANY);
            const response = await apiClient.post(endPoints.URL_UPLOAD_ATTACHMENTS, formData);
            // console.log("response : ", response)
            if(response.status === 200 || response.status === 201){
                const output = response.data
            if(output.success){
                const url = output.result[0].fileUrl;
                savePhotoLocalStorage(url, formattedDate, location, formattedTime, token);
            }else{
                showErrorPopup(output.message);
            }
            }else{
                showErrorPopup(output.message);
            }
         

        } catch (error) {

        }
    }

    


    // Render photo group
    const renderPhotoGroup = ({ item }) => {
        return (
<View style={styles.photoSection} key={item?._id}>
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
                        onLongPress={() => handleLongPress(item,index)}
                    >
                        <View style={styles.imageContainer}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => deletePhoto(image?._id)}>
                    <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
                        <Image
                            source={{ uri: image.uri }}
                            style={styles.photo}
                            onError={(e) => console.log("Error loading image:", image.uri, e.nativeEvent.error)}
                        />
                        <Text style={styles.photoTime}>{image.time}</Text>
                            {selectedPhotos.length > 0 && selectedPhotos.map((photo) => photo.uri).includes(image.uri) && (
                                <View style={styles.selectionOverlay} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </View>
        )
    
}
    const renderEmptyList = () => {
        return (
            <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No photos yet. Take a picture or select one from gallery.</Text>
            </View>
        );
    };
    return (
        <View style={styles.container}>
            <Modal visible={uploadModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#486ECD" />
                        {uploadProgress !== null && (
                            <Text style={styles.uploadProgressText}>Uploading {uploadProgress}%</Text>
                        )}
                    </View>
                </View>
            </Modal>
            {isLoading && (
                // <View style={styles.loadingOverlay}>
                //     <ActivityIndicator size="large" color="#0000ff" />
                // </View>
                <LoaderModal visible={isLoading} />
            )}

            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(SCREENS.MAIN_TABS)}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Photo Files</Text>
                {/* {selectedPhotos.length > 0 && (
                    <TouchableOpacity onPress={handleBulkDelete} style={styles.bulkDeleteButton}>
                        <Ionicons name="trash" size={24} color="red" />
                    </TouchableOpacity>
                )} */}
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.takePictureButton}
                    onPress={handleTakePicture}>
                    <Ionicons name="camera" size={20} color="#486ECD" />
                    <Text style={styles.takePictureText}> Take Pictures</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={handlePickImage}>
                    <Ionicons name="images" size={20} color="#486ECD" />
                    <Text style={styles.galleryText}> Choose from Gallery</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={photos}
                keyExtractor={(item) => item.photo || item.photo}
                renderItem={renderPhotoGroup}
                ListEmptyComponent={renderEmptyList}
                contentContainerStyle={styles.photoList}
            />

{    imageViewerVisible && (
        <ImageViewerPopup />
    )
}

{errorPopupVisible ?
                ErrorPopup(): null
            }
            {
                isSuccessVisible  ?
                SuccessPopup(): null
            }
        </View>
    );
};
export default PhotosF;
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
    deleteButton: {
       position: 'absolute',
       top: 5,
       right: 5,
       zIndex: 1,
       backgroundColor:appColor.white, 
       borderRadius: 6,
       padding: 3
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