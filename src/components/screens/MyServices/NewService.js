import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {normalize} from '../../utils/utilities';
import {selectContactPhone} from 'react-native-select-contact';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../common/Header';
import {submitNewService} from '../../../actions/api';
import {LOGOUT} from '../../../actions/types';
import {PhoneIcon} from "../../../assets/icons";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const NewService = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [projectSerial, setProjectSerial] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getPhoneByContacts = () => {
    let granted = PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    );
    if (!!granted) {
      selectContactPhone().then(selection => {
        setName(selection.contact.name);
        setPhone(selection.selectedPhone.number);
      });
    }
  };

  const onConfirmPress = (
    token,
    servicemanId,
    name,
    phone,
    address,
    serial,
  ) => {
    submitNewService(token, servicemanId, name, phone, address, serial).then(
      data => {
        setConfirmLoading(true);
        if (data.errorCode === 0) {
          setConfirmLoading(false);
          navigation.replace('MyServices');
        } else {
          if (data.errorCode == 3) {
            dispatch({
              type: LOGOUT,
            });
            navigation.navigate('SignedOut');
          } else {
            Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER)
          }
          setConfirmLoading(false);
        }
      },
    );
  };

  return (
    <ScrollView
      style={Styles.containerStyle}
      contentContainerStyle={Styles.contentContainerStyle}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag">
      <Header headerText={'سرویس جدید'} />
      <View style={Styles.contentStyle}>
        <View style={Styles.singleItemContainerStyle}>
          <Text
            style={{
              fontSize: normalize(14),
              fontFamily: 'IRANSansMobile_Light',
            }}>
            نام و نام خانوادگی صاحب پروژه
          </Text>
          <View style={Styles.nameRowInputStyle}>
            <View style={Styles.iconContainerStyle}>
              {PhoneIcon({
                color:"#000",
                onPress: ()=>getPhoneByContacts(),
                width:25,
                height:25
              })}
            </View>
            <TextInput
              placeholder={'نام و نام خانوادگی'}
              placeholderTextColor={'#DBDBDB'}
              style={Styles.textInputStyle}
              onChangeText={text => setName(text)}
              value={name}
            />
            <View style={Styles.iconContainerStyle} />
          </View>
        </View>
        <View style={Styles.singleItemContainerStyle}>
          <Text
            style={{
              fontSize: normalize(14),
              fontFamily: 'IRANSansMobile_Light',
            }}>
            شماره تماس صاحب پروژه
          </Text>
          <TextInput
            placeholder={'شماره همراه'}
            style={Styles.textInputStyle}
            placeholderTextColor={'#DBDBDB'}
            keyboardType={'numeric'}
            onChangeText={text => setPhone(text)}
            value={phone}
          />
        </View>
        <View style={Styles.singleItemContainerStyle}>
          <Text
            style={{
              fontSize: normalize(14),
              fontFamily: 'IRANSansMobile_Light',
            }}>
            آدرس محل پروژه
          </Text>
          <TextInput
            placeholder={'آدرس'}
            style={Styles.textInputStyle}
            placeholderTextColor={'#DBDBDB'}
            onChangeText={text => setAddress(text)}
            value={address}
          />
        </View>
        <View style={Styles.singleItemContainerStyle}>
          <Text
            style={{
              fontSize: normalize(14),
              fontFamily: 'IRANSansMobile_Light',
            }}>
            سریال پروژه
          </Text>
          <TextInput
            placeholder={'سریال'}
            style={Styles.textInputStyle}
            placeholderTextColor={'#DBDBDB'}
            keyboardType={'numeric'}
            onChangeText={text => setProjectSerial(text)}
            value={projectSerial}
          />
        </View>
        {confirmLoading ? (
          <View style={Styles.buttonStyle}>
            <ActivityIndicator size={'small'} color={'#fff'} />
          </View>
        ) : (
          <TouchableOpacity
            style={Styles.buttonStyle}
            onPress={() => {
              onConfirmPress(
                selector.token,
                selector.userId,
                name,
                phone,
                address,
                projectSerial,
              );
            }}>
            <Text style={Styles.buttonTextStyle}>ثبت</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainerStyle: {
    alignItems: 'center',
  },
  contentStyle: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRowInputStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputStyle: {
    width: pageWidth * 0.6,
    borderBottomWidth: 2,
    borderBottomColor: '#660000',
    textAlign: 'center',
    fontFamily: 'IRANSansMobile_Light',
  },
  buttonStyle: {
    backgroundColor: '#660000',
    width: pageWidth * 0.32,
    height: pageWidth * 0.16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonTextStyle: {
    textAlign: 'center',
    color: '#fff',
    fontSize: normalize(16),
    fontFamily: 'IRANSansMobile_Medium',
  },
  singleItemContainerStyle: {
    width: '100%',
    height: pageHeight * 0.14,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: pageHeight * 0.05,
  },
  iconContainerStyle: {
    width: pageWidth * 0.12,
    height: pageWidth * 0.12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewService;
