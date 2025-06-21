import { View, Text } from 'react-native'
import React, { useState } from 'react'
import IconTextInput from '../../../components/IconTextInput'
import CustomTextInput from '../../../components/CustomTextInput'
import { StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'; 
import moment from 'moment'

const ExpenseDetails = ({ expenseEntry, setExpenseEntry }) => {
    const typeOfPicker = {
        startDate: "startDate",
        endDate: "endDate"
    }
    const [ShowPickerModal, setShowPickerModal] = useState(false);
    const [selectedPickerType, setSelectedPickerType] = useState(typeOfPicker.startDate)

    const clickOnPicker = (type) => {
        setSelectedPickerType(type);
        setShowPickerModal(true);
    }
    const onDateChange = (event, date) => {
        if (date) {
          const formattedDate = moment(date).format('YYYY-MM-DD');
          if (selectedPickerType === typeOfPicker.startDate) {
            setExpenseEntry({ ...expenseEntry, startDate: formattedDate })
          } else if (selectedPickerType === typeOfPicker.endDate) {
            setExpenseEntry({ ...expenseEntry, endDate: formattedDate })
          } 
        }
        setShowPickerModal(false);
    
      };

    return (
        <View style={styles.inputContainer}>
            <CustomTextInput onChangeTextValue={(text) => setExpenseEntry({ ...expenseEntry, employeeName: text })} textValue={expenseEntry?.employeeName} label="Employee Name" />

            <View style={styles.rowContainer}>
                <View style={styles.halfInputContainer}>
                    <IconTextInput onclickIcon={() => {clickOnPicker(typeOfPicker.startDate) }} textValue={expenseEntry?.startDate} label="Start Date" iconName="calendar" editable={false} />
                </View>
                <View style={styles.halfInputContainer}>
                    <IconTextInput onclickIcon={() => {clickOnPicker(typeOfPicker.endDate) }} textValue={expenseEntry?.endDate} label="End Date" iconName="calendar" editable={false} />
                </View>
            </View>

            <CustomTextInput onChangeTextValue={(text) => setExpenseEntry({ ...expenseEntry, expenditure: text })} textValue={expenseEntry?.expenditure} label="Details of Expenditure" />
            <CustomTextInput onChangeTextValue={(text) => setExpenseEntry({ ...expenseEntry, projectNumber: text })} textValue={expenseEntry?.projectNumber} label="Overhead code/Project Number" />
            <CustomTextInput onChangeTextValue={(text) => setExpenseEntry({ ...expenseEntry, category: text })} textValue={expenseEntry?.category} label="Category/SUBPRJ." />

            <CustomTextInput onChangeTextValue={(text) => setExpenseEntry({ ...expenseEntry, task: text })} textValue={expenseEntry?.task} label="Category/Task" />


            {
        ShowPickerModal ?
          <DateTimePicker
            value={new Date()}
            mode={"date"}
            display="default"
            onChange={onDateChange}
          />

          : null
      }
        </View>
    )
}

export default ExpenseDetails

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 46,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    halfInputContainer: {
        width: "48%",
    },
})