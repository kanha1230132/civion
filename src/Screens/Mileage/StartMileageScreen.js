import { ActivityIndicator, Keyboard, Linking, Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useErrorPopupContext } from '../../context/PopupProvider'
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColor } from '../../theme/appColor';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { endPoints, MILAGE_API_KEY } from '../../api/endPoints';
import apiClient from '../../api/apiClient';
import { ScrollView } from 'react-native-gesture-handler';
import { appFonts } from '../../theme/appFonts';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomButton from '../../components/button/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants, PAY_AMOUNT, PAY_AMOUNT_DISTANCE } from '../../utils/Constants';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import * as  ExpoConstants from 'expo-constants';
import LoaderModal from '../../components/modal/Loader';
import util from '../../utils/util';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';
import moment from 'moment';
const typeSuggestions = {
  home: 'home',
  sites: 'sites',
  start: 'start',
  end: 'end'
}

const StartMileageScreen = () => {
  const navigation = useNavigation();
  // const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
  const {showErrorPopup,ErrorPopup,errorPopupVisible} = useErrorPopup();
  const { SuccessPopup,showSuccessPopup,isSuccessVisible} = useSuccessPopup();
  const [suggestions, setSuggestions] = useState([]);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isRideActive, setIsRideActive] = useState(false);
  const [typeOfSuggestions, setTypeOfSuggestions] = useState(typeSuggestions.home);
  const [mapError, setMapError] = useState(null);
  const [DirectionCoordinate, setDirectionCoordinate] = useState([])
  const isFocused = useIsFocused();
  const [IsAddress, setIsAddress] = useState({
    isHome: false,
    isSite: false
  })
  const [StartLocation, setStartLocation] = useState('');
  const [EndLocation, setEndLocation] = useState('');
  const [TotalDistance, setTotalDistance] = useState(0);
  const [TotalAmount, setTotalAmount] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [TotalDuration, setTotalDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    if (isFocused) {
      (async () => {
        
        const data = await getStartRideData();
        if (data) {
          setIsAddress(data.isAddress);
          setStartLocation(data.startLocation);
          setEndLocation(data.endLocation);
          setTotalDistance(data.distance);
          setTotalAmount(data.amount);
          setRouteCoordinates(data.coords);
          setIsRideActive(true);
          setTotalDuration(data.duration);
          const _region =  calculateRegion(data.coords);
        setRegion(_region);
        }
      })();
    }
  }, [isFocused])


  // Zoom to fit all markers when map is ready
  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMapError('Location permission is required for this feature');
      }
    };

    checkPermissions();
  }, []);

  const handleMapReady = () => {
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
  }

  const setStartRideData = async (data) => {
    try {
      await AsyncStorage.setItem(Constants.START_RIDE_DATA, JSON.stringify(data));
    } catch (error) {
      console.log("Error setStartRideData :", error)
    }
  }
  const getStartRideData = async () => {
    try {
      const list = await AsyncStorage.getItem(Constants.START_RIDE_DATA);
      if (list) {
        return JSON.parse(list);
      }
      return null
    } catch (error) {
      console.log("Error setStartRideData :", error);
      return null
    }
  }
  const fetchSuggestions = async (input, type) => {
    try {
      setTypeOfSuggestions(type);
      const components = "country:CA";
      const types = 'geocode|establishment'
      const sessionToken = Math.random().toString(36).substring(2, 15)
      const requestURL = `${endPoints.URL_GOOGLE_PLACE_API}input=${input}&key=${MILAGE_API_KEY}&components=${components}&sessiontoken=${sessionToken}&types=${types}`
      const response = await apiClient.get(requestURL);
      if (response.status === 200) {
        if (response.data.predictions) {
          setSuggestions(response.data.predictions);
        }
      }
    } catch (error) {
      showErrorPopup(error?.message || 'Something went wrong in fetchSuggestions.');
    }
  }
  const renderMap = () => {
    const isStandaloneApp = ExpoConstants?.AppOwnership?.Expo === 'standalone';

    if (Platform.OS === 'android' && isStandaloneApp) {
      return (
        <View style={styles.mapErrorContainer}>
          <Text style={styles.mapErrorText}>Loading map services...</Text>
        </View>
      );
    }
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
          zoomEnabled={true}
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
  const getDirections = () => {
    if (DirectionCoordinate.length > 0) {
      navigateWithGoogleMaps(DirectionCoordinate[0].lat
        , DirectionCoordinate[0].lng, DirectionCoordinate[1].lat
        , DirectionCoordinate[1].lng);

    } else {
      showErrorPopup('Not Getting Directions, refresh the page');
    }
  }
  const navigateWithGoogleMaps = () => {
    try {
      // const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${StartLocation}&destination=${EndLocation}&travelmode=driving`;
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    } catch (error) {
      showErrorPopup('Something went wrong. Please try again.');
    }

  };
  const callToStartRide = async () => {
    try {
      setDirectionCoordinate([]);
      if (!StartLocation || !EndLocation) {
        showErrorPopup('Please fill all location fields');
        return;
      }
      if (!IsAddress.isHome && IsAddress.isSite) {
        showErrorPopup('Please Change Home Address / Site Address');
        return;
      }
      setLoading(true)
      let totalDistance = 0;
      let allCoords = [];
      let totalAmount = 0;
      let totalDuration = ''
      const locationData = await getRouteData(StartLocation, EndLocation);
      if (locationData && locationData.distance) {
        totalDistance += locationData.distance;
        allCoords.push(...locationData.coords);
        totalDuration = locationData?.duration
      }
      const _region =  calculateRegion(allCoords);
      setRegion(_region);
      setRouteCoordinates(allCoords);
      setTotalDistance(totalDistance);
      setTotalDuration(totalDuration);
      await setStartRideData({
        startLocation: StartLocation,
        endLocation: EndLocation,
        distance: totalDistance,
        duration: totalDuration,
        amount: totalAmount,
        coords: allCoords,
        isAddress: IsAddress
      })
      setIsRideActive(true);
      setLoading(false)
      if(Platform.OS == "ios"){
        await util.delay(1000)
      }

      await showSuccessPopup('Start Ride Successfully');
    } catch (error) {
      console.log("Error callToStartRide : ", error)
      showErrorPopup('Something went wrong. Please try again.');

    } finally {
      setLoading(false)
    }
  }
  const resetStartRide = () => {
    try {
      setIsRideActive(false);
      // setRouteCoordinates([]);
      setStartLocation('');
      setEndLocation('');
      setTotalDistance(0);
      setTotalDuration('');
      setTotalAmount(0);
      setIsAddress({ isHome: false, isSite: false });
    } catch (error) {
      console.log("Error  resetStartRide : ", error)
    }

  }

  const callToEndRide = async () => {
    try {
      let totalAmount = 0
      setLoading(true)
      const startRideData = await getStartRideData();
      if (startRideData) {
        let totalDistance = startRideData.distance;
        const tempIsAddress = startRideData.isAddress;
        if ((!tempIsAddress?.isHome && !tempIsAddress?.isSite) || (tempIsAddress?.isHome && tempIsAddress?.isSite)) {
          if (totalDistance > PAY_AMOUNT_DISTANCE) {
            totalAmount = PAY_AMOUNT * (totalDistance - PAY_AMOUNT_DISTANCE);
            setTotalAmount(totalAmount);
          }
        } else if (tempIsAddress?.isHome && !tempIsAddress?.isSite) {
          totalAmount = PAY_AMOUNT * (totalDistance);
          setTotalAmount(totalAmount);
        }

        setRouteCoordinates(startRideData.coords);
        const _region =  calculateRegion(startRideData.coords);
        setRegion(_region);
        setStartLocation(startRideData.startLocation);
        setEndLocation(startRideData.endLocation);
        setTotalDistance(startRideData.distance);
      }

      const user_id = await AsyncStorage.getItem(Constants.USER_ID);
      const body = {
        userId: user_id,
        startLocation: startRideData.startLocation,
        endLocation: startRideData.endLocation,
        distance: Number(startRideData.distance).toFixed(2),
        duration: startRideData.duration,
        amount: Number(totalAmount).toFixed(2),
        coords: startRideData.coords,
         date: moment().format('YYYY-MM-DD hh:mm:ss')
      }

      console.log("body : ", JSON.stringify(body));


      const response = await apiClient.post(endPoints.URL_CALCULATE_MILAGE, body);
      setLoading(false)
      await util.delay(1000);

      if (response.status === 403 || response.status === 401) {
       const res = await showErrorPopup(response?.data?.message || 'Something went wrong');
        util.logoutUser();
        navigation.replace(SCREENS.LOGIN_SCREEN);
        return;
      }
      if (response.status === 200) {
        if (response.data) {
          if (response.data.status == "success") {
            await AsyncStorage.removeItem(Constants.START_RIDE_DATA);
            await showSuccessPopup(response?.data?.message+`\nDistance : ${startRideData.distance} KM \n Duration : ${startRideData.duration}\n Amount : $${totalAmount.toFixed(2)}` || 'Ride successfully')
            resetStartRide()
            navigation.goBack()
            return;
          }
        }
        await showErrorPopup(response?.data?.message || 'Something went wrong');
            resetStartRide()

      } else {
        await showErrorPopup(response?.data?.message || 'Something went wrong');
            resetStartRide()
      
      }


    } catch (error) {
      console.log("Error callToEndRide : ", error)
            resetStartRide()

    } finally {
      setLoading(false)
      
    }
  }
  const getRouteData = async (origin, destination) => {
    try {
    
      const url = endPoints.URL_GOOGLE_DIRECTION_API + `origin=${origin?.trim()}&destination=${destination?.trim()}&mode=driving&key=${MILAGE_API_KEY}`
      const response = await apiClient.get(url);
      if (response.status == 200) {
        const output = response?.data;
        if (output.status == 'REQUEST_DENIED' || output?.error_message) {
          await showErrorPopup(output?.error_message || 'Something went wrong');
          return { distance: 0, duration: '', coords: [] };
        } else {
          const coords = output.routes?.[0]?.legs?.[0];
          const values = [coords?.start_location, coords?.end_location];
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
      }
    } catch (error) {
      setDirectionCoordinate([])
      return { distance: 0, duration: '', coords: [] };
    }
  };


  const calculateRegion = (coordinates) => {
    if (!coordinates || coordinates.length === 0) {
      return null;
    }
  
    // Extract all latitudes and longitudes
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
  
    // Calculate min/max
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
  
    // Calculate center point
    const center = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
    };
  
    // Calculate deltas with some padding
    const latitudeDelta = (maxLat - minLat) * 1.5; // 1.5 = padding factor
    const longitudeDelta = (maxLng - minLng) * 1.5;
  
    return {
      ...center,
      latitudeDelta,
      longitudeDelta,
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: appColor.white }} >
      <View style={{
        paddingVertical: 8
      }}>
        <HeaderWithBackButton customStyle={{ marginLeft: -5 }} title="Mileage Tracker" onBackClick={() => navigation.goBack()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>

        {/* Location Inputs */}
        <View style={styles.inputGroup}>
          {/* Home Address */}


          <View style={styles.inputContainer}>
            {
              IsAddress?.isHome ?
                <MaterialCommunityIcons name="map-marker" size={20} color="#555" />
                :
                <MaterialCommunityIcons name="home-map-marker" size={20} color="#555" />

            }
            <TextInput
              style={styles.input}
              placeholder={IsAddress?.isHome ? "Construction Site" : "Home Address"}
              placeholderTextColor="#999"
              value={StartLocation}
              onChangeText={text => {
                setStartLocation(text);
                fetchSuggestions(text, typeSuggestions.start);
              }}
              editable={!isRideActive}
            />
            <View style={{
              paddingVertical:10
            }} >
  <Switch
            // style={{height:20}}
            
              thumbColor={IsAddress?.isHome ? appColor.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => { setIsAddress({ ...IsAddress, isHome: !IsAddress?.isHome }) }}
              value={IsAddress?.isHome}
              disabled={isRideActive}

            />
            </View>
          
          </View>

          {typeOfSuggestions === typeSuggestions.start && suggestions.map((suggestion, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setStartLocation(suggestion.description);
                  setSuggestions([]);
                  Keyboard.dismiss()
                }}
              >
                <Text style={styles.suggestionText}>{suggestion.description}</Text>
              </TouchableOpacity>
            )
          })}

          <View style={[styles.inputContainer, { marginTop: 10 }]}>
            {
              IsAddress?.isSite ?
                <MaterialCommunityIcons name="home-map-marker" size={20} color="#555" />
                :
                <MaterialCommunityIcons name="map-marker" size={20} color="#555" />
            }
            <TextInput
              style={styles.input}
              placeholder={IsAddress?.isSite ? "Home Address" : "Construction Site"}
              placeholderTextColor="#999"
              value={EndLocation}
              onChangeText={text => {
                setEndLocation(text);
                fetchSuggestions(text, typeSuggestions.end);
              }}
              editable={!isRideActive}
            />
            <Switch
              thumbColor={IsAddress?.isSite ? appColor.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => { setIsAddress({ ...IsAddress, isSite: !IsAddress?.isSite }) }}
              value={IsAddress?.isSite}
              disabled={isRideActive}


            />
          </View>

          {typeOfSuggestions === typeSuggestions.end && suggestions.map((suggestion, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setEndLocation(suggestion.description);
                  setSuggestions([]);
                  Keyboard.dismiss()
                }}
              >
                <Text style={styles.suggestionText}>{suggestion.description}</Text>
              </TouchableOpacity>
            )
          })}
        </View>



        {/* {constructionSites.map((site, index) => (
          <View key={site.id} style={styles.siteContainer}>
            <View style={styles.siteInputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="shovel" size={20} color="#555" />
                <TextInput
                  style={styles.input}
                  placeholder={`Construction Site ${index + 1}`}
                  placeholderTextColor="#999"
                  value={site.location}
                  onChangeText={text => {
                    handleSiteChange(site.id, text, index);
                    fetchSuggestions(text, typeSuggestions.sites);

                  }}
                  editable={!isRideActive}
                />
              </View>
              {typeOfSuggestions === typeSuggestions.sites && suggestions?.map((suggestion, sIndex) => {
                return (
                  <TouchableOpacity
                    key={sIndex}
                    style={styles.suggestionItem}
                    onPress={() => {
                      handleSiteChange(site.id, suggestion.description, index);
                      setSuggestions([]);
                      Keyboard.dismiss()
                    }}
                  >
                    <Text style={styles.suggestionText}>{suggestion.description}</Text>
                  </TouchableOpacity>
                )
              }
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


        */}

        <View style={{ marginTop: 20 }}>
          {renderMap()}

        </View>

        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          backgroundColor: (!isRideActive) ? appColor.disabledPrimary : appColor.primary,
          justifyContent: 'center',
          borderRadius: 7,
          elevation: 1,
        }}
          onPress={() => {
            getDirections();
          }}
          disabled={!isRideActive}
        >
          <Ionicons name="navigate" size={24} color={appColor.white} />
          <Text style={{
            color: appColor.white,
            fontFamily: appFonts.Medium,
            marginLeft: 15
          }}>Get Directions</Text>
        </TouchableOpacity>


        <View style={[styles.controls, { marginTop: 10 }]}>
          <View style={{flex:1}}>
 <CustomButton disabled={isRideActive}
            bgColor={(isRideActive) ? appColor.disabledPrimary : appColor.primary}
            title={'Start Ride'}
            onCick={() => {
              callToStartRide()
            }} />
          </View>

          <View style={{flex:1}}>

 <CustomButton disabled={!isRideActive} bgColor={!isRideActive ? appColor.disabledPrimary : appColor.primary} title={'End Ride'} onCick={() => {
            callToEndRide()
          }} />
          </View>
         
         
        </View>

        <View style={styles.resultsContainer}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Distance:</Text>
            <Text style={styles.resultValue}>
              {(typeof TotalDistance === 'number'
                ? TotalDistance?.toFixed(2)
                : '0.00')} km
            </Text>

          </View>


          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Duration:</Text>
            <Text style={styles.resultValue}>{TotalDuration}</Text>
          </View>


          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Payable Amount:</Text>
            <Text style={styles.resultValue}>${TotalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      <LoaderModal visible={loading} />

      {isSuccessVisible ? <SuccessPopup /> : null}
      {errorPopupVisible ? <ErrorPopup /> : null}
    </SafeAreaView>
  )
}

export default StartMileageScreen

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
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    borderWidth: 0.2,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});