import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Keyboard, Linking, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import polyline from '@mapbox/polyline';
import debounce from 'lodash.debounce';
import { endPoints, GOOGLE_MAPS_API_KEY, MILAGE_API_KEY } from '../api/endPoints';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { appFonts } from '../theme/appFonts';
import { appColor } from '../theme/appColor';
import CustomButton from '../components/button/CustomButton';
import apiClient from '../api/apiClient';
import { useErrorPopupContext } from '../context/PopupProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Constants } from '../utils/Constants';
import util from '../utils/util';
import { SCREENS } from '../utils/ScreenNames';

const API_BASE_URL = endPoints.BASE_URL;


const MileageStartScreen = ({ navigation }) => {
    const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();

    const [startLocation, setStartLocation] = useState('');
    const [constructionSites, setConstructionSites] = useState([{ id: 1, location: '' }]);
    const [distanceData, setDistanceData] = useState({
        homeToSite: 0,
        interSites: [],
        siteToHome: 0,
        totalDistance: 0
    });
    const [payableAmount, setPayableAmount] = useState(0);
    const [travelTime, setTravelTime] = useState('');
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [isRideActive, setIsRideActive] = useState(false);
    const [suggestions, setSuggestions] = useState({ home: [], sites: [] });
    const [inputLayouts, setInputLayouts] = useState({ home: null, sites: {} });
    const [DirectionCoordinate, setDirectionCoordinate] = useState([])
    const mapRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapError, setMapError] = useState(null);
    useEffect(() => {
        setSuggestions(prev => ({ ...prev, sites: [] }));
    }, [constructionSites]);


    useEffect(() => {
        return () => {
            fetchSuggestions.cancel();
            if (mapRef?.current) {
                // Clean up map references
                mapRef.current = null;
            }
        };
    }, []);

    const fetchSuggestions = useCallback(debounce(async (input, type, index = 0) => {
        try {
            if (!input || input.length < 3) {
                if (type === 'home') {
                    setSuggestions(prev => ({ ...prev, home: [] }));
                } else {
                    const newSiteSuggestions = [...suggestions.sites];
                    newSiteSuggestions[index] = [];
                    setSuggestions(prev => ({ ...prev, sites: newSiteSuggestions }));
                }
                return;
            }
            const components = "country:in";
            const types = 'geocode|establishment'
            const sessionToken = Math.random().toString(36).substring(2, 15)
            const requestURL = `${endPoints.URL_GOOGLE_PLACE_API}input=${input}&key=${MILAGE_API_KEY}&components=${components}&sessiontoken=${sessionToken}&types=${types}
`
            const response = await apiClient.get(requestURL);

            if (response.status === 200) {
                console.log("Suggestions response:", response);
                if (response.data.predictions) {
                    console.log("Predictions before state update:", response.data.predictions)
                    if (type === 'home') {
                        setSuggestions(prev => ({ ...prev, home: response.data.predictions }));
                    } else {
                        const newSiteSuggestions = [...suggestions.sites];
                        newSiteSuggestions[index] = response.data.predictions;
                        setSuggestions(prev => ({ ...prev, sites: newSiteSuggestions }));
                    }
                }
            }

        } catch (error) {
            console.log("Suggestions error:", error)
            console.log("Suggestions error:", error);
        }
    }, 300), []);


    useEffect(() => {
        return () => fetchSuggestions.cancel();
    }, [fetchSuggestions]);



    const getRouteData = async (origin, destination) => {
        try {
            const url = endPoints.URL_GOOGLE_DIRECTION_API + `origin=${origin?.trim()}&destination=${destination?.trim()}&mode=driving&key=${MILAGE_API_KEY}`
           console.log("first url: ", url)
            const response = await apiClient.get(url);
            console.log("response: ", response)

            if (response.status == 200) {
                const output = response?.data;
                if (output.status == 'REQUEST_DENIED' || output?.error_message) {
                    // console.log("output : ", output);
                    await showErrorPopup(output?.error_message || 'Something went wrong');
                    resetStartRide()

                    return { distance: 0, duration: '', coords: [] };
                } else {
                    resetStartRide()
                    console.log("output?.routes[0]?.overview_polyline?.points? : ", JSON.output?.routes[0])
                    const coords = output.routes?.[0]?.legs?.[0];
                    const values = [coords?.start_location, coords?.end_location];
                    console.log("Values :", values)
                    setDirectionCoordinate(values)
                    if (output.routes?.[0]?.legs?.[0]) {
                        const leg = output.routes[0].legs[0];

                        return {
                            distance: leg.distance.value / 1000,
                            duration: leg.duration.text,
                            coords: polyline.decode(output.routes[0].overview_polyline.points)
                                .map(([lat, lng]) => ({ latitude: lat, longitude: lng }))
                        };
                    }
                }

            } else {
                setDirectionCoordinate([])
                await showErrorPopup('Something went wrong');
                    resetStartRide()

            }
        } catch (error) {
            setDirectionCoordinate([])
                    resetStartRide()
                    console.log("Error : getRouteData", error)  

            return { distance: 0, duration: '', coords: [] };
        }
    };


    const calculateExpenses = (_siteToHome = 0) => {
        try {
            const { homeToSite, interSites, siteToHome } = distanceData;
            let total = 0;
            total += Math.max(homeToSite - 100, 0) * 0.5;
            total += interSites.reduce((sum, dist) => sum + (dist * 0.5), 0);
            total += Math.max(_siteToHome - 100, 0) * 0.5;
            setPayableAmount(total.toFixed(2));
        } catch (error) {
            console.log("Error : calculateExpenses", error)
        }

    };
    const resetStartRide = () => {
        try {
            setIsRideActive(true);
            setDistanceData({
                homeToSite: 0,
                interSites: [],
                siteToHome: 0,
                totalDistance: 0
            });
            setPayableAmount(0);
            setRouteCoordinates([]);
            setTravelTime('');
        } catch (error) {
            console.log("Error  resetStartRide : ", error)
        }

    }
    const handleStartRide = async () => {

        try {
            setDirectionCoordinate([])
            if (!startLocation || constructionSites.some(site => !site.location)) {
                showErrorPopup('Please fill all location fields');
                return;
            }
            let totalDistance = 0;
            let allCoords = [];
            // Home to the first site
            const homeToFirst = await getRouteData(startLocation, constructionSites[0].location);
            if (homeToFirst && homeToFirst.distance) {
                setDistanceData(prev => ({
                    ...prev,
                    homeToSite: homeToFirst.distance,
                }));
                totalDistance += homeToFirst.distance;
                allCoords.push(...homeToFirst.coords);
            }
            const interSiteDistances = [];
            for (let i = 0; i < constructionSites.length - 1; i++) {
                const result = await getRouteData(constructionSites[i].location, constructionSites[i + 1].location);
                if (result && result.distance) {
                    interSiteDistances.push(result.distance);
                    totalDistance += result.distance;
                    allCoords.push(...result.coords)
                }
            }
            setDistanceData(prev => ({ ...prev, interSites: interSiteDistances, totalDistance: totalDistance }));
            setRouteCoordinates(allCoords);
            setDistanceData(prev => ({ ...prev, totalDistance: totalDistance }));
        } catch (error) {
            console.log('Failed to start ride:', error);
            setIsRideActive(false);
            setDirectionCoordinate([])
        }
    };

    // Ride end handler (Fixed distance calculation)

    const handleEndRide = async () => {
        try {
            console.log("Calling handleEndRide ---")
            const lastSite = constructionSites[constructionSites.length - 1].location;
            console.log("lastSite : ",lastSite)
            const returnTrip = await getRouteData(lastSite, startLocation);
            console.log("returnTrip :",returnTrip)
            let newTotal = distanceData.homeToSite +
                distanceData.interSites.reduce((a, b) => a + b, 0);
            if (returnTrip && returnTrip.distance) {
                newTotal += returnTrip.distance;
            }
            setDistanceData(prev => ({
                ...prev,
                siteToHome: returnTrip.distance || 0,
                totalDistance: newTotal || 0 // Ensuring totalDistance is never undefined
            }));

            const allCoords = [...routeCoordinates];
            if (returnTrip && returnTrip.coords) {
                allCoords.push(...returnTrip.coords)
            }
            setRouteCoordinates(allCoords);
            calculateExpenses(returnTrip.distance);
            const user_id = await AsyncStorage.getItem(Constants.USER_ID);

            // Save ride data
            const rideData = {
                userId: user_id,
                startLocation,
                constructionSites: constructionSites.map(s => s.location),
                routeCoordinates: allCoords
            };

            console.log("rideData : ", JSON.stringify(rideData))

            const response = await apiClient.post(endPoints.URL_CALCULATE_MILAGE, rideData);
            console.log("response : ", response)
            if (response.status === 403 || response.status === 401) {
                await showErrorPopup(response?.data?.message || 'Something went wrong');
                util.logoutUser();
                navigation.replace(SCREENS.LOGIN_SCREEN);
                return;
            }
            if (response.status === 200) {
                if (response.data) {
                    setDistanceData(prev => ({
                        ...prev,
                        totalDistance: response.data.totalDistance
                    }));
                    setPayableAmount(response.data.expenses);
                    const existingRides = JSON.parse(await AsyncStorage.getItem('rides') || '[]');
                    await AsyncStorage.setItem('rides', JSON.stringify([...existingRides, rideData]));
                }else{
                    await showErrorPopup(response?.data?.message || 'Something went wrong');
                    resetStartRide()

                }
            }else{
                await showErrorPopup(response?.data?.message || 'Something went wrong');
                    resetStartRide()


            }
        } catch (error) {
            console.log("Failed to end ride:", error);
                    resetStartRide()

        } finally {
            setIsRideActive(false);
        }
    };


    const handleAddSite = () => {
        setConstructionSites(prev => [...prev, { id: prev.length + 1, location: '' }]);
    };

    const handleRemoveSite = (id) => {
        setConstructionSites(prev => prev.filter(site => site.id !== id));
    };

    const handleSiteChange = (id, text, index) => {
        try {
            fetchSuggestions.cancel();
            setConstructionSites(prev =>
                prev.map(site =>
                    site.id === id ? { ...site, location: text } : site
                )
            );
            //Clear existing suggestions
            const newSiteSuggestions = [...suggestions.sites];
            newSiteSuggestions[index] = [];
            setSuggestions(prev => ({ ...prev, sites: newSiteSuggestions }));
            fetchSuggestions(text, 'site', index);
        } catch (error) {
            console.log("error : handleSiteChange", error)
        }

    };

    useEffect(() => {
        if (routeCoordinates && routeCoordinates?.length > 0 && mapRef?.current) {
            mapRef.current.fitToCoordinates(routeCoordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [routeCoordinates]);

    const handleInputLayout = (event, type, index) => {

        try {
            const { layout } = event.nativeEvent;
            if (type === 'home') {
                setInputLayouts(prev => ({ ...prev, home: layout }));
            } else if (type === 'site') {
                setInputLayouts(prev => {
                    const newSitesLayouts = { ...prev.sites };
                    newSitesLayouts[index] = layout;
                    return {
                        ...prev,
                        sites: newSitesLayouts
                    };
                });
            }
        } catch (error) {
            console.log("Error handleInputLayout : ", error)
        }

    }
    const navigateWithGoogleMaps = (originLat, originLng, destLat, destLng) => {
        try {
            const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
        } catch (error) {
            showErrorPopup('Something went wrong. Please try again.');
        }

    };

    const getDirections = () => {
        if (DirectionCoordinate.length > 0) {
            navigateWithGoogleMaps(DirectionCoordinate[0].lat
                , DirectionCoordinate[0].lng, DirectionCoordinate[1].lat
                , DirectionCoordinate[1].lng);

        } else {
            showErrorPopup('Not Getting Directions, refresh the page');
        }
    }

    const handleMapReady = useCallback(() => {
        try {
            console.log('Map is ready');
            setIsMapReady(true);
            setMapError(null);

            if (routeCoordinates.length > 0 && mapRef?.current) {
                mapRef?.current?.fitToCoordinates(routeCoordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        } catch (error) {
            console.error('Map ready error:', error);
            setMapError('Failed to load map');
            setIsMapReady(false);
        }
    }, [routeCoordinates]);



    const renderMap = () => {
        if (mapError) {
            return (
                <View style={styles.mapErrorContainer}>
                    <Text style={styles.mapErrorText}>{mapError}</Text>
                </View>
            );
        }

        return (
            <>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE} // Explicitly set provider
                    initialRegion={{
                        latitude: 43.6532,
                        longitude: -79.3832,
                        latitudeDelta: 0.5,
                        longitudeDelta: 0.5,
                    }}
                    onMapReady={handleMapReady}
                    onError={(error) => {
                        console.error("MapView Error:", error.nativeEvent?.message || error);
                        setMapError(error.nativeEvent?.message || 'Map loading failed');
                        setIsMapReady(false);
                    }}
                >
                    {isMapReady && routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeWidth={4}
                            strokeColor="#2196F3"
                        />
                    )}
                </MapView>

                {!isMapReady && !mapError && (
                    <View style={styles.mapLoadingContainer}>
                        <ActivityIndicator size="large" color={appColor.primary} />
                        <Text style={styles.mapLoadingText}>Loading map...</Text>
                    </View>
                )}
            </>
        );
    };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: appColor.white }} >
            <View style={{
                paddingVertical: 8
            }}>
                <HeaderWithBackButton customStyle={{ marginLeft: -5 }} title="Mileage Tracker" onBackClick={() => navigation.goBack()} />
            </View>

            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>

                {/* Location Inputs */}
                <View style={styles.inputGroup}>
                    {/* Home Address */}


                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="home-map-marker" size={20} color="#555" />
                        <TextInput
                            style={styles.input}
                            placeholder="Home Address"
                            placeholderTextColor="#999"
                            value={startLocation}
                            onChangeText={text => {
                                setStartLocation(text);
                                fetchSuggestions(text, 'home');
                            }}
                            onLayout={(event) => handleInputLayout(event, 'home')}
                            editable={!isRideActive}
                        />
                    </View>

                    {suggestions.home.length > 0 && inputLayouts.home && (
                        <View style={{
                            position: 'absolute',
                            top: inputLayouts.home.y + inputLayouts.home.height + 1,
                            left: inputLayouts.home.x,
                            width: inputLayouts.home.width,
                            zIndex: 1000,
                        }}
                        >
                            {suggestions.home.map((suggestion, index) => {
                                console.log("Rendering home suggestion:", suggestion);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setStartLocation(suggestion.description);
                                            setSuggestions(prev => ({ ...prev, home: [] })); // Clear home suggestions
                                            Keyboard.dismiss()
                                            fetchSuggestions.cancel(); // Cancel any pending API calls
                                        }}
                                    >
                                        <Text style={styles.suggestionText}>{suggestion.description}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    )}

                    {/* Construction Sites */}
                    {constructionSites.map((site, index) => (
                        <View key={site.id} style={styles.siteContainer}>
                            <View style={styles.siteInputWrapper}>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="shovel" size={20} color="#555" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder={`Construction Site ${index + 1}`}
                                        placeholderTextColor="#999"
                                        value={site.location}
                                        onChangeText={text => handleSiteChange(site.id, text, index)}
                                        onLayout={(event) => handleInputLayout(event, 'site', index)}
                                        editable={!isRideActive}
                                    />
                                </View>
                                {suggestions.sites[index]?.length > 0 && inputLayouts.sites[index] && (
                                    <View style={{
                                        position: 'absolute',
                                        top: inputLayouts.sites[index].y + inputLayouts.sites[index].height + 1,
                                        left: inputLayouts.sites[index].x,
                                        width: inputLayouts.sites[index].width,
                                        zIndex: 1000
                                    }}
                                    >
                                        {suggestions.sites[index]?.map((suggestion, sIndex) => {
                                            console.log("Rendering site suggestion:", suggestion)
                                            return (
                                                <TouchableOpacity
                                                    key={sIndex}
                                                    style={styles.suggestionItem}
                                                    onPress={() => {
                                                        handleSiteChange(site.id, suggestion.description, index);
                                                        setSuggestions(prev => ({
                                                            ...prev,
                                                            sites: prev.sites.map((s, i) => i === index ? [] : s) // Clear specific site's suggestions
                                                        }));
                                                        Keyboard.dismiss()
                                                        fetchSuggestions.cancel(); // Cancel any pending API calls
                                                    }}
                                                >
                                                    <Text style={styles.suggestionText}>{suggestion.description}</Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                        )}
                                    </View>
                                )}
                            </View>

                            {index > 0 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveSite(site.id)}
                                >
                                    <Ionicons name="remove-circle" size={24} color="#ff4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            handleAddSite()
                        }}
                        disabled={isRideActive}
                    >
                        <FontAwesome name="plus" size={16} color="white" />
                        <Text style={styles.addButtonText}>Add Construction Site</Text>
                    </TouchableOpacity>
                </View>



                <View style={{ flex: 1 }}>
                    {renderMap()}



                    {/* {routeCoordinates && Array.isArray(routeCoordinates) ? ( */}
                    {/* <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 43.6532,
            longitude: -79.3832,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
        }}
        onMapReady={handleMapReady}
          onError={(error) => {
            console.error("MapView Error:", error.nativeEvent?.message || error);
            showErrorPopup(error.nativeEvent?.message || error);
          }}
        >
          {isMapReady && routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#2196F3"
            />
          )}
        </MapView>

        {!isMapReady && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading map...</Text>
        </View>
      )} */}


                    {/* ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Unable to load map. Route data is not available.</Text>
        </View>
      )} */}
                </View>

                <TouchableOpacity style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    backgroundColor: appColor.primary,
                    justifyContent: 'center',
                    borderRadius: 7,
                    elevation: 1,
                }}
                    onPress={() => {
                        getDirections();
                    }}
                >
                    <Ionicons name="navigate" size={24} color={appColor.white} />
                    <Text style={{
                        color: appColor.white,
                        fontFamily: appFonts.Medium,
                        marginLeft: 15
                    }}>Get Directions</Text>
                </TouchableOpacity>

                {/* Controls */}
                <View style={[styles.controls, { marginTop: 10 }]}>
                    <CustomButton disabled={isRideActive || (!startLocation || constructionSites.some(site => !site.location))}
                        bgColor={(!startLocation || constructionSites.some(site => !site.location)) ? appColor.disabledPrimary : appColor.primary}
                        title={'Start Ride'}
                        onCick={() => handleStartRide()} />
                    <CustomButton disabled={!isRideActive} bgColor={!isRideActive ? appColor.disabledPrimary : appColor.primary} title={'End Ride'} onCick={() => handleEndRide()} />
                </View>

                {/* Results Display */}
                <View style={styles.resultsContainer}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Total Distance:</Text>
                        <Text style={styles.resultValue}>
                            {(typeof distanceData.totalDistance === 'number'
                                ? distanceData.totalDistance.toFixed(2)
                                : '0.00')} km
                        </Text>

                    </View>


                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Payable Amount:</Text>
                        <Text style={styles.resultValue}>${payableAmount}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>

    );
};


const styles = StyleSheet.create({
    mapLoadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    mapLoadingText: {
        marginTop: 10,
        color: '#333',
    },
    mapErrorContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ff4444',
    },
    mapErrorText: {
        color: '#ff4444',
        textAlign: 'center',
        padding: 20,
    },
    container: {
        flexGrow: 1,
        // padding: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 16,
        marginTop: 40
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        marginLeft: 16,
        color: '#333',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        fontFamily: appFonts.Regular,
    },
    siteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginVertical: 8,
    },
    siteInputWrapper: {
        flex: 1,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    removeButton: {
        paddingTop: 12,
        marginLeft: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appColor.primary,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 15,
        elevation: 1,
    },
    addButtonText: {
        color: 'white',
        fontSize: 15,
        fontFamily: appFonts.Medium,
        marginLeft: 8,
    },
    map: {
        height: 280,
        borderRadius: 16,
        marginBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#90caf9',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    resultsContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        elevation: 1
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    resultLabel: {
        fontSize: 15,
        color: '#666',
        fontFamily: appFonts.Regular
    },
    resultValue: {
        fontSize: 15,
        color: '#333',
        fontFamily: appFonts.Medium

    },
    suggestionItem: {
        padding: 12,
        backgroundColor: '#fff',
    },
    suggestionText: {
        fontSize: 16,
        color: '#333',
    },
});


export default MileageStartScreen;