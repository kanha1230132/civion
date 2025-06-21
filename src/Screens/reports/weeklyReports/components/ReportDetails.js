import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import CustomTextInput from '../../../../components/CustomTextInput'
import IconTextInput from '../../../../components/IconTextInput'
import { Image } from 'react-native'
import { TouchableOpacity } from 'react-native'

import { imgURL } from '../../../../Assets'
import { appFonts } from '../../../../theme/appFonts'
import { appColor } from '../../../../theme/appColor'
import { TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import moment from 'moment'
import apiClient from '../../../../api/apiClient'
import { endPoints } from '../../../../api/endPoints'
import * as ImagePicker from "expo-image-picker";
import LoaderModal from '../../../../components/modal/Loader'
import ImageListItem from '../../../../components/ImageListItem'
import { useErrorPopupContext } from '../../../../context/PopupProvider'
import util from '../../../../utils/util'
import { SCREENS } from '../../../../utils/ScreenNames'
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from 'react-native-modal-datetime-picker'

const ReportDetails = ({ weeklyEntry, setWeeklyEntry }) => {
    const typeOfPicker = {
        date: "date1",
        timeIn: "timeIn1",
        timeOut: "timeOut1",
    }
    const [ShowPickerModal, setShowPickerModal] = useState(false);
    const [selectedPickerType, setSelectedPickerType] = useState(typeOfPicker.date);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation()

    const clickOnPicker = (type) => {
        console.log("type : ", type)
        setSelectedPickerType(type);
        setShowPickerModal(true)
    }

    const onDateChange = (event, date) => {
        if (date) {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            if (selectedPickerType === typeOfPicker.date) {
                setWeeklyEntry({ ...weeklyEntry, reportDate: formattedDate })

            } else if (selectedPickerType === typeOfPicker.timeOut) {
                const time = moment(date).format('HH:mm A');
                setWeeklyEntry({ ...weeklyEntry, inspectorTimeOut: time })
            } else if (selectedPickerType === typeOfPicker.timeIn) {
                const time = moment(date).format('HH:mm A');
                setWeeklyEntry({ ...weeklyEntry, inspectorTimeIn: time })
            }
        }
        setShowPickerModal(false);
    };

    const addInspector = () => {
        setWeeklyEntry({ ...weeklyEntry, siteInspector: [...weeklyEntry?.siteInspector, ""] })
	};

    const removeInspector = (index) => {
		const updatedInspectors = weeklyEntry?.siteInspector.filter((_, i) => i !== index);
        setWeeklyEntry({ ...weeklyEntry, siteInspector:updatedInspectors })
	};

    const updateInspector = (text, index) => {
		const updatedInspectors = [...weeklyEntry?.siteInspector];
		updatedInspectors[index] = text;
        setWeeklyEntry({ ...weeklyEntry, siteInspector:updatedInspectors })

	};


    return (
        <View style={styles.inputContainer}>
            <IconTextInput
                onclickIcon={() => clickOnPicker(typeOfPicker.date)}
                textValue={weeklyEntry?.reportDate}
                label="Date"
                iconName={'calendar-outline'}
                editable={false}
            />
            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, projectName: text })}
                textValue={weeklyEntry.projectName}
                label="Project Name"
                editable={false}

            />

            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, owner: text })}
                textValue={weeklyEntry.owner}
                label="Owner"
                editable={false}


            />

            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, consultantProjectManager: text })}
                textValue={weeklyEntry.consultantProjectManager}
                label="Consultant Project Manager"
            />

            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, projectNumber: text })}
                textValue={weeklyEntry.projectNumber}
                label="Project Number"
                editable={false}

            />


            <CustomTextInput
                // keyboardType='numeric'
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, contractNumber: text })}
                textValue={weeklyEntry.contractNumber}
                label="Contract Number"
                

            />



            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, cityProjectManager: text })}
                textValue={weeklyEntry.cityProjectManager}
                label="City Project Manager"
            />


            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, contractProjectManager: text })}
                textValue={weeklyEntry.contractProjectManager}
                label="Contract Project Manager"
            />


            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, contractorSiteSupervisorOnshore: text })}
                textValue={weeklyEntry.contractorSiteSupervisorOnshore}
                label="Contractor Site Supervisor Onshore"
            />


            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, contractorSiteSupervisorOffshore: text })}
                textValue={weeklyEntry.contractorSiteSupervisorOffshore}
                label="Contractor Site Supervisor Offshore"
            />

            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, contractAdministrator: text })}
                textValue={weeklyEntry.contractAdministrator}
                label="Contract Administrator"
            />

            <CustomTextInput
                onChangeTextValue={(text) => setWeeklyEntry({ ...weeklyEntry, supportCA: text })}
                textValue={weeklyEntry.supportCA}
                label="Support CA"
            />



            <Text style={styles.label}>Site Inspector</Text>
            {weeklyEntry?.siteInspector.map((inspector, index) => (
                <View key={index} style={styles.inspectorRow}>
                    <TextInput
                        style={[styles.input, styles.inspectorInput]}
                        placeholder={`Inspector ${index + 1}`}
                        value={inspector.name}
                        onChangeText={(text) => updateInspector(text, index)}
                    />
                    <TouchableOpacity onPress={() => {
                        addInspector()
                    }} style={styles.addInspectorButton}>
                        {index === weeklyEntry?.siteInspector.length - 1 && (
                            <Ionicons name="add-circle-outline" size={30} color={appColor.primary} />
                        )}
                    </TouchableOpacity>
                    <View style={styles.iconContainer}>
                        {index > 0 && (
                            <TouchableOpacity onPress={() => {
                                removeInspector(index)
                            }} style={styles.iconButton}>
                                <Ionicons name="remove-circle" size={24} color="red" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
            <View style={[styles.rowContainer,{marginBottom:100}]}>
                <View style={styles.halfInputContainer}>

                    <IconTextInput
                        onclickIcon={() => clickOnPicker(typeOfPicker.timeIn)}
                        textValue={weeklyEntry?.inspectorTimeIn}
                        label="Time In"
                        iconName="time-outline"
                        inputFontSize={14}
                        editable={false}
                    />
                </View>

                <View style={styles.halfInputContainer}>

                    <IconTextInput
                        onclickIcon={() => clickOnPicker(typeOfPicker.timeOut)}
                        textValue={weeklyEntry?.inspectorTimeOut}
                        label="Time Out"
                        iconName="time-outline"
                        inputFontSize={13}
                        editable={false}
                    />
                </View>
            </View>


            {/* <View style={{
                marginTop: 23
            }}>
                <Text style={styles.label}>Add Logo</Text>
                <View style={styles.containerUpload}>
                    <Image
                        source={imgURL.UPLOAD_ICON} // Replace with your icon path
                        style={styles.uploadicon}
                    />
                    <Text style={styles.text}>Attach Images from your device</Text>
                    <TouchableOpacity style={styles.ChooseFilebutton}
                        onPress={() => {
                            handlePickImage() 
                        }
                        }
                    >
                        <Text style={styles.ChooseFilebuttonText}>Choose Files</Text>
                    </TouchableOpacity>
                </View>
                {weeklyEntry?.logo && (
                    <ImageListItem imageUri={weeklyEntry?.logo} fileName={'logo 1'} onDelete={() => {

                    }
                    } />
                )}
            </View> */}




            {
                ShowPickerModal ?
                    // <DateTimePicker
                    //     value={new Date()}
                    //     mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
                    //     display="default"
                    //     onChange={onDateChange}
                    // />

                     <DateTimePicker
                                      testID="dateTimePicker"
                                      isVisible={ShowPickerModal}
                                        value={selectedPickerType == typeOfPicker.date ? (weeklyEntry?.selectedDate ? new Date(weeklyEntry.selectedDate) : new Date()) : ( new Date())}
                                        mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
                                        onConfirm={(date)=> onDateChange(null, date)}
                                        onCancel={() => setShowPickerModal(false)}
                                        textColor="black" // Force text color (iOS 14+)
                                        themeVariant="light"
                                        date={selectedPickerType == typeOfPicker.date ? (weeklyEntry?.selectedDate ? new Date(weeklyEntry.selectedDate) : new Date()) : ( new Date())}
                                      />

                    : null
            }
            {
                                loading ? 
                                <LoaderModal visible={loading} />
                                : null
                            }
        </View>
    )
}

export default ReportDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        marginBottom: 50
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
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
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
        // marginBottom: 12,
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
        height: 50

    },
    halfInputContainer: {
        width: "48%",
        height: 50

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
        // backgroundColor: "#486ECD",
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