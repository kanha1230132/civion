import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import BottomToolbar from "./BottomToolbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { endPoints } from "../api/endPoints";
import { Constants, DateFormat } from "../utils/Constants";
import { useIsFocused } from "@react-navigation/native";
import apiClient from "../api/apiClient";
import { SafeAreaView } from "react-native";
import { appFonts } from "../theme/appFonts";
import { appColor } from "../theme/appColor";
import { ProjectContext } from "../utils/ProjectContext";
import { useErrorPopupContext } from "../context/PopupProvider";
import util from "../utils/util";
import { SCREENS } from "../utils/ScreenNames";
import LoaderModal from "../components/modal/Loader";
import ExpenseFilterModal from "../components/modal/ExpenseFilterModal";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import { SafeAreaWrapper } from "../../App";

export const expenseFilterTypes ={
  All :'All',
  Pending : 'Pending',
  Approved : 'Approved',
  Rejected : 'Rejected',
  DateFilter : 'DateFilter'
}

const Expenses = ({ navigation, route }) => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isBoss } = useContext(ProjectContext);
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();
  const isFocused = useIsFocused();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [SelectedFilterType, setSelectedFilterType] = useState(expenseFilterTypes.All);
  const [TotalExpenseList, setTotalExpenseList] = useState([]);
  const [ShowDatePickerModal, setShowDatePickerModal] = useState(false);
  const [SelectedDate, setSelectedDate] = useState(new Date());
  const [IsRefreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchData();
      resetFilter()
    }
  }, [isFocused]);

  const resetFilter = () => {
    setSelectedFilterType(expenseFilterTypes.All);
    setDataList(TotalExpenseList);
    setShowFilterModal(false);
    setShowDatePickerModal(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endurl = isBoss ? endPoints.URL_GET_EXPENSES_APPROVALS : endPoints.URL_GET_EXPENSES
      const response = await apiClient.get(endurl);
      setLoading(false);
      if (response.status == 403 || response.status == 401) {
        const result = await showErrorPopup(response.data.message);
        if (result) {
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }
      const formattedData = response.data.data.map(expense => ({
        ...expense,
        submittedDate: expense.createdAt ? new Date(expense.createdAt) : null,
        mileageAmount: expense.mileageAmount || 0,
        expenseAmount: expense.expenseAmount || 0,
        submittedBy: expense.submittedBy || { username: "Unknown" },
      }));

      const sortedData = formattedData.sort((a, b) => b.submittedDate - a.submittedDate);
      setTotalExpenseList(sortedData);
      setDataList(sortedData);

    } catch (error) {
      showErrorPopup(error.response?.data?.message || "Failed to fetch expenses");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };


  const refreshing = async () => {
    setRefreshing(true);
    resetFilter()
    try {
      const endurl = endPoints.URL_GET_EXPENSES
      const response = await apiClient.get(endurl);
      if (response.status == 403 || response.status == 401) {
        const result = await showErrorPopup(response.data.message);
        if (result) {
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }
      const formattedData = response.data.data.map(expense => ({
        ...expense,
        submittedDate: expense.createdAt ? new Date(expense.createdAt) : null,
        mileageAmount: expense.mileageAmount || 0,
        expenseAmount: expense.expenseAmount || 0,
        submittedBy: expense.submittedBy || { username: "Unknown" },
      }));

      const sortedData = formattedData.sort((a, b) => b.submittedDate - a.submittedDate);
      setTotalExpenseList(sortedData);
      setDataList(sortedData);

    } catch (error) {
      showErrorPopup(error.response?.data?.message || "Failed to fetch expenses");
      setRefreshing(false);
    } finally {
      setRefreshing(false);
    }
  };






  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#28a745';
      case 'Rejected': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Daily70", {
        id: item._id,
        expenses: item.expenses || [],
        totalAmount: item.totalAmount || 0,
        isBoss: isBoss , // Add isBoss parameter here,
        Expense : item
      })}
      style={{
         backgroundColor: '#F9F9F9',

      }}
    >
      <View style={styles.expenseItemContainer}>
        <View style={styles.expenseDetails}>
          <View style={styles.iconContainer}>
            <FontAwesome name="file" size={20} color="#4A90E2" />
          </View>
          <View style={styles.expenseTextContainer}>
            {/* Display Employee Name (Always, not just for Bosses) */}
            <Text style={styles.employeeName}>
              {item.submittedBy?.username || "Unknown Employee"}
            </Text>

            {/* Show Expense Date */}
            <Text style={styles.expenseTitle}>
              Submitted: {item.submittedDate
                ?moment(item.submittedDate).format(DateFormat.MMM_DD_YYYY)
                : "Unknown Date"}
            </Text>



          </View>

        </View>

        {/* Status Badges */}
        <View style={styles.statusContainer}>
          {/* Mileage Status - Only show if mileageAmount > 0 */}
          {item.mileageAmount > 0 && item.mileageStatus && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.mileageStatus) }]}>
              <Text style={styles.statusText}>{item.mileageStatus}</Text>
            </View>
          )}

          {/* Expense Status - Only show if expenseAmount > 0 */}
          {item.expenseAmount > 0 && item.expenseStatus && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.expenseStatus), marginTop: 5 }]}>
              <Text style={styles.statusText}>{item.expenseStatus}</Text>
            </View>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );

  const clickShowFilterModal = ()=>{
    setShowFilterModal(true);
  }

  const handleFilterApply = (type)=>{
    if(type == expenseFilterTypes.All){
      setDataList(TotalExpenseList);
    }else if(type == expenseFilterTypes.Approved){
      setDataList(TotalExpenseList.filter(expense => expense.expenseStatus == 'Approved'));
    }else if(type == expenseFilterTypes.Rejected){
      setDataList(TotalExpenseList.filter(expense => expense.expenseStatus == 'Rejected'));
    }else if(type == expenseFilterTypes.Pending){
      setDataList(TotalExpenseList.filter(expense => expense.expenseStatus == 'Pending')); 
    } else if(type == expenseFilterTypes.DateFilter){
      setShowDatePickerModal(true);
    }
    setShowFilterModal(false);

    setSelectedFilterType(type);

  }

  const handleDateChange = (selectedDate) => {
    const date = moment(selectedDate).format(DateFormat.YYYY_MM_DD);
    setShowFilterModal(false);
    setShowDatePickerModal(false);
    setDataList(TotalExpenseList.filter(expense => moment(expense.submittedDate).format(DateFormat.YYYY_MM_DD) == date));
  }

  return (
      <SafeAreaWrapper>

    <SafeAreaView style={styles.container}>
         <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{isBoss ? "Expense Approvals" : "My Expenses"}</Text>

        <TouchableOpacity style={{
          width: 30,
          height: 30,
          backgroundColor: appColor.white,
          elevation: 4,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          marginRight: 10
        }}
          onPress={() => clickShowFilterModal()}
        >
          <FontAwesome name="filter" size={25} color={appColor.primary} />
          {
            SelectedFilterType == expenseFilterTypes.All ? null : <View style={{ backgroundColor: "red", width: 10, height: 10, borderRadius: 5, position: "absolute", top: 1, right: 2 }} />
          }

        </TouchableOpacity>

        {/* {!isBoss && (
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={() => navigation.navigate("Daily64")}
          >
            <Text style={styles.addExpenseButtonText}>Add New Expense</Text>
          </TouchableOpacity>
        )} */}
      </View>

      <View style={styles.listContainer}>
        {/* {dataList.length > 0 ? ( */}
          <FlatList
            data={dataList}
            keyExtractor={(item) => item._id}
            renderItem={renderExpenseItem}
            showsVerticalScrollIndicator={false}
            refreshing={IsRefreshing}
            onRefresh={()=>refreshing()}
          />
        {/* ) : null} */}
      </View>



      {
        !loading && dataList.length == 0  ? (
          <Text style={styles.noDataText}>
            {isBoss ? "No pending approvals" : "No expenses found"}
          </Text>
        ) :null
      }

      {loading ?
        <LoaderModal visible={loading} />

        : null}

        {
          showFilterModal?
          <ExpenseFilterModal
          SelectedFilterType = {SelectedFilterType}
          show={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={(type)=>handleFilterApply(type)} />
          : null
        }







      {/* <BottomToolbar /> */}
      {/* {
        !isBoss && ( */}
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              // navigation.navigate(SCREENS.CREATE_EXPENSE_SCREEN)
              navigation.navigate('Daily64')
            }}
          >
            <Ionicons name="add" size={24} color={appColor.white} />
          </TouchableOpacity>
        {/* )
      } */}


   
{
  ShowDatePickerModal?

                         <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={SelectedDate ? moment(SelectedDate, DateFormat.YYYY_MM_DD).toDate() : new Date()}
                                                        isVisible={ShowDatePickerModal}
                                                          mode={"date"}
                                                          onConfirm={(date)=>handleDateChange(date)}
                                                          onCancel={() => setShowDatePickerModal(false)}
                                                          textColor="black"
                                                          themeVariant="light" 
                                                        />
  : null
}
</SafeAreaView>
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
    bottom: 10,
    right: 40,
    height: 50,
    width: 50,
    elevation: 10,
    borderWidth:0.3,
    borderColor:"#00000020"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // paddingTop: 15,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 20,
    fontFamily: appFonts.SemiBold,
    color: appColor.primary,
  },
  addExpenseButton: {
    backgroundColor: "#486ECD",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addExpenseButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  listContainer: {
    flex: 1,
  },
  expenseItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 8,
    // borderWidth: 1,
    elevation: 2,
    // borderColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  expenseDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  expenseTextContainer: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontFamily: appFonts.SemiBold
  },
  expenseTitle: {
    fontSize: 16,
    color: "#333",
    fontFamily: appFonts.Regular

  },
  expenseDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 0,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: appFonts.Medium
  },
  noDataText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    color: appColor.black,
    fontFamily: appFonts.Medium
  },
  flatListContent: {
    // paddingBottom: 100,
  },
});

export default Expenses;