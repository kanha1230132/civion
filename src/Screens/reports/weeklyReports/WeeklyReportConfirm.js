import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Switch,
    Platform,
    KeyboardAvoidingView,
    FlatList,
} from "react-native"
import React, { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ProjectContext } from "../../../utils/ProjectContext";
import moment from "moment";
import { appColor } from "../../../theme/appColor";
import apiClient from "../../../api/apiClient";
import { endPoints } from "../../../api/endPoints";
import { createWeeklyPdf } from "../../../utils/pdfGenerator";
import { useSuccessPopup } from "../../../components/popup/successPopup";
import { useErrorPopup } from "../../../components/popup/errorPopup";
import { SCREENS } from "../../../utils/ScreenNames";
import { useIsFocused } from "@react-navigation/native";
import SignatureModal from "../../../components/modal/SignatureModal";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { appFonts } from "../../../theme/appFonts";
import CustomButton from "../../../components/button/CustomButton";
import { fonts } from "react-native-elements/dist/config";
import { imgURL } from "../../../Assets";
import LoaderModal from "../../../components/modal/Loader";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaWrapper } from "../../../../App";

const WeeklyEntryReportConfirm = ({ navigation, route }) => {
    const { WeeklyEntryReport, photoSelect,setPhotoSelect} = useContext(ProjectContext);
    const { SuccessPopup,showSuccessPopup,isSuccessVisible} = useSuccessPopup();
    const {showErrorPopup,ErrorPopup,errorPopupVisible} = useErrorPopup();
    const [ImageSelection, setImageSelection] = useState([]);
    const isFocused = useIsFocused();
      const [logos, setLogos] = useState([]);
        const [selectedLogo, setSelectedLogo] = useState(null);
const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

            const submitType = {
                submit: "submit",
                pdf: 'pdf'
            }

            const handleLogoSelect = (logo) => {
                setSelectedLogo(logo);
                setIsDropdownOpen(false);
            };

    useEffect(()=>{
        setImageSelection([]);
    },[])
    useEffect(() => {
        if(isFocused){
            fetchLogos();
            console.log("photoSelect : ",JSON.stringify(photoSelect))
            if(photoSelect && photoSelect?.length > 0){
                const map = new Map();
                photoSelect.map((item) => {
                    if(map.has(item.date)){
                        map.get(item.date).images.push({uri: item.uri, time: item.time});
                    }else{
                        map.set(item.date, {date: item.date, location: item.location, images: [{uri: item.uri, time: item.time}]})
                    }
                });
                const filterList = Array.from(map.values()).sort((a, b) => {
                    return moment(b.date, 'DD MMMM YYYY').toDate().getTime() - moment(a.date, 'DD MMMM YYYY').toDate().getTime();
                })
                setImageSelection(filterList);
            }
        }
      
    }, [isFocused]);

    const fetchLogos = async () => {
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
        } finally {
        }
    };
    const callToSubmit = async (type) => {
        try {
            const requiredFields = {
                userId: WeeklyEntryReport?.userId,
                projectId: WeeklyEntryReport?.projectId,
                reportDate: WeeklyEntryReport?.reportDate,
                inspectorTimeIn: WeeklyEntryReport?.inspectorTimeIn,
                inspectorTimeOut: WeeklyEntryReport?.inspectorTimeOut,
                cityProjectManager: WeeklyEntryReport?.cityProjectManager,
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

            if(type == submitType.pdf){
                try {
                    setIsLoading(true)

                await createWeeklyPdf({...WeeklyEntryReport,ImageSelection,selectedLogo});
            setIsLoading(false)
            return;

                } catch (error) {
            setIsLoading(false)
                    
                } finally{
            setIsLoading(false)

                }
            

            }else{
                let selectedImages = [];

                ImageSelection.map((item) => {
                    item.images.map((image) => {
                        const url = image?.uri.replace(/^.*?\.net\//, "");
                        selectedImages.push({path:url})
                    })
                });

            const requestParam ={
                "startDate":  WeeklyEntryReport?.startDate,
                "endDate":  WeeklyEntryReport?.endDate,
                "projectId":  WeeklyEntryReport?.projectId,
                "userId":  WeeklyEntryReport?.userId,
                "projectName":  WeeklyEntryReport?.projectName,
                "projectNumber":  WeeklyEntryReport?.projectNumber,
                "contractNumber":  WeeklyEntryReport?.contractNumber,
                "owner":  WeeklyEntryReport?.owner,
                "cityProjectManager":  WeeklyEntryReport?.cityProjectManager,
                "consultantProjectManager":  WeeklyEntryReport?.supportCA,
                "contractProjectManager": WeeklyEntryReport?.contractProjectManager,
                "contractorSiteSupervisorOnshore":  WeeklyEntryReport?.contractorSiteSupervisorOnshore,
                "contractorSiteSupervisorOffshore": WeeklyEntryReport?.contractorSiteSupervisorOffshore,
                "contractAdministrator": WeeklyEntryReport?.contractAdministrator,
                "supportCA": WeeklyEntryReport?.supportCA,
                "siteInspector": WeeklyEntryReport?.siteInspector.join(','),
                "IsChargable": WeeklyEntryReport?.IsChargable || true,
                "inspectorTimeIn": WeeklyEntryReport?.inspectorTimeIn,
                "inspectorTimeOut": WeeklyEntryReport?.inspectorTimeOut,
                "reportDate": WeeklyEntryReport?.reportDate,
                "images": selectedImages
            }
            setIsLoading(true)

            console.log("requestParam: ",requestParam)
            const response = await apiClient.post(endPoints.URL_CREATE_WEEKLY_REPORT, requestParam);
            console.log("response : ", response);
             if(response == 403 || response == 401){
                    const result = await showErrorPopup(response.data.message);
                    if(result){
                      util.logoutUser();
                      navigation.navigate(SCREENS.LOGIN_SCREEN);
                    }
                    return;
                  }
            if (response.status == 200 || response.status == 201) {
                const output = response.data;
                // if (output.status == 'success') {
                    showSuccessPopup(response.data?.message || "Daily diary entry saved successfully!").then((res)=>{
                        console.log("res",res)
                    setIsLoading(false)
                        
                    })
                // }
            }else{
                const message = response.data?.message || "Failed to save entry";
                showErrorPopup(message);
            setIsLoading(false)

            }
            }

        } catch (error) {
            console.log(error);
            if (error.response) {
                console.log("Server Response Error:", error.response.data);
                showErrorPopup(`Failed to submit: ${error.response.data.message || "Invalid request."}`);
            } else if (error.request) {
                showErrorPopup("No response from the server. Check your network.");
                console.log(" No Response from Server:", error.request);
            } else {
                showErrorPopup("Something went wrong. Please try again.");
                console.log("Request Setup Error:", error.message);
            } 
            setIsLoading(false)

            
        } finally{
            setIsLoading(false)

        }
    }
   
    const ImageComponent = ({ uri }) => {
        const [loading, setLoading] = useState(true);
        return (
            <TouchableOpacity onPress={() => navigation.navigate(SCREENS.IMAGE_VIEWER, { uri: uri })} style={styles.imageWrapper}>
                <Image
                    source={{ uri: uri || "https://via.placeholder.com/150" }}
                    style={styles.image}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                />
            </TouchableOpacity>
        );
    };

    const deletePhoto =(uri,pindex) => {
        try {
            const updatedImageSelection = ImageSelection.map((item) => {
                const updatedImages = item.images.filter((image) => image.uri !== uri);
                return { ...item, images: updatedImages };
            })
            const updated = updatedImageSelection.filter((item) => item.images.length > 0);
            console.log("updatedImageSelection : ",updated)
            setImageSelection(updated);


            let tempImages = [...photoSelect];
            console.log("tempImages : ",tempImages)
            const tempPhotoSelect = tempImages.filter((image) => image.uri !== uri);
            console.log("updated1 :",tempPhotoSelect)
            setPhotoSelect(tempPhotoSelect);
        } catch (error) {
            
        }
    }

   

    return (
        <SafeAreaWrapper>
        {/* <SafeAreaView style={{flex:1, backgroundColor:appColor.white}}> */}
        {/* <KeyboardAvoidingView
			style={{ flex: 1, marginBottom: 10, backgroundColor: "white", paddingTop: 10 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		> */}
             <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingBottom: 10
                        }}>
                            <View style={{
                                width:'86%'
                            }}>
                            <HeaderWithBackButton  title={"Review Weekly Report"} onBackClick={() => navigation.goBack()} />
            
                            </View>
                            <TouchableOpacity style={{
                                width:'12%'
                            }} onPress={() => {
                                callToSubmit(submitType.pdf)
                            }}>
                                <Image source={imgURL.PDF} style={{ width: 30, height: 30, marginHorizontal: 10 }} />
            
                            </TouchableOpacity>
                            {/* <View style={{ marginLeft: 10,width:'17%' }}>
                                <CustomButton title={"Edit"} onCick={() => navigation.goBack()} />
            
                            </View> */}
                        </View>
			{/* <HeaderWithBackButton title={WeeklyEntryReport?.projectName + " Weekly Entry"} onBackClick={() => navigation.goBack()} /> */}
          <ScrollView style={{flex:1,paddingHorizontal:10}}>

                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10,
                    width: '100%',
                    alignSelf: 'center',
                }}>
                    <Text style={styles.title}>Images from Photo Files</Text>
                    <TouchableOpacity style={{
                        width: 100,
                        backgroundColor: appColor.primary,
                        paddingVertical: 4,
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }} onPress={() => navigation.navigate(SCREENS.PHOTO_FILES_SELECTION)} >
                        <Text style={{ color: appColor.white,fontFamily: appFonts.Medium }}>Import</Text>
                    </TouchableOpacity>
                </View>

            {ImageSelection.map((entry, index) => (
                            <View key={index} style={styles.entryContainer}>
                                <Text style={[styles.dateText,{color:appColor.primary}]}>{entry.date}</Text>
                                {/* <Text style={[styles.locationText,{color:appColor.black,fontFamily:appFonts.Regular}]}>{entry.location}</Text> */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={true}
                                    style={styles.imagesRow}>
                                    {entry.images.map((image) => (
                                        <View>
                                        <ImageComponent uri={image.uri} />
                                        <TouchableOpacity onPress={() => deletePhoto(image.uri,index)} style={{
                                            position:'absolute',
                                            right:10,
                                            top:0
                                        }}>
                                        <Ionicons name="remove-circle" size={24} color="red"  />

                                        </TouchableOpacity>

                                        </View>
                                     ))}
                                </ScrollView>
                            </View>
                        ))}



            <View style={styles.section}>
                <Text style={[styles.sectionTitle,{fontFamily:appFonts.SemiBold}]}>Project Details</Text>
                {[
                    { label: "Date", value: WeeklyEntryReport?.reportDate },
                    { label: "Project Number", value: WeeklyEntryReport.projectNumber },
                    { label: "Project Name", value: WeeklyEntryReport.projectName },
                    { label: "Owner", value: WeeklyEntryReport.owner },
                    { label: "Contract Number", value: WeeklyEntryReport.contractNumber },
                    { label: "City Project Manager", value: WeeklyEntryReport?.cityProjectManager },
                    { label: "Consultant Project Manager", value: WeeklyEntryReport?.consultantProjectManager },
                    { label: "Site Inspector", value: WeeklyEntryReport?.siteInspector.join(',') },
                    { label: "Inspector Time In", value:WeeklyEntryReport?.inspectorTimeIn },
                    { label: "Inspector Time Out", value: WeeklyEntryReport?.inspectorTimeOut },
                    { label: "Contract Project Manager", value: WeeklyEntryReport.contractProjectManager },
                    { label: "Contractor Site Supervisor Onshore", value: WeeklyEntryReport.contractorSiteSupervisorOnshore },
                    { label: "Contractor Site Supervisor Offshore", value: WeeklyEntryReport.contractorSiteSupervisorOffshore },
                    { label: "Contract Administrator", value: WeeklyEntryReport.contractAdministrator },
                    { label: "Support CA", value: WeeklyEntryReport?.supportCA },
                    { label: "Start Date", value: WeeklyEntryReport?.startDate },
                    { label: "End Date", value: WeeklyEntryReport?.endDate },
                ].map((item, index) => (
                    <Text key={index} style={styles.detailText}>
                        <Text style={styles.boldText}>{item.label}:</Text> {item.value || "N/A"}
                    </Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle,{fontFamily:appFonts.SemiBold}]}>Daily Entries Details</Text>

                {WeeklyEntryReport?.dailyEntries?.map((item, index) => (
                    <View key={index} style={styles.cardDetails}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={[styles.boldText,{fontFamily:appFonts.SemiBold}]}>Date:</Text>
                            <Text style={[styles.boldText,{fontFamily:appFonts.SemiBold}]}>{moment(item?.selectedDate).format('DD-MM-YYYY') || item?.selectedDate || ''}</Text>
                        </View>
                        <Text style={[styles.boldText,{fontSize:14,marginTop:8,fontFamily:appFonts.Regular}]}>{item?.description}</Text>


                        {/* <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Text style={styles.boldText}>Chargable:</Text>

                            <Switch
                                trackColor={{ false: '#767577', true: appColor.primary }}
                                thumbColor={item.IsChargable ? '#f5dd4b' : '#f4f3f4'}
                                onValueChange={() => dailyEntryToggle(index)}
                                value={item.IsChargable}
                            />
                        </View> */}

                    </View>
                ))}

            </View>

{
    WeeklyEntryReport?.dailyDiaries?.length > 0 ?

    <View style={styles.section}>
    <Text style={[styles.sectionTitle,{fontFamily:appFonts.SemiBold}]}>Daily Dairy Details</Text>
    {WeeklyEntryReport?.dailyDiaries?.map((item, index) => (
        <View key={index} style={styles.cardDetails}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text style={[styles.boldText,{fontFamily:appFonts.SemiBold}]}>Date:</Text>
                <Text style={styles.descriptionText}>{moment(item?.selectedDate).format('DD-MM-YYYY') || item?.selectedDate || ''}</Text>
            </View>

            <Text style={styles.boldText}>{item?.description}</Text>



            {/* <View style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text style={styles.boldText}>Chargable:</Text>

                <Switch
                    trackColor={{ false: '#767577', true: appColor.primary }}
                    thumbColor={item.IsChargable ? '#f5dd4b' : '#f4f3f4'}
                    onValueChange={() => dailyDiaryToggle(index)}
                    value={item.IsChargable}
                />
            </View> */}

        </View>
    ))}
</View>

    : null
}
         

               <View style={styles.section}>
                                        <Text style={[styles.sectionTitle,{fontFamily:appFonts.SemiBold}]}>Signature</Text>
                                       
                                        {WeeklyEntryReport?.signature && (
                                            <View  style={{padding:10}}>
                                                <Image source={{ uri: WeeklyEntryReport?.signature }} style={{ width: 100, height: 100,borderWidth:0.5,borderColor:'#00000039'}} />
                                            </View>
                                        )}
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

 <View style={[styles.buttonContainer,]}>


<View style={{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal:10
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



</View>

          
            </ScrollView>

           


            {errorPopupVisible ?
                ErrorPopup(): null
            }
            {
                isSuccessVisible  ?
                SuccessPopup(): null
            }

            <LoaderModal visible={isLoading} />

            
        {/* </KeyboardAvoidingView> */}
        {/* </SafeAreaView> */}
        </SafeAreaWrapper>
    )
}

export default WeeklyEntryReportConfirm

const styles = StyleSheet.create({
    editButtonText: {
        color: 'white',
        fontSize: 14,
      },
      editButton: {
        backgroundColor: "#486ECD",
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
      },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingTop: 15,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    headerText: {
        fontSize: 18,
        fontFamily:appFonts.Medium,
        marginLeft: 8,
        color: "#000",
    },
    title: {
        fontSize: 16,
        color: "#486ECD",
        fontFamily:appFonts.SemiBold,
    },
    entryContainer: {
        marginBottom: 20,
        backgroundColor: "#f2f4f7",
        padding: 10,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 16,
        fontFamily:appFonts.SemiBold,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 10,
        fontFamily:appFonts.SemiBold,
    },
    imagesRow: {
        flexDirection: "row",
    },
    imageWrapper: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginRight: 10,
        overflow: "hidden",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical:10,
        marginBottom: 50
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
        fontFamily:appFonts.Medium,
    },
    submitButtonText: {
        fontSize: 16,
        color: "#ffffff",
        fontFamily:appFonts.Medium,
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
        fontFamily:appFonts.Medium,
    },
    section: { marginBottom: 20, padding: 15, backgroundColor: "white", borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    sectionTitle: { fontSize: 16,  fontFamily:appFonts.Medium, marginBottom: 10, color: "#333" },
    boldText: { fontFamily: appFonts.Medium },
    descriptionText: { fontWeight: '500' },
    cardDetails: {
        elevation: 1,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        // flexDirection: "row",
        // justifyContent: "space-between",
        // alignItems: 'center',


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
});