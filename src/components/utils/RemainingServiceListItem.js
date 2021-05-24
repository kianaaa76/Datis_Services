import React from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {toFaDigit, normalize, getFontsName} from '../utils/utilities';

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
          justifyContent: 'space-between',
          alignItems: 'center',
          elevation: 3,
          flexDirection:"row"
        }}>
          <View style={{ width:"57%"}}>
              <View style={Styles.secondRowContainerStyle}>
                  <View style={Styles.singleItemStyle}>
                      <Text style={{fontSize:normalize(13), fontFamily: getFontsName('IRANSansMobile_Light')}}>{Item.Name}</Text>
                      <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>نام صاحب پرونده: </Text>
                  </View>
              </View>
              <View style={Styles.secondRowContainerStyle}>
                  <View style={Styles.singleItemStyle}>
                      <Text style={{color: '#000', fontSize:normalize(13), fontFamily: getFontsName('IRANSansMobile_Light')}}>
                          {toFaDigit(Item.PhoneNumber)}
                      </Text>
                      <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium'), color: '#000'}}>
                          تلفن صاحب پرونده:{' '}
                      </Text>
                  </View>
              </View>
          </View>
        <View style={{width:'43%'}}>
            <View style={Styles.secondRowContainerStyle}>
              <View style={Styles.singleItemStyle}>
                <Text style={{fontSize:normalize(13), fontFamily: getFontsName('IRANSansMobile_Light')}}>{toFaDigit(Item.projectID)}</Text>
                <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>پرونده: </Text>
              </View>
            </View>
            <View style={Styles.secondRowContainerStyle}>
              <View style={Styles.singleItemStyle}>
                <Text style={{color: '#CB3434', fontSize:normalize(13), fontFamily: getFontsName('IRANSansMobile_Light')}}>
                  {Item.remaind === 0
                    ? `${toFaDigit(0)} ریال` : Math.abs(Item.remaind) === Item.remaind ?
                     ` ${toFaDigit(Item.remaind.toString())}  ریال` : ` ${toFaDigit(Item.remaind.toString().substr(1,Item.remaind.length))}-  ریال`}
                </Text>
                <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium'), color: '#CB3434'}}>
                  مانده:{' '}
                </Text>
              </View>
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
