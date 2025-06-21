import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList, ImageBackground, Alert, Platform, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import BottomToolbar from './BottomToolbar';
import * as Location from 'expo-location';
import { endPoints } from '../api/endPoints';
import util from '../utils/util';
import { appColor } from '../theme/appColor';
import { SCREENS } from '../utils/ScreenNames';
import { Constants } from '../utils/Constants';
import { ProjectContext } from '../utils/ProjectContext';
import { appFonts } from '../theme/appFonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useErrorPopupContext } from '../context/PopupProvider';
import apiClient from '../api/apiClient';
import { useIsFocused } from '@react-navigation/native';
import { useConfirmationPopup } from '../components/popup/confirmationPopup';
import * as Localization from 'expo-localization';
import moment from 'moment';
import { SafeAreaWrapper } from '../../App';

const HomeScreen = ({ navigation, route }) => { // Removed const navigation = useNavigation();
    // const { showConfirmationPopup } = useErrorPopupContext()
    const [showNotification, setShowNotification] = useState(true);
    const isFocused = useIsFocused();
    const [notificationMessage, setNotificationMessage] = useState(
        "Water Truck needs to be on the location"
    );
    const [notifications, setNotifications] = useState([]);
    const { showConfirmationPopup,ConfirmationPopup,popupVisible } = useConfirmationPopup()

    
    const [notificationModalVisible, setNotificationModalVisible] =
        useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [weatherData, setWeatherData] = useState({
        city: "Fetching Location...",
        description: "Fetching weather...",
        temp: 0,
        icon: "",
    });
    const [userId, setUserId] = useState('');
    const [isShowInvoice, setIsShowInvoice] = useState(false)
    const { setIsBoss } = useContext(ProjectContext);
    const [imagePickerModal, setImagePickerModal] = useState(false);


    


    useEffect(() => {
        (async () => {
            const isBoss = await AsyncStorage.getItem(Constants.IS_BOSS) == "true";
            setIsBoss(isBoss);
            setIsShowInvoice(isBoss);
        })();

    }, [])
    const fetchWeatherData = async () => {
        setIsLoading(true);
        try {
            // 1. Get or set user ID
            let user_id = userId;
            if (!userId) {
                user_id = await AsyncStorage.getItem('userId');
                if (!user_id) throw new Error("User ID not found");
                setUserId(user_id);
            }
    
            // 2. Handle Location Permissions
            let { status } = await Location.getForegroundPermissionsAsync();
            
            // If not granted, request permission
            if (status !== 'granted') {
                const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
                status = newStatus;
                
                // If still not granted after request
                if (status !== 'granted') {
                    Alert.alert(
                        "Permission Required",
                        "Weather data requires location access. Please enable permissions in Settings.",
                        [
                            { 
                                text: "Cancel", 
                                style: "cancel" 
                            },
                            { 
                                text: "Open Settings", 
                                onPress: () => Linking.openSettings() 
                            }
                        ]
                    );
                    throw new Error("Location permission denied");
                }
            }
    
            // 3. Get Current Location (with timeout fallback)
            let locationData;
            try {
                locationData = await Promise.race([
                    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error("Location timeout")), 10000)
                    )
                ]);
            } catch (locationError) {
                console.warn("Using default location due to:", locationError.message);
                locationData = { 
                    coords: { 
                        latitude: 43.6532,  // Toronto fallback
                        longitude: -79.3832 
                    } 
                };
            }
    
            // 4. Update Backend with Location
            const locationUpdate = await apiClient.post(
                endPoints.URL_UPDATE_LOCATION,
                {
                    userId: user_id,
                    latitude: locationData.coords.latitude.toString(),
                    longitude: locationData.coords.longitude.toString(),
                }
            ).catch(e => {
                console.error("Location update failed:", e);
                // Continue even if location update fails
            });
    
            // 5. Fetch Weather Data
            const weatherResponse = await apiClient.post(
                endPoints.URL_WEATHER_API, 
                { userId: user_id }
            );
    
            if (!weatherResponse?.data?.weather) {
                throw new Error("Invalid weather response");
            }
    
            setWeatherData({
                city: weatherResponse.data.weather.location || "Current Location",
                description: weatherResponse.data.weather.condition || "Unknown",
                temp: weatherResponse.data.weather.temperature ?? 0, // Nullish coalescing
                icon: weatherResponse.data.weather.icon || "01d", // Default clear sky icon
            });
    
        } catch (error) {
            console.error("Weather fetch error:", error);
            Alert.alert(
                "Weather Update Failed",
                error.message || "Couldn't retrieve weather data. Please try later.",
                [{ text: "OK" }]
            );
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        // const fetchWeatherData = async () => {
        //     try {
        //         let user_id = userId;
        //         if (!userId) {
        //             user_id = await AsyncStorage.getItem('userId');
        //             setUserId(user_id);
        //         }

        //         // Location Permissions
        //         let { status } = await Location.getForegroundPermissionsAsync();
    
        //         console.log("status :", status)
        //         // 2. If not, request permission
        //         if (status !== 'granted') {
        //           const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        //           status = newStatus;
        //         }
            
        //         // let { status } = await Location.requestForegroundPermissionsAsync();
        //         if (status !== "granted") {
        //             Alert.alert(
        //                 "Permission Denied",
        //                 "Please enable location permissions to access weather data.",
        //                 [{ text: "OK" }]
        //             );
        //             setIsLoading(false);
        //             return;
        //         }

        //         // Get Location
        //         const locationData = await Location.getCurrentPositionAsync({}).catch((error) => {
        //             console.log("Error fetching location:", error);
        //             return null;
        //         });

        //         let latitude = 43.6532; // Default to Toronto
        //         let longitude = -79.3832;

        //         if (locationData?.coords) {
        //             latitude = locationData.coords.latitude;
        //             longitude = locationData.coords.longitude;
        //         }

        //         // Update backend with location
        //         if (user_id) {
        //             await apiClient.post(endPoints.URL_UPDATE_LOCATION,{
        //                 userId: user_id,
        //                 latitude: latitude.toString(),
        //                 longitude: longitude.toString(),
        //             })
        //             // console.log("user_id : ", user_id)
        //             const response = await apiClient.post(endPoints.URL_WEATHER_API, { userId: user_id })
        //             // console.log("response :", response)
        //             if (response?.data?.weather) {
        //                 setWeatherData({
        //                     city: response.data.weather.location || "Unknown City",
        //                     description: response.data.weather.condition || "Unknown Weather",
        //                     temp: response.data.weather.temperature || 0,
        //                     icon: response.data.weather.icon || "",
        //                 });
        //             }
        //         }
        //     } catch (error) {
        //         console.log("Error fetching weather data:", error);
        //         setIsLoading(false);
        //         // Alert.alert("Error", "Failed to fetch weather data. Please try again.");
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };


        fetchWeatherData();

    }, [userId]);

    useEffect(()=>{
        if(isFocused){
            fetchNotifications();
        }
    },[isFocused]);


    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get(endPoints.URL_NOTIFICATIONS);
            if(response.status == 200){
                if(response.data.status == "success"){
                    setNotifications(response?.data?.data);
                }
            }
            console.log("response : ", response.data)
        }catch (error) {
            console.log("Error fetchNotifications : ", error)
        }
    }



    const callToLogout = async () => {
        const result = await showConfirmationPopup("Logout", "Are you sure you want to logout?", "Logout", "Cancel");
        if (!result) {
            return;
        }
        util.logoutUser();
        navigation.navigate(SCREENS.LOGIN_SCREEN);
    }


    return (
        // <SafeAreaView style={styles.safeArea}>
        <SafeAreaWrapper>
            {/* Header */}
           
            <View style={styles.headerContainer}>
                {isShowInvoice ?

                    <TouchableOpacity onPress={() => navigation.navigate(SCREENS.ADD_COMPANY_EMAIL)} style={{
                        backgroundColor: appColor.primary,
                        padding: 10,
                        borderRadius: 10
                    }}>
                        <Text style={{
                            color: appColor.white
                        }}>Add New Company Email</Text>
                    </TouchableOpacity>


                    : null}

                <View />
                <View style={styles.profileContainer}>
                    <TouchableOpacity
                        style={styles.notificationBell}
                        onPress={() => callToLogout()}>
                        <Ionicons name="log-out-outline" size={30} color="#000000" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity
                        style={styles.notificationBell}
                        onPress={() => setNotificationModalVisible(true)}>
                        <Ionicons name="notifications-outline" size={24} color="#000000" />
                        {notifications.length > 0 && <View style={{ backgroundColor: "red", width: 10, height: 10, borderRadius: 5, position: "absolute", top: 1, right: 2 }} />}
                    </TouchableOpacity> */}

                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container}>

                {/* {showNotification && (
                    <LinearGradient
                        colors={["#2A0C95", "#B9A7F9"]} // Dark purple to light purple
                        style={styles.notificationContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}>
                        <Ionicons
                            name="notifications-outline"
                            size={24}
                            color="#ffffff"
                            style={{ marginRight: 10 }}
                        />
                        <Text style={styles.notificationText}>{notificationMessage}</Text>
                        <TouchableOpacity onPress={() => setShowNotification(false)}>
                            <MaterialIcons name="close" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </LinearGradient>
                )} */}

                {/* Weather Section */}
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherTitle}>Today's Weather</Text>
                    {isLoading ? (
                        <Text>Loading...</Text>
                    ) : weatherData?.temp ? (
                        <View style={styles.weatherCard}>
                            <View style={styles.currentWeather}>

                                {weatherData.icon ? (
                                    <Image
                                        source={{ uri: weatherData.icon }}
                                        style={{ width: 50, height: 50 }}
                                    />
                                ) : null}
                                <View style={{
                                    flexDirection: 'column',
                                    marginRight: 50,
                                    width: weatherData.icon ? '70%' : '85%'
                                }}>
                                    <Text style={styles.weatherCity}>{weatherData.city}</Text>
                                    <Text style={styles.weatherDescription}>
                                        {weatherData.description}
                                    </Text>
                                </View>
                                <Text style={styles.weatherTemp}>
                                    {Math.round(weatherData.temp)}°C
                                </Text>

                            </View>
                        </View>
                    ) : (
                        <Text style={styles.weatherDescription}>
                            Weather data not available.
                        </Text>
                    )}
                </View>


                {/* Notification Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={notificationModalVisible}
                    onRequestClose={() => {
                        setNotificationModalVisible(!notificationModalVisible);
                    }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Notifications</Text>

                            {
                                notifications.length == 0 ? <Text style={styles.notificationItemText}>No notifications</Text> : null
                            }
                            <FlatList
                                data={notifications}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item ,index}) => (
                                    <View style={styles.notificationItem} key={index.toString()}>
                                        <Text style={styles.notificationItemText}>
                                            {item.message}
                                        </Text>
                                        <Text style={styles.notificationItemText}>
                                            {item.message}
                                        </Text>
                                    </View>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeModalButton}
                                onPress={() =>
                                    setNotificationModalVisible(!notificationModalVisible)
                                }>
                                <Text style={styles.closeModalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Explore Menu */}
                <View style={styles.exploreContainer}>
                    <Text style={styles.exploreTitle}>Explore Menu</Text>
                    <View style={styles.exploreGrid}>
                        {/* Baseline Schedules */}
                        <TouchableOpacity
                            style={styles.exploreCardContainer}
                            onPress={() => navigation.navigate(SCREENS.BASELINE_SCHEDULE_LIST)}>
                            <ImageBackground
                                source={require("../Assets/HomeScreenImage.png")}
                                style={styles.cardImageBackground}
                                resizeMode="cover">
                                <View style={styles.cardOverlay}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardText}>Baseline</Text>
                                        <Text style={styles.cardText}>Schedules</Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={18}
                                        color="#ffffff"
                                    />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>

                        {/* Photo Files */}
                        <TouchableOpacity
                            style={styles.exploreCardContainer}
                            // onPress={() => navigation.navigate("PhotosF")}>
                            onPress={() => navigation.navigate(SCREENS.PHOTO_FILES)}>
                            <ImageBackground
                                source={require("../Assets/PhotoFiles.png")}
                                style={styles.cardImageBackground}
                                resizeMode="cover">
                                <View style={styles.cardOverlay}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardText}>Photo</Text>
                                        <Text style={styles.cardText}>Files</Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={18}
                                        color="#ffffff"
                                    />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>

                        {/* Job Hazard Analysis */}
                        <TouchableOpacity
                            style={styles.exploreCardWideContainer} // Larger card for Job Hazard Analysis
                            onPress={() => navigation.navigate(SCREENS.JOB_HAZARD_ANALYSIS)}>
                            <ImageBackground
                                source={require("../Assets/JobHazard.png")}
                                style={styles.cardImageWideBackground}
                                resizeMode="cover">
                                <View style={styles.cardOverlay}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardText}>Job Hazard</Text>
                                        <Text style={styles.cardText}>Analysis</Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={18}
                                        color="#ffffff"
                                    />
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* <BottomToolbar /> */}
            </ScrollView>
            {popupVisible ? <ConfirmationPopup /> : null}
{/* </SafeAreaView> */}
</SafeAreaWrapper>
    );
};

