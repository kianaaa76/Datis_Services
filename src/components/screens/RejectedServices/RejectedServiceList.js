import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  TouchableHighlight,
  Alert,
  BackHandler,
} from 'react-native';
import Toast from "react-native-simple-toast";
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../common/Header';
import RejectedServiceListItem from '../../utils/RejectedServiceListItem';
import {rejectedServiceDetail, rejectedServiceList} from '../../../actions/api';
import {
  LOGOUT,
  RESTORE_SERVICE_DATA,
} from '../../../actions/types';
import {normalize, getFontsName} from '../../utils/utilities';
import {RefreshIcon} from "../../../assets/icons";

let FACTOR_IMAGE = '';
let BILL_IMAGE = '';
let IMAGE = '';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

let serviceList = [];
const MyService = ({navigation}) => {
  let dirs = RNFetchBlob.fs.dirs;
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [serviceListLoading, setServiceListLoading] = useState(false);
  const [renderRestoreModal, setRenderRestoreModal] = useState(false);
  const [renderSendDataModal, setRenderSendDataModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectItemLoading, setSelectItemLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  const renderEmptyList = () => {
    return (
      <View
        style={{
          width: pageWidth,
          height: pageHeight * 0.8,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: normalize(15),
            fontFamily: getFontsName('IRANSansMobile_Medium'),
            color: '#000',
          }}>
          درحال حاضر سرویسی وجود ندارد.
        </Text>
      </View>
    );
  };

  const onNewDataPress = projectId => {
    setModalLoading(true);
    AsyncStorage.getItem('savedServicesList').then(list => {
      let tempList = !!list
        ? JSON.parse(list).filter(service => service.projectId !== projectId)
        : [];
      AsyncStorage.setItem('savedServicesList', JSON.stringify(tempList));
      RNFetchBlob.fs.unlink(`${dirs.DocumentDir}/${projectId}`);
    });
    rejectedServiceDetail(projectId, selector.token)
      .then(data => {
        if (data.errorCode === 0) {
          dispatch({
            type: RESTORE_SERVICE_DATA,
            savedServiceInfo: {
              projectId: projectId,
              factorReceivedPrice: data.result.RecivedAmount,
              factorTotalPrice: data.result.InvoiceAmount,
              toCompanySettlement: data.result.ToCompanySettlement,
              serviceDescription: data.result.Details,
              address: data.result.Location,
              finalDate: data.result.DoneTime,
              serviceResult: data.result.Result,
              serviceType: data.result.ServiceType,
              objectList: data.result.ObjectList,
              startLatitude:
                !!data.result.Mission && !!data.result.Mission.StartLocation
                  ? parseFloat(
                      data.result.Mission.StartLocation.substr(
                        0,
                        data.result.Mission.StartLocation.indexOf(','),
                      ),
                    )
                  : '',
              startLongitude:
                !!data.result.Mission && !!data.result.Mission.StartLocation
                  ? parseFloat(
                      data.result.Mission.StartLocation.substr(
                        data.result.Mission.StartLocation.indexOf(',') + 1,
                        data.result.Mission.StartLocation.length,
                      ),
                    )
                  : '',
              endLatitude:
                !!data.result.Mission && !!data.result.Mission.EndLocation
                  ? parseFloat(
                      data.result.Mission.EndLocation.substr(
                        0,
                        data.result.Mission.EndLocation.indexOf(','),
                      ),
                    )
                  : '',
              endLongitude:
                !!data.result.Mission && !!data.result.Mission.EndLocation
                  ? parseFloat(
                      data.result.Mission.EndLocation.substr(
                        data.result.Mission.EndLocation.indexOf(',') + 1,
                        data.result.Mission.EndLocation.length,
                      ),
                    )
                  : '',
              startCity: !!data.result.Mission
                ? data.result.Mission.StartCity
                : '',
              endCity: !!data.result.Mission ? data.result.Mission.EndCity : '',
              missionDescription: !!data.result.Mission
                ? data.result.Mission.Description
                : '',
              missionId: !!data.result.Mission ? data.result.Mission.ID : 0,
              distance: !!data.result.Mission
                ? data.result.Mission.Distance
                : '',
              travel: !!data.result.Mission
                ? data.result.Mission.Travel
                : false,
            },
          });
          navigation.replace('RejectedServiceDetail', {
            serviceID: projectId,
            service: {
              projectID: data.result.projectID,
              DocText: {
                PhoneName: data.result.DocText.PhoneName,
                Phone: data.result.DocText.Phone,
                Serial: data.result.DocText.Serial,
                WarS: data.result.DocText.WarS,
                DOM: data.result.DocText.DOM,
                Address: data.result.DocText.Address,
                DetectedFailure: data.result.DocText.DetectedFailure,
                parts: data.result.DocText.parts,
                Date: data.result.DocText.Date,
              },
              factorImage: data.result.FactorImage,
              image: data.result.Image,
              billImage: data.result.BillImage,
            },
          });
          setModalLoading(false);
          setRenderRestoreModal(false);
        } else if (data.errorCode === 3) {
          dispatch({
            type: LOGOUT,
          });
          navigation.navigate('SignedOut');
          setModalLoading(false);
          setRenderRestoreModal(false);
        } else {
          setModalLoading(false);
          setRenderRestoreModal(false);
          Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER)
        }
      })
      .catch(() => {
        setSelectItemLoading(false);
        setModalLoading(false);
        Alert.alert(
          'اخطار',
          'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
          [{text: 'OK', onPress: () => {
            setRenderRestoreModal(false);
            }}],
        );
      });
  };

  const onConfirmDataPress = projectId => {
    setModalLoading(true);
    RNFetchBlob.fs
      .readFile(`${dirs.DocumentDir}/${projectId}/1.png`, 'base64')
      .then(data => {
        if (!!data) {
          FACTOR_IMAGE = data;
        }
      });
    RNFetchBlob.fs
      .readFile(`${dirs.DocumentDir}/${projectId}/2.png`, 'base64')
      .then(data => {
        if (!!data) {
          BILL_IMAGE = data;
        }
      });
    RNFetchBlob.fs
      .readFile(`${dirs.DocumentDir}/${projectId}/3.png`, 'base64')
      .then(data => {
        if (!!data) {
          IMAGE = data;
        }
      });
    AsyncStorage.getItem('savedServicesList').then(list => {
      let currentList = JSON.parse(list);
      let Index = 0;
      currentList.map((item, index) => {
        if (item.projectId === projectId) {
          Index = index;
        }
      });
      dispatch({
        type: RESTORE_SERVICE_DATA,
        savedServiceInfo: {
          projectId: projectId,
          factorReceivedPrice: currentList[Index].factorReceivedPrice,
          factorTotalPrice: currentList[Index].factorTotalPrice,
          toCompanySettlement: currentList[Index].toCompanySettlement,
          serviceDescription: currentList[Index].serviceDescription,
          address: currentList[Index].address,
          finalDate: currentList[Index].finalDate,
          serviceResult: currentList[Index].serviceResult,
          serviceType: currentList[Index].serviceType,
          objectList: currentList[Index].objectList,
          startLatitude: currentList[Index].startLatitude,
          startLongitude: currentList[Index].startLongitude,
          endLatitude: currentList[Index].endLatitude,
          endLongitude: currentList[Index].endLongitude,
          startCity: currentList[Index].startCity,
          endCity: currentList[Index].endCity,
          missionDescription: currentList[Index].missionDescription,
          distance: currentList[Index].distance,
          travel: currentList[Index].travel,
        },
      });
      rejectedServiceDetail(projectId, selector.token)
        .then(data => {
          if (data.errorCode === 0) {
            navigation.replace('RejectedServiceDetail', {
              serviceID: projectId,
              service: {
                projectID: projectId,
                DocText: {
                  PhoneName: data.result.DocText.PhoneName,
                  Phone: data.result.DocText.Phone,
                  Serial: data.result.DocText.Serial,
                  WarS: data.result.DocText.WarS,
                  DOM: data.result.DocText.DOM,
                  Address: data.result.DocText.Address,
                  DetectedFailure: data.result.DocText.DetectedFailure,
                  parts: data.result.DocText.parts,
                  Date: data.result.DocText.Date,
                },
                factorImage: FACTOR_IMAGE,
                image: IMAGE,
                billImage: BILL_IMAGE,
              },
            });
            setRenderRestoreModal(false);
            setModalLoading(false);
          } else if (data.errorCode === 3) {
            dispatch({
              type: LOGOUT,
            });
            setRenderRestoreModal(false);
            setModalLoading(false);
            navigation.navigate('SignedOut');
          } else {
            setRenderRestoreModal(false);
            setModalLoading(false);
            Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER)
          }
        })
        .catch(() => {
          setRenderRestoreModal(false);
          setSelectItemLoading(false);
          setModalLoading(false);
          Alert.alert(
            'اخطار',
            'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
            [{text: 'OK', onPress: () => {}}],
          );
        });
    });
  };

  const getRejectedServices = (id, token) => {
    setServiceListLoading(true);
    rejectedServiceList(id, token)
      .then(data => {
        if (data.errorCode == 0) {
          serviceList = data.result;
        } else {
          if (data.errorCode === 3) {
            dispatch({
              type: LOGOUT,
            });
            navigation.navigate('SignedOut');
          } else {
            Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER)
          }
        }
        setServiceListLoading(false);
      })
      .catch(() => setServiceListLoading(false));
  };

  const renderOnScreenLoading = () => {
    return (
      <View style={Styles.onScreenLoadingContainerStyle}>
        <ActivityIndicator size={'large'} color={'#660000'} />
      </View>
    );
  };

  useEffect(() => {
    getRejectedServices(selector.userId, selector.token);
  }, []);

  return (
    <View style={Styles.containerStyle}>
      <Header
        headerText="سرویس های ردشده"
        leftIcon={
          RefreshIcon({
            color:"#fff",
            onPress:() => getRejectedServices(selector.userId, selector.token),
            style:{
              fontSize: normalize(30)
            }
          })
        }
        isCurrentRootHome={false}
        onBackPress={()=>navigation.goBack()}
      />
      {serviceListLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#66000" />
        </View>
      ) : (
        <View style={Styles.contentContianerStyle}>
            <FlatList
              data={serviceList}
              renderItem={item => (
                <RejectedServiceListItem
                  item={item}
                  navigation={navigation}
                  setModalState={setRenderRestoreModal}
                  setSelectedProjectId={setSelectedProjectId}
                  renderLoading={setSelectItemLoading}
                />
              )}
              keyExtractor={item => item.projectID.toString()}
              ListEmptyComponent={() => renderEmptyList()}
            />
          {renderRestoreModal && (
            <TouchableHighlight
              style={Styles.modalBackgroundStyle}
              onPress={() => setRenderRestoreModal(false)}
              underlayColor="none">
              <View style={Styles.modalContainerStyle}>
                <View style={Styles.modalHeaderContainerStyle}>
                  <Text style={Styles.modalHeaderTextStyle}>داتیس سرویس</Text>
                </View>
                <View style={Styles.modalBodyContainerStyle}>
                  <Text style={Styles.modalBodyTextStyle}>
                    این پرونده اطلاعات ذخیره شده دارد. آیا مایلید با همان
                    اطلاعات ادامه دهید؟
                  </Text>
                </View>
                {modalLoading ? (
                  <View style={Styles.modalFooterContainerStyle}>
                    <ActivityIndicator size={'small'} color={'#660000'} />
                  </View>
                ) : (
                  <View style={Styles.modalFooterContainerStyle}>
                    <TouchableOpacity
                      style={Styles.modalButtonStyle}
                      onPress={() => onNewDataPress(selectedProjectId)}>
                      <Text style={Styles.modalButtonTextStyle}>
                        اطلاعات جدید
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={Styles.modalButtonStyle}
                      onPress={() => onConfirmDataPress(selectedProjectId)}>
                      <Text style={Styles.modalButtonTextStyle}>بله</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableHighlight>
          )}
          {renderSendDataModal && (
            <TouchableHighlight
              style={Styles.modalBackgroundStyle}
              onPress={() => setRenderSendDataModal(false)}
              underlayColor="none">
              <View style={Styles.modalContainerStyle}>
                <View style={Styles.modalHeaderContainerStyle}>
                  <Text style={Styles.modalHeaderTextStyle}>داتیس سرویس</Text>
                </View>
                <View style={Styles.modalBodyContainerStyle}>
                  <Text style={Styles.modalBodyTextStyle}>
                    برای تغییر اطلاعات ارسال گزینه ویرایش را انتخاب نمایید. در
                    غیر این صورت اطلاعات هنگام برقراری ارتباط با اینترنت ارسال
                    میشوند.
                  </Text>
                </View>
                <View style={Styles.modalFooterContainerStyle}>
                  <TouchableOpacity
                    style={Styles.modalButtonStyle}
                    onPress={() => setRenderSendDataModal(false)}>
                    <Text style={Styles.modalButtonTextStyle}>بازگشت</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={Styles.modalButtonStyle}
                    onPress={() => {
                      AsyncStorage.getItem('savedServicesList').then(list => {
                        let temp = list.filter(
                          item => item.projectId === selectedProjectId,
                        );
                        if (temp.length > 0) {
                          onConfirmDataPress(selectedProjectId);
                        } else {
                          Alert.alert(
                            '',
                            'سرویس فعلی بسته شده است. لطفا لیست سرویس ها را به روزرسانی کنید.',
                            [{text: 'OK', onPress: () => {}}],
                          );
                        }
                      });
                    }}>
                    <Text style={Styles.modalButtonTextStyle}>ویرایش</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableHighlight>
          )}
          {selectItemLoading && renderOnScreenLoading()}
        </View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    width: pageWidth,
    height: pageHeight,
  },
  contentContianerStyle: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    marginBottom: 25
  },
  newServiceButtonStyle: {
    width: pageWidth * 0.2,
    height: pageWidth * 0.2,
    borderRadius: pageWidth * 0.1,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: pageWidth * 0.05,
    left: pageWidth * 0.05,
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
    fontFamily: getFontsName('IRANSansMobile_Light'),
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
    fontFamily: getFontsName('IRANSansMobile_Light'),
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
    fontFamily: getFontsName('IRANSansMobile_Medium'),
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
export default MyService;
