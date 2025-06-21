import React, { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FormProvider } from './src/FormContext';
import { DailyEntryProvider } from './src/utils/DailyEntryContext';
import {ProjectProvider } from './src/utils/ProjectContext';
import SplashScreen from './src/Screens/SplashScreen';
import LoginScreen from './src/Screens/LoginScreen';
import HomeScreen from './src/Screens/HomeScreen';
import MileageHistoryScreen from './src/Screens/MileageHistoryScreen';
import MileageStartScreen from './src/Screens/MileageStartScreen';
import MileageCancelScreen from './src/Screens/MileageCancelScreen';
import ValidationPopupMileage from './src/Screens/ValidationPopupMileage';
import SuccessPopupMileage from './src/Screens/SuccessPopupMileage';
import ReportDaily1 from './src/Screens/ReportDaily1';
import EnterVerificationCode1 from './src/Screens/EnterVerificationCode1';
import EnterVerificationCode2 from './src/Screens/EnterVerificationCode2';
import ResetPassword from './src/Screens/ResetPassword';
import Daily73 from './src/Screens/Daily73';
import Daily74 from './src/Screens/Daily74';
import Daily75 from './src/Screens/Daily75';
import Daily76 from './src/Screens/Daily76';
import Daily78 from './src/Screens/Daily78';
import ValidationPopupDR from './src/Screens/ValidationPopupDR';
import SuccessPopupDR from './src/Screens/SuccessPopupDR';
import Daily82 from './src/Screens/Daily82';
import Daily83 from './src/Screens/reports/weeklyReports/Daily83';
import Expenses from './src/Screens/Expenses';
import Daily64 from './src/Screens/Daily64';
import Daily65 from './src/Screens/Daily65';
import ValidationPopupExpense from './src/Screens/ValidationPopupExpense';
import SuccessPopupExpense from './src/Screens/SuccessPopupExpense';
import Daily70 from './src/Screens/Daily70';
import Daily71 from './src/Screens/Daily71';
import Invoicing from './src/Screens/Invoicing';
import Daily104 from './src/Screens/Daily104';
import Daily108 from './src/Screens/Daily108';
import Daily109 from './src/Screens/Daily109';
import SuccessPopupInvoicing from './src/Screens/SuccessPopupInvoicing';
import Daily86 from './src/Screens/Daily86';
import Daily89 from './src/Screens/Daily89';
import Daily99 from './src/Screens/Daily99';
import Dailyabc from './src/Screens/Dailyabc';
import BaselineSchedules from './src/Screens/BaselineSchedules';
import Hazard1 from './src/Screens/Hazard1';
import Hazard2 from './src/Screens/Hazard2';
import Hazard3 from './src/Screens/Hazard3';
import Hazard4 from './src/Screens/Hazard4';
import Hazard5 from './src/Screens/Hazard5';
import ValidationPopupH from './src/Screens/ValidationPopupH';
import SuccessPopupH from './src/Screens/SuccessPopupH';
import PhotosF from './src/Screens/PhotosF';
import DailyEntry1 from './src/Screens/DailyEntry1';
import DailyEntry3 from './src/Screens/DailyEntry3';
import ValidationPopupDE from './src/Screens/ValidationPopupDE';
import SuccessPopupDE from './src/Screens/SuccessPopupDE';
import BottomToolbar from './src/Screens/BottomToolbar';
import Registration from './src/Screens/Registration';
import ProjectDetailsScreen from './src/Screens/ProjectDetailsScreen';
import UploadSchedule from './src/Screens/UploadSchedule';
import DailyDiaryPreview from './src/Screens/DailyDiaryPreview';
import PDFViewer from './src/Screens/PDFViewer';
import DailyProjectList from './src/Screens/DailyProjectList';
import DiaryProjectList from './src/Screens/DiaryProjectList';
import { SCREENS } from './src/utils/ScreenNames';
import WeeklyInvoiceList from './src/Screens/Invoice/weeklyList';
import Daily72 from './src/Screens/reports/Daily72';
import Daily84 from './src/Screens/reports/weeklyReports/Daily84';
import Daily85 from './src/Screens/reports/weeklyReports/Daily85';
import Daily90 from './src/Screens/reports/weeklyReports/Daily90';
import VisitorDetails from './src/Screens/reports/weeklyReports/VisitorDetails';
import EquipmentDetails from './src/Screens/reports/weeklyReports/EquipmentDetails';
import LabourDetails from './src/Screens/reports/weeklyReports/LabourDetails';
import DescriptionDetails from './src/Screens/reports/weeklyReports/DescriptionDetails';
import WeeklyReportConfirm from './src/Screens/reports/weeklyReports/WeeklyReportConfirm';
import WorkFromEntry from './src/Screens/Invoice/workFromEntry';
import AddCompanyEmailScreen from './src/Screens/AddEmailScreen';
import PhotoFilesSelection from './src/Screens/reports/weeklyReports/PhotoFilesSelection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Constants } from './src/utils/Constants';
import ImageViewer from './src/Screens/ImageViewer';
import ProjectListScreen from './src/Screens/reports/ProjectListScreen';
import ForgotPassword from './src/Screens/ForgotPassword';
import { useErrorPopup } from './src/components/popup/errorPopup';
import { ErrorPopupProvider } from './src/context/PopupProvider';
import VerifyCodeScreen from './src/Screens/ForgotPassword/VerifyCodeScreen';
import ResetPasswordScreen from './src/Screens/ForgotPassword/ResetPasswordScreen';
import RegisterScreen from './src/Screens/RegisterScreen';
import BaseLineScheduleList from './src/Screens/BaseLineSchedule/BaseLineScheduleList';
import CreateSchedule from './src/Screens/BaseLineSchedule/CreateSchedule';
import PhotoFiles from './src/Screens/PhotoFiles/PhotoFiles';
import ViewAllPhoto from './src/Screens/PhotoFiles/ViewAllPhoto';
import JobHazardAnalysis from './src/Screens/JobHazard/JobHazardAnalysis';
import CreateJobHazard from './src/Screens/JobHazard/CreateJobHazard';
import { appColor } from './src/theme/appColor';
import useFonts from './src/hooks/useFonts';
import DailyEntryScreen from './src/Screens/reports/dailyReports/DailyEntryScreen';
import DailyEntryPreview from './src/Screens/reports/dailyReports/DailyEntryPreview';
import WeeklyEntryScreen from './src/Screens/reports/weeklyReports/WeeklyEntryScreen';
import DairyEntryScreen from './src/Screens/reports/dairyReports/DairyEntryScreen';
import CreateExpenseScreen from './src/Screens/Expense/CreateExpenseScreen';
import JobHarardReview from './src/Screens/JobHazard/JobHarardReview';
import StartMileageScreen from './src/Screens/Mileage/StartMileageScreen';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomTabNavigator from './src/Screens/BottomNavigation';
import DailyFormReportScreen from './src/Screens/reports/dailyReports/DailyFormReportScreen';

