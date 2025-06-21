import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColor } from '../../../theme/appColor';

const VisitorDetails = ({ navigation, route }) => {
    const visitorDetails = route.params?.visitorDetails || [];
 
   return (
    <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>
     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>

       {/* Header */}
       <View style={styles.headerContainer}>
         <TouchableOpacity onPress={() => navigation.goBack()}>
           <Ionicons name="arrow-back" size={24} color="black" />
         </TouchableOpacity>
         <Text style={styles.headerText}>Visitor Details</Text>
       </View>
 
       {/* Title */}
       <Text style={styles.title}>View Visitor Details</Text>
 
       {/* Visitor List */}
       <View style={styles.detailsContainer}>
         {visitorDetails.map((item, index) => (
           <View key={index} style={styles.detailItem}>
             <Text style={styles.visitorName}>{item.visitorName}</Text>
             <View style={styles.detailRow}>
               <Text style={styles.companyText}>{item.company}</Text>
               <View>
               <Text style={styles.hoursText}>Hours: {item.hours}</Text>
               <Text style={styles.hoursText}>Quantity: {item.quantity}</Text>
               <View  style={{width:'100%',height:1,backgroundColor:'#d3d3d3'}}/>
               <Text style={styles.hoursText}>Total Hours: {item.totalHours}</Text>
                </View>
             </View>
           </View>
         ))}
       </View>
     </ScrollView>
     </SafeAreaView>
   );
}

export default VisitorDetails

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: 16,
      paddingTop: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginLeft: 8,
      color: '#000',
    },
    title: {
      fontSize: 18,
      color: '#486ECD',
      fontWeight: '500',
      marginBottom: 20,
    },
    detailsContainer: {
      backgroundColor: '#f7f9fc',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    detailItem: {
      marginBottom: 16,
    },
    visitorName: {
      fontSize: 16,
      color: '#486ECD',
      fontWeight: '500',
      marginBottom: 4,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    companyText: {
      fontSize: 16,
      color: '#333',
      flex: 1,
    },
    hoursText: {
      fontSize: 16,
      color: '#333',
      textAlign: 'right',
    },
  });
  