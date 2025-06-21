import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { appFonts } from '../theme/appFonts'

const IconTextInput = ({ textValue, label, onChangeTextValue, iconName,editable = true,onclickIcon,IsSecurity=false,inputFontSize = 14, ...props }) => {
    return (
        <View style={styles.formGroup} {...props}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow]}>
                <TextInput
                    style={[styles.inputRowInput, { color: textValue === '' ? 'grey' : 'black',fontSize:inputFontSize }]}
                    value={textValue}
                    editable={editable}
                    onChangeText={onChangeTextValue}
                    placeholder={"Enter "+label}
                    secureTextEntry={IsSecurity}
                    returnKeyType='done'
                    {...props}

                />
                <TouchableOpacity onPress={onclickIcon}>
                    <Ionicons name={iconName} size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default IconTextInput

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
        // fontWeight: "bold",
        fontFamily:appFonts.Bold
    },
    inputRowInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        fontFamily:appFonts.Medium
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 5,
        paddingRight:10
    },
})