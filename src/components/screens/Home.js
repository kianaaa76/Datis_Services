import React, {useState, useEffect} from 'react';
import {
  View,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
  TextInput,
  Keyboard,
  Linking,
  Alert,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import backgroundImage from '../../../assets/images/background_main_activity.jpg';
import Header from '../common/Header';
import {useSelector, useDispatch} from 'react-redux';
import {
  GET_OBJECTS_LIST,
  LOGIN,
  LOGOUT,
  SET_USER_LIST,
} from '../../actions/types';
import {call, getObjects, getUsers} from '../../actions/api';
import {normalize} from '../utils/utilities';
import Toast from 'react-native-simple-toast';
import {MenuIcon, SearchIcon} from "../../assets/icons";


const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const Home = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [user, setUser] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [ShowinUserList, setShowingUserList] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [changeUserLoading, setChangeUserLoading] = useState(true);

  useEffect(() => {
    if (
      selector.constantUserId === 40 ||
      selector.constantUserId === 41 ||
      selector.constantUserId === 43 ||
      selector.constantUserId === 51
    ) {
      getUsers().then(data => {
        if (data.errorCode === 0) {
          dispatch({
            type: SET_USER_LIST,
            userList: data.result,
          });
          setShowingUserList(data.result);
          data.result.map(item => {
            if (item.ID == selector.userId) {
              setUser(item);
            }
          });
          data.result.map(item=>{
            if (item.ID == selector.userId) {
              setUser(item);
            }
          })
          setChangeUserLoading(false);
        } else {
          setChangeUserLoading(false);
        }
      });
    }  else {
      setChangeUserLoading(false);
    }
  }, []);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    getObjects(selector.token).then(data => {
      if (data.errorCode == 0) {
        const partsList = [];
        data.result.map(item =>
          partsList.push({label: item.Name, value: item}),
        );
        dispatch({
          type: GET_OBJECTS_LIST,
          objectsList: partsList,
        });
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        navigation.navigate('SignedOut');
      }
    });
  }, []);

  const images = [
    require('../../../assets/images/icon_rejected.png'),
    require('../../../assets/images/icon_my_services.png'),
    require('../../../assets/images/icon_settlement.png'),
    require('../../../assets/images/icon_archive.png'),
    require('../../../assets/images/icon_inventory.png'),
    require('../../../assets/images/icon_mission.png'),
  ];

  const renderHomeItems = (title, imageSource, onClick) => {
    return (
      <View style={Styles.singleItemContainerStyle}>
        <TouchableOpacity
          style={Styles.itemImageContainerStyle}
          onPress={onClick}>
          <Image source={imageSource} style={Styles.itemImageStyle} />
        </TouchableOpacity>
        <View style={Styles.itemTitleContainerStyle}>
          <Text style={Styles.itemTitleStyle}>{title}</Text>
        </View>
      </View>
    );
  };

  const search = text => {
    let temp = selector.userList.filter(item =>
      item.Name.includes(text),
    );
    setShowingUserList(temp);
  };

  const callCenter = () => {
    setShowCallModal(false);
    call(selector.token).then(data => {
      if (data.errorCode === 0) {
        Alert.alert(
          '',
          'درخواست تماس شما با موفقیت ثبت شد. کارشناسان مرکز خدمات داتیس به زودی با شما تماس خواهند گرفت.',
          [{text: 'OK', onPress: () => {}}],
        );
      } else if (data.errorCode === 3) {
        dispatch({
          type: LOGOUT,
        });
        navigation.navigate('SignedOut');
      } else {
        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
      }
    });
  };

  return (
    <>
      <View style={{flex: 1, backgroundColor: 'transparent'}}>
        <ImageBackground
          source={backgroundImage}
          style={Styles.containerStyle}
          imageStyle={{resizeMode: isKeyboardVisible ? 'cover' : 'stretch'}}
        />
        <View
          style={{flex: 1, backgroundColor: 'transparent'}}
          keyboardShouldPersistTaps="handled">
          <Header
            rightIcon={(
              <TouchableOpacity style={{flexDirection:"row"}} onPress={()=>navigation.openDrawer()}>
                <Text style={{fontSize: normalize(15),
                  color: "#dadfe1",
                  fontFamily:"IRANSansMobile"}}>
                  داتیس سرویس
                </Text>
                {MenuIcon({
                  color: "#fff",
                  style: {
                    fontSize: normalize(23),
                    marginLeft: 10,
                  }
                })}
              </TouchableOpacity>
            )}
            leftIcon={
              selector.constantUserId == 40 ||
              selector.constantUserId == 41 ||
              selector.constantUserId == 43 ||
              selector.constantUserId == 51 ? (
                <TouchableOpacity
                  onPress={() => {
                    setShowUserList(!showUserList);
                    setShowingUserList(selector.userList);
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: normalize(16),
                      fontFamily: 'IRANSansMobile_Light',
                    }}>
                    {user.Name}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />

          {showUserList && (
            <View style={Styles.userListContainerStyle}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  borderBottomWidth: 1,
                  borderBottomColor: 'gray',
                }}>
                <TextInput
                  placeholder={'جستجو کنید...'}
                  onChangeText={text => search(text)}
                  style={{
                    fontFamily: 'IRANSansMobile_Light',
                    fontSize: normalize(12),
                    width: '100%',
                  }}
                />
                {SearchIcon({
                  color:"#000",
                  width:20,
                  height:20,
                  style:{
                    marginLeft: 5
                  }
                })}
              </View>
              <FlatList
                data={ShowinUserList}
                renderItem={item => (
                  <TouchableOpacity
                    style={{height: 30, marginVertical: 5}}
                    onPress={() => {
                      setChangeUserLoading(true);
                      dispatch({
                        type: LOGIN,
                        token: item.item.Token,
                        constantToken: selector.constantToken,
                        userId: item.item.ID,
                        constantUserId: selector.constantUserId,
                      });
                      setUser(item.item);
                      setShowUserList(false);
                      setShowingUserList(selector.userList);
                      setChangeUserLoading(false);
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: normalize(13),
                        fontFamily: 'IRANSansMobile_Light',
                      }}>
                      {item.item.Name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.ID.toString()}
                ListEmptyComponent={() => (
                  <Text style={{width: '100%', textAlign: 'center'}}>
                    کاربری یافت نشد.
                  </Text>
                )}
              />
            </View>
          )}

          <View style={Styles.contentStyle}>
            <View style={Styles.SingleRowStyle}>
              {renderHomeItems('سرویس‌های رد‌شده', images[0], () => {
                navigation.navigate('RejectedServices');
              })}
              {renderHomeItems('سرویس‌های من', images[1], () => {
                navigation.navigate('MyServices');
              })}
            </View>
            <View style={Styles.SingleRowStyle}>
              {renderHomeItems('سرویس‌های مانده‌دار', images[2], () => {
                navigation.navigate('RemainingServices');
              })}
              {renderHomeItems('آرشیو سرویس‌ها', images[3], () => {
                navigation.navigate('ServiceArchiveList');
              })}
            </View>
            <View style={Styles.SingleRowStyle}>
              {renderHomeItems('انبارداری', images[4], () => {
                Toast.showWithGravity('این قسمت بعدا اضافه خواهد شد.', Toast.LONG, Toast.CENTER);
              })}
              {renderHomeItems('ماموریت‌های من', images[5], () => {
                navigation.navigate('Mission');
              })}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[
            Styles.callIconContainerStyle,
            {bottom: isKeyboardVisible ? -pageHeight * 0.3 : pageHeight * 0.01},
          ]}
          onPress={() => Linking.openURL(`tel:02188355621`)}>
          <Image
            source={require('../../../assets/images/icon_call.png')}
            style={Styles.callIconStyle}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={Styles.missCallIconContainerStyle}
          onPress={() => setShowCallModal(true)}>
          <Image
            source={require('../../../assets/images/icon_miss_call.png')}
            style={Styles.callIconStyle}
          />
        </TouchableOpacity>
        {showCallModal && (
          <TouchableHighlight
            style={Styles.modalBackgroundStyle}
            onPress={() => setShowCallModal(false)}
            underlayColor="none">
            <View style={Styles.modalContainerStyle}>
              <View style={Styles.modalHeaderContainerStyle}>
                <Text style={Styles.modalHeaderTextStyle}>داتیس سرویس</Text>
              </View>
              <View style={Styles.modalBodyContainerStyle}>
                <Text style={Styles.modalBodyTextStyle}>
                  آیا از درخواست تماس خود اطمینان دارید؟
                </Text>
              </View>
              <View style={Styles.modalFooterContainerStyle}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => setShowCallModal(false)}>
                  <Text style={Styles.modalButtonTextStyle}>خیر</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => callCenter()}>
                  <Text style={Styles.modalButtonTextStyle}>بله</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableHighlight>
        )}
      </View>
      {changeUserLoading && (
        <View
          style={{
            width: pageWidth,
            height: pageHeight,
            position: 'absolute',
            backgroundColor: '#000',
            opacity: 0.5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#660000" />
        </View>
      )}
    </>
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
  contentStyle: {
    flex: 1,
  },
  SingleRowStyle: {
    width: pageWidth,
    height: pageHeight * 0.23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  itemImageContainerStyle: {
    width: pageWidth * 0.258,
    height: pageWidth * 0.258,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImageStyle: {
    width: pageWidth * 0.3,
    height: pageWidth * 0.3,
  },
  singleItemContainerStyle: {
    width: pageWidth * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitleContainerStyle: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemTitleStyle: {
    color: 'gray',
    fontSize: normalize(13),
    textAlign: 'center',
    fontFamily: 'IRANSansMobile(FaNum)_Light',
  },
  callIconStyle: {
    width: pageWidth * 0.14,
    height: pageWidth * 0.14,
  },
  callIconContainerStyle: {
    position: 'absolute',
    bottom: pageWidth * 0.02,
    right: pageWidth * 0.03,
    width: pageWidth * 0.14,
  },
  missCallIconContainerStyle: {
    position: 'absolute',
    bottom: pageWidth * 0.02,
    right: pageWidth * 0.2,
    width: pageWidth * 0.14,
  },
  userListContainerStyle: {
    width: 150,
    height: pageHeight * 0.7,
    position: 'absolute',
    backgroundColor: '#fff',
    zIndex: 999,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 10,
    top: pageHeight * 0.075,
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
    marginBottom: pageHeight * 0.25,
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
    fontSize: normalize(17),
    fontFamily: 'IRANSansMobile_Light',
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
    width: pageWidth * 0.28,
    height: pageWidth * 0.14,
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

export default Home;
