import React, {useState, useEffect} from 'react';
import {
    View,
    FlatList,
    Dimensions,
    ToastAndroid,
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {serviceArchiveListWithSerial, serviceArchiveListWithoutSerial} from '../../../actions/api';
import {LOGOUT} from '../../../actions/types';
import Header from '../../common/Header';
import {toFaDigit, normalize} from "../../utils/utilities";
import ServiceArchiveListItem from "../../utils/ServiceArchiveListItem";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;


const ServiceArchiveList = ({navigation}) => {
    const type = navigation.getParam("navigationtype");
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [serviceList, setServiceList] = useState([]);
    const [renderModal, setRenderModal] = useState(true);
    const [serial, setSerial] = useState("");


    const getServices = () => {
        setServiceLoading(true);
        if (serial.length === 0){
            serviceArchiveListWithoutSerial(selector.userId, selector.token).then((data) => {
                if (data.errorCode === 0) {
                    setSerial("");
                    setServiceList(data.result);
                } else {
                    if (data.errorCode === 3){
                        dispatch({
                            type:LOGOUT
                        });
                        navigation.navigate("SignedOut");
                    } else {
                        ToastAndroid.showWithGravity(
                            data.message,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    }
                }
                setServiceLoading(false);
            });
        } else {
            serviceArchiveListWithSerial(selector.userId, selector.token, serial).then((data) => {
                if (data.errorCode === 0) {
                    setServiceList(data.result);
                } else {
                    if (data.errorCode === 3){
                        dispatch({
                            type:LOGOUT
                        });
                        navigation.navigate("SignedOut");
                    } else {
                        ToastAndroid.showWithGravity(
                            data.message,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    }
                }
                setServiceLoading(false);
            });
        }
    };

    const renderEmptyList = () => {
        return (
            <View style={{height:pageHeight*0.8, width:pageWidth, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: normalize(15), fontFamily:"IRANSansMobile_Medium", color: '#000'}}>
                    سرویس مورد نظر یافت نشد.
                </Text>
            </View>
        );
    };

    return (
        <View style={Styles.containerStyle}>
            <Header
                headerText="آرشیو سرویس ها"
                leftIcon={
                    <Icon
                        name="refresh"
                        style={{
                            fontSize: normalize(30),
                            color: '#dadfe1',
                        }}
                        onPress={() => {
                            setSerial("");
                            getServices();
                        }}
                    />
                }
            />
            {serviceLoading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#660000" />
                </View>
            ) : (
                <View style={Styles.contentContianerStyle}>
                    <View style={Styles.flatlistContainerStyle}>
                        <FlatList
                            style={{marginBottom: 50}}
                            data={serviceList}
                            renderItem={(item) => (
                                <ServiceArchiveListItem item={item} navigation={navigation} />
                            )}
                            keyExtractor={(item) => item.projectID.toString()}
                            ListEmptyComponent={()=>renderEmptyList()}
                        />
                    </View>
                </View>
            )}
            {renderModal && (
                <View style={Styles.modalBackgroundStyle}>
                    <View style={Styles.modalContainerStyle}>
                        <View style={Styles.modalHeaderContainerStyle}>
                            <Text style={Styles.modalHeaderTextStyle}>
                                مشاهده آرشیو سرویس ها
                            </Text>
                        </View>
                        <View style={Styles.modalBodyContainerStyle}>
                            <Text style={Styles.modalBodyTextStyle}>
                                {`درصورت وارد نشدن اطلاعات  ${toFaDigit(20)} پرونده آخر نمایش داده میشود.`}
                            </Text>
                            <View style={Styles.modalBodyInputContainerStyle}>
                                <TextInput
                                    style={Styles.modalTextInputStyle}
                                    placeholder="شماره پرونده یا سریال"
                                    onChangeText={value=>setSerial(value)}
                                    value={serial}
                                    keyboardType={"numeric"}
                                />
                                <Text style={Styles.inputLabelStyle}>
                                    شماره پرونده یا سریال:
                                </Text>
                            </View>
                        </View>
                        <View style={Styles.modalFooterContainerStyle}>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=>setRenderModal(false)}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        بازگشت
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Styles.modalButtonStyle}
                                    onPress={()=> {
                                        setRenderModal(false);
                                        getServices()
                                    }}>
                                    <Text style={Styles.modalButtonTextStyle}>
                                        تایید
                                    </Text>
                                </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const Styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContianerStyle: {
        flex: 1,
        padding: 5,
    },
    flatlistContainerStyle: {
        width: pageWidth * 0.95,
        height: pageHeight * 0.95,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newMissionbuttonStyle: {
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
        position:"absolute",
        width:pageWidth*0.85,
        height:pageHeight*0.4,
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
        fontSize:normalize(16),
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
        color: "#5B5B5B",
        textAlign:"center",
        fontSize: normalize(13),
        fontFamily:"IRANSansMobile_Light"
    },
    modalFooterContainerStyle:{
        flexDirection:"row",
        width:"100%",
        height:"25%",
        justifyContent:"space-around",
        alignItems:"center"
    },
    modalButtonStyle:{
        backgroundColor:"#660000",
        width: pageWidth * 0.21,
        height: pageWidth * 0.11,
        borderRadius:7,
        justifyContent:"center",
        alignItems:"center",
        elevation:5
    },
    modalButtonTextStyle:{
        color:"#fff",
        fontSize:normalize(14),
        fontFamily:'IRANSansMobile_Medium'
    },
    modalBodyInputContainerStyle:{
        flexDirection: "row",
        width:"100%",
        height:pageHeight*0.08,
        alignItems:"center",
        justifyContent:"space-between",
        marginVertical:5
    },
    modalTextInputStyle:{
        borderBottomWidth:2,
        borderBottomColor:"#660000",
        fontSize:normalize(11),
        width:"60%",
        height:"100%",
        paddingHorizontal: 8,
        backgroundColor:"transparent",
        textAlign:"center",
        fontFamily:"IRANSansMobile_Light"
    },
    inputLabelStyle:{
        fontSize:normalize(13),
        color:"#5B5B5B",
        textAlign: "center",
        fontFamily:"IRANSansMobile_Light",
        width:"40%"
    }
});

export default ServiceArchiveList;
