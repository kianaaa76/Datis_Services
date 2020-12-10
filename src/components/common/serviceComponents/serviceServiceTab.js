import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Foundation from 'react-native-vector-icons/Foundation';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-crop-picker';
import ImageViewer from '../ImageViwer';
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment-jalaali';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {API_KEY} from '../../../actions/types';
import {toFaDigit, normalize} from '../../utils/utilities';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

let cameraRef = {};

const ServiceServicesTab = ({setInfo, info, renderSaveModal}) => {
  const [showDatePicker, setShowDatePicke] = useState(false);
  const [screenMode, setScreenMode] = useState('tab');
  const [selectedLatitude, setSelectedLatitude] = useState(null);
  const [selectedLongitude, setSelectedLongitude] = useState(null);
  const [deletingImage, setDeletingImage] = useState(0);
  const [renderTimePicker, setRenderTimePicker] = useState(false);
  const [date, setDate] = useState('');
  const [dateIsSelected, setDateIsSelected] = useState(false);
  const [userLatitude, setUserLatitude] = useState('');
  const [userLongitude, setUserLongitude] = useState('');
  const [areaHasChanged, setAreaHasChanged] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (!!renderTimePicker || !!showDatePicker) {
        setShowDatePicke(false);
        setRenderTimePicker(false);
      } else {
        renderSaveModal();
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  const renderCheckbox = (title, checkboxPurpose) => {
    return (
      <View style={Styles.checkboxContainerStyle}>
        <Text style={Styles.checkboxTextStyle}>{title}</Text>
        <CheckBox
          onValueChange={() => {
            if (checkboxPurpose === 'result') {
              setInfo({
                ...info,
                serviceResult: title,
              });
            } else {
              setInfo({
                ...info,
                serviceType: title,
              });
            }
          }}
          value={
            checkboxPurpose === 'result'
              ? info.serviceResult == title
                ? true
                : false
              : info.serviceType == title
              ? true
              : false
          }
          tintColors={{true: '#660000', false: 'black'}}
        />
      </View>
    );
  };

  return screenMode === 'tab' ? (
    <>
      <ScrollView
        style={Styles.containerStyle}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={Styles.descriptionRowStyle}>
          <View
            style={{
              width: '100%',
              marginBottom: 10,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}>
            <Icon name={'star'} style={{color: 'red'}} />
            <Text style={Styles.labelStyle}>توضیحات:</Text>
          </View>
          <TextInput
            style={Styles.descriptionInputStyle}
            onChangeText={text => {
              setInfo({...info, description: text});
            }}
            value={info.description}
            multiline
          />
        </View>
        <View style={Styles.addressRowStyle}>
          <Icon
            name={'location-searching'}
            style={{color: '#000', fontSize: normalize(20)}}
            onPress={() => {
              setSelectedLongitude('');
              setSelectedLatitude('');
              setScreenMode('map');
            }}
          />
          <TextInput
            style={Styles.textInputStyle}
            onChangeText={text => {
              setInfo({...info, address: text});
            }}
            value={info.address}
          />
          <Text style={Styles.labelStyle}>آدرس:</Text>
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
                  setInfo({...info, image: response.data});
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
                  setInfo({...info, image: response.data});
                })
              }
            />
            {!!info.image && (
              <Icon
                name={'delete'}
                style={{color: '#000', fontSize: normalize(30)}}
                onPress={() => {
                  setDeletingImage(3);
                }}
              />
            )}
          </View>
          <View style={{width: 70}}>
            <Text style={Styles.labelStyle}>عکس:</Text>
          </View>
        </View>
        {!!info.image && (
          <ImageViewer
            width={pageWidth - 30}
            height={pageHeight * 0.4}
            imageUrl={`data:image/jpeg;base64,${info.image}`}
          />
        )}
        <View style={Styles.datePickerRowStyle}>
          <FontAwesomeIcon
            name={'calendar'}
            style={{color: '#000', fontSize: normalize(30)}}
            onPress={() => {
              setDateIsSelected(false);
              setShowDatePicke(true);
            }}
          />
          <View
            style={{
              width: pageWidth * 0.5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            {!!info.finalDate && (
              <Text
                style={{
                  fontSize: normalize(14),
                  marginRight: 10,
                  fontFamily: 'IRANSansMobile(FaNum)_Light',
                }}>
                {`${toFaDigit(info.finalDate)}`}
              </Text>
            )}
            {info.serviceResult !== 'لغو موفق' &&
              info.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' &&
              info.serviceResult !== 'سرویس جدید- کسری قطعات' && (
                <Icon
                  name={'star'}
                  style={{color: 'red', fontSize: normalize(10)}}
                />
              )}
            <Text style={Styles.labelStyle}>تاریخ انجام پروژه:</Text>
          </View>
        </View>
        <View style={Styles.serviceResultContainerStyle}>
          <View style={Styles.resultContainerstyle}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              {info.serviceResult !== 'لغو موفق' &&
                info.serviceResult !== 'سرویس جدید- آماده نبودن پروژه' &&
                info.serviceResult !== 'سرویس جدید- کسری قطعات' && (
                  <Icon
                    name={'star'}
                    style={{color: 'red', fontSize: normalize(10)}}
                  />
                )}
              <Text style={Styles.serviceTypeTextStyle}>نوع سرویس:</Text>
            </View>
            {renderCheckbox('خرابی یا تعویض قطعه', 'type')}
            {renderCheckbox('ایراد نصب و تنظیم روتین', 'type')}
            {renderCheckbox('تنظیم و عیب غیرروتین', 'type')}
          </View>
          <View style={Styles.servicetypeContainerStyle}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <Icon name={'star'} style={{color: 'red'}} />
              <Text style={Styles.serviceTypeTextStyle}>نتیجه سرویس:</Text>
            </View>
            {renderCheckbox('موفق', 'result')}
            {renderCheckbox('موفق مشکوک', 'result')}
            {renderCheckbox('سرویس جدید- کسری قطعات', 'result')}
            {renderCheckbox('سرویس جدید- آماده نبودن پروژه', 'result')}
            {renderCheckbox('سرویس جدید- عدم تسلط', 'result')}
            {renderCheckbox('لغو موفق', 'result')}
          </View>
        </View>
        {showDatePicker && (
          <View style={Styles.datePickerContainerStyle}>
            <PersianCalendarPicker
              onDateChange={date => {
                setDateIsSelected(true);
                setDate(Date.parse(date));
              }}
              width={pageWidth * 0.95}
              selectedDayColor={'red'}
            />
            <TouchableOpacity
              style={Styles.datePickerConfirmButtonStyle}
              onPress={() => {
                if (!dateIsSelected) {
                  setDate(Date.parse(new Date()));
                }
                setRenderTimePicker(true);
                setShowDatePicke(false);
              }}>
              <Text style={Styles.confirmdatePickerTextStyle}>تایید</Text>
            </TouchableOpacity>
          </View>
        )}
        {renderTimePicker && (
          <DateTimePickerModal
            isVisible={renderTimePicker}
            mode="time"
            onConfirm={value => {
              let datee = new moment(date).format('jYYYY/jM/jD HH:mm:ss');
              let timee = datee.split(' ');
              let timeSplit = timee[1].split(':');
              let ss =
                (parseInt(timeSplit[0] * 3600) +
                  parseInt(timeSplit[1] * 60) +
                  parseInt(timeSplit[2])) *
                1000;
              let pureDate = parseInt(date) - ss;
              let addedTime = new moment(Date.parse(value))
                .format('HH:mm:ss')
                .split(':');
              let finalTime =
                pureDate +
                (parseInt(addedTime[0] * 3600) +
                  parseInt(addedTime[1] * 60) +
                  parseInt(addedTime[2])) *
                  1000;
              setInfo({
                ...info,
                finalDate: new moment(finalTime).format('jYYYY/jM/jD HH:mm'),
              });
              setRenderTimePicker(false);
            }}
            onCancel={() => setRenderTimePicker(false)}
            is24Hour={true}
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
              <Text
                style={{
                  fontFamily: 'IRANSansMobile_Medium',
                  fontSize: normalize(14),
                  textAlign: 'center',
                }}>
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
                  if (deletingImage === 3) {
                    setInfo({
                      ...info,
                      image: '',
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
  ) : (
    <View style={{flex: 1}}>
      <MapboxGL.MapView
        style={{flex: 1}}
        onLongPress={feature => {
          setSelectedLatitude(feature.geometry.coordinates[1]);
          setSelectedLongitude(feature.geometry.coordinates[0]);
        }}
        onRegionDidChange={() => setAreaHasChanged(true)}>
        <MapboxGL.UserLocation
          onUpdate={location => {
            setUserLatitude(location.coords.latitude);
            setUserLongitude(location.coords.longitude);
            if (!selectedLatitude && !selectedLongitude && !areaHasChanged) {
              cameraRef.moveTo(
                [location.coords.longitude, location.coords.latitude],
                500,
              );
              cameraRef.zoomTo(11, 500);
            }
          }}
        />
        <MapboxGL.Camera ref={ref => (cameraRef = ref)} />
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
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          width: pageWidth * 0.12,
          height: pageWidth * 0.12,
          borderRadius: pageWidth * 0.06,
          position: 'absolute',
          elevation: 5,
          top: 20,
          right: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
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
              await cameraRef.moveTo([userLongitude, userLatitude], 500);
              await cameraRef.zoomTo(11, 500);
            })
            .catch(() => {
              ToastAndroid.showWithGravity(
                'موقعیت در دسترس نیست.',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            });
        }}>
        <Icon
          name={'my-location'}
          style={{fontSize: normalize(30), color: '#000'}}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          width: pageWidth * 0.12,
          height: pageWidth * 0.12,
          borderRadius: pageWidth * 0.06,
          position: 'absolute',
          elevation: 5,
          top: 20,
          left: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => setScreenMode('tab')}>
        <Icon name="close" style={{fontSize: 30, color: '#000'}} />
      </TouchableOpacity>

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
                  setInfo({...info, address: data.address});
                });
              setScreenMode('tab');
            }}>
            <Text style={Styles.buttonTextStyle}>تایید</Text>
          </TouchableOpacity>
        ) : (
          <View style={Styles.selectTextContainerStyle}>
            <Text style={Styles.selectTextStyle}>موقعیت را مشخص کنید.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  descriptionRowStyle: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  descriptionInputStyle: {
    width: '100%',
    height: pageHeight * 0.15,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    paddingHorizontal: 15,
    paddingVertical: 0,
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
  },
  serviceTypeTextStyle: {
    fontSize: normalize(13),
    color: '#660000',
    fontFamily: 'IRANSansMobile_Light',
  },
  addressRowStyle: {
    flexDirection: 'row',
    width: '100%',
    height: pageHeight * 0.1,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputStyle: {
    width: pageWidth * 0.65,
    height: 55,
    marginHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#660000',
    paddingHorizontal: 10,
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
    color: '#000',
  },
  imageRowStyle: {
    flexDirection: 'row',
    width: '100%',
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerRowStyle: {
    flexDirection: 'row',
    width: '100%',
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
  buttonTextStyle: {
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
  datePickerContainerStyle: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: '20%',
    borderWidth: 2,
    borderColor: '#660000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  datePickerConfirmButtonStyle: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#660000',
  },
  confirmdatePickerTextStyle: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceResultContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  resultContainerstyle: {
    width: pageWidth * 0.45,
    height: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 5,
  },
  servicetypeContainerStyle: {
    width: pageWidth * 0.45,
    height: '100%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 5,
  },
  checkboxContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkboxTextStyle: {
    fontSize: normalize(12),
    width: '75%',
    fontFamily: 'IRANSansMobile_Light',
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
    marginTop: '4%',
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
    fontFamily: 'IRANSansMobile_Medium',
  },
  labelStyle: {
    fontFamily: 'IRANSansMobile_Light',
    fontSize: normalize(14),
  },
});

export default ServiceServicesTab;
