import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect } from 'react'
import useWeeklyEntryHook from './weeklyEntry.hook'
import { ProjectContext } from '../../../utils/ProjectContext';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { appFonts } from '../../../theme/appFonts';
import { appColor } from '../../../theme/appColor';
import ReportDetails from './components/ReportDetails';
import CustomButton from '../../../components/button/CustomButton';
import { screenHeight } from '../../../utils/Constants';
import SelectedWeekEntry from './components/SelectedWeekEntry';
import { SCREENS } from '../../../utils/ScreenNames';
import useKeyboard from '../../../hooks/useKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';

const WeeklyEntryScreen = ({ navigation }) => {
  const {
    weeklyEntry, setWeeklyEntry,
    ActiveTab, setActiveTab,
    clickOnTabs
  } = useWeeklyEntryHook();
  const { projectData ,WeeklyEntryReport, setWeeklyEntryReport} = useContext(ProjectContext);
  const {keyboardOpen} = useKeyboard();

  useEffect(() => {
    if (projectData) {
      setWeeklyEntry((prevData) => ({
        ...prevData,
        projectNumber: projectData.projectNumber,
        projectId: projectData.projectId,
        owner: projectData.owner,
        projectName: projectData.projectName,
        userId: projectData.userId
      }))
    }
  }, []);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>
    {/* <KeyboardAvoidingView
      style={{ flex: 1, marginBottom: 10, backgroundColor: "white", paddingTop: 10 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    > */}
      <HeaderWithBackButton
        title={"Project " + weeklyEntry?.projectNumber + " Details"}
        onBackClick={() => {
          if (ActiveTab == 2) {
            setActiveTab(1);
          } else {
            navigation.goBack()
          }
        }}
      />

      <ScrollView
      style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                            showsVerticalScrollIndicator={false}
                              keyboardShouldPersistTaps="handled"
                            automaticallyAdjustKeyboardInsets={true}
     >
        {
          ActiveTab == 1 ?
            (
                <ReportDetails
                  weeklyEntry={weeklyEntry}
                  setWeeklyEntry={setWeeklyEntry}
                />
            ) : null
        }

        {
          ActiveTab == 2 ?
            (
                <SelectedWeekEntry
                  weeklyEntry={weeklyEntry}
                  setWeeklyEntry={setWeeklyEntry}
                />
            ) : null
        }
  <View style={[styles.buttonContainer, { gap: 10 }]}>
        {
          ActiveTab > 1 ?
            <View style={{ flex: 1, height: 45 }}>
              <CustomButton
                title="Previous"
                onCick={() => {
                  if (ActiveTab > 1) { clickOnTabs(ActiveTab - 1) }
                  else {
                    navigation.goBack()
                  }
                }}
                bgColor='#fff'
                textColor={appColor.primary}
              />
            </View>

            : null
        }

        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title={ActiveTab == 2 ? "Preview" : "Next"}
            onCick={() => {
              if (ActiveTab == 2) {
                setWeeklyEntryReport(weeklyEntry);
                navigation.navigate(SCREENS.WEEKLY_REPORT_CONFIRM)
              } else {
                clickOnTabs(ActiveTab + 1)
              }
            }}
          />
        </View>


      </View>

      </ScrollView>

    
    {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  )
}

export default WeeklyEntryScreen

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 15,
    // position: 'absolute',
    // top: screenHeight-85-StatusBar.currentHeight,
    // paddingTop: 10,
    backgroundColor: '#fff',
    height: 60,
    width: '100%',
    // marginTop:50
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    // marginBottom: 50
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontFamily: appFonts.SemiBold,
    marginBottom: 16,
    color: appColor.black,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#000",
    marginBottom: 4,
  },
  input: {
    height: 45,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    color: "black",
    fontFamily: appFonts.Medium,

  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  halfInputContainer: {
    width: "48%",
  },
  nextButton: {
    backgroundColor: "#486ECD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  inspectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,

  },
  inspectorInput: {
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 8,
    padding: 6,
  },
  addInspectorButton: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerUpload: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadicon: {
    width: 30,
    height: 30,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  ChooseFilebutton: {
    backgroundColor: "#486ECD",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  ChooseFilebuttonText: {
    color: '#fff',
    fontFamily: appFonts.SemiBold,

  },
});