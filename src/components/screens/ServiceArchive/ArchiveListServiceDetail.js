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
  TouchableHighlight, BackHandler,
} from 'react-native';
import Header from '../../common/Header';
import {updateService, unsettledServiceDetail} from '../../../actions/api';
import {useSelector, useDispatch} from 'react-redux';
import {API_KEY, LOGOUT} from '../../../actions/types';
import {toFaDigit, normalize} from '../../utils/utilities';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from "../../common/ImageViwer";
import MapboxGL from '@react-native-mapbox-gl/maps';
import Foundation from 'react-native-vector-icons/Foundation';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
let cameraRef = {};

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

  useEffect(() => {
    const backAction = () => {
      if (isMapModeOn) {
        setIsMapModeOn(false);
      } else {
        navigation.goBack();
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
    );
    return () => backHandler.remove();
  });

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
        return 'خرابی یا تعویض قطعه';
      case 2:
        return 'ایراد نصب و تنظیم روتین';
      case 3:
        return 'تنظیم و عیب غیرروتین';
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
        setImage(data.result.DoneDetails.Image);
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
        <Text style={{fontSize: normalize(13), fontFamily:"IRANSansMobile_Light", flexShrink:1}}>{text}</Text>
        <Text
          style={{
            fontSize: normalize(13),
            fontFamily:"IRANSansMobile_Medium",
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
            onLongPress={feature => {
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
                  ref={ref=>cameraRef = ref}
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
          <View
              style={Styles.myLocationContainerStye}>
            <Icon
                name={'my-location'}
                style={{fontSize: normalize(30), color: '#000'}}
                onPress={async () => {
                  LocationServicesDialogBox.checkLocationServicesIsEnabled({
                    message:
                        "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
                    ok: 'YES',
                    cancel: 'NO',
                    enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                    showDialog: true, // false => Opens the Location access page directly
                    openLocationServices: true, // false => Directly catch method is called if location services are turned off
                    preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                    preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
                    providerListener: false, // true ==> Trigger locationProviderStatusChange listener when the location state changes
                  })
                      .then(async () => {
                        await cameraRef.moveTo([userLongitude, userLatitude]);
                        await cameraRef.zoomTo(11);
                      })
                      .catch(error => {
                        ToastAndroid.showWithGravity(
                            'موقعیت در دسترس نیست.',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                      });
                }}
            />
          </View>
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
                            <Text style={{fontSize:normalize(13), fontFamily:"IRANSansMobile(FaNum)_Light"}}>
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
                        <View style={Styles.contentContainerStyle2}>
                          <View style={Styles.descriptionRowStyle}>
                            <Text style={{ marginBottom: 10, fontSize:normalize(13), fontFamily:"IRANSansMobile_Light"}}>
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
                                style={{color: '#000', fontSize: normalize(20)}}
                                onPress={() => {
                                  setSelectedLatitude(null);
                                  setSelectedLongitude(null);
                                  setIsMapModeOn(true);
                                }}
                              />
                              <Text style={{marginBottom: 10, fontSize:normalize(13), fontFamily:"IRANSansMobile_Light"}}>
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
                              <Text style={Styles.labelStyle}>عکس فاکتور:</Text>
                          </View>
                          {!!factorImage && (
                            <ImageViewer
                              width={pageWidth*0.9 - 20}
                              height={pageHeight * 0.4}
                              imageUrl={`data:image/jpeg;base64,${factorImage}`}
                            />
                          )}
                          {!!image && (
                              <>
                              <View style={Styles.imageRowStyle}>
                                <Text style={Styles.labelStyle}>عکس:</Text>
                              </View>
                                <ImageViewer
                                    width={pageWidth*0.9 - 20}
                                    height={pageHeight * 0.4}
                                    imageUrl={`data:image/jpeg;base64,${image}`}
                                />
                              </>
                          )}

                        </View>
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
          onPress={() => setDeletingImage(0)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text style={{fontSize: normalize(14), fontFamily:"IRANSansMobile_Medium"}}>
                آیا از پاک کردن عکس اطمینان دارید؟
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    setDeletingImage(0);
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>خیر</Text>
                </TouchableOpacity>
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
    width: pageWidth * 0.9,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
    marginBottom: 10,
    elevation:4
  },
  contentContainerStyle2: {
    backgroundColor: '#fff',
    width: pageWidth * 0.9,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
    marginBottom: 10,
    elevation:4
  },
  singleItemContainerstyle: {
    width: '90%',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemLabelStyle: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemLabelStyle2: {
    fontSize: normalize(14),
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
    fontSize: normalize(14),
    color: '#fff',
    textAlign: 'center',
    fontFamily:"IRANSansMobile_Medium"
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
    fontSize: normalize(17),
  },
  modalFooterContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    height: '30%',
    justifyContent: 'space-around',
  },
  modalButtonStyle: {
    backgroundColor: '#fff',
    width: pageWidth * 0.2,
    height: 35,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: pageHeight * 0.03,
    elevation:5
  },
  modalButtonTextStyle: {
    color: 'gray',
    fontSize: normalize(16),
    fontFamily:"IRANSansMobile_Medium"
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
    paddingHorizontal: 15,
    paddingVertical:5,
    fontSize:normalize(13), 
    fontFamily:"IRANSansMobile_Light"
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
    paddingHorizontal: 15,
    paddingVertical:5,
    fontSize:normalize(13), 
    fontFamily:"IRANSansMobile_Light"
  },

  imageRowStyle: {
    flexDirection: 'row',
    width: pageWidth * 0.8,
    height: 65,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    fontSize: normalize(16),
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
    fontSize: normalize(16),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  labelStyle:{
    fontSize:normalize(13),
    fontFamily:"IRANSansMobile_Light"
  },
  myLocationContainerStye: {
    position: 'absolute',
    top: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 10,
  },
});

export default ServiceArchiveDetail;
