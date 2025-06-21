import { Dimensions } from "react-native";

export const Constants = {
    USER_TOKEN: 'userToken',
    USER_ID: 'userId',
    IS_LOGGED_IN: 'isLoggedIn',
    USER_EMAIL: 'userEmail',
    LOCAL_PHOTOS: 'localPhotos',
    IS_BOSS: 'isBoss',
    USER_NAME: 'userName',
    START_RIDE_DATA:'startRideData'
}



export  const DateFormat = {
    MMMM_DD_YYYY: 'MMMM DD, YYYY',
    DD_MM_YYYY_Format1: 'DD/MM/YYYY',
    YYYY_MM_DD: 'YYYY-MM-DD',
    DD_MM_YYYY: 'DD-MM-YYYY',
    MMM_DD_YYYY: 'MMM DD, YYYY',
}

export const ImageType = {
    COMPANY :'company',
    SCHEDULE : 'schedule',
    EXPENSE : 'expense'
}

export const TypeReports ={
    DAILY : 'Daily',
    WEEKLY : 'Weekly',
    DAIRY: 'Diary'
}

export const appName = 'CIVION'
export const screenHeight = Dimensions.get('screen').height;
export const screenWidth = Dimensions.get('window').width;

export const PAY_AMOUNT_DISTANCE = 100;
export const PAY_AMOUNT = 0.5;