import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  I18nManager,
  StyleSheet,
  Dimensions,
  View
} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {RootNav} from './src/routes/routes';
import {getStore, getPersistor} from './src/store/index';

I18nManager.allowRTL(false);
const pageWidth = Dimensions.get("screen").width;


const App = () => {
  const myStore = getStore();
  const myPersistor = getPersistor();
  useEffect(() => {
    if (Platform.OS == 'android') {
      const granted = PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      ]);
      if (!granted) {
        showToast(
          'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
        );
      }
    }
  }, []);



  return (
    <Provider store={myStore}>
        {/*<SendData/>*/}
      <PersistGate loading={null} persistor={myPersistor}>
      <View style={styles.statusBarBackground} />
      {/* <StatusBar backgroundColor="#520000" height={Platform.OS == 'ios' ? 20 : 0}/> */}
        <RootNav/>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  statusBarBackground: {
    backgroundColor: "#520000",
    height: Platform.OS === "ios" ? 20 : 0,
    width: pageWidth
  }
});



export default App;
