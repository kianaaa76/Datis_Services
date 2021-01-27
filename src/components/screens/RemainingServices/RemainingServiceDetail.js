import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  BackHandler,
} from 'react-native';
import Toast from "react-native-simple-toast";
import Header from '../../common/Header';
import {
  companyPayment,
  personalPayment,
  unsettledServiceDetail,
} from '../../../actions/api';
import {useSelector, useDispatch} from 'react-redux';
import {LOGOUT} from '../../../actions/types';
import {toFaDigit, normalize, getFontsName} from '../../utils/utilities';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from '../../common/ImageViwer';
import {CameraIcon, DeleteIcon, UploadFileIcon} from "../../../assets/icons";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RemainingServiceDetail = ({navigation}) => {
  const scrollViewRef = useRef();
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [detailLoading, setDetailLoading] = useState(true);
  const [serviceDetail, setServiceDetail] = useState([]);
  const [factorImage, setFactorImage] = useState('');
  const [deletingImage, setDeletingImage] = useState(0);
  const [renderConfirmModal, setRenderConfirmModal] = useState(false);
  const [equalizationType, setEqualizationType] = useState('');
  const [equalizationLoading, setEqualizationLoading] = useState(false);
  const [renderToastModal, setRenderToastModal] = useState(false);
  const SERVICE = navigation.getParam('service');

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  useEffect(() => {
    unsettledServiceDetail(SERVICE.projectID, selector.token).then(data => {
      if (data.errorCode === 0) {
        setServiceDetail(data.result);
        setDetailLoading(false);
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        setDetailLoading(false);
        navigation.navigate('SignedOut');
      } else {
        setServiceDetail({});
        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
        setDetailLoading(false);
      }
    });
  }, []);

  const personalFullPayment = () => {
    setEqualizationLoading(true);
    setRenderConfirmModal(false);
    personalPayment(serviceDetail.DoneDetails.projectID, selector.token).then(
      data => {
        if (data.errorCode === 0) {
          setRenderToastModal(true);
          setEqualizationLoading(false);
          navigation.gotBack();
        } else if (data.errorCode === 3) {
          dispatch({
            type: LOGOUT,
          });
          navigation.navigate('SignedOut');
          setEqualizationLoading(false);
        } else {
          Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
          setRenderConfirmModal(false);
          setEqualizationLoading(false);
        }
      },
    );
  };

  const companyFullPayment = () => {
    setEqualizationLoading(true);
    setRenderConfirmModal(false);
    companyPayment(
      serviceDetail.DoneDetails.projectID,
      selector.userId,
      factorImage,
      selector.token,
    ).then(data => {
      if (data.errorCode === 0) {
        setRenderToastModal(true);
        setEqualizationLoading(false);
        navigation.gotBack();
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        navigation.navigate('SignedOut');
        setEqualizationLoading(false);
      } else {
        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
        setRenderConfirmModal(false);
        setEqualizationLoading(false);
      }
    });
  };

  const onConfirmEqualizationPress = () => {
    if (equalizationType === 'personal') {
      personalFullPayment();
    } else {
      companyFullPayment();
    }
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
        return 'خرابی یا تعویض قطعه';
      case 2:
        return 'ایراد نصب و تنظیم روتین';
      case 3:
        return 'تنظیم و عیب غیرروتین';
      default:
        return '';
    }
  };

  const renderSingleItem = (title, titleColor, text) => {
    return (
      <View style={Styles.singleItemContainerstyle}>
        <Text
          style={{
            fontFamily: getFontsName('IRANSansMobile_Light'),
            fontSize: normalize(13),
            flexShrink: 1,
          }}>
          {text}
        </Text>
        <Text
          style={{
            fontSize: normalize(12),
            fontFamily: getFontsName('IRANSansMobile_Medium'),
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
      <ScrollView
        style={{flex: 1}}
        contentContainerstyle={{justifyContent: 'center', alignItems: 'center'}}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current.scrollToEnd({animated: true})
        }
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag">
        <Header headerText={'جزئیات'} isCurrentRootHome={false} onBackPress={()=>navigation.goBack()}/>
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
              paddingVertical: 10,
              // paddingHorizontal: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {!!serviceDetail.DoneDetails &&
              !!serviceDetail.DoneDetails.projectID && (
                <View style={Styles.contentContainerStyle}>
                  <Text style={[{...Styles.itemLabelStyle, marginBottom: 10}]}>
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
                    'نام صاحب پرونده:',
                    '#000',
                    `${serviceDetail.DocumentDetails.PhoneName}`,
                  )}
                  {renderSingleItem(
                      'تلفن صاحب پرونده:',
                      '#000',
                      `${toFaDigit(
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
                    <Text
                      style={{
                        fontFamily: getFontsName('IRANSansMobile_Light'),
                        fontSize: normalize(13),
                      }}>
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
                    getServiceType(serviceDetail.DoneDetails.ServiceType),
                  )}
                  {renderSingleItem(
                    'نتیجه سرویس:',
                    '#CB3434',
                    getServiceResult(serviceDetail.DoneDetails.Result),
                  )}
                </View>
              )}
            {equalizationLoading ? (
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
                    if (!!factorImage) {
                      setEqualizationType('company');
                      setRenderConfirmModal(true);
                    } else {
                      Toast.showWithGravity('لطفا تصویر فاکتور واریزی را بارگذاری نمایید. ', Toast.LONG, Toast.CENTER);
                    }
                  }}>
                  <Text style={Styles.buttonTextStyle}>تسویه به حساب شرکت</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={Styles.buttonStyle}
                  onPress={() => {
                    setEqualizationType('personal');
                    setRenderConfirmModal(true);
                  }}>
                  <Text style={Styles.buttonTextStyle}>تسویه به حساب شخصی</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={Styles.imageIconContainerStyle}>
              {CameraIcon({
                onPress:() =>
                ImagePicker.openCamera({
                width: pageWidth - 20,
                height: pageHeight * 0.7,
                includeBase64: true,
                compressImageQuality: 0.7,
              }).then(response => {
                setFactorImage(response.data);
              }),
              })}
              {UploadFileIcon({
                onPress:() =>
                ImagePicker.openPicker({
                width: pageWidth - 20,
                height: pageHeight * 0.7,
                includeBase64: true,
                compressImageQuality: 0.7,
              }).then(response => {
                setFactorImage(response.data);
              }),
                color:"#000",
                height:30,
                width:30
              })}
              {!!factorImage && DeleteIcon({
                onPress:() => {
                setDeletingImage(1);
              },
                color:"#000"
              })
              }
            </View>
            {!!factorImage && (
              <ImageViewer
                width={pageWidth - 30}
                height={pageHeight * 0.7}
                imageUrl={`data:image/jpeg;base64,${factorImage}`}
              />
            )}
          </View>
        )}
      </ScrollView>
      {renderConfirmModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderConfirmModal(false)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalHeaderContainerStyle}>
              <Text style={Styles.modalHeaderTextStyle}>داتیس سرویس</Text>
            </View>
            <View style={Styles.modalBodyContainerStyle}>
              <Text style={Styles.modalBodyTextStyle}>
                برای انجام تسویه حساب گزینه ی تایید را انتخاب نمایید.
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => setRenderConfirmModal(false)}>
                <Text style={Styles.modalButtonTextStyle}>بازگشت</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => onConfirmEqualizationPress()}>
                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {renderToastModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderConfirmModal(false)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle}>
              <Text style={{marginBottom: 10}}>با تشکر</Text>
              <Text>سرویس مورد نظر به طور کامل تسویه گردید.</Text>
              <Text>
                {`شماره پیگیری: ${serviceDetail.DoneDetails.projectID}`}
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle2}
                onPress={() => {
                  setRenderToastModal(false);
                  navigation.replace('RemainingServices');
                }}>
                <Text style={Styles.modalButtonTextStyle}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {!!deletingImage && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setDeletingImage(0)}
          underlayColor="none">
          <View
            style={[Styles.modalContainerStyle, {height: pageHeight * 0.28}]}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text style={{fontSize: normalize(15), fontWeight: 'bold'}}>
                آیا از پاک کردن عکس اطمینان دارید؟
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle2}
                onPress={() => {
                  setDeletingImage(0);
                }}>
                <Text style={Styles.modalButtonTextStyle}>خیر</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.modalButtonStyle2}
                onPress={() => {
                  if (deletingImage === 1) {
                    setFactorImage('');
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
    width: '93%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 10,
  },
  singleItemContainerstyle: {
    width: '100%',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  itemLabelStyle: {
    fontSize: normalize(14),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    marginLeft: 10,
  },
  itemLabelStyle2: {
    fontSize: normalize(14),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    marginLeft: 10,
    color: '#CB3434',
  },
  footerButtonsContainerstyle: {
    flexDirection: 'row',
    width: '93%',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: pageHeight * 0.1,
  },
  buttonStyle: {
    width: '45%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#660000',
  },
  buttonTextStyle: {
    fontSize: normalize(13),
    color: '#fff',
    textAlign: 'center',
    fontFamily: getFontsName('IRANSansMobile_Medium'),
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
    height: pageHeight * 0.35,
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
  modalHeaderContainerStyle: {
    width: '100%',
    height: '20%',
    backgroundColor: '#660000',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modalHeaderTextStyle: {
    color: '#fff',
    fontSize: normalize(18),
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
    width: pageWidth * 0.32,
    height: pageWidth * 0.16,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalButtonStyle2: {
    backgroundColor: '#fff',
    width: pageWidth * 0.2,
    height: pageWidth * 0.13,
    marginTop: pageHeight * 0.03,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalButtonTextStyle: {
    color: 'gray',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
});

export default RemainingServiceDetail;
