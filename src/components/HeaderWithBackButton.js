import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { appColor } from '../theme/appColor'
import { appFonts } from '../theme/appFonts'

const HeaderWithBackButton = ({ title, onBackClick,customStyle,textFontSize=18 }) => {
    return (
        <View style={[styles.headerRow,customStyle]}>
            <TouchableOpacity onPress={onBackClick}>
                <Ionicons name="arrow-back" size={24} color={appColor.primary} />
            </TouchableOpacity>
            <Text style={[styles.header,{fontSize:textFontSize}]}>{title}</Text>
        </View>
    )
}

export default HeaderWithBackButton

const styles = StyleSheet.create({
    header: {
        fontFamily:appFonts.Medium,
        color: appColor.primary,
        marginLeft: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
})