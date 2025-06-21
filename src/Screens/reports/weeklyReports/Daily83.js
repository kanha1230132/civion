import React, { useState, useEffect, useContext } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { endPoints } from "../../../api/endPoints";
import { ProjectContext } from "../../../utils/ProjectContext";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import { DateFormat, screenHeight } from '../../../utils/Constants'
import apiClient from '../../../api/apiClient'
import { SCREENS } from "../../../utils/ScreenNames";
import HeaderWithBackButton from "../../../components/HeaderWithBackButton";
import { appFonts } from "../../../theme/appFonts";
import { appColor } from "../../../theme/appColor";
import CustomButton from "../../../components/button/CustomButton";

const Daily83 = ({ route, navigation }) => {
	const { weeklyReport,setWeeklyReport } = useContext(ProjectContext)
	const [selectedDay, setSelectedDay] = useState("");
	const [weekDays, setWeekDays] = useState([]);
	// Date Picker State
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	
	const [loading, setLoading] = useState(false);


	/** @kanhaiyaLal */
	const isFocused = useIsFocused();
	const [weeklyList, setWeeklyList] = useState({})
	const [WeeklyReports, setWeeklyReports] = useState();
	const [selectedEntry, setSelectedEntry] = useState();
	const [dailyDiaries, setDailyDiaries] = useState([]);
	const [dailyEntries, setDailyEntries] = useState([])

	useEffect(() => {
		if (isFocused) {
			console.log("Call effect ............", weeklyReport);
			setWeeklyList(weeklyReport);
		}
	}, [isFocused])

	// API Call to Fetch Weekly Data
	const fetchWeeklyData = async () => {
		if (!weeklyList) return;
		const { projectId, userId } = weeklyList;
		if (!startDate || !endDate || !projectId || !userId) {
			Alert.alert("Error", "Project ID, User ID, and date range are required.");
			return;
		}
		const param = {
			projectId,
			userId,
			startDate: moment(startDate).format(DateFormat.YYYY_MM_DD),
			endDate: moment(endDate).format(DateFormat.YYYY_MM_DD)
		}
		setLoading(true);
		try {
			const response = await apiClient.post(endPoints.URL_GET_WEEKLY_ENTRY, param);
			if (response.status == 200 || response.status == 201) {
				const output = response.data;
				if (output.status == 'success') {
					const list = output.data;
					const map = new Map();
					const dailyEntries = list?.linkedDailyEntries;
					const dailyDiaries = list?.linkedDailyDiaries;
					const dailyReportEntries = [];
					const dailyDairyReportEntries = [];
					

					if (dailyEntries?.length > 0) {
						for (let entry of dailyEntries) {
							const date = moment(entry?.selectedDate).format(DateFormat.YYYY_MM_DD);
							if (!map.has(date)) {
								entry["IsDailyEntry"] = true
								entry["IsChargable"] = true;
								dailyReportEntries.push(entry);
								setDailyEntries(dailyReportEntries);
								map.set(date, entry);
							}
						}
					}

					if (dailyDiaries?.length > 0) {
						for (let diary of dailyDiaries) {
							const date = moment(diary?.selectedDate).format(DateFormat.YYYY_MM_DD);
							if (!map.has(date)) {
								diary["IsDailyEntry"] = false
								diary["IsChargable"] = true;
								dailyDairyReportEntries.push(diary);
								setDailyDiaries(dailyDairyReportEntries);
								map.set(date, diary);
							}
						}
					}

					
					setWeeklyReports(map);
					if (weekDays?.length > 0) {
						callToSelectedDay(weekDays[0]);
					}
					console.log("map : ",Array.from(map.values()));
				}
			} else {
				Alert.alert("Error", response?.data?.message || "Failed to fetch data.");
			}
			setLoading(false);
		} catch (error) {
			Alert.alert("Error", error.response?.data?.message || "Failed to fetch data.");
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};



	// Handle Start Date Selection
	const onChangeStartDate = (event, selectedDate) => {
		setShowStartDatePicker(false);
		if (selectedDate) {
			setStartDate(selectedDate);
			generateWeekDays(selectedDate, endDate);
		}
	};

	// Handle End Date Selection
	const onChangeEndDate = (event, selectedDate) => {
		setShowEndDatePicker(false);
		if (selectedDate) {
			setEndDate(selectedDate);
			generateWeekDays(startDate, selectedDate);
		}
	};

	// Generate Week Days Based on Selected Dates
	const generateWeekDays = (start, end) => {
		if (!start || !end) return;
		const days = [];
		const currentDate = new Date(start);
		while (currentDate <= end) {
			days.push({
				day: currentDate.toLocaleDateString("en-US", { weekday: "short" }),
				date: currentDate.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }),
			});
			currentDate.setDate(currentDate.getDate() + 1);
		}
		setWeekDays(days);
		setSelectedDay(days[0]?.date || "");

	};

	// Call API when Start and End Dates are Selected
	useEffect(() => {
		if (startDate && endDate) {
			fetchWeeklyData();
		}
	}, [startDate, endDate, weeklyList]);


	const callToSelectedDay = (day) => {
		setSelectedDay(day.date);
		const parsedDate = moment(day.date, "MM/DD");

		console.log(parsedDate.format(DateFormat.YYYY_MM_DD));
		console.log("WeeklyReports : ",JSON.stringify(WeeklyReports));
		if (WeeklyReports?.size > 0) {
			const dailyEntry = WeeklyReports.get(parsedDate.format(DateFormat.YYYY_MM_DD));
			if (dailyEntry) {
				// console.log("dailyEntry : ", JSON.stringify(dailyEntry));
				setSelectedEntry(dailyEntry);
			} else {
				setSelectedEntry({});
			}
		}
	};


	const callToNext = ()=>{
		if(!startDate || !endDate) {
			Alert.alert("Error", "Please select start date and end date.");
			return;
		}
		const {logo,siteInspectorTimeIn,siteInspectorTimeOut, reportDate,cityProjectManager, consultantProjectManager, contractProjectManager, contractorSiteSupervisorOnshore, contractorSiteSupervisorOffshore, contractAdministrator, supportCA, siteInspector, projectName, projectId, userId, projectNumber, contractNumber, owner } = weeklyReport
		
		const weeklyJSON = {
			startDate: moment(startDate).format(DateFormat.YYYY_MM_DD),
			endDate: moment(endDate).format(DateFormat.YYYY_MM_DD),
			projectId,
			userId,
			projectName,
			projectNumber,
			contractNumber,
			owner,
			cityProjectManager,
			consultantProjectManager,
			contractProjectManager,
			contractorSiteSupervisorOnshore,
			contractorSiteSupervisorOffshore,
			contractAdministrator,
			supportCA,
			siteInspector,
			dailyDiaries,
			dailyEntries,
			siteInspectorTimeIn ,
							siteInspectorTimeOut ,
			reportDate: moment(reportDate).format(DateFormat.YYYY_MM_DD),
			logo
		}
		console.log("weeklyJSON : ", weeklyJSON);
		setWeeklyReport(weeklyJSON);
		navigation.navigate(SCREENS.WEEKLY_REPORT_CONFIRM, setWeeklyReport)
	}


	return (
		<KeyboardAvoidingView
					style={{ flex: 1, marginBottom: 10,backgroundColor: "white",paddingTop: 10 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
			{/* Header Section */}
			<HeaderWithBackButton title={"Project " +weeklyList?.projectNumber + " - " + weeklyList?.projectName} onBackClick={() => navigation.goBack()}/>
			

			<Text style={styles.sectionTitle}>Selected week</Text>

			{/* Date Range Pickers with Calendar Icon */}
			<View style={styles.rowContainer}>
				<View style={styles.halfInputContainer}>
					<Text style={styles.label}>Start Date</Text>
					<TouchableOpacity
						onPress={() => setShowStartDatePicker(true)}
						style={styles.dateInputContainer}>
						<Text
							style={{
								...styles.dateInputText,
								color: startDate ? "#000" : "#aaa",
							}}>
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
							testID="startDatePicker"
							value={startDate || new Date()}
							mode="date"
							display="default"
							onChange={onChangeStartDate}
						/>
					)}
				</View>
				<View style={styles.halfInputContainer}>
					<Text style={styles.label}>End Date</Text>
					<TouchableOpacity
						onPress={() => setShowEndDatePicker(true)}
						style={styles.dateInputContainer}>
						<Text
							style={{
								...styles.dateInputText,
								color: endDate ? "#000" : "#aaa",
							}}>
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
							value={endDate || new Date()}
							mode="date"
							display="default"
							onChange={onChangeEndDate}
						/>
					)}
				</View>
			</View>

			{/* Horizontal Scroll for Days */}
			<View>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.dateScroll}>
					{weekDays.map((day, index) => (
						<TouchableOpacity
							key={index}
							style={styles.nameContainer}
							onPress={() => callToSelectedDay(day)}>
							<Text
								style={[
									styles.nameText,
									selectedDay === day.date && styles.activeNameText,
								]}>
								{day.day}-{day.date}
							</Text>
							<View
								style={[
									styles.underline,
									selectedDay === day.date && styles.activeUnderline,
								]}
							/>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>
			

			{/* Activity Section - Now Populated with Data from API */}
			<View style={styles.activityContainer}>
				<Text style={styles.activityTitle}>Activities for Selected Dates:</Text>
				{loading ? <ActivityIndicator size="large" color="#486ECD" /> : <Text style={styles.activityDescription}>{selectedEntry?.description}</Text>}
			</View>

			{/* Details Buttons */}
			{
				selectedEntry?.IsDailyEntry ?
					<View style={styles.detailsContainer}>
						{
							selectedEntry?.labours?.length > 0 ?
								<TouchableOpacity
									style={styles.detailsButton}
									onPress={() => navigation.navigate(SCREENS.LABOUR_DETAILS, { labourDetails: selectedEntry?.labours })}>
									<Text>View Labour Details</Text>
								</TouchableOpacity>
								: null
						}
						{
							selectedEntry?.equipments?.length > 0 ?
								<TouchableOpacity
									style={styles.detailsButton}
									onPress={() => navigation.navigate(SCREENS.EQUIMENTS_DETAILS, { equipmentDetails: selectedEntry?.equipments })}>
									<Text>View Equipment Details</Text>
								</TouchableOpacity>
								: null
						}

						{
							selectedEntry?.visitors?.length > 0 ?
								<TouchableOpacity
									style={styles.detailsButton}
									onPress={() => navigation.navigate(SCREENS.VISITOR_DETAILS, { visitorDetails: selectedEntry?.visitors })}>
									<Text>View Visitor Details</Text>
								</TouchableOpacity>
								: null
						}

						{
							selectedEntry?.description ?

								<TouchableOpacity
									style={styles.detailsButton}
									onPress={() => navigation.navigate(SCREENS.DESCRIPTION_DETAILS, { description: selectedEntry?.description })}>
									<Text>View Project Description</Text>
								</TouchableOpacity>
								: null
						}

					</View>
					: null
			}


			{/* Bottom Navigation Buttons */}
			<View style={styles.buttonContainer} gap={10} >

				<CustomButton textColor={appColor.primary} title="Previous" bgColor={appColor.white} onCick={() => navigation.goBack()} />
				<CustomButton title="Next" onCick={() =>callToNext()} />
				
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	headerContainer: {
		paddingTop: 20,
		paddingBottom: 10,
		paddingHorizontal: 10,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerText: {
		fontSize: 18,
		marginLeft: 5,
		fontFamily:appFonts.SemiBold,
	},
	sectionTitle: {
		fontSize: 18,
		color: appColor.black,
		fontFamily:appFonts.SemiBold,
		marginVertical: 10,
		marginHorizontal: 16,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
		marginHorizontal: 16,
	},
	halfInputContainer: {
		width: "48%",
	},
	label: {
		fontSize: 16,
		fontFamily:appFonts.Medium,
		color: "#000",
		marginBottom: 4,
	},
	dateInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		height: 45,
		borderColor: "#000",
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 8,
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
	dateScroll: {
		paddingHorizontal: 16,
		marginBottom: 10,
	},
	nameContainer: {
		alignItems: "center",
		marginRight: 15,
	},
	nameText: {
		fontSize: 16,
		color: "#333",
		fontFamily:appFonts.Medium,

	},
	activeNameText: {
		color: "#486ECD",
		fontFamily:appFonts.Medium,


	},
	underline: {
		height: 2,
		width: "100%",
		backgroundColor: "#D3D3D3",
		marginTop: 5,
	},
	activeUnderline: {
		backgroundColor: "#486ECD",
	},
	activityContainer: {
		paddingHorizontal: 16,
		marginBottom: 50,
		minHeight: 150,
	},
	activityTitle: {
		fontSize: 16,
		fontFamily:appFonts.Medium,

		marginBottom: 8,
		color: "#000",
	},
	activityDescription: {
		fontSize: 16,
		lineHeight: 20,
		color: "#333",
	},
	detailsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginBottom: 16,
		paddingHorizontal: 16,
	},
	detailsButton: {
		backgroundColor: "#d9e7ff",
		padding: 12,
		borderRadius: 8,
		width: "48%",
		alignItems: "center",
		marginBottom: 10,
	},
	buttonContainer: {
		position: "absolute",
		top:screenHeight-80,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 20,
	},
	previousButton: {
		flex: 1,
		marginRight: 8,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#486ECD",
		borderRadius: 8,
		alignItems: "center",
	},
	previewButton: {
		flex: 1,
		marginLeft: 8,
		paddingVertical: 12,
		backgroundColor: "#486ECD",
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#486ECD",
	},
	previewButtonText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
	},
});

export default Daily83;