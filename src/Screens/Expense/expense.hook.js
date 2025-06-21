import { StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { expenseEntryTitles, initializeExpenseEntry } from '../../utils/ExpenseUtil';

const useExpenseHook = () => {
    const [expenseEntry, setExpenseEntry] = useState({ ...initializeExpenseEntry });
    const [ActiveTab, setActiveTab] = useState(1);
    const [ActiveTabTitle, setActiveTabTitle] = useState(expenseEntryTitles.Expense_Details);
    const clickOnTabs = (step) => {
        setActiveTab(step)
        if (step === 1) {
            setActiveTabTitle(expenseEntryTitles.Expense_Details)
        }
        else if (step === 2) {
            setActiveTabTitle(expenseEntryTitles.Expense_Category)
        }
    }
    return {
        expenseEntry, setExpenseEntry,
        ActiveTab,
        clickOnTabs,
        ActiveTabTitle
    }
}

export default useExpenseHook
