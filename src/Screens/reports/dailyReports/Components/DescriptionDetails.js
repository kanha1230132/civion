import React, { useState, useContext, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Keyboard,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { appFonts } from "../../../../theme/appFonts";
import SignatureModal from "../../../../components/modal/SignatureModal";

export default function DescriptionDetails({ dailyEntry, setDailyEntry }) {
    const startSpeaking = () => {
        Speech.speak(dailyEntry.description);

    };
    const [showSignatureModal, setShowSignatureModal] = useState(false);

    const handleSignatureOK = (signatureBase64) => {
        setShowSignatureModal(false);
        if (signatureBase64) {
            setDailyEntry({...dailyEntry,signature : signatureBase64})
            console.log("signature data :", signatureBase64);
        }
    }
    return (
        <View style={styles.container}>
            <Text style={styles.boldLabel}>Add Project Description</Text>
            <TextInput
                style={[styles.textArea]}
                placeholder="Type your project description here"
                multiline={true}
                
                value={dailyEntry?.description}
                onChangeText={(text) => setDailyEntry((prevData) => ({
                    ...prevData,
                    description: text,
                }))}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => {
                    Keyboard.dismiss();
                  }}
            />
            

<Text style={{
                        marginBottom: 5,
                        fontSize: 16,
                        color: "#000",
                        fontFamily: appFonts.Medium,
                        marginTop: 15
                    }}>Signature</Text>
                    <View style={{ borderColor: "#ddd", borderWidth: 1, marginBottom: 20, backgroundColor: "white", borderRadius: 6, minHeight: 45 }}>
                        <TouchableOpacity style={{
                            padding: 10,
                            borderRadius: 5,
                            alignItems: 'center',
                            marginTop: 10,
                        }} onPress={() => setShowSignatureModal(true)}>
                            {dailyEntry.signature ? (
                                <View>
                                    <Image resizeMode='contain' source={{ uri: dailyEntry.signature }} style={{ width: 200, borderWidth: 0.5, borderColor: '#00000039', height: 150 }} />

                                    <TouchableOpacity onPress={() => setDailyEntry({...dailyEntry,signature:''})} style={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                        zIndex: 6
                                    }}>
                                        <Ionicons name="close" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={{
                                    color: "#486ECD",
                                    fontSize: 16,
                                    marginLeft: 5,
                                    fontFamily: appFonts.Medium
                                }}>Add Signature</Text>
                            )}


                        </TouchableOpacity>

                    </View>

            {/* <View style={styles.voiceContainer}>
                <TouchableOpacity style={styles.voiceButton} onPress={startSpeaking}>
                    <MaterialIcons name="keyboard-voice" size={20} color="black" />
                    <Text style={styles.voiceText}>Text to Voice</Text>
                </TouchableOpacity>
            </View> */}


            {showSignatureModal && <SignatureModal handleSignatureOK={handleSignatureOK} showSignatureModal={showSignatureModal} onclose={() => {
                console.log("close : ")
                setShowSignatureModal(false)
            }} />}


        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingBottom: 70,

    },
   
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 15,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: appFonts.Medium,
        marginLeft: 10,
        color: "#333",
    },
    headerRightContainer: {
        alignItems: "center",
    },
    headerSubText: {
        color: "#486ECD",
        fontSize: 16,
        fontFamily: appFonts.Medium,

    },
    descriptionHeader: {
        fontSize: 18,
        fontFamily: appFonts.Medium,
        color: "#000000",
        marginBottom: 20,
    },
    stepContainer: {
        marginBottom: 20,
    },
    stepsBackground: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f0f0", // light gray background for all steps
    },
    completedCircle: {
        borderColor: "#486ECD",
    },
    futureStep: {
        borderColor: "#e0e0e0",
    },
    stepText: {
        fontSize: 16,
        fontFamily: appFonts.Medium,

        color: "#486ECD", // blue color for numbers in completed steps
    },
    completedText: {
        color: "#486ECD",
    },
    currentStepText: {
        color: "#000000", // Black color for step 5
    },
    futureStepText: {
        color: "#e0e0e0",
    },
    progressLine: {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "#e0e0e0",
        zIndex: -1,
    },
    completedLine: {
        backgroundColor: "#486ECD", // blue line for completed steps
    },
    futureLine: {
        backgroundColor: "#e0e0e0",
    },
    boldLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: "#000",
        fontFamily: appFonts.Medium
    },
    textArea: {
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 150, // Increased height
        padding: 10,
        marginBottom: 20,
        fontFamily: appFonts.Medium,
    textAlignVertical: "top",

    },
    voiceContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    voiceButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        elevation: 2
    },
    voiceText: {
        marginLeft: 10,
        fontSize: 16,
        fontFamily: appFonts.Medium,

    },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 40,
    },
    previousButton: {
        flex: 0.48,
        borderWidth: 1,
        borderColor: "#486ECD",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    previousButtonText: {
        color: "#486ECD",
        fontSize: 18,
        fontFamily: appFonts.Medium,

    },
    submitButton: {
        flex: 0.48,
        backgroundColor: "#486ECD",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    submitText: {
        color: "#fff",
        fontSize: 18,
        fontFamily: appFonts.Medium,

    },
});