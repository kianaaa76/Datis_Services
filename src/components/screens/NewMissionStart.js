import React, {useState, useEffect} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../common/Header';
import {NewMissionStart, MissionFinish} from '../../actions/api';
import {START_MISSION_SUCCESS, START_MISSION_FAIL} from '../../actions/types';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const NewMission = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);

  const [userLatitude, setUserLatitude] = useState('');
  const [userLongitude, setUserLongitude] = useState('');
  const [startMissionLoading, setStartMissionLoading] = useState(false);

//   useEffect(() => {
//     MissionFinish(
//       selector.token,
//       1340,
//       `${userLatitude},${userLongitude}`,
//       40,
//       'تهران',
//       'تهران',
//       'سلام سلام',
//       10,
//     ).then(data => {
//       console.warn('dataaaa', data);
//     });
//   }, []);

  const startMissionRequest = (token, startLocation, serviceManId) => {
    setStartMissionLoading(true);
    NewMissionStart(token, startLocation, serviceManId).then(data => {
      console.warn('startMissionResponse', data);
      if (data.errorCode == 0) {
        dispatch({
          type: START_MISSION_SUCCESS,
        //   startMissionError: '',
          unfinishedMissionId: data.result,
        });
        navigation.navigate('FinishMission', {
          startDate: Date.now(),
          startLatitude: userLatitude,
          startLongitude: userLongitude,
        });
      } else {
        dispatch({
          type: START_MISSION_FAIL,
          startMissionError: data.message,
        });
      }
      setStartMissionLoading(false);
    });
  };

  const featureCollection = {
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
          coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)],
        },
      },
    ],
  };
  return (
    <View style={Styles.containerStyle}>
      <Header headerText="داتیس سرویس" />
      <View style={Styles.contentContainerStyle}>
        <Text style={Styles.titleTextStyle}>
          مبدا ماموریت مورد تایید شماست؟
        </Text>
        <MapboxGL.MapView
          style={{width: pageWidth * 0.8, height: pageHeight * 0.5}}>
          <MapboxGL.UserLocation
            onUpdate={location => {
              setUserLatitude(location.coords.latitude);
              setUserLongitude(location.coords.longitude);
            }}
          />
          {!!userLatitude && !!userLongitude && (
            <MapboxGL.Camera
              centerCoordinate={[
                parseFloat(userLongitude),
                parseFloat(userLatitude),
              ]}
              zoomLevel={12}
            />
          )}
          {!!userLatitude && !!userLongitude && (
            <MapboxGL.ShapeSource
              id="symbolLocationSource"
              shape={featureCollection}>
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
        <View style={Styles.buttonsContainerStyle}>
          <TouchableOpacity
            style={Styles.buttonStyle}
            onPress={() => navigation.goBack()}>
            <Text style={Styles.buttonTextStyle}>خیر</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={Styles.buttonStyle}
            onPress={() =>
              startMissionRequest(
                selector.token,
                `${userLatitude},${userLongitude}`,
                selector.userId,
              )
            }>
            {startMissionLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={Styles.buttonTextStyle}>بله</Text>
            )}
          </TouchableOpacity>
        </View>
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
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  buttonsContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: pageWidth * 0.65,
    alignItems: 'center',
    marginTop: 25,
    height: pageHeight * 0.07,
  },
  buttonStyle: {
    width: '40%',
    height: '100%',
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonTextStyle: {
    color: '#fff',
    fontSize: 16,
  },
});

export default NewMission;
