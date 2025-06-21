import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Alert, KeyboardAvoidingView, Platform, BackHandler, StatusBar } from 'react-native';
import { endPoints } from '../../api/endPoints';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import apiClient from '../../api/apiClient';
import { appColor } from '../../theme/appColor';
import { screenHeight } from '../../utils/Constants';
import { useErrorPopupContext } from '../../context/PopupProvider';
import { SCREENS } from '../../utils/ScreenNames';
import LoaderModal from '../../components/modal/Loader';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { useSuccessPopup } from '../../components/popup/successPopup';
const VerifyCodeScreen = ({ route, navigation }) => {
    const { email } = route.params;
    const [code, setCode] = useState(['', '', '', '']);
    const [isCodeComplete, setIsCodeComplete] = useState(false);
    const { showErrorPopup, ErrorPopup,errorPopupVisible } = useErrorPopup();
    const { showSuccessPopup, SuccessPopup ,isSuccessVisible} = useSuccessPopup();
    // const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [loading, setLoading] = useState(false)

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

    const handleInputChange = (index, value) => {
        if (value.length <= 1) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
        }
        if (value.length === 1 && index < 3) {
            inputRefs[index + 1].current.focus();
        }
        if (value.length === 0 && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    useEffect(() => {
        if (code.every((digit) => digit !== '')) {
            setIsCodeComplete(true);
            Keyboard.dismiss();
        } else {
            setIsCodeComplete(false);
        }
    }, [code]);


    const handleVerifyCode = async () => {
        try {
            const enteredCode = code.join('');
            setLoading(true)
            const response = await apiClient.post(endPoints.URL_FORGOT_VERIFY_CODE, { email, code: enteredCode });
            if (response.status === 200 || response.status === 201) {
                setLoading(false)
                showSuccessPopup(response.data.message).then(res=>{
                    navigation.navigate(SCREENS.RESET_PASSWORD_SCREEN, { email: email });
                })
            } else {
                showErrorPopup(response.data.message)
            }
        } catch (error) {
            showErrorPopup(error?.message || 'Something went wrong');
        } finally {
            setLoading(false)
        }
    };

    const handleResendCode = async () => {
        try {
            setLoading(true)
            const response = await apiClient.post(endPoints.URL_FORGET_PASSWORD, { email });
            if (response.status === 200 || response.status === 201) {
                setLoading(false)
                showSuccessPopup(response.data.message)
            } else {
                showErrorPopup(response.data.message)
            }
        } catch (error) {
            showErrorPopup(error?.message || 'Something went wrong');
            setLoading(false)
        } finally{
            setLoading(false)
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <HeaderWithBackButton customStyle={{marginLeft:-20}} title={'Verify Email'} onBackClick={() => navigation.goBack()} />

                <Text style={styles.header}>Enter Verification Code</Text>
                <Text style={styles.subHeader}>We have sent a code to <Text style={{ color: appColor.black, fontWeight: '400' }}>{email}</Text></Text>

                {/* Code Input Fields */}
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={[styles.codeInput, { borderColor: digit ? appColor.primary : appColor.disabled }]}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleInputChange(index, value)}
                            ref={inputRefs[index]}
                        />
                    ))}
                </View>



                <View style={styles.footerBtn}>
                    <Text style={styles.resendText}>
                        Didn't you receive any code?{' '}
                        <Text style={styles.resendLink} onPress={handleResendCode}>Resend Code</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.verifyButton, { backgroundColor: isCodeComplete ? appColor.primary : appColor.disabledPrimary }]}
                        disabled={!isCodeComplete}
                        onPress={handleVerifyCode}
                    >
                        <Text style={styles.verifyButtonText}>Verify Now</Text>
                    </TouchableOpacity>
                </View>


                <LoaderModal visible={loading} />
                {isSuccessVisible ? <SuccessPopup /> : null}
                {errorPopupVisible ? <ErrorPopup /> : null}

            </KeyboardAvoidingView>
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
        marginTop: 10,

    },
    subHeader: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginTop: 10,
        width: '80%',
        alignSelf: 'center'
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
    codeInput: {
        borderWidth: 1,
        // borderColor: '#dfe6e9',
        borderRadius: 10,
        width: 50,
        height: 50,
        textAlign: 'center',
        fontSize: 20,
    },
    verifyButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 20,
    },
    resendLink: {
        color: '#486ECD',
        fontWeight: 'bold',
    },

    footerBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? screenHeight - 180 -StatusBar.currentHeight: screenHeight -140-StatusBar.currentHeight,
        width: '95%',
        alignSelf: 'center',
    }
});

export default VerifyCodeScreen;