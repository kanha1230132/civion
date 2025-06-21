import { BackHandler, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';

const useBackHandler = () => {
    const navigation = useNavigation();
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

    return {

    }
}

export default useBackHandler
