import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { appFonts } from '../../../../theme/appFonts'
import { appColor } from '../../../../theme/appColor'
import IconTextInput from '../../../../components/IconTextInput'
import { useState } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { TouchableOpacity } from 'react-native'
import moment from 'moment'
import apiClient from '../../../../api/apiClient'
import { endPoints } from '../../../../api/endPoints'
import { DateFormat, screenHeight } from '../../../../utils/Constants'
import { useNavigation } from '@react-navigation/native'
import { SCREENS } from '../../../../utils/ScreenNames'
import { Ionicons } from '@expo/vector-icons'
import SignatureModal from '../../../../components/modal/SignatureModal'
import DateTimePicker from 'react-native-modal-datetime-picker'

const SelectedWeekEntry = ({ weeklyEntry, setWeeklyEntry }) => {
    const [WeekDays, setWeekDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");
    const typeOfPicker = {
        fromDate: 'fromDate',
        toDate: 'toDate'
    }
    const [ShowPickerModal2, setShowPickerModal2] = useState(false);
    const [selectedPickerType2, setSelectedPickerType2] = useState(typeOfPicker.fromDate);
    const [dailyDiaries, setDailyDiaries] = useState([]);
    const [dailyEntries, setDailyEntries] = useState([]);
    const [WeeklyReports, setWeeklyReports] = useState();
    const [selectedEntry, setSelectedEntry] = useState();
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    // useEffect(() => {
    //     console.log("weeklyEntry : ", weeklyEntry)
    // }, [])

    const handleSignatureOK = (signatureBase64) => {
        setShowSignatureModal(false);
        if (signatureBase64) {
            setWeeklyEntry({ ...weeklyEntry, signature: signatureBase64 })
        }
    }

    const clickOnPicker2 = (type) => {
        setShowPickerModal2(true)
        setSelectedPickerType2(type);

    }
    const onDateChange2 = (event, date) => {
        console.log("chan")
        if (date) {
            const formattedDate = moment(date).format(DateFormat.YYYY_MM_DD);
            if (selectedPickerType2 === typeOfPicker.fromDate) {
                setWeeklyEntry({ ...weeklyEntry, startDate: formattedDate })
            } else if (selectedPickerType2 === typeOfPicker.toDate) {
                setWeeklyEntry({ ...weeklyEntry, endDate: formattedDate })
                generateWeekDays(weeklyEntry.startDate, formattedDate);
            }
        }
        setShowPickerModal2(false);
    };

    const generateWeekDays = (start, end) => {
        if (!start || !end) return;
        const days = [];
        const startDate = moment(start, DateFormat.YYYY_MM_DD).toDate(); //new Date(start);
        const endDate = moment(end, DateFormat.YYYY_MM_DD).toDate(); //new Date(start);
        while (startDate <= endDate) {
            days.push(moment(startDate).format(DateFormat.YYYY_MM_DD));
            startDate.setDate(startDate.getDate() + 1);
        }
        console.log("days : ", days);
        setWeekDays(days);
        setSelectedDay(days[0] || "");
        fetchWeeklyData(start, end)
    };



    const fetchWeeklyData = async (_startDate, _endDate) => {
        if (!weeklyEntry) return;
        const { projectId, userId } = weeklyEntry;
        const param = {
            projectId,
            userId,
            startDate: _startDate,
            endDate: _endDate
        }
        setLoading(true);
        try {
            const response = await apiClient.post(endPoints.URL_GET_WEEKLY_ENTRY, param);
            if (response.status == 200 || response.status == 201) {
                const output = response.data;
                if (output.status == 'success') {
                    const list = output.data;
                    console.log("list : ",JSON.stringify(list));
                    const map = new Map();
                    const dailyEntries = list?.linkedDailyEntries;
                    const dailyDiaries = list?.linkedDailyDiaries;
                    const dailyReportEntries = [];
                    const dailyDairyReportEntries = [];


                    if (dailyEntries?.length > 0) {
                        for (let entry of dailyEntries) {
                            // const date = moment(entry?.selectedDate).format(DateFormat.YYYY_MM_DD);
                           const date  =  moment.utc(entry?.selectedDate).format("YYYY-MM-DD");
                            if (!map.has(date)) {
                                entry["IsDailyEntry"] = true
                                entry["IsChargable"] = true;
                                dailyReportEntries.push(entry);
                                // setDailyEntries(dailyReportEntries);
                                map.set(date, entry);
                            }
                        }
                        setDailyEntries(dailyReportEntries);

                    }

                    if (dailyDiaries?.length > 0) {
                        for (let diary of dailyDiaries) {
                            const date = moment.utc(diary?.selectedDate).format(DateFormat.YYYY_MM_DD);
                            if (!map.has(date)) {
                                diary["IsDailyEntry"] = false
                                diary["IsChargable"] = true;
                                dailyDairyReportEntries.push(diary);
                                // setDailyDiaries(dailyDairyReportEntries);
                                map.set(date, diary);
                            }

                        }
                        setDailyDiaries(dailyDairyReportEntries);

                    }
                    setWeeklyEntry({ ...weeklyEntry, dailyEntries: dailyReportEntries, dailyDiaries: dailyDairyReportEntries, endDate: _endDate });


                    setWeeklyReports(map);
                    if (WeekDays?.length > 0) {
                        callToSelectedDay(WeekDays[0] ,map);
                    }
                }
            } else {
                Alert.alert("Error", response?.data?.message || "Failed to fetch data.");
            }
            setLoading(false);
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to fetch data.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const callToSelectedDay = (day,map) => {
        setSelectedDay(day);
        const list = map && map.size > 0 ? map : WeeklyReports;
        if (list?.size > 0) {
            const dailyEntry = list.get(day);
            if (dailyEntry) {
                console.log("dailyEntry : ", JSON.stringify(dailyEntry));
                setSelectedEntry(dailyEntry);
            } else {
                setSelectedEntry({});
            }
        }
    };



    return (
        <>
            <View style={{
                flex: 1
            }}>
                <Text style={styles.sectionTitle}>Selected week</Text>
                <View style={styles.rowContainer}>
                    <View style={styles.halfInputContainer}>
                        <IconTextInput
                            key={Math.random()}
                            onclickIcon={() => clickOnPicker2(typeOfPicker.fromDate)}
                            textValue={weeklyEntry?.startDate}
                            label="Start Date"
                            iconName="calendar-outline"
                            editable={false}
                        />
                    </View>
                    <View style={styles.halfInputContainer}>
                        <IconTextInput
                            key={Math.random()}
                            onclickIcon={() => clickOnPicker2(typeOfPicker.toDate)}
                            textValue={weeklyEntry?.endDate}
                            label="End Date"
                            iconName="calendar-outline"
                            editable={false}

                        />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateScroll}>
                    {WeekDays.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.nameContainer, selectedDay == day && styles.activeBtn]}
                            onPress={() => callToSelectedDay(day)}>
                            <Text
                                style={[
                                    styles.nameText,
                                    selectedDay == day && styles.activeNameText,
                                ]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View>
                    <View style={styles.activityContainer}>
                        <Text style={styles.activityTitle}>Activities for Selected Dates:</Text>
                    </View>

                    <Text style={styles.activityDescription}>{selectedEntry?.description}</Text>


                    {
                        selectedEntry?.IsDailyEntry ?
                            <View style={styles.detailsContainer}>
                                {
                                    selectedEntry?.labours?.length > 0 ?
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => navigation.navigate(SCREENS.LABOUR_DETAILS, { labourDetails: selectedEntry?.labours })}>
                                            <Text>View Labour Details</Text>
                                        </TouchableOpacity>
                                        : null
                                }
                                {
                                    selectedEntry?.equipments?.length > 0 ?
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => navigation.navigate(SCREENS.EQUIMENTS_DETAILS, { equipmentDetails: selectedEntry?.equipments })}>
                                            <Text>View Equipment Details</Text>
                                        </TouchableOpacity>
                                        : null
                                }

                                {
                                    selectedEntry?.visitors?.length > 0 ?
                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => navigation.navigate(SCREENS.VISITOR_DETAILS, { visitorDetails: selectedEntry?.visitors })}>
                                            <Text>View Visitor Details</Text>
                                        </TouchableOpacity>
                                        : null
                                }

                                {
                                    selectedEntry?.description ?

                                        <TouchableOpacity
                                            style={styles.detailsButton}
                                            onPress={() => navigation.navigate(SCREENS.DESCRIPTION_DETAILS, { description: selectedEntry?.description })}>
                                            <Text>View Project Description</Text>
                                        </TouchableOpacity>
                                        : null
                                }

                            </View>
                            : null
                    }


                    <Text style={{
                        marginBottom: 5,
                        fontSize: 16,
                        color: "#000",
                        fontFamily: appFonts.Medium,
                        marginTop: 15
                    }}>Signature</Text>
                    <View style={{ borderColor: "#ddd", borderWidth: 1, marginBottom: 20, backgroundColor: "white", borderRadius: 6, minHeight: 45 }}>
                        <TouchableOpacity style={{
                            padding: 10,
                            borderRadius: 5,
                            alignItems: 'center',
                            marginTop: 10,
                        }} onPress={() => setShowSignatureModal(true)}>
                            {weeklyEntry?.signature ? (
                                <View>

                                    <Image
                                        resizeMode="contain"
                                        source={{ uri: weeklyEntry?.signature }}
                                        style={{
                                            width: 200,
                                            borderWidth: 0.5,
                                            borderColor: "#00000039",
                                            height: 150,
                                        }}
                                    />

                                    <TouchableOpacity onPress={() => setWeeklyEntry({ ...weeklyEntry, signature: '' })} style={{
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



                {showSignatureModal && <SignatureModal handleSignatureOK={handleSignatureOK} showSignatureModal={showSignatureModal} onclose={() => {
                    setShowSignatureModal(false)
                }} />}




            </View>
            {
                ShowPickerModal2 ?
                    // <DateTimePicker
                    //     value={selectedPickerType2 == typeOfPicker.fromDate ? (weeklyEntry?.startDate ? new Date(weeklyEntry?.startDate) : new Date()) : (weeklyEntry?.endDate ? new Date(weeklyEntry?.endDate) : new Date())}
                    //     display="default"
                    //     onChange={onDateChange2}
                    // />

                    <DateTimePicker
                        testID="dateTimePicker"
                        isVisible={ShowPickerModal2}
                        value={selectedPickerType2 == typeOfPicker.fromDate ? (weeklyEntry?.startDate ? new Date(weeklyEntry?.startDate) : new Date()) : (weeklyEntry?.endDate ? new Date(weeklyEntry?.endDate) : new Date())}

                        onConfirm={(date) => onDateChange2(null, date)}
                        onCancel={() => setShowPickerModal2(false)}
                        textColor="black" // Force text color (iOS 14+)
                        themeVariant="light"
                    />
                    : null
            }
        </>
    )
}

export default SelectedWeekEntry

const styles = StyleSheet.create({
    activeBtn: {
        borderWidth: 1,
        borderColor: appColor.primary,
        backgroundColor: appColor.primary
    },
    sectionTitle: {
        fontSize: 18,
        color: appColor.black,
        fontFamily: appFonts.SemiBold,
        marginVertical: 4,
        marginHorizontal: 5,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
        marginHorizontal: 5,
    },
    halfInputContainer: {
        width: "48%",
        height: 35
    },
    label: {
        fontSize: 16,
        fontFamily: appFonts.Medium,
        color: "#000",
        marginBottom: 4,
    },
    dateInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 45,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
    },
    dateInputText: {
        flex: 1,
        fontSize: 16,
        fontFamily: appFonts.Medium,

    },
    icon: {
        marginLeft: 8,
    },
    dateScroll: {
        paddingHorizontal: 16,
        marginTop: 40,
        // backgroundColor:'red'
    },
    nameContainer: {
        alignItems: "center",
        marginRight: 15,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: appColor.black,
        paddingHorizontal: 10
    },
    nameText: {
        fontSize: 16,
        color: "#333",
        fontFamily: appFonts.Medium,

    },
    activeNameText: {
        color: appColor.white,
        fontFamily: appFonts.Medium,
        borderColor: appColor.primary


    },
    underline: {
        height: 2,
        width: "100%",
        backgroundColor: "#D3D3D3",
        marginTop: 5,
    },
    activeUnderline: {
        backgroundColor: "#486ECD",
    },
    activityContainer: {
        paddingHorizontal: 4,
        marginTop: 10
    },
    activityTitle: {
        fontSize: 16,
        fontFamily: appFonts.SemiBold,

        marginBottom: 8,
        color: "#000",
    },
    activityDescription: {
        fontSize: 16,
        color: "#333",
        fontFamily: appFonts.Regular
    },
    detailsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 25,
    },
    detailsButton: {
        backgroundColor: "#d9e7ff",
        padding: 12,
        borderRadius: 8,
        width: "48%",
        alignItems: "center",
        marginBottom: 10,
    },
    buttonContainer: {
        position: "absolute",
        top: screenHeight - 80,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    previousButton: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#486ECD",
        borderRadius: 8,
        alignItems: "center",
    },
})