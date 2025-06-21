import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { appColor } from '../../theme/appColor';
import { appFonts } from '../../theme/appFonts';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from 'react-native-paper';

const CustomButton = ({ title, onCick, bgColor = appColor.primary, textColor = appColor.white, textSize = 14, disabled = false, ...props }) => {
    return (
        <>
         {/* <TouchableOpacity
            disabled={disabled}
            style={[styles.button, { backgroundColor: bgColor, borderColor: textColor }]}
            onPress={() => onCick()}

            {...props}>
            <Text
                style={{ color: textColor, textAlign: "center", fontFamily: appFonts.SemiBold, fontSize: textSize }}>
                {title}
            </Text>
        </TouchableOpacity> */}

        <Button rippleColor={textColor+'90'} labelStyle={{color:textColor}} style={[{ backgroundColor: bgColor, borderColor: textColor,borderRadius:10,borderWidth:1 }]} onPress={() => onCick()} {...props}>
            {title}
        </Button>
        
        </>

       

    )
}

export default CustomButton

const styles = StyleSheet.create({
    button: {
        width:'100%',
        borderColor: appColor.primary,
        paddingHorizontal: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        borderWidth: 1,
        borderColor: appColor.primary,
        elevation: 1
    }
})