import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import { appFonts } from '../../../theme/appFonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColor } from '../../../theme/appColor';

const LabourDetails = ({ navigation, route }) => {
    const labourDetails = route.params.labourDetails;
    const [isExpandedFirst, setIsExpandedFirst] = useState('');
    return (
        <SafeAreaView style={styles.container}>
           

            <HeaderWithBackButton title={'Labour Details'} onBackClick={()=>navigation.goBack()} />

            {/* Title */}
            <View style={{
                paddingHorizontal:15,
                marginTop:10
            }}>
            <Text style={styles.title}>View Labour Details</Text>

{/* Expandable List for First Company Details */}
{labourDetails.map((item, index) => (
    <View key={index} style={styles.detailItem}>
        <TouchableOpacity
            style={styles.box}
            onPress={() => setIsExpandedFirst(isExpandedFirst == item._id ? '' : item._id)}
        >
            <Text style={styles.boxText}>{item.contractorName}</Text>
            <Ionicons
                name={isExpandedFirst === item._id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#333"
            />
        </TouchableOpacity>
        {
            <>
                {isExpandedFirst == item._id && (
                    <View style={styles.detailsContainer}>
                        {item.roles.map((item, index) => (
                            <View key={index} style={styles.detailItem}>
                                <Text style={styles.roleText}>{item.roleName}</Text>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
                                    <Text style={styles.detailText}>Number of Hours: {item.hours}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </>

        }

    </View>
))}
            </View>
            


        </SafeAreaView>
    )
}

export default LabourDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        // paddingHorizontal: 16,
        paddingTop: 15,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 20,
        fontFamily:appFonts.Bold,
        marginLeft: 8,
        color: appColor.black,
    },
    title: {
        fontSize: 18,
        color: '#486ECD',
        marginBottom: 20,
        fontFamily:appFonts.Medium,
    },
    box: {
        backgroundColor: '#d9e7ff',
        borderRadius: 8,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    boxText: {
        fontSize: 16,
        color: '#333',
        fontFamily:appFonts.Medium,
    },
    detailsContainer: {
        backgroundColor: '#f7f9fc',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 20,
        width: '100%',
    },
    detailItem: {
        marginBottom: 5,
    },
    roleText: {
        fontSize: 16,
        color: '#486ECD',
        fontFamily:appFonts.Medium,
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailText: {
        fontSize: 16,
        color: '#333',
        fontFamily:appFonts.Medium,
    },
});