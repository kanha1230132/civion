import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { dailyEntryTitle, initializeDailyEntry } from '../../../utils/DailyUtil'

const useDailyEntryHooks = () => {
    const [dailyEntry, setDailyEntry] = useState({ ...initializeDailyEntry });
    const [ActiveTab, setActiveTab] = useState(1);
    const [ActiveTabTitle, setActiveTabTitle] = useState(dailyEntryTitle.ProjectDetails);

    const typeOfPicker = {
        date: "date",
        timeIn: "timeIn",
        timeOut: "timeOut",
    }
    const [ShowPickerModal, setShowPickerModal] = useState(false);
    const [selectedPickerType, setSelectedPickerType] = useState(typeOfPicker.date)
 const clickOnTabs = (step) => {
        setActiveTab(step)
        if (step === 1) {
            setActiveTabTitle(dailyEntryTitle.ProjectDetails)
        }
        else if (step === 2) {
            setActiveTabTitle(dailyEntryTitle.EquipmentDetails)
        }
        else if (step === 3) {
            setActiveTabTitle(dailyEntryTitle.LabourDetails)
        }
        else if (step === 4) {
            setActiveTabTitle(dailyEntryTitle.VisitorDetails)
        }
        else if (step === 5) {
            setActiveTabTitle(dailyEntryTitle.DeclarationForm)
        }
          else if (step === 6) {
            setActiveTabTitle(dailyEntryTitle.Description)
        }
    }
    return {
        clickOnTabs,
        dailyEntry, setDailyEntry,
        ActiveTab, setActiveTab,
        ActiveTabTitle, setActiveTabTitle,
        typeOfPicker,
        ShowPickerModal, setShowPickerModal,
        selectedPickerType, setSelectedPickerType
    }
}

export default useDailyEntryHooks
