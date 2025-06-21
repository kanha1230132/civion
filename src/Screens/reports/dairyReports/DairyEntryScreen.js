// DailyEntry1.js
import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Switch,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import useDairyEntryHook from "./dairyEntry.hook";
import { DailyEntryContext } from "../../../utils/DailyEntryContext";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { appColor } from "../../../theme/appColor";
import { dairyEntryTabs } from "../../../utils/DairyUtil";
import { appFonts } from "../../../theme/appFonts";
import IconTextInput from "../../../components/IconTextInput";
import moment from "moment";
import CustomTextInput from "../../../components/CustomTextInput";
import CustomButton from "../../../components/button/CustomButton";
import { screenHeight } from "../../../utils/Constants";
import * as Speech from "expo-speech";
import SignatureModal from "../../../components/modal/SignatureModal";
import { ProjectContext } from "../../../utils/ProjectContext";
import { StatusBar } from "react-native";
import useKeyboard from "../../../hooks/useKeyboard";
import DateTimePicker from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const DairyEntryScreen = () => {
  const {
    dairyEntry,
    setDairyEntry,
    ActiveTab,
    setActiveTab,
    DairyEntryReport,
    setDairyEntryReport,
    clickOnTabs,

    ActiveTabTitle,
  } = useDairyEntryHook();
  const typeOfPicker = {
    date: "date",
  };
  const [ShowPickerModal, setShowPickerModal] = useState(false);
  const [selectedPickerType, setSelectedPickerType] = useState(
    typeOfPicker.date
  );
  const { projectData } = useContext(ProjectContext);
  const {keyboardOpen} = useKeyboard()

  useEffect(() => {
    if (projectData) {
      setDairyEntry((prevData) => ({
        ...prevData,
        projectNumber: projectData.projectNumber,
        projectId: projectData.projectId,
        owner: projectData.owner,
        projectName: projectData.projectName,
        userId: projectData.userId,
      }));
    }
  }, []);

  const clickOnPicker = (type) => {
    setSelectedPickerType(type);
    setShowPickerModal(true);
  };
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleSignatureOK = (signatureBase64) => {
    setShowSignatureModal(false);
    if (signatureBase64) {
      setDairyEntry({ ...dairyEntry, signature: signatureBase64 });
      console.log("signature data :", signatureBase64);
    }
  };

  const navigation = useNavigation();

  /** Date Picker Function */
  const onDateChange = (event, date) => {
    if (date) {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      if (selectedPickerType === typeOfPicker.date) {
        setDairyEntry({ ...dairyEntry, selectedDate: formattedDate });
      }
    }
    setShowPickerModal(false);
  };

  const startSpeaking = () => {
    Speech.speak(dairyEntry?.description);
  };

  const callToPreview = () => {
    setDairyEntryReport(dairyEntry);
    navigation.navigate("DailyDiaryPreview");
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>
    {/* <KeyboardAvoidingView
      style={{ flex: 1, paddingVertical: 10, backgroundColor: appColor.white }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    > */}
      <HeaderWithBackButton
        title={"Daily Diary"}
        onBackClick={() => navigation.goBack()}
      />
      <View style={styles.progressContainer}>
        {dairyEntryTabs.map((step, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              onPress={() => {
                clickOnTabs(step);
              }}
              style={[
                styles.progressCircle,
                step <= ActiveTab
                  ? styles.activeCircle
                  : { borderColor: appColor.lightGray, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  step <= ActiveTab ? styles.activeText : {},
                ]}
              >
                {step}
              </Text>
            </TouchableOpacity>
            {index < 1 && (
              <View
                style={[
                  styles.progressLine,
                  step < ActiveTab ? styles.completedLine : {},
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.sectionTitle}>{ActiveTabTitle}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
                    style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                            keyboardShouldPersistTaps="handled"
                          automaticallyAdjustKeyboardInsets={true}
      
      >
        {ActiveTab == 1 ? (
          <>
            <IconTextInput
              onclickIcon={() => clickOnPicker(typeOfPicker.date)}
              textValue={dairyEntry?.selectedDate}
              label="Date"
              iconName="calendar-outline"
              editable={false}
            />

            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, projectName: text })
              }
              textValue={dairyEntry?.projectName}
              label="Project Name"
              editable={false}
            />
            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, projectNumber: text })
              }
              textValue={dairyEntry?.projectNumber}
              label="Project Number"
              editable={false}
            />

            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, owner: text })
              }
              textValue={dairyEntry?.owner}
              label="Owner"
              editable={false}
            />
            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, reportNumber: text })
              }
              textValue={dairyEntry?.reportNumber}
              label="Report Number"
            />

            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, contractNumber: text })
              }
              textValue={dairyEntry?.contractNumber}
              label="Contract Number"
              //  keyboardType='numeric'
            />

            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, contractor: text })
              }
              textValue={dairyEntry?.contractor}
              label="Contractor"
            />
            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, ownerContact: text })
              }
              textValue={dairyEntry?.ownerContact}
              label="Owner Contact"
              //  keyboardType='numeric'
            />
            <CustomTextInput
              onChangeTextValue={(text) =>
                setDairyEntry({ ...dairyEntry, ownerProjectManager: text })
              }
              textValue={dairyEntry?.ownerProjectManager}
              label="Owner Project Manager"
            />
          </>
        ) : null}

        {ActiveTab == 2 ? (
          <>
            <Text style={styles.label}>Add Project Description</Text>
            <TextInput
              style={[styles.textArea]}
              placeholder="Type your project description here"
              multiline={true}
              value={dairyEntry?.description}
              onChangeText={(text) =>
                setDairyEntry({ ...dairyEntry, description: text })
              }
              returnKeyType="done"
                              blurOnSubmit={true}
                              onSubmitEditing={() => {
                                  Keyboard.dismiss();
                                }}
            />

            <Text
              style={{
                marginBottom: 5,
                fontSize: 16,
                color: "#000",
                fontFamily: appFonts.Medium,
                marginTop: 15,
              }}
            >
              Signature
            </Text>
            <View
              style={{
                borderColor: "#ddd",
                borderWidth: 1,
                marginBottom: 20,
                backgroundColor: "white",
                borderRadius: 6,
                minHeight: 45,
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 5,
                  alignItems: "center",
                  marginTop: 10,
                }}
                onPress={() => setShowSignatureModal(true)}
              >
                {dairyEntry?.signature ? (
                  <View>
                    <Image
                      resizeMode="contain"
                      source={{ uri: dairyEntry?.signature }}
                      style={{
                        width: 200,
                        borderWidth: 0.5,
                        borderColor: "#00000039",
                        height: 150,
                      }}
                    />

                    <TouchableOpacity
                      onPress={() =>
                        setDairyEntry({ ...dairyEntry, signature: "" })
                      }
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        zIndex: 6,
                      }}
                    >
                      <Ionicons name="close" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: "#486ECD",
                      fontSize: 16,
                      marginLeft: 5,
                      fontFamily: appFonts.Medium,
                    }}
                  >
                    Add Signature
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Voice-to-Text */}
            {/* <View style={styles.voiceContainer}>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={() => startSpeaking()}
              >
                <Ionicons name="mic" size={20} color="black" />
                <Text style={styles.voiceText}>Voice to Text</Text>
              </TouchableOpacity>
            </View> */}

            <View
              style={{
                width: "80%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 30,
                alignSelf: "center",
              }}
            >
              <Text style={{fontFamily:appFonts.Medium}}>Chargable:</Text>

              <Switch
                trackColor={{ false: "#767577", true: appColor.primary }}
                thumbColor={dairyEntry?.IsChargable ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={() =>
                  setDairyEntry({
                    ...dairyEntry,
                    IsChargable: !dairyEntry?.IsChargable,
                  })
                }
                value={dairyEntry?.IsChargable}
              />
            </View>
          </>
        ) : null}

        {ShowPickerModal ? (
          // <DateTimePicker
          //   onPointerCancelCapture={() => console.log(false)}
          //   value={new Date()}
          //   mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
          //   display="default"
          //   onChange={onDateChange}
          //   onTouchCancel={() => console.log("call to cancel")} // Calls onDateChange on date selection
          // />
          <DateTimePicker
                  testID="dateTimePicker"
                  isVisible={ShowPickerModal}
                    value={selectedPickerType == typeOfPicker.date ? (dairyEntry?.selectedDate ? new Date(dairyEntry.selectedDate) : new Date()) : ( new Date())}
                    mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
                    onConfirm={(date)=> onDateChange(null, date)}
                    onCancel={() => setShowPickerModal(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light" 
                  />
        ) : null}


 <View style={[styles.buttonContainer, { gap: 10 }]}>
        {ActiveTab > 1 ? (
          <View style={{ flex: 1, height: 45 }}>
            <CustomButton
              title="Previous"
              onCick={() => {
                if (ActiveTab > 1) {
                  clickOnTabs(ActiveTab - 1);
                } else {
                  navigation.goBack();
                }
              }}
              bgColor="#fff"
              textColor={appColor.primary}
            />
          </View>
        ) : null}

        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title={ActiveTab == 2 ? "Preview" : "Next"}
            onCick={() => {
              if (ActiveTab == 2) {
                callToPreview();
              } else {
                clickOnTabs(ActiveTab + 1);
              }
            }}
          />
        </View>
      </View>
      </ScrollView>


     
      {showSignatureModal && (
        <SignatureModal
          handleSignatureOK={handleSignatureOK}
          showSignatureModal={showSignatureModal}
          onclose={() => {
            console.log("close : ");
            setShowSignatureModal(false);
          }}
        />
      )}
    {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  voiceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  voiceText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: appFonts.Medium,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 15,
    // position: "absolute",
    // top: screenHeight-85-StatusBar.currentHeight,
    // paddingTop: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    height: 60,
    width: "100%",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    // marginBottom: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontFamily: "Roboto",
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#d3d3d3",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    borderColor: "#486ECD", // Highlight the active step,
    backgroundColor: "#486ECD",
  },
  progressText: {
    fontSize: 16,
    color: "#000",
    fontFamily: appFonts.Medium,
  },
  activeText: {
    color: appColor.white,
    fontFamily: appFonts.Medium,
  },
  progressLine: {
    height: 2,
    // flex: 1,
    width: "75%",
    backgroundColor: "#d3d3d3",
    marginHorizontal: 2,
  },
  completedLine: {
    backgroundColor: "#486ECD", // Change color for completed lines
  },
  lightGreyLine: {
    backgroundColor: "#d3d3d3",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#486ECD",
    marginBottom: 20,
    fontFamily: appFonts.SemiBold,
    marginHorizontal: 15,
  },

  title: {
    fontSize: 18,
    fontFamily: appFonts.SemiBold,
    color: "#486ECD",
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontFamily: appFonts.SemiBold,
  },

  textArea: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 150, // Increased height
    padding: 10,
    marginBottom: 20,
    fontFamily: appFonts.Medium,
    textAlignVertical: "top",
  },
  input: {
    height: 45,
    fontFamily: appFonts.SemiBold,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 16,
    color: "#000000",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    fontFamily: appFonts.SemiBold,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: appFonts.SemiBold,
  },
  icon: {
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: "#486ECD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: appFonts.SemiBold,
  },
  blackBorder: {
    borderColor: "black",
  },
  whiteBackground: {
    backgroundColor: "#ffffff",
  },
});

export default DairyEntryScreen;
