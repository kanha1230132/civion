import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Switch } from 'react-native'
import { appColor } from '../../theme/appColor'
import apiClient from '../../api/apiClient'
import { endPoints } from '../../api/endPoints'
import { useErrorPopup } from '../../components/popup/errorPopup'
import { useSuccessPopup } from '../../components/popup/successPopup'
import { appFonts } from '../../theme/appFonts'
import HeaderWithBackButton from '../../components/HeaderWithBackButton'
import { SafeAreaView } from 'react-native-safe-area-context'

const AddCompanyEmailScreen = ({ navigation }) => {
    const [isBoss, setIsBoss] = useState(true);
    const [email, setEmail] = useState('');
    const { SuccessPopup, showSuccessPopup, isSuccessVisible } = useSuccessPopup();
    const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
    const createCompanyEmail = async () => {

        try {

            if (!email) {
                showErrorPopup("Please enter email");
                return
            }
            const params = {
                "email": email,
                "isBoss": isBoss
                // isActive: true
            }
            console.log("params : ",params)

            const response = await apiClient.post(endPoints.URL_ADD_COMPANY_EMAIL, params);
            console.log("response : ", response)
            if (response.status === 200) {
                if (response.data.status) {
                    showSuccessPopup(response.data.message);
                    setEmail('');
                    setIsBoss(true);
                } else {
                    showErrorPopup(response.data.message);
                }
            } else {
                showErrorPopup(response.data.message);
            }
            console.log("response : ", response.data);
        } catch (error) {

        }
    }
    return (
        <SafeAreaView style={styles.container}>
 <View style={styles.headerContainer}>
                <HeaderWithBackButton title="Add Company Email" onBackClick={() => navigation.goBack()} />
               
            </View>

            <View style={{
                marginHorizontal: 20,
                backgroundColor:'white'
            }}>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}

                />

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Text style={styles.label}>isBoss</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: appColor.primary }}
                        thumbColor={'#f4f3f4'}
                        onValueChange={() => setIsBoss(!isBoss)}
                        value={isBoss}
                    />
                </View>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => {
                        createCompanyEmail()
                    }}
                >
                    <Text style={styles.nextButtonText}>Add</Text>
                </TouchableOpacity>



            </View>

            {errorPopupVisible ?
                ErrorPopup() : null
            }
            {
                isSuccessVisible ?
                    SuccessPopup() : null
            }
        </SafeAreaView>
    )
}

export default AddCompanyEmailScreen

const styles = StyleSheet.create({
    nextButton: {
        width: '30%',
        alignSelf: 'center',
        backgroundColor: "#486ECD",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 18,
        fontFamily:appFonts.Medium
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
        backgroundColor: "#fff",
        color: "black",
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 0,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerText: {
        fontSize: 18,
        marginLeft: 5,
        
        fontFamily:appFonts.Medium,
    },
})