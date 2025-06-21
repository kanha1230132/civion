import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, BackHandler, SafeAreaView } from 'react-native';
import axios from 'axios';  // Import axios for making HTTP requests
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import { endPoints } from '../../api/endPoints';
import { appName, screenHeight } from '../../utils/Constants';
import { useErrorPopupContext } from '../../context/PopupProvider';
import LoaderModal from '../../components/modal/Loader';
import { Image } from 'react-native';
import { imgURL } from '../../Assets';
import { appColor } from '../../theme/appColor';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { appFonts } from '../../theme/appFonts';
import CustomButton from '../../components/button/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import IconTextInput from '../../components/IconTextInput';
import { SCREENS } from '../../utils/ScreenNames';
import { ScrollView } from 'react-native-gesture-handler';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';

const RegisterScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showErrorPopup, ErrorPopup,errorPopupVisible } = useErrorPopup();
  const { showSuccessPopup, SuccessPopup ,isSuccessVisible} = useSuccessPopup();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack()
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const handleRegister = async () => {
    // Input validation
    if (!userName || !email || !password) {
      showErrorPopup("Please fill all fields!");
      return;
    }

    // Regex for email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email.match(emailPattern)) {
      showErrorPopup("Invalid email format!");
      return;
    }

    // Password validation (at least 8 characters)
    if (password.length < 8) {
      showErrorPopup("Password must be at least 8 characters long!");
      return;
    }

    const userData = {
      username: userName,
      email: email,
      password: password,
    };
    try {
      setIsLoading(true);
      const response = await apiClient.post(endPoints.URL_REGISTER, userData);
      setIsLoading(false);
      if (response.status === 200 || response.status === 201) {
        showSuccessPopup(response.data.message).then((res) => {
        navigation.goBack()
        })
      } else {
        showErrorPopup(response.data.message);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      showErrorPopup(error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }


  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: "#ffffff",
      padding: 20
    }}>
      <View style={{ flex: 1, justifyContent: 'center'}}>
      <ScrollView style={{ flex: 1, marginHorizontal: Platform.OS === 'ios' ? 12 : 0 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            top: 25,
            left: 5,
            zIndex: 1,
            backgroundColor: 'white',
            borderRadius: 50,
            padding: 10,
            elevation: 5, // Adds shadow for Android
            shadowColor: "#000", // Adds shadow for iOS
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image source={imgURL.LOGO} style={{ width: 100, height: 100 }} resizeMode='cover' />
          <Text style={styles.companyName}>{appName}</Text>
        </View>
        <Text style={styles.heading}>Hey,{' \n'}Register Now!</Text>


        <CustomTextInput
          onChangeTextValue={setUserName}
          textValue={userName}
          label="User Name"
        />

        <CustomTextInput
          onChangeTextValue={setEmail}
          textValue={email}
          label="E-mail ID"
        />


        <IconTextInput
          onChangeTextValue={setPassword}
          textValue={password}
          label="Password"
          iconName={showPassword ? 'eye' : 'eye-off'}
          onclickIcon={togglePasswordVisibility}
          editable={true}
          IsSecurity={!showPassword}
        />

        <View style={{ height: 45, marginTop: 20 }}>
          <CustomButton
            disabled={(!email || !password || !userName) ? true : false}
            title={"Register"}
            onCick={() => handleRegister()}
            bgColor={(!email || !password || !userName) ? appColor.disabledPrimary : appColor.primary}
          />

        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <View style={{
            height: 1,
            backgroundColor: appColor.disabled,
            width: '43%'
          }} />
          <Text style={{
            color: appColor.black,
            fontFamily: appFonts.Medium,
            fontSize: 16
          }}>OR</Text>
          <View style={{
            height: 1,
            backgroundColor: appColor.disabled,
            width: '43%'
          }} />
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 10
        }}>
          <Text style={{
            color: appColor.black,
            fontFamily: appFonts.Medium,
            fontSize: 16
          }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREENS.LOGIN_SCREEN)}>
            <Text style={{
              color: appColor.primary,
              fontFamily: appFonts.Medium,
              fontSize: 16,
              marginLeft: 5
            }}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, position: 'relative' }}>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Powered by</Text>
            <Text style={styles.footerCompany}>Kusiar Project Services Inc.</Text>
          </View>
        </View>


      </ScrollView>
      </View>
      {/* <HeaderWithBackButton title={"Registration"} onBackClick={() => navigation.goBack()} /> */}
     

   {isLoading ? <LoaderModal visible={isLoading} /> : null}   
      {errorPopupVisible ? <ErrorPopup /> : null}
      {isSuccessVisible ? SuccessPopup() : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  companyName: {
    fontSize: 20,
    fontFamily: appFonts.Bold,
    color: "#486ECD",
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center', // Ensures everything is centered
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding for footer space
  },
  heading: {
    fontSize: 22, // Increased font size for better visibility
    fontFamily: appFonts.Bold,
    textAlign: 'left',
    color: '#333', // Darker color for contrast
    marginBottom: 20, // Increased margin to separate from form fields
  },
  inputContainer: {
    marginBottom: 20, // Adds space between each input field
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#000', // Set border color to black
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    fontFamily: appFonts.Medium,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1, // Take up all available space
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: appFonts.Medium,
  },
  footerContainer: {
    position: 'absolute',
    top: screenHeight - 30,

    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: appFonts.Medium,
  },
  footerCompany: {
    color: '#486ECD',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 10,
    fontFamily: appFonts.Medium,
  },
});

export default RegisterScreen;
