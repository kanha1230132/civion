import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { screenHeight, screenWidth } from '../utils/Constants';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import { endPoints } from '../api/endPoints';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColor } from '../theme/appColor';

const PDFViewer = ({ route, navigation }) => {
    const { pdfUrl } = route.params;
    return (
        <SafeAreaView style={{ flex: 1 ,paddingVertical:10}}>
            {/* Back Button */}
            <HeaderWithBackButton title="PDF Viewer" onBackClick={() => navigation.goBack()} />

            {/* WebView for PDF */}
            <WebView
                style={{
                    width: screenWidth,
                    height:screenHeight-200,
                    marginTop: 10,
                    alignSelf:'center',
                    backgroundColor:appColor.white
                }}
                
                source={{ uri: `${endPoints.URL_PDF_VIEWER_BASE_URL}${pdfUrl}` }}
                startInLoadingState={true}
                renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
            />
        </SafeAreaView>
    );
};

export default PDFViewer;
