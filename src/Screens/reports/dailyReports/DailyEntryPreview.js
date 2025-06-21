import React, { useContext, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    Image,
    FlatList,
    ActivityIndicator, // Import ActivityIndicator
    ScrollView,
    Platform
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { dailyEntryPdf } from "../../../utils/pdfGenerator";
import LoaderModal from "../../../components/modal/Loader";
import apiClient from "../../../api/apiClient";
import { endPoints } from "../../../api/endPoints";
import { useErrorPopup } from "../../../components/popup/errorPopup";
import { useSuccessPopup } from "../../../components/popup/successPopup";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { appFonts } from "../../../theme/appFonts";
import { ProjectContext } from "../../../utils/ProjectContext";
import CustomButton from "../../../components/button/CustomButton";
import { appColor } from "../../../theme/appColor";
import { screenHeight } from "../../../utils/Constants";
import { imgURL } from "../../../Assets";
import { StatusBar } from "react-native";
import useKeyboard from "../../../hooks/useKeyboard";
import { SafeAreaWrapper } from "../../../../App";

const DailyEntryPreview = () => {
    const submitType = {
        submit: "submit",
        pdf: 'pdf'
    }
    const navigation = useNavigation();
    const { DailyEntryReport } = useContext(ProjectContext)
    const [logos, setLogos] = useState([]);
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loadingLogos, setLoadingLogos] = useState(true);
    const [errorLoadingLogos, setErrorLoadingLogos] = useState(false);
    const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
    const { SuccessPopup, showSuccessPopup, isSuccessVisible } = useSuccessPopup();
    const [isLoading, setIsLoading] = useState(false)
    const {keyboardOpen} = useKeyboard();
    useEffect(() => {

        fetchLogos();
    }, []);


    const fetchLogos = async () => {
        setLoadingLogos(true);
        setErrorLoadingLogos(false);
        try {
            const response = await apiClient.get(endPoints.URL_LOGOS);

            if (response?.status == 200) {
                const output = response?.data;
                console.log("ouput : ", output)
                if(output.status == "success"){
                    if (output?.data && output?.data.length > 0) {
                        setLogos(output?.data);
                        setSelectedLogo(output?.data[0]);
                    }  
                }
            }
        } catch (error) {
            console.log("Error fetching logos:", error);
            setErrorLoadingLogos(true);
        } finally {
            setLoadingLogos(false);
        }
    };

    const handleLogoSelect = (logo) => {
        setSelectedLogo(logo);
        setIsDropdownOpen(false);
    };

    const callToSubmit = async (type) => {
        try {
            
            const requiredFields = {
                userId: DailyEntryReport?.userId,
                projectId: DailyEntryReport?.projectId,
                selectedDate: DailyEntryReport?.selectedDate,
                location: DailyEntryReport?.location,
                reportNumber: DailyEntryReport?.reportNumber
            };


            const missingFields = Object.entries(requiredFields)
                .filter(([key, value]) => !value)
                .map(([key]) => key);

            if (missingFields.length > 0) {
                const titleCase = (s) =>
                    s.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                const formattedFields = missingFields.map(titleCase).join(', ');
                showErrorPopup(`Missing required fields: ${formattedFields}. Please check your data.`);
                return;
            }

            const formattedEquipments = DailyEntryReport?.equipments.map(e => ({
                equipmentName: e.name || "Unknown Equipment",
                quantity: e.quantity || "0",
                hours: e.hours || "0",
                totalHours: e.totalHours || "0"
            }));

            const formattedLabours = DailyEntryReport?.labours.map(l => ({
                contractorName: l.contractorName || "Unknown Contractor",
                roles: l.roles.map(role => ({
                    roleName: role.roleName || "Unknown Role",
                    quantity: role.quantity || "0",
                    hours: role.hours || "0",
                    totalHours: role.totalHours || "0"
                }))
            }));

            const formattedVisitors = DailyEntryReport?.visitors.map(v => ({
                visitorName: v.visitorName || "Unknown Visitor",
                company: v.company || "Unknown Company",
                quantity: v.quantity || "0",
                hours: v.hours || "0",
                totalHours: v.totalHours || "0"
            }));

            let requestBody = {
                userId: DailyEntryReport?.userId,
                projectId: DailyEntryReport?.projectId,
                selectedDate: DailyEntryReport?.selectedDate,
                location: DailyEntryReport?.location,
                onShore: DailyEntryReport?.onShore,
                tempHigh: DailyEntryReport?.tempHigh,
                tempLow: DailyEntryReport?.tempLow,
                weather: DailyEntryReport?.weather,
                workingDay: DailyEntryReport?.workingDay,
                reportNumber: DailyEntryReport?.reportNumber,
                projectNumber: DailyEntryReport?.projectNumber,
                projectName: DailyEntryReport?.projectName,
                owner: DailyEntryReport?.owner,
                contractNumber: DailyEntryReport?.contractNumber,
                contractor: DailyEntryReport?.contractor,
                siteInspector: DailyEntryReport?.siteInspector,
                timeIn: DailyEntryReport?.timeIn,
                timeOut: DailyEntryReport?.timeOut,
                ownerContact: DailyEntryReport?.ownerContact,
                ownerProjectManager: DailyEntryReport?.ownerProjectManager,
                component: DailyEntryReport?.component,
                equipments: formattedEquipments,
                labours: formattedLabours,
                visitors: formattedVisitors,
                description: DailyEntryReport?.description,
                selectedLogoId: selectedLogo._id, // Include selected logo ID in request
            };


            if (type == "pdf") {
                requestBody = { ...requestBody, signature: DailyEntryReport.signature, selectedLogo };
                // console.log("requestBody : ", requestBody)
                setIsLoading(true)
                const imageUrl = selectedLogo?.file_url;
                Image.getSize(
                    imageUrl,
                    (width, height) => {
                      console.log('Image size:', width, height);
                      // you can set state or proceed with logic here
                    },
                    (error) => {
                      console.error('Error getting image size:', error);
                    }
                  );
                await dailyEntryPdf({...requestBody,declForm : DailyEntryReport.declrationForm});
                setIsLoading(false)

            } else if (type == 'submit') {
                setIsLoading(true);
                console.log("requestBody : ", requestBody)

                const response = await apiClient.post(endPoints.URL_UPLOAD_DAILY_ENTRY, requestBody);
                console.log("response :",response)
                if (response?.status == 200 || response?.status == 201) {
                    setIsLoading(false);
                    await showSuccessPopup(response.data?.message || 'Daily entry saved successfully!');
                    return;
                } else {
                    setIsLoading(false);
                    const message = response.data?.message || 'Failed to submit daily entry.';
                    showErrorPopup(message);
                }

            }

        } catch (error) {
            console.log("Error : ", error);
            showErrorPopup(JSON.stringify(error));
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }
    return (
            <SafeAreaWrapper>
        <SafeAreaView style={styles.safeArea}>
            <View style={{
                // marginTop:70,
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 10
            }}>
                <View style={{
                    width:'65%'
                }}>
                <HeaderWithBackButton title={"Review Daily Report"} onBackClick={() => navigation.goBack()} />

                </View>
                <TouchableOpacity style={{
                    width:'12%'
                }} onPress={() => {
                    callToSubmit(submitType.pdf)
                }}>
                    <Image source={imgURL.PDF} style={{ width: 30, height: 30, marginHorizontal: 10 }} />

                </TouchableOpacity>
                <View style={{ marginLeft: 10,width:'17%' }}>
                    <CustomButton title={"Edit"} onCick={() => navigation.goBack()} />

                </View>
            </View>

            <ScrollView style={{ flex: 1, marginHorizontal: 15, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Project Details</Text>
                    {[
                        { label: "Date", value: moment(DailyEntryReport?.selectedDate).format('YYYY-MM-DD') || 'N/A' },
                        { label: "Location", value: DailyEntryReport?.location || 'N/A' },
                        { label: "OnShore/Off Shore", value: DailyEntryReport?.onShore || 'N/A' },
                        { label: "Temp High", value: DailyEntryReport?.tempHigh || 'N/A' },
                        { label: "Temp Low", value: DailyEntryReport?.tempLow || 'N/A' },
                        { label: "Weather Condition", value: DailyEntryReport?.weather || 'N/A' },
                        { label: "Working Day", value: DailyEntryReport?.workingDay || 'N/A' },
                        { label: "Report Number", value: DailyEntryReport?.reportNumber || 'N/A' },
                        { label: "Project Number", value: DailyEntryReport?.projectNumber || 'N/A' },
                        { label: "Project Name", value: DailyEntryReport?.projectName || 'N/A' },
                        { label: "Owner", value: DailyEntryReport?.owner || 'N/A' },
                        { label: "Contract Number", value: DailyEntryReport?.contractNumber || 'N/A' },
                        { label: "Contractor", value: DailyEntryReport?.contractor || 'N/A' },
                        { label: "Site Inspector", value: DailyEntryReport?.siteInspector || 'N/A' },
                        { label: "Inspector Time In", value: DailyEntryReport?.timeIn || 'N/A' },
                        { label: "Inspector Time Out", value: DailyEntryReport?.timeOut || 'N/A' },
                        { label: "Owner Contact", value: DailyEntryReport?.ownerContact || 'N/A' },
                        { label: "Owner Project Manager", value: DailyEntryReport?.ownerProjectManager || 'N/A' },
                        { label: "Component", value: DailyEntryReport?.component || 'N/A' },
                    ].map((item, index) => (
                        <Text key={index} style={styles.detailText}>
                            <Text style={styles.boldText}>{item.label}:</Text> {item.value || "N/A"}
                        </Text>
                    ))}
                </View>

                <View style={[styles.section,]}>
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

                {/* Equipments */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Equipment Details</Text>
                    {DailyEntryReport?.equipments.length > 0 ? (
                        DailyEntryReport?.equipments.map((equipment, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Equipment Name:</Text> {equipment.name || "N/A"}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Quantity:</Text> {equipment.quantity || "0"}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Hours:</Text> {equipment.hours || "0"}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Total Hours:</Text> {equipment.totalHours || "0"}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.detailText}>No Equipment Details Added</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Labour Details</Text>
                    {DailyEntryReport?.labours.length > 0 ? (
                        DailyEntryReport?.labours.map((labour, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Contractor Name:</Text> {labour.contractorName || 'N/A'}
                                </Text>
                                {labour.roles && labour.roles.map((role, roleIndex) => (
                                    <View key={roleIndex}>
                                        <Text style={styles.detailText}>
                                            <Text style={styles.boldText}>Role:</Text> {role.roleName || 'N/A'}
                                        </Text>
                                        <Text style={styles.detailText}>
                                            <Text style={styles.boldText}>Quantity:</Text> {role.quantity || 'N/A'}
                                        </Text>
                                        <Text style={styles.detailText}>
                                            <Text style={styles.boldText}>Hours:</Text> {role.hours || 'N/A'}
                                        </Text>
                                        <Text style={styles.detailText}>
                                            <Text style={styles.boldText}>Total Hours:</Text> {role.totalHours || 'N/A'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.detailText}>No Labour Details Added</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visitor Details</Text>
                    {DailyEntryReport?.visitors.length > 0 ? (
                        DailyEntryReport?.visitors.map((visitor, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Visitor Name:</Text> {visitor.visitorName || 'N/A'}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Company:</Text> {visitor.company || 'N/A'}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Quantity:</Text> {visitor.quantity || 'N/A'}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Hours:</Text> {visitor.hours || 'N/A'}
                                </Text>
                                <Text style={styles.detailText}>
                                    <Text style={styles.boldText}>Total Hours:</Text> {visitor.totalHours || 'N/A'}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.detailText}>No Visitor Details Added</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.detailText}>{DailyEntryReport?.description || "No description provided."}</Text>
                </View>

                <View style={[styles.section]}>
                    <Text style={styles.sectionTitle}>Signature</Text>
                    {DailyEntryReport?.signature && (
                        <View style={{ padding: 10 }}>
                            <Image source={{ uri: DailyEntryReport?.signature }} style={{ width: 100, height: 100, borderWidth: 0.5, borderColor: '#00000039' }} />
                        </View>
                    )}
                </View>


  <View style={[styles.buttonContainer]}>

                <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'space-between',
                    gap: 10
                }}>
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
                                callToSubmit(submitType.submit)
                            }}
                        />
                    </View>

                </View>


                {/* <View style={{ flex: 1, height: 45 ,marginTop:5}}>
                    <CustomButton
                        title={"Save the Report as Pdf to Device "}
                        onCick={async () => {
                            callToSubmit(submitType.pdf)
                        }}
                    />
                </View> */}

            </View>
            </ScrollView>

          

           

            {errorPopupVisible ?
                ErrorPopup() : null
            }
            {
                isSuccessVisible ?
                    SuccessPopup() : null
            }


            <LoaderModal visible={isLoading} />
        </SafeAreaView>
            </SafeAreaWrapper>

    );
};

// Styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFffff",marginTop:10 },
    header: { flexDirection: "row", alignItems: "center", padding: 10 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontFamily: appFonts.Medium, marginLeft: 10, color: "black" },
    container: { flexGrow: 1, padding: 20 },
    section: { marginBottom: 20, padding: 15, backgroundColor: "white", borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    sectionTitle: { fontSize: 16, fontFamily: appFonts.Medium, marginBottom: 10, color: "#333" },
    detailText: { fontSize: 16, color: "#555", marginBottom: 5 },
    boldText: { fontFamily: appFonts.Medium },
    submitButton: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 12,
        backgroundColor: "#486ECD",
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        color: "#486ECD",
        fontFamily: appFonts.Medium
    },
    submitButtonText: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
    },
    logoContainer: { alignItems: "center", marginTop: 10 },
    logoImage: { width: 150, height: 150, resizeMode: "contain", borderRadius: 10, marginTop: 10 },
    buttonContainer: {
        //   flexDirection: "row",
        //   justifyContent: "space-between",
        // paddingHorizontal: 15,
        // position: 'absolute',
        //   top: screenHeight - 110,
        // top: screenHeight-85-StatusBar.currentHeight,
        // paddingTop: 10,
        marginBottom:70,
        paddingBottom: 0,
        backgroundColor: '#fff',
        //   height: 60,
        width: '100%'
    },
    previousButton: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 12,
        borderColor: "#486ECD",
        borderWidth: 1,
        borderRadius: 8,
        alignItems: "center",
    },

    // Logo Dropdown Styles
    logoDropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 10,
    },
    selectedLogoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    selectedLogoImage: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        marginRight: 10,
    },
    dropdownIcon: {
        marginLeft: 10,
    },
    // logoList: {
    //     maxHeight: 200,
    // },
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
    editButton: {
        backgroundColor: "#486ECD",
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    editButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    itemContainer: {
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    errorText: {
        color: "red",
        marginTop: 5,
    },
    savePdfButton: {
        marginTop: 20,
        paddingVertical: 12,
        backgroundColor: "#486ECD",
        borderRadius: 8,
        alignItems: "center",
        alignSelf: "stretch",
    },
    savePdfButtonText: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
    },
});

export default DailyEntryPreview;