import { Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import IconTextInput from '../../../../components/IconTextInput';
import moment from 'moment';
import CustomTextInput from '../../../../components/CustomTextInput';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { screenHeight } from '../../../../utils/Constants';
import { appFonts } from '../../../../theme/appFonts';
import { appColor } from '../../../../theme/appColor';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

const ProjectDetails = ({ dailyEntry, setDailyEntry }) => {
  const [showTempHighDropdown, setShowTempHighDropdown] = useState(false);
  const [showTempLowDropdown, setShowTempLowDropdown] = useState(false);
  const temperatures = Array.from({ length: 141 }, (_, i) => `${i - 70}°C`);
  const typeOfPicker = {
    date: "date",
    timeIn: "timeIn",
    timeOut: "timeOut",
  }
  const [ShowPickerModal, setShowPickerModal] = useState(false);
  const [selectedPickerType, setSelectedPickerType] = useState(typeOfPicker.date)

  const clickOnPicker = (type) => {
    setSelectedPickerType(type);
    setShowPickerModal(true);
  }

  const onDateChange = (event, date) => {
    if (date) {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      if (selectedPickerType === typeOfPicker.date) {
        setDailyEntry({ ...dailyEntry, selectedDate: formattedDate })
      } else if (selectedPickerType === typeOfPicker.timeOut) {
        const time = moment(date).format('HH:mm A');
        setDailyEntry({ ...dailyEntry, timeOut: time })
      } else if (selectedPickerType === typeOfPicker.timeIn) {
        const time = moment(date).format('HH:mm A');
        setDailyEntry({ ...dailyEntry, timeIn: time })
      }
    }
    setShowPickerModal(false);

  };

  return (
    <View style={{ flex: 1, paddingBottom: 60 }}>
      <IconTextInput
        onclickIcon={() => clickOnPicker(typeOfPicker.date)}
        textValue={dailyEntry.selectedDate ? moment(dailyEntry.selectedDate).format('YYYY-MM-DD') : '' || 'Select'}
        label="Date"
        iconName="calendar-outline"
        editable={false}

        
      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, location: text })}
        textValue={dailyEntry.location}
        label="Location"

      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, onShore: text })}
        textValue={dailyEntry.onShore}
        label="Onshore/Offshore"
      />


      <View style={styles.formGroupRow}>
        {/* Temp - High (°C) */}
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Temp - High (°C)</Text>
          <TouchableOpacity onPress={() => setShowTempHighDropdown(true)} style={[styles.inputRow, styles.blackBorder]}>
            <Text style={[styles.inputRowInput, dailyEntry.tempHigh !== 'Select' ? styles.selectText : styles.placeholderText]}>
              {dailyEntry.tempHigh || 'Select'}
            </Text>
            <Ionicons name="caret-down-outline" size={14} color="black" />
          </TouchableOpacity>
          <Modal visible={showTempHighDropdown} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { maxHeight: 200 }]}>
                <FlatList
                  data={temperatures}
                  keyExtractor={(item) => item}
                  getItemLayout={(data, index) => ({ length: 40, offset: 40 * index, index })}
                  initialScrollIndex={70}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setDailyEntry({ ...dailyEntry, tempHigh: item });
                        setShowTempHighDropdown(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setShowTempHighDropdown(false)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Temp - Low (°C) */}
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Temp - Low (°C)</Text>
          <TouchableOpacity onPress={() => setShowTempLowDropdown(true)} style={[styles.inputRow, styles.blackBorder]}>
            <Text style={[styles.inputRowInput, dailyEntry.tempLow !== 'Select' ? styles.selectText : styles.placeholderText]}>
              {dailyEntry.tempLow || 'Select'}
            </Text>
            <Ionicons name="caret-down-outline" size={14} color="black" />
          </TouchableOpacity>
          <Modal visible={showTempLowDropdown} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { maxHeight: 200 }]}>
                <FlatList
                  data={temperatures}
                  keyExtractor={(item) => item}
                  getItemLayout={(data, index) => ({ length: 40, offset: 40 * index, index })}
                  initialScrollIndex={70}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setDailyEntry({ ...dailyEntry, tempLow: item });
                        setShowTempLowDropdown(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity onPress={() => setShowTempLowDropdown(false)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, weather: text })}
        textValue={dailyEntry.weather}
        label="Weather Conditions"
      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, workingDay: text })}
        textValue={dailyEntry.workingDay}
        label="Working Day"
      />
      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, projectName: text })}
        textValue={dailyEntry.projectName}
        label="Project Name"
        editable={false}

      />
      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, projectNumber: text })}
        textValue={dailyEntry.projectNumber}
        label="Project Number"
        editable={false}

      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, owner: text })}
        textValue={dailyEntry.owner}
        label="Owner"
        editable={false}
      />
      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, reportNumber: text })}
        textValue={dailyEntry.reportNumber}
        label="Report Number"
      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, contractNumber: text })}
        textValue={dailyEntry.contractNumber}
        label="Contract Number"
        // keyboardType="numeric"
      />
      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, contractor: text })}
        textValue={dailyEntry.contractor}
        label="Contractor"
      />
      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, siteInspector: text })}
        textValue={dailyEntry.siteInspector}
        label="Site Inspector"
      />

      <View style={styles.formGroupRow}>
        {/* Inspector In Time */}
        <View style={styles.formGroupHalf}>
          <IconTextInput 
           iconName={"time-outline"}
           onclickIcon={() => clickOnPicker(typeOfPicker.timeIn)}
           textValue={dailyEntry.timeIn}
           label={'Time In'}
           editable={false}

           />
        </View>

        {/* Inspector Out Time */}
        <View style={styles.formGroupHalf}>
        <IconTextInput 
           iconName={"time-outline"}
           onclickIcon={() => clickOnPicker(typeOfPicker.timeOut)}
           textValue={dailyEntry.timeOut}
           label={'Time Out'}
           editable={false}
           />
        </View>
      </View>

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, ownerContact: text })}
        textValue={dailyEntry.ownerContact}
        label="Owner Contact"
        // keyboardType="numeric"
      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, ownerProjectManager: text })}
        textValue={dailyEntry.ownerProjectManager}
        label="Owner Project Manager"
      />

      <CustomTextInput
        onChangeTextValue={(text) => setDailyEntry({ ...dailyEntry, component: text })}
        textValue={dailyEntry.component}
        label="Component"
      />

      {
        ShowPickerModal ?

        <DateTimePicker
        testID="dateTimePicker"
        isVisible={ShowPickerModal}
          value={selectedPickerType == typeOfPicker.date ? (dailyEntry?.selectedDate ? new Date(dailyEntry.selectedDate) : new Date()) : ( new Date())}
          mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
          onConfirm={(date)=> onDateChange(null, date)}
          onCancel={() => setShowPickerModal(false)}
          textColor="black" // Force text color (iOS 14+)
          themeVariant="light" 
          date={selectedPickerType == typeOfPicker.date ? (dailyEntry?.selectedDate ? new Date(dailyEntry.selectedDate) : new Date()) : ( new Date())}
        /> : null

      

       
          // <DateTimePicker
          //   value={selectedPickerType == typeOfPicker.date ? (dailyEntry?.selectedDate ? new Date(dailyEntry.selectedDate) : new Date()) : ( new Date())}
          //   mode={selectedPickerType == typeOfPicker.date ? "date" : "time"}
          //   onChange={onDateChange}
          // />
        // : null
      }
    </View>
  )
}

