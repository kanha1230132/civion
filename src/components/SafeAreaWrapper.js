import React, { ReactNode } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { appColor } from '../theme/appColor';





// Custom dynamic SafeAreaView component
const DynamicSafeAreaView = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        {
          // paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          flex: 1
        },
        style
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

// Main provider component for your app
export const SafeAreaWrapper = ({ children }) => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle='default'
        backgroundColor={appColor.primary}
        translucent
      />
      <DynamicSafeAreaView style={undefined}>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: appColor.white,
            // paddingHorizontal: 15,
          }}>
          {children}
        </ScrollView>
      </DynamicSafeAreaView>
    </SafeAreaProvider>
  );
};
