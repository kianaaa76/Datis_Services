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
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from '../ImageViwer';
import {normalize, addDotsToPrice} from '../../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceFactorTab = ({
  setInfo,
  info,
  serviceInfo,
  renderSaveModal,
  isRejected,
}) => {
  console.warn("info", info);
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
        }}>
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <TextInput
            style={Styles.textInputStyle}
            onChangeText={text => {
              setInfo({...info, factorReceivedPrice: text});
            }}
            value={addDotsToPrice(info.factorReceivedPrice.toString())}
            keyboardType="numeric"
          />
          <View
            style={{
              flexDirection: 'row',
              width: '24%',
              justifyContent: 'flex-end',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' && (
                <Icon
                  name={'star'}
                  style={{color: 'red', fontSize: normalize(10)}}
                />
              )}
            <Text style={Styles.labelStyle}>مبلغ دریافتی:</Text>
          </View>
        </View>
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <TextInput
            style={Styles.textInputStyle}
            onChangeText={text => {
              setInfo({...info, toCompanySettlement: text});
            }}
            value={addDotsToPrice(info.toCompanySettlement.toString())}
            keyboardType="numeric"
          />
          <View
            style={{
              flexDirection: 'row',
              width: '24%',
              justifyContent: 'flex-end',
            }}>
            <Text style={Styles.labelStyle}> مبلغ واریزی به حساب شرکت:</Text>
          </View>
        </View>
        <View style={Styles.rowDataStyle}>
          <Text style={Styles.rialTextStyle}>ریال</Text>
          <TextInput
            style={Styles.textInputStyle}
            onChangeText={text => {
              setInfo({
                ...info,
                factorTotalPrice: text,
              });
            }}
            value={addDotsToPrice(info.factorTotalPrice.toString())}
            keyboardType="numeric"
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '24%',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' && (
                <Icon
                  name={'star'}
                  style={{color: 'red', fontSize: normalize(10)}}
                />
              )}
            <Text style={Styles.labelStyle}>جمع فاکتور:</Text>
          </View>
        </View>
        <View style={Styles.imageRowStyle}>
          <View style={Styles.getImageContainerViewStyle}>
            <Icon
              name={'camera-alt'}
              style={{color: '#000', fontSize: normalize(35)}}
              onPress={() => {
                ImagePicker.openCamera({
                  width: pageWidth - 20,
                  height: pageHeight * 0.4,
                  includeBase64: true,
                  compressImageQuality: 0.7,
                }).then(response => {
                  setInfo({
                    ...info,
                    factorImage: response.data,
                  });
                });
              }}
            />
            <Icon
              name={'file-upload'}
              style={{color: '#000', fontSize: normalize(35)}}
              onPress={() => {
                ImagePicker.openPicker({
                  width: pageWidth - 20,
                  height: pageHeight * 0.4,
                  includeBase64: true,
                  compressImageQuality: 0.7,
                }).then(response => {
                  setInfo({
                    ...info,
                    factorImage: response.data,
                  });
                });
              }}
            />
            {!isRejected && !!info.factorImage && (
              <Icon
                name={'delete'}
                style={{color: '#000', fontSize: normalize(30)}}
                onPress={() => {
                  setDeletingImage(1);
                }}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '24%',
              justifyContent: 'flex-end',
            }}>
            {serviceInfo.serviceResult !== 'لغو موفق' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' &&
              serviceInfo.serviceResult !== 'سرویس جدید- کسری قطعات' && (
                <Icon
                  name={'star'}
                  style={{color: 'red', fontSize: normalize(10)}}
                />
              )}
            <Text style={Styles.labelStyle}>عکس فاکتور:</Text>
          </View>
        </View>
        {!!info.factorImage && (
          <ImageViewer
            width={pageWidth - 30}
            height={pageHeight * 0.4}
            imageUrl={`data:image/jpeg;base64,${info.factorImage}`}
          />
        )}
        <View
          style={[
            Styles.imageRowStyle,
            {marginBottom: !!info.billImage ? 10 : 30},
          ]}>
          <View style={Styles.getImageContainerViewStyle}>
            <Icon
              name={'camera-alt'}
              style={{color: '#000', fontSize: normalize(35)}}
              onPress={() => {
                ImagePicker.openCamera({
                  width: pageWidth - 20,
                  height: pageHeight * 0.4,
                  includeBase64: true,
                  compressImageQuality: 0.7,
                }).then(response => {
                  setInfo({
                    ...info,
                    billImage: response.data,
                  });
                });
              }}
            />
            <Icon
              name={'file-upload'}
              style={{color: '#000', fontSize: normalize(35)}}
              onPress={() =>
                ImagePicker.openPicker({
                  width: pageWidth - 20,
                  height: pageHeight * 0.4,
                  includeBase64: true,
                  compressImageQuality: 0.7,
                }).then(response => {
                  setInfo({
                    ...info,
                    billImage: response.data,
                  });
                })
              }
            />
            {!!info.billImage && (
              <Icon
                name={'delete'}
                style={{color: '#000', fontSize: normalize(30)}}
                onPress={() => {
                  setDeletingImage(2);
                }}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: '24%',
              justifyContent: 'flex-end',
            }}>
            {!!info.toCompanySettlement && info.toCompanySettlement != '0' && (
              <Icon
                name={'star'}
                style={{color: 'red', fontSize: normalize(10)}}
              />
            )}
            <Text style={Styles.labelStyle}>عکس فیش واریزی:</Text>
          </View>
        </View>
        {!!info.billImage && (
          <ImageViewer
            width={pageWidth - 30}
            height={pageHeight * 0.4}
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
    width: '55%',
    height: '100%',
    marginHorizontal: 10,
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
    fontFamily: 'IRANSansMobile_Light',
  },
  labelStyle: {
    fontFamily: 'IRANSansMobile_Light',
    flexShrink: 1,
    textAlign: 'right',
    width: '90%',
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
