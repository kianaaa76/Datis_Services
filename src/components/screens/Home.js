import React, {useState} from 'react';
import {
  View,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import backgroundImage from '../../../assets/images/background_main_activity.jpg';
import Header from '../common/Header';

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const Home = ({navigation}) => {
  const shadowOpt = {
    width: pageWidth * 0.258,
    height: pageWidth * 0.258,
    color: '#000',
    radius: 15,
    opacity: 0.1,
    x: 0,
    y: 0,
    style: {justifyContent: 'center', alignItems: 'center'},
  };

  const images = [
    require('../../../assets/images/icon_settlement.png'),
    require('../../../assets/images/icon_my_services.png'),
    require('../../../assets/images/icon_rejected.png'),
    require('../../../assets/images/icon_archive.png'),
    require('../../../assets/images/icon_inventory.png'),
    require('../../../assets/images/icon_mission.png'),
  ];

  const renderHomeItems = (title, imageSource, onClick) => {
    return (
      <View style={Styles.singleItemContainerStyle}>
        <BoxShadow setting={shadowOpt}>
          <TouchableOpacity
            style={Styles.itemImageContainerStyle}
            onPress={onClick}>
            <Image source={imageSource} style={Styles.itemImageStyle} />
          </TouchableOpacity>
        </BoxShadow>
        <View style={Styles.itemTitleContainerStyle}>
          <Text style={Styles.itemTitleStyle}>{title}</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={Styles.containerStyle}
      imageStyle={{resizeMode: 'stretch'}}>
      <Header headerText="داتیس سرویس" />
      <View style={Styles.contentStyle}>
        <View style={Styles.SingleRowStyle}>
          {renderHomeItems('سرویس‌های مانده‌دار', images[0], () => {
            navigation.navigate("RemainingServices");
          })}
          {renderHomeItems('سرویس‌های من', images[1], () => {
            navigation.navigate('MyServices');
          })}
        </View>
        <View style={Styles.SingleRowStyle}>
          {renderHomeItems('سرویس‌های رد‌شده', images[2], () => {
            navigation.navigate('RejectedServices');
          })}
          {renderHomeItems('آرشیو سرویس‌ها', images[3], () => {})}
        </View>
        <View style={Styles.SingleRowStyle}>
          {renderHomeItems('انبارداری', images[4], () => {})}
          {renderHomeItems('ماموریت‌های من', images[5], () => {
            navigation.navigate('Mission');
          })}
        </View>
        <TouchableOpacity style={Styles.callIconContainerStyle}>
          <Image
            source={require('../../../assets/images/icon_call.png')}
            style={Styles.callIconStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity style={Styles.missCallIconContainerStyle}>
          <Image
            source={require('../../../assets/images/icon_miss_call.png')}
            style={Styles.callIconStyle}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  contentStyle: {
    flex: 1,
    height: pageHeight,
  },
  SingleRowStyle: {
    width: pageWidth,
    height: pageHeight * 0.23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: pageHeight * 0.01,
  },
  itemImageContainerStyle: {
    width: pageWidth * 0.3,
    height: pageWidth * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageStyle: {
    width: pageWidth * 0.3,
    height: pageWidth * 0.3,
  },
  singleItemContainerStyle: {
    width: pageWidth * 0.5,
    height: pageWidth * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitleContainerStyle: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemTitleStyle: {
    color: 'gray',
    fontSize: 13,
    textAlign: 'center',
  },
  callIconStyle: {
    width: pageWidth * 0.14,
    height: pageWidth * 0.14,
  },
  callIconContainerStyle: {
    position: 'absolute',
    bottom: pageHeight * 0.008,
    right: pageWidth * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
    width: pageWidth * 0.14,
    height: pageWidth * 0.14,
  },
  missCallIconContainerStyle: {
    position: 'absolute',
    bottom: pageHeight * 0.008,
    right: pageWidth * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    width: pageWidth * 0.14,
    height: pageWidth * 0.14,
  },
});

export default Home;
