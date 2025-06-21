import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
    Image
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
const style = `.m-signature-pad--footer
  .button {
    background-color: #486ECD;
    color: #FFF;
  }`;
const SignatureModal = ({handleSignatureOK,showSignatureModal,onclose}) => {
    const signatureRef = useRef(null);
    return (
        <Modal visible={showSignatureModal} transparent={true} animationType="slide" onDismiss={onclose} >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.signatureText}>Sign Here:</Text>

                    <SignatureCanvas
                        style={{ height: 600 }}
                        ref={signatureRef}
                        onOK={handleSignatureOK}
                        descriptionText=""
                        clearText="Clear"
                        confirmText="Save"
                        
                        
                        webStyle={style}
                    />

                    <TouchableOpacity onPress={onclose} style={{
                        position:'absolute',
                        top:5,
                        right:5,
                        zIndex:6
                    }}>
                    <Ionicons name="close" size={24} color="red" />
                    </TouchableOpacity>
                    
                </View>
            </View>
        </Modal>
    )
}

export default SignatureModal

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    headerContainer: { flexDirection: "row", alignItems: "center", marginTop: 50, marginBottom: 20 },
    backButton: { flexDirection: "row", alignItems: "center" },
    headerTitle: { fontSize: 18, marginLeft: 10, fontWeight: "bold" },
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
    button: { backgroundColor: "#486ECD", padding: 15, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", marginBottom: 10 },
    buttonText: { color: "#fff", fontSize: 16, marginLeft: 10 },
    signatureButton: { borderWidth: 1, borderColor: "#486ECD", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
    signatureButtonText: { color: "#486ECD", fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10, height: 450 },
    signatureText: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    cancelButton: { padding: 10 },
    submitButton: { backgroundColor: "#486ECD", padding: 10, borderRadius: 5 },
});