import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Dropdown from './dropDown';
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { appColor } from "../../theme/appColor";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import { DateFormat } from '../../utils/Constants';
import { set } from 'lodash';
import { appFonts } from '../../theme/appFonts';
import { SafeAreaView } from 'react-native-safe-area-context';
const FilterModal = ({ onClose ,onApply,projects,showFilterModal}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const handleFromDateChange = (selectedDate) => {
        if (selectedDate) {
            const date = moment(selectedDate).format(DateFormat.YYYY_MM_DD);
            setFromDate(date);
            setShowFromDatePicker(false);
        }
    };

    const handleToDateChange = (selectedDate) => {
        if (selectedDate) {
            const date = moment(selectedDate).format(DateFormat.YYYY_MM_DD);
            setToDate(date);
            setShowToDatePicker(false);
        }
    };
    return (
        <Modal transparent={true} visible={showFilterModal} animationType="fade">
            <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.overlay}>
                <View style={styles.popup}>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialIcons name="cancel" size={28} color="red" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>Filter by</Text>
                    <Dropdown
                        title="Project Name"
                        options={projects}
                        onSelect={(value) =>setSelectedProjectId(value._id)}
                        style={{fontFamily:appFonts.Medium}}
                        
                    />

                    <View style={styles.container}>
                        {/* Label */}
                        <Text style={styles.label}>Date Range</Text>

                        {/* Dropdown Button */}
                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setIsOpen(!isOpen)}>
                            <Text style={styles.dropdownText}>{(fromDate || toDate) ? fromDate + ' To ' + toDate : 'Select'}</Text>
                            <FontAwesome name={isOpen ? "chevron-up" : "chevron-down"} size={14} color="black" />
                        </TouchableOpacity>

                        {/* Dropdown Options */}
                        {isOpen && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowFromDatePicker(true)}>
                                    <Text style={styles.dateInputText}>
                                        {fromDate ? fromDate : 'From Date'}
                                    </Text>
                                    <Ionicons name="calendar" size={24} color="#00000070" style={styles.icon} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowToDatePicker(true)}>
                                    <Text style={styles.dateInputText}>
                                        {toDate ? toDate : 'To Date'}
                                    </Text>
                                    <Ionicons name="calendar" size={24} color="#00000070" style={styles.icon} />
                                </TouchableOpacity>


                            </View>
                        )}


                    </View>
                    <TouchableOpacity style={styles.applyButton} onPress={() =>  {
                        onApply(fromDate, toDate,selectedProjectId)
                        }}>
                        <Text style={styles.applyText}>Apply</Text>
                    </TouchableOpacity>

                </View>
            </View>
            {showFromDatePicker ? (
                // <DateTimePicker
                //     isVisible={showFromDatePicker}
                //     onCancel={() => setShowFromDatePicker(false)}
                //     onConfirm={(selectedDate) => handleFromDateChange(selectedDate)}
                //     value={fromDate ? moment(fromDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                //     mode="date"
                // />
                 <DateTimePicker
                                        isVisible={showFromDatePicker}
                                        value={fromDate ? moment(fromDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                                        onConfirm={(date) => handleFromDateChange(date)}
                                        onCancel={() => setShowFromDatePicker(false)}
                                        textColor="black" // Force text color (iOS 14+)
                                        themeVariant="light"
                                    />
            ) : null}

            {showToDatePicker ? (
                // <DateTimePicker
                //     isVisible={showToDatePicker}
                //     onCancel={() => setShowToDatePicker(false)}
                //     onConfirm={(selectedDate) => handleToDateChange(selectedDate)}
                //     value={toDate ? moment(toDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                //     mode="date"
                // />
                <DateTimePicker
                isVisible={showToDatePicker}
                value={toDate ? moment(toDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                onConfirm={(date) => handleToDateChange(date)}
                onCancel={() => setShowToDatePicker(false)}
                textColor="black" // Force text color (iOS 14+)
                themeVariant="light"
            />
            ) : null}
            </SafeAreaView>
        </Modal>
    )
}

export default FilterModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
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
    closeButton: { position: "absolute", right: 5, top: 5,zIndex:2},
    closeText: { fontSize: 18, color: "black",fontFamily:appFonts.Medium },
    title: { fontSize: 18, fontFamily:appFonts.Medium, marginBottom: 10, color: "black", textAlign: 'left' },
    applyButton: { width: '45%', backgroundColor: appColor.primary, padding: 7, borderRadius: 5, alignItems: "center", marginTop: 20, alignSelf: 'center' },
    applyText: { color: "white", fontSize: 16, fontFamily:appFonts.Medium },
    container: { width: "100%" },
    label: { fontSize: 14, fontFamily:appFonts.Medium, marginBottom: 5 },
    dropdownButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 15,
    },
    dropdownText: { fontSize: 16, color: "black" ,fontFamily:appFonts.Medium},
    dropdownMenu: { backgroundColor: '#00000010', marginTop: 2 },
    dropdownItem: { padding: 15 },
    dropdownItemText: { color: appColor.black, fontSize: 16,fontFamily:appFonts.Medium },
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
        fontFamily:appFonts.Medium
    },
    icon: {
        marginLeft: 8,
    },

})