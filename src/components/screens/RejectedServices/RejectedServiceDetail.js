import React,{useState, useEffect} from "react";
import {View, Dimensions, StyleSheet, ToastAndroid, ActivityIndicator, PermissionsAndroid} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {TabView, TabBar} from 'react-native-tab-view';
import Header from "../../common/Header";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNFetchBlob from 'rn-fetch-blob';
import {useSelector, useDispatch} from 'react-redux';
import {rejectedServiceDetail} from "../../../actions/api";
import {GET_SERVICE_DETAIL, LOGOUT} from "../../../actions/types";
import ServiceInfoTab from "./RejectedServiceInfoTab";
import ServiceFactorTab from "./RejectedServiceFactorTab";
import ServiceServicesTab from "./RejectedServiceServicesTab";
import ServicePartsTab from "./RejectedServicePartsTab";
import ServiceMissionTab from "./RejectedServiceMissionTab";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MyServiceDetails = ({navigation}) => {
    let dirs = RNFetchBlob.fs.dirs;
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [rejectedService, setRejectedService] = useState({});
    const serviceID = navigation.getParam("serviceID");
    const [factorTabInfo, setFactorTabInfo] = useState({
        factorReceivedPrice:selector.savedServiceInfo.factorReceivedPrice,
        factorTotalPrice:selector.savedServiceInfo.factorTotalPrice,
        factorImage: "",
        billImage:""
    });
    const [serviceTabInfo, setServiceTabInfo] = useState({
        description:selector.savedServiceInfo.serviceDescription,
        address:selector.savedServiceInfo.address,
        finalDate:selector.savedServiceInfo.finalDate,
        serviceResult:selector.savedServiceInfo.serviceResult,
        serviceType:selector.savedServiceInfo.serviceType,
        image:""
    });
    const [partsTabInfo, setPartsTabInfo] = useState(selector.savedServiceInfo.objectList);

    const [missionTabInfo, setMissionTabInfo] = useState({
        startLatitude: selector.savedServiceInfo.startLatitude,
        startLongitude: selector.savedServiceInfo.startLongitude,
        endLatitude: selector.savedServiceInfo.endLatitude,
        endLongitude: selector.savedServiceInfo.endLongitude,
        missionStartDate: selector.savedServiceInfo.missionStartDate,
        missionEndDate: selector.savedServiceInfo.missionEndDate,
        startCity: selector.savedServiceInfo.startCity,
        endCity: selector.savedServiceInfo.endCity,
        missionDescription: selector.savedServiceInfo.missionDescription
    })

    useEffect(()=>{
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${serviceID}/1.png`, 'base64').then(data=>{
            setFactorTabInfo({...factorTabInfo, factorImage: data});
        })
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${serviceID}/2.png`, 'base64').then(data=>{
            setFactorTabInfo({...factorTabInfo, billImage: data});
        })
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${serviceID}/3.png`, 'base64').then(data=>{
            setServiceTabInfo({...serviceTabInfo, image: data});
        })
    },[])

    const setFactorInfo = (e) => {
        setFactorTabInfo(
            {
                factorReceivedPrice:e.factorReceivedPrice,
                factorTotalPrice:e.factorTotalPrice,
                factorImage: e.factorImage,
                billImage: e.billImage
            })
    }

    const setServiceInfo = (e)=>{
        setServiceTabInfo({
            description:e.description,
            address:e.address,
            finalDate:e.finalDate,
            serviceResult:e.serviceResult,
            serviceType:e.serviceType,
            image: e.image
        })
    }

    const setMissionInfo = (e)=>{
        setMissionTabInfo({
            startLatitude: e.startLatitude,
            startLongitude: e.startLongitude,
            endLatitude: e.endLatitude,
            endLongitude: e.endLongitude,
            missionStartDate: e.missionStartDate,
            missionEndDate: e.missionEndDate,
            startCity: e.startCity,
            endCity: e.endCity,
            missionDescription: e.missionDescription
        })
    }

    const onSavePress = () => {
        let savedList = [];
        let INDEX = 0;
        let flag = false;
        AsyncStorage.getItem("savedServicesList").then(list=>{
            savedList = !!list ? JSON.parse(list) : [];
        });
        if (savedList.length>0){
            savedList.map((item, index) => {
                if (!!item.projectId && item.projectId === serviceID){
                    flag = true;
                    INDEX = index;
                }
            });
            if (flag){
                delete savedList[INDEX];
            }
        }
        savedList.push({
            projectId: serviceID,
            factorReceivedPrice:factorTabInfo.factorReceivedPrice,
            factorTotalPrice:factorTabInfo.factorTotalPrice,
            serviceDescription:serviceTabInfo.description,
            address:serviceTabInfo.address,
            finalDate:serviceTabInfo.finalDate,
            serviceResult:serviceTabInfo.serviceResult,
            serviceType:serviceTabInfo.serviceType,
            objectList:partsTabInfo,
            startLatitude: missionTabInfo.startLatitude,
            startLongitude: missionTabInfo.startLongitude,
            endLatitude: missionTabInfo.endLatitude,
            endLongitude: missionTabInfo.endLongitude,
            missionStartDate: missionTabInfo.missionStartDate,
            missionEndDate: missionTabInfo.missionEndDate,
            startCity: missionTabInfo.startCity,
            endCity: missionTabInfo.endCity,
            missionDescription: missionTabInfo.missionDescription
        });
        AsyncStorage.setItem("savedServicesList", JSON.stringify(savedList))
        navigation.navigate("MyServices");
    }

    useEffect(()=>{
        rejectedServiceDetail(serviceID, selector.token).then(data=>{
            setDetailsLoading(true);
            console.warn("************", data);
            if (data.errorCode == 0){
                setRejectedService(data.result);
            } else {
                if (data.errorCode === 3){
                    dispatch({
                        type: LOGOUT
                    });
                    navigation.navigate("SignedOut");
                } else {
                    setRejectedService({});
                    ToastAndroid.showWithGravity(
                        data.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            }
            setDetailsLoading(false);
        })
    },[])
    const [index, setIndex] = React.useState(4);
    const [routes] = React.useState([
        { key: 'services', title: 'خدمات' },
        { key: 'factor', title: 'فاکتور' },
        { key: "parts", title: "قطعات"},
        {key: "mission", title: "ماموریت"},
        { key:"info", title: "اطلاعات پروژه"},

    ]);
    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'services':
                return <ServiceServicesTab setInfo={(e)=>setServiceInfo(e)} info={serviceTabInfo} projectId={serviceID}/>;
            case 'factor':
                return <ServiceFactorTab setInfo={(e)=>setFactorInfo(e)} info={factorTabInfo} projectId={serviceID}/>;
            case 'parts':
                return <ServicePartsTab setInfo={setPartsTabInfo} info={partsTabInfo}/>;
            case 'mission':
                return <ServiceMissionTab setInfo={(e)=>setMissionInfo(e)} info={missionTabInfo}/>;
            case 'info':
                return <ServiceInfoTab serviceData={rejectedService}/>;
            default:
                return null;
        }
    };
    return (
        <View style={Styles.containerStyle}>
            <Header headerText={"داتیس سرویس"} leftIcon={
                <View style={{flexDirection:"row", width:pageWidth*0.25, height:"100%", justifyContent: "space-between", alignItems: "center"}}>
                    <Icon
                        name="check"
                        style={{
                            fontSize: 33,
                            color: '#dadfe1',
                        }}
                        onPress={()=>{}}
                    />
                    <Icon name="save" style={{
                        fontSize: 33,
                        color: '#dadfe1',
                    }}
                          onPress={onSavePress}/>
                </View>
            }/>
            {detailsLoading?(
                <View style={{flex:1, justifyContent: "center", alignItems: "center"}}>
                    <ActivityIndicator size="large" color={"#000"}/>
                </View>
            ):(
                <TabView
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            style={{backgroundColor: '#FFFFFF', height:60}}
                            labelStyle={{color: '#000', textAlign:"center", fontSize:13}}
                            indicatorStyle={{backgroundColor: '#660000'}}/>)}
                    navigationState={{index, routes}}
                    style={{flex:1}}
                    renderScene={renderScene}
                    onIndexChange={Index=>setIndex(Index)}
                    lazy='false'
                />
            )}
        </View>
    );
}

const Styles = StyleSheet.create({
    containerStyle:{
        flex:1
    },
    contentContainerStyle:{
        flex:1,
        justifyContent:'center',
        alignItems:"center"
    }
})

export default MyServiceDetails;