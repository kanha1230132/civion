import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Alert,
	ActivityIndicator,
	BackHandler
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";
import { endPoints } from "../api/endPoints";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { appColor } from "../theme/appColor";
import { appFonts } from "../theme/appFonts";
import DateTimePicker from "react-native-modal-datetime-picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaWrapper } from "../../App";
import useKeyboard from "../hooks/useKeyboard";


export default function Daily64({ navigation }) {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [employeeName, setEmployeeName] = useState("");
	const [category, setCategory] = useState("");
	const [projectNumber, setProjectNumber] = useState("");
	const [expenditure, setExpenditure] = useState("");
	const [task, setTask] = useState("");
	
  const {keyboardOpen} = useKeyboard();
 useEffect(() => {
		const backAction = () => {
			navigation.goBack()
			return true;
		};
		const backHandler = BackHandler.addEventListener(
			'hardwareBackPress',
			backAction
		);
		return () => backHandler.remove();
	}, [navigation]);

	// Mock API Function
	const handleNext = async () => {
		try {
			const token = await AsyncStorage.getItem("userToken");
	
			if (!token) {
				Alert.alert("Error", "User not logged in");
				return;
			}
	
			const formData = {
				employeeName,
				startDate: startDate ? startDate.toISOString() : null,
				endDate: endDate ? endDate.toISOString() : null,
				category,
				expenditure,
				projectNumber,
				task,
			};
	
			const response = await axios.post(
				`${endPoints.BASE_URL}/expense/expense`, 
				formData, 
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
	
			if (response.status === 200) {
				console.log("Expense Created:", response.data);
				const expenseId = response.data.expenseId; // Get the ID for next step
				navigation.navigate("Daily65", { id: expenseId });
			} else {
				Alert.alert("Error", "Failed to save expense details.");
			}
		} catch (error) {
			console.log("Error submitting data:", error);
			Alert.alert("Error", "Could not save expense details.");
		}
	};
	
	useEffect(() => {
		setEmployeeName(""); // Keep fields empty
		setCategory("");
		setProjectNumber("");
		setExpenditure("");
		setTask("");
		setStartDate(null);
		setEndDate(null);
	
		
	}, []);
	

	const onChangeStartDate = (event, selectedDate) => {
		setShowStartDatePicker(false);
		if (selectedDate) {
			setStartDate(selectedDate);
		}
	};

	const onChangeEndDate = (event, selectedDate) => {
		setShowEndDatePicker(false);
		if (selectedDate) {
			setEndDate(selectedDate);
		}
	};

	const activeStep = 1;

	const handleProgressClick = (step) => {
		if (step === 2) {
			navigation.navigate("Daily65", {
				employeeName,
				startDate: startDate ? startDate.toISOString() : null,
				endDate: endDate ? endDate.toISOString() : null,
				category,
				expenditure,
				projectNumber,
				task,
			});
		}
	};


const insets = useSafeAreaInsets();


	return (
    <SafeAreaWrapper>
      <HeaderWithBackButton
        title="Add New Expense"
        onBackClick={() => navigation.goBack()}
      />

      {/* <ScrollView horizontal={false} style={styles.container}> */}
	  <ScrollView
  style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
						showsVerticalScrollIndicator={false}
						  keyboardShouldPersistTaps="handled"
						automaticallyAdjustKeyboardInsets={true} 
>
        <View>
          <Text style={styles.expenseDetailsTitle}>1. Expense Details</Text>

          <View style={styles.progressContainer}>
            {[1, 2].map((step, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  onPress={() => handleProgressClick(step)}
                  style={[
                    styles.progressCircle,
                    step === activeStep ? styles.activeCircle : {},
                  ]}
                >
                  <Text
                    style={[
                      styles.progressText,
                      step === activeStep ? styles.activeText : {},
                    ]}
                  >
                    {step}
                  </Text>
                </TouchableOpacity>
                {index < 1 && (
                  <View style={[styles.progressLine, styles.activeLine]} />
                )}
              </React.Fragment>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Expense Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Employee Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Employee Name"
              value={employeeName}
              onChangeText={setEmployeeName}
              placeholderTextColor="#aaa"
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  onPress={() => setShowStartDatePicker(true)}
                  style={styles.dateInputContainer}
                >
                  <Text
                    style={{
                      ...styles.dateInputText,
                      color: startDate ? "#000" : "#aaa",
                    }}
                  >
                    {startDate ? startDate.toLocaleDateString() : "Select"}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    testID="endDatePicker"
                    isVisible={showStartDatePicker}
                    value={startDate || new Date()}
                    mode={"date"}
                    onConfirm={(date) => onChangeStartDate(null, date)}
                    onCancel={() => setShowStartDatePicker(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light"
                  />
                )}
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity
                  onPress={() => setShowEndDatePicker(true)}
                  style={styles.dateInputContainer}
                >
                  <Text
                    style={{
                      ...styles.dateInputText,
                      color: endDate ? "#000" : "#aaa",
                    }}
                  >
                    {endDate ? endDate.toLocaleDateString() : "Select"}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    testID="endDatePicker"
                    isVisible={showEndDatePicker}
                    value={endDate || new Date()}
                    mode={"date"}
                    onConfirm={(date) => onChangeEndDate(null, date)}
                    onCancel={() => setShowEndDatePicker(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light"
                  />
                )}
              </View>
            </View>

            <Text style={styles.label}>Details of Expenditure</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Expenditure Details"
              value={expenditure}
              onChangeText={setExpenditure}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Overhead code/Project Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Project Number"
              value={projectNumber}
              onChangeText={setProjectNumber}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Category/SUBPRJ.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Category"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Category/Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Task"
              value={task}
              onChangeText={setTask}
              placeholderTextColor="#aaa"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            navigation.navigate("Daily65", {
              employeeName,
              startDate: startDate ? startDate.toISOString() : null, // Convert to string
              endDate: endDate ? endDate.toISOString() : null, // Convert to string
              category,
              expenditure,
              projectNumber,
              task,
            })
          }
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingBottom: 16,

	},
	headerContainer: {
		paddingTop: 45,
		paddingBottom: 10,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: -10,
	},
	headerText: {
		fontSize: 18,
		marginLeft: 5,
		fontWeight: "500",
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
		borderColor: "#d3d3d3",
		alignItems: "center",
		justifyContent: "center",
	},
	activeCircle: {
		borderColor: "#486ECD",
	},
	progressText: {
		fontSize: 16,
		color: "#000",
	},
	activeText: {
		color: "#486ECD",
	},
	progressLine: {
		height: 2,
		flex: 1,
		backgroundColor: "#d3d3d3",
	},
	activeLine: {
		backgroundColor: "#486ECD",
	},
	sectionTitle: {
		fontSize: 18,
		color: "#486ECD",
		fontFamily:appFonts.Medium,
		marginBottom: 20,
	},
	expenseDetailsTitle: {
		fontSize: 18,
		// fontWeight: "bold",
		fontFamily:appFonts.Medium,
		color: "#000",
		marginBottom: 10,
		marginTop:10
	},
	inputContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontFamily:appFonts.Medium,

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
		marginBottom: 12,
		fontFamily:appFonts.Medium,

		backgroundColor: "#fff",
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
		fontFamily:appFonts.Medium,
	},
	icon: {
		marginLeft: 8,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	halfInputContainer: {
		width: "48%",
	},
	nextButton: {
		backgroundColor: "#486ECD",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginBottom:50
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 18,
		fontFamily:appFonts.Medium,

	},
});