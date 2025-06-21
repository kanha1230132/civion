import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { appFonts } from "../../../../theme/appFonts";
import CustomTextInput from "../../../../components/CustomTextInput";

export default function VisitorDetails({ dailyEntry, setDailyEntry }) {
    const navigation = useNavigation();

    // Initialize visitors from context or with a default visitor object if no data exists
    const [visitors, setVisitors] = useState(() => {
        if (dailyEntry.visitors && dailyEntry.visitors.length > 0) {
            return dailyEntry.visitors;
        } else {
            return [{ visitorName: "", company: "", quantity: "", hours: "", totalHours: "" }];
        }
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [currentPicker, setCurrentPicker] = useState({
        visitorIndex: null,
        field: null,
    });

    // Update the context whenever the visitors state changes
    useEffect(() => {
        setDailyEntry((prevData) => ({
            ...prevData,
            visitors, // Always update visitors in the context
        }));
    }, [visitors]);


    const addNewVisitor = () => {
        setVisitors((prevVisitors) => [
            ...prevVisitors,
            { visitorName: "", company: "", quantity: "", hours: "", totalHours: "" },
        ]);
    };

    const removeVisitor = (visitorIndex) => {
        setVisitors((prevVisitors) =>
            prevVisitors.filter((_, index) => index !== visitorIndex)
        );
    };

    const updateVisitor = (visitorIndex, field, value) => {
        setVisitors((prevVisitors) => {
            return prevVisitors.map((visitor, index) => {
                if (index === visitorIndex) {
                    let updatedVisitor = { ...visitor, [field]: value };

                    // Ensure visitorName is used correctly
                    if (field === "name") {
                        updatedVisitor.visitorName = value; // Convert "name" to "visitorName"
                    }

                    // Calculate totalHours if quantity or hours are updated
                    if (field === "quantity" || field === "hours") {
                        const quantity = parseInt(updatedVisitor.quantity || '0', 10);
                        const hours = parseInt(updatedVisitor.hours || '0', 10);
                        updatedVisitor.totalHours = (quantity * hours).toString();
                    }

                    return updatedVisitor;
                }
                return visitor;
            });
        });
    };

    const openPicker = (visitorIndex, field) => {
        setCurrentPicker({ visitorIndex, field });
        setModalVisible(true);
    };

    const selectValue = (value) => {
        const { visitorIndex, field } = currentPicker;
        if (visitorIndex !== null && field) {
            updateVisitor(visitorIndex, field, value.toString());
        }
        setModalVisible(false);
    };

    console.log("UserID before sending:", dailyEntry.userId);
    console.log("ProjectID before sending:", dailyEntry.projectId);



    const handlePrevious = () => {
        navigation.navigate("Daily75"); // Fix: Ensuring function exists
    };

    return (
        <View style={{marginBottom:70}}>

            <Text style={[styles.sectionTitle, { fontWeight: "bold" }]}>
                Worked Visited By
            </Text>
            {visitors.map((visitor, visitorIndex) => (
                <View key={visitorIndex} style={styles.formGroupOuterBoxWithBorder}>
                    {/* Visitor Heading */}
                    <Text style={styles.visitorLabel}>Visitor - {visitorIndex + 1}</Text>

                    <View
                        style={[styles.formGroup, styles.reducedSpacing, styles.inputRowContainer,{ width:'100%'}]}
                    >
                        <View style={{ width: visitorIndex > 0 ? '92%' :'100%',}}>
                            <CustomTextInput onChangeTextValue={(text) => updateVisitor(visitorIndex, "visitorName", text)} textValue={visitor.visitorName} label="Visitor Name/Role" />
                        </View>
                        
                        {/* Red "-" Icon for removing entry */}
                        {visitorIndex > 0 && (
                            <TouchableOpacity
                                onPress={() => removeVisitor(visitorIndex)}
                                style={[styles.deleteLabourButton,{
                                    width:'8%',
                                   justifyContent:'center',
                               alignItems:'center'}]}
                            >
                                <Ionicons name="remove-circle" size={24} color="red" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={[styles.formGroup, styles.reducedSpacing]}>
                    <CustomTextInput onChangeTextValue={(text) => updateVisitor(visitorIndex, "company", text)} textValue={visitor.company} label="Visitor's Company" />
                    </View>

                    {/* Additional fields for Quantity, Hours, and Total Hours */}
                    <View style={styles.formGroupRowAligned}>
                        {/* Quantity */}
                        <View
                            style={[
                                styles.formGroupEqualPickerAligned,
                                styles.equalSizeBox,
                            ]}
                        >
                            <Text style={styles.label}>Quantity</Text>
                            <TouchableOpacity
                                style={[
                                    styles.input,
                                    styles.dropdownButton,
                                    styles.inputSpacingSmall,
                                    styles.blackBackground,
                                ]}
                                onPress={() => openPicker(visitorIndex, "quantity")}
                            >
                                <Text style={styles.dropdownText}>{visitor.quantity || ""}</Text>
                                {!visitor.quantity && (
                                    <MaterialIcons
                                        name="arrow-drop-down"
                                        size={24}
                                        color="black"
                                        style={styles.dropdownIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Hours */}
                        <View
                            style={[
                                styles.formGroupEqualPickerAligned,
                                styles.equalSizeBox,
                            ]}
                        >
                            <Text style={styles.label}>Hours</Text>
                            <TouchableOpacity
                                style={[
                                    styles.input,
                                    styles.dropdownButton,
                                    styles.inputSpacingSmall,
                                    styles.blackBackground,
                                ]}
                                onPress={() => openPicker(visitorIndex, "hours")}
                            >
                                <Text style={styles.dropdownText}>{visitor.hours || ""}</Text>
                                {!visitor.hours && (
                                    <MaterialIcons
                                        name="arrow-drop-down"
                                        size={24}
                                        color="black"
                                        style={styles.dropdownIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Total Hours */}
                        <View
                            style={[
                                styles.formGroupEqualPickerAligned,
                                styles.equalSizeBox,
                            ]}
                        >
                            <Text style={[styles.label,{fontSize:14}]}>Total Hours</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.dropdownButton,
                                    styles.inputSpacingSmall,
                                    styles.blackBackground,
                                ]}
                                value={visitor.totalHours || ""}
                                editable={false}
                                placeholder="Ex:10 Hrs"
                                placeholderTextColor="lightgrey"
                            />
                        </View>
                    </View>
                </View>
            ))}

            <View style={styles.addButtonContainerRight}>
                <TouchableOpacity style={styles.addButton} onPress={addNewVisitor}>
                    <Ionicons name="add-circle-outline" size={24} color="#486ECD" />
                    <Text style={styles.addButtonText}>Add New</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContentSmall}>
                        <FlatList
                            data={[...Array(25).keys()].map((item) => item + 1)}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => selectValue(item)}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={true}
                            style={{ maxHeight: 200 }}
                        />

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    equalInputSize: {
        flex: 1,
        marginHorizontal: 5,
    },
    flexConsistentInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "#ffffff",
    },
    scrollContentContainer: {
        paddingBottom: 100,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 15,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: "Roboto",
        marginLeft: 10,
        fontWeight: "bold",
        color: "#333",
    },
    headerRightContainer: {
        alignItems: "flex-end",
    },
    seeAll: {
        color: "#486ECD",
        fontSize: 16,
        fontFamily: "Roboto",
    },
    projectDetailsContainer: {
        marginBottom: 8,
    },
    projectDetailsTitle: {
        fontSize: 18,
        fontFamily: "Roboto",
        color: "#333",
        fontWeight: "bold",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 15,
    },
    progressCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#e0e0e0",
        borderWidth: 2,
        borderColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    lightGreyCircle: {
        borderColor: "#d3d3d3", // Light grey border
        backgroundColor: "#e0e0e0", // White background
    },
    blackText: {
        color: "#000000", // Black text
    },

    activeCircle: {
        borderColor: "#486ECD",
    },
    completedCircle: {
        borderColor: "#486ECD",
    },
    futureCircle: {
        borderColor: "#e0e0e0",
    },
    darkGreyCircle: {
        borderColor: "#a9a9a9",
    },
    progressText: {
        fontSize: 16,
        color: "#000",
        fontFamily: "Roboto",
    },
    activeText: {
        color: "#486ECD",
    },
    completedText: {
        color: "#486ECD",
    },
    futureText: {
        color: "#e0e0e0",
    },
    darkGreyText: {
        color: "#a9a9a9",
    },
    progressLine: {
        height: 2,
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    completedLine: {
        backgroundColor: "#486ECD",
    },
    futureLine: {
        backgroundColor: "#e0e0e0",
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Roboto",
        color: "#486ECD",
        marginBottom: 15,
    },
    formGroupOuterBoxWithBorder: {
        borderWidth: 1,
        borderColor: "#d3d3d3",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    visitorLabel: {
        fontSize: 16,
        fontFamily: "Roboto",
        color: "#333",
        marginBottom: 10,
        fontWeight: "500",
    },
    formGroup: {
        marginBottom: 8,
    },
    reducedSpacing: {
        marginBottom: 5,
    },
    inputRowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    formGroupRowAligned: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    formGroupEqualPickerAligned: {
        flex: 1,
        marginHorizontal: 5,
    },
    equalSizeBox: {
        // flex:1,
        width: "100%",
    },
    label: {
        marginBottom: 4,
        fontSize: 16,
        fontFamily: appFonts.Medium,
        color: "#333",
    },
    dropdownButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    selectedDropdown: {
        paddingRight: 40,
    },
    dropdownText: {
        fontSize: 16,
        fontFamily: appFonts.Medium,
        color: "#000",
        // flex: 1,
    },
    placeholderText: {
        color: "grey",
    },
    selectedText: {
        color: "black",
    },
    dropdownIcon: {
        marginLeft: "auto",
    },
    input: {
        borderWidth: 1,
        borderColor: "#000000",
        paddingHorizontal:10,
        borderRadius: 8,
        fontSize: 16,
        fontFamily: appFonts.Medium,
        backgroundColor: "#ffffff",
        color: "#000000",
    },
    totalHoursInput: {
        textAlign: "center",
    },
    inputSpacingSmall: {
        // marginBottom: 8,
    },
    blackBackground: {
        backgroundColor: "#ffffff",
        color: "#000000",
    },
    addButtonContainerRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#486ECD',
        borderRadius: 8,
        paddingVertical: 7,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    addButtonText: {
        marginLeft: 5,
        color: "#486ECD",
         fontFamily: appFonts.Medium,
        fontSize: 16,
    },
    deleteLabourButton: {
        marginTop: 17,
    },
    navigationButtonsContainerBottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    previousButton: {
        flex: 0.48,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#486ECD",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    previousButtonText: {
        color: "#486ECD",
        fontFamily: appFonts.Medium,
        fontSize: 18,
      
    },
    nextButton: {
        flex: 0.48,
        backgroundColor: "#486ECD",
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    nextButtonText: {
        color: "#ffffff",
        fontFamily: appFonts.Medium,
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContentSmall: {
        width: 250,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    modalItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    modalItemText: {
        fontSize: 16,
        fontFamily: appFonts.Medium,
        textAlign: "center",
    },
    closeButton: {
        marginTop: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#486ECD",
        fontSize: 16,
        fontFamily: appFonts.Medium,
    },
    blackBorder: {
        borderColor: "black",
    },
});