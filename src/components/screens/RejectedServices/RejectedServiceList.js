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
} from 'react-native';
import AsyncStorage from "@react-native-community/async-storage";
import RNFetchBlob from 'rn-fetch-blob';
import {BoxShadow} from 'react-native-shadow';
import {useSelector, useDispatch} from 'react-redux';
import Header from '../../common/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RejectedServiceListItem from '../../utils/RejectedServiceListItem';
import Octicons from 'react-native-vector-icons/Octicons';
import {rejectedServiceList} from '../../../actions/api';
import {
    LOGOUT, RESTORE_SERVICE_DATA,
} from '../../../actions/types';

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

const MyService = ({navigation}) => {
    let dirs = RNFetchBlob.fs.dirs;
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [serviceList, setServiceList] = useState([]);
    const [serviceListLoading, setServiceListLoading] = useState(false);
    const [renderRestoreModal, setRenderRestoreModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const renderEmptyList = () => {
        return (
            <View
                style={{
                    width: pageWidth,
                    height: pageHeight,
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
                missionStartDate: "",
                missionEndDate: "",
                startCity: "",
                endCity: "",
                missionDescription: ""
            }
        });
        RNFetchBlob.fs.unlink(`${dirs.DownloadDir}/${projectId}`);
        navigation.navigate("MyServiceDetails", {serviceID: projectId});
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
                    missionStartDate: currentList[Index].missionStartDate,
                    missionEndDate: currentList[Index].missionEndDate,
                    startCity: currentList[Index].startCity,
                    endCity: currentList[Index].endCity,
                    missionDescription: currentList[Index].missionDescription
                }
            });
            setRenderRestoreModal(false);
            navigation.replace("MyServiceDetails", {serviceID: projectId});
        });
    }

    const getRejectedServices = (id, token) => {
        setServiceListLoading(true);
        rejectedServiceList(id, token).then((data) => {
            if (data.errorCode == 0) {
                setServiceList(data.result)
            } else {
                if (data.errorCode === 3){
                    dispatch({
                        type: LOGOUT
                    });
                    navigation.navigate("SignedOut");
                } else {
                    setServiceList([]);
                    ToastAndroid.showWithGravity(
                        data.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                }
            };
            setServiceListLoading(false);
        });
    };
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
                                <View style={Styles.modalFooterContainerStyle}>
                                    <BoxShadow setting={shadowOpt}>
                                        <TouchableOpacity
                                            style={Styles.modalButtonStyle}
                                            onPress={()=>onNewDataPress(selectedProjectId)}>
                                            <Text style={Styles.modalButtonTextStyle}>
                                                اطلاعات جدید
                                            </Text>
                                        </TouchableOpacity>
                                    </BoxShadow>
                                    <BoxShadow setting={shadowOpt}>
                                        <TouchableOpacity
                                            style={Styles.modalButtonStyle}
                                            onPress={()=>onConfirmDataPress(selectedProjectId)}>
                                            <Text style={Styles.modalButtonTextStyle}>
                                                تایید
                                            </Text>
                                        </TouchableOpacity>
                                    </BoxShadow>
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
        backgroundColor: '#fff',
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
    }
});
export default MyService;
