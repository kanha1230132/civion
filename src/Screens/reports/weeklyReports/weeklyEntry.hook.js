import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { initializeWeeklyEntry } from '../../../utils/WeeklyUtil';

const useWeeklyEntryHook = () => {
    const [weeklyEntry, setWeeklyEntry] = useState({ ...initializeWeeklyEntry });
    const [ActiveTab, setActiveTab] = useState(1);
    

     const clickOnTabs = (step) => {
            setActiveTab(step)
            // if (step === 1) {
            //     setActiveTabTitle(dailyEntryTitle.ProjectDetails)
            // }
            // else if (step === 2) {
            //     setActiveTabTitle(dailyEntryTitle.EquipmentDetails)
            // }
            // else if (step === 3) {
            //     setActiveTabTitle(dailyEntryTitle.LabourDetails)
            // }
            // else if (step === 4) {
            //     setActiveTabTitle(dailyEntryTitle.VisitorDetails)
            // }
            // else if (step === 5) {
            //     setActiveTabTitle(dailyEntryTitle.Description)
            // }
        }
  return {
    weeklyEntry, setWeeklyEntry,
    ActiveTab, setActiveTab,
    clickOnTabs
  }
}

export default useWeeklyEntryHook

const styles = StyleSheet.create({})