import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { weeklyList } from './data'
import moment from 'moment'
import { DateFormat } from '../../utils/Constants'
import { FontAwesome } from '@expo/vector-icons'
import { ProjectContext } from '../../utils/ProjectContext'

const WeeklyInvoiceList = () => {
  const { weeklyReport, setWeeklyReport } = useContext(ProjectContext);
  const [weeklyReports, setWeeklyReports] = useState([])
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchWeeklyData();
    console.log("weeklyReport :", weeklyReport)
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setWeeklyReports(weeklyList);
        setLoading(false);
      }, 1000)
    } catch (error) {
      setLoading(false);
      console.log("Error fetchWeeklyData : ", error);
    } finally {
      // setLoading(false);  
    }
  };

  const renderWeeklyReportItem = ({ item }) => {

    const startDate = item?.weekStartDate ? moment(item.weekStartDate).format(DateFormat.MMMM_DD_YYYY) : ''
    const endDate = item?.weekEndDate ? moment(item.weekEndDate).format(DateFormat.MMMM_DD_YYYY) : ''
    return (
      <TouchableOpacity key={item._id} onPress={() => {
        setWeeklyReport({ ...weeklyReport, ...item });
        navigation.navigate('Daily104', { project: item })
      }}>
        <View style={styles.invoiceItemContainer}>
          <View style={styles.invoiceDetails}>
            <View style={styles.iconContainer}>
              <FontAwesome name="file" size={20} color="#4A90E2" />
            </View>
            <View style={styles.invoiceTextContainer}>
              <Text style={styles.invoiceTitle}>{weeklyReport?.projectName}</Text>
              <Text style={styles.invoiceClient}>Client: {weeklyReport.owner}</Text>
              <Text style={styles.invoiceDateRange}>
                {startDate} - {endDate}
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={20} color="#000" />
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={true}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text
            style={[styles.headerText, { fontWeight: '500', marginLeft: 5 }]}>
            Weekly Reports
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}>
          <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
        </View>
      ) : null}


      <FlatList
        data={weeklyReports}
        keyExtractor={(item) => item._id}
        renderItem={renderWeeklyReportItem}
        contentContainerStyle={styles.invoiceList}
      />

    </ScrollView>


  )
}

export default WeeklyInvoiceList

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  invoiceList: {
    paddingBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginLeft: 10,
  },
  invoiceList: {
    paddingBottom: 20,
  },
  invoiceItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginLeft: 10,
    marginRight: 10,
  },
  invoiceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceTextContainer: {
    flexDirection: 'column',
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  invoiceClient: {
    fontSize: 14,
    color: '#6B7280',
  },

})