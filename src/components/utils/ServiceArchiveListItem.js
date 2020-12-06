import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {toFaDigit, normalize} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionListItem = ({item, navigation}) => {
  const getState = stateNum => {
    switch (stateNum) {
      case 0:
        return 'تکمیل ثانویه';
      case 200:
        return 'پیش پرداخت و تایید مشتری';
      case 300:
        return 'در حال انجام سرویس';
      case 310:
        return 'رد شده';
      case 320:
        return 'تایید اطلاعات';
      case 340:
        return 'تایید کارشناس';
      case 400:
        return 'تایید پرداخت';
      case 401:
        return 'یگیری مالی';
      case 402:
        return 'مسدود مالی';
      case 450:
        return 'مانده دار';
      case 500:
        return 'تایید مالی';
      case 600:
        return 'تمام شده';
      case 700:
        return 'لغو شده';
      default:
        return '';
    }
  };

  const getStateColor = stateNum => {
    switch (stateNum) {
      case 0:
        return '#21B767';
      case 200:
        return '#21B767';
      case 300:
        return '#21B767';
      case 310:
        return 'red';
      case 320:
        return '#21B767';
      case 340:
        return '#21B767';
      case 400:
        return '#21B767';
      case 401:
        return '#21B767';
      case 402:
        return '#FF9340';
      case 450:
        return '#339FDE';
      case 500:
        return '#21B767';
      case 600:
        return '#21B767';
      case 700:
        return 'red';
      default:
        return '#000';
    }
  };

  const Item = item.item;
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate('ServiceArchiveDetail', {service: Item});
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
        <View style={Styles.firstRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={{color: getStateColor(Item.State), fontSize: normalize(12), fontFamily:"IRANSansMobile_Medium"}}>
              {getState(Item.State)}
            </Text>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Medium"}}>وضعیت: </Text>
          </View>
          <View style={Styles.singleItemStyle}>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Light"}}>{Item.Name}</Text>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Medium"}}>نام: </Text>
          </View>
        </View>
        <View style={Styles.firstRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Light"}}>{toFaDigit(Item.projectID)}</Text>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Medium"}}>پرونده: </Text>
          </View>
          <View style={Styles.singleItemStyle}>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Light"}}>{toFaDigit(Item.cell)}</Text>
            <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Medium"}}>همراه: </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    justifyContent:"center",
    alignItems:"center"
  },
});

export default MissionListItem;
