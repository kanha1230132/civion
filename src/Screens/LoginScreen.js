import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomStatusBar from "../utils/CustomStatusBar";
import { endPoints } from "../api/endPoints";
import { appName, Constants } from "../utils/Constants";
import { SCREENS } from "../utils/ScreenNames";
import util from "../utils/util";
import { BackHandler } from "react-native";
import apiClient from '../api/apiClient';
import LoaderModal from '../components/modal/Loader'
import { useErrorPopup } from "../components/popup/errorPopup";
import { appColor } from "../theme/appColor";
import { ScrollView } from "react-native";
import { imgURL } from "../Assets";

import CustomTextInput from "../components/CustomTextInput";
import { appFonts } from "../theme/appFonts";
import CustomButton from "../components/button/CustomButton";
import IconTextInput from "../components/IconTextInput";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp()
      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove(); // clean up
  }, []);



  useEffect(() => {
    getData();
  }, []);


  const navigateHomeScreen = () => {
    navigation.reset({
      index: 0,  // 0 means this is the first screen after reset
      routes: [{ name: SCREENS.MAIN_TABS }], // Define the new route stack
    });
  }

  async function handleSubmit() {
    if (!email || !password) {
      showErrorPopup("Please enter email and password");
      return;
    }
    const userData = {
      email: email,
      password: password,
    };
    try {
      setIsLoading(true);
      const response = await apiClient.post(endPoints.URL_LOGIN, userData);
      if (response.status == 200 || response.status == 201) {
        const output = response.data;
        if (output.status == "success") {
          const token = output.data.token;
          const userId = output.data.userId;
          const isBoss = output.data.isBoss;
          const userName = output.data.userName;
          await AsyncStorage.setItem(Constants.USER_TOKEN, token);
          await AsyncStorage.setItem('userId', userId);
          await AsyncStorage.setItem(Constants.IS_BOSS, JSON.stringify(isBoss));
          await AsyncStorage.setItem(Constants.IS_LOGGED_IN, "true"); //Store isBoss
           AsyncStorage.setItem(Constants.USER_EMAIL, email);
         AsyncStorage.setItem(Constants.USER_NAME, userName);
        
          setIsLoading(false);
          navigateHomeScreen()

        } else {
          showErrorPopup(output.message);
          setIsLoading(false);
        }
      } else {
        showErrorPopup(response?.data?.message || "Something went wrong please try again");
        console.log("Login failed response: ", response.data.message)
        setIsLoading(false);
      }
    } catch (error) {
      showErrorPopup("Something went wrong please try again");
      console.log("Error during login :", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getData() {
    const data = await util.getAsyncStorageItem(Constants.IS_LOGGED_IN);
    if (data) {
      navigateHomeScreen()
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1,marginHorizontal:Platform.OS === 'ios' ? 12 : 0 }} showsVerticalScrollIndicator={false}>
        {/* Use CustomStatusBar */}
        <CustomStatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />
        <View style={styles.logoContainer}>
          <Image source={imgURL.LOGO} style={{width: 100, height: 100}}  />
          <Text style={styles.companyName}>{appName}</Text>
        </View>
        <Text style={styles.greeting}>Hey,</Text>
        <Text style={styles.greeting}>Login Now!</Text>

        <IconTextInput
                            onChangeTextValue={setEmail}
                            textValue={email}
                            label="E-mail ID"
                            iconName={"person"}
                        />

<IconTextInput
                            onChangeTextValue={setPassword}
                            textValue={password}
                            label="Password"
                            iconName={showPassword ? 'eye' : 'eye-off'}
                            onclickIcon={()=>setShowPassword(!showPassword)}
                            editable={true}
                            IsSecurity={!showPassword}
                        />
     

        <TouchableOpacity style={{
          alignSelf: 'flex-end',
        }} onPress={() => navigation.navigate(SCREENS.FORGOT_PASSWORD)}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>


        <View style={{
          marginTop: 20
        }}>
          <CustomButton textSize={16} title="Login" onCick={() => handleSubmit()} />
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20,
          alignItems: 'center',
          justifyContent:'space-between'
        }}>
          <View style={{
            height: 1,
            backgroundColor: appColor.disabled,
            width:'43%'
          }} />
          <Text style={{
            color:appColor.black,
            fontFamily: appFonts.Medium,
            fontSize:16
          }}>OR</Text>
          <View style={{
            height: 1,
            backgroundColor: appColor.disabled,
            width:'43%'
          }} />
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20
        }}>
          <Text style={{
            color:appColor.black,
            fontFamily: appFonts.Medium,
            fontSize:16
          }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(SCREENS.REGISTER_SCREEN)}>
          <Text style={{
            color:appColor.primary,
            fontFamily: appFonts.Medium,
            fontSize:16,
            marginLeft:5
          }}>Sign Up</Text>
          </TouchableOpacity>
        </View>

       

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Powered by</Text>
          <TouchableOpacity>
            <Text style={styles.companyLink}>Kusiar Project Services Inc.</Text>
          </TouchableOpacity>
        </View>

        <LoaderModal visible={isLoading} />

        {errorPopupVisible ? <ErrorPopup /> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 22,
    fontFamily:appFonts.Bold,
    color: "#000",
    marginBottom: 5,
  },
  footerContainer: {
    // position: "absolute",
    // bottom: 20,
    // left: 0,
    // right: 0,
    alignItems: "center",
    marginTop:50
  },
  customCheckbox: {
    padding: 5,
    marginRight: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",

  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  companyName: {
    fontSize: 20,
    fontFamily:appFonts.Bold,
    color: "#486ECD",
    marginTop: 10,
  },
  loginNowText: {
    fontFamily:appFonts.Medium,
    color: "#486ECD",
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 5,
    fontFamily:appFonts.Medium
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginRight: 10,
    color: "#000",
    fontFamily:appFonts.Medium,
    height:45,
    alignItems:'center'
  },
  optionsContainer: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,


  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberMeText: {
    marginLeft: 5,
    fontSize: 16,
  },
  forgotPasswordText: {
    color: "#486ECD",
    fontSize: 16,
    fontFamily:appFonts.SemiBold
    // Make the text bold
  },
  loginButton: {
    backgroundColor: "#486ECD",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    flex: 1, // Take up equal space in the row
    marginRight: 10, // Space between buttons
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpButton: {
    backgroundColor: "#486ECD",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
    flex: 1, // Take up equal space in the row
  },
  signUpButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  fontFamily:appFonts.Medium

  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#707070",
  fontFamily:appFonts.Medium

  },
  companyLink: {
    textAlign: "center",
    fontSize: 14,
    color: "#486ECD",
    textDecorationLine: "underline",
  fontFamily:appFonts.Medium

  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Vertically center the buttons
    marginVertical: 20,
  },
});

export default LoginScreen;