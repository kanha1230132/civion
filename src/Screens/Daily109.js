import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ProjectContext } from "../utils/ProjectContext";
import moment from "moment";
import apiClient from "../api/apiClient";
import { endPoints } from "../api/endPoints";
import { useErrorPopup } from "../components/popup/errorPopup";
import { useSuccessPopup } from "../components/popup/successPopup";
import { SCREENS } from "../utils/ScreenNames";
import LoaderModal from "../components/modal/Loader";
import HeaderWithBackButton from "../components/HeaderWithBackButton";
import { appFonts } from "../theme/appFonts";
import CustomButton from "../components/button/CustomButton";
import { screenHeight } from "../utils/Constants";
import { appColor } from "../theme/appColor";
import useKeyboard from "../hooks/useKeyboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaWrapper } from "../../App";

const Daily109 = () => {
  const navigation = useNavigation();
  const [selectedInspector, setSelectedInspector] = useState();
  const { InvoiceReport, setInvoiceReport } = useContext(ProjectContext);
  const [loading, setLoading] = useState(false);
  const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
  const { SuccessPopup, showSuccessPopup, isSuccessVisible } =
    useSuccessPopup();
  const { keyboardOpen } = useKeyboard();
  const [invoiceReportList, setInvoiceReportList] = useState()

  useEffect(() => {
    setSelectedInspector(InvoiceReport?.siteInspectors[0]);
    setInvoiceReportList({...InvoiceReport})
  }, [InvoiceReport]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let subTotal = 0;
      let totalAmount = 0;
      let totalBillableHours = 0;
      invoiceReportList?.siteInspectors?.map((item) => {
        subTotal += item.subTotal;
        totalAmount += item.total;
        totalBillableHours += item.totalBillableHours
          ? Number(item.totalBillableHours)
          : 0;
      });

      const siteInspectors = [];
      invoiceReportList?.siteInspectors?.map((item) => {
        siteInspectors.push({
          userId: item.userId,
          userName: item.name,
          totalHours: item.totalHours,
          totalBillableHours: item.totalBillableHours
            ? Number(item.totalBillableHours)
            : 0,
          rate: item.rate,
          subTotal: item.subTotal,
          total: item.total,
        });
      });

      const requestBody = {
        clientName: invoiceReportList?.clientName,
        fromDate: invoiceReportList?.fromDate,
        toDate: invoiceReportList?.toDate,
        invoiceTo: invoiceReportList?.consultantProjectManager,
        projectName: invoiceReportList?.projectName,
        projectId: invoiceReportList?.projectId,
        clientPOReferenceNumber: invoiceReportList?.projectNumber,
        description: invoiceReportList?.description,
        userDetails: siteInspectors, // Array of user details provided by frontendr,  // Array of user details provided by frontend
        subTotal: Number(subTotal?.toFixed(1)),
        totalAmount: Number(totalAmount?.toFixed(1)),
        totalBillableHours: totalBillableHours,
      };

      const response = await apiClient.post(
        endPoints.URL_CREATE_INVOICE,
        requestBody
      );
      if (response.status == 200 || response.status == 201) {
        if (response.data.status) {
          setLoading(false);

          showSuccessPopup(
            response.data?.message || "Invoice created successfully!"
          ).then((res) => {
            console.log("res", res);
            setInvoiceReport(undefined);
            navigation.navigate("Invoicing");
          });
        }
      } else {
        const message = response.data?.message || "Failed to save entry";
        setLoading(false);

        showErrorPopup(message);
      }
    } catch (error) {
      if (error.response) {
        console.log("Server Response Error:", error.response.data);
        showErrorPopup(
          `Failed to submit: ${
            error.response.data.message || "Invalid request."
          }`
        );
      } else if (error.request) {
        showErrorPopup("No response from the server. Check your network.");
        console.log(" No Response from Server:", error.request);
      } else {
        showErrorPopup("Something went wrong. Please try again.");
        console.log("Request Setup Error:", error.message);
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
       <SafeAreaWrapper>
      {/* Header Section */}
 
      <View style={{ marginVertical: 13 }}>
        <HeaderWithBackButton
          title="Invoice Preview Details"
          onBackClick={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
              style={[styles.scrollContainer,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                      keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
      >
        {/* Client and Project Details */}
        <View style={styles.detailContainer}>
          <Text style={styles.label}>Client Name</Text>
          <Text style={styles.detailText}>{invoiceReportList?.clientName}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>From Date</Text>
          <Text style={styles.detailText}>
            {moment(invoiceReportList?.fromDate).format("MMMM DD, YYYY")}
          </Text>
          <View style={styles.divider} />

          <Text style={styles.label}>To Date</Text>
          <Text style={styles.detailText}>
            {moment(invoiceReportList?.toDate).format("MMMM DD, YYYY")}
          </Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Invoice To</Text>
          <Text style={styles.detailText}>
            {invoiceReportList?.consultantProjectManager}
          </Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Project Name</Text>
          <Text style={styles.detailText}>{invoiceReportList?.projectName}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Client PO/Reference Number</Text>
          <Text style={styles.detailText}>{invoiceReportList?.projectNumber}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Description</Text>
          <Text style={styles.detailText}>{invoiceReportList?.description}</Text>
        </View>

        {/* Inspector Name & Their Details */}
        <Text style={styles.sectionTitle}>Inspector Name & Their Details</Text>

        {/* Horizontal Scroll for Inspector Names */}
        <ScrollView
          horizontal
              style={[styles.nameScroll,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                      keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
        >
          {invoiceReportList?.siteInspectors?.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedInspector(item)}
              style={styles.nameContainer}
            >
              <Text
                style={[
                  styles.nameText,
                  selectedInspector?.name === item?.name &&
                    styles.activeNameText,
                ]}
              >
                {item?.name}
              </Text>
              <View
                style={[
                  styles.underline,
                  selectedInspector?.name === item?.name &&
                    styles.activeUnderline,
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Work Details Section */}
        <View style={styles.workDetailsContainer}>
          <Text style={styles.label}>Total Hours Worked</Text>
          <Text style={styles.detailText}>{selectedInspector?.totalHours}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Total Billable Hours</Text>
          <Text style={styles.detailText}>
            {selectedInspector?.totalBillableHours}
          </Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Rate</Text>
          <Text style={styles.detailText}>{selectedInspector?.rate}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Sub Total</Text>
          <Text style={styles.detailText}>{selectedInspector?.subTotal}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Total</Text>
          <Text style={styles.detailText}>{selectedInspector?.total}</Text>
        </View>

        {/* Available Entries Section */}
        {invoiceReportList?.workFromEntry?.length > 0 && (
          <View style={styles.entryContainer}>
            <Text style={styles.entryText}>
              {invoiceReportList?.workFromEntry?.length} Daily Dairy Entries
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(SCREENS.WORK_FROM_ENTRY, {
                  workFromEntry: invoiceReportList?.workFromEntry,
                })
              }
            >
              <MaterialIcons name="arrow-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}


          <View
        style={[
          styles.buttonContainer,
          { gap: 10 }
        ]}
      >
        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title="Previous"
            onCick={() => {
              navigation.goBack();
            }}
            bgColor="#fff"
            textColor={appColor.primary}
          />
        </View>
        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title={"Submit"}
            onCick={() => {
              handleSubmit();
            }}
          />
        </View>
      </View>
      </ScrollView>

    

      {errorPopupVisible ? ErrorPopup() : null}
      {isSuccessVisible ? SuccessPopup() : null}

      <LoaderModal visible={loading} />
      </SafeAreaWrapper>
      // </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: appFonts.Medium,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  detailContainer: {
    marginBottom: 16,
    borderWidth: 0.2,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#000",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    fontFamily: appFonts.Medium,
  },
  divider: {
    height: 1,
    backgroundColor: "#D3D3D3",
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#486ECD",
    fontFamily: appFonts.Medium,
    marginVertical: 20,
  },
  nameScroll: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  nameContainer: {
    alignItems: "center",
    marginRight: 15,
  },
  nameText: {
    fontSize: 16,
    color: "#333",
    fontFamily: appFonts.Medium,
  },
  activeNameText: {
    color: "#486ECD",
    fontFamily: appFonts.Medium,
  },
  underline: {
    height: 2,
    width: "100%",
    backgroundColor: "#D3D3D3",
    marginTop: 5,
  },
  activeUnderline: {
    backgroundColor: "#486ECD",
  },
  workDetailsContainer: {
    marginBottom: 50,
    borderWidth: 0.2,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
    elevation: 2,
  },
  entryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#FFD700",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginVertical: 1,
    elevation: 3,
    marginBottom: 40,
  },
  entryText: {
    fontSize: 14,
    color: "#000",
    fontFamily: appFonts.Medium,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 15,
    // position: "absolute",
    //  top: screenHeight-85-StatusBar.currentHeight,
    paddingTop: 10,
    backgroundColor: "#fff",
    height: 60,
    width: "100%",
    marginBottom:50
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#486ECD",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: "#486ECD",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#486ECD",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: appFonts.Medium,
    color: "#fff",
  },
  savePdfButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#486ECD",
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
    margin: 20,
  },
  savePdfButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontFamily: appFonts.Medium,
  },
});

export default Daily109;
