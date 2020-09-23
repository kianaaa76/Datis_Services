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
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGIN_VERIFICATION_SUCCESS,
  LOGIN_VERIFICATION_FAIL,
} from '../../actions/types';
import {stackNavigation, NavigationActions} from 'react-navigation';
import {useSelector, useDispatch} from 'react-redux';
import {BoxShadow} from 'react-native-shadow';
import backgroundImage from '../../../assets/images/background_login_screen.png';
import {toFaDigit} from '../utils/utilities';
import {loginUser, loginVerification} from '../../actions/api';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
const inputActiveColor = '#660000';
const inputDeactiveColor = 'gray';

const Login = ({navigation}) => {
  const dispatch = useDispatch();
  const [hasCode, setHasCode] = useState(false);
  const [counter, setCounter] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState();
  const [receiveCodeLoading, setReceiveCodeLoading] = useState(false);
  const [enterSystemLoading, setEnterSystemLoading] = useState(false);
  const [persistLoading, setPersistLoading] = useState(true);
  const [code, setCode] = useState('');
  const selector = useSelector(state => state);

  useEffect(() => {
    if (!!selector.token) {
      navigation.navigate('SignedIn');
    } else {
      setPersistLoading(false);
    }
  }, []);

  const onReceiveCodePress = () => {
    setReceiveCodeLoading(true);
    setCounter(60);
    var iteration = 60;
    setCode('');
    loginUser(phoneNumber).then(data => {
      if (data.errorCode == 0) {
        setHasCode(true);
        const counterInterval = setInterval(() => {
          if (iteration > 0) {
            iteration = iteration - 1;
            setCounter(iteration);
          }
          return () => clearInterval(counterInterval);
        }, 1000);
        dispatch({
          type: LOGIN_SUCCESS,
          error: '',
        });
      } else {
        dispatch({
          type: LOGIN_FAIL,
          error: data.message,
        });
        ToastAndroid.showWithGravity(
          data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
      setReceiveCodeLoading(false);
    });
  };

  const onEnterSystemPress = () => {
    setEnterSystemLoading(true);
    loginVerification(phoneNumber, code).then(data => {
      if (data.errorCode == 0) {
        dispatch({
          type: LOGIN_VERIFICATION_SUCCESS,
          token: data.result.Token,
          userId: data.result.ID,
          error: '',
        });
        navigation.navigate('SignedIn');
      } else {
        dispatch({
          type: LOGIN_VERIFICATION_FAIL,
          error: data.message,
        });
      }
      setEnterSystemLoading(false);
    });
  };

  const shadowOpt = {
    width: pageWidth * 0.45,
    height: pageWidth * 0.11,
    color: '#000',
    radius: 7,
    opacity: 0.1,
    x: 0,
    y: 5,
    style: {marginTop: 30},
  };

  return persistLoading ? (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#660000" />
    </View>
  ) : (
    <ScrollView
      style={{height: pageHeight}}
      keyboardShouldPersistTaps="handled">
      <ImageBackground source={backgroundImage} style={Styles.containerStyle}>
        <View style={{marginTop: '30%', alignItems: 'center'}}>
          <View style={Styles.textInputContainerStyle}>
            <Image
              source={require('../../../assets/images/icon_phone_number.png')}
              style={Styles.iconStyle}
            />
            <TextInput
              style={[
                Styles.textInputStyle,
                {fontWeight: !!phoneNumber ? null : 'bold'},
              ]}
              placeholder="شماره تلفن"
              onChangeText={phoneNumber => {
                setPhoneNumber(phoneNumber);
              }}
              keyboardType="numeric"
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
              style={[
                Styles.textInputStyle,
                {fontWeight: !!code ? null : 'bold'},
              ]}
              placeholder="کد فعالسازی"
              onChangeText={code => setCode(code)}
              keyboardType="numeric"
              placeholderTextColor={hasCode ? '#660000' : 'gray'}
              value={code}
            />
          </View>
          {hasCode ? (
            <View>
              <BoxShadow setting={shadowOpt}>
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
              </BoxShadow>
              <BoxShadow setting={shadowOpt}>
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
              </BoxShadow>
            </View>
          ) : (
            <View style={Styles.buttonContainerStyle}>
              <BoxShadow setting={shadowOpt}>
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
              </BoxShadow>
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
  },
  buttonTextStyle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#660000',
  },
  textInputStyle: {
    width: pageWidth * 0.45,
    height: pageWidth * 0.2,
    backgroundColor: 'transparent',
    margin: 10,
    fontSize: 15,
    fontWeight: 'bold',
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
  },
});
