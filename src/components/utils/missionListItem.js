import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import {toFaDigit} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionListItem = ({item, navigation}) => {
  const shadowOpt = {
    width: pageWidth * 0.9,
    height: pageHeight * 0.1,
    color: '#000',
    radius: 5,
    opacity: 0.1,
    x: 2,
    y: 3,
    style: {justifyContent: 'center', alignItems: 'center', marginVertical: 6},
  };

  const Item = item.item;
  return (
    <View style={{flex: 1}}>
      <BoxShadow setting={shadowOpt}>
        <TouchableWithoutFeedback
          style={{
            width: '100%',
            height: '100%',
          }}
          onPress={() =>
            !!Item.EndDate
              ? navigation.navigate('MissionDetail', {mission: Item})
              : navigation.navigate('FinishMission', {
                  startDate: Item.StartDate,
                  startLatitude: Item.StartLocation.substr(
                    0,
                    Item.StartLocation.indexOf(','),
                  ),
                  startLongitude: Item.StartLocation.substr(
                    Item.StartLocation.indexOf(',') + 1,
                    Item.StartLocation.length,
                  ),
                })
          }>
          <View style={{
              width: pageWidth * 0.9,
              height: pageHeight * 0.1,
              backgroundColor: !!Item.EndDate ? '#fff' : 'red',
              padding: 10,
              marginVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(158, 150, 150, 0.3)',
          }}>
            <View style={Styles.firstRowContainerStyle}>
              <View style={Styles.singleItemStyle}>
                <Text>{toFaDigit(Item.ID)}</Text>
                <Text style={{fontWeight: 'bold'}}>شماره‌‌ماموریت: </Text>
              </View>
              <View style={Styles.singleItemStyle}>
                <Text>{toFaDigit(Item.StartDate)}</Text>
                <Text style={{fontWeight: 'bold'}}>شروع: </Text>
              </View>
            </View>
            <View style={Styles.secondRowContainerStyle}>
              <View style={Styles.singleItemStyle}>
                <Text>{toFaDigit(Item.EndDate)}</Text>
                <Text style={{fontWeight: 'bold'}}>پایان: </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </BoxShadow>
    </View>
  );
};

const Styles = StyleSheet.create({
  
  firstRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  singleItemStyle: {
    flexDirection: 'row',
  },
});

export default MissionListItem;
