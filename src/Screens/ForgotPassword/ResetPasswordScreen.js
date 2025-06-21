import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, BackHandler, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { endPoints } from '../../api/endPoints';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import { screenHeight } from '../../utils/Constants';
import { appColor } from '../../theme/appColor';
import { useErrorPopupContext } from '../../context/PopupProvider';
import apiClient from '../../api/apiClient';
import { SCREENS } from '../../utils/ScreenNames';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';

const ResetPasswordScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secureTextEntry1, setSecureTextEntry1] = useState(true);
    const [secureTextEntry2, setSecureTextEntry2] = useState(true);
    const [loading, setLoading] = useState(false);
    const { showErrorPopup, ErrorPopup,errorPopupVisible } = useErrorPopup();
    const { showSuccessPopup, SuccessPopup ,isSuccessVisible} = useSuccessPopup();
    // const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();

    if (!email) {
        showErrorPopup('Email is not defined.');
        return null;
    }

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
    }, []);



    const callToResetPassword = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post(endPoints.URL_RESET_PASSWORD, { email, newPassword })
            if (response.status === 200 || response.status === 201) {
            setLoading(false);
                showSuccessPopup(response.data.message).then(res => {
                    navigation.navigate(SCREENS.LOGIN_SCREEN);
                })
            } else {
                showErrorPopup(response.data.message)
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            showErrorPopup(error?.message || 'Something went wrong');
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <HeaderWithBackButton customStyle={{marginLeft:-20}} title={'Reset your Password'} onBackClick={() => navigation.goBack()} />
                {/* <Text style={styles.header}>Reset your Password</Text> */}
                <Text style={styles.subHeader}>The password must be different than before</Text>

                {/* New Password Input */}
                <View style={[styles.inputContainer, { borderColor: newPassword ? appColor.primary : appColor.disabled }]}>
                    <Ionicons name="lock-closed" size={20} color={newPassword ? appColor.primary : appColor.disabled} style={styles.icon} />
                    <TextInput
                        style={[
                            styles.input,
                            { color: newPassword ? appColor.primary : '#7f8c8d' }, // Dynamically change color
                        ]}
                        placeholder="New Password"
                        placeholderTextColor="#7f8c8d" // Ensure placeholder stays grey
                        secureTextEntry={secureTextEntry1}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity onPress={() => setSecureTextEntry1(!secureTextEntry1)}>
                        <Ionicons name={secureTextEntry1 ? 'eye-off' : 'eye'} size={20} color={newPassword ? appColor.primary : appColor.disabled} />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={[styles.inputContainer, { borderColor: confirmPassword ? appColor.primary : appColor.disabled }]}>
                    <Ionicons name="lock-closed" size={20} color={confirmPassword ? appColor.primary : appColor.disabled} style={styles.icon} />
                    <TextInput
                        style={[
                            styles.input,
                            { color: confirmPassword ? appColor.primary : appColor.disabled }, // Dynamically change color
                        ]}
                        placeholder="Confirm Password"
                        placeholderTextColor="#7f8c8d" // Ensure placeholder stays grey
                        secureTextEntry={secureTextEntry2}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setSecureTextEntry2(!secureTextEntry2)}>
                        <Ionicons name={secureTextEntry2 ? 'eye-off' : 'eye'} size={20} color={confirmPassword ? appColor.primary : appColor.disabled} />
                    </TouchableOpacity>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: (newPassword && newPassword === confirmPassword) ? appColor.primary : appColor.disabledPrimary }]}
                    onPress={() => callToResetPassword()}
                    disabled={newPassword && newPassword === confirmPassword ? false : true}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.continueButtonText}>Submit</Text>
                    )}
                </TouchableOpacity>


            </KeyboardAvoidingView>

            {isSuccessVisible ? <SuccessPopup /> : null}
            {errorPopupVisible ? <ErrorPopup /> : null}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        // justifyContent: 'space-between',
        padding: 20
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 30,
        width: '80%',
        alignSelf: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
    },
    continueButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        position: 'absolute',
        width: '100%',
        alignSelf: 'center',
        top: screenHeight - 125- StatusBar.currentHeight
    },
    continueButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: '#486ECD',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'left',
        marginTop: 5,
        marginBottom: 10,
    },
    cancelButtonText: {
        color: '#486ECD',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ResetPasswordScreen;