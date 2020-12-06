import React, {useState, useEffect} from 'react';
import {
  View,
  Image,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  BackHandler,
  Linking,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import VersionInfo from 'react-native-version-info';
import {useDispatch} from 'react-redux';
import backgroundImage from '../../../assets/images/background_splash_screen.jpg';
import splashImage from '../../../assets/images/image_splash_screen.png';
import {checkUpdate, getUsers} from '../../actions/api';
import {LOGIN} from '../../actions/types';
import {normalize} from '../utils/utilities';

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const Splash = ({navigation}) => {
  const selector = useSelector(state => state);
  const dispatch = useDispatch();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    let version = VersionInfo.appVersion;
    checkUpdate(version)
      .then(data => {
        if (data.errorCode === 5) {
          setShowUpdateModal(true);
        } else {
          if (!!selector.token) {
            if (
              selector.constantUserId === 40 ||
              selector.constantUserId === 41 ||
              selector.constantUserId === 43 ||
              selector.constantUserId === 51
            ) {
              getUsers().then(data => {
                if (data.errorCode === 0) {
                  dispatch({
                    type: LOGIN,
                    token: selector.constantToken,
                    constantToken: selector.constantToken,
                    userId: selector.constantUserId,
                    constantUserId: selector.constantUserId,
                  });
                  navigation.navigate('Home', {users: data.result});
                } else {
                  Alert.alert(
                    '',
                    'مشکلی پیش آمد. لطفا برنامه را بسته و دوباره وارد شوید.',
                    [{text: 'OK', onPress: () => {}}],
                  );
                }
              });
            } else {
              dispatch({
                type: LOGIN,
                token: selector.constantToken,
                constantToken: selector.constantToken,
                userId: selector.constantUserId,
                constantUserId: selector.constantUserId,
              });
              navigation.navigate('Home', {users: []});
            }
          } else {
            navigation.navigate('SignedOut');
          }
        }
      }).catch(() => {
        Alert.alert(
          'عدم دسترسی به اینترنت',
          'برای وارد شدن نیاز به اینترنت دارید. لطفا برنامه را ببندید و پس از فعالسازی اینترنت دستگاه خود دوباره وارد شوید.',
          [
            {
              text: 'OK',
              onPress: () => {
                BackHandler.exitApp();
              },
            },
          ],
        );
      });
    })

  return (
    <ImageBackground source={backgroundImage} style={Styles.containerStyle}>
      <Image
        source={splashImage}
        style={{width: pageWidth * 0.35, resizeMode: 'contain'}}
      />
      {showUpdateModal && (
        <View style={Styles.modalBackgroundStyle}>
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalHeaderContainerStyle}>
              <Text style={Styles.modalHeaderTextStyle}>داتیس سرویس</Text>
            </View>
            <View style={Styles.modalBodyContainerStyle}>
              <Text style={Styles.modalBodyTextStyle}>
                نسخه فعلی برنامه قدیمی است. لطفا به روزرسانی کنید.
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  BackHandler.exitApp();
                }}>
                <Text style={Styles.modalButtonTextStyle}>بازگشت</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  Linking.openURL(
                    'http://deka.datis-elevator.ir/apk/DatisService.apk',
                  );
                }}>
                <Text style={Styles.modalButtonTextStyle}>به روزرسانی</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    width: pageWidth,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalBackgroundStyle: {
    width: pageWidth,
    height: pageHeight,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerStyle: {
    width: pageWidth * 0.85,
    height: pageHeight * 0.35,
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    overflow: 'hidden',
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
    fontSize: normalize(16),
    fontFamily: 'IRANSansMobile_Medium',
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
    fontSize: normalize(15),
    fontFamily: 'IRANSansMobile_Light',
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
  modalButtonTextStyle: {
    color: 'gray',
    fontSize: normalize(16),
    fontFamily: 'IRANSansMobile_Medium',
  },
});

export default Splash;
