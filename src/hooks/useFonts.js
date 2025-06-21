import * as Font from 'expo-font';

export default useFonts = async () =>
  await Font.loadAsync({
    'TTNorms-Bold': require('../../assets/fonts/Montserrat-Bold.ttf'),
    'TTNorms-Light': require('../../assets/fonts/Montserrat-Light.ttf'),
    'TTNorms-Medium': require('../../assets/fonts/Montserrat-Medium.ttf'),
    'TTNorms-Regular': require('../../assets/fonts/Montserrat-Regular.ttf'),
    'TTNorms-Thin': require('../../assets/fonts/Montserrat-Thin.ttf'),
    'TTNorms-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
  });
