import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "./Constants";
import * as FileSystem from 'expo-file-system';
import { Asset } from "expo-asset";
import uuid from 'react-native-uuid';

const removeAsyncItem = async (key) => await AsyncStorage.removeItem(key);
const saveAccessToken = async (token) => await AsyncStorage.setItem(Constants.USER_TOKEN, token);
const getAccessToken = async () => await AsyncStorage.getItem(Constants.USER_TOKEN);

const getAsyncStorageItem = async (key) => await AsyncStorage.getItem(key) ? JSON.parse(await AsyncStorage.getItem(key)) : null;



const logoutUser = () => {
    removeAsyncItem(Constants.USER_TOKEN);
    removeAsyncItem(Constants.USER_ID);
    removeAsyncItem(Constants.IS_LOGGED_IN);
    
}


const convertImageToBase64 = async (logo = require('../Assets/pdflogo.png')) => {
    try {
        const asset = Asset.fromModule(logo);
        await asset.downloadAsync(); // Ensure it's available locally
    
        const base64String = await FileSystem.readAsStringAsync(asset.localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
    
        return `data:image/png;base64,${base64String}`; // Use in <img> tag
      } catch (error) {
        console.error('Error converting image to Base64:', error);
        return null;
      }
 
};

const getImageBuffer = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // If you need a buffer-like object (e.g., for APIs):
  const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return buffer;
};

const getUuid = () => uuid.v4();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export default {delay, removeAsyncItem, saveAccessToken, getAccessToken,logoutUser,getAsyncStorageItem , convertImageToBase64,getImageBuffer,getUuid};