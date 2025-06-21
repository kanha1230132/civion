import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { appFonts } from '../../../theme/appFonts';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useErrorPopupContext } from '../../../context/PopupProvider';
import { endPoints } from '../../../api/endPoints';
import apiClient from '../../../api/apiClient';
import { Constants } from '../../../utils/Constants';
import { Ionicons } from '@expo/vector-icons';

const ExpenseCategory = ({ expenseEntry, setExpenseEntry }) => {
    const [mileageAmount, setMileageAmount] = useState('');
    const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
    useEffect(() => {
        // fetchMileageAmount()
    }, [])

    const fetchMileageAmount = async () => {
        try {
            console.log("Callling fetchMileageAmount");
            const userId = await AsyncStorage.getItem(Constants.USER_ID);
            if (!userId) {
                showErrorPopup("User id Not Found");
                return;
            }
            const url = `${endPoints.URL_MILAGE_HISTRY}/${userId}`;
            const response = await apiClient.get(url);
            console.log("fetchMileageAmount :", response);
            if (response.status === 200) {
                if (Array.isArray(response.data) && response.data.length > 0) {
                    response.data.forEach(trip => {
                        console.log("Trip Data:", JSON.stringify(trip, null, 2));
                    });

                    const mileageTotal = response.data.reduce((acc, trip) => {
                        const expenses = parseFloat(trip.expenses) || 0; // Parse as float
                        return acc + expenses;
                    }, 0);

                    setMileageAmount(typeof mileageTotal === 'number' ? mileageTotal : 0);
                } else {
                    setMileageAmount(0);
                }
            } else {
                setMileageAmount(0);
                showErrorPopup(response?.data?.message || 'Something went wrong');
            }
        } catch (error) {
            showErrorPopup(error?.response?.data?.message);
            setMileageAmount(0);
        }
    };

    return (
        <>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.expenseInfoBox}
            >
                <Text style={styles.mileageText}>Mileage Expenses:</Text>
                <Text style={styles.mileageDates}>
                    {expenseEntry?.startDate} to {expenseEntry?.endDate}
                </Text>
                <Text style={[styles.mileageAmount, styles.alignRight]}>
                    Mileage: {typeof mileageAmount === 'number' ? `$${mileageAmount.toFixed(2)}` : "Loading..."}
                </Text>
            </LinearGradient>



            {expenseEntry?.expenses?.map((expense, index) => (
                <View key={index} style={styles.expenseEntryWrapper}>
                    <View style={styles.expenseEntry}>

                        {/* Conditionally render the remove button */}
                        {!expense.isInitial && (
                            <TouchableOpacity style={styles.removeButton} onPress={() => removeExpense(index)}>
                                <Ionicons name="remove-circle" size={24} color="red" />
                            </TouchableOpacity>
                        )}

                        <Text style={styles.categoryHeader}>
                            {expense.category || `Category ${index + 1}`}
                        </Text>

                        <Text style={styles.inputHeading}>Expense Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Transportation/Hotel/Meals/Misc"
                            value={expense.title}
                            onChangeText={(value) => updateExpense(index, "title", value)}
                        />

                        <Text style={styles.inputHeading}>Enter Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: $0.00"
                            keyboardType="numeric"
                            value={expense.amount}
                            onChangeText={(value) => updateExpense(index, "amount", value)}
                        />

                        {/* Picture box with image options */}
                        <TouchableOpacity
                            style={styles.pictureBox}
                            onPress={() => showImageOptions(index)}
                        >
                            <Ionicons
                                name="camera"
                                size={24}
                                color="#8E8E93"
                                style={styles.icon}
                            />
                            <Text style={styles.pictureText}>
                                {expense.image ? "Edit Picture" : "Click here to add a Picture"}
                            </Text>
                        </TouchableOpacity>

                        {/* Show image preview if available */}
                        {expense.image && (
                            <View style={styles.imagePreviewContainer}>
                                <TouchableOpacity onPress={() => handleImagePress(expense.image)}>
                                    <Image source={{ uri: expense.image }} style={styles.imagePreview} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            ))}

        </>
    )
}

export default ExpenseCategory

const styles = StyleSheet.create({
    expenseInfoBox: {
        padding: 10,
        // backgroundColor: "#486ECD",
        borderRadius: 10,
        marginBottom: 20,
    },
    mileageText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: appFonts.SemiBold

    },
    mileageDates: {
        color: "#FFFFFF",
        fontSize: 14,
        marginBottom: 1,
        fontFamily: appFonts.Regular,
        marginVertical: 3

    },
    mileageAmount: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: appFonts.Medium
    },
    categorySection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
    },
    expenseInfoBox: {
        padding: 10,
        backgroundColor: "#486ECD",
        borderRadius: 10,
        marginBottom: 20,
    },
    mileageText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    mileageDates: {
        color: "#FFFFFF",
        fontSize: 13,
        marginBottom: 1,
    },
    mileageAmount: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    categoryHeader: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#000000",
        color: "#000000",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    imagePreviewContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d3d3d3",
    },
    pictureBox: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 8,
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    pictureText: {
        color: "#000000",
    },
    addButton: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#486ECD",
        alignSelf: "flex-end",
        marginBottom: 100,
    },
    addButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    addButtonIcon: {
        marginRight: 5,
    },
    addButtonText: {
        color: "#486ECD",
        fontSize: 16,
        fontWeight: "bold",
    },
    totalSectionBox: {
        backgroundColor: "#E5EDFB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 5,
    },
    previousButton: {
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingVertical: 10,
        borderRadius: 8,
        flex: 0.45,
        borderWidth: 1,
        borderColor: "#486ECD",
    },
    previousButtonText: {
        color: "#486ECD",
        fontSize: 16,
        fontWeight: "600",
    },
    submitButton: {
        alignItems: "center",
        backgroundColor: "#486ECD",
        paddingVertical: 10,
        borderRadius: 8,
        flex: 0.45,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    expenseEntryWrapper: {
        borderWidth: 1,
        borderColor: "#d3d3d3",
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    // expenseEntry: {
    //     position: 'relative',
    // }
})