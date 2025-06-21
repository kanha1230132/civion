import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-elements";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { endPoints } from "../api/endPoints";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { appFonts } from "../theme/appFonts";
import CustomButton from "../components/button/CustomButton";
import { appColor } from "../theme/appColor";
import apiClient from "../api/apiClient";
import { useErrorPopupContext } from "../context/PopupProvider";
import util from "../utils/util";

const API_BASE_URL = endPoints.BASE_URL; // Replace with your API URL
const { width, height } = Dimensions.get("window");

const Daily71 = ({ route }) => {
  const navigation = useNavigation();
  const { id } = route.params; // This is the overall expense report ID
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setModalVisible] = useState(false); // Corrected state name
  const [selectedImage, setSelectedImage] = useState(null);
  const [isBoss, setIsBoss] = useState(false);
  const [totalApprovedAmount, setTotalApprovedAmount] = useState(0);
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();

  const scale = useRef(new Animated.Value(1)).current; // Ref for zoom scale


  const loadExpenseDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(endPoints.URL_GET_EXPENSES)
      setLoading(false);
      if(response == 403 || response == 401){
        const result = await showErrorPopup(response.data.message);
        if(result){
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }

      if(response.status == 200){
        if(response?.data?.status == "success"){
          const foundExpense = response?.data?.data?.find((exp) => exp._id === id);
        getTotalApprovedAmount(foundExpense);
          setData(foundExpense);
        }
      }
    } catch (error) {
      console.log("error : ",error)
      showErrorPopup("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenseDetails();
  }, [id]);



  const getTotalApprovedAmount = (list)=>{
    let total = 0;
    if (list.expenseStatus == "Approved") {
      list?.expenses.forEach((expense) => {
        total += expense.amount;
      });
    }
    // Add mileage if approved
    if (list.mileageStatus == "Approved") {
      total += list.mileageAmount || 0;
    }
    setTotalApprovedAmount(total);
  }

  const handleApproval = async (type, itemId, status) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.patch(
        `${API_BASE_URL}/expense/approve/${id}`, // Corrected URL: /api/expense/approve/:id
        { type, itemId, status }, // Send type, itemId, and status in the body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistically update the UI
      setData((prevData) => {
        const updatedData = { ...prevData };

        if (type === "expense") {
          const updatedExpenses = prevData?.expenses.map((expense) =>
            expense._id === itemId ? { ...expense, status } : expense
          );
          updatedData.expenses = updatedExpenses;
        } else if (type === "mileage") {
          updatedData.mileageStatus = status;
        }
        getTotalApprovedAmount(updatedData);
        return updatedData;
      });

      Alert.alert("Success", `${type} item ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.log("Approval error:", error);
      Alert.alert("Error", "Failed to update approval status");
    }
  };


  const handlePinchGesture = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );

  const handlePinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };
  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#486ECD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: "#ffff",
      paddingVertical: 15
    }}>
      <HeaderWithBackButton title={"Expense Details"} onBackClick={() => {
        if (route.params && route.params.onGoBack) {
          route.params.onGoBack();
        }
        navigation.goBack();
      }} />
      <ScrollView
        style={styles.container} // Important: Add flex: 1 to the ScrollView itself
        contentContainerStyle={styles.contentContainer} // Use a separate style for content
      >


        {/* Expense Details */}
        <View style={[styles.section,{marginTop:10}]}>
          <Text style={styles.sectionTitle}>Expense Information</Text>
          <Text>Employee: {data?.employeeName}</Text>
          <Text>
            Date Range: {new Date(data?.startDate).toLocaleDateString()} -{" "}
            {new Date(data?.endDate).toLocaleDateString()}
          </Text>
          <Text>Total Expense: ${data?.totalAmount.toFixed(2)}</Text>
          <Text style={styles.approvedAmount}>
            Total Approved Amount: ${totalApprovedAmount.toFixed(2)}
          </Text>
        </View>

        {/* Expense Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Items</Text>
          {data?.expenses.map((expense, index) => (
            <View key={index} style={styles.expenseCard}>
              <View style={styles.expenseContent}>
                <View>
                  <Text>{expense.title}: ${expense.amount}</Text>
                  {expense.images.map((img, imgIndex) => (
                    <TouchableOpacity
                      key={imgIndex}
                      onPress={() => openImageModal(`${img}`)} // Open modal on press
                    >
                      {console.log("img : ",img)}
                      <Image
                        source={{ uri: `${img}` }}
                        style={styles.thumbnail}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {isBoss && expense.amount > 0 && (
                  <View style={styles.approvalButtonsContainer}>
                    <View style={{
                      height: 40
                    }}>
                      <CustomButton
                        title={"Approve"}
                        bgColor={appColor.white}
                        textColor={appColor.primary}
                        onCick={() => {
                          handleApproval("expense", expense._id, "Approved")
                        }}
                      />
                    </View>

                    <View style={{
                      height: 40,
                      marginTop: 10
                    }}>
                      <CustomButton
                        title={"Reject"}
                        onCick={() => {
                          handleApproval("expense", expense._id, "Rejected")
                        }}
                      />
                    </View>

                  </View>
                )}

              </View>
              {expense.amount > 0 && expense.status && expense.status !== "Approved" && expense.status !== "Rejected" && (
                <Text style={styles.statusText}>Status: Pending</Text>
              )}

              {expense.amount > 0 && (expense.status === "Approved" || expense.status === "Rejected") && (
                <Text style={styles.statusText}>Status: {expense.status}</Text>
              )}


            </View>
          ))}
        </View>

        {/* Mileage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mileage Expense</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date Range:</Text>
            <Text style={styles.detailValue}>
              {new Date(data?.startDate).toLocaleDateString()} -{" "}
              {new Date(data?.endDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mileage Amount:</Text>
            <Text style={styles.detailValue}>
              ${data?.mileageAmount?.toFixed(2) || "0.00"}
            </Text>
          </View>

          {/* Boss Approval Buttons */}
          {isBoss && data?.mileageAmount > 0 && (
            <View style={styles.approvalButtonsContainer}>

              <Button
                title="Approve Mileage"
                buttonStyle={styles.approveButton}
                titleStyle={styles.approveButtonText}
                onPress={() => handleApproval("mileage", "mileageId", "Approved")}
              />
              <Button
                title="Reject Mileage"
                buttonStyle={styles.rejectButton}
                titleStyle={styles.rejectButtonText}
                onPress={() => handleApproval("mileage", "mileageId", "Rejected")}
              />
            </View>
          )}

          {data?.mileageAmount > 0 && data?.mileageStatus && data?.mileageStatus !== "Approved" && data.mileageStatus !== "Rejected" && (
            <Text style={styles.statusText}>Status: Pending</Text>
          )}

          {data?.mileageAmount > 0 && (data?.mileageStatus === "Approved" || data?.mileageStatus === "Rejected") && (
            <Text style={styles.statusText}>Status: {data?.mileageStatus}</Text>
          )}


        </View>

        {/* Image Modal */}
        <Modal visible={imageModalVisible} transparent={true} onRequestClose={closeImageModal}>
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <PinchGestureHandler
              onGestureEvent={handlePinchGesture}
              onHandlerStateChange={handlePinchStateChange}
            >
              <Animated.Image
                source={{ uri: selectedImage }}
                style={[styles.zoomedImage, { transform: [{ scale }] }]}
                resizeMode="contain"
              />
            </PinchGestureHandler>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the ScrollView take up the entire screen
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1, // Enable the content to grow and fill the ScrollView
    paddingBottom: 16, // Add padding at the bottom of the content
  },
  headerContainer: {
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16, // Add horizontal padding to the header container
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    marginLeft: 5,
    fontFamily: appFonts.Medium,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#486ECD",
    fontFamily: appFonts.Medium,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  section: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16, // Add horizontal margin to the section
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#486ECD",
    marginBottom: 12,
  },
  expenseCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  expenseContent: {
    flexDirection: "row", // Arrange content and buttons in a row
    justifyContent: "space-between", // Space them apart
    alignItems: "center", // Align items vertically in the center
  },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginTop: 8 },
  approvalButtonsContainer: {
    flexDirection: "column", // Stack buttons vertically
    justifyContent: "space-around", // Distribute space evenly
    //marginTop: 10, // No need for margin top, as we're using space-around
  },
  approveButton: { // Style for the button
    backgroundColor: "#fff",
    borderColor: "#486ECD",
    borderWidth: 1,
    marginBottom: 10, // Add margin bottom for gap
  },
  approveButtonText: { // Style for the button text
    color: "#486ECD",
  },
  rejectButton: {  // Style for the button
    backgroundColor: "#486ECD",
    borderColor: "#fff",
    borderWidth: 1,
  },
  rejectButtonText: {  // Style for the button text
    color: "#fff",
  },
  approvedAmount: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    marginTop: 10,
    color: "#2E7D32", // Green color for approved amount
  },
  statusText: {
    marginTop: 8,
    fontFamily: appFonts.Medium,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: appFonts.Medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: width,
    height: height / 2,
  },
});

export default Daily71;