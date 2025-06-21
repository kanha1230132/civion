import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { endPoints } from '../../api/endPoints';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import { appColor } from '../../theme/appColor';
import { useErrorPopupContext } from '../../context/PopupProvider';
import apiClient from '../../api/apiClient';
import LoaderModal from '../../components/modal/Loader';
import { SCREENS } from '../../utils/ScreenNames';
import { appFonts } from '../../theme/appFonts';
import CustomButtton from '../../components/button/CustomButton';
import { ImageType } from '../../utils/Constants';
import util from '../../utils/util';
import moment from 'moment';


const CreateSchedule = ({ navigation }) => {
    const [projectName, setProjectName] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [owner, setOwner] = useState('');
    const [file, setFile] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [pdfDetails, setPdfDetails] = useState(null)
    const { showErrorPopup,showSuccessPopup } = useErrorPopupContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleBackButton = () => {
        navigation.goBack();
    };


    const selectPdf = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
            console.log("res : ",res)
            if (res.assets && res.assets.length > 0) {
                setPdfDetails(res.assets[0]);
                setIsLoading(true)
                await uploadAttachments(res.assets[0].uri);
            } else {
                showErrorPopup('Error Picking the Document');
            }
        } catch (err) {
            console.log('Error picking document:', err);
            showErrorPopup('Error Picking the Document');

        } finally {
            setIsLoading(false)
        }
    }

    const uploadAttachments = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
             name: `${util.getUuid()}_document.pdf`,   // name of the file (optional but good practice)
            type: 'application/pdf'
            });

            formData.append('type', ImageType.SCHEDULE);
            const response = await apiClient.post(endPoints.URL_UPLOAD_ATTACHMENTS, formData);
            // console.log("response : ", response)
            setIsLoading(false)
            if(Platform.OS =="ios"){
                await util.delay(500)
            }
            if (response.status === 200 || response.status === 201) {
                const output = response.data
                console.log("output : ", output)
                if (output.status == "success") {
                    let url = output.data[0].fileUrl;
                    console.log("url : ",url)
                     url = url.replace(/^.*?\.net\//, "");
                    setFile(url);
                    showSuccessPopup(output.message)
                } else {
                    showErrorPopup(output.message);
                }
            } else {
                showErrorPopup(output.message);
            }


        } catch (error) {
            showErrorPopup("Something went wrong, please try again");

        } finally {
            setIsLoading(false)
            
        }
    }



    const createSchedule = async ()=>{
        if(!file){
            showErrorPopup('Please select a PDF file');
            return;
        }
        if (!projectName.trim()) {
            showErrorPopup('Please provide the Project Name');
            return;
        }
        if (!projectNumber.trim()) {
            showErrorPopup('Please provide the Project Number');
        }

        if (!owner.trim()) {
            showErrorPopup('Please provide the Owner');
            return;
        }
        try {
            setIsLoading(true)
            // const formData = new FormData();
            const requestBody = {
                projectName: projectName,
                projectNumber: projectNumber,
                owner: owner,
                pdfUrl: file,
                month: moment().format('MMMM'),
                projectId: util.getUuid()
            }
            console.log("requestBody",requestBody)
            const response = await apiClient.post(endPoints.URL_UPLOAD_SCHEDULE, requestBody);
            console.log("response : ",JSON.stringify(response.data))

            if(response.status === 200 || response.status === 201){
                setIsLoading(false);
                 if(Platform.OS =="ios"){
                await util.delay(200)
                }
                const status = await showSuccessPopup("Schedule uploaded successfully");
                if(Platform.OS =="ios"){
                await util.delay(500)
                }
                if(status){
                    navigation.navigate(SCREENS.BASELINE_SCHEDULE_LIST)
                }
            }else{
                setIsLoading(false);
                showErrorPopup(response?.data?.message || response?.message);
            }
        } catch (error) {
            console.log("Error :",error)
            showErrorPopup(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <HeaderWithBackButton 
            customStyle={{marginBottom:15}}
            title={"Upload Schedule"} onBackClick={() => navigation.goBack()} />
            {/* Project Name Input */}
            <View style={{
                paddingHorizontal: 16
            }}>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Project Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Project Name"
                        value={projectName}
                        onChangeText={setProjectName}
                    />
                </View>

                {/* Project Number Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Project Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Project Number"
                        value={projectNumber}
                        onChangeText={setProjectNumber}
                    />
                </View>

                {/* Owner Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Owner</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Owner"
                        value={owner}
                        onChangeText={setOwner}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Schedule Pdf</Text>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}  >
                        <TextInput
                            editable={false}
                            style={{
                                width: '85%',
                                height: 40,
                                borderColor: '#000',
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                            }}
                            placeholder="Select Pdf"
                            value={file}
                        />
                        <TouchableOpacity style={{
                            width: '12%',
                            height: 40,
                            borderColor: '#000',
                            borderWidth: 1,
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                            onPress={()=>{
                                if(file){
                                    setFile('')
                                }else{
                                    selectPdf();
                                }
                            }}
                        >
                            {
                                file ? <Ionicons name="close" size={24} color={appColor.cancel} /> :
                                <Ionicons name="attach-outline" size={24} color={appColor.primary} />
                            }
                           
                            
                            

                        </TouchableOpacity>

                    </View>
                </View>

                <View style={{
                    marginTop: 20,
                    height: 45
                }}>
                    <CustomButtton title="Upload Schedule" onCick={() => createSchedule()} />
                </View>

            </View>

            {/* Loader Modal */}
                    {isLoading && <LoaderModal visible={isLoading} />}


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 14,
    },
    header: {
        fontSize: 18,
        fontFamily:appFonts.Medium,
        color: '#000000',
        marginLeft: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#000',
        marginBottom: 5,
        fontFamily:appFonts.Medium,
       
    },
    input: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        fontFamily:appFonts.Medium,
    },
    uploadButton: {
        backgroundColor: '#486ECD',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 30
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    selectedFileText: {
        marginBottom: 20,
        fontSize: 14,
        color: '#666666',
    },
    statusText: {
        marginBottom: 20,
        fontSize: 14,
        color: 'green',
        textAlign: 'center',
        fontFamily:appFonts.Medium,
    },
    bottomButtonsContainer: {
        justifyContent: 'flex-end',
        paddingBottom: 30,
    },
});

export default CreateSchedule;
