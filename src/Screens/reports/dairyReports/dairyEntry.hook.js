import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { ProjectContext } from '../../../utils/ProjectContext';
import { dairyEntryTitle, initializeDairyEntry } from '../../../utils/DairyUtil';

const useDairyEntryHook = () => {
     const [dairyEntry, setDairyEntry] = useState({ ...initializeDairyEntry });
        const [ActiveTab, setActiveTab] = useState(1);
        const { DairyEntryReport, setDairyEntryReport } = useContext(ProjectContext);
        const [ActiveTabTitle, setActiveTabTitle] = useState(dairyEntryTitle.Enter_Project_Details);
         const clickOnTabs = (step) => {
                setActiveTab(step)
                if (step === 1) {
                    setActiveTabTitle(dairyEntryTitle.Enter_Project_Details)
                }
                else if (step === 2) {
                    setActiveTabTitle(dairyEntryTitle.Enter_Description_details)
                }
            }
  return {
    dairyEntry, setDairyEntry,
    ActiveTab,
    setActiveTab,
    DairyEntryReport,
    setDairyEntryReport,
    clickOnTabs,
    
    ActiveTabTitle
  }
}

export default useDairyEntryHook
