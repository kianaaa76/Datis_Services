import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {toFaDigit, normalize} from './utilities';
import AsyncStorage from '@react-native-community/async-storage';
import {RESTORE_SERVICE_DATA} from '../../actions/types';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MyServiceListItem = ({
  item,
  navigation,
  setModalState,
  setSelectedProjectId,
  setNetworkModalState,
}) => {
  const [isNetworkSaved, setIsNetworkSaved] = useState(false);

  const Item = item.item;
  const dispatch = useDispatch();
  useEffect(() => {
    AsyncStorage.getItem('savedServicesList').then(list => {
      if (!!list) {
        JSON.parse(list).map(item => {
          if (item.projectId === Item.projectID) {
            if (item.saveType === 'network') {
              setIsNetworkSaved(true);
            }
          }
        });
      }
    });
  }, []);
  return (
    <TouchableWithoutFeedback
      style={{
        width: '100%',
        height: '100%',
      }}
      onPress={async () => {
        await AsyncStorage.getItem('savedServicesList').then(list => {
          if (!!list) {
            let flag = false;
            JSON.parse(list).map(item => {
              if (item.projectId === Item.projectID) {
                if (item.saveType === 'self') {
                  setModalState(true);
                } else {
                  setNetworkModalState(true);
                }
                setSelectedProjectId(Item.projectID);
                flag = true;
              }
            });
            if (!flag) {
              dispatch({
                type: RESTORE_SERVICE_DATA,
                savedServiceInfo: {
                  projectId: '',
                  factorReceivedPrice: '',
                  factorTotalPrice: '',
                  serviceDescription: '',
                  address: '',
                  finalDate: '',
                  serviceResult: '',
                  serviceType: '',
                  objectList: [],
                  startLatitude: '',
                  startLongitude: '',
                  endLatitude: '',
                  endLongitude: '',
                  startCity: '',
                  endCity: '',
                  missionDescription: '',
                  distance: '',
                  saveType: '',
                  travel: false,
                },
              });
              navigation.replace('MyServiceDetails', {
                serviceID: Item.projectID,
              });
            }
          } else {
            dispatch({
              type: RESTORE_SERVICE_DATA,
              savedServiceInfo: {
                projectId: '',
                factorReceivedPrice: '',
                factorTotalPrice: '',
                serviceDescription: '',
                address: '',
                finalDate: '',
                serviceResult: '',
                serviceType: '',
                objectList: [],
                startLatitude: '',
                startLongitude: '',
                endLatitude: '',
                endLongitude: '',
                startCity: '',
                endCity: '',
                missionDescription: '',
                distance: '',
                saveType: '',
                travel: false,
              },
            });
            navigation.replace('MyServiceDetails', {serviceID: Item.projectID});
          }
        });
      }}>
      <View
        style={{
          width: pageWidth * 0.9,
          height: pageHeight * 0.1,
          backgroundColor: isNetworkSaved ? '#3399FF' : '#fff',
          padding: 10,
          marginVertical: 5,
          marginHorizontal: 5,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
        }}>
        {isNetworkSaved ? (
          <View style={Styles.secondRowContainerStyle}>
            <Text style={{fontSize: normalize(12), fontFamily: 'IRANSansMobile_Light'}}>
              درحال ارسال
            </Text>
            <View style={Styles.singleItemStyle}>
              <Text style={Styles.valueTextStyle}>{toFaDigit(Item.Name)}</Text>
              <Text style={{fontSize: normalize(13), fontFamily: 'IRANSansMobile_Medium'}}>
                نام:{' '}
              </Text>
            </View>
          </View>
        ) : (
          <View style={Styles.firstRowContainerStyle}>
            <View style={Styles.singleItemStyle}>
              <Text style={Styles.valueTextStyle}>{toFaDigit(Item.Name)}</Text>
              <Text style={{fontSize: normalize(13), fontFamily: 'IRANSansMobile_Medium'}}>
                نام:{' '}
              </Text>
            </View>
          </View>
        )}
        <View style={Styles.secondRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={Styles.valueTextStyle}>
              {toFaDigit(Item.projectID)}
            </Text>
            <Text style={{fontSize: normalize(13), fontFamily: 'IRANSansMobile_Medium'}}>
              شماره‌ ‌پرونده:{' '}
            </Text>
          </View>
          <View style={Styles.singleItemStyle}>
            <Text style={[Styles.valueTextStyle,{textAlign: 'center'}]}>{toFaDigit(Item.cell)}</Text>
            <Text
              style={{
                fontSize: normalize(13),
                fontFamily: 'IRANSansMobile_Medium',
                textAlign: 'center',
              }}>
              همراه:{' '}
            </Text>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  secondRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singleItemStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueTextStyle: {
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
  },
});

export default MyServiceListItem;
