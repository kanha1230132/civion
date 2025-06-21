import { BackHandler, Keyboard, KeyboardAvoidingView, Keyboards, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import HeaderWithBackButton from '../../components/HeaderWithBackButton'
import { appColor } from '../../theme/appColor'
import { additionalRequirements, confinedSpacesHazards, controlPlans, environmentalHazards, equipmentHazards, ergonomicHazards, hazardCategories, hazardOptions, initialHazardCat, JobTabs, JobTabTitles, miscHazards, severityOptions, worksiteHazards } from './JobUtil'
import { TouchableOpacity } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import CustomTextInput from '../../components/CustomTextInput'
import IconTextInput from '../../components/IconTextInput'
import { Constants, screenHeight } from '../../utils/Constants'
import { Ionicons } from '@expo/vector-icons'
import { FlatList } from 'react-native'
import CustomButton from '../../components/button/CustomButton'
import { appFonts } from '../../theme/appFonts'
import moment from 'moment/moment'
import SignatureModal from '../../components/modal/SignatureModal'
import { Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SCREENS } from '../../utils/ScreenNames'
import { ProjectContext } from '../../utils/ProjectContext'
import useKeyboard from '../../hooks/useKeyboard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePicker from 'react-native-modal-datetime-picker'
import { SafeAreaWrapper } from '../../../App'

const typeOfPicker = {
    date: "date",
    time: "time",
    dateReviewed: "dateReviewed",
}

const CreateJobHazard = ({ navigation }) => {
    const [ActiveTab, setActiveTab] = useState(1);
    const [ActiveTabTitle, setActiveTabTitle] = useState(JobTabTitles.title1);

    const [selectedDate, setSelectedDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [signature, setSignature] = useState(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [workerName, setWorkerName] = useState('')

    // tab 2
    const [activeCategory, setActiveCategory] = useState(initialHazardCat.Worksite_Hazards);
    const [checkedItems, setCheckedItems] = useState([]);
    const [otherText, setOtherText] = useState({
        "Worksite Hazards": "",
        "Equipment Hazards": "",
        "Ergonomic Hazards": "",
        "Confined/Restricted Spaces": "",
        "Environmental Hazards": "",
        "Additional Requirements": "",
        "Misc. Hazards": "",
    });

    // tab 3
    const [tasks, setTasks] = useState([
        { task: "Site Inspection", severity: "H", hazard: "", controlPlan: "" },
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
    const [currentDropdown, setCurrentDropdown] = useState(null);

    const [ShowPickerModal, setShowPickerModal] = useState(false);
    const [selectedPickerType, setSelectedPickerType] = useState(typeOfPicker.date);
    const [CategoryList, setCategoryList] = useState()

    const { JobHazardEntryReport, setJobHazardEntryReport } = useContext(ProjectContext);


    const { keyboardOpen } = useKeyboard()
    const clickOnTabs = (step) => {
        setActiveTab(step)
        if (step === 1) {
            setActiveTabTitle(JobTabTitles.title1)
        }
        else if (step === 2) {
            setActiveTabTitle(JobTabTitles.title2)
        }
        else if (step === 3) {
            setActiveTabTitle(JobTabTitles.title3)
        }
        else if (step === 4) {
            setActiveTabTitle(JobTabTitles.title4)
        }
    }


    const toggleCheckbox = (hazard) => {
        setCheckedItems((prevCheckedItems) => {
            const updatedCheckedItems = prevCheckedItems.includes(hazard)
                ? prevCheckedItems.filter((item) => item !== hazard)
                : [...prevCheckedItems, hazard];

            return updatedCheckedItems;
        });
    };


    const toggleCategoryValue = (hazard) => {
        const currentList = CategoryList ?? new Map();
        const newList = new Map(currentList);
        if (newList?.has(activeCategory)) {
            if (newList.get(activeCategory).includes(hazard)) {
                newList.set(activeCategory, newList.get(activeCategory).filter((item) => item !== hazard));
            } else {
                newList.set(activeCategory, [...newList.get(activeCategory), hazard]);
            }
        } else {
            newList.set(activeCategory, [hazard]);
        }
        setCategoryList(newList);
    };



    const handleOtherTextChange = (text, category) => {
        setOtherText((prevOtherText) => {
            const updatedOtherText = { ...prevOtherText, [category]: text };
            return updatedOtherText;
        });
    };


    const openDropdown = (index, dropdownType) => {
        setCurrentTaskIndex(index);
        setCurrentDropdown(dropdownType);
        setModalVisible(true);
    };

    const handleSelect = (value) => {
        if (currentTaskIndex !== null && currentDropdown) {
            handleInputChange(currentTaskIndex, currentDropdown, value);
            setModalVisible(false);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][field] = value;
        if (field === "hazard" && controlPlans.hasOwnProperty(value)) {
            updatedTasks[index]["controlPlan"] = controlPlans[value];
        }
        handleStateUpdate(updatedTasks)
    };

    const handleStateUpdate = (newTasks) => {
        setTasks(newTasks);
    };

    const addNewTask = () => {
        setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks, { task: "Site Inspection", severity: "H", hazard: "", controlPlan: "" }];
            return updatedTasks;
        });
    };

    const removeTask = (index) => {
        setTasks((prevTasks) => {
            const updatedTasks = prevTasks.filter((_, taskIndex) => taskIndex !== index);
            return updatedTasks;
        });
    };


    const [siteOrientationChecked, setSiteOrientationChecked] = useState(false);
    const [toolBoxMeetingChecked, setToolBoxMeetingChecked] = useState(false);
    const [dateReviewed, setDateReviewed] = useState("");
    const [reviewedBy, setReviewedBy] = useState('')
    const handleToolBoxMeetingChange = () => {
        setToolBoxMeetingChecked((prev) => !prev);
    };

    const handleSiteOrientationChange = () => {
        setSiteOrientationChecked((prev) => !prev);
    };

    const onDateChange = (event, date) => {
        if (date) {
            const formattedDate = moment(date).format('YYYY-MM-DD');
            if (selectedPickerType === typeOfPicker.date) {
                setSelectedDate(formattedDate);
            } else if (selectedPickerType === typeOfPicker.dateReviewed) {
                setDateReviewed(formattedDate);
            } else if (selectedPickerType === typeOfPicker.time) {
                const time = moment(date).format('HH:mm A');
                setTime(time); // HH:MM format
            }
        }
        setShowPickerModal(false);

    };

    const clickOnPicker = (type) => {
        setSelectedPickerType(type);
        setShowPickerModal(true);

    }
    const callToPreview = async () => {
        try {
            const checkedValues = (CategoryList && CategoryList.size > 0) ? Array.from(CategoryList, ([category, items]) => ({
                category,
                items
            })) : [];
            const userName = await AsyncStorage.getItem(Constants.USER_NAME);
            const request = {
                dateReviewed,
                siteOrientationChecked,
                toolBoxMeetingChecked,
                tasks,
                checkedItems: checkedValues,
                otherText,
                selectedDate,
                time,
                location,
                projectName,
                description,
                reviewedBy: userName,
                workerName
            }

            setJobHazardEntryReport({ ...request, signature })
            navigation.navigate(SCREENS.JOB_HAZARD_REVIEW)

        } catch (error) {
console.log("Error : ", error)
        }
    }

    const handleSignatureOK = (signatureBase64) => {
        setShowSignatureModal(false);
        if (signatureBase64) {
            setSignature(signatureBase64);
            // console.log("signature data :", signatureBase64);
        }
    }

    return (
        // <SafeAreaView style={styles.container}>
        <SafeAreaWrapper>
            {/* <KeyboardAvoidingView
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> */}
                <View style={{
                    paddingVertical: 10
                }}>
                    <HeaderWithBackButton title="Add JHA" onBackClick={() => navigation.goBack()} />

                    <View style={styles.projectDetailsContainer}>
                        <Text style={styles.projectDetailsTitle}>{ActiveTab}. {ActiveTabTitle}</Text>
                    </View>
                </View>

                <ScrollView style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                                      showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                      automaticallyAdjustKeyboardInsets={true}>



                <View style={styles.progressContainer}>
                    {JobTabs.map((step, index) => (
                        <React.Fragment key={index}>
                            <TouchableOpacity
                                onPress={() => {
                                    clickOnTabs(step);
                                }}
                                style={[
                                    styles.progressCircle,
                                    step <= ActiveTab ? styles.activeCircle : { borderColor: appColor.lightGray, borderWidth: 1 },
                                ]}>
                                <Text style={[
                                    styles.progressText,
                                    step <= ActiveTab ? styles.activeText : {},
                                ]}>
                                    {step}
                                </Text>
                            </TouchableOpacity>
                            {index < 3 && (
                                <View style={[
                                    styles.progressLine,
                                    step < ActiveTab ? styles.completedLine : {},
                                ]}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </View>


                {
                    ActiveTab === 1 ?
                            <ScrollView style={{ flex: 1, paddingBottom: 80 ,paddingHorizontal:15,paddingTop:10}} showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                      automaticallyAdjustKeyboardInsets={true}>

                                

                                    <IconTextInput
                                        onclickIcon={() => clickOnPicker(typeOfPicker.date)}
                                        textValue={selectedDate}
                                        label="Date"
                                        iconName="calendar-outline"
                                        editable={false}

                                    />

                                    <IconTextInput
                                        onclickIcon={() => clickOnPicker(typeOfPicker.time)}
                                        textValue={time}
                                        label="Time"
                                        iconName="time-outline"
                                        editable={false}

                                    />

                                    <CustomTextInput
                                        onChangeTextValue={setLocation}
                                        textValue={location}
                                        label="Project Location"
                                    />

                                    <CustomTextInput
                                        onChangeTextValue={setProjectName}
                                        textValue={projectName}
                                        label="Project Name"
                                    />

                                    <CustomTextInput
                                        onChangeTextValue={setDescription}
                                        textValue={description}
                                        label="Task Description"
                                    />
                                  

                                    
                            </ScrollView>
                        : null
                }


                {
                    ActiveTab === 2 ?
                            <View style={{
                                marginHorizontal: 10,
                                marginTop: 10,
                            }}>
                                    <ScrollView
                                        horizontal={true}
                                        // contentContainerStyle={{height: 40 }}
                                        showsHorizontalScrollIndicator={false}
                                        
                                     >
                                        {hazardCategories.map((category, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={{
                                                    // height: 40,
                                                    backgroundColor: activeCategory === category ? appColor.primary : appColor.lightGray,
                                                    borderRadius: 100,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    paddingHorizontal: 10,
                                                    marginHorizontal: 4,
                                                    paddingVertical: 3
                                                }}
                                                onPress={() => setActiveCategory(category)}>
                                                <Text
                                                    style={[
                                                        styles.tab,
                                                        activeCategory === category ? {
                                                            color: appColor.white,
                                                            paddingVertical: 3
                                                        } : { color: appColor.black },
                                                        { textAlign: 'center' }

                                                    ]}>
                                                    {category}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>


                                <ScrollView keyboardShouldPersistTaps="handled" style={{ 
                                 marginBottom: 30 ,
                                    marginTop:15

                                }} horizontal={false} showsVerticalScrollIndicator={false}>


                                    <View style={styles.hazardListContainer}>



                                        {activeCategory === "Worksite Hazards" &&
                                            worksiteHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCheckbox(hazard)
                                                        toggleCategoryValue(hazard)
                                                    }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                              returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Equipment Hazards" &&
                                            equipmentHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCategoryValue(hazard)
                                                        toggleCheckbox(hazard)
                                                    }
                                                    }>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Ergonomic Hazards" &&
                                            ergonomicHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCategoryValue(hazard);
                                                        toggleCheckbox(hazard)
                                                    }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Confined/Restricted Places" &&
                                            confinedSpacesHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => { toggleCategoryValue(hazard); toggleCheckbox(hazard) }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Environmental Hazards" &&
                                            environmentalHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCategoryValue(hazard);
                                                        toggleCheckbox(hazard)
                                                    }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Additional Requirements" &&
                                            additionalRequirements.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCategoryValue(hazard);
                                                        toggleCheckbox(hazard)
                                                    }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                        {activeCategory === "Misc. Hazards" &&
                                            miscHazards.map((hazard, index) => (
                                                <View key={index} style={styles.hazardItem}>
                                                    <Text style={styles.hazardText}>{hazard}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        toggleCategoryValue(hazard);
                                                        toggleCheckbox(hazard)
                                                    }}>
                                                        <Ionicons
                                                            name={
                                                                checkedItems.includes(hazard)
                                                                    ? "checkbox"
                                                                    : "square-outline"
                                                            }
                                                            size={24}
                                                            color="#486ECD"
                                                        />
                                                    </TouchableOpacity>
                                                    {hazard === "Other" && checkedItems.includes(hazard) && (
                                                        <TextInput
                                                            style={styles.inlineOtherInput}
                                                            placeholder="Please specify..."
                                                            value={otherText[activeCategory]}
                                                            onChangeText={(text) => {
                                                                handleOtherTextChange(text, activeCategory)
                                                            }}
                                                            placeholderTextColor="#666"
                                                            multiline
                                                            returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                                        />
                                                    )}
                                                </View>
                                            ))}
                                    </View>
                                </ScrollView>

                            </View>

                         : null
                }


                {
                    ActiveTab === 3 ? <View style={{
                        flex: 1,
                        marginHorizontal: 10,
                        marginTop: 20
                    }}>
                        <ScrollView style={{
                            flex: 1,
                            marginBottom: 50
                        }} horizontal={false} showsVerticalScrollIndicator={false} >

                            {tasks.map((task, index) => (
                                <View key={index} style={{
                                    backgroundColor: "#F9F9F9",
                                    borderRadius: 10,
                                    padding: 15,
                                    marginBottom: 20,
                                    borderWidth: 1,
                                    borderColor: "#d3d3d3",
                                    position: "relative",
                                }}>
                                    {/* Show the - icon only if the task index is greater than 0 (Task 2 and onward) */}
                                    {index > 0 && (
                                        <TouchableOpacity
                                            onPress={() => removeTask(index)}
                                            style={{
                                                position: "absolute",
                                                top: 10, // Position it at the top of the task box
                                                right: 10, // Right side of the task box,
                                                zIndex: 3
                                            }}>
                                            <Ionicons name="remove-circle" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}

                                    <Text style={{
                                        fontSize: 16,
                                        fontFamily: appFonts.Bold,
                                        marginBottom: 10,
                                    }}>Task - {index + 1}</Text>

                                    <TextInput
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#d3d3d3",
                                            padding: 10,
                                            borderRadius: 5,
                                            fontSize: 16,
                                            marginBottom: 15,
                                        }}
                                        placeholder="Tasks"
                                        value={task.task}
                                        editable={false}
                                        onChangeText={(text) => handleInputChange(index, "task", text)}
                                    />


                                    <View style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}>
                                        <View style={{
                                            flex: 1,
                                            marginRight: 10,
                                        }}>
                                            <Text style={{
                                                fontSize: 14,
                                                marginBottom: 5,
                                                color: "#000",
                                                fontFamily: appFonts.Medium
                                            }}>Severity</Text>
                                            <TouchableOpacity
                                                onPress={() => openDropdown(index, "severity")}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: "#d3d3d3",
                                                    borderRadius: 5,
                                                    overflow: "hidden",
                                                    backgroundColor: "#fff",
                                                    position: "relative",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingHorizontal: 10,
                                                    height: 50,
                                                }}>
                                                <Text style={{
                                                    flex: 1,
                                                    fontSize: 16,
                                                    color: "#000",
                                                    fontFamily: appFonts.Medium
                                                }}>
                                                    {severityOptions.find(
                                                        (option) => option.value === task.severity
                                                    )?.label || "Select Severity"}
                                                </Text>
                                                <Ionicons
                                                    name="caret-down"
                                                    size={16}
                                                    color="gray"
                                                    style={{
                                                        marginLeft: 10,
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{
                                            flex: 1,
                                            marginRight: 10,
                                        }}>
                                            <Text style={{
                                                fontSize: 14,
                                                marginBottom: 5,
                                                color: "#000",
                                                fontFamily: appFonts.Medium
                                            }}>Hazards</Text>
                                            <TouchableOpacity
                                                onPress={() => openDropdown(index, "hazard")}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: "#d3d3d3",
                                                    borderRadius: 5,
                                                    overflow: "hidden",
                                                    backgroundColor: "#fff",
                                                    position: "relative",
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingHorizontal: 10,
                                                    height: 50,
                                                }}>
                                                <Text style={{
                                                    flex: 1,
                                                    fontSize: 16,
                                                    color: "#000",
                                                    fontFamily: appFonts.Medium
                                                }}>
                                                    {hazardOptions.find((option) => option.value == task.hazard)
                                                        ?.label || "Select Hazard"}
                                                </Text>
                                                <Ionicons
                                                    name="caret-down"
                                                    size={16}
                                                    color="gray"
                                                    style={{
                                                        marginLeft: 10,
                                                    }}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TextInput
                                        style={[styles.input, {
                                            height: 60, marginTop: 20, borderWidth: 1,
                                            borderColor: "#d3d3d3",
                                            padding: 10,
                                            borderRadius: 5,
                                            fontSize: 16,
                                            marginBottom: 15,
                                        }]}
                                        placeholder="Plans to Eliminate/Control"
                                        value={task.controlPlan}
                                        onChangeText={(text) => { }
                                            // handleInputChange(index, "controlPlan", text)
                                        }
                                        multiline
                                        returnKeyType="done"
                                                                            blurOnSubmit={true}
                                                                            onSubmitEditing={() => {
                                                                                Keyboard.dismiss();
                                                                              }}
                                    />
                                </View>
                            ))}

                            <View style={{
                                alignItems: "flex-end",
                                marginBottom: 20,
                            }}>
                                <TouchableOpacity style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: "#486ECD",
                                    paddingVertical: 5,
                                    paddingHorizontal: 10,
                                    borderRadius: 5,
                                    backgroundColor: "#fff",
                                }} onPress={() => {
                                    addNewTask()
                                }}>
                                    <Ionicons name="add-circle-outline" size={24} color="#486ECD" />
                                    <Text style={{
                                        color: "#486ECD",
                                        fontSize: 16,
                                        marginLeft: 5,
                                        fontFamily: appFonts.Medium
                                    }}>Add New</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>

                    </View> : null
                }



                {
                    ActiveTab === 4 ?

                            <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }} horizontal={false} showsVerticalScrollIndicator={false}>
                                <View style={{
                                    flex: 1,
                                    marginHorizontal: 10,
                                    // marginTop: 20
                                }}>


                                    <View style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginVertical: 10,
                                    }}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: "#000",
                                            fontFamily: appFonts.Medium
                                        }}>
                                            Have you completed site orientation?
                                        </Text>
                                        <TouchableOpacity
                                            style={[
                                                {
                                                    width: 24,
                                                    height: 24,
                                                    borderWidth: 1,
                                                    borderColor: "#d3d3d3",
                                                    borderRadius: 3,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                },
                                                siteOrientationChecked && {
                                                    backgroundColor: "#486ECD",
                                                    borderColor: "#486ECD",
                                                }
                                            ]}
                                            onPress={handleSiteOrientationChange}
                                        >
                                            {siteOrientationChecked && (
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            )}
                                        </TouchableOpacity>

                                    </View>

                                    <View style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginVertical: 10,
                                    }}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: "#000",
                                            fontFamily: appFonts.Medium
                                        }}>
                                            Have you completed tool box meeting?
                                        </Text>
                                        <TouchableOpacity
                                            style={[
                                                {
                                                    width: 24,
                                                    height: 24,
                                                    borderWidth: 1,
                                                    borderColor: "#d3d3d3",
                                                    borderRadius: 3,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                },
                                                toolBoxMeetingChecked && {
                                                    backgroundColor: "#486ECD",
                                                    borderColor: "#486ECD",
                                                },
                                            ]}
                                            onPress={handleToolBoxMeetingChange}>
                                            {toolBoxMeetingChecked && (
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                  

                                    <View style={{
                                        marginTop: 20
                                    }}>
                                        <CustomTextInput
                                            onChangeTextValue={setWorkerName}
                                            textValue={workerName}
                                            label="Worker Name"
                                            style={{ marginTop: 10 ,borderRadiusL:10}}
                                        />
                                    </View>


                                    <Text style={{
                                        marginBottom: 15,
                                        fontSize: 16,
                                        color: "#000",
                                        fontFamily: appFonts.Medium,
                                        marginTop: 15
                                    }}>Signature</Text>
                                    <View style={{ borderWidth: 1, marginBottom: 100, backgroundColor: "white", borderRadius: 6, minHeight: 45 }}>
                                        <TouchableOpacity style={{
                                            padding: 10,
                                            borderRadius: 5,
                                            alignItems: 'center',
                                            marginTop: 10,
                                        }} onPress={() => setShowSignatureModal(true)}>
                                            {signature ? (
                                                <View>
                                                    <Image resizeMode='contain' source={{ uri: signature }} style={{ width: 200, borderWidth: 0.5, borderColor: '#00000039', height: 150 }} />

                                                    <TouchableOpacity onPress={() => setSignature('')} style={{
                                                        position: 'absolute',
                                                        top: 5,
                                                        right: 5,
                                                        zIndex: 6
                                                    }}>
                                                        <Ionicons name="close" size={24} color="red" />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <Text style={{
                                                    color: "#486ECD",
                                                    fontSize: 16,
                                                    marginLeft: 5,
                                                    fontFamily: appFonts.Medium
                                                }}>Add Signature</Text>
                                            )}


                                        </TouchableOpacity>

                                    </View>


                                </View>
                            </ScrollView>
                        : null
                }



                <View style={[styles.buttonContainer, { gap: 10 }]}>
                    {
                        ActiveTab > 1 ?
                            <View style={{ flex: 1, height: 45 }}>
                                <CustomButton
                                    title="Previous"
                                    onCick={() => {
                                        if (ActiveTab > 1) { clickOnTabs(ActiveTab - 1) }
                                        else {
                                            navigation.goBack()
                                        }
                                    }}
                                    bgColor='#fff'
                                    textColor={appColor.primary}
                                />
                            </View>

                            : null
                    }

                    <View style={{ flex: 1, height: 45 }}>
                        <CustomButton
                            title={ActiveTab == 4 ? "Preview" : "Next"}
                            onCick={() => {
                                if (ActiveTab == 4) {
                                    callToPreview()
                                } else {
                                    clickOnTabs(ActiveTab + 1)
                                }
                            }}
                        />
                    </View>


                </View>


                </ScrollView>


                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onDismiss={() => setModalVisible(false)}
                    onRequestClose={() => setModalVisible(false)}>
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}>
                        <View style={{
                            width: "80%",
                            maxHeight: screenHeight * 0.5,
                            backgroundColor: "#fff",
                            borderRadius: 10,
                            padding: 20,
                        }}>
                            <FlatList
                                data={
                                    currentDropdown === "severity" ? severityOptions : hazardOptions
                                }
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            paddingVertical: 15,
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#ccc",
                                        }}
                                        onPress={() => handleSelect(item.value)}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: "#000",
                                        }}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            />
                        </View>
                    </View>
                </Modal>



                {
                    ShowPickerModal ?
                        // <DateTimePicker
                        //     value={new Date()}
                        //     mode={selectedPickerType == typeOfPicker.time ? "time" : "date"}
                        //     display="default"
                        //     onChange={onDateChange}
                        // />

                        <DateTimePicker
                                testID="dateTimePicker"
                                isVisible={ShowPickerModal}
                                  value={selectedPickerType == typeOfPicker.date ? (selectedDate ? new Date(selectedDate) : new Date()) : ( new Date())}
                                  mode={selectedPickerType == typeOfPicker.time ? "time" : "date"}
                                  onConfirm={(date)=>onDateChange(null, date)}
                                  onCancel={() => setShowPickerModal(false)}
                                  textColor="black" // Force text color (iOS 14+)
                                  themeVariant="light" 
                                />
                        : null
                }


                {showSignatureModal && <SignatureModal handleSignatureOK={handleSignatureOK} showSignatureModal={showSignatureModal} onclose={() => {
                    console.log("close : ")
                    setShowSignatureModal(false)
                }} />}


            {/* </KeyboardAvoidingView> */}
        {/* // </SafeAreaView> */}
        </SafeAreaWrapper>
    )
}

