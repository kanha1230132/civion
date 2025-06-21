import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
// import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { ProjectContext } from "../utils/ProjectContext";
import moment from "moment";
import { DateFormat, screenHeight } from "../utils/Constants";
import CustomButton from "../components/button/CustomButton";
import { appFonts } from "../theme/appFonts";
import { StatusBar } from "react-native";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import useKeyboard from "../hooks/useKeyboard";
import DateTimePicker from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColor } from "../theme/appColor";
import { SafeAreaWrapper } from "../../App";

const Daily104 = ({ navigation, route }) => {
  const { InvoiceReport, setInvoiceReport } = useContext(ProjectContext);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const { keyboardOpen } = useKeyboard();

  // useEffect(()=>{
  //         setInvoiceReport({ ...InvoiceReport, fromDate: new Date().toString(),toDate:new Date().toString() });

  // },[])
  const handleFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(Platform.OS === "ios" ? false : false);
    if (selectedDate) {
      setInvoiceReport({ ...InvoiceReport, fromDate: selectedDate });
      if (Platform.OS === "android") {
        setShowFromDatePicker(false);
      }
    }
  };

  const handleToDateChange = (event, selectedDate) => {
    setShowToDatePicker(Platform.OS === "ios" ? false : false);
    if (selectedDate) {
      setInvoiceReport({ ...InvoiceReport, toDate: selectedDate });
      if (Platform.OS === "android") {
        setShowToDatePicker(false);
      }
    }
  };

  const handleNext = () => {
    console.log("setInvoiceReport : ", InvoiceReport);
    navigation.navigate("Daily108");
  };

  return (
    <SafeAreaWrapper>
        <View
          style={{
            paddingVertical: 10,
          }}
        >
          <HeaderWithBackButton
            title={"View Invoice Details"}
            onBackClick={() => navigation.goBack()}
          />
        </View>
        <View style={{flex:1}}>

        <ScrollView
          style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
          showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* <Text style={styles.expenseDetailsTitle}>View Invoice Details</Text> */}
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Client</Text>
              <TextInput
                editable={false}
                style={styles.inputBox}
                placeholder="Enter"
                value={InvoiceReport?.clientName}
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.dateField}>
                <Text style={styles.label}>From Date</Text>
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {InvoiceReport?.fromDate
                      ? moment(InvoiceReport?.fromDate).format(
                          DateFormat.MMMM_DD_YYYY
                        )
                      : "Select"}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                {showFromDatePicker && (
                  // <DateTimePicker
                  //     value={InvoiceReport?.fromDate || new Date()}
                  //     mode="date"
                  //     display="default"
                  //     onChange={handleFromDateChange}
                  // />

                  <DateTimePicker
                    testID="dateTimePicker"
                    isVisible={showFromDatePicker}
                    value={InvoiceReport?.fromDate || new Date()}
                    onConfirm={(date) => handleFromDateChange(null, date)}
                    onCancel={() => setShowFromDatePicker(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light"
                    date={InvoiceReport?.fromDate || new Date()}
                  />
                )}
              </View>
              <View style={styles.dateField}>
                <Text style={styles.label}>To Date</Text>
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>
                    {InvoiceReport?.toDate
                      ? moment(InvoiceReport?.toDate).format(
                          DateFormat.MMMM_DD_YYYY
                        )
                      : "Select"}
                  </Text>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                {showToDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    isVisible={showToDatePicker}
                    value={InvoiceReport?.toDate || new Date()}
                    onConfirm={(date) => handleToDateChange(null, date)}
                    onCancel={() => setShowToDatePicker(false)}
                    textColor="black" // Force text color (iOS 14+)
                    themeVariant="light"
                    date={InvoiceReport?.toDate || new Date()}
                  />
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Consultant Project Manager</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="Enter"
                value={InvoiceReport?.consultantProjectManager}
                onChangeText={(text) => {
                  setInvoiceReport({
                    ...InvoiceReport,
                    consultantProjectManager: text,
                  });
                }}
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Project Name</Text>
              <TextInput
                editable={false}
                style={styles.inputBox}
                placeholder="Enter"
                value={InvoiceReport?.projectName}
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Project Number</Text>
              <TextInput
                editable={false}
                style={styles.inputBox}
                placeholder="Enter"
                value={InvoiceReport?.projectNumber}
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description </Text>
              <TextInput
                style={[styles.inputBox, styles.descriptionInput]}
                placeholder="Enter"
                value={InvoiceReport?.description}
                onChangeText={(text) => {
                  setInvoiceReport({ ...InvoiceReport, description: text });
                }}
                multiline={true}
                placeholderTextColor="#aaa"
                returnKeyType="done"
              />
            </View>
          </View>
           <View
          style={[
            {
              height: 65,
              width: "90%",
              alignSelf: "center",
              backgroundColor: "#fff",
              paddingVertical: 10,
              marginBottom: 50,
            }
          ]}
        >
          <CustomButton title={"Next"} onCick={handleNext} />
        </View>
        </ScrollView>
        </View>
       
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 7,
  },
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },
  headerText: {
    fontSize: 18,
    marginLeft: 5,
    fontFamily: appFonts.Medium,
  },
  expenseDetailsTitle: {
    fontSize: 18,
    fontFamily: appFonts.SemiBold,
    color: "#486ECD",
    marginBottom: 10,
    paddingLeft: 0,
    marginTop: 10,
    marginLeft: 15,
  },
  card: {
    backgroundColor: "white",
    margin: 0,
    padding: 0,
    shadowColor: "transparent",
    elevation: 0,
    marginTop: 15,
  },
  field: {
    marginBottom: 12,
    paddingLeft: 15,
    paddingRight: 15,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingLeft: 15,
    paddingRight: 15,
  },
  dateField: {
    width: "48%",
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: "#000",
    fontFamily: appFonts.Medium,
  },
  icon: {
    marginLeft: 8,
  },
  inputBox: {
    height: 45,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 8,
    fontFamily: appFonts.Medium,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
    fontFamily: appFonts.Medium,
  },
  nextButton: {
    backgroundColor: "#486ECD",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 16,
    marginTop: 30,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Daily104;
