import React, { useEffect } from 'react';
import { View, ImageBackground, StyleSheet, Text, SafeAreaView, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SCREENS } from '../utils/ScreenNames';
import { appName, Constants } from '../utils/Constants';
import util from '../utils/util';
import { appFonts } from '../theme/appFonts';
import { appColor } from '../theme/appColor';

const SplashScreen = () => {
  const navigation = useNavigation();


  useEffect(() => {
    const timer = setTimeout(async () => {
        const data = await util.getAsyncStorageItem(Constants.IS_LOGGED_IN);
          if (data) {
            navigation.reset({
                 index: 0,  // 0 means this is the first screen after reset
                 routes: [{ name: SCREENS.MAIN_TABS }], // Define the new route stack
               });
          }else{
            navigation.replace(SCREENS.LOGIN_SCREEN); // Navigate to LoginScreen after 2 seconds

          }
    }, 2000);

    return () => clearTimeout(timer); // Clear timer if component unmounts
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../Assets/image_1.png')} // Background image 
      style={styles.background}
    >
                <StatusBar barStyle='dark-content' translucent = {true} backgroundColor={'transparent'} />
      
      <SafeAreaView style={styles.overlay}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../Assets/logo.png')} // Logo image
            style={styles.logo}
          />
          <View style={styles.textContainer}>
            <Text style={styles.companyText}>{appName}</Text>
            {/* <Text style={styles.companyText}>COMPANY</Text> */}
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255, 255, 0.75)', // Light blue overlay with 89% transparent/opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center'
  },
  textContainer: {
    marginLeft: 15,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  companyText: {
    fontSize: 30,
    color: appColor.primary,
    fontFamily: appFonts.Bold,
  },
});

export default SplashScreen;
