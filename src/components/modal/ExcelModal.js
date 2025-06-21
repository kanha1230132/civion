import React, { useState } from 'react';
import { View, Text,TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Dropdown from './dropDown';
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { appColor } from "../../theme/appColor";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import { DateFormat } from '../../utils/Constants';
import { set } from 'lodash';
import { endPoints } from '../../api/endPoints';
import apiClient from '../../api/apiClient';
import LoaderModal from '../modal/Loader';
import { useErrorPopup } from '../popup/errorPopup';
import { appFonts } from '../../theme/appFonts';
import { useSuccessPopup } from '../popup/successPopup';
import { Modal, Portal } from 'react-native-paper';
const ExcelModal = ({ onClose, setShowExcelModal, showExcelModal }) => {
    const datePickerTypes = {
        from: 'from',
        to: 'to'
    }
    const [SelectDate, setSelectDate] = useState('');
    const [FromDate, setFromDate] = useState('');
    const [ToDate, setToDate] = useState('');
    const [DatePickerType, setDatePickerType] = useState(datePickerTypes.from)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
    const { SuccessPopup, showSuccessPopup, isSuccessVisible } = useSuccessPopup();

    const handleDateChange = (selectedDate) => {
        const date = moment(selectedDate).format(DateFormat.YYYY_MM_DD);
        if (DatePickerType == datePickerTypes.from) {
            setFromDate(date);
        } else if (DatePickerType == datePickerTypes.to) {
            setToDate(date);
        }
        setShowDatePicker(false);
    };

    const base64ToUint8Array = (base64) => {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };


    const onApply = async () => {
        try {

            if (!FromDate || !ToDate) {
                await showErrorPopup('Please select a date.');
                return;
            }

            const tempromDate = moment(FromDate).format(DateFormat.YYYY_MM_DD) + 'T00:00:00';
            const tempToDate = moment(ToDate).format(DateFormat.YYYY_MM_DD) + 'T23:59:59';

            const payload = {
                "fromDate": tempromDate,
                "toDate": tempToDate
            }
            console.log("payload L ", payload)

            setLoading(true);
            const response = await apiClient.post(endPoints.URL_INVOICE_EXCEL, payload);
            console.log("response : ", response.status)
            if (response.status == 200 || response.status == 201) {
                const output = response.data;
                if (output.status == "success") {
                    setLoading(false)
                    await showSuccessPopup(output.message);
                    onClose();
                    return;
                }
            } else {
                showErrorPopup('Something went wrong.');
            }
            setLoading(false);
        } catch (error) {
            console.log("Error fetching invoices:", error);
            showErrorPopup(error?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }

    }


    return (
        <Portal>

        <Modal  transparent={true} visible={showExcelModal} onDismiss={onClose}>
            <View>

            <View style={styles.overlay}>
                <View style={styles.popup}>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialIcons name="cancel" size={25} color="red" />
                    </TouchableOpacity>


                    {/* General Heading */}
                    <Text style={{
                        fontFamily: appFonts.SemiBold, color: appColor.primary,
                        fontSize: 18, textAlign: 'center',
                        marginVertical: 10
                    }}>Generate Excel </Text>


                    {/* Title */}
                    <Text style={styles.title}>From Date </Text>

                    <TouchableOpacity style={styles.dateInputContainer} onPress={() => { setDatePickerType(datePickerTypes.from), setShowDatePicker(true) }}>
                        <Text style={styles.dateInputText}>
                            {FromDate ? FromDate : 'Select Date'}
                        </Text>
                        <Ionicons name="calendar" size={24} color="#00000070" style={styles.icon} />
                    </TouchableOpacity>

                    <Text style={styles.title}>To Date </Text>

                    <TouchableOpacity style={styles.dateInputContainer} onPress={() => { setDatePickerType(datePickerTypes.to), setShowDatePicker(true) }}>
                        <Text style={styles.dateInputText}>
                            {ToDate ? ToDate : 'Select Date'}
                        </Text>
                        <Ionicons name="calendar" size={24} color="#00000070" style={styles.icon} />
                    </TouchableOpacity>





                    <TouchableOpacity style={styles.applyButton} onPress={() => {
                        onApply()
                    }}>
                        <Text style={styles.applyText}>Download</Text>
                    </TouchableOpacity>



                </View>

            {loading ?
                <LoaderModal visible={loading} />

                : null}

            {showDatePicker ? (
                <DateTimePicker
                    isVisible={showDatePicker}
                    value={DatePickerType == datePickerTypes.from ? moment(FromDate, DateFormat.YYYY_MM_DD).toDate() : DatePickerType == datePickerTypes.to ? moment(ToDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                    onConfirm={(date) => handleDateChange(date)}
                    onCancel={() => setShowDatePicker(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light"
                />
            ) : null}

            {isSuccessVisible ? <SuccessPopup /> : null}
            {errorPopupVisible ? <ErrorPopup /> : null}
            </View>
            </View>


        </Modal>
        </Portal>

    )
}

export default ExcelModal

const styles = StyleSheet.create({
    overlay: {
        width:'90%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:'white',
        alignSelf:'center',
        borderRadius:10
        // backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    popup: {
        width: '90%',
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    closeButton: { position: "absolute", right: 5, top: 5, zIndex: 2 },
    closeText: { fontSize: 18, color: "black", fontFamily: appFonts.Medium },
    title: { fontSize: 18, fontFamily: appFonts.SemiBold, marginBottom: 10, color: "black", },
    applyButton: { width: '45%', backgroundColor: appColor.primary, padding: 7, borderRadius: 5, alignItems: "center", marginTop: 20, alignSelf: 'center' },
    applyText: { color: "white", fontSize: 16, fontFamily: appFonts.Medium },
    container: { width: "100%" },
    label: { fontSize: 14, fontFamily: appFonts.Medium, marginBottom: 5 },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 15,
    },
    dropdownText: { fontSize: 16, color: "black", fontFamily: appFonts.Medium },
    dropdownMenu: { backgroundColor: '#00000010', marginTop: 2 },
    dropdownItem: { padding: 15 },
    dropdownItemText: { color: appColor.black, fontSize: 16 },
    dateInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 45,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
    },
    dateInputText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        fontFamily: appFonts.Medium
    },
    icon: {
        marginLeft: 8,
    },

})