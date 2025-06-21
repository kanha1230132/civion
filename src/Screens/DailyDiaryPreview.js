import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Image,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Platform,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { endPoints } from "../api/endPoints";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { DateFormat, screenHeight } from "../utils/Constants";
import { appColor } from "../theme/appColor";
import util from "../utils/util";
import apiClient from "../api/apiClient";
import SignatureModal from "../components/modal/SignatureModal";
import { ProjectContext } from "../utils/ProjectContext";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { appFonts } from "../theme/appFonts";
import CustomButton from "../components/button/CustomButton";
import { useErrorPopupContext } from "../context/PopupProvider";
import axios from "axios";
import { imgURL } from "../Assets";
import LoaderModal from "../components/modal/Loader";
import useKeyboard from "../hooks/useKeyboard";
import { SCREENS } from "../utils/ScreenNames";
import { companyLogo } from "../utils/base64Images";
import { getImageSizeAsync } from "../utils/pdfGenerator";
import { SafeAreaWrapper } from "../../App";


const DailyDiaryPreview = () => {
    const navigation = useNavigation();
    const { DairyEntryReport, setDairyEntryReport } = useContext(ProjectContext);
    const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
    const [isLoading, setIsLoading] = useState(false);
    const [logos, setLogos] = useState([]);
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loadingLogos, setLoadingLogos] = useState(true);
    const [errorLoadingLogos, setErrorLoadingLogos] = useState(false);
    const { keyboardOpen } = useKeyboard()
    /** Extract Params */
    const {
        projectId,
        projectNumber,
        projectName,
        selectedDate,
        owner,
        description,
        contractor,
        ownerContact,
        contractNumber,
        reportNumber,
        ownerProjectManager,
        userId,
        signature,
        IsChargable
    } = DairyEntryReport || {};


    useEffect(() => {
        fetchLogos();
    }, []);


    const fetchLogos = async () => {
        setLoadingLogos(true);
        setErrorLoadingLogos(false);
        try {
            const response = await apiClient.get(endPoints.URL_LOGOS)
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
        const imageUrl = selectedLogo?.file_url;
        //   const { width, height } = await getImageSizeAsync(imageUrl);
        const width = 150
        const height = 150

        let signatureHtml = "";
        if (signature) {
            signatureHtml = `
            <img src="${signature}" alt="Signature" style="width: 50px; margin-left: 60px;" />
            `
        }
        const htmlContent = `
          <!DOCTYPE html>
<html>
<head>
    <title>Inspection Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 20px;
        }
        .container {
            width: 100%;
            padding: 10px;
        }
        .section {
            border: 1px solid #333;
            padding: 10px;
            margin-bottom: 15px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            background-color:${appColor.primary};
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom:10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td, .info-table th {
            border: 0.5px solid #333;
            padding: 8px;
            text-align: left;
        }
        .bold {
            font-weight: bold;
            color: ${appColor.black};
        } 
       .logo {
        margin-bottom: 10px;
        height: 70px;
      }
      .side-logo{
        
        margin-bottom: 10px;
        height: ${height}px;
      }
      .logo-container {
        width: 100%;
        padding: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
             .img-container{
        width: 100%;
        padding: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
         .header-title {
      font-size: 35px;
      margin-bottom: 30px;
    }
    </style>
</head>
<body>
    <div class="container">

        <div class="img-container">
      <img
        src="${companyLogo}"
        alt="Company Logo"
        class="logo"
      />
      <div class="header-title">Daily Diary Report</div>

       <img
        src="${selectedLogo?.file_url}"
        alt="Company Logo"
        class="side-logo"
      />
    </div>

        <div class="section">
            <table class="info-table">
                <tr><td class="bold">Owner:</td><td>${owner || "N/A"}</td></tr>
                <tr><td class="bold">Project No :</td><td>${projectNumber || "N/A"}</td></tr>
                <tr><td class="bold">Report No :</td><td>${reportNumber || "N/A"}</td></tr>
                <tr><td class="bold">Project Name :</td><td>${projectName || "N/A"}</td></tr>
                <tr><td class="bold">Owner Number :</td><td>${ownerContact || "N/A"}</td></tr>
                <tr><td class="bold">Contractor :</td><td>${contractor || "N/A"}</td></tr>
                <tr><td class="bold">Contract Number :</td><td>${contractNumber || "N/A"}</td></tr>
                <tr><td class="bold">Owner Project Manager :</td><td>${ownerProjectManager || "N/A"}</td></tr>
            </table>
        </div>

        <div class="section">
            <p><span class="bold">Date:</span> ${moment(selectedDate).format(DateFormat.MMMM_DD_YYYY)}</p>
        </div>

        <div class="section">
            <p><span class="bold">Description of Work:</span>${description || "N/A"}</p>
        </div>
    </div>

    <div style="display: flex; flex-direction: row; width: 100%; border: 1px solid #ccc; margin-top: 40px;">

  <div style="display: flex; flex-direction: row;width: 50%; height: 100px; padding: 10px;
  ">
    <p>Report Done By: </p>
${signatureHtml}

  </div>

  <div style="height: 100px; width: 1px; background-color: #ccc;">

  </div>

  <div style="width: 50%;height: 100px; padding: 10px;">
    <span>Region Representative:</span>
    
  </div>

</div>
</body>
</html>
`;
        // console.log("first", htmlContent);

        try {
            setIsLoading(true);
            // Generate the PDF
            const REPORTS_FOLDER = FileSystem.documentDirectory + "Reports/";
            const folderExists = await FileSystem.getInfoAsync(REPORTS_FOLDER);
            if (!folderExists.exists) {
                await FileSystem.makeDirectoryAsync(REPORTS_FOLDER, { intermediates: true });
            }
            const { uri } = await Print.printToFileAsync({ html: htmlContent, width: 800 });
            const fileUri = REPORTS_FOLDER + `DailyDiaryReport_${new Date().toISOString()}.pdf`;

            // Move file to a readable location
            await FileSystem.moveAsync({ from: uri, to: fileUri });

            // Share the generated PDF file
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
            setIsLoading(false);

        } catch (error) {
            Alert.alert("Error", error.message);
            setIsLoading(false);

        }finally {
            setIsLoading(false);
        }
    };

    const renderItem = () => (
        <View>
            {/* Project Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Project Details</Text>
                {[
                    { label: "Date", value: DairyEntryReport?.selectedDate || 'N/A' },
                    { label: "Project Number", value: projectNumber || 'N/A' },
                    { label: "Project Name", value: projectName || 'N/A' },
                    { label: "Owner", value: owner || 'N/A' },
                    { label: "Contract Number", value: contractNumber || 'N/A' },
                    { label: "Contractor", value: contractor || 'N/A' },
                    { label: "Report Number", value: reportNumber || 'N/A' },
                    { label: "Owner Contact", value: ownerContact || 'N/A' },
                    { label: "Owner Project Manager", value: ownerProjectManager || 'N/A' },
                ].map((item, index) => (
                    <Text key={index} style={styles.detailText}>
                        <Text style={styles.boldText}>{item.label}:</Text> {item.value || "N/A"}
                    </Text>
                ))}
            </View>

            {/* Logo Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choose Logo</Text>

                <TouchableOpacity
                    style={styles.logoDropdownButton}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <View style={styles.selectedLogoContainer}>
                        {selectedLogo ? (
                            <>
                                <Image
                                    source={{ uri: `${selectedLogo.file_url}` }}
                                    style={styles.selectedLogoImage}
                                />
                                <Text>{selectedLogo?.companyName}</Text>

                            </>
                        ) : (
                            <Text>Select Logo</Text>
                        )}
                    </View>
                    <Icon
                        name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#333"
                        style={styles.dropdownIcon}
                    />
                </TouchableOpacity>

                {/* Loading and Error Handling */}
                {loadingLogos && <ActivityIndicator size="small" color="#0000ff" />}
                {errorLoadingLogos && (
                    <Text style={styles.errorText}>Error loading logos. Please check your network connection.</Text>
                )}

                {/* Dropdown List (Conditionally Rendered) */}
                {isDropdownOpen && (
                    <FlatList
                        data={logos}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.logoItem}
                                onPress={() => handleLogoSelect(item)}
                            >
                                <Image
                                    source={{ uri: `${item.file_url}` }}
                                    style={styles.logoItemImage}
                                />
                                <Text>{item?.companyName}</Text>
                            </TouchableOpacity>
                        )}
                        style={styles.logoList}
                    />
                )}
            </View>
            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.detailText}>{description || "No description provided."}</Text>
            </View>

            <View style={[styles.section, { marginBottom: 40 }]}>
                <Text style={styles.sectionTitle}>Signature</Text>
                {signature && (
                    <View style={{ padding: 10 }}>
                        <Image source={{ uri: signature }} style={{ width: 100, height: 100, borderWidth: 0.5, borderColor: '#00000039' }} />
                    </View>
                )}
            </View>
        </View>
    );


    const callToSubmit = async () => {
        try {
            /** Check for missing fields */
            const missingFields = [];
            if (!projectId) missingFields.push("projectId");
            if (!selectedDate) missingFields.push("selectedDate");
            if (!description) missingFields.push("description");
            if (!contractNumber) missingFields.push("contractNumber");
            if (!reportNumber) missingFields.push("reportNumber");
            if (!contractor) missingFields.push("contractor");
            if (!ownerContact) missingFields.push("ownerContact");
            if (!ownerProjectManager) missingFields.push("ownerProjectManager");
            if (!userId) missingFields.push("userId");

            if (missingFields.length > 0) {
                showErrorPopup(`Missing required fields: ${missingFields.join(", ")}`);
                console.log("Missing Fields: ", missingFields);
                return;
            }

            /** Construct request */
            const requestBody = {
                projectId,
                projectName,
                projectNumber,
                selectedDate: selectedDate, // Use the selectedDate directly
                description,
                owner,
                contractor,
                ownerContact,
                contractNumber,
                ownerProjectManager,
                reportNumber,
                userId,
                IsChargable,
                "downloadPdf": false
            };
            console.log("requestBody : ", requestBody);
            setIsLoading(true);
            const response = await apiClient.post(endPoints.URL_CREATE_DAILY_DAIRY, requestBody);
            console.log("response 1: ", response);
            if (response.status === 401 || response.status === 403) {
                // const result = await showErrorPopup(response?.data?.message);
                // if(result){
                // util.logoutUser();
                // navigation.navigate(SCREENS.LOGIN_SCREEN);
                // }
                // return;
            }
            if (response.status === 200 || response.status === 201) {
                setIsLoading(false);

                showSuccessPopup(response.data?.message || "Daily diary entry saved successfully!").then((res) => {
                    console.log("res", res)

                })
            } else {
                const message = response.data?.message || "Failed to save entry";
                showErrorPopup(message);
            }
        } catch (error) {
            if (error.response) {
                showErrorPopup(`Failed to submit: ${error.response.data.message || "Invalid request."}`);
            } else if (error.request) {
                showErrorPopup("No response from the server. Check your network.");
            } else {
                showErrorPopup("Something went wrong. Please try again.");
            }
            setIsLoading(false);

        } finally {
            setIsLoading(false);

        }
    }




    return (
        <SafeAreaWrapper>
        <SafeAreaView style={styles.safeArea}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 10
            }}>
                <View style={{
                    width: '65%'
                }}>
                    <HeaderWithBackButton title={'Review Dairy Report'} onBackClick={() => navigation.goBack()} />

                </View>
                <TouchableOpacity style={{
                    width: '12%'
                }} onPress={() => {
                    GeneratePDF()
                }}>
                    <Image source={imgURL.PDF} style={{ width: 30, height: 30, marginHorizontal: 10 }} />

                </TouchableOpacity>
                <View style={{ marginLeft: 10, width: '17%' }}>
                    <CustomButton title={"Edit"} onCick={() => navigation.goBack()} />

                </View>
            </View>

 <ScrollView
        showsVerticalScrollIndicator={false}
                    style={[{
    flexGrow: 1,
    // paddingHorizontal: 20,
    backgroundColor: "#fff",
    // marginBottom: 50,
  },keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                            keyboardShouldPersistTaps="handled"
                          automaticallyAdjustKeyboardInsets={true}
      
      >
          <View>
 <FlatList
                data={[1]} // Use a single item to render all content
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.container}
            />
            </View>


           

            <View style={[styles.buttonContainer, { gap: 10 }]}>
                <View style={{ flex: 1, height: 45 }}>
                    <CustomButton
                        title="Previous"
                        onCick={() => {
                            navigation.goBack()
                        }}
                        bgColor='#fff'
                        textColor={appColor.primary}
                    />
                </View>


                <View style={{ flex: 1, height: 45 }}>
                    <CustomButton
                        title={"Submit"}
                        onCick={() => {
                            callToSubmit()
                        }}
                    />
                </View>


            </View>


      </ScrollView>
          
            <LoaderModal visible={isLoading} />


        </SafeAreaView>
       </SafeAreaWrapper>
    );
};

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, paddingVertical: 10 },
    header: { flexDirection: "row", alignItems: "center", padding: 10 },
    backButton: { flexDirection: "row", alignItems: "center", padding: 5 },
    headerTitle: { fontSize: 18, fontFamily: appFonts.Medium, marginLeft: 10, color: "#000" },
    container: { flexGrow: 1, padding: 20 },
    section: { marginBottom: 10, padding: 10, backgroundColor: "white", borderRadius: 8 },
    sectionTitle: { fontSize: 16, fontFamily: appFonts.Medium, marginBottom: 5, color: "#555" },
    detailText: { fontSize: 16, marginBottom: 5, color: "#555", lineHeight: 20 },
    boldText: { fontFamily: appFonts.Medium },
    editButton: { backgroundColor: "#486ECD", padding: 10, borderRadius: 5, alignSelf: "flex-start" },
    editButtonText: { color: "white", fontSize: 14, fontFamily: appFonts.Medium },
    submitButton: { backgroundColor: "#486ECD", padding: 10, borderRadius: 5, alignItems: "center" },
    submitButtonText: { color: "white", fontSize: 16, fontFamily: appFonts.Medium },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        // position: 'absolute',
        // top: screenHeight-85-StatusBar.currentHeight,
        // marginHorizontal: 15,
        paddingTop: 10,
        backgroundColor: '#fff',
        height: 60,
        width: '100%'
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
        paddingHorizontal: 10
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
        justifyContent: 'space-between'
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

export default DailyDiaryPreview;