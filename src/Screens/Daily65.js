import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    ActionSheetIOS,
    Alert,
    PermissionsAndroid,
    Modal,
    Animated,
    Dimensions,
    KeyboardAvoidingView
} from "react-native";
import { Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { endPoints } from "../api/endPoints";
import { Constants, ImageType } from "../utils/Constants";
import apiClient from "../api/apiClient";
import { useErrorPopupContext } from "../context/PopupProvider";
import util from "../utils/util";
import { SCREENS } from "../utils/ScreenNames";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { appColor } from "../theme/appColor";
import { appFonts } from "../theme/appFonts";
import ImagePickerModal from "../components/modal/PhotoSelectorModal";
import { useImageViewer } from "../components/modal/ImageViewerModal";
import LoaderModal from "../components/modal/Loader";
import moment from "moment";
import { useErrorPopup } from "../components/popup/errorPopup";
import { useSuccessPopup } from "../components/popup/successPopup";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaWrapper } from "../../App";
import useKeyboard from "../hooks/useKeyboard";

const { width, height } = Dimensions.get('window');


const Daily65 = ({ route, navigation }) => {
    const [imagePickerModal, setImagePickerModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { employeeName, startDate, endDate, category, expenditure, projectNumber, task } = route.params;
    const parsedStartDate = startDate ? new Date(startDate) : null;
    const parsedEndDate = endDate ? new Date(endDate) : null;

    const [expenses, setExpenses] = useState([{ title: "", amount: "", category: category, isInitial: true ,  "images": [] }]);
    const [total, setTotal] = useState(0);
    const [isImagePickerActive, setIsImagePickerActive] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const scale = useRef(new Animated.Value(1)).current;
    const [mileageAmount, setMileageAmount] = useState(0);
    const [userId, setUserId] = useState(null); // Local state for userId
    const {showErrorPopup,ErrorPopup,errorPopupVisible} = useErrorPopup();
    const { SuccessPopup,showSuccessPopup,isSuccessVisible} = useSuccessPopup();
    const { showImageViewerPopup,
        ImageViewerPopup,
        imageViewerVisible, } = useImageViewer();
        const [selectedIndex, setSelectedIndex] = useState(0)
        const [loading, setLoading] = useState(false)
 const {keyboardOpen} = useKeyboard();
    useEffect(() => {
        // fetchMileageAmount();
        console.log("startDate : ", startDate)
        console.log("endDate : ", endDate)
        const tStartDate = moment(startDate).clone().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS');
        const tEndDate = moment(endDate).clone().endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS');
        getMileageHistory(tStartDate, tEndDate);
    }, []);


    const getMileageHistory =  async (startDate, endDate)=>{
        try {
          setIsLoading(true)
          const user_id = await AsyncStorage.getItem(Constants.USER_ID);
          const url = `${endPoints.URL_MILAGE_HISTRY}/${user_id}?startDate=${startDate}&endDate=${endDate}`;
          const response = await apiClient.get(url);
          if(response.status === 200){
            if(response.data.status === 'success'){
            const mileageTotal = response.data?.data.reduce((acc, trip) => {
                const expenses = parseFloat(trip.expenses) || 0; // Parse as float
                return acc + expenses;
            }, 0);
            setMileageAmount(typeof mileageTotal === 'number' ? mileageTotal : 0);

              return;
            }
          }
          showErrorPopup(response?.data?.message || "Something went wrong");
        } catch (error) {
          console.log("Error fetching mileage history:", error.response?.data || error.message);
          showErrorPopup("Error fetching mileage history:", error.response?.data || error.message);
        } finally {
            setIsLoading(false)
        }
      }

    const fetchMileageAmount = async () => {
        try {
            const userId = await AsyncStorage.getItem(Constants.USER_ID);

            const response = await apiClient.get(`${endPoints.URL_MILAGE_HISTRY}/${userId}`);
            console.log("response : ", response)
            if (response.status == 403 || response.status == 401) {
                // const result = await showErrorPopup(response?.data?.message);
                // if(result){
                //   util.logoutUser();
                //   navigation.navigate(SCREENS.LOGIN_SCREEN);
                // }
                return;
            }

            console.log("response : ", response)


            if (response.status === 200) {
                //response.data is now a type array
                if (Array.isArray(response.data?.data) && response.data?.data?.length > 0) {
                    response.data?.data.forEach(trip => {
                        console.log("Trip Data:", JSON.stringify(trip, null, 2));
                    });

                    const mileageTotal = response.data?.data.reduce((acc, trip) => {
                        const expenses = parseFloat(trip.expenses) || 0; // Parse as float
                        console.log(`Adding trip expenses: ${expenses}`);
                        return acc + expenses;
                    }, 0);

                    console.log("Total Mileage Expenses:", mileageTotal);

                    setMileageAmount(typeof mileageTotal === 'number' ? mileageTotal : 0);
                } else {
                    console.log("No mileage data found. Setting to 0.");
                    setMileageAmount(0);
                }
            } else {
                console.log("API request failed with status:", response.status);
                Alert.alert("Error", "Failed to fetch mileage data.");
                setMileageAmount(0);
            }
        } catch (error) {
            console.log("Error : ", error);
            Alert.alert("Error", (error?.response?.data?.message));
            setMileageAmount(0);
        }
    };

    // Fetch mileage when startDate or endDate changes
    // useEffect(() => {
    //     if (parsedStartDate && parsedEndDate && userId) {
    //         fetchMileageAmount();
    //     }
    // }, [parsedStartDate, parsedEndDate, userId]);



    const handlePinchGesture = Animated.event(
        [{ nativeEvent: { scale } }],
        { useNativeDriver: true }
    );
    const handlePinchStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true
            }).start();
        }
    };
    // Function to add a new expense entry with a dynamic category
    const addExpense = () => {
        try {
            console.log("expenses: ", expenses?.length)
            // const newCategoryNumber = expenses.length + 1;
            const newExpense = {
                title: "",
                amount: "",
                category: `Category ${expenses?.length + 1}`,
                isInitial: false, // Mark this as not the initial category,
                images: []
            };
            setExpenses([...expenses, newExpense]);  
        } catch (error) {
            console.log("Error addExpense : ", error);
        }
        
    };

    // Function to update expense information
    const updateExpense = (index, field, value) => {
        console.log("updateExpense called with:", index, field, value);
        const updatedExpenses = [...expenses];
        updatedExpenses[index][field] = value;
        setExpenses(updatedExpenses);
        calculateTotal(updatedExpenses);
    };

    // Function to remove an expense entry
    const removeExpense = (index) => {
        const updatedExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(updatedExpenses);
        calculateTotal(updatedExpenses);
    };

    // Function to calculate the total expenses
    const calculateTotal = (updatedExpenses) => {
        const totalAmount = updatedExpenses.reduce(
            (acc, expense) => acc + (parseFloat(expense.amount) || 0),
            0
        );
        setTotal(totalAmount);
    };
    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'App Camera Permission',
                    message: 'App needs access to your camera ' +
                        'so you can take awesome pictures.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the camera');
                return true;
            } else {
                console.log('Camera permission denied');
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const requestStoragePermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'App Storage Permission',
                    message: 'App needs access to your storage ' +
                        'so you can select images from gallery.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can access storage');
                return true;
            } else {
                console.log('Storage permission denied');
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };
    // Function to handle taking a picture
    // const handleTakePicture = async (index) => {
    //     // Request camera permissions
    //     const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    //     if (!cameraPermission.granted) {
    //         Alert.alert(
    //             "Permission Denied",
    //             "Camera permissions are required to take a photo."
    //         );
    //         return;
    //     }
    //     // Launch camera
    //     try {
    //         const result = await ImagePicker.launchCameraAsync({
    //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //             allowsEditing: true,
    //             aspect: [4, 3],
    //             quality: 1,
    //         });
    //         if (!result.canceled && result.assets && result.assets.length > 0) {
    //             const uri = result.assets[0].uri;
    //             console.log("Captured Image URI:", uri);
    //             // Save the image URI to the corresponding expense
    //             updateExpense(index, "image", uri);
    //         }
    //     } catch (error) {
    //         console.log("Error taking image:", error);
    //         Alert.alert("Failed to take picture, please try again later.")
    //     }
    // };
    // Function to handle picking a picture from gallery
    // const handlePickImage = async (index) => {
    //     const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (!galleryPermission.granted) {
    //         Alert.alert(
    //             "Permission Denied",
    //             "Gallery permissions are required to select a photo."
    //         );
    //         return;
    //     }
    //     try {
    //         const result = await ImagePicker.launchImageLibraryAsync({
    //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //             allowsEditing: true,
    //             aspect: [4, 3],
    //             quality: 1,
    //         });
    //         if (!result.canceled && result.assets && result.assets.length > 0) {
    //             const uri = result.assets[0].uri;
    //             console.log("Selected Image URI:", uri);
    //             // Save the image URI to the corresponding expense
    //             updateExpense(index, "image", uri);
    //         }
    //     } catch (error) {
    //         console.log("Error while picking from gallery:", error);
    //         Alert.alert("Failed to pick from gallery, please try again later.");
    //     }
    // };
    // Function to show image options for adding a picture to an expense
 

   





    const handleImagePress = (imageUri) => {
        // setSelectedImage(imageUri);
        // setModalVisible(true);
        navigation.navigate(SCREENS.IMAGE_VIEWER, { uri:imageUri})
    };
    const handleImageResponse = (response, index) => {
        console.log("handleImageResponse called for index:", index);
        if (response.didCancel) {
            console.log("User cancelled image picker");
        } else if (response.errorCode) {
            console.log("Image Picker Error: ", response.errorMessage);
            Alert.alert("Error", response.errorMessage || "Failed to select image");
        } else if (response.assets && response.assets.length > 0) {
            const selectedImage = response.assets[0];
            console.log("Image selected: ", selectedImage);
            updateExpense(index, "image", selectedImage.uri); // Corrected: Pass URI directly
        } else {
            console.log("No assets returned by the image picker");
        } 2
    };

    const handleProgressClick = (step) => {
        if (step === 1) {
            navigation.navigate("Daily64");
        }
    };

    /**
     * kanhaiya 
     */
    const addImageHandler = (index) => {
        try {
            setSelectedIndex(index);
            setImagePickerModal(true)
        } catch (error) {
            console.log("Error : ", error);
        }
    }
    const handleTakePicture = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
            Alert.alert(
                "Permission Denied",
                "Camera permissions are required to take a photo."
            );
            return;
        }
        setImagePickerModal(false)
        if(Platform.OS === 'ios'){
                    await util.delay(1000)
                    }
        try {

            const result = await ImagePicker.launchCameraAsync();

            if (!result.canceled && result.assets && result.assets.length > 0) {
                let uri = result.assets[0].uri;
                const tempUri = await showImageViewerPopup(uri, '');
                console.log("tempUri : ", tempUri)
                if (tempUri) {
                    uri = tempUri
                }else{
                    return;
                }
                setIsLoading(true);
                await uploadAttachments(uri, '', '', '');
                setIsLoading(false);

            }
        } catch (error) {
            setIsLoading(false);
            console.log("Eeror : ", error)
        }
        // Launch camera

    };
    const handlePickImage = async () => {
        const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryPermission.granted) {
            Alert.alert(
                "Permission Denied",
                "Gallery permissions are required to select a photo."
            );
            return;
        }
        setImagePickerModal(false)