export default CreateJobHazard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 50,
        marginBottom: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        marginLeft: 10,
        fontFamily: appFonts.Bold
    },
    viewDetails: {
        color: "#486ECD",
        fontSize: 16,
    },
    projectDetailsContainer: {
        marginBottom: 10,
        backgroundColor: appColor.lightGray,
        marginTop: 10,
        padding: 10
    },
    projectDetailsTitle: {
        fontSize: 18,
        color: "black",
        fontFamily: appFonts.Bold
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
        backgroundColor: "#486ECD",
    },
    greyBackground: {
        backgroundColor: "#d3d3d3",
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
    completedText: {
        color: appColor.white,
        fontFamily: appFonts.Medium
    },
    progressLine: {
        height: 2,
        flex: 1,
        backgroundColor: "#d3d3d3",
        marginHorizontal: 2
    },
    completedLine: {
        backgroundColor: "#486ECD",
    },
    greyLine: {
        backgroundColor: "#d3d3d3",
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    tab: {
        fontSize: 16,
        color: "#000",
        fontFamily: appFonts.Medium
    },
    activeTab: {
        color: "#486ECD",
        fontFamily: appFonts.Bold
    },
    hazardListContainer: {
        marginBottom: 60,

    },
    hazardItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#486ECD",
        borderRadius: 10,
        marginBottom: 10,
    },
    hazardText: {
        fontSize: 16,
        color: "#000",
        fontFamily: appFonts.Medium
    },
    inlineOtherInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        borderBottomWidth: 1,
        borderColor: "#486ECD",
        marginTop: 5,
        paddingHorizontal: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        height: 60,
        width: '100%',
        zIndex: 5,
        // marginBottom:40
    },

    previousButton: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#486ECD",
    },
    nextButton: {
        backgroundColor: "#486ECD",
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    buttonText: {
        color: "#486ECD",
        fontSize: 18,
        fontFamily: appFonts.Bold
    },
    sectionTitle: {
        fontSize: 18,
        color: "#486ECD",
        marginBottom: 10,
        fontFamily: appFonts.Bold
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    tab: {
        fontSize: 16,
        color: "#000",
    },

});