// BottomTabNavigator.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import MileageHistoryScreen from './MileageHistoryScreen';
import Expenses from './Expenses';
import Daily72 from './reports/Daily72';
import Invoicing from './Invoicing';
import { SCREENS } from '../utils/ScreenNames';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ProjectContext } from '../utils/ProjectContext';


const BottomTabNavigator = () => {
const Tab = createBottomTabNavigator();
const { isBoss} = useContext(ProjectContext);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          // position: 'absolute',
          // bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: '#fff',
          borderTopWidth: 0,
        },
      }}
    >
      <Tab.Screen name={SCREENS.HOME_SCREEN} component={HomeScreen} options={{ 
        tabBarActiveTintColor: '#486ECD',
        tabBarLabel: 'Home' ,
            tabBarIcon: ({ color, size,focused }) => (
             <Icon name="home" size={size} color={focused ? '#486ECD' : color}  />
            ),
}} />
      <Tab.Screen name="Mileage" component={MileageHistoryScreen} options={{  tabBarLabel: 'Mileage' ,
        tabBarActiveTintColor: '#486ECD',

            tabBarIcon: ({ color, size ,focused }) => (
            <Icon name="directions-car" size={size}  color={focused ? '#486ECD' : color} />
            ),}} />
      <Tab.Screen name="Expenses" component={Expenses} options={{ tabBarLabel: 'Expenses',
        tabBarActiveTintColor: '#486ECD',

            tabBarIcon: ({ color, size, focused }) => (
              <Icon name="attach-money" size={size} color={focused ? '#486ECD' : color}  />
            ), }} />
      <Tab.Screen name="Reports" component={Daily72} options={{ tabBarLabel: 'Reports' ,
        tabBarActiveTintColor: '#486ECD',

            tabBarIcon: ({ color, size, focused }) => (
            <Icon name="insert-chart" size={size} color={focused ? '#486ECD' : color}  />
            ),}} />

           
     { isBoss && <Tab.Screen name="Invoicing" component={Invoicing} options={{ tabBarLabel: 'Invoicing',
        tabBarActiveTintColor: '#486ECD',

            tabBarIcon: ({ color, size, focused }) => (
            <Icon name="description" size={size} color={focused ? '#486ECD' : color}  />
            ), }} />}
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;