import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Switch, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import useDailyEntryHooks from './dailyEntry.hooks';
import { ProjectContext } from '../../../utils/ProjectContext';
import { dailyEntryTabs, dailyEntryTitle } from '../../../utils/DailyUtil';
import { appColor } from '../../../theme/appColor';
import { appFonts } from '../../../theme/appFonts';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import CustomButton from '../../../components/button/CustomButton';
import { screenHeight, screenWidth } from '../../../utils/Constants';
import LabourDetails from './Components/LabourDetails';
import VisitorDetails from './Components/VisitorDetails';
import EquipmentDetails from './Components/EquipmentDetails';
import DescriptionDetails from './Components/DescriptionDetails';
import ProjectDetails from './Components/ProjectDetails';
import { SCREENS } from '../../../utils/ScreenNames';
import useKeyboard from '../../../hooks/useKeyboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import DailyFormReportScreen from './DailyFormReportScreen';

const DailyEntryScreen = ({ navigation, route }) => {
    const { setDailyEntryReport , DailyEntryReport} = useContext(ProjectContext);
    const { dailyEntry, setDailyEntry,
        ActiveTab, setActiveTab,
        ActiveTabTitle, setActiveTabTitle,
        clickOnTabs,

    } = useDailyEntryHooks();
    const { projectData } = useContext(ProjectContext);
    const {keyboardOpen} = useKeyboard();

    useEffect(() => {
        if (projectData) {
            setDailyEntry((prevData) => ({
                ...prevData,
                projectNumber: projectData.projectNumber,
                projectId: projectData.projectId,
                owner: projectData.owner,
                projectName: projectData.projectName,
                userId: projectData.userId
            }))
        }
    }, []);

    const callToPreview = () => {
        setDailyEntryReport(dailyEntry);
        navigation.navigate(SCREENS.DAILY_ENTRY_PREVIEW);
    }

    return (
        <SafeAreaView style={{flex:1,backgroundColor:appColor.white}}>
            <HeaderWithBackButton title="Daily Entry" onBackClick={() => navigation.goBack()} />
            <View style={styles.projectDetailsContainer}>
                <Text style={styles.projectDetailsTitle}>{ActiveTab}. {ActiveTabTitle}</Text>
            </View>

            <View style={styles.progressContainer}>
                {dailyEntryTabs.map((step, index) => (
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
                        {index < 5 && (
                            <View style={[
                                styles.progressLine,
                                step < ActiveTab ? styles.completedLine : {},
                            ]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>


            <ScrollView       style={[styles.container,keyboardOpen && Platform.OS == "ios" ? {marginBottom:90} : null]}
                      showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                      automaticallyAdjustKeyboardInsets={true} >

                {
                    ActiveTab == 1 && (
                        <ProjectDetails dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} />
                    )
                }

                {
                    ActiveTab == 2 && (
                        <EquipmentDetails dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} />
                    )
                }

                {
                    ActiveTab == 3 && (
                        <LabourDetails dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} />
                    )
                }

                {
                    ActiveTab == 4 && (
                        <VisitorDetails dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} />
                    )
                }

                {
                    ActiveTab == 5 && (
                            <DailyFormReportScreen dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} DailyEntryReport={DailyEntryReport} />
                    )
                }

                {
                    ActiveTab == 6 && (
                        <DescriptionDetails dailyEntry={dailyEntry} setDailyEntry={setDailyEntry} />
                    )
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
                        title={ActiveTab == 6 ? "Preview" : "Next"}
                        onCick={() => {
                            if (ActiveTab == 6) {
                                callToPreview()
                            } else {
                                clickOnTabs(ActiveTab + 1)
                            }
                        }}
                    />
                </View>


            </View>
            </ScrollView>
            

        </SafeAreaView>
    );


};
const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        // paddingHorizontal: 15,
        // position: 'absolute',
        // top: screenHeight -StatusBar.currentHeight-85,
        paddingTop: 10,
        backgroundColor: '#fff',
        height: 65,
        width: '100%',
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
        // marginHorizontal: 9,
        width: '96%',
        // backgroundColor:'red',
        alignSelf:'center'
    },
    progressCircle: {
        width: 28,
        height: 28,
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
        width: (screenWidth/6)-28,
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

export default DailyEntryScreen;