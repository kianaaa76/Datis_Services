import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import Header from '../common/Header';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {normalize} from '../utils/utilities';
import {setHomeLocationOfUser} from '../../actions/api';
import {useSelector} from 'react-redux';

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const UserAddress = ({navigation}) => {
  const selector = useSelector(state => state);
  const [userLocation, setUserLoaction] = useState({
    userLatitude: '',
    userLongitude: '',
  });
  const [currentLocation, setCurrentLocation] = useState({
    curerntLatitude: '',
    currentLongitude: '',
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [cameraRef, setCameraRef] = useState('');

  useEffect(() => {
    setPageLoading(false);
  }, [cameraRef]);

  const renderMarker = (latitude, longitude) => {
    return (
      <MapboxGL.MarkerView id="1" coordinate={[longitude, latitude]}>
        <View
          style={{
            alignItems: 'center',
            width: 100,
            backgroundColor: 'transparent',
            height: 100,
            zIndex: -9999,
          }}>
          <Icon name="marker" color={'#660000'} size={45} />
        </View>
      </MapboxGL.MarkerView>
    );
  };

  const onMapPress = coords => {
    setUserLoaction({
      userLatitude: coords[1],
      userLongitude: coords[0],
    });
  };

  const onConfirmPress = () => {
    setRequestLoading(true);
    if (!userLocation.userLatitude && !userLocation.userLongitude) {
      setRequestLoading(false);
      ToastAndroid.showWithGravity(
        'ابتدا موقعیت منزل خود را مشخص کنید.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    } else {
      setHomeLocationOfUser(
        selector.token,
        `${userLocation.userLatitude},${userLocation.userLongitude}`,
      ).then(data => {
        if (data.errorCode == 0) {
          setRequestLoading(false);
          navigation.navigate('Home');
        } else {
          setRequestLoading(false);
          ToastAndroid.showWithGravity(
            'مشکلی پیش آمد. دوباره تلاش کنید.',
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      });
    }
  };

  return (
    <View style={Styles.containerStyle}>
      <Header headerText="اطلاعات کاربری" />
      {pageLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#660000" />
        </View>
      ) : (
        <View style={Styles.contentContainerStyle}>
          <MapboxGL.MapView
            style={{width: '100%', height: '100%'}}
            logoEnabled={false}
            onPress={feature => onMapPress(feature.geometry.coordinates)}>
            <MapboxGL.Camera
              ref={ref => {
                setCameraRef(ref);
              }}
            />
            <MapboxGL.UserLocation
              onUpdate={location => {
                setCurrentLocation({
                  currentLongitude: location.coords.longitude,
                  curerntLatitude: location.coords.latitude,
                });
                if (!!cameraRef) {
                  if (
                    !!userLocation.userLatitude &&
                    !!userLocation.userLongitude
                  ) {
                    cameraRef.moveTo([
                      userLocation.userLongitude,
                      userLocation.userLatitude,
                    ]);
                    cameraRef.zoomTo(11);
                  } else {
                    cameraRef.moveTo([
                      location.coords.longitude,
                      location.coords.latitude,
                    ]);
                    cameraRef.zoomTo(11);
                  }
                }
              }}
            />
            {!!userLocation.userLatitude &&
              !!userLocation.userLongitude &&
              renderMarker(
                userLocation.userLatitude,
                userLocation.userLongitude,
              )}
          </MapboxGL.MapView>
          {(!userLocation.userLatitude || !userLocation.userLongitude) && (
            <View style={Styles.headerTextContainerStyle}>
              <Text style={Styles.headerTextStyle}>
                لطفا موقعیت منزل خود را مشخص کنید.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={Styles.confirmButtonStyle}
            onPress={onConfirmPress}>
            {requestLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={Styles.confirmButtonTextStyle}>تایید</Text>
            )}
          </TouchableOpacity>
          {!!userLocation.userLatitude && !!userLocation.userLongitude && (
            <View style={Styles.removeMarkerContainerStyle}>
              <MaterialCommunityIcons
                name="map-marker-remove-variant"
                style={{fontSize: normalize(30), color: '#000'}}
                onPress={() => {
                  setUserLoaction({
                    userLatitude: '',
                    userLongitude: '',
                  });
                }}
              />
            </View>
          )}

          <View style={Styles.myLocationContainerStyle}>
            <MaterialIcons
              name={'my-location'}
              style={{fontSize: normalize(30), color: '#000'}}
              onPress={async () => {
                LocationServicesDialogBox.checkLocationServicesIsEnabled({
                  message:
                    "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
                  ok: 'YES',
                  cancel: 'NO',
                  enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                  showDialog: true, // false => Opens the Location access page directly
                  openLocationServices: true, // false => Directly catch method is called if location services are turned off
                  preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                  preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
                  providerListener: false, // true ==> Trigger locationProviderStatusChange listener when the location state changes
                })
                  .then(async () => {
                    if (
                      !!cameraRef &&
                      !!currentLocation.currentLongitude &&
                      !!currentLocation.curerntLatitude
                    ) {
                      await cameraRef.moveTo(
                        [
                          currentLocation.currentLongitude,
                          currentLocation.curerntLatitude,
                        ],
                        500,
                      );
                      await cameraRef.zoomTo(11, 500);
                    }
                  })
                  .catch(() => {
                    ToastAndroid.showWithGravity(
                      'موقعیت در دسترس نیست.',
                      ToastAndroid.SHORT,
                      ToastAndroid.CENTER,
                    );
                  });
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  contentContainerStyle: {
    flex: 1,
  },
  addressInputStyle: {
    width: '100%',
    height: pageHeight * 0.15,
    borderWidth: 1,
    borderRadius: 20,
  },
  buttonStyle: {
    width: '40%',
    height: pageHeight * 0.08,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonTextStyle: {
    color: '#fff',
    fontSize: 20,
  },
  cardContainerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 5,
    padding: 6,
    width: pageWidth * 0.9,
    height: pageHeight * 0.25,
    position: 'absolute',
    bottom: 15,
    left: pageWidth * 0.05,
  },
  headerTextStyle: {
    fontSize: normalize(15),
    fontFamily: 'IRANSansMobile_Medium',
    textAlign: 'center',
  },
  headerTextContainerStyle: {
    width: pageWidth * 0.65,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: pageHeight * 0.03,
    left: pageWidth * 0.2,
  },
  confirmButtonStyle: {
    width: pageWidth * 0.4,
    height: 50,
    backgroundColor: '#660000',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: pageHeight * 0.03,
    left: pageWidth * 0.3,
  },
  confirmButtonTextStyle: {
    color: '#fff',
    fontSize: normalize(17),
    fontFamily: 'IRANSansMobile_Medium',
  },
  removeMarkerContainerStyle: {
    position: 'absolute',
    bottom: pageHeight * 0.03,
    left: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
  },
  myLocationContainerStyle: {
    position: 'absolute',
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    bottom: pageHeight * 0.03,
  },
});

export default UserAddress;
