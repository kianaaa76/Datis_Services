import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import ImageViewer from '../../common/ImageViwer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';
import {BoxShadow} from 'react-native-shadow';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
const shadowOpt2 = {
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
const ServiceFactorTab = ({setInfo, info, serviceInfo}) => {
  const [deletingImage, setDeletingImage] = useState(0);
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
            value={info.factorReceivedPrice}
            keyboardType="numeric"
          />
          <View style={{width: 70}}>
            <Icon name={'star'} style={{color: 'red', fontSize: 10}} />
            <Text style={Styles.labelStyle}>مبلغ دریافتی:</Text>
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
            value={info.factorTotalPrice}
            keyboardType="numeric"
          />
          <View style={{width: 70}}>
            <Icon name={'star'} style={{color: 'red'}} />
            <Text style={Styles.labelStyle}>جمع فاکتور:</Text>
          </View>
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
                  console.log('response', response);
                  setInfo({...info, factorImage: response.data});
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
                  console.log('response', response);
                  setInfo({...info, factorImage: response.data});
                });
              }}
            />
            {!!info.factorImage && (
              <Icon
                name={'delete'}
                style={{color: '#000', fontSize: 30}}
                onPress={() => {
                  setDeletingImage(1);
                }}
              />
            )}
          </View>
          <View style={{width: 70}}>
            {serviceInfo.serviceResult !== 'سرویس جدید- کسری قطعات' &&
              serviceInfo.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' && (
                <Icon name={'star'} style={{color: 'red', fontSize: 10}} />
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
                  setInfo({...info, billImage: response.data});
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
                  setInfo({...info, billImage: response.data});
                })
              }
            />
            {!!info.billImage && (
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
          onPress={() => setDeletingImage(0)}>
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text>آیا از پاک کردن عکس اطمینان دارید؟</Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <BoxShadow setting={shadowOpt2}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    setDeletingImage(0);
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>خیر</Text>
                </TouchableOpacity>
              </BoxShadow>
              <BoxShadow setting={shadowOpt2}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    if (deletingImage === 1) {
                      setInfo({
                        ...info,
                        factorImage: '',
                      });
                    } else if (deletingImage === 2) {
                      setInfo({
                        ...info,
                        billImage: '',
                      });
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
    justifyContent: 'center',
  },
  textInputStyle: {
    width: pageWidth * 0.5,
    height: 55,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#660000',
    paddingHorizontal: 10,
  },
  imageRowStyle: {
    flexDirection: 'row',
    width: pageWidth * 0.8,
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  getImageContainerViewStyle: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: pageWidth * 0.3,
    height: '100%',
  },
  rialTextStyle: {
    width: pageWidth * 0.1,
  },
  labelStyle: {
    width: '100%',
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
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ServiceFactorTab;
