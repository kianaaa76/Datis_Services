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
    TouchableHighlight, Alert,
} from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import RNFetchBlob from 'rn-fetch-blob';
import {BoxShadow} from 'react-native-shadow';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RejectedServiceListItem from '../../utils/RejectedServiceListItem';
import {rejectedServiceDetail, rejectedServiceList} from '../../../actions/api';
import {
    LOGOUT, RESTORE_SERVICE_DATA, SET_EDITING_SERVICE,
} from '../../../actions/types';

let FACTOR_IMAGE="";
let BILL_IMAGE="";
let IMAGE="";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
const shadowOpt = {
    width: pageWidth * 0.32,
    height: pageWidth * 0.16,
    color: '#000',
    radius: 7,
    opacity: 0.2,
    x: 0,
    y: 3,
    style: {justifyContent:"center", alignItems:"center"},
};

let serviceList = [];
const MyService = ({navigation}) => {
    let dirs = RNFetchBlob.fs.dirs;
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [serviceListLoading, setServiceListLoading] = useState(false);
    const [renderRestoreModal, setRenderRestoreModal] = useState(false);
    const [renderSendDataModal, setRenderSendDataModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectItemLoading, setSelectItemLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const getServiceResult = (resultNum) =>{
        switch (resultNum) {
            case 1:
                return "موفق";
            case 2:
                return "موفق مشکوک";
            case 3:
                return "سرویس جدید - کسری قطعات";
            case 4:
                return "سرویس جدید - آماده نبودن پروژه";
            case 5:
                return "سرویس جدید - عدم تسلط";
            case 6:
                return "لغو موفق";
            default:
                return "";
        }
    }

    const getServiceType = (typeNum) => {
        switch (typeNum) {
            case 1:
                return "خرابی یا تعویض موقت";
            case 2:
                return "ایراد نصب و تنظیم روتین";
            case 3:
                return "تنظیم و عیب غیر روتین";
            default:
                return "";
        }
    }

    const renderEmptyList = () => {
        return (
            <View
                style={{
                    width: pageWidth,
                    height: pageHeight*0.8,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: '#000'}}>
                    درحال حاضر سرویسی وجود ندارد.
                </Text>
            </View>
        );
    };

    const onNewDataPress = (projectId) => {
        setModalLoading(true);
        setRenderRestoreModal(false);
        AsyncStorage.getItem("savedServicesList").then(list=>{
            let tempList = !!list ? JSON.parse(list).filter(service=>service.projectId !== projectId): [];
            AsyncStorage.setItem("savedServicesList", JSON.stringify(tempList));
            RNFetchBlob.fs.unlink(`${dirs.DownloadDir}/${projectId}`);
        });
        rejectedServiceDetail(projectId, selector.token).then(data=>{
            if (data.errorCode === 0){
                dispatch({
                    type:RESTORE_SERVICE_DATA,
                    savedServiceInfo:{
                        projectId:projectId,
                        factorReceivedPrice:data.result.RecivedAmount,
                        factorTotalPrice:data.result.InvoiceAmount,
                        serviceDescription:data.result.Details,
                        address:data.result.Location,
                        finalDate: data.result.DoneTime,
                        serviceResult:getServiceResult(data.result.Result),
                        serviceType:getServiceType(data.result.ServiceType),
                        objectList:data.result.ObjectList,
                        startLatitude: "",
                        startLongitude: "",
                        endLatitude: "",
                        endLongitude: "",
                        startCity: "",
                        endCity: "",
                        missionDescription: "",
                        distance:"",
                        saveType:"",
                        travel:false
                    }
                });
                navigation.replace("RejectedServiceDetail", {serviceID: projectId, service: {
                        "projectID":data.result.projectID,
                        "DocText":{
                            "PhoneName": data.result.DocText.PhoneName,
                            "Phone":data.result.DocText.Phone,
                            "Serial": data.result.DocText.Serial,
                            "WarS": data.result.DocText.WarS,
                            "DOM": data.result.DocText.DOM,
                            "Address": data.result.DocText.Address,
                            "DetectedFailure": data.result.DocText.DetectedFailure,
                            "parts": data.result.DocText.parts,
                            "Date": data.result.DocText.Date
                        },
                        "factorImage":data.result.FactorImage,
                        "image":data.result.Image,
                        "billImage":data.result.BillImage
                    }});
                setModalLoading(false);
            } else if (data.errorCode === 3){
                dispatch({
                    type: LOGOUT
                });
                navigation.navigate("SignedOut");
                setModalLoading(false);
                setRenderRestoreModal(false);
            } else {
                setModalLoading(false);
                setRenderRestoreModal(false);
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
            }
        }).catch(()=>{
            setSelectItemLoading(false);
            Alert.alert(
                'اخطار',
                'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                [
                    { text: 'OK', onPress: () => {} }
                ],
            );
        })
    }

    const onConfirmDataPress = (projectId)=>{
        setRenderRestoreModal(false);
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${projectId}/1.png`, 'base64').then(data=>{
            if (!!data){
                FACTOR_IMAGE = data;
            }
        });
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${projectId}/2.png`, 'base64').then(data=>{
            if(!!data){
                BILL_IMAGE=data;
            }
        });
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${projectId}/3.png`, 'base64').then(data=>{
            if(!!data){
                IMAGE=data;
            }
        });
        setModalLoading(true);
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
                    saveType: currentList[Index].saveType,
                    travel: currentList[Index].travel
                }
            });
            rejectedServiceDetail(projectId, selector.token).then(data=>{
                if (data.errorCode === 0){
                    navigation.replace("RejectedServiceDetail", {serviceID: projectId, service:{
                        "projectID":projectId,
                        "DocText":{
                            "PhoneName": data.result.DocText.PhoneName,
                            "Phone":data.result.DocText.Phone,
                            "Serial": data.result.DocText.Serial,
                            "WarS": data.result.DocText.WarS,
                            "DOM": data.result.DocText.DOM,
                            "Address": data.result.DocText.Address,
                            "DetectedFailure": data.result.DocText.DetectedFailure,
                            "parts": data.result.DocText.parts,
                            "Date": data.result.DocText.Date
                        },
                        "factorImage":FACTOR_IMAGE,
                        "image":IMAGE,
                        "billImage":BILL_IMAGE
                    }});
                    setRenderRestoreModal(false);
                    setModalLoading(false);
                } else if (data.errorCode === 3){
                    dispatch({
                        type: LOGOUT
                    });
                    setRenderRestoreModal(false);
                    setModalLoading(false);
                    navigation.navigate("SignedOut");
                } else {
                    setRenderRestoreModal(false);
                    setModalLoading(false);
                    ToastAndroid.showWithGravity(
                        data.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            }).catch(()=>{
                setRenderRestoreModal(false);
                setSelectItemLoading(false);
                Alert.alert(
                    'اخطار',
                    'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                    [
                        { text: 'OK', onPress: () => {} }
                    ],
                );
            })
        });
    }

    const getRejectedServices = (id, token) => {
        setServiceListLoading(true);
        rejectedServiceList(id, token).then((data) => {
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
        }).catch(()=>setServiceListLoading(false));
    };

    const renderOnScreenLoading=()=>{
        return(
            <View style={Styles.onScreenLoadingContainerStyle}>
                <ActivityIndicator size={"large"} color={"#660000"}/>
            </View>
        )
    }

    useEffect(() => {
        getRejectedServices(selector.userId, selector.token);
    }, []);

    return (
        <View style={Styles.containerStyle}>
            <Header
                headerText="سرویس های ردشده"
                leftIcon={
                    <Icon
                        name="refresh"
                        style={{
                            fontSize: 30,
                            color: '#dadfe1',
                        }}
                        onPress={() => getRejectedServices(selector.userId, selector.token)}
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
                                <RejectedServiceListItem
                                    item={item}
                                    navigation={navigation}
                                    setModalState={setRenderRestoreModal}
                                    setSelectedProjectId={setSelectedProjectId}
                                    renderLoading={setSelectItemLoading}
                                />
                            )}
                            keyExtractor={(item) => item.projectID.toString()}
                            ListEmptyComponent={() => renderEmptyList()}
                        />
                    </View>
                    {renderRestoreModal && (
                        <TouchableHighlight style={Styles.modalBackgroundStyle} onPress={()=>setRenderRestoreModal(false)}>
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
                                {modalLoading?(
                                    <View style={Styles.modalFooterContainerStyle}>
                                        <ActivityIndicator size={"small"} color={"#660000"}/>
                                    </View>
                                ):(<View style={Styles.modalFooterContainerStyle}>
                                    <BoxShadow setting={shadowOpt}>
                                        <TouchableOpacity
                                            style={Styles.modalButtonStyle}
                                            onPress={() => onNewDataPress(selectedProjectId)}>
                                            <Text style={Styles.modalButtonTextStyle}>
                                                اطلاعات جدید
                                            </Text>
                                        </TouchableOpacity>
                                    </BoxShadow>
                                    <BoxShadow setting={shadowOpt}>
                                        <TouchableOpacity
                                            style={Styles.modalButtonStyle}
                                            onPress={() => onConfirmDataPress(selectedProjectId)}>
                                            <Text style={Styles.modalButtonTextStyle}>
                                                تایید
                                            </Text>
                                        </TouchableOpacity>
                                    </BoxShadow>
                                </View>)}
                            </View>
                        </TouchableHighlight>
                    )}
                    {renderSendDataModal && (
                        <TouchableHighlight style={Styles.modalBackgroundStyle} onPress={()=>setRenderSendDataModal(false)}>
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
                                    <BoxShadow setting={shadowOpt}>
                                        <TouchableOpacity
                                            style={Styles.modalButtonStyle}
                                            onPress={()=>setRenderSendDataModal(false)}>
                                            <Text style={Styles.modalButtonTextStyle}>
                                                بازگشت
                                            </Text>
                                        </TouchableOpacity>
                                    </BoxShadow>
                                    <BoxShadow setting={shadowOpt}>
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
                                    </BoxShadow>
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
       width:pageWidth,
       height:pageHeight
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
        height:pageHeight
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
        fontSize:18
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
        fontSize: 17
    },
    modalFooterContainerStyle:{
        flexDirection:"row",
        width:"100%",
        height:"30%",
        justifyContent:"space-around",
    },
    modalButtonStyle:{
        backgroundColor:"#fff",
        width:"97%",
        height:"97%",
        borderRadius:7,
        justifyContent:"center",
        alignItems:"center"
    },
    modalButtonTextStyle:{
        color:"gray",
        fontSize:16,
        fontWeight:"bold"
    },
    onScreenLoadingContainerStyle:{
        width:pageWidth,
        height:pageHeight,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"rgba(00,00,00,0.5)",
        position:"absolute"
    }
});
export default MyService;
