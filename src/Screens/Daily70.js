import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { endPoints } from "../api/endPoints";
import {  SafeAreaView } from "react-native-safe-area-context";
import { appColor } from "../theme/appColor";
import { appFonts } from "../theme/appFonts";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import CustomButton from "../components/button/CustomButton";
import apiClient from "../api/apiClient";
import util from "../utils/util";
import { useErrorPopupContext } from "../context/PopupProvider";
import { SCREENS } from "../utils/ScreenNames";
import LoaderModal from "../components/modal/Loader";

const Daily70 = ({ route, navigation }) => {
  const { id, isBoss, Expense } = route?.params || {};
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();

  useEffect(() => {
    setData(Expense);
  }, [id, navigation]);

  const handleApproval = async (type, status) => {
    try {
      setLoading(true);
      console.log("first",  {
        type,
        status
      })

      const response = await apiClient.patch(`${endPoints.URL_EXPENSE_APPROVE}/${id}`, {
        type,
        status
      });
      setLoading(false);
      
      console.log("resopnse : ", response);
      if (response.status == 403 || response.status == 401) {
        const result = await showErrorPopup(response.data.message);
        if (result) {
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }
      const updatedData = { ...data, [`${type}Status`]: status };
      setData(updatedData);
      showSuccessPopup(`${type} ${status.toLowerCase()}`);
    } catch (error) {
      showErrorPopup("Approval failed");
    } finally {
      setLoading(false);

    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#28a745";
      case "Rejected":
        return "#dc3545";
      default:
        return "#ffc107";
    }
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: appColor.white,
      paddingVertical: 6
    }}>
      <HeaderWithBackButton customStyle={{ marginLeft: -7, paddingVertical: 10 }} title="Expense Details" onBackClick={() => navigation.goBack()} />


      <ScrollView contentContainerStyle={styles.container}>

        {/* All Original Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.inputHeading}>Employee Name</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>{data?.employeeName || "N/A"}</Text>
          </View>

          <Text style={styles.inputHeading}>Date Range</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>
              {data?.startDate
                ? new Date(data?.startDate).toLocaleDateString()
                : "N/A"}{" "}
              - {new Date(data?.endDate).toLocaleDateString()}
            </Text>
          </View>

          <Text style={styles.inputHeading}>Details of Expenditure</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>{data?.expenditure || "N/A"}</Text>
          </View>

          <Text style={styles.inputHeading}>Project Number</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>{data?.projectNumber || "N/A"}</Text>
          </View>

          <Text style={styles.inputHeading}>Category</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>{data?.category || "N/A"}</Text>
          </View>

          <Text style={styles.inputHeading}>Task</Text>
          <View style={styles.inputLineContainer}>
            <Text style={styles.inputLineText}>{data?.task || "N/A"}</Text>
          </View>
        </View>

        {/* Approval Section */}
        {isBoss && (
          <View style={styles.approvalSection}>
            <Text style={styles.sectionTitle}>Approval Actions</Text>

            {
              data?.mileageAmount > 0 &&

              <>

                {/* Mileage Status Badge */}
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Mileage Status:</Text>
                  <View style={{
                    backgroundColor: getStatusColor(data?.mileageStatus),
                    borderRadius: 50,
                    padding: 2,
                    elevation: 4
                  }}>
                    <Text style={{ color: appColor.white, fontFamily: appFonts.Regular, paddingHorizontal: 5 }}>{data?.mileageStatus}</Text>
                  </View>
                </View>
                {
                  data?.mileageStatus === "Pending" &&
                  <View style={styles.buttonRow}>
                    <CustomButton bgColor={"#28a745"} title={"Approve Mileage"} onCick={() => handleApproval("mileage", "Approved")} />
                    <CustomButton bgColor={"#dc3545"} title={"Reject Mileage"} onCick={() => handleApproval("mileage", "Rejected")} />
                  </View>
                }

              </>
            }



            {/* Expense Status Badge */}
            <View style={[styles.statusRow, { marginTop: 10 }]}>
              <Text style={styles.statusLabel}>Expense Status:</Text>
              <View style={{
                backgroundColor: getStatusColor(data?.expenseStatus),
                borderRadius: 50,
                padding: 2,
                elevation: 4
              }}>
                <Text style={{ color: appColor.white, fontFamily: appFonts.Regular, paddingHorizontal: 5 }}>{data?.expenseStatus}</Text>
              </View>
            </View>
            {
              data?.expenseStatus === "Pending" &&
              <View style={styles.buttonRow}>
                <CustomButton bgColor={"#28a745"} title={"Approve Expense"} onCick={() => handleApproval("expense", "Approved")} />
                <CustomButton bgColor={"#dc3545"} title={"Reject Expense"} onCick={() => handleApproval("expense", "Rejected")} />
              </View>
            }

          </View>
        )}

        {/* Original Next Button */}
        <View style={{
          marginVertical: 15
        }}>
          <CustomButton title={"View Full Details"} onCick={() => navigation.navigate("Daily71", { id, expenses: data.expenses, totalAmount: data.totalAmount })} />
        </View>




      </ScrollView>


      {loading ?
        <LoaderModal visible={loading} />

        : null}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    marginTop: 30,
    marginBottom: 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontFamily: appFonts.Medium,
    color: "#000000",
    marginLeft: 10,
  },
  formContainer: {
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: appFonts.Medium,
    color: "#486ECD",
    marginBottom: 15,
  },
  inputHeading: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#000000",
    // marginBottom: 5,
    marginTop: 5,
  },
  inputLineContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    marginBottom: 5,
  },
  inputLineText: {
    fontSize: 15,
    color: "#333",
    fontFamily: appFonts.Regular,
  },
  nextButton: {
    backgroundColor: "#486ECD",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontSize: 18,
    color: "red",
  },
  approvalSection: {
    marginTop: 25,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    // borderWidth: 1,
    // borderColor: "#E5E7EB",
    elevation: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  approveButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingHorizontal: 15,
    flex: 1,
  },
  rejectButton: {
    backgroundColor: "#dc3545",
    borderRadius: 8,
    paddingHorizontal: 15,
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontFamily: appFonts.SemiBold,
    color: "#333",
    marginRight: 10,
  },
});

export default Daily70;