// faiz1213@kps.ca
// 12345678
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F7FF",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    locationText: {
        color: "#000000",
        marginLeft: 8,
        fontSize: 16,
        fontFamily: appFonts.SemiBold,
    },
    profileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    notificationBell: {
        margin: 10,
    },
    notificationContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        marginVertical: 10,
    },
    notificationText: {
        color: "#ffffff",
        flex: 1,
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: appFonts.SemiBold,
        marginBottom: 10,
    },
    notificationItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        width: "100%",
    },
    notificationItemText: {
        fontSize: 16,
    },
    closeModalButton: {
        marginTop: 20,
        backgroundColor: "#486ECD",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeModalButtonText: {
        color: "#ffffff",
        fontFamily: appFonts.SemiBold,
    },
    weatherContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    weatherTitle: {
        fontFamily: appFonts.SemiBold,
        fontSize: 20,
        marginBottom: 10,
        color: 'black',
    },
    weatherCard: {
        backgroundColor: "#ffffff",
        borderRadius: 15,
        paddingHorizontal: 5,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        // marginBottom: 10,
    },
    currentWeather: {
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
        // marginBottom: 20,
        justifyContent: 'space-around'
    },
    weatherCity: {
        fontFamily: appFonts.Regular,
        fontSize: 16,
        color: "#486ECD",
    },
    weatherDescription: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
    },
    weatherTemp: {
        fontSize: 20,
        fontFamily: appFonts.Bold,
        color: "#486ECD",
        marginHorizontal: -100,
        marginRight: 10,
    },
    weatherForecastContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    weatherHourBlock: {
        alignItems: "center",
        marginHorizontal: 10,
    },
    weatherHourIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    weatherHourTemp: {
        fontSize: 16,
        fontFamily: appFonts.SemiBold,
        color: "#486ECD",
    },
    weatherHourTime: {
        fontSize: 12,
        color: "#888",
        marginTop: 5,
    },

    exploreContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    exploreTitle: {
        fontFamily: appFonts.SemiBold,
        fontSize: 18,
        marginBottom: 10,
    },
    exploreGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    exploreCardContainer: {
        width: "48%",
        height: 100,
        marginBottom: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    cardImageBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    exploreCardWideContainer: {
        width: "100%",
        height: 120,
        marginBottom: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    cardImageWideBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    textContainer: {
        flexDirection: "column",
    },
    cardText: {
        color: "#ffffff",
        fontSize: 16,
        fontFamily: appFonts.SemiBold,
    },
    exploreCardContainer: {
        width: "48%", // Matches the grid layout width
        height: 100, // Adjust height for your button size
        marginBottom: 10,
        borderRadius: 10, // Ensures rounded edges
        overflow: "hidden", // Ensures everything is clipped to fit within the rounded corners
    },

    baselineCardImageBackground: {
        flex: 1, // Ensures the image fills the entire container
        justifyContent: "center", // Centers the overlay content vertically
        alignItems: "center", // Centers the overlay content horizontally
    },

    baselineCardOverlay: {
        ...StyleSheet.absoluteFillObject, // Covers the entire card
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Black overlay with transparency
        flexDirection: "row", // Aligns text and arrow horizontally
        justifyContent: "space-between", // Separates text and arrow
        alignItems: "center", // Vertically aligns items
        paddingHorizontal: 10, // Adds padding on both sides
    },

    textContainer: {
        flexDirection: "column", // Arranges "Baseline" and "Schedules" in two lines
    },

    baselineText: {
        color: "#ffffff", // White text for contrast
        fontSize: 16,
        fontFamily: appFonts.SemiBold,
    },

    baselineArrowIcon: {
        marginLeft: 10, // Spacing for the arrow
    },
    photoFilesCardImageBackground: {
        flex: 1,
        width: "48%", // Matches the grid layout
        height: 100, // Adjust height for uniformity
        marginBottom: 10,
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },

    photoFilesCardOverlay: {
        ...StyleSheet.absoluteFillObject, // Covers the entire card
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Black overlay with transparency
        flexDirection: "row", // Aligns text and arrow horizontally
        justifyContent: "space-between", // Separates text and arrow
        alignItems: "center",
        paddingHorizontal: 10,
    },

    photoFilesText: {
        color: "#ffffff",
        fontSize: 16,
        fontFamily: appFonts.SemiBold,
    },

    photoFilesArrowIcon: {
        marginLeft: 10, // Spacing for the arrow
    },

    exploreText: {
        color: "#ffffff",
        fontSize: 16,
    },
    arrowIcon: {
        marginLeft: 10,
    },
    bottomNavAdjustedSlightlyUp: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        position: "absolute",
        bottom: 30,
        width: "100%",
        backgroundColor: "#ffffff",
    },
});
export default HomeScreen;