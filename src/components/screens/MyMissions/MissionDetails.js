import React,{useEffect} from 'react';
import {View, StyleSheet, Dimensions, Text, BackHandler} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Header from '../../common/Header';
import {toFaDigit, normalize, getFontsName} from '../../utils/utilities';
import {MapMarkerIcon} from "../../../assets/icons";

const pageHeight = Dimensions.get('screen').height;

const MissionDetails = ({navigation}) => {
  const mission = navigation.getParam('mission', {});
  const StartLocation = mission.StartLocation;
  const EndLocation = mission.EndLocation;
  const StartLatitude =
    !!StartLocation && StartLocation.length > 0
      ? StartLocation.substr(0, StartLocation.indexOf(','))
      : 0;
  const StartLongitude =
    !!StartLocation && StartLocation.length > 0
      ? StartLocation.substr(
          StartLocation.indexOf(',') + 1,
          StartLocation.length,
        )
      : 0;
  const EndLatitude =
    !!EndLocation && EndLocation.length > 0
      ? EndLocation.substr(0, EndLocation.indexOf(','))
      : 0;
  const EndLongitude =
    !!EndLocation && EndLocation.length > 0
      ? EndLocation.substr(EndLocation.indexOf(',') + 1, EndLocation.length)
      : 0;

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  const renderMarker = (latitude, longitude, color, size, id, type) => {
    return (
      <MapboxGL.MarkerView id={id} coordinate={[longitude, latitude]}>
        <View
          style={{
            alignItems: 'center',
            width: 100,
            backgroundColor: 'transparent',
            height: 100,
            zIndex: -9999,
          }}>
          {MapMarkerIcon({
            color:color,
            fill:color
          })}
          <View style={Styles.markerLabelContainerStyle}>
            <Text style={Styles.markerLabelStyle}>
              {type === 'start' ? 'مبدا' : 'مقصد'}
            </Text>
          </View>
        </View>
      </MapboxGL.MarkerView>
    );
  };

  return (
    <View style={{flex: 1}}> 
      <Header headerText="داتیس سرویس" onBackPress={()=>navigation.goBack()} iisCurrentRootHome={false}/>
      <View style={Styles.contentContainerStyle}>
        <View>
          <MapboxGL.MapView style={{width: '100%', height: pageHeight * 0.57}}>
            <MapboxGL.Camera
              ref={cameraRef => {
                if (!!cameraRef) {
                  if (
                    !!StartLatitude &&
                    !!StartLongitude &&
                    !!EndLatitude &&
                    !!EndLongitude
                  ) {
                    cameraRef.fitBounds(
                      [StartLongitude, StartLatitude],
                      [EndLongitude, EndLatitude],
                      50,
                    );
                  } else if (!!StartLatitude && !!StartLongitude) {
                    cameraRef.moveTo([StartLongitude, StartLatitude], 500);
                    // cameraRef.zoomTo(10,500);
                  } else if (!!EndLatitude && !!EndLongitude) {
                    cameraRef.moveTo([EndLongitude, EndLatitude], 500);
                    // cameraRef.zoomTo(10,500);
                  }
                }
              }}
            />
            {!!StartLatitude &&
              !!StartLongitude &&
              renderMarker(
                StartLatitude,
                StartLongitude,
                'blue',
                45,
                '1',
                'start',
              )}
            {!!EndLatitude &&
              !!EndLongitude &&
              renderMarker(EndLatitude, EndLongitude, 'red', 45, '2', 'end')}
          </MapboxGL.MapView>
        </View>
        <View style={Styles.detailsContainerStyle}>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.secondSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>{mission.StartCity}</Text>
              <Text style={Styles.itemTitleStyle}>شهر مبدا: </Text>
            </View>
            <View style={Styles.firstSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>
                {toFaDigit(mission.StartDate)}
              </Text>
              <Text style={Styles.itemTitleStyle}>شروع ماموریت: </Text>
            </View>
          </View>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.secondSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>{mission.EndCity}</Text>
              <Text style={Styles.itemTitleStyle}>شهر مقصد: </Text>
            </View>
            <View style={Styles.firstSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>
                {toFaDigit(mission.EndDate)}
              </Text>
              <Text style={Styles.itemTitleStyle}>پایان ماموریت: </Text>
            </View>
          </View>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.secondSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>
                {mission.Travel ? 'بله' : 'خیر'}
              </Text>
              <Text style={Styles.itemTitleStyle}>رفت و برگشت: </Text>
            </View>
            <View style={Styles.firstSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>{`${toFaDigit(
                parseInt(mission.Distance) > 1000
                  ? (parseFloat(mission.Distance) / 1000)
                      .toString()
                      .substr(
                        0,
                        (parseFloat(mission.Distance) / 1000).toString()
                          .length - 1,
                      )
                  : mission.Distance,
              )} ${mission.Distance > 1000 ? 'کیلومتر' : 'متر'}`}</Text>
              <Text style={Styles.itemTitleStyle}>طول ماموریت: </Text>
            </View>
          </View>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.firstSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>{mission.Description}</Text>
              <Text style={Styles.itemTitleStyle}>توضیحات: </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  contentContainerStyle: {
    flex: 1,
    zIndex: -9999,
  },
  detailsContainerStyle: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  singleRowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 3,
  },
  secondSingleItemContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '30%',
  },
  firstSingleItemContainerStyle: {
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '60%',
  },
  itemTitleStyle: {
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    fontSize: normalize(13),
  },
  itemTextStyle: {
    fontSize: normalize(12),
    fontFamily: getFontsName('IRANSansMobile_Light'),
    flexShrink: 1,
  },
  markerLabelStyle: {
    alignSelf: 'center',
    textAlign: 'center',
    color: '#000',
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    fontSize: normalize(12),
  },
  markerLabelContainerStyle:{
    width: 50,
    height: 20,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#A8A7A7',
  }
});

export default MissionDetails;
