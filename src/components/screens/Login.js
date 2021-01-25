import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {LOGIN, LOGOUT} from '../../actions/types';
import {useDispatch} from 'react-redux';
import backgroundImage from '../../../assets/images/background_login_screen.png';
import {toFaDigit, normalize, getFontsName} from '../utils/utilities';
import {loginUser, loginVerification} from '../../actions/api';
import Toast from 'react-native-simple-toast';


const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
const inputActiveColor = '#660000';
const inputDeactiveColor = 'gray';
let secondTextInputRef = '';
const Login = ({navigation}) => {
  const dispatch = useDispatch();
  const [hasCode, setHasCode] = useState(false);
  const [counter, setCounter] = useState(120);
  const [phoneNumber, setPhoneNumber] = useState();
  const [receiveCodeLoading, setReceiveCodeLoading] = useState(false);
  const [enterSystemLoading, setEnterSystemLoading] = useState(false);
  const [code, setCode] = useState('');

  const onReceiveCodePress = () => {
    setReceiveCodeLoading(true);
    setCounter(120);
    var iteration = 120;
    setCode('');
    loginUser(phoneNumber).then(data => {
      if (data.errorCode === 0) {
        setHasCode(true);
        if (!!secondTextInputRef) {
          secondTextInputRef.focus();
        }
        const counterInterval = setInterval(() => {
          if (iteration > 0) {
            iteration = iteration - 1;
            setCounter(iteration);
          }
          return () => clearInterval(counterInterval);
        }, 1000);
      } else {
        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
      }
      setReceiveCodeLoading(false);
    });
  };

  const onEnterSystemPress = () => {
    setEnterSystemLoading(true);
    if (counter === 0) {
      setEnterSystemLoading(false);
      Toast.showWithGravity('لطفا مجددا درخواست کد فعالسازی دهید.', Toast.LONG, Toast.CENTER);
    } else {
      if (code.length !== 4) {
        setEnterSystemLoading(false);
        Toast.showWithGravity('کد فعالسازی نادرست است.', Toast.LONG, Toast.CENTER);
      } else {
        loginVerification(phoneNumber, code).then(data => {
          if (data.errorCode === 0) {
            dispatch({
              type: LOGIN,
              token: data.result.Token,
              constantToken: data.result.Token,
              userId: data.result.ID,
              constantUserId: data.result.ID,
            });
            setEnterSystemLoading(false);
            if (!!data.result.HomeLocation) {
              navigation.navigate('Home');
            } else {
              navigation.navigate('UserAddress');
            }
          } else {
            dispatch({
              type: LOGOUT,
            });
            setEnterSystemLoading(false);
            Toast.showWithGravity('کد وارد شده صحیح نیست.', Toast.LONG, Toast.CENTER);
          }
        });
      }
    }
  };

  return (
    <ScrollView
      style={{flex: 1}}
      scrollEnabled={false}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag">
      <StatusBar hidden />
      <ImageBackground source={backgroundImage} style={Styles.containerStyle}>
        <View style={{marginTop: '30%', alignItems: 'center'}}>
          <View style={Styles.textInputContainerStyle}>
            <Image
              source={require('../../../assets/images/icon_phone_number.png')}
              style={Styles.iconStyle}
            />
            <TextInput
              style={Styles.textInputStyle}
              placeholder="شماره تلفن"
              onChangeText={phoneNumber => {
                setPhoneNumber(phoneNumber);
              }}
              keyboardType={'phone-pad'}
              placeholderTextColor={inputActiveColor}
              value={phoneNumber}
            />
          </View>
          <View
            style={[
              Styles.textInputContainerStyle,
              {
                borderBottomColor: hasCode
                  ? inputActiveColor
                  : inputDeactiveColor,
              },
            ]}>
            <Image
              source={
                hasCode
                  ? require('../../../assets/images/icon_password.png')
                  : require('../../../assets/images/icon_password_disabled.png')
              }
              style={Styles.iconStyle}
            />
            <TextInput
              ref={input => {
                secondTextInputRef = input;
              }}
              style={Styles.textInputStyle}
              placeholder="کد فعالسازی"
              onChangeText={code => setCode(code)}
              keyboardType={'phone-pad'}
              placeholderTextColor={hasCode ? '#660000' : 'gray'}
              value={code}
            />
          </View>
          {hasCode ? (
            <View>
              {receiveCodeLoading ? (
                <View style={Styles.buttonStyle}>
                  <ActivityIndicator size="small" color="gray" />
                </View>
              ) : counter == 0 ? (
                <TouchableOpacity
                  style={Styles.buttonStyle}
                  onPress={() => {
                    onReceiveCodePress();
                  }}>
                  <Text style={Styles.buttonTextStyle}>درخواست مجدد</Text>
                </TouchableOpacity>
              ) : (
                <View style={Styles.buttonStyle}>
                  <Text
                    style={[
                      Styles.buttonTextStyle,
                      {color: inputDeactiveColor},
                    ]}>
                    {`${toFaDigit(counter)} ثانیه تا درخواست مجدد`}
                  </Text>
                </View>
              )}
              {enterSystemLoading ? (
                <View style={Styles.buttonStyle}>
                  <ActivityIndicator size="small" color="gray" />
                </View>
              ) : (
                <TouchableOpacity
                  style={Styles.buttonStyle}
                  onPress={() => onEnterSystemPress()}>
                  <Text style={Styles.buttonTextStyle}>ورود به سیستم</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={Styles.buttonContainerStyle}>
              {receiveCodeLoading ? (
                <View style={Styles.buttonStyle}>
                  <ActivityIndicator size="small" color="gray" />
                </View>
              ) : (
                <TouchableOpacity
                  style={Styles.buttonStyle}
                  onPress={() => onReceiveCodePress()}>
                  <Text style={Styles.buttonTextStyle}>
                    درخواست کد فعالسازی
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default Login;

const Styles = StyleSheet.create({
  containerStyle: {
    height: pageHeight,
    alignItems: 'center',
  },
  contentContainerStyle: {
    height: pageHeight * 0.75,
    width: pageWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    width: pageWidth * 0.45,
    height: pageWidth * 0.11,
    borderRadius: 7,
    elevation: 4,
    marginTop: 30,
  },
  buttonTextStyle: {
    fontSize: normalize(13),
    textAlign: 'center',
    color: '#660000',
    fontFamily: getFontsName('IRANSansMobile_Bold'),
  },
  textInputStyle: {
    width: pageWidth * 0.45,
    height: pageWidth * 0.2,
    backgroundColor: 'transparent',
    margin: 10,
    fontSize: normalize(14),
    fontFamily: getFontsName('IRANSansMobile'),
  },
  textInputContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: pageWidth * 0.65,
    height: pageWidth * 0.1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#660000',
    margin: 10,
    flexDirection: 'row',
  },
  iconStyle: {
    width: pageWidth * 0.07,
    height: pageWidth * 0.07,
  },
  buttonContainerStyle: {
    width: pageWidth * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
});
