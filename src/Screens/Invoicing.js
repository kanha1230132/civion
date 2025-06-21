import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import BottomToolbar from "./BottomToolbar"; // Import BottomToolbar
import { endPoints } from "../api/endPoints";
import apiClient from "../api/apiClient";
import { appColor } from "../theme/appColor";
import { SCREENS } from "../utils/ScreenNames";
import util from "../utils/util";
import moment from "moment/moment";
import { DateFormat } from "../utils/Constants";
import FilterButton from "../components/button/filterButton";
import FilterModal from "../components/modal/filterModal";
import { ProjectContext } from "../utils/ProjectContext";
import Icon from "react-native-vector-icons/FontAwesome";
import ExcelModal from "../components/modal/ExcelModal";
import { appFonts } from "../theme/appFonts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useErrorPopupContext } from "../context/PopupProvider";
import { SafeAreaWrapper } from "../../App";

const Invoicing = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [filterProductList, setFilterProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isErrorMessage, setIsErrorMessage] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  const { setWeeklyReport, setInvoiceReport } = useContext(ProjectContext);
  const { showErrorPopup, showSuccessPopup } = useErrorPopupContext();

  // Fetch invoices from mock API
  useEffect(() => {
    setInvoiceReport(undefined);
    setIsErrorMessage("");
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(endPoints.URL_GET_ALL_PROJECTS);
      console.log("response :", response.data);
      if (response.status == 401 || response.status == 403) {
        const result = await showErrorPopup(response.data.message);
        if (result) {
          util.logoutUser();
          navigation.navigate(SCREENS.LOGIN_SCREEN);
        }
        return;
      }
      if (response.status == 200 || response.status == 201) {
        const output = response.data;
        if (output.status == "success") {
          if (output.data?.length) {
            let list = output.data;
            list.sort(
              (a, b) =>
                new Date(b.projectId.startDate) -
                new Date(a.projectId.startDate)
            );
            setInvoices(list);
            setFilterProductList(list);
            setIsErrorMessage("");
          } else {
            setIsErrorMessage("Projects not found");
          }
        } else {
          setIsErrorMessage(output.message);
        }
      } else {
        console.log("Something went wrong");
        setIsErrorMessage("Something went wrong");
      }
    } catch (error) {
      console.log("Error fetching invoices:", error);
      setIsErrorMessage("Something went wrong");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = (fromdate, todate, projectId) => {
    console.log(fromdate, todate, projectId);
    if (!fromdate && !todate && !projectId) {
      setFilterProductList(invoices);
      return;
    }
    const list = [];
    const projects = [...invoices];
    for (const item of projects) {
      const startDate = new Date(item.projectId.startDate);
      const endDate = new Date(
        item.projectId?.endDate ? item.projectId.endDate : new Date()
      );
      let tempItem;
      if (projectId) {
        if (item._id == projectId) {
          tempItem = item;
        } else {
          continue;
        }
      }
      if (fromdate && todate) {
        if (startDate >= new Date(fromdate) && endDate <= new Date(todate)) {
          tempItem = item;
        } else {
          tempItem = null;
        }
      }

      if (tempItem) {
        list.push(tempItem);
      }
    }
    setFilterProductList(list);
  };

  const generateExcel = () => {
    setShowExcelModal(true);
  };

  const renderInvoiceItem = ({ item }) => {
    const startDate = item?.projectId?.startDate
      ? moment(item.projectId.startDate).format(DateFormat.MMMM_DD_YYYY)
      : "";
    const endDate = item?.projectId?.endDate
      ? moment(item.projectId.endDate).format(DateFormat.MMMM_DD_YYYY)
      : "";
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          setWeeklyReport(item);
          const invoice = {
            fromDate: new Date(),
            toDate: new Date(),
            clientName: item.owner,
            consultantProjectManager: "",
            projectName: item?.projectId?.projectName,
            projectNumber: item?.projectId?.projectNumber,
            description: "",
            projectId: item?.projectId?._id,
          };
          setInvoiceReport(invoice);

          navigation.navigate("Daily104", { project: item });
        }}
      >
        <View style={styles.invoiceItemContainer}>
          <View style={styles.invoiceDetails}>
            <View style={styles.iconContainer}>
              <FontAwesome name="file" size={20} color="#4A90E2" />
            </View>
            <View style={styles.invoiceTextContainer}>
              <Text style={styles.invoiceTitle}>{item?.projectName}</Text>
              <Text style={styles.invoiceClient}>Client: {item.owner}</Text>
              <Text style={styles.invoiceDateRange}>
                {startDate} - {endDate}
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={20} color="#000" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
  <SafeAreaWrapper>
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // Adjust this value as needed
    style={{flex: 1}}
  >
    <View style={{flex: 1}}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Invoicing</Text>
        <TouchableOpacity
          onPress={() => generateExcel()}
          style={{
            backgroundColor: "#4A90E2",
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Icon name="file-excel-o" size={25} color={appColor.white} />
          <Text
            style={{
              color: "#fff",
              marginLeft: 10,
              fontFamily: appFonts.Medium,
            }}
          >
            Generate Excel
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingRight: 10,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={styles.listTitle}>List of Projects</Text>
        <FilterButton onPress={() => setShowFilterModal(true)} />
      </View>

      {loading ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <ActivityIndicator
            size="large"
            color="#4A90E2"
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <FlatList
          data={filterProductList}
          keyExtractor={(item) => item._id}
          renderItem={renderInvoiceItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.invoiceList}
        />
      )}

      {!loading && isErrorMessage ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: appColor.black,
              fontFamily: appFonts.Medium,
            }}
          >
            {isErrorMessage}
          </Text>
        </View>
      ) : null}

      {showFilterModal && (
        <FilterModal
          showFilterModal={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          projects={invoices}
          onApply={(fromDate, toDate, selectedProjectId) => {
            setShowFilterModal(false);
            filterProjects(fromDate, toDate, selectedProjectId);
          }}
        />
      )}

      {showExcelModal ? (
        <ExcelModal
          showExcelModal={showExcelModal}
          showErrorPopup={showErrorPopup}
          showSuccessPopup={showSuccessPopup}
          setShowExcelModal={setShowExcelModal}
          onClose={() => setShowExcelModal(false)}
        />
      ) : null}
    </View>
  </KeyboardAvoidingView>
</SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    color: appColor.primary,
    fontFamily: appFonts.Medium,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: appFonts.Bold,
    marginBottom: 8,
    color: "#333",
    marginLeft: 10,
  },
  invoiceList: {
    paddingBottom: 50,
    // backgroundColor: 'red',
  },
  invoiceItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 12,

    marginLeft: 10,
    marginRight: 10,
    elevation: 2,
  },
  invoiceDetails: {
    flexDirection: "row",
    alignItems: "center",
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
  invoiceTextContainer: {
    flexDirection: "column",
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: appFonts.SemiBold,
    color: "#333",
  },
  invoiceClient: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: appFonts.Medium,
  },
  invoiceDateRange: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: appFonts.Medium,
  },
});

export default Invoicing;
