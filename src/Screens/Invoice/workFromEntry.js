import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { appColor } from '../../theme/appColor';
import moment from 'moment';
import { DateFormat } from '../../utils/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkFromEntry = ({route,navigation}) => {
  const {workFromEntry} = route.params;
  const [activeTab, setActiveTab] = useState(0) // 0 chargable , 1 non-chargable 
  const [ChargableEntry, setChargableEntry] = useState([])
  const [NonChargableEntry, setNonChargableEntry] = useState([])

  useEffect(()=>{
    if(workFromEntry?.length){
      const cEntry = [];
      const ncEntry = [];
      workFromEntry.map((item)=>{
        if(item?.IsChargable){
          cEntry.push(item);
        }else{
          ncEntry.push(item);

        }
      })
      cEntry.sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate));
      ncEntry.sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate));
      setChargableEntry(cEntry);
      setNonChargableEntry(ncEntry);
    }
  },[])
  return (
    <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>

    <View style={styles.container}>
    {/* Header Section */}
    <View style={styles.headerContainer}>
      <TouchableOpacity style={styles.header} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.headerText}>Work From Home Entries</Text>
      </TouchableOpacity>
    </View>


    <View style={{
      flexDirection:'row',
      justifyContent:'space-between',
      marginHorizontal:20,
      borderWidth:1,
    }}>
      <TouchableOpacity onPress={()=>setActiveTab(0)} style={{
        backgroundColor:activeTab == 0 ? appColor.primary : appColor.white ,
        padding:10,
        width:'50%',
        justifyContent:'center',
        alignItems:'center'


      }}>
        <Text style={{
          color:activeTab == 0 ? appColor.white : appColor.black
        }}>Chargable</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>setActiveTab(1)} style={{
        backgroundColor:activeTab == 1 ? appColor.primary : appColor.white ,
        padding:10,
        width:'50%',
        justifyContent:'center',
        alignItems:'center'


      }}>
        <Text style={{
          color:activeTab == 1 ? appColor.white : appColor.black
        }}>Non Chargable</Text>
      </TouchableOpacity>
    </View>


      

      {
       activeTab == 0 && ChargableEntry?.length > 0?
<>
<View style={{
        margin: 20,
      }}>

        <Text style={styles.label}>Project Name</Text>
        <Text style={styles.detailText}>{ChargableEntry[0]?.projectName}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Client PO/Reference Number</Text>
        <Text style={styles.detailText}>{ChargableEntry[0]?.projectNumber}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Contractor</Text>
        <Text style={styles.detailText}>{ChargableEntry[0]?.contractor}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Owner Contact</Text>
        <Text style={styles.detailText}>{ChargableEntry[0]?.ownerContact}</Text>
        <View style={styles.divider} />
      </View>

<ScrollView>
      {
        ChargableEntry.map((item)=>{
          return( <View key={item?._id} style={styles.detailContainer}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.detailText}>{moment(item?.selectedDate).format(DateFormat.DD_MM_YYYY)}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Description</Text>
            <Text style={styles.detailText}>
              {item?.description}
            </Text>
          </View>)
        })
      }
      </ScrollView>
</>

        : null
      }

      {
        activeTab == 0 && ChargableEntry?.length == 0 ?
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:20}}>No Chargable Entries Found</Text>
        </View>
        : null
      }
      {
        activeTab == 1 && NonChargableEntry?.length == 0 ?
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:20}}>No Non-Chargable Entries Found</Text>
        </View>
        : null
      }


{
       activeTab == 1 && NonChargableEntry?.length > 0?
<>
<View style={{
        margin: 20,
      }}>

        <Text style={styles.label}>Project Name</Text>
        <Text style={styles.detailText}>{NonChargableEntry[0]?.projectName}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Client PO/Reference Number</Text>
        <Text style={styles.detailText}>{NonChargableEntry[0]?.projectNumber}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Contractor</Text>
        <Text style={styles.detailText}>{NonChargableEntry[0]?.contractor}</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Owner Contact</Text>
        <Text style={styles.detailText}>{NonChargableEntry[0]?.ownerContact}</Text>
        <View style={styles.divider} />
      </View>

<ScrollView>
      {
        NonChargableEntry.map((item)=>{
          return( <View key={item?._id+Math.random()} style={styles.detailContainer}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.detailText}>{moment(item?.selectedDate).format(DateFormat.DD_MM_YYYY)}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Description</Text>
            <Text style={styles.detailText}>
              {String(item?.description)}
            </Text>
          </View>)
        })
      }
      </ScrollView>
</>

        : null
      }

     

    </View>
    </SafeAreaView>


  )
}

export default WorkFromEntry

const styles = StyleSheet.create({  container: {
  flex: 1,
  backgroundColor: '#fff',
},
headerContainer: {
  paddingTop: 15,
  paddingBottom: 10,
  paddingHorizontal: 16,
  backgroundColor: '#fff',
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
},
headerText: {
  fontSize: 18,
  marginLeft: 10,
  fontWeight: 'bold',
},
detailContainer: {
  marginHorizontal:10,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#D3D3D3',
  borderRadius: 8,
  padding: 12,
  backgroundColor: '#F9FAFB',
},
label: {
  fontSize: 16,
  fontWeight: '500',
  color: '#000',
  marginBottom: 10,
},
detailText: {
  fontSize: 16,
  color: '#333',
},
divider: {
  height: 1,
  backgroundColor: '#D3D3D3',
  marginVertical: 4,
},})