const Stack = createStackNavigator();
export function SafeAreaWrapper({ children }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{
      paddingTop: insets.top,
      // paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      flex: 1,
      backgroundColor: '#fff',

    }}>
      {children}
    </View>
  );
}

const App = () => {
  const [IsReady, SetIsReady] = useState(false);

  
  const [currentRoute, setCurrentRoute] = useState('');
  const toolbarScreens = [
    'HomeScreen',
    'MileageHistoryScreen',
    'Expenses',
    'Daily72',
    'Invoicing',
  ];
  const LoadFonts = async () => {
    await useFonts();
  };

  if (!IsReady) {
    LoadFonts().then(() => SetIsReady(true));
  }


  return (
    // <commonStyles>
    <SafeAreaProvider>
     <PaperProvider>

    <DailyEntryProvider>
      <ProjectProvider>
        <FormProvider>
          <ErrorPopupProvider>
          <StatusBar barStyle="dark-content"  backgroundColor={appColor.white} />
            <NavigationContainer
              // onStateChange={(state) => {
              //   // Update the current route name on navigation state changes
              //   const route = state?.routes[state.index];
              //   setCurrentRoute(route?.name || '');
              // }}
              screenOptions={{
                    headerShown: false,
                    // presentation: 'card',
                    // animationEnabled: true,
                    // gestureEnabled: true
                  }}
            >
              {/* <View style={{ flex: 1 ,backgroundColor:'white'}}> */}
                {/* Main Stack Navigator */}
                <Stack.Navigator initialRouteName="SplashScreen">
                  <Stack.Screen
                    name="SplashScreen"
                    component={SplashScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.LOGIN_SCREEN}
                    component={LoginScreen}
                    options={{ headerShown: false ,}}
                  />
                    <Stack.Screen
                      name="MainTabs"
                      component={BottomTabNavigator}
                      options={{ headerShown: false }}
                    />
                  {/* <Stack.Screen
                    name={SCREENS.HOME_SCREEN}
                    component={HomeScreen}
                    options={{ headerShown: false ,}}
                  /> */}

                  <Stack.Screen
                    name="MileageHistoryScreen"
                    component={MileageHistoryScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="MileageStartScreen"
                    component={MileageStartScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="MileageCancelScreen"
                    component={MileageCancelScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ValidationPopupMileage"
                    component={ValidationPopupMileage}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupMileage"
                    component={SuccessPopupMileage}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ReportDaily1"
                    component={ReportDaily1}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.FORGOT_PASSWORD}
                    component={ForgotPassword}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="EnterVerificationCode1"
                    component={EnterVerificationCode1}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="EnterVerificationCode2"
                    component={EnterVerificationCode2}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ResetPassword"
                    component={ResetPassword}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily72"
                    component={Daily72}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily73"
                    component={Daily73}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily74"
                    component={Daily74}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily75"
                    component={Daily75}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily76"
                    component={Daily76}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily78"
                    component={Daily78}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ValidationPopupDR"
                    component={ValidationPopupDR}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupDR"
                    component={SuccessPopupDR}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily84"
                    component={Daily84}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily85"
                    component={Daily85}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily82"
                    component={Daily82}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily83"
                    component={Daily83}
                    options={{ headerShown: false ,}}
                  />
                  {/* <Stack.Screen
                    name="Expenses"
                    component={Expenses}
                    options={{ headerShown: false ,}}
                  /> */}
                  <Stack.Screen
                    name="Daily64"
                    component={Daily64}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily65"
                    component={Daily65}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ValidationPopupExpense"
                    component={ValidationPopupExpense}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupExpense"
                    component={SuccessPopupExpense}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily70"
                    component={Daily70}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily71"
                    component={Daily71}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Invoicing"
                    component={Invoicing}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily104"
                    component={Daily104}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily108"
                    component={Daily108}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily109"
                    component={Daily109}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupInvoicing"
                    component={SuccessPopupInvoicing}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily86"
                    component={Daily86}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily89"
                    component={Daily89}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily99"
                    component={Daily99}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Dailyabc"
                    component={Dailyabc}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Daily90"
                    component={Daily90}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="BaselineSchedules"
                    component={BaselineSchedules}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Hazard1"
                    component={Hazard1}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Hazard2"
                    component={Hazard2}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Hazard3"
                    component={Hazard3}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Hazard4"
                    component={Hazard4}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Hazard5"
                    component={Hazard5}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ValidationPopupH"
                    component={ValidationPopupH}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupH"
                    component={SuccessPopupH}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="PhotosF"
                    component={PhotosF}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="DailyEntry1"
                    component={DailyEntry1}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="DailyEntry3"
                    component={DailyEntry3}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ValidationPopupDE"
                    component={ValidationPopupDE}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="SuccessPopupDE"
                    component={SuccessPopupDE}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="Registration"
                    component={Registration}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="ProjectDetailsScreen"
                    component={ProjectDetailsScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="UploadSchedule"
                    component={UploadSchedule}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.DAILY_ENTRY_PREVIEW}
                    component={DailyEntryPreview}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="DailyDiaryPreview"
                    component={DailyDiaryPreview}
                    options={{ headerShown: false ,}}
                  />
                  {/* <Stack.Screen
          name="PDFScreen"
          component={PDFScreen}
          options={{ headerShown: false ,}}
        /> */}
                  <Stack.Screen
                    name="PDFViewer"
                    component={PDFViewer}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="DailyProjectList"
                    component={DailyProjectList}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name="DiaryProjectList"
                    component={DiaryProjectList}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.WEEKLY_INVOICE_LIST}
                    component={WeeklyInvoiceList}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.VISITOR_DETAILS}
                    component={VisitorDetails}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.EQUIMENTS_DETAILS}
                    component={EquipmentDetails}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.LABOUR_DETAILS}
                    component={LabourDetails}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.DESCRIPTION_DETAILS}
                    component={DescriptionDetails}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.WEEKLY_REPORT_CONFIRM}
                    component={WeeklyReportConfirm}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.WORK_FROM_ENTRY}
                    component={WorkFromEntry}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.ADD_COMPANY_EMAIL}
                    component={AddCompanyEmailScreen}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.PHOTO_FILES_SELECTION}
                    component={PhotoFilesSelection}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.IMAGE_VIEWER}
                    component={ImageViewer}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.PROJECT_LIST_SCREEN}
                    component={ProjectListScreen}
                    options={{ headerShown: false ,}}
                  />

                  <Stack.Screen
                    name={SCREENS.VERIFY_CODE_SCREEN}
                    component={VerifyCodeScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.RESET_PASSWORD_SCREEN}
                    component={ResetPasswordScreen}
                    options={{ headerShown: false ,}}
                  />
