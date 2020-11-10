import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {toFaDigit} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RemainingServiceListItem = ({item, navigation}) => {
  const Item = item.item;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate('RemainingServiceDetail', {service: Item});
      }}>
      <View
        style={{
          width: pageWidth * 0.9,
          height: pageHeight * 0.1,
          backgroundColor: '#fff',
          padding: 10,
          marginVertical: 4,
          marginHorizontal: 3,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 3,
        }}>
        <View style={Styles.secondRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={{fontSize:13, fontFamily: 'IRANSansMobile(FaNum)_Light'}}>{toFaDigit(Item.projectID)}</Text>
            <Text style={{fontSize: 13, fontFamily: 'IRANSansMobile_Medium'}}>پروژه: </Text>
          </View>
        </View>
        <View style={Styles.secondRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={{color: '#CB3434', fontSize:13, fontFamily: 'IRANSansMobile_Light'}}>
              {Item.remaind == 0
                ? `${toFaDigit(0)} ریال`
                : ` ${toFaDigit(Item.remaind)}-  ریال`}
            </Text>
            <Text style={{fontSize: 13, fontFamily: 'IRANSansMobile_Medium', color: '#CB3434'}}>
              مانده:{' '}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const Styles = StyleSheet.create({
  secondRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  singleItemStyle: {
    flexDirection: 'row',
    justifyContent:"center",
    alignItems:"center"
  },
});

export default RemainingServiceListItem;
