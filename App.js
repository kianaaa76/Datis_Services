import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  I18nManager
} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {RootNav} from './src/routes/routes';
import {getStore, getPersistor} from './src/store/index';
import SendData from "./src/components/screens/SendData";

I18nManager.allowRTL(false);

const App = () => {
  const myStore = getStore();
  const myPersistor = getPersistor();
  useEffect(() => {
    if (Platform.OS === 'android') {
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
        <SendData/>
      <PersistGate loading={null} persistor={myPersistor}>
      <StatusBar backgroundColor="#520000"/>
        <RootNav/>
      </PersistGate>
    </Provider>
  );
};



export default App;
