import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { appFonts } from '../theme/appFonts'

const CustomTextInput = ({ onChangeTextValue, textValue, label,...props }) => {
    return (
        <View style={styles.formGroup} >
            <Text style={styles.label}>{label}</Text>
            <TextInput
                // keyboardType=''
                style={[styles.input]}
                placeholder={"Enter " + label}
                onChangeText={onChangeTextValue}
                value={textValue}
                placeholderTextColor="#777"
                {...props}

            />
        </View>
    )
}

export default CustomTextInput

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
        color: "#000",
        fontFamily:appFonts.Medium
    },
    input: {
        borderWidth: 1,
        borderColor: "#000",
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        color: "#486ECD",
        marginBottom: 10,
        fontWeight: "bold",
    },

})