if(Platform.OS === 'ios'){
            await util.delay(1000)
            }
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                let uri = result.assets[0].uri;
                const tempUri = await showImageViewerPopup(uri,'');
                if (tempUri) {
                    uri = tempUri
                }else{
                    return;
                }
                setIsLoading(true);
                await uploadAttachments(uri, '', '', '');
                setIsLoading(false);
            }
        } catch (error) {
            console.log("Error ,", error);
            setIsLoading(false)
        }

    };
    
    const uploadAttachments = async (uri, formattedDate, location, formattedTime) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                name: 'image.jpg',
                type: 'image/jpeg',
            });

            formData.append('type', ImageType.EXPENSE);
            const response = await apiClient.post(endPoints.URL_UPLOAD_ATTACHMENTS, formData);
            // console.log("response : ", response.data)
            if (response.status === 200 || response.status === 201) {
                const output = response.data
                if (output.status == "success") {
                    const url = output.data[0].fileUrl;
                    const tempExpense = [...expenses];
                    tempExpense[selectedIndex].images.push(url);
                    setExpenses(tempExpense);
                setIsLoading(false)
                } else {
                    showErrorPopup(output.message);
                }
            } else {
                showErrorPopup(output.message);
            }


        } catch (error) {
console.log("Error : ", error);
        }finally {
            setIsLoading(false)
        }

    }


    const callToSubmitExpense  = async () => {
        try {
            if (!total || total <= 0) {
               showErrorPopup("Total amount must be greater than 0");
                return;
            }
            setIsLoading(true)
            let exps = []
            if(expenses?.length > 0){
                expenses.map((expense) => {
                    exps.push({
                        "title": expense.title,
                        "amount": expense.amount,
                        "category": expense.category,
                        "images": expense?.images?.length > 0 ? expense.images[0].replace(/^.*?\.net\//, '') : []
                    })
                })
            }
            const userId = await AsyncStorage.getItem(Constants.USER_ID);
            const body = {
                "submittedBy": userId, 
                "employeeName": employeeName,
                "startDate": startDate,
                "endDate": endDate,
                "expenditure": expenditure,
                "projectNumber": projectNumber,
                "category": category,
                "task": task,
                "expenses": exps,
                "receipt": "",
                "mileageAmount": mileageAmount,
                "expenseAmount": total,
                "mileageStatus": "Pending",
                "expenseStatus": "Pending"
              }

              const response = await apiClient.post(endPoints.URL_CREATE_EXPENSE, body);

              setIsLoading(false)
              
 if(Platform.OS === 'ios'){
    await util.delay(600)
  }
              if(response.status === 200 || response.status === 201){
                if(response.data.status === "success"){
                   await showSuccessPopup(response.data.message);
    await util.delay(500)
                   navigation.navigate(SCREENS.MAIN_TABS, { screen: 'Expenses' });

                }else{
                    showErrorPopup(response?.data?.message);
                }
              }else{
                showErrorPopup(response?.message || 'Something went wrong');
              }
        } catch (error) {
            showErrorPopup(error?.message || 'Something went wrong');
            console.log("first errorcallToSubmitExpense  : ", error);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <SafeAreaWrapper>
        {/* <SafeAreaView
					style={{ flex: 1 , backgroundColor:appColor.white}}
				> */}
        {/* <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: appColor.white, paddingVertical: 15 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        > */}

            <HeaderWithBackButton title="Add New Expense" onBackClick={() => navigation.goBack()} />
            <ScrollView 
              style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                                    showsVerticalScrollIndicator={false}
                                      keyboardShouldPersistTaps="handled"
                                    automaticallyAdjustKeyboardInsets={true} 
            
            >
                {/* Expense Categories Section */}
                <View style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>2. Expense Categories</Text>
                </View>

                {/* Progress indicator for expense categories */}
                <View style={styles.progressContainer}>
                    {[1, 2].map((step, index) => (
                        <React.Fragment key={index}>
                            <TouchableOpacity
                                onPress={() => handleProgressClick(step)}
                                style={[
                                    styles.progressCircle,
                                    step <= 2 ? styles.activeCircle : {},
                                ]}>
                                <Text
                                    style={[
                                        styles.progressText,
                                        step <= 2 ? styles.activeText : {},
                                    ]}>
                                    {step}
                                </Text>
                            </TouchableOpacity>
                            {index < 1 && (
                                <View style={[styles.progressLine, styles.activeLine]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>


                {/* Box displaying captured mileage expenses */}
                <View style={styles.expenseInfoBox}>
                    <Text style={styles.mileageText}>Mileage Expenses:</Text>
                    <Text style={styles.mileageDates}>
                        {parsedStartDate?.toDateString()} to {parsedEndDate?.toDateString()}
                    </Text>
                    <Text style={[styles.mileageAmount, styles.alignRight]}>
                        Mileage: {typeof mileageAmount === 'number' ? `$${mileageAmount.toFixed(2)}` : "Loading..."}
                    </Text>
                </View>

                {/* Render each expense entry */}
                {expenses.map((expense, index) => (
                    <View key={index} style={styles.expenseEntryWrapper}>
                        <View style={styles.expenseEntry}>

                            {/* Conditionally render the remove button */}
                            {!expense.isInitial && (
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeExpense(index)}>
                                    <Ionicons name="remove-circle" size={24} color="red" />
                                </TouchableOpacity>
                            )}

                            <Text style={styles.categoryHeader}>
                                {expense.category || `Category ${index + 1}`}
                            </Text>

                            <Text style={styles.inputHeading}>Expense Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Transportation/Hotel/Meals/Misc"
                                value={expense.title}
                                onChangeText={(value) => updateExpense(index, "title", value)}
                            />

                            <Text style={styles.inputHeading}>Enter Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: $0.00"
                                keyboardType="numeric"
                                value={expense.amount}
                                onChangeText={(value) => updateExpense(index, "amount", value)}
                                returnKeyType="done"
                            />

                            {/* Picture box with image options */}
                            <TouchableOpacity
                                style={styles.pictureBox}
                                // onPress={() => showImageOptions(index)}
                                onPress={() => addImageHandler(index)}
                            >
                                <Ionicons
                                    name="camera"
                                    size={24}
                                    color="#8E8E93"
                                    style={styles.icon}
                                />
                                <Text style={styles.pictureText}>
                                    {expense.images.length > 0  ? "Edit Picture" : "Click here to add a Picture"}
                                </Text>
                            </TouchableOpacity>

                            {/* Show image preview if available */}
                            {expense.images.length > 0 && (
                                <View style={styles.imagePreviewContainer}>
                                    <TouchableOpacity onPress={() => handleImagePress(expense.images[0])}>
                                        <Image source={{ uri: expense.images[0] }} style={styles.imagePreview} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.closeButton} onPress={()=>{
                                        const updatedExpenses = [...expenses];
                                        updatedExpenses[index].images = [];
                                        setExpenses(updatedExpenses);
                                    }}>
                        <MaterialIcons name="cancel" size={28} color="red" />
                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                ))}

                {/* Button to add a new expense entry */}
                <TouchableOpacity style={styles.addButton} onPress={()=>addExpense()}>
                    <View style={styles.addButtonContent}>
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color="#3B82F6"
                            style={styles.addButtonIcon}
                        />
                        <Text style={styles.addButtonText}>Add New</Text>
                    </View>
                </TouchableOpacity>

                {/* Box showing the total expenses */}
                <View style={styles.totalSectionBox}>
                    <View style={styles.totalSection}>
                        <Text style={styles.totalText}>Total (Including Mileage):</Text>
                        <Text style={styles.totalAmount}>
                            ${typeof total === 'number' && typeof mileageAmount === 'number' ? (total + mileageAmount).toFixed(2) : "0.00"}
                        </Text>
                    </View>
                </View>

                {/* Navigation buttons: Previous and Submit */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.previousButton}
                        onPress={() => navigation.navigate("Daily64")}
                    >
                        <Text style={styles.previousButtonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => callToSubmitExpense()}
                    >
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setModalVisible(false)}
                    >
                        <PinchGestureHandler onGestureEvent={handlePinchGesture} onHandlerStateChange={handlePinchStateChange}>
                            <Animated.Image
                                source={{ uri: selectedImage }}
                                style={[styles.zoomedImage, { transform: [{ scale }] }]}
                                resizeMode="contain"
                            />
                        </PinchGestureHandler>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>

            {imagePickerModal ?
                <ImagePickerModal pickImageFromLibrary={() => handlePickImage()} takePhoto={() => handleTakePicture()} isVisible={imagePickerModal} onClose={() => setImagePickerModal(false)} />

                : null}

                 {isLoading && (
                                <LoaderModal visible={isLoading} />
                            )}
                            {isSuccessVisible ? <SuccessPopup /> : null}
                            {errorPopupVisible ? <ErrorPopup /> : null}

{imageViewerVisible ? (
                <ImageViewerPopup />
            ): null
            }
        {/* </KeyboardAvoidingView> */}
        {/* </SafeAreaView> */}
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomedImage: {
        width: width,
        height: height / 2,
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    alignRight: {
        alignSelf: "flex-end",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 15,
    },
    progressCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#e0e0e0",
        borderWidth: 2,
        borderColor: "#d3d3d3",
        alignItems: "center",
        justifyContent: "center",
    },
    activeCircle: {
        borderColor: "#486ECD",
    },
    progressText: {
        fontSize: 16,
        color: "#000",
        fontFamily: appFonts.Medium
    },
    activeText: {
        color: "#486ECD",
        fontFamily: appFonts.Medium

    },
    progressLine: {
        height: 2,
        flex: 1,
        backgroundColor: "#d3d3d3",
    },
    activeLine: {
        backgroundColor: "#486ECD",
    },
    headerSpacing: {
        marginTop: 20,
    },
    topBar: {
        marginTop: 30,
        marginBottom: 15,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: -10,
    },
    inputHeading: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 5,
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
    },
    header: {
        marginBottom: 20,
    },
    heading: {
        fontSize: 20,
        fontFamily: appFonts.Medium,
        color: "#000000",
        marginLeft: 10,
    },
    categorySection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontFamily: appFonts.Medium,

        color: "#000000",
    },
    expenseInfoBox: {
        padding: 10,
        backgroundColor: "#486ECD",
        borderRadius: 10,
        marginBottom: 20,
    },
    mileageText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: appFonts.Medium,

    },
    mileageDates: {
        color: "#FFFFFF",
        fontSize: 13,
        marginBottom: 1,
    },
    mileageAmount: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: appFonts.Medium,

    },
    categoryHeader: {
        fontSize: 16,
        fontFamily: appFonts.Medium,

        color: "#000000",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#000000",
        color: "#000000",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    imagePreviewContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d3d3d3",
    },
    pictureBox: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 8,
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    pictureText: {
        color: "#000000",
    },
    addButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#486ECD",
        alignSelf: "flex-end",
        marginBottom: 100,
    },
    addButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    addButtonIcon: {
        marginRight: 5,
    },
    addButtonText: {
        color: "#486ECD",
        fontSize: 16,
        fontWeight: "bold",
    },
    totalSectionBox: {
        backgroundColor: "#E5EDFB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
        marginBottom: 50,
    },
    previousButton: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        borderRadius: 8,
        flex: 0.45,
        borderWidth: 1,
        borderColor: "#486ECD",
    },
    previousButtonText: {
        color: "#486ECD",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        alignItems: "center",
        backgroundColor: "#486ECD",
        paddingVertical: 10,
        borderRadius: 8,
        flex: 0.45,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    expenseEntryWrapper: {
        borderWidth: 1,
        borderColor: "#d3d3d3",
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    expenseEntry: {
        position: 'relative',
    },
    closeButton: { position: "absolute", right: 5, top: 5,zIndex:2},
});

export default Daily65;