import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { endPoints } from "../../api/endPoints";
import { Constants, screenHeight } from "../../utils/Constants";
import HeaderWithBackButton from "../../components/HeaderWithBackButton";
import { appFonts } from "../../theme/appFonts";
import useExpenseHook from "./expense.hook";
import { expenseEntryTabs } from "../../utils/ExpenseUtil";
import { appColor } from "../../theme/appColor";
import CustomTextInput from "../../components/CustomTextInput";
import IconTextInput from "../../components/IconTextInput";
import CustomButton from "../../components/button/CustomButton";
import { StatusBar } from "react-native";
import ExpenseCategory from "./components/ExpenseCategory";
import ExpenseDetails from "./components/ExpenseDetails";



export default function CreateExpenseScreen({ navigation }) {
    const {expenseEntry, setExpenseEntry,
        ActiveTab,
        clickOnTabs,ActiveTabTitle} = useExpenseHook();


    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [employeeName, setEmployeeName] = useState("");
    const [category, setCategory] = useState("");
    const [projectNumber, setProjectNumber] = useState("");
    const [expenditure, setExpenditure] = useState("");
    const [task, setTask] = useState("");

    useEffect(() => {
        setEmployeeName(""); // Keep fields empty
        setCategory("");
        setProjectNumber("");
        setExpenditure("");
        setTask("");
        setStartDate(null);
        setEndDate(null);
    }, []);


    const onChangeStartDate = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onChangeEndDate = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const activeStep = 1;

    const handleProgressClick = (step) => {
        if (step === 2) {
            navigation.navigate("Daily65", {
                employeeName,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                category,
                expenditure,
                projectNumber,
                task,
            });
        }
    };

    const callToPreview = ()=>{
        navigation.navigate("Daily65", {
            employeeName,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            category,
            expenditure,
            projectNumber,
            task,
        });
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 ,paddingVertical:10, backgroundColor: "white", paddingTop: 10 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
           
            <HeaderWithBackButton customStyle={{marginVertical:10}} title="Add New Expense" onBackClick={() => {
                if(ActiveTab == 2){
                    clickOnTabs(ActiveTab - 1);
                }else{
                    navigation.goBack()
                }
                }} />
                <View style={{
                    marginHorizontal: 15,
                }}>
                <Text style={styles.expenseDetailsTitle}>{ActiveTab}. {ActiveTabTitle}</Text>

 <View style={styles.progressContainer}>
        {expenseEntryTabs.map((step, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              onPress={() => {
                clickOnTabs(step);
              }}
              style={[
                styles.progressCircle,
                step <= ActiveTab
                  ? styles.activeCircle
                  : { borderColor: appColor.lightGray, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  step <= ActiveTab ? styles.activeText : {},
                ]}
              >
                {step}
              </Text>
            </TouchableOpacity>
            {index < 1 && (
              <View
                style={[
                  styles.progressLine,
                  step < ActiveTab ? styles.completedLine : {},
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
                </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} >
                {
                    ActiveTab == 1 ?
                        <ExpenseDetails expenseEntry={expenseEntry} setExpenseEntry={setExpenseEntry} /> : null
                }

                {
                    ActiveTab == 2 ?
                        <>
                        <ExpenseCategory expenseEntry={expenseEntry} setExpenseEntry={setExpenseEntry} />
                        </>
                    : null
                }

               

               
            </ScrollView>
            <View style={[styles.buttonContainer, { gap: 10 }]}>
        {ActiveTab > 1 ? (
          <View style={{ flex: 1, height: 45 }}>
            <CustomButton
              title="Previous"
              onCick={() => {
                if (ActiveTab > 1) {
                  clickOnTabs(ActiveTab - 1);
                } else {
                  navigation.goBack();
                }
              }}
              bgColor="#fff"
              textColor={appColor.primary}
            />
          </View>
        ) : null}

        <View style={{ flex: 1, height: 45 }}>
          <CustomButton
            title={ActiveTab == 2 ? "Preview" : "Next"}
            onCick={() => {
              if (ActiveTab == 2) {
                callToPreview();
              } else {
                clickOnTabs(ActiveTab + 1);
              }
            }}
          />
        </View>
      </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
      buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        position: "absolute",
        top: screenHeight-85-(StatusBar.currentHeight),
        paddingTop: 10,
        backgroundColor: "#fff",
        height: 60,
        width: "100%",
      },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    headerContainer: {
        paddingTop: 45,
        paddingBottom: 10,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: -10,
    },
    headerText: {
        fontSize: 18,
        marginLeft: 5,
        fontWeight: "500",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
        marginHorizontal: 10,
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
        borderColor: "#486ECD", // Highlight the active step,
        backgroundColor: "#486ECD",
      },
      progressText: {
        fontSize: 16,
        color: "#000",
        fontFamily: appFonts.Medium,
      },
      activeText: {
        color: appColor.white,
        fontFamily: appFonts.Medium,
      },
      progressLine: {
        height: 2,
        // flex: 1,
        width: "75%",
        backgroundColor: "#d3d3d3",
        marginHorizontal: 2,
      },
      completedLine: {
        backgroundColor: "#486ECD", // Change color for completed lines
      },
    sectionTitle: {
        fontSize: 18,
        color: "#486ECD",
        fontWeight: "bold",
        marginBottom: 20,
    },
    expenseDetailsTitle: {
        fontSize: 17,
        fontFamily:appFonts.Medium,
        color: "#000",
        marginBottom: 10,
    },
    inputContainer: {
        marginBottom: 46,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
        marginBottom: 4,
    },
    input: {
        height: 45,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
        paddingHorizontal: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    dateInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 45,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    dateInputText: {
        flex: 1,
        fontSize: 16,
    },
    icon: {
        marginLeft: 8,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    halfInputContainer: {
        width: "48%",
    },
    nextButton: {
        backgroundColor: "#486ECD",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 30,
    },
    nextButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});