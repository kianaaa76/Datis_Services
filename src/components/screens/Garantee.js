import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  BackHandler,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Header from '../common/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RNCamera} from 'react-native-camera';
import {useSelector, useDispatch} from 'react-redux';
import {garanteeInquiry} from '../../actions/api';
import {toFaDigit, normalize} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const Garantee = ({navigation}) => {
  const selector = useSelector(state => state);
  const dispatch = useDispatch();
  const [serial, setSerial] = useState('');
  const [screenMode, setScreenMode] = useState(false);
  const [loader, setLoader] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (screenMode) {
        setScreenMode(false);
      } else {
        setSerial('');
        setProduct(null);
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

  const inquiry = () => {
    setLoader(true);
    garanteeInquiry(serial, selector.token).then(data => {
      if (data.errorCode === 0) {
        setProduct(data.result);
        setLoader(false);
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        navigation.navigate('SignedOut');
        setLoader(false);
      } else {
        setLoader(false);
        ToastAndroid.showWithGravity(
          'سریال وارد شده معتبر نیست.',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    });
  };

  const renderSingleItem = (title, value) => {
    return (
      <View style={Styles.singleItemContainerStyle}>
        <Text style={Styles.valueTextStyle}>{value}</Text>
        <Text> : </Text>
        <Text style={Styles.titleTextStyle}>{title}</Text>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {!screenMode ? (
        <>
          <Header headerText={'استعلام گارانتی'} />
          <View style={{flex: 1, alignItems: 'center'}}>
            <View style={Styles.inputContainerStyle}>
              <Icon
                name={'barcode-scan'}
                style={{
                  color: '#000',
                  fontSize: normalize(27),
                  width: 50,
                }}
                onPress={() => {
                  setScreenMode(true);
                }}
              />
              <TextInput
                placeholder={'سریال دستگاه'}
                onChangeText={serial => {
                  setSerial(serial);
                }}
                style={Styles.textInputStyle}
                value={serial}
              />
              <View style={{width: 50}} />
            </View>
            <TouchableOpacity
              style={Styles.buttonContainerStyle}
              onPress={inquiry}>
              {!!loader ? (
                <ActivityIndicator size={'small'} color={'#000'} />
              ) : (
                <Text style={Styles.buttonTextStyle}>استعلام</Text>
              )}
            </TouchableOpacity>
            {!!product ? (
              <View style={{marginTop:30}}> 
                {renderSingleItem(
                  'وضعیت',
                  product.RamzDate.length > 0
                    ? product.RamzDate
                    : 'عدم دریافت رمز',
                )}
                {renderSingleItem('تاریخ تولید', toFaDigit(product.ExitDate))}
                {renderSingleItem(
                  'گارانتی برد',
                  product.Warranty ? 'دارد' : 'ندارد',
                )}
                {renderSingleItem('نوع محصول', product.ProductName)}
              </View>
            ) : null}
          </View>
        </>
      ) : (
        <RNCamera
          defaultTouchToFocus
          onBarCodeRead={code => setSerial(code.data.toString())}
          style={Styles.preview}
          type={RNCamera.Constants.Type.back}>
          <View style={Styles.barcodeContainerStyle}>
            <View style={Styles.barcodeLineStyle} />
          </View>
        </RNCamera>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  textInputStyle: {
    width: pageWidth * 0.5,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#A0A0A0',
    paddingVertical: 2,
    fontFamily: 'IRANSansMobile_Light',
    marginHorizontal: 10,
  },
  inputContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: pageWidth * 0.2,
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeContainerStyle: {
    width: pageWidth * 0.7,
    height: pageWidth * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'green',
  },
  barcodeLineStyle: {
    width: pageWidth * 0.5,
    height: 0,
    borderWidth: 1,
    borderColor: '#660000',
  },
  buttonContainerStyle: {
    width: pageWidth * 0.3,
    height: pageWidth * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C0C0C0',
    elevation: 4,
    marginTop: 50,
  },
  buttonTextStyle: {
    fontSize: normalize(14),
    fontFamily: 'IRANSansMobile_Light',
  },
  singleItemContainerStyle: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#A0A0A0',
    width: pageWidth * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:15
  },
  titleTextStyle: {
    fontSize: normalize(14),
    fontFamily: 'IRANSansMobile_Medium',
  },
  valueTextStyle: {
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
  },
});

export default Garantee;