export default ProjectDetails

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    position: 'absolute',
    top: screenHeight-85-StatusBar.currentHeight,
    paddingTop: 10,
    backgroundColor: '#fff',
    height: 60,
    width: '100%'
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 80
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#486ECD',
    fontSize: 16,
  },
  projectDetailsContainer: {
    marginBottom: 10,
    marginHorizontal: 10,
    marginTop: 10
  },
  projectDetailsTitle: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 10
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#d3d3d3",
    alignItems: "center",
    justifyContent: "center",
  },
  activeCircle: {
    borderColor: '#486ECD', // Highlight the active step,
    backgroundColor: '#486ECD',
  },
  progressText: {
    fontSize: 16,
    color: "#000",
    fontFamily: appFonts.Medium
  },
  activeText: {
    color: appColor.white,
    fontFamily: appFonts.Medium
  },
  progressLine: {
    height: 2,
    // flex: 1,
    width: '10%',
    backgroundColor: "#d3d3d3",
    marginHorizontal: 2
  },
  completedLine: {
    backgroundColor: '#486ECD', // Change color for completed lines
  },
  sectionTitle: {
    fontSize: 18,
    color: '#486ECD',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 15,
  },
  formGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  formGroupHalf: {
    width: '48%',
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    color: '#000',
    fontFamily: appFonts.Medium,

  },
  input: {
    borderWidth: 1,
    borderColor: '#000', // Set border color to black
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    paddingHorizontal: 10
  },
  inputRowInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,

  },
  placeholderText: {
    color: 'grey',
    fontFamily: 'Roboto',
  },
  selectText: {
    color: 'black',
    fontFamily: 'Roboto',
  },
  nextButton: {
    borderRadius: 10,
    alignItems: 'center',
    height: 45,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#486ECD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});