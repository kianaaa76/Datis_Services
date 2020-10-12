import React from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Header from '../../common/Header';
import {toFaDigit} from '../../utils/utilities';
import Icon from "react-native-vector-icons/Foundation";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionDetails = ({navigation}) => {
  const mission = navigation.getParam('mission', {});
  const StartLocation = mission.StartLocation;
  const EndLocation = mission.EndLocation;
  const StartLatitude = StartLocation.length>1 ? StartLocation.substr(0, StartLocation.indexOf(',')):0;
  const StartLongitude = StartLocation.length>1 ? StartLocation.substr(StartLocation.indexOf(',') + 1, StartLocation.length,):0;
  const EndLatitude = EndLocation.length>1 ? EndLocation.substr(0, EndLocation.indexOf(',')):0;
  const EndLongitude = EndLocation.length>1 ? EndLocation.substr(EndLocation.indexOf(',') + 1, EndLocation.length):0;

  const renderMarker = (latitude,longitude, color, size, id, type) =>{
    return(
        <View>
          <MapboxGL.MarkerView
              id={id}
              coordinate={[longitude, latitude]}>
            <View>
              <View style={{
                alignItems: 'center',
                width: 100,
                backgroundColor: 'transparent',
                height: 100,
              }}>
                <Icon name="marker" color={color} size={size}/>
                <Text style={Styles.markerLabelStyle}>{type == "start"? "مبدا" : "مقصد"}</Text>
              </View>
            </View>
          </MapboxGL.MarkerView>
        </View>
    )
  }

  return (
    <View style={{flex: 1}}>
      <Header headerText="داتیس سرویس" />
      <View style={Styles.contentContainerStyle}>
        <MapboxGL.MapView style={{width: '100%', height: pageHeight * 0.57}}>
          {(!!StartLongitude && !!StartLatitude && !EndLongitude && !EndLatitude) ?
          (<MapboxGL.Camera
            centerCoordinate={[parseFloat(StartLongitude), parseFloat(StartLatitude)]}
          zoomLevel={10}/>)
              :(!StartLongitude && !StartLatitude && !!EndLongitude && !!EndLatitude) ? (
                      <MapboxGL.Camera
                          centerCoordinate={[parseFloat(EndLongitude), parseFloat(EndLatitude),]}
                          zoomLevel={10}/>
                  ):null}
          {!!StartLatitude && !!StartLongitude && (
            renderMarker(StartLatitude, StartLongitude,"blue", 45, "1",'start'))}
          {!!EndLatitude && !!EndLongitude && (
            renderMarker(EndLatitude, EndLongitude, "red", 45, "2", "end"))}
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
  markerLabelStyle:{
    width:50,
    height:20,
    justifyContent:"center",
    textAlign:"center",
    borderRadius:10,
    backgroundColor:"#A8A7A7",
    color:"#000"
  }
});

export default MissionDetails;
