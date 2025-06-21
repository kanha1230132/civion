import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, BackHandler, StatusBar, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { endPoints } from '../../api/endPoints';
import { imgURL } from '../../Assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import { appColor } from '../../theme/appColor';
import { screenHeight } from '../../utils/Constants';
import { useErrorPopupContext } from '../../context/PopupProvider';
import apiClient from '../../api/apiClient';
import { SCREENS } from '../../utils/ScreenNames';
import CustomButton from '../../components/button/CustomButton';
import { appFonts } from '../../theme/appFonts';
import util from '../../utils/util';
import LoaderModal from '../../components/modal/Loader';
import useKeyboard from '../../hooks/useKeyboard';
import { useSuccessPopup } from '../../components/popup/successPopup';
import { useErrorPopup } from '../../components/popup/errorPopup';
// import { endPoints } from '../api/endPoints';
const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showErrorPopup, ErrorPopup,errorPopupVisible } = useErrorPopup();
  const { showSuccessPopup, SuccessPopup ,isSuccessVisible} = useSuccessPopup();
  // const { showErrorPopup ,showSuccessPopup} = useErrorPopupContext();
  const [isFocus, setIsFocus] = useState(false)
  const {keyboardOpen} = useKeyboard()

    useEffect(() => {
      const backAction = () => {
        navigation.goBack()
        return true; // prevent default behavior
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );
      return () => backHandler.remove(); // clean up
    }, []);
  
  const handleContinue = async () => {
      setLoading(true);
      try {
          const response = await apiClient.post(endPoints.URL_FORGET_PASSWORD, { email : email });
          console.log('response : ',response);
          if (response.status == 401 || response.status == 403) {
                  const result = await showErrorPopup(response.data.message);
                  if(result){
                    util.logoutUser();
                    navigation.navigate(SCREENS.LOGIN_SCREEN);
                  }
                  return;
          }
          if (response.status === 200 || response.status === 201) {
              setLoading(false);
              await showSuccessPopup(response.data.message)
              navigation.navigate(SCREENS.VERIFY_CODE_SCREEN, { email });
          } else {
              showErrorPopup(response.data.message);
              console.log(response.data.message)
          }
          setLoading(false);

      } catch (error) {
          showErrorPopup(error.response?.data?.message || 'Something went wrong');
          setLoading(false);

      } finally {
          setLoading(false);
      }
  };

  return (
    <SafeAreaView style={styles.safeArea}>

         <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
        <HeaderWithBackButton customStyle={{marginLeft:-13}} title="Forgot Password" onBackClick={() => navigation.goBack()} />      

        <ScrollView style={{flex:1}} showsHorizontalScrollIndicator={false}>
      {/* Image in place of lock icon */}
      <View style={styles.iconContainer}>
        <Image
          source={imgURL.FORGOT_PASSWORD_PHOTO} // Path to the image in the assets folder
          style={styles.icon}
        />
      </View>

      <Text style={styles.subHeader}>Please enter your email account to reset your password</Text>

      {/* Email Input */}
      <View style={[styles.inputContainer,{borderColor: isFocus ? appColor.primary : 'black'}]}>
        <TextInput
          style={[styles.textInput]}
          placeholder="Enter your email address"
          value={email}
          onChangeText={(text) => setEmail(text)}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
        <Ionicons name="mail-outline" size={20} color={isFocus ? appColor.primary : 'black'} style={styles.inputIcon} />
      </View>
      </ScrollView>

      {/* Buttons */}
      <View style={[styles.buttonContainer,keyboardOpen ? {top: screenHeight - 85 - StatusBar.currentHeight} : {bottom: 4}]}>
        <CustomButton title="Continue" onCick={()=>handleContinue()} bgColor={!email.includes('@') ? appColor.disabledPrimary : appColor.primary} disabled={!email.includes('@')} />
      </View>
      </KeyboardAvoidingView>

      <LoaderModal visible={loading} />

      {isSuccessVisible ? <SuccessPopup /> : null}
      {errorPopupVisible ? <ErrorPopup /> : null}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
      },
    container: {
        flex: 1,
        // justifyContent: 'space-between',
        padding: 20
      },
  header: {
    fontFamily:appFonts.Medium,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 70, // Margin to create space between the header and subheader
  },
  subHeader: {
    fontSize: 16,
    color: '#7f8c8d',
    // textAlign: 'center',
    marginVertical:20,
    fontFamily:appFonts.Medium

  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 200, // Adjust size as needed
    height: 200, // Adjust size as needed
    resizeMode: 'contain', // Ensures the image maintains its aspect ratio
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom:50
  },
  textInput: {
    flex: 1,
    height: 40,
    fontFamily:appFonts.Medium
  },
  inputIcon: {
    marginLeft: 10,
  },
  buttonContainer: {
    position:'absolute',
    // top:screenHeight-85-StatusBar.currentHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf:'center'    
  }

});

export default ForgotPassword;
