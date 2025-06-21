import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { imgURL } from "../../Assets";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import { appColor } from "../../theme/appColor";
import { SCREENS } from "../../utils/ScreenNames";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaWrapper } from "../../../App";

const JobHazardAnalysis = ({ navigation }) => {
    const handleNext = () => {
        navigation.navigate(SCREENS.CREATE_JOB_HAZARD); 
    };
    const insets = useSafeAreaInsets();
    return (
        // <SafeAreaView style={styles.container}>
            <SafeAreaWrapper >
            <HeaderWithBackButton title="Job Hazard Analysis" onBackClick={() => navigation.goBack()} />

            <View style={{
                justifyContent: "center",
                alignItems: "center",
            }}>
                {/* Display First Image */}
                <Image source={imgURL.JHA_TRIANGLE} style={styles.image} />

                {/* Display Second Image */}
                <Image source={imgURL.JHA_SQUARE} style={styles.image} />

            </View>


            {/* Navigation Button */}
            {/* <TouchableOpacity style={styles.addButton} onPress={handleNext}>
                <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={styles.addIcon} />
                <Text style={styles.addButtonText}>Add Job Hazard Analysis</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleNext()}
            >
                <Ionicons name="add" size={24} color={appColor.white} />
            </TouchableOpacity>

            </SafeAreaWrapper>

        // </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    uploadButton: {
        backgroundColor: appColor.primary,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 50,
        // right:20,
        alignSelf: 'center',
        height: 50,
        width: 50,
        elevation: 10
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: 15,
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000000",
        marginLeft: 5,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    image: {
        width: "94%",
        height: 300,
        resizeMode: "contain",
    },
    addButton: {
        backgroundColor: "#486ECD",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "center",
    },
    addButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    addIcon: {
        marginRight: 5,
    },
});

export default JobHazardAnalysis;
