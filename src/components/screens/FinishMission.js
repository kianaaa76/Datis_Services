import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {getDistance} from 'geolib';
import {useSelector, useDispatch} from 'react-redux';
import MapboxGL from '@react-native-mapbox-gl/maps';
import moment from 'moment-jalaali';
import Header from '../common/Header';
import {toFaDigit} from '../utils/utilities';
import {MissionFinish} from '../../actions/api';
import {
  FINISH_MISSION_SUCCESS,
  FINISH_MISSION_FAIL,
  API_KEY,
} from '../../actions/types';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const FinishMission = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);

  const [pageState, setPageState] = useState('missionInProccess');
  const [userLatitude, setUserLatitude] = useState('');
  const [userLongitude, setUserLongitude] = useState('');
  const [missionDescription, setMissionDescripton] = useState('');
  const [finishMissionLoading, setFinishMissionLoading] = useState(false);
  const [distance, setDistance] = useState('');
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');

  const startDate = navigation.getParam('startDate');
  const startLatitude = navigation.getParam('startLatitude');
  const startLongitude = navigation.getParam('startLongitude');

  const startFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: '1',
        properties: {
          id: '1',
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(startLongitude), parseFloat(startLatitude)],
        },
      },
    ],
  };

  const finishFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: '2',
        properties: {
          id: '2',
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)],
        },
      },
    ],
  };

  useEffect(() => {
    const distance = getDistance(
      {latitude: startLatitude, longitude: startLongitude},
      {latitude: userLatitude, longitude: userLongitude},
    );
    console.warn('distance', distance);
    setDistance(distance);
  }, []);

  useEffect(() => {
    fetch(`https://map.ir/reverse?lat=${startLatitude}&lon=${startLongitude}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    })
      .then(response => response.json())
      .then(data => {
        setStartCity(data.city);
      });

    fetch(`https://map.ir/reverse?lat=${userLatitude}&lon=${userLongitude}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    })
      .then(response => response.json())
      .then(data => {
        setEndCity(data.city);
      });
  }, []);

  const finishMissionRequest = (
    token,
    missionId,
    endLocation,
    serviceManId,
    startCity,
    endCity,
    description,
    distance,
  ) => {
    setFinishMissionLoading(true);
    MissionFinish(
      token,
      missionId,
      endLocation,
      serviceManId,
      startCity,
      endCity,
      description,
      distance,
    ).then(data => {
      console.warn('finishMissionResponse', data);
      if (data.errorCode == 0) {
        dispatch({
          type: FINISH_MISSION_SUCCESS,
          unfinishedMissionId: null,
          finishMissionError: '',
        });
        navigation.navigate('Mission');
        ToastAndroid.showWithGravity(
          'ماموریت با موفقیت ثبت شد.',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        dispatch({
          type: FINISH_MISSION_FAIL,
          finishMissionError: data.message,
        });
        ToastAndroid.showWithGravity(
          data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
      setFinishMissionLoading(false);
    });
  };

  return (
    <View style={Styles.containerStyle}>
      <Header headerText="داتیس سرویس" />
      <View style={Styles.contentContainerStyle}>
        {pageState == 'missionInProccess' ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={Styles.titleTextStyle}>پایان ماموریت</Text>
            <MapboxGL.MapView style={Styles.mapStyle1}>
              <MapboxGL.UserLocation
                onUpdate={location => {
                  setUserLatitude(location.coords.latitude);
                  setUserLongitude(location.coords.longitude);
                }}
              />
              <MapboxGL.Camera
                centerCoordinate={[startLongitude, startLatitude]}
                zoomLevel={12}
              />
              <MapboxGL.ShapeSource
                id="symbolLocationSource"
                shape={startFeatureCollection}>
                <MapboxGL.SymbolLayer
                  id="marker"
                  style={{
                    iconImage:
                      'https://i7.pngguru.com/preview/731/25/158/computer-icons-google-map-maker-marker-pen-cartodb-clip-art-map-marker.jpg',
                    iconSize: 0.1,
                  }}
                />
              </MapboxGL.ShapeSource>
            </MapboxGL.MapView>
            <View style={Styles.finishMissionDateContainerStyle}>
              <Text style={Styles.startTextStyle}>
                {toFaDigit(
                  new moment(startDate).format('jYYYY/jMM/jDD  HH:mm'),
                )}
              </Text>
              <Text style={Styles.startTitleTextStyle}>شروع ماموریت: </Text>
            </View>
            <TouchableOpacity
              style={Styles.finishMissionButtonStyle}
              onPress={() => {
                setPageState('finishMission');
              }}>
              <Text style={Styles.finishMissionButtonTextStyle}>
                پایان ماموریت
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{
              height: pageHeight,
              padding: 10,
            }}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
            keyboardShouldPersistTaps="handled">
            <Text style={Styles.finishPageTitleTextStyle}>پایان ماموریت</Text>
            <MapboxGL.MapView style={Styles.mapStyle2}>
              {!!userLatitude && !!userLongitude && (
                <MapboxGL.Camera
                  centerCoordinate={[userLongitude, userLatitude]}
                  zoomLevel={12}
                />
              )}
              {!!userLatitude && !!userLongitude && (
                <MapboxGL.ShapeSource
                  id="symbolLocationSource2"
                  shape={finishFeatureCollection}>
                  <MapboxGL.SymbolLayer
                    id="marker"
                    style={{
                      iconImage:
                        'https://i7.pngguru.com/preview/731/25/158/computer-icons-google-map-maker-marker-pen-cartodb-clip-art-map-marker.jpg',
                      iconSize: 0.1,
                    }}
                  />
                </MapboxGL.ShapeSource>
              )}
            </MapboxGL.MapView>
            <View style={Styles.cityDataContainerStyle}>
              <View style={Styles.cityDataContentContainerStyle}>
                <Text style={Styles.citiDataTextStyle}>تهران</Text>
                <Text style={Styles.cityDataTitleStyle}>شهر مقصد: </Text>
              </View>
              <View style={Styles.cityDataContentContainerStyle}>
                <Text style={Styles.citiDataTextStyle}>تهران</Text>
                <Text style={Styles.cityDataTitleStyle}>شهر مبدا: </Text>
              </View>
            </View>
            <View style={Styles.descriptionContainerStyle}>
              <Text style={Styles.descriptionTitleTextStyle}>توضیحات: </Text>
              <TextInput
                style={Styles.descriptionTextInputStyle}
                multiline
                onChangeText={description => setMissionDescripton(description)}
              />
            </View>
            <View style={Styles.buttonsContainerStyle}>
              <TouchableOpacity
                style={Styles.buttonStyle}
                onPress={() => setPageState('missionInProccess')}>
                <Text style={Styles.buttonTextStyle}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.buttonStyle}
                onPress={() =>
                  finishMissionRequest(
                    selector.token,
                    `${userLatitude},${userLongitude}`,
                    selector.userId,
                    startCity,
                    endCity,
                    missionDescription,
                    distance,
                  )
                }>
                {finishMissionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={Styles.buttonTextStyle}>تایید</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  contentContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  titleTextStyle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  mapStyle1: {
    width: pageWidth * 0.85,
    height: pageHeight * 0.5,
  },
  finishMissionDateContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: pageWidth * 0.9,
    height: pageHeight * 0.07,
    marginTop: 20,
  },
  startTitleTextStyle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startTextStyle: {
    fontSize: 17,
    textAlign: 'center',
  },
  finishMissionButtonStyle: {
    width: pageWidth * 0.65 * 0.5,
    height: pageHeight * 0.07,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  finishMissionButtonTextStyle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  finishPageTitleTextStyle: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  mapStyle2: {
    width: '100%',
    height: pageHeight * 0.3,
  },
  cityDataContainerStyle: {
    width: pageWidth * 0.8,
    height: pageHeight * 0.06,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  citiDataTextStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: 15,
    marginLeft: 10,
  },
  cityDataTitleStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionTextInputStyle: {
    width: '100%',
    height: pageHeight * 0.2,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    padding: 15,
  },
  buttonsContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: pageWidth * 0.7,
    height: pageHeight * 0.08,
  },
  buttonStyle: {
    width: pageWidth * 0.65 * 0.5,
    height: pageHeight * 0.07,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonTextStyle: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  descriptionContainerStyle: {
    width: pageWidth * 0.8,
    height: pageHeight * 0.25,
  },
  descriptionTitleTextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cityDataContentContainerStyle: {
    flexDirection: 'row',
    width: '40%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FinishMission;
