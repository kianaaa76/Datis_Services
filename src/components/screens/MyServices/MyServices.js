import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  Text,
  TouchableHighlight,
    Alert
} from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../common/Header';
import {normalize} from "../../utils/utilities";
import Icon from 'react-native-vector-icons/MaterialIcons';
import ServiceListItem from '../../utils/MyServiceListItem';
import Octicons from 'react-native-vector-icons/Octicons';
import {getMyServicesList} from '../../../actions/api';
import {
    LOGOUT, RESTORE_SERVICE_DATA, SET_EDITING_SERVICE,
} from '../../../actions/types';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

let serviceList = [];
const MyService = ({navigation}) => {
    let dirs = RNFetchBlob.fs.dirs;
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const [serviceListLoading, setServiceListLoading] = useState(false);
  const [renderRestoreModal, setRenderRestoreModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [renderSendDataModal, setRenderSendDataModal] = useState(false);
  const renderEmptyList = () => {
    return (
      <View
        style={{
          width: pageWidth,
          height: pageHeight*0.8,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{fontSize: normalize(15), fontFamily:'IRANSansMobile_Medium', color: '#000'}}>
          درحال حاضر سرویسی وجود ندارد.
        </Text>
      </View>
    );
  };

  const onNewDataPress = (projectId) => {
      setRenderRestoreModal(false);
      let LIST = [];
      AsyncStorage.getItem("savedServicesList").then(list=>{
          let currentList = JSON.parse(list);
          let Index = 0;
          currentList.map((item,index)=>{
              if (item.projectId == projectId){
                  Index = index;
              }
          });
          delete currentList[Index];
          LIST = currentList;
      });
      AsyncStorage.setItem("savedServicesList", JSON.stringify(LIST));
      dispatch({
          type:RESTORE_SERVICE_DATA,
          savedServiceInfo:{
              projectId:projectId,
              factorReceivedPrice:"",
              factorTotalPrice:"",
              serviceDescription:"",
              address:"",
              finalDate: "",
              serviceResult:"",
              serviceType:"",
              objectList:[],
              startLatitude: "",
              startLongitude: "",
              endLatitude: "",
              endLongitude: "",
              startCity: "",
              endCity: "",
              missionDescription: "",
              distance: "",
              type:""
          }
      });
      RNFetchBlob.fs.unlink(`${dirs.DownloadDir}/${projectId}`);
      navigation.replace("MyServiceDetails", {serviceID: projectId});
  }

  const onConfirmDataPress = async (projectId)=>{
      AsyncStorage.getItem("savedServicesList").then(list=>{
          let currentList = JSON.parse(list);
          let Index = 0;
          currentList.map((item,index)=>{
              if (item.projectId === projectId){
                  Index = index;
              }
          });
          dispatch({
              type:RESTORE_SERVICE_DATA,
              savedServiceInfo:{
                  projectId:projectId,
                  factorReceivedPrice:currentList[Index].factorReceivedPrice,
                  factorTotalPrice:currentList[Index].factorTotalPrice,
                  serviceDescription:currentList[Index].serviceDescription,
                  address:currentList[Index].address,
                  finalDate: currentList[Index].finalDate,
                  serviceResult:currentList[Index].serviceResult,
                  serviceType:currentList[Index].serviceType,
                  objectList:currentList[Index].objectList,
                  startLatitude: currentList[Index].startLatitude,
                  startLongitude: currentList[Index].startLongitude,
                  endLatitude: currentList[Index].endLatitude,
                  endLongitude: currentList[Index].endLongitude,
                  startCity: currentList[Index].startCity,
                  endCity: currentList[Index].endCity,
                  missionDescription: currentList[Index].missionDescription,
                  distance: currentList[Index].distance,
                  type: currentList[Index].type
              }
          });
          setRenderRestoreModal(false);
          setRenderSendDataModal(false);
          navigation.replace("MyServiceDetails", {serviceID: projectId});
      });
  }

  const getMyServices = (id, token) => {
    setServiceListLoading(true);
    getMyServicesList(id, token).then((data) => {
      if (data.errorCode == 0) {
          serviceList = data.result;
      } else {
          if (data.errorCode === 3){
              dispatch({
                  type: LOGOUT
              });
              navigation.navigate("SignedOut");
          } else {
              ToastAndroid.showWithGravity(
                  data.message,
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER
              );
          }
      };
      setServiceListLoading(false);
    }).catch(()=>  setServiceListLoading(false))
  };

  useEffect(() => {
    getMyServices(selector.userId, selector.token);
  }, []);

  return (
    <View style={Styles.containerStyle}>
      <Header
        headerText="سرویس های من"
        leftIcon={
          <Icon
            name="refresh"
            style={{
              fontSize: normalize(30),
              color: '#dadfe1',
            }}
            onPress={() => getMyServices(selector.userId, selector.token)}
          />
        }
      />
      {serviceListLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#66000" />
        </View>
      ) : (
        <View style={Styles.contentContianerStyle}>
          <View style={Styles.flatlistContainerStyle}>
            <FlatList
              data={serviceList}
              renderItem={(item) =>(
                <ServiceListItem
                    item={item}
                    navigation={navigation}
                    setModalState={setRenderRestoreModal}
                    setNetworkModalState={setRenderSendDataModal}
                    setSelectedProjectId={setSelectedProjectId}
                />
              )}
              keyExtractor={(item) => item.projectID.toString()}
              ListEmptyComponent={() => renderEmptyList()}
            />
          </View>
          <TouchableOpacity
            style={Styles.newServiceButtonStyle}
            onPress={() => {
              navigation.navigate('NewService');
            }}>
            <Octicons
              name="plus"
              style={{
                fontSize: normalize(33),
                color: '#dadfe1',
              }}
            />
          </TouchableOpacity>
            {renderRestoreModal && (
                <TouchableHighlight 
                style={Styles.modalBackgroundStyle} 
                onPress={()=>setRenderRestoreModal(false)}
                underlayColor="none">
                    <View style={Styles.modalContainerStyle}>
                        <View style={Styles.modalHeaderContainerStyle}>
                            <Text style={Styles.modalHeaderTextStyle}>
                                داتیس سرویس
                            </Text>
                        </View>
                        <View style={Styles.modalBodyContainerStyle}>
                            <Text style={Styles.modalBodyTextStyle}>
                                این پرونده اطلاعات ذخیره شده دارد. آیا مایلید با همان اطلاعات ادامه دهید؟
                            </Text>
                        </View>
                        <View style={Styles.modalFooterContainerStyle}>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=>onNewDataPress(selectedProjectId)}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        اطلاعات جدید
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=>onConfirmDataPress(selectedProjectId)}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        بله
                                    </Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </TouchableHighlight>
            )}
            {renderSendDataModal && (
                <TouchableHighlight 
                style={Styles.modalBackgroundStyle} 
                onPress={()=>setRenderSendDataModal(false)}
                underlayColor="none">
                    <View style={Styles.modalContainerStyle}>
                        <View style={Styles.modalHeaderContainerStyle}>
                            <Text style={Styles.modalHeaderTextStyle}>
                                داتیس سرویس
                            </Text>
                        </View>
                        <View style={Styles.modalBodyContainerStyle}>
                            <Text style={Styles.modalBodyTextStyle}>
                                برای تغییر اطلاعات ارسال گزینه ویرایش را انتخاب نمایید. در غیر این صورت اطلاعات هنگام برقراری ارتباط با اینترنت ارسال میشوند.
                            </Text>
                        </View>
                        <View style={Styles.modalFooterContainerStyle}>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=>setRenderSendDataModal(false)}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        بازگشت
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=> {
                                        AsyncStorage.getItem("savedServicesList").then(list=>{
                                            let temp = list.filter(item=>item.projectId === selectedProjectId);
                                            if (temp.length > 0){
                                                dispatch({
                                                    type: SET_EDITING_SERVICE,
                                                    editingService: selectedProjectId
                                                });
                                                onConfirmDataPress(selectedProjectId)
                                            } else{
                                                Alert.alert(
                                                    "",
                                                    "سرویس فعلی بسته شده است. لطفا لیست سرویس ها را به روزرسانی کنید.",
                                                    [
                                                        { text: 'OK', onPress: () => {} }
                                                    ],
                                                )
                                            }
                                        })
                                    }}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        ویرایش
                                    </Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </TouchableHighlight>
            )}
        </View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  contentContianerStyle: {
    flex: 1,
    padding: 5,
    alignItems:"center"
  },
  flatlistContainerStyle: {
    width: pageWidth * 0.95,
    justifyContent: 'center',
    alignItems: 'center',
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
    modalBackgroundStyle:{
      width:pageWidth,
        height: pageHeight,
        position: "absolute",
        backgroundColor:"rgba(0,0,0,0.5)",
        justifyContent:"center",
        alignItems:"center",
    },
    modalContainerStyle:{
      width:pageWidth*0.85,
        height:pageHeight*0.35,
        backgroundColor:"#E8E8E8",
        marginBottom:pageHeight*0.25,
        borderRadius: 15,
        overflow:"hidden"
    },
    modalHeaderContainerStyle:{
      width:"100%",
        height:"20%",
        backgroundColor:"#660000",
        justifyContent:"center",
        paddingHorizontal:10
    },
    modalHeaderTextStyle:{
      color:"#fff",
        fontSize:normalize(17),
        fontFamily:"IRANSansMobile_Light"
    },
    modalBodyContainerStyle:{
      width:"100%",
        height:"50%",
        justifyContent:"center",
        alignItems:"center",
        padding: 10
    },
    modalBodyTextStyle:{
        color: "#660000",
        textAlign:"center",
        fontSize: normalize(15),
        fontFamily:"IRANSansMobile_Light"
    },
    modalFooterContainerStyle:{
      flexDirection:"row",
        width:"100%",
        height:"30%",
        justifyContent:"space-around",
    },
    modalButtonStyle:{
        backgroundColor:"#fff",
        width: pageWidth * 0.32,
        height: pageWidth * 0.16,
        borderRadius:7,
        justifyContent:"center",
        alignItems:"center",
        elevation:5
    },
    modalButtonTextStyle:{
      color:"gray",
        fontSize:normalize(16),
        fontFamily:"IRANSansMobile_Medium"
    }
});
export default MyService;
