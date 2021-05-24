import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  BackHandler,
} from 'react-native';
import Toast from "react-native-simple-toast";
import NumberFormat from 'react-number-format';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageViewer from '../ImageViwer';
import {normalize, getFontsName} from '../../utils/utilities';
import {StarIcon, UploadFileIcon, CameraIcon, DeleteIcon} from "../../../assets/icons";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceFactorTab = ({
  setInfo,
  info,
  serviceInfo,
  renderSaveModal,
  isRejected,
}) => {
  const [deletingImage, setDeletingImage] = useState(0);

  useEffect(() => {
    const backAction = () => {
      renderSaveModal();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  return (
    <>
      <ScrollView
        style={Styles.containerStyle}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag">
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <NumberFormat thousandSeparator={true} renderText={value => (
              <TextInput
                  style={Styles.textInputStyle}
                  onChangeText={(text) => {
                    setInfo({...info, factorReceivedPrice: text});
                  }}
                  value={value}
                  keyboardType="numeric"
              />
          )} value={info.factorReceivedPrice} displayType={'text'}/>
          <View
            style={{
              flexDirection: 'row',
              width: '35%',
              justifyContent: 'flex-end',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
            serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' && StarIcon()
            }
            <Text style={Styles.labelStyle}>مبلغ دریافتی:</Text>
          </View>
        </View>
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <NumberFormat thousandSeparator={true} renderText={value => (
              <TextInput
                  style={Styles.textInputStyle}
                  onChangeText={(text) => {
                    setInfo({...info, toCompanySettlement: text});
                  }}
                  value={value}
                  keyboardType="numeric"
              />
          )} value={info.toCompanySettlement} displayType={'text'}/>
          <View
            style={{
              flexDirection: 'row',
              width: '35%',
              justifyContent: 'flex-end',
            }}>
            <Text style={Styles.labelStyle}> مبلغ واریزی به حساب شرکت:</Text>
          </View>
        </View>
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <NumberFormat thousandSeparator={true} renderText={value => (
              <TextInput
                  style={Styles.textInputStyle}
                  onChangeText={(text) => {
                    setInfo({...info, factorTotalPrice: text});
                  }}
                  value={value}
                  keyboardType="numeric"
              />
          )} value={info.factorTotalPrice} displayType={'text'}/>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '35%',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' && StarIcon()}
            <Text style={Styles.labelStyle}>جمع فاکتور:</Text>
          </View>
        </View>
        <View style={Styles.imageRowStyle}>
          <View style={Styles.getImageContainerViewStyle}>
            {CameraIcon({
              onPress:() => {
                launchCamera(
                    {
                      mediaType: 'photo',
                      includeBase64: true,
                      quality:0.5
                    },

                    (response) => {
                      setInfo({
                          ...info,
                          factorImage: response.base64,
                        });
                    },
                )
            }
            })}
            {UploadFileIcon({
              onPress:() => {
                launchImageLibrary(
                    {
                      mediaType: 'photo',
                      includeBase64: true,
                      quality:0.5
                    },
                    (response) => {
                      setInfo({
                          ...info,
                          factorImage: response.base64,
                        });
                    },
                )
            }
            })}
            {!isRejected && !!info.factorImage && DeleteIcon({
              color:"#000",
              width:28,
              height:28,
              onPress:() => {
              setDeletingImage(1);
            }})
            }
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '35%',
              justifyContent: 'flex-end',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' &&
              serviceInfo.serviceResult !== 'سرویس جدید- کسری قطعات' && StarIcon()}
            <Text style={Styles.labelStyle}>عکس فاکتور:</Text>
          </View>
        </View>
        {!!info.factorImage && (
          <ImageViewer
            width={pageWidth - 20}
            height={pageHeight * 0.7}
            imageUrl={`data:image/jpeg;base64,${info.factorImage}`}
          />
        )}
        <View
          style={[
            Styles.imageRowStyle,
            {marginBottom: !!info.billImage ? 10 : 30},
          ]}>
          <View style={Styles.getImageContainerViewStyle}>
            {CameraIcon({
              onPress:() => {
                launchCamera(
                    {
                      mediaType: 'photo',
                      includeBase64: true,
                      quality:0.5
                    },
                    (response) => {
                      setInfo({
                          ...info,
                          billImage: response.base64,
                        });
                    },
                )
            }
            })}
            {UploadFileIcon({
              width:30,
              height:30,
              onPress:() => {
                launchImageLibrary(
                    {
                      mediaType: 'photo',
                      includeBase64: true,
                      quality:0.5
                    },
                    (response) => {
                      setInfo({
                          ...info,
                          billImage: response.base64,
                        });
                    },
                )
            }
            })}
            {!!info.billImage && DeleteIcon(
                {
                  color:"#000",
                  width:28,
                  height:28,
                  onPress:() => {
                    setDeletingImage(2);
                  }
                }
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '35%',
              justifyContent: 'flex-end',
            }}>
            {!!info.toCompanySettlement && info.toCompanySettlement != '0' && StarIcon()}
            <Text style={Styles.labelStyle}>عکس فیش واریزی:</Text>
          </View>
        </View>
        {!!info.billImage && (
          <ImageViewer
            width={pageWidth - 30}
            height={pageHeight * 0.7}
            imageUrl={`data:image/jpeg;base64,${info.billImage}`}
          />
        )}
      </ScrollView>
      {!!deletingImage && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setDeletingImage(0)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text>آیا از پاک کردن عکس اطمینان دارید؟</Text>
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
                  if (deletingImage === 2) {
                    setInfo({
                      ...info,
                      billImage: '',
                    });
                  } else if (deletingImage === 1) {
                    setInfo({
                      ...info,
                      factorImage: '',
                    });
                  }
                  setDeletingImage(0);
                }}>
                <Text style={Styles.modalButtonTextStyle}>بله</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )}
    </>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  rowDataStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 65,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputStyle: {
    width: '50%',
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#660000',
    paddingHorizontal: 10,
  },
  imageRowStyle: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  getImageContainerViewStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: pageWidth * 0.3,
    height: '100%',
  },
  rialTextStyle: {
    fontSize: normalize(13),
    fontFamily: getFontsName('IRANSansMobile_Light'),
  },
  labelStyle: {
    fontFamily: getFontsName('IRANSansMobile_Light'),
    fontSize: normalize(15),
    // flexShrink: 1,
    textAlign: 'right',
    // width: '90%',
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
    bottom: pageHeight * 0.3,
    width: pageWidth * 0.7,
    height: 150,
    backgroundColor: '#E8E8E8',
    marginBottom: pageHeight * 0.25,
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalBodyContainerStyle: {
    width: '100%',
    height: '35%',
    alignItems: 'center',
    padding: 10,
  },
  modalBodyContainerStyle2: {
    width: '100%',
    height: '40%',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'flex-end',
  },
  modalBodyTextStyle: {
    color: '#660000',
    textAlign: 'center',
    fontSize: normalize(16),
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
    elevation: 5,
  },
  modalButtonTextStyle: {
    color: 'gray',
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
});

export default ServiceFactorTab;
