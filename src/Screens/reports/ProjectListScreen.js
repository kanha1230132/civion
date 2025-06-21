import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appColor } from '../../theme/appColor';
import LoaderModal from '../../components/modal/Loader';
import apiClient from '../../api/apiClient';
import { endPoints } from '../../api/endPoints';
import { useErrorPopup } from '../../components/popup/errorPopup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Constants, TypeReports } from '../../utils/Constants';
import { ProjectContext } from '../../utils/ProjectContext';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import { appFonts } from '../../theme/appFonts';
import { SCREENS } from '../../utils/ScreenNames';
import { useIsFocused } from '@react-navigation/native';
import util from '../../utils/util';
const ProjectListScreen = ({ route, navigation }) => {
  const [screenTitle, setScreenTitle] = useState('');
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(false)
  const { showErrorPopup, ErrorPopup, errorPopupVisible } = useErrorPopup();
  const { setProjectData,setDairyEntryReport,setWeeklyEntryReport,setDailyEntryReport } = useContext(ProjectContext);

  const isFocused = useIsFocused();

  useEffect(()=>{
    if(isFocused){
      setDailyEntryReport(undefined)
      setDairyEntryReport(undefined)
      setWeeklyEntryReport(undefined)
    }
  },[isFocused])

  useEffect(() => {
    if (route?.params?.ScreenName) {
      setScreenTitle(route?.params?.ScreenName);
    }
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post(endPoints.URL_GET_ALL_PROJECTS);
       if (response.status == 403 || response.status == 401) {
              const result = await showErrorPopup(response.data.message);
              if(result){
                util.logoutUser();
                navigation.navigate(SCREENS.LOGIN_SCREEN);
              }
              return;
            }
      if (response.status == 200 || response.status == 201) {
        const projects = response.data;

        if(projects.status == "success"){
          if (projects.data?.length) {
            const list = projects.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setProjectList(list);
          } else {
            showErrorPopup(projects.message);
          }
        }
      } else {
        const message = response.data?.message || "Failed to get Projects";
        showErrorPopup(message);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error : ", error);
      showErrorPopup(error?.message || 'Failed to get Projects');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={async () => {
          clickOnProject(item);
        }}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.projectName}</Text>
            <Text style={styles.subtitle}>Project Number: {item.projectNumber}</Text>
            <Text style={styles.subtitle}>Owner: {item.owner}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#486ECD" />
        </View>
      </TouchableOpacity>
    );
  };

  const clickOnProject = async (item) => {
    try {
      const userId = await AsyncStorage.getItem(Constants.USER_ID)
      const screen = route?.params?.ScreenName
      setProjectData({
        projectId: item.projectId?._id,
        projectName: item.projectName,
        projectNumber: item.projectNumber,
        owner: item.owner,
        userId,
      });
      if (screen == TypeReports.WEEKLY) {
        navigation.navigate(SCREENS.WEEKLY_ENTRY_SCREEN);
      }else if(screen == TypeReports.DAILY){
        navigation.navigate(SCREENS.DAILY_ENTRY_SCREEN)
      } else if (screen == TypeReports.DAIRY) {
         navigation.navigate(SCREENS.DAIRY_ENTRY_SCREEN)
      }
    } catch (error) {
      console.log("Error clickOnProject : ", error);
    }
  }


  return (
    <SafeAreaView  style={styles.container}>
      <HeaderWithBackButton title={screenTitle +" Project List"} onBackClick={() => navigation.goBack()} />
      {
        !loading && projectList.length > 0 && (
          <FlatList
            data={projectList}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            refreshing={loading}
            onRefresh={fetchProjects}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )
      }



      {
        !loading && projectList.length === 0 && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18,fontFamily:appFonts.Medium, }}>No projects found.</Text>
          </View>
        )
      }


      <LoaderModal visible={loading} />

      {errorPopupVisible ?
        ErrorPopup() : null
      }
    </SafeAreaView >
  )
}

export default ProjectListScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 15,
  },
  header: {
    fontSize: 18,
   
    fontFamily:appFonts.Bold,
    color: appColor.primary,
    marginLeft: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop:20,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation:1
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "100%"
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily:appFonts.SemiBold,
    color: '#000000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,  // Keep it the same size as Project No
    fontFamily:appFonts.Medium,  // Make it bold if needed
    color: '#666666',
    marginBottom: 5,
  },
  emptyList: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});