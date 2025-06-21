import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { endPoints } from "../../api/endPoints";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { DateFormat, screenHeight } from "../../utils/Constants";
import { appColor } from "../../theme/appColor";
import util from "../../utils/util";
import apiClient from "../../api/apiClient";
import SignatureModal from "../../components/modal/SignatureModal";
import { ProjectContext } from "../../utils/ProjectContext";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import { appFonts } from "../../theme/appFonts";
import CustomButton from "../../components/button/CustomButton";
import { useErrorPopupContext } from "../../context/PopupProvider";
import axios from "axios";
import { imgURL } from "../../Assets";
import LoaderModal from "../../components/modal/Loader";
import { SCREENS } from "../../utils/ScreenNames";
import { createJHAHarardPdf } from "../../utils/pdfGenerator";
import useKeyboard from "../../hooks/useKeyboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaWrapper } from "../../../App";

const JobHarardReview = () => {
  const navigation = useNavigation();
  const { JobHazardEntryReport, setJobHazardEntryReport } =
    useContext(ProjectContext);
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
  const [isLoading, setIsLoading] = useState(false);
  const [logos, setLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingLogos, setLoadingLogos] = useState(true);
  const [errorLoadingLogos, setErrorLoadingLogos] = useState(false);

  const keyboardOpen = useKeyboard();

  const {
    workerName,
    reviewedBy,
    checkedItems,
    dateReviewed,
    description,
    location,
    otherText,
    projectName,
    selectedDate,
    signature,
    siteOrientationChecked,
    tasks,
    time,
    toolBoxMeetingChecked,
    
  } = JobHazardEntryReport;

  useEffect(() => {
    // fetchLogos();
    console.log("otherText :", otherText);
  }, []);

  const fetchLogos = async () => {
    setLoadingLogos(true);
    setErrorLoadingLogos(false);
    try {
      const response = await apiClient.get(endPoints.URL_LOGOS);
      console.log("response : ", response);
      if (response.status == 403 || response.status == 401) {
        const result = await showErrorPopup(response.data.message);
        if (result) {
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }
      if (response?.status == 200) {
        const output = response?.data;
        if (output.status == "success") {
          if (output?.data && output?.data?.length > 0) {
            setLogos(output?.data);
            setSelectedLogo(output?.data[0]);
          }
        }
      }
    } catch (error) {
      setErrorLoadingLogos(true);
    } finally {
      setLoadingLogos(false);
    }
  };

  const handleLogoSelect = (logo) => {
    setSelectedLogo(logo);
    setIsDropdownOpen(false);
  };

  const GeneratePDF = async () => {
    try {
      if (!checkValidation()) {
        return;
      }
      setIsLoading(true);

      await createJHAHarardPdf({ ...JobHazardEntryReport });
      setIsLoading(false);
    } catch (error) {
      showSuccessPopup("Pdf generation failed");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const TextDescription = ({
    text,
    label,
    firstWidth = "30%",
    secondWidth = "70%",
  }) => {
    return (
      <View
        key={Math.random().toString()}
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <Text
          style={{
            width: firstWidth ? firstWidth : "30%",
            fontFamily: appFonts.Medium,
            fontSize: 15,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            width: secondWidth ? secondWidth : "68%",
            fontFamily: appFonts.Regular,
            fontSize: 15,
          }}
        >
          {" "}
          : {"" + text}{" "}
        </Text>
      </View>
    );
  };

  const checkValidation = () => {
    const requiredFields = {
      description,
      location,
      projectName,
      selectedDate,
      time,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const titleCase = (s) =>
        s.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
      const formattedFields = missingFields.map(titleCase).join(", ");
      showErrorPopup(
        `Missing required fields: ${formattedFields}. Please check your data.`
      );
      return false;
    }

    return true;
  };

  const callToSubmit = async () => {
    try {
      /** Check for missing fields */

      if (!checkValidation()) {
        return;
      }

      const requestBody = {
        checkedItems: checkedItems,
        dateReviewed: dateReviewed,
        description: description,
        location: location,
        otherText: otherText,
        projectName: projectName,
        selectedDate: selectedDate,
        siteOrientationChecked: siteOrientationChecked,
        tasks: tasks,
        workers: [
          {
            name: workerName,
            role: "",
          },
        ],
        reviewedBy: reviewedBy,
        reviewSignature: signature,
        time: time,
        toolBoxMeetingChecked: toolBoxMeetingChecked,
      };

      console.log("requestBody: ", JSON.stringify(requestBody));
      setIsLoading(true);
      const response = await apiClient.post(
        endPoints.URL_JOB_HAZARD,
        requestBody
      );
      // console.log("response : ",JSON.stringify(response.data))
      if (response.status === 200 || response.status === 201) {
        setIsLoading(false);

        showSuccessPopup(
          response.data?.message || "Job Hazard data submitted successfully!"
        ).then((res) => {
          console.log("res", res);
        });
      } else {
        const message = response.data?.message || "Failed to save entry";
        showErrorPopup(message);
      }
    } catch (error) {
      if (error.response) {
        showErrorPopup(
          `Failed to submit: ${
            error.response.data.message || "Invalid request."
          }`
        );
      } else if (error.request) {
        showErrorPopup("No response from the server. Check your network.");
      } else {
        showErrorPopup("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
       <SafeAreaWrapper>

    {/* <SafeAreaView style={styles.safeArea}> */}

      <View
        style={{
          justifyContent: "center",
          backgroundColor: appColor.white,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
          }}
        >
          <View
            style={{
              width: "65%",
            }}
          >
            <HeaderWithBackButton
              title={"Review Job Hazard"}
              onBackClick={() => navigation.goBack()}
            />
          </View>
          <TouchableOpacity
            style={{
              width: "12%",
            }}
            onPress={() => {
              GeneratePDF();
            }}
          >
            <Image
              source={imgURL.PDF}
              style={{ width: 30, height: 30, marginHorizontal: 10 }}
            />
          </TouchableOpacity>
          <View style={{ marginLeft: 10, width: "17%" }}>
            <CustomButton title={"Edit"} onCick={() => navigation.goBack()} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: appColor.white,
          }}
        >
          <View
            key={Math.random().toString()}
            style={{ marginTop: 6, backgroundColor: appColor.white }}
          >
            {/* Project Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>JHA Details</Text>
              {[
                { label: "Date", value: selectedDate || "N/A" },
                { label: "Time", value: time || "N/A" },
                { label: "Project Location", value: location || "N/A" },
                { label: "Project Name", value: projectName || "N/A" },
                {
                  label: "Have you completed site orientation?",
                  value: siteOrientationChecked || "N/A",
                },
                {
                  label: "Have you completed tool box meeting?",
                  value: toolBoxMeetingChecked || "N/A",
                },
                { label: "Worker Name ", value: workerName || "N/A" },
              ].map((item, index) => (
                <View
                  style={{
                    marginTop: 6,
                  }}
                >
                  <TextDescription
                    firstWidth="45%"
                    secondWidth="55%"
                    text={item?.value}
                    label={item?.label}
                  />
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {tasks?.map((item, index) => (
                <View
                  style={{
                    elevation: 2,
                    // margin:5,
                    backgroundColor: appColor.lightGray,
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text
                    style={[
                      styles.boldText,
                      {
                        marginBottom: 5,
                        fontFamily: appFonts.SemiBold,
                        fontSize: 16,
                      },
                    ]}
                  >
                    {item.task}
                  </Text>
                  <TextDescription
                    text={item.severity || "N/A"}
                    label={"Severity"}
                  />
                  <TextDescription
                    text={item.hazard || "N/A"}
                    label={"Hazard"}
                  />
                  <TextDescription
                    text={item.controlPlan || "N/A"}
                    label={"ControlPlan"}
                  />
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hazards</Text>
              {checkedItems?.map((item, index) => (
                <View
                  style={{
                    elevation: 2,
                    margin: 5,
                    backgroundColor: appColor.lightGray,
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text style={[styles.boldText, { marginBottom: 5 }]}>
                    Category : {item.category}
                  </Text>

                  {item?.items?.map((text, index) => {
                    if(text == "Other") return <></>
                    return (

                    <Text
                      style={[
                        styles.boldText,
                        { fontFamily: appFonts.Regular },
                      ]}
                    >
                      - {text}
                    </Text>
                  )})}
                  {
                    otherText[item.category] && (
                      <Text
                        style={[
                          styles.boldText,
                          { fontFamily: appFonts.Regular },
                        ]}
                      >
                       - Other : {otherText[item.category]}
                      </Text>
                    )
                  }
                </View>
              ))}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.detailText}>
                {description || "No description provided."}
              </Text>
            </View>

            <View style={{ marginTop: 10, marginHorizontal: 10, height: 150 }}>
              <Text style={styles.sectionTitle}>Signature</Text>
              {signature && (
                <View style={{ padding: 10 }}>
                  <Image
                    source={{ uri: signature }}
                    style={{
                      width: 100,
                      height: 100,
                      borderWidth: 0.5,
                      borderColor: "#00000039",
                    }}
                  />
                </View>
              )}
            </View>
          </View>

             <View style={[styles.buttonContainer, { gap: 10 }]}>
        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title="Previous"
            onCick={() => {
              navigation.goBack();
            }}
            bgColor="#fff"
            textColor={appColor.primary}
          />
        </View>

        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title={"Submit"}
            onCick={() => {
              callToSubmit();
            }}
          />
        </View>
      </View>
        </ScrollView>

        <LoaderModal visible={isLoading} />
      </View>
   
    {/* </SafeAreaView> */}
      </SafeAreaWrapper>

  );
};

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: appColor.white },
  header: { flexDirection: "row", alignItems: "center", padding: 10 },
  backButton: { flexDirection: "row", alignItems: "center", padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontFamily: appFonts.Medium,
    marginLeft: 10,
    color: "#000",
  },
  container: { flexGrow: 1, paddingVertical: 20, paddingHorizontal: 5 },
  section: { padding: 10, backgroundColor: "white", borderRadius: 8 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: appFonts.SemiBold,
    marginBottom: 5,
    color: "#555",
  },
  detailText: { fontSize: 16, marginBottom: 5, color: "#555", lineHeight: 20 },
  boldText: { fontFamily: appFonts.Medium },
  editButton: {
    backgroundColor: "#486ECD",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  editButtonText: { color: "white", fontSize: 14, fontFamily: appFonts.Medium },
  submitButton: {
    backgroundColor: "#486ECD",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: appFonts.Medium,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    // position: "absolute",
    paddingTop: 10,
    backgroundColor: "#fff",
    height: 60,
    width: "100%",
    marginBottom:60
  },
  // Logo Dropdown Styles
  logoDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  selectedLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedLogoImage: {
    width: 70,
    height: 70,
    resizeMode: "contain",
    marginRight: 10,
  },
  dropdownIcon: {
    marginLeft: 10,
  },

  logoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  logoItemImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default JobHarardReview;
