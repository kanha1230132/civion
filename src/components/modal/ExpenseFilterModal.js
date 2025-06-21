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
import { expenseFilterTypes } from '../../Screens/Expenses';
const ExpenseFilterModal = ({ onClose ,onApply,projects,SelectedFilterType}) => {
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
        <Modal transparent={true} visible={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.popup}>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <MaterialIcons name="cancel" size={28} color="red" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>Filter by</Text>

                    <TouchableOpacity 
                        onPress={() => onApply(expenseFilterTypes.All)}
                    style={{
                        backgroundColor: SelectedFilterType == expenseFilterTypes.All ?'#00000005' : appColor.white,
                        marginTop:10

                    }}>
                        <Text style={{
                            fontSize:15,
                            color:appColor.black,
                            fontFamily:appFonts.Regular,
                            borderRadius:6,
                            paddingLeft:10,
                            paddingVertical:5
                        }}>All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onApply(expenseFilterTypes.Pending)}
                    
                    style={{
                        backgroundColor: SelectedFilterType == expenseFilterTypes.Pending ?'#00000005' : appColor.white,

                        marginTop:10

                    }}>
                        <Text style={{
                            fontSize:15,
                            color:appColor.black,
                            fontFamily:appFonts.Regular,
                            borderRadius:6,
                            paddingLeft:10,
                            paddingVertical:5
                        }}>Pending</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onApply(expenseFilterTypes.Rejected)}
                    
                    style={{
                        backgroundColor: SelectedFilterType == expenseFilterTypes.Rejected ?'#00000005' : appColor.white,

                        marginTop:10

                    }}>
                        <Text style={{
                            fontSize:15,
                            color:appColor.black,
                            fontFamily:appFonts.Regular,
                            borderRadius:6,
                            paddingLeft:10,
                            paddingVertical:5
                        }}>Rejected</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onApply(expenseFilterTypes.Approved)}
                    
                    style={{
                        backgroundColor: SelectedFilterType == expenseFilterTypes.Approved ?'#00000005' : appColor.white,

                        marginTop:10

                    }}>
                        <Text style={{
                            fontSize:15,
                            color:appColor.black,
                            fontFamily:appFonts.Regular,
                            borderRadius:6,
                            paddingLeft:10,
                            paddingVertical:5
                        }}>Approved</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onApply(expenseFilterTypes.DateFilter)}
                    
                    style={{
                        backgroundColor: SelectedFilterType == expenseFilterTypes.DateFilter ?'#00000005' : appColor.white,

                        marginTop:10
                    }}>
                        <Text style={{
                            fontSize:15,
                            color:appColor.black,
                            fontFamily:appFonts.Regular,
                            borderRadius:6,
                            paddingLeft:10,
                            paddingVertical:5
                        }}>By Date</Text>
                    </TouchableOpacity>
                   

                    
                    

                </View>
            </View>
          
        </Modal>
    )
}

export default ExpenseFilterModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    popup: {
        width: '50%',
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        position: 'absolute',
        top: 90,
        right: 15
        
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