import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {TabView, TabBar} from 'react-native-tab-view';
import Header from '../../common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import {getServiceDetails, sendServiceData} from '../../../actions/api';
import {
  GET_SERVICE_DETAIL,
  LOGOUT,
  SET_EDITING_SERVICE,
} from '../../../actions/types';
import ServiceInfoTab from './ServiceInfoTab';
import ServiceFactorTab from './ServiceFactorTab';
import ServiceServicesTab from './ServiceServicesTab';
import ServicePartsTab from './ServicePartsTab';
import ServiceMissionTab from './ServiceMissionTab';
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

const shadowOpt = {
  width: pageWidth * 0.23,
  height: 45,
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

let requestObjectList = [];

const MyServiceDetails = ({navigation}) => {
  let dirs = RNFetchBlob.fs.dirs;
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [renderNetworkModal, setRenderNetworkModal] = useState(false);
  const [renderConfirmModal, setRenderConfirmModal] = useState(false);
  const serviceID = navigation.getParam('serviceID');
  const [factorTabInfo, setFactorTabInfo] = useState({
    factorReceivedPrice: selector.savedServiceInfo.factorReceivedPrice,
    factorTotalPrice: selector.savedServiceInfo.factorTotalPrice,
    factorImage: '',
    billImage: '',
  });
  const [serviceTabInfo, setServiceTabInfo] = useState({
    description: selector.savedServiceInfo.serviceDescription,
    address: selector.savedServiceInfo.address,
    finalDate: selector.savedServiceInfo.finalDate,
    serviceResult: selector.savedServiceInfo.serviceResult,
    serviceType: selector.savedServiceInfo.serviceType,
    image: '',
  });
  const [partsTabInfo, setPartsTabInfo] = useState(
    selector.savedServiceInfo.objectList,
  );
  const [missionTabInfo, setMissionTabInfo] = useState({
    startLatitude: selector.savedServiceInfo.startLatitude,
    startLongitude: selector.savedServiceInfo.startLongitude,
    endLatitude: selector.savedServiceInfo.endLatitude,
    endLongitude: selector.savedServiceInfo.endLongitude,
    startCity: selector.savedServiceInfo.startCity,
    endCity: selector.savedServiceInfo.endCity,
    missionDescription: selector.savedServiceInfo.missionDescription,
    distance: selector.savedServiceInfo.distance,
    travel: selector.savedServiceInfo.travel,
  });

  useEffect(() => {
    RNFetchBlob.fs
      .readFile(`${dirs.DownloadDir}/${serviceID}/1.png`, 'base64')
      .then(data => {
        if (!!data) {
          setFactorTabInfo({
            ...factorTabInfo,
            factorImage: data,
          });
        }
      });
    RNFetchBlob.fs
      .readFile(`${dirs.DownloadDir}/${serviceID}/2.png`, 'base64')
      .then(data => {
        if (!!data) {
          setFactorTabInfo({
            ...factorTabInfo,
            billImage: data,
          });
        }
      });
    RNFetchBlob.fs
      .readFile(`${dirs.DownloadDir}/${serviceID}/3.png`, 'base64')
      .then(data => {
        if (!!data) {
          setFactorTabInfo({
            ...serviceTabInfo,
            image: data,
          });
        }
      });
  }, []);

  const setFactorInfo = e => {
    setFactorTabInfo({
      factorReceivedPrice: e.factorReceivedPrice,
      factorTotalPrice: e.factorTotalPrice,
      factorImage: e.factorImage,
      billImage: e.billImage,
    });
  };

  const setServiceInfo = e => {
    setServiceTabInfo({
      description: e.description,
      address: e.address,
      finalDate: e.finalDate,
      serviceResult: e.serviceResult,
      serviceType: e.serviceType,
      image: e.image,
    });
  };

  const setMissionInfo = e => {
    setMissionTabInfo({
      startLatitude: e.startLatitude,
      startLongitude: e.startLongitude,
      endLatitude: e.endLatitude,
      endLongitude: e.endLongitude,
      startCity: e.startCity,
      endCity: e.endCity,
      missionDescription: e.missionDescription,
      distance: e.distance,
      travel: e.travel,
    });
  };

  const convertResultTitleToNum = title => {
      console.log("titleee", title);
    switch (title) {
      case 'موفق':
        return 1;
      case 'موفق مشکوک':
        return 2;
      case 'سرویس جدید- کسری قطعات':
        return 3;
      case 'سرویس جدید- آماده نبودن پروژه':
        return 4;
      case 'سرویس جدید- عدم تسلط':
        return 5;
      case 'لغو موفق':
        return 6;
      default:
        return 0;
    }
  };

  const convertTypeTitleToNum = title => {
    switch (title) {
      case 'خرابی یا تعویض قطعه':
        return 1;
      case 'ایراد نصب و تنظیم روتین':
        return 2;
      case 'تنظیم و عیب غیرروتین':
        return 3;
      default:
        return 0;
    }
  };

  const onSavePress = type => {
    AsyncStorage.getItem('savedServicesList').then(list => {
      let savedList = !!list
        ? JSON.parse(list).filter(item => item.projectId != serviceID)
        : [];
      savedList.push({
        projectId: serviceID,
        factorReceivedPrice: factorTabInfo.factorReceivedPrice,
        factorTotalPrice: factorTabInfo.factorTotalPrice,
        serviceDescription: serviceTabInfo.description,
        address: serviceTabInfo.address,
        finalDate: serviceTabInfo.finalDate,
        serviceResult: serviceTabInfo.serviceResult,
        serviceType: serviceTabInfo.serviceType,
        objectList: partsTabInfo,
        startLatitude: missionTabInfo.startLatitude,
        startLongitude: missionTabInfo.startLongitude,
        endLatitude: missionTabInfo.endLatitude,
        endLongitude: missionTabInfo.endLongitude,
        startCity: missionTabInfo.startCity,
        endCity: missionTabInfo.endCity,
        missionDescription: missionTabInfo.missionDescription,
        distance: missionTabInfo.distance,
        saveType: type,
        isRejectedService: false,
        travel: missionTabInfo.travel,
      });
      AsyncStorage.setItem('savedServicesList', JSON.stringify(savedList));
    });
    RNFetchBlob.fs.writeFile(
      `${dirs.DownloadDir}/${serviceID}/1.png`,
      factorTabInfo.factorImage,
      'base64',
    );
    if (!!factorTabInfo.billImage) {
      RNFetchBlob.fs.writeFile(
        `${dirs.DownloadDir}/${serviceID}/2.png`,
        factorTabInfo.billImage,
        'base64',
      );
    }
    if (!!serviceTabInfo.image) {
      RNFetchBlob.fs.writeFile(
        `${dirs.DownloadDir}/${serviceID}/3.png`,
        serviceTabInfo.image,
        'base64',
      );
    }
    dispatch({
      type: SET_EDITING_SERVICE,
      editingService: '',
    });
    navigation.replace('MyServices');
  };

  const onFinishServicePress = () => {
    requestObjectList = [];
    setRequestLoading(true);
    setRenderConfirmModal(false);
    setRenderNetworkModal(false);
    if (
      !factorTabInfo.factorImage &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4
    ) {
        console.log("1111", convertResultTitleToNum(serviceTabInfo.serviceResult));
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا عکس فاکتور را بارگذاری کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!factorTabInfo.factorReceivedPrice && factorTabInfo.factorReceivedPrice!==0 &&
        convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
        convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا مبلغ دریافتی فاکتور را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!factorTabInfo.factorTotalPrice && factorTabInfo.factorTotalPrice!==0 &&
        convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
        convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا جمع فاکتور را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!serviceTabInfo.description) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا قسمت توضیحات خدمات را پر کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !serviceTabInfo.finalDate &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4
    ) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا تاریخ انجام پروژه را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!serviceTabInfo.serviceResult) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا نتیجه سرویس را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!serviceTabInfo.serviceType) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا نوع سرویس را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !!missionTabInfo.startLongitude &&
      !missionTabInfo.endLongitude
    ) {
      setRequestLoading(false);
      Alert.alert('اخطار', 'لطفا مبدا ماموریت را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !!missionTabInfo.startLongitude &&
      !!missionTabInfo.endLongitude
    ) {
      partsTabInfo.map(item => {
        requestObjectList.push({
          ServiceId: serviceID,
          Object_Id: item.partType.value.Id,
          Direction: item.objectType === 'new' ? '0' : '1',
          Description: item.failureDescription,
          Price: !item.Price ? parseInt(item.Price) : 0,
          Serial: item.serial,
          VersionId: item.version.Key,
        });
      });
      sendServiceData(
        selector.token,
        serviceID,
        convertResultTitleToNum(serviceTabInfo.serviceResult),
        convertTypeTitleToNum(serviceTabInfo.serviceType),
        factorTabInfo.factorReceivedPrice,
        factorTabInfo.factorTotalPrice,
        serviceTabInfo.address,
        serviceTabInfo.description,
        serviceTabInfo.image,
        factorTabInfo.factorImage,
        requestObjectList,
        serviceTabInfo.finalDate,
        false,
        {
          ServiceManId: selector.userId,
          StartCity: missionTabInfo.startCity,
          StartLocation: `${missionTabInfo.startLatitude},${missionTabInfo.startLongitude}`,
          EndCity: missionTabInfo.endCity,
          EndLocation: `${missionTabInfo.endLatitude},${missionTabInfo.endLongitude}`,
          Distance: missionTabInfo.distance,
          Description: missionTabInfo.missionDescription,
          Travel: missionTabInfo.travel,
        },
        selector.userId,
        factorTabInfo.billImage,
      )
        .then(data => {
          if (data.errorCode === 0) {
            AsyncStorage.getItem('savedServicesList').then(list => {
              let tempList = !!list
                ? JSON.parse(list).filter(
                    service => service.projectId !== serviceID,
                  )
                : [];
              AsyncStorage.setItem(
                'savedServicesList',
                JSON.stringify(tempList),
              );
            });
            RNFetchBlob.fs.unlink(`${dirs.DownloadDir}/${serviceID}`);
            setRequestLoading(false);
            dispatch({
              type: SET_EDITING_SERVICE,
              editingService: '',
            });
            navigation.replace('MyServices');
          } else if (data.errorCode === 3) {
            setRequestLoading(false);
            dispatch({
              type: LOGOUT,
            });
            dispatch({
              type: SET_EDITING_SERVICE,
              editingService: '',
            });
            navigation.navigate('SignedOut');
          } else {
            setRequestLoading(false);
            ToastAndroid.showWithGravity(
              data.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
          }
        })
        .catch(err => {
          setRequestLoading(false);
          setRenderNetworkModal(true);
        });
    } else if (!missionTabInfo.startLongitude && !missionTabInfo.endLongitude) {
      partsTabInfo.map(item => {
        requestObjectList.push({
          ServiceId: serviceID,
          Object_Id: item.partType.value.Id,
          Direction: item.objectType === 'new' ? '0' : '1',
          Description: item.failureDescription,
          Price: !item.Price ? parseInt(item.Price) : 0,
          Serial: item.serial,
          VersionId: item.version.Key,
        });
      });
      sendServiceData(
        selector.token,
        serviceID,
        convertResultTitleToNum(serviceTabInfo.serviceResult),
        convertTypeTitleToNum(serviceTabInfo.serviceType),
        factorTabInfo.factorReceivedPrice,
        factorTabInfo.factorTotalPrice,
        serviceTabInfo.address,
        serviceTabInfo.description,
        serviceTabInfo.image,
        factorTabInfo.factorImage,
        requestObjectList,
        serviceTabInfo.finalDate,
        false,
        {},
        selector.userId,
        factorTabInfo.billImage,
      )
        .then(data => {
          if (data.errorCode === 0) {
            AsyncStorage.getItem('savedServicesList').then(list => {
              let tempList = !!list
                ? JSON.parse(list).filter(
                    service => service.projectId !== serviceID,
                  )
                : [];
              AsyncStorage.setItem(
                'savedServicesList',
                JSON.stringify(tempList),
              );
            });
            RNFetchBlob.fs.unlink(`${dirs.DownloadDir}/${serviceID}`);
            setRequestLoading(false);
            dispatch({
              type: SET_EDITING_SERVICE,
              editingService: '',
            });
            navigation.replace('MyServices');
          } else if (data.errorCode === 3) {
            setRequestLoading(false);
            dispatch({
              type: LOGOUT,
            });
            dispatch({
              type: SET_EDITING_SERVICE,
              editingService: '',
            });
            navigation.navigate('SignedOut');
          } else {
            setRequestLoading(false);
            ToastAndroid.showWithGravity(
              data.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
          }
        })
        .catch(err => {
          setRequestLoading(false);
          setRenderNetworkModal(true);
        });
    }
  };

  useEffect(() => {
    getServiceDetails(serviceID, selector.token).then(data => {
      setDetailsLoading(true);
      if (data.errorCode == 0) {
        dispatch({
          type: GET_SERVICE_DETAIL,
          selectedService: data.result,
          selectServiceError: '',
        });
      } else {
        if (data.errorCode === 3) {
          dispatch({
            type: LOGOUT,
          });
          dispatch({
            type: SET_EDITING_SERVICE,
            editingService: '',
          });
          navigation.navigate('SignedOut');
        } else {
          dispatch({
            type: GET_SERVICE_DETAIL,
            selectedService: null,
            selectServiceError: data.message,
          });
          ToastAndroid.showWithGravity(
            data.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      }
      setDetailsLoading(false);
    });
  }, []);
  const [index, setIndex] = React.useState(4);
  const [routes] = React.useState([
    {key: 'services', title: 'خدمات'},
    {key: 'factor', title: 'فاکتور'},
    {key: 'parts', title: 'قطعات'},
    {key: 'mission', title: 'ماموریت'},
    {key: 'info', title: 'اطلاعات پروژه'},
  ]);
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'services':
        return (
          <ServiceServicesTab
            setInfo={e => setServiceInfo(e)}
            info={serviceTabInfo}
            projectId={serviceID}
            navigation={navigation}
          />
        );
      case 'factor':
        return (
          <ServiceFactorTab
            setInfo={e => setFactorInfo(e)}
            info={factorTabInfo}
            serviceInfo={serviceTabInfo}
          />
        );
      case 'parts':
        return (
          <ServicePartsTab
            setInfo={e => setPartsTabInfo(e)}
            info={partsTabInfo}
          />
        );
      case 'mission':
        return (
          <ServiceMissionTab
            setInfo={e => setMissionInfo(e)}
            info={missionTabInfo}
            navigation={navigation}
          />
        );
      case 'info':
        return <ServiceInfoTab serviceData={selector.selectedService} />;
      default:
        return null;
    }
  };
  return (
    <View style={Styles.containerStyle}>
      <Header
        headerText={'داتیس سرویس'}
        leftIcon={
          <View
            style={{
              flexDirection: 'row',
              width: pageWidth * 0.25,
              height: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Icon
              name="check"
              style={{
                fontSize: 33,
                color: '#dadfe1',
              }}
              onPress={() => setRenderConfirmModal(true)}
            />
            <Icon
              name="save"
              style={{
                fontSize: 33,
                color: '#dadfe1',
              }}
              onPress={() => onSavePress('self')}
            />
          </View>
        }
      />
      {detailsLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={'#000'} />
        </View>
      ) : (
        <TabView
          renderTabBar={props => (
            <TabBar
              {...props}
              style={{backgroundColor: '#FFFFFF', height: pageHeight * 0.08}}
              labelStyle={{
                color: '#000',
                textAlign: 'center',
                fontSize: pageHeight * 0.017,
              }}
              indicatorStyle={{backgroundColor: '#660000'}}
            />
          )}
          navigationState={{index, routes}}
          style={{flex: 1}}
          renderScene={renderScene}
          onIndexChange={Index => setIndex(Index)}
          lazy="false"
        />
      )}
      {renderConfirmModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderConfirmModal(false)}>
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text>آیا از ارسال اطلاعات اطمینان دارید؟</Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <BoxShadow setting={shadowOpt2}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    setRenderConfirmModal(false);
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>خیر</Text>
                </TouchableOpacity>
              </BoxShadow>
              <BoxShadow setting={shadowOpt2}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => {
                    onFinishServicePress();
                  }}>
                  <Text style={Styles.modalButtonTextStyle}>بله</Text>
                </TouchableOpacity>
              </BoxShadow>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {renderNetworkModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderNetworkModal(false)}>
          <View style={Styles.modalContainerStyle2}>
            <View style={Styles.modalHeaderContainerStyle}>
              <Text style={Styles.modalHeaderTextStyle}>خطا در ارتباط</Text>
            </View>
            <View style={Styles.modalBodyContainerStyle}>
              <Text style={Styles.modalBodyTextStyle}>
                اگر در ارتباط به اینترنت مشکل دارید اطلاعات را برای ارسال در
                زمان دیگری ذخیره کنید. در غیر این صورت مجددا تلاش کنید.
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <BoxShadow setting={shadowOpt}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => onSavePress('network')}>
                  <Text style={Styles.modalButtonTextStyle}>ذخیره</Text>
                </TouchableOpacity>
              </BoxShadow>
              <BoxShadow setting={shadowOpt}>
                <TouchableOpacity
                  style={Styles.modalButtonStyle}
                  onPress={() => onFinishServicePress()}>
                  <Text style={Styles.modalButtonTextStyle}>تلاش مجدد</Text>
                </TouchableOpacity>
              </BoxShadow>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {requestLoading && (
        <View style={Styles.onScreenLoadingContainerStyle}>
          <ActivityIndicator size={'large'} color={'#660000'} />
        </View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  contentContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: pageWidth * 0.7,
    height: 150,
    backgroundColor: '#E8E8E8',
    marginBottom: pageHeight * 0.25,
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalContainerStyle2: {
    position: 'absolute',
    width: pageWidth * 0.8,
    height: 200,
    backgroundColor: '#E8E8E8',
    marginBottom: pageHeight * 0.25,
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modalHeaderContainerStyle: {
    width: '100%',
    height: '23%',
    backgroundColor: '#660000',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  modalHeaderTextStyle: {
    color: '#fff',
    fontSize: 16,
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
  onScreenLoadingContainerStyle: {
    width: pageWidth,
    height: pageHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(00,00,00,0.5)',
    position: 'absolute',
  },
});

export default MyServiceDetails;
