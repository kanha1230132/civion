import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView, BackHandler, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endPoints } from '../../api/endPoints';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import apiClient from '../../api/apiClient';
import LoaderModal from '../../components/modal/Loader';
import { appColor } from '../../theme/appColor';
import { Image } from 'react-native';
import { imgURL } from '../../Assets';
import { SCREENS } from '../../utils/ScreenNames';
import { useIsFocused } from '@react-navigation/native';
import { appFonts } from '../../theme/appFonts';
import moment from 'moment/moment';
import { DateFormat } from '../../utils/Constants';
import { useConfirmationPopup } from '../../components/popup/confirmationPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';
import { useErrorPopup } from '../../components/popup/errorPopup';
import util from '../../utils/util';
import { SafeAreaWrapper } from '../../../App';


const BaseLineScheduleList = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const { showErrorPopup,showConfirmationPopup,showSuccessPopup } = useErrorPopupContext();
    const [scheduleList, setScheduleList] = useState([]);
    const { showErrorPopup, ErrorPopup,errorPopupVisible } = useErrorPopup();
    const { showSuccessPopup, SuccessPopup ,isSuccessVisible} = useSuccessPopup();
    const { showConfirmationPopup,ConfirmationPopup,popupVisible } = useConfirmationPopup()
    const isFocused = useIsFocused();

    useEffect(() => {
        const backAction = () => {
            navigation.navigate(SCREENS.MAIN_TABS)
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );
        return () => backHandler.remove();
    }, [navigation,BackHandler]);
   
    useEffect(() => {
        if(isFocused){
            fetchSchedules();
        }
    }, [isFocused])

    const fetchSchedules = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.post(endPoints.URL_GET_ALL_PROJECTS);
            setIsLoading(false);
            if (response.status === 200 || response.status === 201) {
                console.log("response : ", response.data);
                if(response.data?.status == "success"){
                    const list = response.data.data;
                    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setScheduleList(list);

                }
            } else {
                showErrorPopup(response.data.message);
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            showErrorPopup(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    // Function to delete a project and its schedules
    const deleteSchedule = async (item) => {
        try {
            if (!item.projectId || !item.projectId._id) {
                showErrorPopup("Project ID is missing, cannot delete.");
                return;
            }
    
           const status = await showConfirmationPopup("Confirm Deletion", "Are you sure you want to delete this schedule?","Delete","Cancel")
                const projectId = item.projectId._id;
                if(status){
                    setIsLoading(true);
                    const apiUrl = `${endPoints.URL_DELETE_SCHEDULE}${projectId}`
                    const response = await apiClient.delete(apiUrl);
                            setIsLoading(false);
if(Platform.OS =="ios"){
                await util.delay(1000)
                }
                    if(response.status == 200 || response.status == 201){
                        if(response.data?.status == "success"){
                             await showSuccessPopup('Schedule removed successfully.');
                              fetchSchedules()
                        }
                    }else{
                        showErrorPopup(response.data.message || "Something went wrong")
                    }
              
              setIsLoading(false);
        
                }  
            
        } catch (error) {
            console.log("Error : ", error);
            setIsLoading(false);

        }finally {
            setIsLoading(false);
        }
       
        // setData((prevData) => prevData.filter(sch => sch.projectId._id !== projectId));
    };

  

    // Render each schedule item
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.projectName}</Text>

                    {/* Project Number and Owner should have the same font size and style */}
                    <Text style={styles.subtitle}>Project Number: {item.projectNumber}</Text>
                    <Text style={styles.subtitle}>Owner: {item.owner}</Text>
                    <Text style={styles.subtitle}>Date: {moment(item?.projectId?.startDate).format(DateFormat.DD_MM_YYYY)}</Text>

                    {/* Button to open the uploaded PDF */}
                    <TouchableOpacity style={{ flexDirection: "row", alignItems: "center",justifyContent:'flex-end',marginTop:-20 }} onPress={() => navigation.navigate("PDFViewer", { pdfUrl: `${item.pdfUrl}` })}>
                        <Image source={imgURL.PDF} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>
                </View>

                {/* Delete Icon */}
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSchedule(item)}>
                    <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        // <SafeAreaView style={styles.container}>
            <SafeAreaWrapper>
          <HeaderWithBackButton 
            title="Baseline Schedules" 
            onBackClick={() => navigation.navigate(SCREENS.MAIN_TABS)} 
            customStyle={{marginBottom:15}}
          />
      
          {/* Show schedule list if available */}
          {scheduleList.length > 0 && (
            <FlatList
              data={scheduleList}
              keyExtractor={(item, index) =>
                item?._id ? `${item._id}-${index}` : String(index)
              }
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshing={isLoading}
              onRefresh={()=>fetchSchedules()}
            />
          )}

        {/* Show message if no schedules found and not loading */}
        {!isLoading && scheduleList.length === 0 && (
            <View style={styles.notFoundContainer}>
              <Text style={{ fontSize: 18, color: appColor.black }}>
                {"No Schedules Found"}
              </Text>
            </View>
          )}
      
        {/* Loader Modal */}
        {isLoading && <LoaderModal visible={isLoading} />}
      
        {/* Add Schedule Button (currently commented out) */}
        
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate(SCREENS.CREATE_SCHEDULE)}
        >
          <Ionicons name="add" size={24} color={appColor.white} />
        </TouchableOpacity>


        {isSuccessVisible ? <SuccessPopup /> : null}
      {errorPopupVisible ? <ErrorPopup /> : null}
        {popupVisible ? <ConfirmationPopup /> : null}
       
       
</SafeAreaWrapper>

    //   </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
      },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 15,
    },
    header: {
        fontSize: 18,
        fontFamily:appFonts.Bold,
        color: '#000000',
        marginLeft: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        // borderWidth: 1,
        borderColor: '#486ECD',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation:1
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: "100%"
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily:appFonts.Bold,

        color: appColor.primary,
        marginBottom: 5,
        
    },
    subtitle: {
        fontSize: 14,  // Keep it the same size as Project No
        fontFamily:appFonts.Medium,
        // Make it bold if needed
        color: '#666666',
        marginBottom: 5,
    },

    contractor: {
        fontSize: 12,
        color: '#999999',
        fontFamily:appFonts.Medium,

    },
    uploadButton: {
        backgroundColor: appColor.primary,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 60,
        right:40,
        height: 50,
        width: 50,
        elevation:10,
       
    },
    uploadButtonText: {
        color: '#486ECD',
        fontSize: 18,
        // fontWeight: 'bold',
    },
    emptyList: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
        backgroundColor:appColor.white, 
        borderRadius: 6,
        padding: 3,
        elevation:2
     },
});

export default BaseLineScheduleList;
