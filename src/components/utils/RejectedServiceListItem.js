import React,{useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Text,
    Dimensions, ToastAndroid, Alert,
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import {useDispatch, useSelector} from 'react-redux';
import {toFaDigit} from './utilities';
import AsyncStorage from "@react-native-community/async-storage";
import {LOGOUT, RESTORE_SERVICE_DATA} from "../../actions/types";
import {rejectedServiceDetail} from "../../actions/api";
import RNFetchBlob from "rn-fetch-blob";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RejectedServiceListItem = ({item, navigation, setModalState, setSelectedProjectId, renderLoading}) => {
    let dirs = RNFetchBlob.fs.dirs;
    const shadowOpt = {
        width: pageWidth * 0.9,
        height: pageHeight * 0.13,
        color: '#000',
        radius: 5,
        opacity: 0.1,
        x: 2,
        y: 3,
        style: {justifyContent: 'center', alignItems: 'center', marginVertical: 6},
    };
    const Item = item.item;
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [isNetworkSaved, setIsNetworkSaved] = useState(false);

    useEffect( ()=>{
        AsyncStorage.getItem("savedServicesList").then(list=> {
            if(!!list){
                JSON.parse(list).map(item=>{
                    if (item.projectId === Item.projectID) {
                        if (item.saveType === "network"){
                            setIsNetworkSaved(true);
                        }
                    }
                });
            }
        });
    },[]);

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


    return (
        <View style={{flex: 1}}>
            <BoxShadow setting={shadowOpt}>
                <TouchableWithoutFeedback
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    onPress={async () =>{
                        await AsyncStorage.getItem("savedServicesList").then(list=> {
                            if(!!list){
                                let flag = false;
                                JSON.parse(list).map(item=>{
                                    if (item.projectId === Item.projectID) {
                                        setModalState(true);
                                        setSelectedProjectId(Item.projectID);
                                        flag = true;
                                    }
                                });
                                if (!flag){
                                    renderLoading(true);
                                    rejectedServiceDetail(Item.projectID, selector.token).then(data=>{
                                        if (data.errorCode === 0){
                                            dispatch({
                                                type:RESTORE_SERVICE_DATA,
                                                savedServiceInfo:{
                                                    projectId:Item.projectID,
                                                    factorReceivedPrice:data.result.RecivedAmount,
                                                    factorTotalPrice:data.result.InvoiceAmount,
                                                    serviceDescription:data.result.Details,
                                                    address:data.result.Location,
                                                    finalDate: data.result.DoneTime,
                                                    serviceResult:getServiceResult(data.result.Result),
                                                    serviceType:getServiceType(data.result.ServiceType),
                                                    objectList:data.result.ObjectList,
                                                    startLatitude: !!data.result.Mission ? parseFloat(data.result.Mission.StartLocation.substr(0,data.result.Mission.StartLocation.indexOf(','))) : "",
                                                    startLongitude: !!data.result.Mission ?
                                                        parseFloat(data.result.Mission.StartLocation.substr(data.result.Mission.StartLocation.indexOf(',')+1,data.result.Mission.StartLocation.length)) :"",
                                                    endLatitude: !!data.result.Mission ? parseFloat(data.result.Mission.EndLocation.substr(0,data.result.Mission.EndLocation.indexOf(','))):"",
                                                    endLongitude: !!data.result.Mission ?
                                                        parseFloat(data.result.Mission.EndLocation.substr(data.result.Mission.EndLocation.indexOf(',')+1,data.result.Mission.EndLocation.length)):"",
                                                    startCity: !!data.result.Mission ? data.result.Mission.StartCity : "",
                                                    endCity: !!data.result.Mission ? data.result.Mission.EndCity : "",
                                                    missionDescription: !!data.result.Mission ? data.result.Mission.Description : "",
                                                    missionId: !!data.result.Mission ? data.result.Mission.Id : 0,
                                                    distance: !!data.result.Mission ? data.result.Mission.Distance : "0",
                                                    savedType:"",
                                                    travel: !!data.result.Mission ? data.result.Mission.Travel : false
                                                }
                                            });
                                            renderLoading(false);
                                            navigation.replace('RejectedServiceDetail', {serviceID: Item.projectID, service:{
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
                                        } else if (data.errorCode === 3){
                                            renderLoading(false);
                                            dispatch({
                                                type:LOGOUT
                                            });
                                            navigation.navigate("SignedOut");
                                        } else {
                                            renderLoading(false);
                                            ToastAndroid.showWithGravity(
                                                data.message,
                                                ToastAndroid.SHORT,
                                                ToastAndroid.CENTER,
                                            );
                                        }
                                    }).catch(()=>{
                                        renderLoading(false);
                                        setModalState(false);
                                        Alert.alert(
                                            'اخطار',
                                            'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                                            [
                                                { text: 'OK', onPress: () => {} }
                                            ],
                                        );
                                    });
                                }
                            } else {
                                renderLoading(true);
                                rejectedServiceDetail(Item.projectID, selector.token).then(data=>{
                                    if (data.errorCode === 0){
                                        dispatch({
                                            type:RESTORE_SERVICE_DATA,
                                            savedServiceInfo:{
                                                projectId:Item.projectID,
                                                factorReceivedPrice:data.result.RecivedAmount,
                                                factorTotalPrice: data.result.InvoiceAmount,
                                                serviceDescription:data.result.Details,
                                                address:data.result.Location,
                                                finalDate: data.result.DoneTime,
                                                serviceResult:getServiceResult(data.result.Result),
                                                serviceType:getServiceType(data.result.ServiceType),
                                                objectList:data.result.ObjectList,
                                                startLatitude: !!data.result.Mission ? parseFloat(data.result.Mission.StartLocation.substr(0,data.result.Mission.StartLocation.indexOf(','))) : "",
                                                startLongitude: !!data.result.Mission ?
                                                    parseFloat(data.result.Mission.StartLocation.substr(data.result.Mission.StartLocation.indexOf(',')+1,data.result.Mission.StartLocation.length)) :"",
                                                endLatitude: !!data.result.Mission ? parseFloat(data.result.Mission.EndLocation.substr(0,data.result.Mission.EndLocation.indexOf(','))):"",
                                                endLongitude: !!data.result.Mission ?
                                                    parseFloat(data.result.Mission.EndLocation.substr(data.result.Mission.EndLocation.indexOf(',')+1,data.result.Mission.EndLocation.length)):"",
                                                startCity: !!data.result.Mission ? data.result.Mission.StartCity : "",
                                                endCity: !!data.result.Mission ? data.result.Mission.EndCity : "",
                                                missionDescription: !!data.result.Mission ? data.result.Mission.Description : "",
                                                missionId: !!data.result.Mission ? data.result.Mission.ID : 0,
                                                distance: !!data.result.Mission ? data.result.Mission.Distance : "",
                                                savedType:"",
                                                travel: !!data.result.Mission ? data.result.Mission.Travel : false
                                            }
                                        });
                                        renderLoading(false);
                                        navigation.replace('RejectedServiceDetail', {serviceID: Item.projectID, service:{
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
                                            }})
                                    } else if (data.errorCode === 3){
                                        dispatch({
                                            type:LOGOUT
                                        });
                                        navigation.navigate("SignedOut");
                                    } else {
                                        renderLoading(false);
                                        ToastAndroid.showWithGravity(
                                            data.message,
                                            ToastAndroid.SHORT,
                                            ToastAndroid.CENTER,
                                        );
                                    }
                                }).catch(()=>{
                                    setModalState(false);
                                    renderLoading(false);
                                    Alert.alert(
                                        'اخطار',
                                        'به دلیل عدم دسترسی به اینترنت امکان باز کردن این سرویس وجود ندارد.',
                                        [
                                            { text: 'OK', onPress: () => {} }
                                        ],
                                    );
                                })
                            }
                        });
                    }}>
                    <View
                        style={{
                            width: pageWidth * 0.9,
                            height: pageHeight * 0.13,
                            backgroundColor: isNetworkSaved? "#3399FF": "#fff",
                            paddingHorizontal:6,
                            paddingVertical: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(158, 150, 150, 0.3)',
                        }}>
                        <View style={Styles.secondRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.projectID)}</Text>
                                <Text style={{fontSize: 14, fontWeight: 'bold'}}>پروژه: </Text>
                            </View>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.Name)}</Text>
                                <Text style={{fontWeight: 'bold', fontSize:14}}>نام: </Text>
                            </View>
                        </View>
                        <View style={[Styles.firstRowContainerStyle,{marginBottom:2}]}>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.cell)}</Text>
                                <Text style={{fontSize: 14, fontWeight: 'bold'}}>همراه: </Text>
                            </View>
                        </View>
                        <View style={Styles.firstRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text>{Item.Resone.length>20?`${Item.Resone.substr(0,20)}...`:Item.Resone}</Text>
                                <Text style={{fontSize: 14, fontWeight: 'bold'}}>دلیل ردشدن پروژه: </Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </BoxShadow>
        </View>
    );
};

const Styles = StyleSheet.create({
    firstRowContainerStyle:{
        width: '100%',
        height: '33%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    secondRowContainerStyle:{
        width: '100%',
        height: '33%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    singleItemStyle: {
        flexDirection: 'row',
    },
});

export default RejectedServiceListItem;