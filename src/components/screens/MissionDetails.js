import React from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Header from '../../components/common/Header';
import {toFaDigit} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionDetails = ({navigation}) => {
  const mission = navigation.getParam('mission', {});
  const startLocation = mission.StartLocation;
  const EndLocation = mission.EndLocation;
  const StartLatitude = startLocation.substr(0, startLocation.indexOf(','));
  const StartLongitude = startLocation.substr(
    startLocation.indexOf(',') + 1,
    startLocation.length,
  );
  const EndLatitude = EndLocation.substr(0, EndLocation.indexOf(','));
  const EndLongitude = EndLocation.substr(
    EndLocation.indexOf(',') + 1,
    EndLocation.length,
  );

  const startFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: mission.ID,
        properties: {
          id: mission.ID,
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(StartLongitude)+5, parseFloat(StartLatitude)+5],
        },
      },
    ],
  };

  const endFeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: -mission.ID,
        properties: {
          id: -mission.ID,
        },
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(EndLongitude), parseFloat(EndLatitude)],
        },
      },
    ],
  };

  return (
    <View style={{flex: 1}}>
      <Header headerText="داتیس سرویس" />
      <View style={Styles.contentContainerStyle}>
        <MapboxGL.MapView style={{width: '100%', height: pageHeight * 0.57}}>
          <MapboxGL.Camera
            centerCoordinate={[
              (parseFloat(StartLongitude) + parseFloat(EndLongitude)) / 2,
              (parseFloat(StartLatitude) + parseFloat(EndLatitude)) / 2,
            ]}
            zoomLevel={10}
          />
          <MapboxGL.ShapeSource
            id="symbolLocationSource"
            shape={startFeatureCollection}>
            <MapboxGL.SymbolLayer
              id="marker"
              style={{
                iconImage:
                  'https://i7.pngguru.com/preview/731/25/158/computer-icons-google-map-maker-marker-pen-cartodb-clip-art-map-marker.jpg',
                iconSize: 0.3,
              }}
            />
          </MapboxGL.ShapeSource>
          <MapboxGL.ShapeSource
            id="symbolLocationSource"
            shape={endFeatureCollection}>
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
        <View style={Styles.detailsContainerStyle}>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.secondSingleItemContainerStyle}>
              <Text style={Styles.itemTextStyle}>{mission.StartCity}</Text>
              <Text style={Styles.itemTitleStyle}>شهر: </Text>
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
              <Text style={Styles.itemTitleStyle}>شهر: </Text>
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
                mission.Distance,
              )} متر`}</Text>
              <Text style={Styles.itemTitleStyle}>طول ماموریت: </Text>
            </View>
          </View>
          <View style={Styles.singleRowContainerStyle}>
            <View style={Styles.secondSingleItemContainerStyle}>
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
    padding: 10,
  },
  detailsContainerStyle: {
    flex: 1,
    padding: 15,
  },
  singleRowContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  secondSingleItemContainerStyle: {
    margin: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: "30%",
  },
  firstSingleItemContainerStyle: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width:"60%",
  },
  itemTitleStyle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemTextStyle: {
    fontSize: 15,
  },
});

export default MissionDetails;