<Stack.Screen
                    name={SCREENS.REGISTER_SCREEN}
                    component={RegisterScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.BASELINE_SCHEDULE_LIST}
                    component={BaseLineScheduleList}
                    options={{ headerShown: false ,}}
                  />


<Stack.Screen
                    name={SCREENS.CREATE_SCHEDULE}
                    component={CreateSchedule}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.PHOTO_FILES}
                    component={PhotoFiles}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.VIEW_ALL_PHOTO}
                    component={ViewAllPhoto}
                    options={{ headerShown: false ,}}
                  />

                  
                <Stack.Screen
                    name={SCREENS.JOB_HAZARD_ANALYSIS}
                    component={JobHazardAnalysis}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.CREATE_JOB_HAZARD}
                    component={CreateJobHazard}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.DAILY_ENTRY_SCREEN}
                    component={DailyEntryScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.WEEKLY_ENTRY_SCREEN}
                    component={WeeklyEntryScreen}
                    options={{ headerShown: false ,}}
                  />
                  <Stack.Screen
                    name={SCREENS.DAIRY_ENTRY_SCREEN}
                    component={DairyEntryScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.CREATE_EXPENSE_SCREEN}
                    component={CreateExpenseScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.JOB_HAZARD_REVIEW}
                    component={JobHarardReview}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.START_MILEAGE_SCREEN}
                    component={StartMileageScreen}
                    options={{ headerShown: false ,}}
                  />

<Stack.Screen
                    name={SCREENS.DAILY_FORM_REPORT_SCREEN}
                    component={DailyFormReportScreen}
                    options={{ headerShown: false ,}}
                  />



                </Stack.Navigator>




                {/* {toolbarScreens.includes(currentRoute) && (
                  <BottomToolbar
                    currentRoute={currentRoute} // Pass the current route explicitly

                  />
                )} */}



              {/* </View> */}
            </NavigationContainer>
          </ErrorPopupProvider>
        </FormProvider>
      </ProjectProvider>
    </DailyEntryProvider>
     </PaperProvider>
     </SafeAreaProvider>


  );
};

export default App;