import React, {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  View,
} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {RootNav} from './src/routes/routes';
import {getStore, getPersistor} from './src/store/index';


const App = () => {
  const myStore = getStore();
  const myPersistor = getPersistor();

  const renderLoading = () => {
    return (
      <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  };

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
      <PersistGate loading={null} persistor={myPersistor}>
        <RootNav />
      </PersistGate>
    </Provider>
  );
};
export default App;
