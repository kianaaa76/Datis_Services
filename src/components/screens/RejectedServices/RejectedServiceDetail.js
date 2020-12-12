import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  TouchableHighlight,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {TabView, TabBar} from 'react-native-tab-view';
import Header from '../../common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import ServiceInfoTab from '../../common/serviceComponents/serviceInfoTab';
import ServiceFactorTab from '../../common/serviceComponents/serviceFactorTab';
import ServiceServicesTab from '../../common/serviceComponents/serviceServiceTab';
import ServicePartsTab from '../../common/serviceComponents/servicePartsTab';
import ServiceMissionTab from '../../common/serviceComponents/serviceMissionTab';
import {sendServiceData} from '../../../actions/api';
import {LOGOUT, SET_EDITING_SERVICE} from '../../../actions/types';
import {normalize} from '../../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

let requestObjectList = [];
const MyServiceDetails = ({navigation}) => {
  
  let dirs = RNFetchBlob.fs.dirs;
  const selector = useSelector(state => state);
  const dispatch = useDispatch();
  const serviceID = navigation.getParam('serviceID');
  const service = navigation.getParam('service');
  const [factorTabInfo, setFactorTabInfo] = useState({
    factorReceivedPrice: selector.savedServiceInfo.factorReceivedPrice,
    factorTotalPrice: selector.savedServiceInfo.factorTotalPrice,
    toCompanySettlement: selector.savedServiceInfo.toCompanySettlement,
    factorImage: service.factorImage,
    billImage: service.billImage,
  });
  const [serviceTabInfo, setServiceTabInfo] = useState({
    description: selector.savedServiceInfo.serviceDescription,
    address: selector.savedServiceInfo.address,
    finalDate: selector.savedServiceInfo.finalDate,
    serviceResult: selector.savedServiceInfo.serviceResult,
    serviceType: selector.savedServiceInfo.serviceType,
    image: service.image,
  });
  const [partsTabInfo, setPartsTabInfo] = useState(
    selector.savedServiceInfo.objectList,
  );
  const [missionTabInfo, setMissionTabInfo] = useState({
    startLatitude: selector.savedServiceInfo.startLatitude,
    startLongitude: selector.savedServiceInfo.startLongitude,
    endLatitude: selector.savedServiceInfo.endLatitude,
    endLongitude: selector.savedServiceInfo.endLongitude,
    missionStartDate: selector.savedServiceInfo.missionStartDate,
    missionEndDate: selector.savedServiceInfo.missionEndDate,
    startCity: selector.savedServiceInfo.startCity,
    endCity: selector.savedServiceInfo.endCity,
    missionDescription: selector.savedServiceInfo.missionDescription,
    missionId: selector.savedServiceInfo.missionId,
    distance: selector.savedServiceInfo.distance,
    travel: selector.savedServiceInfo.travel,
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [partsListName, setPartsListName] = useState(selector.objectsList);
  const [renderConfirmModal, setRenderConfirmModal] = useState(false);
  const [renderNetworkModal, setRenderNetworkModal] = useState(false);
  const [renderSaveModal, setRenderSaveModal] = useState(false);
  const [hasServiceNewPart, setHasServiceNewPart] = useState(false);

  const setRenderSaveModalInTabs = () => {
    setRenderSaveModal(true);
  };

  useEffect(() => {
    if (partsTabInfo.length > 0 && !partsTabInfo[0].availableVersions) {
      let temp = [];
      partsTabInfo.map((item, index) => {
        let object = partsListName.filter(part => part.label === item.Name);
        let ver = !!object[0]
          ? object[0].value.Versions.filter(v => v.Key === item.VersionId)
          : [];
        temp.push({
          index: index,
          Id: item.Id,
          isExpanded: false,
          failureDescription: item.Description,
          tempFilureDescription: item.Description,
          hasGarantee: '',
          objectType: item.Direction == 0 ? 'new' : 'failed',
          availableVersions: !!object.length ? object[0].value.Versions : [],
          partType: !!object.length ? object[0] : {},
          tempPart: !!object.length ? object[0] : {},
          Price: item.Price,
          tempPrice: item.Price,
          serial: item.Serial,
          tempSerial: item.Serial,
          version: !!ver.length ? ver[0] : {},
          tempVersion: !!ver.length ? ver[0] : {},
          isConfirmed: true,
        });
      });
      setPartsTabInfo(temp);
    }
  }, []);

  const setFactorInfo = e => {
    setFactorTabInfo({
      factorReceivedPrice: e.factorReceivedPrice,
      factorTotalPrice: e.factorTotalPrice,
      toCompanySettlement: e.toCompanySettlement,
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
      missionId: e.missionId,
      distance: e.distance,
      travel: e.travel,
    });
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
        missionId: missionTabInfo.missionId,
        distance: missionTabInfo.distance,
        saveType: type,
        isRejectedService: true,
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
    navigation.replace('RejectedServices');
  };

  const convertResultTitleToNum = title => {
    switch (title) {
      case 'موفق':
        return 1;
      case 'موفق مشکوک':
        return 2;
      case 'سرویس جدید - کسری قطعات':
        return 3;
      case 'سرویس جدید - آماده نبودن پروژه':
        return 4;
      case 'سرویس جدید - عدم تسلط':
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

  const onFinishServicePress = () => {
    setRequestLoading(true);
    setRenderConfirmModal(false);
    setRenderNetworkModal(false);
    if (
      !factorTabInfo.factorImage &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 2
    ) {
      setRequestLoading(false);
      setIndex(1);
      Alert.alert('اخطار', 'لطفا عکس فاکتور را بارگذاری کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !factorTabInfo.factorReceivedPrice &&
      factorTabInfo.factorReceivedPrice !== 0 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 2
    ) {
      setRequestLoading(false);
      setIndex(1);
      Alert.alert('اخطار', 'لطفا مبلغ دریافتی فاکتور را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !factorTabInfo.factorTotalPrice &&
      factorTabInfo.factorTotalPrice !== 0 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 2
    ) {
      setRequestLoading(false);
      setIndex(1);
      Alert.alert('اخطار', 'لطفا جمع فاکتور را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!serviceTabInfo.description) {
      setRequestLoading(false);
      setIndex(0);
      Alert.alert('اخطار', 'لطفا قسمت توضیحات خدمات را پر کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !serviceTabInfo.finalDate &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 2
    ) {
      setRequestLoading(false);
      setIndex(0);
      Alert.alert('اخطار', 'لطفا تاریخ انجام پروژه را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (!serviceTabInfo.serviceResult) {
      setRequestLoading(false);
      setIndex(0);
      Alert.alert('اخطار', 'لطفا نتیجه سرویس را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !serviceTabInfo.serviceType &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 4 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 6 &&
      convertResultTitleToNum(serviceTabInfo.serviceResult) !== 2
    ) {
      setRequestLoading(false);
      setIndex(0);
      Alert.alert('اخطار', 'لطفا نوع سرویس را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !!missionTabInfo.startLongitude &&
      !missionTabInfo.endLongitude
    ) {
      setRequestLoading(false);
      setIndex(3);
      Alert.alert('اخطار', 'لطفا مبدا ماموریت را مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !!factorTabInfo.toCompanySettlement &&
      factorTabInfo.toCompanySettlement != '0' &&
      !factorTabInfo.billImage
    ) {
      setRequestLoading(false);
      setIndex(1);
      Alert.alert('اخطار', 'لطفا عکس فیش واریزی را بارگذاری کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (hasServiceNewPart) {
      setRequestLoading(false);
      setIndex(2);
      Alert.alert('اخطار', 'لطفا وضعیت قطعه جدید را در قسمت قطعات مشخص کنید.', [
        {text: 'OK', onPress: () => {}},
      ]);
    } else if (
      !!missionTabInfo.startLongitude &&
      !!missionTabInfo.endLongitude
    ) {
      requestObjectList = [];
      let openParts = [];
      partsTabInfo.map((item, index) => {
        if (item.isConfirmed) {
          requestObjectList.push({
            Id: !!item.Id ? item.Id : 0,
            ServiceId: serviceID,
            Object_Id: !!item.partType ? item.partType.value.Id : '',
            Direction: item.objectType === 'new' ? '0' : '1',
            Description: item.failureDescription,
            Price: item.Price,
            Serial: item.serial,
            VersionId: !!item.version ? item.version.Key : '',
          });
        } else {
          openParts.push(index + 1);
        }
      });
      if (openParts.length == 0) {
        sendServiceData(
          selector.token,
          serviceID,
          convertResultTitleToNum(serviceTabInfo.serviceResult),
          convertTypeTitleToNum(serviceTabInfo.serviceType),
          parseInt(factorTabInfo.factorReceivedPrice),
          parseInt(factorTabInfo.factorTotalPrice),
          parseInt(factorTabInfo.toCompanySettlement),
          serviceTabInfo.address,
          serviceTabInfo.description,
          serviceTabInfo.image,
          factorTabInfo.factorImage,
          requestObjectList,
          serviceTabInfo.finalDate,
          true,
          {
            Id: missionTabInfo.missionId,
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
              navigation.replace('RejectedServices');
              ToastAndroid.showWithGravity(
                'سرویس شما با موفقیت بسته شد.',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
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
      } else {
        setRequestLoading(false);
        setIndex(2);
        Alert.alert('اخطار', 'لطفا قطعات تایید نشده خود را تایید کنید.', [
          {text: 'OK', onPress: () => {}},
        ]);
      }
    } else if (!missionTabInfo.startLongitude && !missionTabInfo.endLongitude) {
      requestObjectList = [];
      let openParts = [];
      partsTabInfo.map((item, index) => {
        if (item.isConfirmed) {
          requestObjectList.push({
            Id: !!item.Id ? item.Id : 0,
            ServiceId: serviceID,
            Object_Id: !!item.partType ? item.partType.value.Id : '',
            Direction: item.objectType === 'new' ? '0' : '1',
            Description: item.failureDescription,
            Price: item.Price,
            Serial: item.serial,
            VersionId: !!item.version ? item.version.Key : '',
          });
        } else {
          openParts.push(index + 1);
        }
      });
      if (openParts.length == 0) {
        sendServiceData(
          selector.token,
          serviceID,
          convertResultTitleToNum(serviceTabInfo.serviceResult),
          convertTypeTitleToNum(serviceTabInfo.serviceType),
          parseInt(factorTabInfo.factorReceivedPrice),
          parseInt(factorTabInfo.factorTotalPrice),
          parseInt(factorTabInfo.toCompanySettlement),
          serviceTabInfo.address,
          serviceTabInfo.description,
          serviceTabInfo.image,
          factorTabInfo.factorImage,
          requestObjectList,
          serviceTabInfo.finalDate,
          true,
          null,
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
              navigation.replace('RejectedServices');
              ToastAndroid.showWithGravity(
                'سرویس شما با موفقیت بسته شد.',
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
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
      } else {
        setRequestLoading(false);
        setIndex(2);
        Alert.alert('اخطار', 'لطفا قطعات تایید نشده را تایید کنید.', [
          {text: 'OK', onPress: () => {}},
        ]);
      }
    }
  };

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
            navigation={navigation}
            renderSaveModal={setRenderSaveModalInTabs}
          />
        );
      case 'factor':
        return (
          <ServiceFactorTab
            setInfo={e => setFactorInfo(e)}
            info={factorTabInfo}
            serviceInfo={serviceTabInfo}
            renderSaveModal={setRenderSaveModalInTabs}
            isRejected={true}
          />
        );
      case 'parts':
        return (
          <ServicePartsTab
            setInfo={setPartsTabInfo}
            info={partsTabInfo}
            navigation={navigation}
            renderSaveModal={setRenderSaveModalInTabs}
            hasNew={hasServiceNewPart}
            setHasNew={e => setHasServiceNewPart(e)}
          />
        );
      case 'mission':
        return (
          <ServiceMissionTab
            setInfo={e => setMissionInfo(e)}
            info={missionTabInfo}
            navigation={navigation}
            renderSaveModal={setRenderSaveModalInTabs}
            isRejected={true}
          />
        );
      case 'info':
        return (
          <ServiceInfoTab
            serviceData={service}
            renderSaveModal={setRenderSaveModalInTabs}
          />
        );
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
                fontSize: normalize(33),
                color: '#dadfe1',
              }}
              onPress={() => {
                setRenderConfirmModal(true);
              }}
            />
            <Icon
              name="save"
              style={{
                fontSize: normalize(33),
                color: '#dadfe1',
              }}
              onPress={() => onSavePress('self')}
            />
          </View>
        }
      />
      <TabView
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{backgroundColor: '#FFFFFF', height: pageHeight * 0.08}}
            labelStyle={{
              color: '#000',
              textAlign: 'center',
              fontSize: pageHeight * 0.016,
              fontFamily: 'IRANSansMobile_Light',
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
      {renderConfirmModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderConfirmModal(false)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontFamily: 'IRANSansMobile_Medium',
                }}>
                آیا از ارسال اطلاعات اطمینان دارید؟
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  setRenderConfirmModal(false);
                }}>
                <Text style={Styles.modalButtonTextStyle}>خیر</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  onFinishServicePress();
                }}>
                <Text style={Styles.modalButtonTextStyle}>بله</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {renderSaveModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderSaveModal(false)}
          underlayColor="none">
          <View style={Styles.modalContainerStyle}>
            <View style={Styles.modalBodyContainerStyle2}>
              <Text
                style={{
                  fontSize: normalize(14),
                  fontFamily: 'IRANSansMobile_Medium',
                  textAlign: 'center',
                }}>
                آیا مایل به ذخیره اطلاعات وارد شده هستید؟
              </Text>
            </View>
            <View style={Styles.modalFooterContainerStyle}>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  setRenderSaveModal(false);
                  navigation.replace('RejectedServices');
                }}>
                <Text style={Styles.modalButtonTextStyle}>خیر</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.modalButtonStyle}
                onPress={() => {
                  onSavePress('self');
                }}>
                <Text style={Styles.modalButtonTextStyle}>بله</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )}
      {renderNetworkModal && (
        <TouchableHighlight
          style={Styles.modalBackgroundStyle}
          onPress={() => setRenderNetworkModal(false)}
          underlayColor="none">
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
              <TouchableOpacity
                style={Styles.modalButtonStyle2}
                onPress={() => onSavePress('network')}>
                <Text style={Styles.modalButtonTextStyle}>ذخیره</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.modalButtonStyle2}
                onPress={() => onFinishServicePress()}>
                <Text style={Styles.modalButtonTextStyle}>تلاش مجدد</Text>
              </TouchableOpacity>
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
    fontSize: normalize(16),
    fontFamily: 'IRANSansMobile_Medium',
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
    marginTop: '5%',
  },
  modalBodyTextStyle: {
    color: '#660000',
    textAlign: 'center',
    fontSize: normalize(14),
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
    width: pageWidth * 0.2,
    height: 35,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: pageHeight * 0.03,
    elevation: 5,
  },
  modalButtonStyle2: {
    backgroundColor: '#fff',
    width: pageWidth * 0.23,
    height: 45,
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
