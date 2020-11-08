import React, {useState, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  ToastAndroid,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import Header from '../../common/Header';
import {updateService, unsettledServiceDetail} from '../../../actions/api';
import {useSelector, useDispatch} from 'react-redux';
import {API_KEY, LOGOUT} from '../../../actions/types';
import {toFaDigit} from '../../utils/utilities';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from "../../common/ImageViwer";
import {BoxShadow} from 'react-native-shadow';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Foundation from 'react-native-vector-icons/Foundation';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceArchiveDetail = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [detailLoading, setDetailLoading] = useState(true);
  const [serviceDetail, setServiceDetail] = useState([]);
  const [factorImage, setFactorImage] = useState('');
  const [image, setImage] = useState('');
  const [deletingImage, setDeletingImage] = useState(0);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [isMapModeOn, setIsMapModeOn] = useState(false);
  const [selectedLatitude, setSelectedLatitude] = useState(null);
  const [selectedLongitude, setSelectedLongitude] = useState(null);
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [confrimRequestLoading, setConfrimRequestLoading] = useState(false);
  const SERVICE = navigation.getParam('service');

  const shadowOpt = {
    width: pageWidth * 0.9,
    height: pageHeight * 0.65,
    color: '#000',
    radius: 1,
    opacity: 0.1,
    x: 6,
    y: 6,
    style: {justifyContent: 'center', alignItems: 'center', marginBottom: 10},
  };

  const shadowOpt2 = {
    width: pageWidth * 0.9,
    height:
      !!image && !!factorImage
        ? pageHeight * 1.6
        : (!!image && !factorImage) || (!image && !!factorImage)
        ? pageHeight * 1.12
        : pageHeight * 0.67,
    color: '#000',
    radius: 1,
    opacity: 0.1,
    x: 6,
    y: 6,
    style: {justifyContent: 'center', alignItems: 'center', marginBottom: 10},
  };

  const shadowOpt3 = {
    width: pageWidth * 0.2,
    height: 35,
    color: '#000',
    radius: 7,
    opacity: 0.2,
    x: 0,
    y: 3,
    style: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: pageHeight * 0.03,
    },
  };

  const getServiceResult = resultNum => {
    switch (resultNum) {
      case 1:
        return 'موفق';
      case 2:
        return 'موفق مشکوک';
      case 3:
        return 'سرویس جدید - کسری قطعات';
      case 4:
        return 'سرویس جدید - آماده نبودن پروژه';
      case 5:
        return 'سرویس جدید - عدم تسلط';
      case 6:
        return 'لغو موفق';
      default:
        return '';
    }
  };

  const getServiceType = typeNum => {
    switch (typeNum) {
      case 1:
        return 'خرابی یا تعویض موقت';
      case 2:
        return 'ایراد نصب و تنظیم روتین';
      case 3:
        return 'تنظیم و عیب غیر روتین';
      default:
        return '';
    }
  };

  const updateServiceDetail = () => {
    setConfrimRequestLoading(true);
    updateService(
      SERVICE.projectID,
      selector.userId,
      selector.token,
      address,
      description,
      factorImage,
      image,
    ).then(data => {
      if (data.errorCode === 0) {
        navigation.navigate('ServiceArchiveList');
        ToastAndroid.showWithGravity(
          'سرویس با موفقیت ویرایش شد.',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        setConfrimRequestLoading(false);
      } else if (data.errorCode === 3) {
        setConfrimRequestLoading(false);
        dispatch({
          type: LOGOUT,
        });
        navigation.navigate('SignedOut');
      } else {
        setConfrimRequestLoading(false);
        ToastAndroid.showWithGravity(
          data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    });
  };

  useEffect(() => {
    unsettledServiceDetail(SERVICE.projectID, selector.token).then(data => {
      if (data.errorCode === 0) {
        setServiceDetail(data.result);
        setAddress(data.result.DocumentDetails.Address);
        setFactorImage(data.result.FactorImage);
        setDetailLoading(false);
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        setDetailLoading(false);
        navigation.navigate('SignedOut');
      } else {
        setServiceDetail({});
        ToastAndroid.showWithGravity(
          data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        setDetailLoading(false);
      }
    });
  }, []);

  const renderSingleItem = (title, titleColor, text) => {
    return (
      <View style={Styles.singleItemContainerstyle}>
        <Text>{text}</Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 10,
            color: titleColor,
          }}>
          {title}
        </Text>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {isMapModeOn ? (
        <View style={{flex: 1}}>
          <MapboxGL.MapView
            style={{flex: 1}}
            onPress={feature => {
              setSelectedLatitude(feature.geometry.coordinates[1]);
              setSelectedLongitude(feature.geometry.coordinates[0]);
            }}>
            <MapboxGL.UserLocation
              onUpdate={location => {
                setUserLatitude(location.coords.latitude);
                setUserLongitude(location.coords.longitude);
              }}
            />
            {!!userLatitude && !!userLongitude && (
              <MapboxGL.Camera
                centerCoordinate={[userLongitude, userLatitude]}
                zoomLevel={12}
              />
            )}
            {!!selectedLatitude && !!selectedLongitude && (
              <View>
                <MapboxGL.MarkerView
                  id={'1'}
                  coordinate={[selectedLongitude, selectedLatitude]}>
                  <View>
                    <View
                      style={{
                        alignItems: 'center',
                        width: 100,
                        backgroundColor: 'transparent',
                        height: 100,
                      }}>
                      <Foundation name="marker" color="red" size={45} />
                    </View>
                  </View>
                </MapboxGL.MarkerView>
              </View>
            )}
          </MapboxGL.MapView>
          <View style={Styles.bottomBoxContainerStyle}>
            {!!selectedLatitude && !!selectedLongitude ? (
              <TouchableOpacity
                style={Styles.confirmButtonStyle}
                onPress={() => {
                  fetch(
                    `https://map.ir/reverse?lat=${selectedLatitude}&lon=${selectedLongitude}`,
                    {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                      },
                    },
                  )
                    .then(response => response.json())
                    .then(data => {
                      setAddress(data.address);
                    });
                  setIsMapModeOn(false);
                }}>
                <Text style={Styles.mapButtonTextStyle}>تایید</Text>
              </TouchableOpacity>
            ) : (
              <View style={Styles.selectTextContainerStyle}>
                <Text style={Styles.selectTextStyle}>موقعیت را مشخص کنید.</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{flex: 1}}>
          <Header headerText={'ویرایش سرویس'} />
          <ScrollView
            style={{flex: 1}}
            contentContainerstyle={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {detailLoading ? (
              <View
                style={{
                  width: pageWidth,
                  height: pageHeight * 0.7,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size={'large'} color={'#000'} />
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  padding: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {!!serviceDetail.DoneDetails &&
                  !!serviceDetail.DoneDetails.projectID && (
                    <View>
                      <BoxShadow setting={shadowOpt}>
                        <View style={Styles.contentContainerStyle}>
                          <Text
                            style={[
                              {...Styles.itemLabelStyle, marginBottom: 10},
                            ]}>
                            * مرکز خدمات داتیس *
                          </Text>
                          {renderSingleItem(
                            'شماره پرونده:',
                            '#000',
                            toFaDigit(serviceDetail.DoneDetails.projectID),
                          )}
                          {renderSingleItem(
                            'آدرس:',
                            '#000',
                            serviceDetail.DocumentDetails.Address,
                          )}
                          {renderSingleItem(
                            'نام و تلفن:',
                            '#000',
                            `${
                              serviceDetail.DocumentDetails.PhoneName
                            } ${toFaDigit(
                              serviceDetail.DocumentDetails.Phone,
                            )}`,
                          )}
                          {renderSingleItem(
                            'علت خرابی:',
                            '#000',
                            serviceDetail.DocumentDetails.DetectedFailure,
                          )}
                          {renderSingleItem(
                            'سریال:',
                            '#000',
                            serviceDetail.DocumentDetails.Serial,
                          )}
                          {renderSingleItem(
                            'گارانتی برد:',
                            '#000',
                            serviceDetail.DocumentDetails.WarS,
                          )}
                          {renderSingleItem(
                            'تاریخ تولید:',
                            '#000',
                            toFaDigit(serviceDetail.DocumentDetails.DOM),
                          )}
                          {renderSingleItem(
                            'زمان اعلام:',
                            '#000',
                            toFaDigit(serviceDetail.DocumentDetails.Date),
                          )}
                          <View style={{width: '100%'}}>
                            <Text>
                              {toFaDigit(
                                serviceDetail.DocumentDetails.Msg.substr(
                                  serviceDetail.DocumentDetails.Msg.length - 12,
                                  12,
                                ),
                              )}
                            </Text>
                          </View>
                          {renderSingleItem(
                            'مبلغ دریافتی:',
                            '#CB3434',
                            toFaDigit(serviceDetail.DoneDetails.RecivedAmount),
                          )}
                          {renderSingleItem(
                            'جمع فاکتور:',
                            '#CB3434',
                            toFaDigit(serviceDetail.DoneDetails.InvoiceAmount),
                          )}
                          {renderSingleItem(
                            'نوع سرویس:',
                            '#CB3434',
                            getServiceType(
                              serviceDetail.DoneDetails.ServiceType,
                            ),
                          )}
                          {renderSingleItem(
                            'نتیجه سرویس:',
                            '#CB3434',
                            getServiceResult(serviceDetail.DoneDetails.Result),
                          )}
                        </View>
                      </BoxShadow>
                      <BoxShadow setting={shadowOpt2}>
                        <View style={Styles.contentContainerStyle}>
                          <View style={Styles.descriptionRowStyle}>
                            <Text style={{width: 60, marginBottom: 10}}>
                              توضیحات:
                            </Text>
                            <TextInput
                              multiline
                              style={Styles.descriptionInputStyle}
                              onChangeText={value => setDescription(value)}
                              value={description}
                            />
                          </View>
                          <View style={Styles.descriptionRowStyle}>
                            <View style={Styles.addressTitleContainerStyle}>
                              <Icon
                                name={'location-searching'}
                                style={{color: '#000', fontSize: 20}}
                                onPress={() => {
                                  setSelectedLatitude(null);
                                  setSelectedLongitude(null);
                                  setIsMapModeOn(true);
                                }}
                              />
                              <Text style={{width: 60, marginBottom: 10}}>
                                آدرس:
                              </Text>
                            </View>
                            <TextInput
                              multiline
                              style={Styles.addressInputStyle}
                              onChangeText={value => setAddress(value)}
                              value={address}
                            />
                          </View>
                          <View style={Styles.imageRowStyle}>
                            <View style={Styles.getImageContainerViewStyle}>
                              <Icon
                                name={'camera-alt'}
                                style={{color: '#000', fontSize: 35}}
                                onPress={() => {
                                  ImagePicker.openCamera({
                                    width: pageWidth - 20,
                                    height: pageHeight * 0.4,
                                    includeBase64: true,
                                    compressImageQuality: 0.7,
                                  }).then(response => {
                                    setFactorImage(response.data);
                                  });
                                }}
                              />
                              <Icon
                                name={'file-upload'}
                                style={{color: '#000', fontSize: 35}}
                                onPress={() => {
                                  ImagePicker.openPicker({
                                    width: pageWidth - 20,
                                    height: pageHeight * 0.4,
                                    includeBase64: true,
                                    compressImageQuality: 0.7,
                                  }).then(response => {
                                    setFactorImage(response.data);
                                  });
                                }}
                              />
                            </View>
                            <View style={{width: 70}}>
                              <Text style={Styles.labelStyle}>عکس فاکتور:</Text>
                            </View>
                          </View>
                          {!!factorImage && (
                            <ImageViewer
                              width={pageWidth*0.9 - 20}
                              height={pageHeight * 0.4}
                              imageUrl={`data:image/jpeg;base64,${factorImage}`}
                            />
                          )}
                          <View style={Styles.imageRowStyle}>
                            <View style={Styles.getImageContainerViewStyle}>
                              <Icon
                                name={'camera-alt'}
                                style={{color: '#000', fontSize: 35}}
                                onPress={() => {
                                  ImagePicker.openCamera({
                                    width: pageWidth - 20,
                                    height: pageHeight * 0.4,
                                    includeBase64: true,
                                    compressImageQuality: 0.7,
                                  }).then(response => {
                                    setImage(response.data);
                                  });
                                }}
                              />
                              <Icon
                                name={'file-upload'}
                                style={{color: '#000', fontSize: 35}}
                                onPress={() =>
                                  ImagePicker.openPicker({
                                    width: pageWidth - 20,
                                    height: pageHeight * 0.4,
                                    includeBase64: true,
                                    compressImageQuality: 0.7,
                                  }).then(response => {
                                    setImage(response.data);
                                  })
                                }
                              />
                              {!!image && (
                                <Icon
                                  name={'delete'}
                                  style={{color: '#000', fontSize: 30}}
                                  onPress={() => {
                                    setDeletingImage(2);
                                  }}
                                />
                              )}
                            </View>
                            <View style={{width: 100}}>
                              <Text style={Styles.labelStyle}>عکس:</Text>
                            </View>
                          </View>
                          {!!image && (
                            <ImageViewer
                              width={pageWidth*0.9 - 20}
                              height={pageHeight * 0.4}
                              imageUrl={`data:image/jpeg;base64,${image}`}
                            />
                          )}
                        </View>
                      </BoxShadow>
                    </View>
                  )}
              </View>
            )}
          </ScrollView>
          {confrimRequestLoading ? (
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                height: pageHeight * 0.1,
              }}>
              <ActivityIndicator size={'small'} color={'#660000'} />
            </View>
          ) : (
            <View style={Styles.footerButtonsContainerstyle}>
              <TouchableOpacity
                style={Styles.buttonStyle}
                onPress={() => {
                  setImage('');
                  setFactorImage('');
                  setAddress('');
                  setDescription('');
                  navigation.goBack();
                }}>
                <Text style={Styles.buttonTextStyle}>بازگشت</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.buttonStyle}
                onPress={() => {
                  updateServiceDetail();
                }}>
                <Text style={Styles.buttonTextStyle}>تایید</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {!!deletingImage && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setDeletingImage(0)}>
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                آیا از پاک کردن عکس اطمینان دارید؟
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <BoxShadow setting={shadowOpt3}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    setDeletingImage(0);
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>خیر</Text>
                </TouchableOpacity>
              </BoxShadow>
              <BoxShadow setting={shadowOpt3}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    if (deletingImage === 1) {
                      setFactorImage('');
                    } else if (deletingImage === 2) {
                      setImage('');
                    }
                    setDeletingImage(0);
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>بله</Text>
                </TouchableOpacity>
              </BoxShadow>
            </View>
          </View>
        </TouchableHighlight>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  contentContainerStyle: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
  },
  singleItemContainerstyle: {
    width: '90%',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemLabelStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemLabelStyle2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#CB3434',
  },
  footerButtonsContainerstyle: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: pageHeight * 0.1,
    paddingHorizontal: 20,
  },
  buttonStyle: {
    width: '20%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#660000',
  },
  buttonTextStyle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageIconContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    height: pageHeight * 0.09,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackgroundStyle: {
    flex: 1,
    width: pageWidth,
    height: pageHeight,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalContainerStyle: {
    position: 'absolute',
    width: pageWidth * 0.85,
    height: pageHeight * 0.3,
    backgroundColor: '#E8E8E8',
    marginBottom: pageHeight * 0.25,
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBodyContainerStyle2: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'flex-end',
  },
  modalBodyContainerStyle: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalBodyTextStyle: {
    color: '#660000',
    textAlign: 'center',
    fontSize: 17,
  },
  modalFooterContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    height: '30%',
    justifyContent: 'space-around',
  },
  modalButtonStyle: {
    backgroundColor: '#fff',
    width: '97%',
    height: '97%',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonTextStyle: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    height: pageHeight * 0.08,
  },
  descriptionRowStyle: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  addressInputStyle: {
    width: '100%',
    height: pageHeight * 0.13,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    padding: 15,
  },
  addressTitleContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  descriptionInputStyle: {
    width: '100%',
    height: pageHeight * 0.15,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    padding: 15,
  },

  imageRowStyle: {
    flexDirection: 'row',
    width: pageWidth * 0.8,
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  getImageContainerViewStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: pageWidth * 0.3,
    height: '100%',
  },
  bottomBoxContainerStyle: {
    position: 'absolute',
    width: pageWidth * 0.8,
    height: 70,
    opacity: 0.8,
    backgroundColor: '#fff',
    borderRadius: 10,
    bottom: 10,
    left: pageWidth * 0.1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonStyle: {
    width: pageWidth * 0.7,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  mapButtonTextStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectTextContainerStyle: {
    width: pageWidth * 0.7,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
    opacity: 1,
  },
  selectTextStyle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ServiceArchiveDetail;
