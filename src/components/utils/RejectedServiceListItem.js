import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import Toast from "react-native-simple-toast";
import {useDispatch, useSelector} from 'react-redux';
import {toFaDigit, normalize, getFontsName} from './utilities';
import AsyncStorage from '@react-native-community/async-storage';
import {LOGOUT, RESTORE_SERVICE_DATA} from '../../actions/types';
import {rejectedServiceDetail} from '../../actions/api';

const pageWidth = Dimensions.get('screen').width;

const RejectedServiceListItem = ({
  item,
  navigation,
  setModalState,
  setSelectedProjectId,
  renderLoading,
}) => {
  const Item = item.item;
  const dispatch = useDispatch();
  const selector = useSelector(state => state);

  return (
    <TouchableWithoutFeedback
      onPress={async () => {
        await AsyncStorage.getItem('savedServicesList').then(list => {
          if (!!list) {
            let flag = false;
            JSON.parse(list).map(item => {
              if (item.projectId === Item.projectID) {
                setModalState(true);
                setSelectedProjectId(Item.projectID);
                flag = true;
              }
            });
            if (!flag) {
              renderLoading(true);
              rejectedServiceDetail(Item.projectID, selector.token)
                .then(data => {
                  if (data.errorCode === 0) {
                    dispatch({
                      type: RESTORE_SERVICE_DATA,
                      savedServiceInfo: {
                        projectId: Item.projectID,
                        factorReceivedPrice: parseInt(data.result.RecivedAmount),
                        factorTotalPrice: parseInt(data.result.InvoiceAmount),
                        toCompanySettlement: parseInt(data.result.ToCompanySettlement),
                        serviceDescription: data.result.Details,
                        address: data.result.Location,
                        finalDate: data.result.DoneTime,
                        serviceResult: data.result.Result,
                        serviceType: data.result.ServiceType,
                        objectList: data.result.ObjectList,
                        startLatitude: !!data.result.Mission && !!data.result.Mission.StartLocation
                          ? parseFloat(
                              data.result.Mission.StartLocation.substr(
                                0,
                                data.result.Mission.StartLocation.indexOf(','),
                              ),
                            )
                          : '',
                        startLongitude: !!data.result.Mission && !!data.result.Mission.StartLocation
                          ? parseFloat(
                              data.result.Mission.StartLocation.substr(
                                data.result.Mission.StartLocation.indexOf(',') +
                                  1,
                                data.result.Mission.StartLocation.length,
                              ),
                            )
                          : '',
                        endLatitude: !!data.result.Mission && !!data.result.Mission.EndLocation
                          ? parseFloat(
                              data.result.Mission.EndLocation.substr(
                                0,
                                data.result.Mission.EndLocation.indexOf(','),
                              ),
                            )
                          : '',
                        endLongitude: !!data.result.Mission && !!data.result.Mission.EndLocation
                          ? parseFloat(
                              data.result.Mission.EndLocation.substr(
                                data.result.Mission.EndLocation.indexOf(',') +
                                  1,
                                data.result.Mission.EndLocation.length,
                              ),
                            )
                          : '',
                        startCity: !!data.result.Mission
                          ? data.result.Mission.StartCity
                          : '',
                        endCity: !!data.result.Mission
                          ? data.result.Mission.EndCity
                          : '',
                        missionDescription: !!data.result.Mission
                          ? data.result.Mission.Description
                          : '',
                        missionId: !!data.result.Mission
                          ? data.result.Mission.ID
                          : 0,
                        distance: !!data.result.Mission
                          ? data.result.Mission.Distance
                          : '0',
                        savedType: '',
                        travel: !!data.result.Mission
                          ? data.result.Mission.Travel
                          : false,
                      },
                    });
                    renderLoading(false);
                    navigation.replace('RejectedServiceDetail', {
                      serviceID: Item.projectID,
                      service: {
                        projectID: data.result.projectID,
                        DocText: {
                          PhoneName: data.result.DocText.PhoneName,
                          Phone: data.result.DocText.Phone,
                          Serial: data.result.DocText.Serial,
                          WarS: data.result.DocText.WarS,
                          DOM: data.result.DocText.DOM,
                          Address: data.result.DocText.Address,
                          DetectedFailure: data.result.DocText.DetectedFailure,
                          parts: data.result.DocText.parts,
                          Date: data.result.DocText.Date,
                        },
                        factorImage: data.result.FactorImage,
                        image: data.result.Image,
                        billImage: data.result.BillImage,
                      },
                    });
                  } else if (data.errorCode === 3) {
                    renderLoading(false);
                    dispatch({
                      type: LOGOUT,
                    });
                    navigation.navigate('SignedOut');
                  } else {
                    renderLoading(false);
                    Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                  }
                })
                .catch((err) => {
                  renderLoading(false);
                  setModalState(false);
                  Alert.alert(
                    'اخطار',
                    'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                    [{text: 'OK', onPress: () => {}}],
                  );
                });
            }
          } else {
            renderLoading(true);
            rejectedServiceDetail(Item.projectID, selector.token)
              .then(data => {
                if (data.errorCode === 0) {
                  dispatch({
                    type: RESTORE_SERVICE_DATA,
                    savedServiceInfo: {
                      projectId: Item.projectID,
                      factorReceivedPrice:parseInt(data.result.RecivedAmount),
                      factorTotalPrice: parseInt(data.result.InvoiceAmount),
                      toCompanySettlement: parseInt(data.result.ToCompanySettlement),
                      serviceDescription: data.result.Details,
                      address: data.result.Location,
                      finalDate: data.result.DoneTime,
                      serviceResult: data.result.Result,
                      serviceType: data.result.ServiceType,
                      objectList: data.result.ObjectList,
                      startLatitude: !!data.result.Mission && !!data.result.Mission.StartLocation
                        ? parseFloat(
                            data.result.Mission.StartLocation.substr(
                              0,
                              data.result.Mission.StartLocation.indexOf(','),
                            ),
                          )
                        : '',
                      startLongitude: !!data.result.Mission && !!data.result.Mission.StartLocation
                        ? parseFloat(
                            data.result.Mission.StartLocation.substr(
                              data.result.Mission.StartLocation.indexOf(',') +
                                1,
                              data.result.Mission.StartLocation.length,
                            ),
                          )
                        : '',
                      endLatitude: !!data.result.Mission && !!data.result.Mission.EndLocation
                        ? parseFloat(
                            data.result.Mission.EndLocation.substr(
                              0,
                              data.result.Mission.EndLocation.indexOf(','),
                            ),
                          )
                        : '',
                      endLongitude: !!data.result.Mission && !!data.result.Mission.EndLocation
                        ? parseFloat(
                            data.result.Mission.EndLocation.substr(
                              data.result.Mission.EndLocation.indexOf(',') + 1,
                              data.result.Mission.EndLocation.length,
                            ),
                          )
                        : '',
                      startCity: !!data.result.Mission
                        ? data.result.Mission.StartCity
                        : '',
                      endCity: !!data.result.Mission
                        ? data.result.Mission.EndCity
                        : '',
                      missionDescription: !!data.result.Mission
                        ? data.result.Mission.Description
                        : '',
                      missionId: !!data.result.Mission
                        ? data.result.Mission.ID
                        : 0,
                      distance: !!data.result.Mission
                        ? data.result.Mission.Distance
                        : '',
                      savedType: '',
                      travel: !!data.result.Mission
                        ? data.result.Mission.Travel
                        : false,
                    },
                  });
                  renderLoading(false);
                  navigation.replace('RejectedServiceDetail', {
                    serviceID: Item.projectID,
                    service: {
                      projectID: data.result.projectID,
                      DocText: {
                        PhoneName: data.result.DocText.PhoneName,
                        Phone: data.result.DocText.Phone,
                        Serial: data.result.DocText.Serial,
                        WarS: data.result.DocText.WarS,
                        DOM: data.result.DocText.DOM,
                        Address: data.result.DocText.Address,
                        DetectedFailure: data.result.DocText.DetectedFailure,
                        parts: data.result.DocText.parts,
                        Date: data.result.DocText.Date,
                      },
                      factorImage: data.result.FactorImage,
                      image: data.result.Image,
                      billImage: data.result.BillImage,
                    },
                  });
                } else if (data.errorCode === 3) {
                  dispatch({
                    type: LOGOUT,
                  });
                  navigation.navigate('SignedOut');
                } else {
                  renderLoading(false);
                  Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                }
              })
              .catch(() => {
                setModalState(false);
                renderLoading(false);
                Alert.alert(
                  'اخطار',
                  'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                  [{text: 'OK', onPress: () => {}}],
                );
              });
          }
        });
      }}>
      <View
        style={{
          width: pageWidth * 0.9,
          backgroundColor: '#fff',
          paddingHorizontal: 6,
          paddingVertical: 2,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 3,
          marginVertical: 5,
          marginHorizontal: 3,
        }}>
        <View style={Styles.secondRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={Styles.valueTextStyle}>{toFaDigit(Item.projectID)}</Text>
            <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>پرونده: </Text>
          </View>
          <View style={Styles.singleItemStyle}>
            <Text style={Styles.valueTextStyle}>{toFaDigit(Item.Name)}</Text>
            <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>نام: </Text>
          </View>
        </View>
        <View style={[Styles.firstRowContainerStyle, {marginBottom: 2}]}>
          <View style={Styles.singleItemStyle}>
            <Text style={Styles.valueTextStyle}>{toFaDigit(Item.cell)}</Text>
            <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>همراه: </Text>
          </View>
        </View>
        <View style={Styles.firstRowContainerStyle}>
          <View style={Styles.singleItemStyle}>
            <Text style={Styles.valueTextStyle}>
            {Item.Resone}
            </Text>
            <Text style={{fontSize: normalize(13), fontFamily: getFontsName('IRANSansMobile_Medium')}}>
              دلیل ردشدن پروژه:{' '}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  secondRowContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  singleItemStyle: {
    flexDirection: 'row',
    justifyContent:"center",
    alignItems:"flex-start"
  },
  valueTextStyle: {
    fontSize: normalize(13),
    fontFamily: getFontsName('IRANSansMobile_Light'),
    flexShrink:1,
    textAlign:"right"
  },
});

export default RejectedServiceListItem;
