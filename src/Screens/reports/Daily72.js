import React, { useContext, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Animated,
	Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomToolbar from "../BottomToolbar";
import { ProjectContext } from "../../utils/ProjectContext";
import { useIsFocused } from "@react-navigation/native";
import { SCREENS } from "../../utils/ScreenNames";
import { screenHeight, TypeReports } from "../../utils/Constants";
import { appFonts } from "../../theme/appFonts";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColor } from "../../theme/appColor";

const Daily72 = ({ navigation }) => {
	const cloudAnimation = useRef(new Animated.Value(0)).current;
	const { setWeeklyReport, setPhotoSelect, setInvoiceReport } = useContext(ProjectContext);
	const isFocused = useIsFocused();

	useEffect(() => {
		if (isFocused) {
			setWeeklyReport(undefined);
			setInvoiceReport(undefined);
			setPhotoSelect(undefined)
		}
	}, [isFocused]);

	useEffect(() => {
		Animated.loop(
			Animated.timing(cloudAnimation, {
				toValue: 1,
				duration: 10000,
				useNativeDriver: false,
			})
		).start();
	}, [cloudAnimation]);

	const cloudInterpolation = cloudAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: ["-20%", "120%"],
	});


	return (
		<SafeAreaView style={styles.container}>
			<ScrollView style={{ flex: 1 }} >
				<Text style={styles.headerLeftBlue}>Reports</Text>
				<View style={styles.iconContainer}>
					{/* Moving Clouds */}
					<Animated.View style={[styles.cloud, { left: cloudInterpolation }]}>
						<FontAwesome name="cloud" size={50} color="#d3d3d3" />
					</Animated.View>
					<Animated.View style={[styles.cloud, { right: cloudInterpolation }]}>
						<FontAwesome name="cloud" size={40} color="#d3d3d3" />
					</Animated.View>
					{/* Main Image */}
					<Image
						source={require("../../Assets/Reports.png")}
						style={styles.reportImage}
					/>
				</View>

				<View style={{
					width: '100%',
					// position: "absolute",
					// bottom: 100,
					marginTop:50
				}}>
					{/* Add a Daily Entry Button */}
					<TouchableOpacity
						style={styles.entryButtonModifiedLarge}
						onPress={() => navigation.navigate(SCREENS.PROJECT_LIST_SCREEN, { ScreenName: TypeReports.DAILY })}
					>
						<Text style={styles.entryButtonTextModified}>Add a Daily Entry</Text>
						<FontAwesome name="arrow-right" size={16} color={appColor.primary} />
					</TouchableOpacity>

					{/* View Weekly Entries Button */}
					<TouchableOpacity
						style={styles.entryButtonModifiedLarge}
						onPress={() => navigation.navigate(SCREENS.PROJECT_LIST_SCREEN, { ScreenName: TypeReports.WEEKLY })}>
						<Text style={styles.entryButtonTextModified}>
							Add a Weekly Entry
						</Text>
						<FontAwesome name="arrow-right" size={16} color={appColor.primary} />
					</TouchableOpacity>

					{/* Daily Diary Button */}
					<TouchableOpacity
						style={styles.entryButtonModifiedLarge}
						onPress={() => navigation.navigate(SCREENS.PROJECT_LIST_SCREEN, { ScreenName: TypeReports.DAIRY })}>
						<Text style={styles.entryButtonTextModified}>Add a Daily Diary </Text>
						<FontAwesome name="arrow-right" size={16} color={appColor.primary} />
					</TouchableOpacity>
				</View>

			</ScrollView>
			
			{/* <BottomToolbar /> */}
			{/* Replace bottom toolbar with BottomToolbar component */}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	headerLeftBlue: {
		fontSize: 24,
		fontFamily: appFonts.Bold,
		textAlign: "left",
		marginBottom: 20,
		paddingLeft: 20,
		paddingTop: 20,
		color: "#486ECD",
	},
	iconContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	cloud: {
		position: "absolute",
		top: 10,
	},
	reportImage: {
		width: '90%',
		// height: 300,
		resizeMode: "contain",
		marginTop:30
	},
	description: {
		fontSize: 16,
		color: "#7f8c8d",
		textAlign: "center",
		marginBottom: 40,
		paddingHorizontal: 20,
	},
	entryButtonModifiedLarge: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#ffffff",
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 10,
		marginBottom: 20,
		borderWidth: 0.4,
		borderColor: '#00000030',
		marginHorizontal: 20,
		elevation:1,

	},
	entryButtonTextModified: {
		fontSize: 16,
		fontFamily: appFonts.SemiBold,
		color: "#000000",
	},
});

export default Daily72;