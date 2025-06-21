import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ProjectContext } from '../utils/ProjectContext';
import { endPoints } from '../api/endPoints';
import moment from 'moment';
import { DateFormat, screenHeight } from '../utils/Constants';
import apiClient from '../api/apiClient';
import { getWeeklyList } from './Invoice/data';
import { SCREENS } from '../utils/ScreenNames';
import LoaderModal from '../components/modal/Loader';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { appFonts } from '../theme/appFonts';
import { ScrollView } from 'react-native-gesture-handler';
import CustomTextInput from '../components/CustomTextInput';
import IconTextInput from '../components/IconTextInput';
import CustomButton from '../components/button/CustomButton';
import { appColor } from '../theme/appColor';
import useKeyboard from '../hooks/useKeyboard';
import { SafeAreaWrapper } from '../../App';

const Daily108 = () => {
  const { InvoiceReport, setInvoiceReport } = useContext(ProjectContext);
  const [selectedInspector, setSelectedInspector] = useState();
  const [siteInspectors, setSiteInspectors] = useState([]);
  const [workFromEntry, setWorkFromEntry] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { keyboardOpen } = useKeyboard();
  const navigation = useNavigation();

  useEffect(() => {
    getReportData();
    console.log("InvoiceReport  : ",InvoiceReport)
  }, []);

  const getReportData = async () => {
    try {
      const { fromDate, toDate, projectId } = InvoiceReport || {};
      if (!fromDate || !toDate || !projectId) {
        console.log("Error: Missing required fields in invoiceReport",InvoiceReport);
        return;
      }


      const param = {
        projectId: projectId,
        filter: {
          startDate: moment(fromDate).format(DateFormat.YYYY_MM_DD),
          endDate: moment(toDate).format(DateFormat.YYYY_MM_DD),
        },
      };

      setIsLoading(true);
      console.log("param : ", param);

      const response = await apiClient.post(endPoints.URL_GET_INVOICE_WEEKLY_REPORT, param);

      if (response?.status === 200 || response?.status === 201) {
        if (response.data?.status === "success") {
          const output = response.data.data || [];
          console.log("output : ", output)
          const uniqueArray = [...new Map(output.map((item) => [item._id, item])).values()];
          filterData(uniqueArray);
        } else {
          console.log("Error: Unsuccessful response status");
        }
      } else {
        console.log("Error: Failed to fetch data, status code:", response?.status);
      }
    } catch (error) {
      console.log("Error : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = (data) => {
    const inspectorMap = new Map();
    const wfMap = new Map();
    const dailySet = new Map();
    const dairySet = new Map();

    data.map((list) => {
         const weekList = list.weeklyReport;
         weekList.dailyEntries.map((item) => {
           if(!dailySet.has(item._id)){
             dailySet.set(item._id, item);
           }
         })
         weekList.dailyDiary.map((item) => {
           if(!dairySet.has(item._id)){
             dairySet.add(item._id, item);
           }
         })
       
    })
      Array.from(dairySet.values()).map((item) => {
        wfMap.set(item.selectedDate, item);
      });

      console.log("dailySet : ",Array.from(dailySet.values()))

      Array.from(dailySet.values()).map((item) => {
        if (item?.siteInspector) {
          if (inspectorMap.has(item.userId)) {
            let temp = inspectorMap.get(item.userId);
            const totalHours = item?.timeIn && item?.timeOut ? calculateTotalHours(item?.timeIn, item?.timeOut) : 0;
            console.log("totalHours1 : ", totalHours);
            
            temp.totalHours += totalHours ? Number(totalHours) : 0;
            temp.totalBillableHours += totalHours ? Number(totalHours) : 0;
            inspectorMap.set(item.userId, temp);
          } else {
            const totalHours = item?.timeIn && item?.timeOut ? calculateTotalHours(item?.timeIn, item?.timeOut) : 0;
            console.log("totalHours : ", totalHours);
            const param = {
              name: item.siteInspector,
              userId: item.userId,
              totalHours,
              totalBillableHours: totalHours,
              rate: 0,
              subTotal: 0,
              total: 0,
            };
            inspectorMap.set(item.userId, param);
          }
        }
      });

      console.log("dairySet : ", dailySet);


    setWorkFromEntry(Array.from(wfMap.values()));
    const inspectors = Array.from(inspectorMap.values());
    setSiteInspectors(inspectors);
    setSelectedInspector(inspectors[0]);
    setIsLoading(false);
  };

  const calculateTotalHours = (timeIn, timeOut) => {
    const format = (time) => new Date(`1970-01-01T${convertTo24Hour(time)}:00`);
    const convertTo24Hour = (time) => {
      const [t, modifier] = time.split(" ");
      console.log("time.split() : ", time.split(" "));
      let [hours, minutes] = t.split(":");
      // if (hours === "12") hours = "00";
      // if (modifier === "PM") hours = parseInt(hours, 10);
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    };

    const inTime = format(timeIn);
    const outTime = format(timeOut);
    const diffMs = Math.abs(outTime - inTime);

    const diffHours = diffMs / (1000 * 60 * 60);
    return Number(diffHours.toFixed(1));
  };

  const changeRate = (value) => {
    let selectedInspectorCopy = { ...selectedInspector };
    selectedInspectorCopy.rate = value;
    selectedInspectorCopy.subTotal = value * selectedInspectorCopy.totalHours;
    selectedInspectorCopy.total = value * selectedInspectorCopy.totalBillableHours;
    setSelectedInspector(selectedInspectorCopy);

    let inspectorsCopy = [...siteInspectors];
    let index = inspectorsCopy.findIndex((item) => item.userId === selectedInspectorCopy.userId);
    if (index !== -1) {
      inspectorsCopy[index] = { ...selectedInspectorCopy };
    }
    setSiteInspectors(inspectorsCopy);
  };

  const changeBillableHours = (value) => {
    let selectedInspectorCopy = { ...selectedInspector };
    selectedInspectorCopy.totalBillableHours = value;
    selectedInspectorCopy.total = value * selectedInspectorCopy.rate;
    setSelectedInspector(selectedInspectorCopy);

    let inspectorsCopy = [...siteInspectors];
    let index = inspectorsCopy.findIndex((item) => item.userId === selectedInspectorCopy.userId);
    if (index !== -1) {
      inspectorsCopy[index] = { ...selectedInspectorCopy };
    }
    setSiteInspectors(inspectorsCopy);
  };

  const handlePreview = () => {
    const data = { ...InvoiceReport, workFromEntry, siteInspectors };
    setInvoiceReport(data);
    navigation.navigate('Daily109');
  };

  return (
    
      <SafeAreaWrapper>
      {/* <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      > */}
        {/* Header Section */}
        <View
          style={{
            paddingVertical: 10,
          }}
        >
          <HeaderWithBackButton
            title="View Invoice Details"
            onBackClick={() => navigation.goBack()}
          />
        </View>

        <Text style={styles.sectionTitle}>Inspector Name & Their Details</Text>

        {/* Horizontal Scroll for Inspector Names */}

      
          {siteInspectors.length > 0 ? (
              <View
          style={{
            height: 40,
            marginBottom: 10,

          }}
        >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.nameScroll}
            >
              {siteInspectors?.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedInspector(item)}
                  style={styles.nameContainer}
                >
                  <Text
                    style={[
                      styles.nameText,
                      selectedInspector?.name === item.name &&
                        styles.activeNameText,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.underline,
                      selectedInspector?.name === item.name &&
                        styles.activeUnderline,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
        </View>

          ) : null}


        {/* Details Section */}
        <ScrollView
          showsVerticalScrollIndicator={false}
              style={[styles.scrollContainer,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                      keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
        >
            <CustomTextInput
              textValue={selectedInspector?.totalHours?.toString()}
              label="Total Hours Worked"
              editable={false}
              keyboardType="numeric"
            />

            <IconTextInput
              textValue={selectedInspector?.totalBillableHours?.toString()}
              label="Total Billable Hours"
              iconName="pencil"
              onChangeTextValue={changeBillableHours}
              keyboardType="numeric"
            />

            <IconTextInput
              textValue={selectedInspector?.rate?.toString()}
              label="Rate"
              iconName="pencil"
              onChangeTextValue={changeRate}
              keyboardType="numeric"
            />

            <CustomTextInput
              textValue={selectedInspector?.subTotal?.toString()}
              label="Sub Total"
              editable={false}
              keyboardType="numeric"
            />

            <CustomTextInput
              textValue={selectedInspector?.total?.toString()}
              label="Total"
              editable={false}
              keyboardType="numeric"
            />

          {workFromEntry.length > 0 && (
            <View style={styles.entryContainer}>
              <Text style={styles.entryText}>
                {workFromEntry.length} Daily Dairy Entries
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(SCREENS.WORK_FROM_ENTRY, {
                    workFromEntry,
                  });
                }}
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
              title="Preview"
              onCick={() => {
                handlePreview();
              }}
            />
          </View>
        </View>
        </ScrollView>

        
      {/* </KeyboardAvoidingView> */}
      {isLoading ? <LoaderModal visible={isLoading} /> : null}

      </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      // paddingHorizontal: 15,
      // position: 'absolute',
      // top: screenHeight-85-StatusBar.currentHeight,
      paddingTop: 10,
      backgroundColor: '#fff',
      height: 60,
      width: '100%',
      marginTop: 50
    },
  container: {
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
    fontFamily:appFonts.Medium,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#486ECD',
    fontFamily:appFonts.Medium,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  nameScroll: {
    paddingHorizontal: 16,
  },
  nameContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  nameText: {
    fontSize: 16,
    color: '#333',
     fontFamily:appFonts.Medium,
  },
  activeNameText: {
    color: '#486ECD',
    fontFamily:appFonts.Medium,
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#D3D3D3', // Grey color for unselected
    marginTop: 5,
  },
  activeUnderline: {
    backgroundColor: '#486ECD', // Blue color for selected
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  detailItem: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontFamily:appFonts.Medium,
    color: '#000',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily:appFonts.Medium,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FFD700', // Brighter yellow border
    backgroundColor: '#FFF8E1', // Softer yellow background
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  entryText: {
    fontSize: 14,
    color: '#000', // Black text color for readability
    fontFamily:appFonts.Medium,
  },

  previousButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#486ECD',
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: '#486ECD',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily:appFonts.Medium,
    color: '#486ECD',
  },
  previewButtonText: {
    fontSize: 16,
    fontFamily:appFonts.Medium,
    color: '#fff',
  },
});

export default Daily108;
