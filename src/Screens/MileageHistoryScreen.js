import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import BottomToolbar from './BottomToolbar';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { endPoints } from '../api/endPoints';
import { Constants } from '../utils/Constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/button/CustomButton';
import { appFonts } from '../theme/appFonts';
import { appColor } from '../theme/appColor';
import apiClient from '../api/apiClient';
import { SCREENS } from '../utils/ScreenNames';
import moment from 'moment';
import { useErrorPopupContext } from '../context/PopupProvider';
import LoaderModal from '../components/modal/Loader';
import { SafeAreaWrapper } from '../../App';


const getMonthData = (year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dates = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    dates.push(formattedDate);
  }
  return dates;
};

const MileageHistoryScreen = () => {
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
  const navigation = useNavigation();
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
  );
  const [monthDates, setMonthDates] = useState(
    getMonthData(today.getFullYear(), today.getMonth())
  );
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  const [MileageHistoryList, setMileageHistoryList] = useState([]);
  const [FilterMileageList, setFilterMileageList] = useState([]);
  const [StartDate, setStartDate] = useState();
  const [EndDate, setEndDate] = useState()
const [loading, setLoading] = useState(false)
 const [IsRefreshing, setRefreshing] = useState(false);
 const isFocused = useIsFocused();

  useEffect(()=>{
if(isFocused){
 const currentMonthDates = getDatesInMonth(today.getFullYear(), selectedMonth);
    console.log("currentMonthDates : ", currentMonthDates)
    if(currentMonthDates && currentMonthDates.length > 0){
      setMonthDates(currentMonthDates);

      setSelectedDate(moment().format('YYYY-MM-DD'));
    }

    const startDate = moment(currentMonthDates[0], 'YYYY-MM-DD').clone().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS');
    const endDate = moment(currentMonthDates[currentMonthDates.length - 1], 'YYYY-MM-DD').clone().endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS');
    setStartDate(startDate);
    setEndDate(endDate);
    getMileageHistory(startDate, endDate)
}
   
  },[selectedMonth,isFocused])

  function getDatesInMonth(year, month) {
    // Note: month is 0-indexed in JavaScript (0-11)
    const startDate = moment([year, month]);
    const endDate = moment(startDate).endOf('month');
    
    const dates = [];
    let currentDate = startDate.clone();
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }
    return dates;
  }

  const getMileageHistory =  async (startDate, endDate)=>{
    try {
      setLoading(true)
      const user_id = await AsyncStorage.getItem(Constants.USER_ID);
      const url = `${endPoints.URL_MILAGE_HISTRY}/${user_id}?startDate=${startDate}&endDate=${endDate}`;
      const response = await apiClient.get(url);
      if(response.status === 200){
        if(response.data.status === 'success'){
          setMileageHistoryList(response.data.data);
          getFilterMileageHistory(response.data.data, selectedDate)
          return;
        }
      }
      showErrorPopup(response?.data?.message || "Something went wrong");
    } catch (error) {
      console.log("Error fetching mileage history:", error.response?.data || error.message);
      showErrorPopup("Error fetching mileage history:", error.response?.data || error.message);
    } finally {
      setLoading(false)
    }
  }
  const getRefreshingMileageHistory =  async (startDate, endDate)=>{
    try {
      setRefreshing(true)
      const user_id = await AsyncStorage.getItem(Constants.USER_ID);
      const url = `${endPoints.URL_MILAGE_HISTRY}/${user_id}?startDate=${startDate}&endDate=${endDate}`;
      const response = await apiClient.get(url);
      if(response.status === 200){
        if(response.data.status === 'success'){
          setMileageHistoryList(response.data.data);
          getFilterMileageHistory(response.data.data, selectedDate)
          return;
        }
      }
      showErrorPopup(response?.data?.message || "Something went wrong");
    } catch (error) {
      console.log("Error fetching mileage history:", error.response?.data || error.message);
      showErrorPopup("Error fetching mileage history:", error.response?.data || error.message);
    } finally {
      setRefreshing(false)
    }
  }
  

  const getFilterMileageHistory = async (list ,selectedDate)=>{
   const filteredData = list.filter(item => moment.utc(item.date).format('YYYY-MM-DD') === selectedDate); 
   setFilterMileageList(filteredData)
  }


  const renderDailyEntry = ({ item }) => {
    return (
      <View style={styles.entryCard}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}><Text style={{
            fontFamily: appFonts.SemiBold,
            color: appColor.black
          }}>From:</Text> {item.startLocation || "N/A"}</Text>


            <Text style={styles.locationText}>
            <Text style={{
            fontFamily: appFonts.SemiBold,
            color: appColor.black
          }}>To:</Text> {item?.endLocation}
            </Text>

            <Text style={styles.locationText}>
            <Text style={{
            fontFamily: appFonts.SemiBold,
            color: appColor.black
          }}>Duration:</Text> {item?.duration}
            </Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <FontAwesome name="tachometer" size={20} color="black" />
            <Text style={styles.infoText}>
              {item.totalDistance} Kms
            </Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome name="money" size={20} color={appColor.prizeGreenColor} />
            <Text style={[styles.infoText,{
    color:appColor.prizeGreenColor,

            }]}>
              ${item.expenses} 
            </Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaWrapper>
    {/* <SafeAreaView style={styles.container}> */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Mileage</Text>
      </View>
      <View style={styles.calendarContainer}>
        <TouchableOpacity
          style={styles.monthSelector}
          onPress={() => setIsMonthModalVisible(true)}
        >
          <Text style={{ fontSize: 14, fontFamily: appFonts.Medium }}>
          {
            moment().month(selectedMonth).format('MMMM')
          }</Text>
          <FontAwesome style={{ marginLeft: 10 }} name="caret-down" size={20} color="#486ECD" />
        </TouchableOpacity>


        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateContainer}>
            {monthDates.map((dayDate, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayContainer}
                onPress={() =>{setSelectedDate(dayDate), getFilterMileageHistory(MileageHistoryList,dayDate)}}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate == dayDate && styles.selectedDateText,
                  ]}
                >
                  {dayDate.split('-')[2]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={styles.entriesContainer}>
        <Text style={styles.entriesTitle}>List of Mileage Entries</Text>
      </View>

      {/* {
        FilterMileageList.length > 0 && ( */}
        <View style={{
          paddingBottom:120
        }}>
 <FlatList
            data={FilterMileageList}
            keyExtractor={(item) => item._id}
            renderItem={renderDailyEntry}
            refreshing={IsRefreshing}
            onRefresh={()=>getRefreshingMileageHistory(StartDate,EndDate)}
          />
        </View>
         
        {/* )
      } */}
    
      {
        moment().format('YYYY-MM-DD') == selectedDate && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate(SCREENS.START_MILEAGE_SCREEN)}
          >
            <Ionicons name="add" size={24} color={appColor.white} />
          </TouchableOpacity>
        )
      }
     

      <Modal
        visible={isMonthModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMonthModalVisible(false)}
      >
        <View style={styles.centeredModalContainer}>
          <View style={styles.smallModalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: 12 }, (_, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMonth(index);
                    setIsMonthModalVisible(false);
                  }}
                >
                  <Text style={styles.modalText}>
                    {moment().month(index).format('MMMM')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

       <LoaderModal visible={loading} />
    {/* </SafeAreaView> */}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  uploadButton: {
    backgroundColor: appColor.primary,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    right: 40,
    height: 50,
    width: 50,
    elevation: 10
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingBottom: 90,
  },
  header: {
    marginVertical: 10
  },
  headerText: {
    fontSize: 24,
    fontFamily: appFonts.SemiBold,
    marginLeft: 10,
    color: appColor.primary,
  },
  calendarContainer: {
    backgroundColor: '#E3E8FF',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    elevation: 1
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 40,
    width: 200,
    color: '#486ECD',
    fontSize: 18,
  },
  dateContainer: {
    flexDirection: 'row',
  },
  dayContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: {
    fontSize: 15,
    fontFamily: appFonts.Regular,
    padding: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  selectedDateText: {
    backgroundColor: '#486ECD',
    color: 'white',
  },
  entriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    marginLeft: 10,
  },
  entriesTitle: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
  },
  entryCard: {
    borderWidth: 1,
    borderColor: '#D1D1D1',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginLeft: 10,
    marginRight: 10,
  
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 5,
    fontSize: 16,
  },
  locationContainer: {
  },
  locationText: {
    fontFamily: appFonts.Medium,
    fontSize: 14,
    color: '#707070',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 5,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  infoBox: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily:appFonts.Regular
  },
  addMileageButton: {
    backgroundColor: '#486ECD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  addMileageText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  centeredModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  smallModalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '40%',
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MileageHistoryScreen;