import React,{useState,useEffect, useRef} from "react";
import {
    View,
    ActivityIndicator,
    ToastAndroid,
    StyleSheet,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    Image
} from "react-native";
import Header from "../../common/Header";
import {unsettledServiceDetail} from "../../../actions/api";
import {useSelector, useDispatch} from 'react-redux';
import {LOGOUT} from "../../../actions/types";
import {toFaDigit} from "../../utils/utilities";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RemainingServiceDetail = ({navigation}) => {
    const scrollViewRef = useRef();
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [detailLoading, setDetailLoading] = useState(true);
    const [serviceDetail, setServiceDetail] = useState({});
    const [factorImage, setFactorImage] = useState("");
    const SERVICE = navigation.getParam("service");
    useEffect(()=>{
        unsettledServiceDetail(SERVICE.projectID, selector.token).then(data=>{
            if (data.errorCode === 0){
                setServiceDetail(data.result);
                setDetailLoading(false);
            } else if (data.errorCode === 3){
                dispatch({
                    type: LOGOUT
                });
                setDetailLoading(false);
                navigation.navigate("SignedOut");
            } else {
                setServiceDetail({});
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
                setDetailLoading(false);
            }
        })

    },[])

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

    const renderSingleItem = (title, titleColor, text)=>{
        return(
            <View style={Styles.singleItemContainerstyle}>
                <Text>
                    {text}
                </Text>
                <Text style={{
                    fontSize:14,
                    fontWeight:"bold",
                    marginLeft:10,
                    color:titleColor
                }}>
                    {title}
                </Text>
            </View>
        )
    }

    return(
        <ScrollView style={{flex:1}} contentContainerstyle={{justifyContent:"center", alignItems:"center"}}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}>
            <Header headerText={"توضیحات"}/>
            {!!detailLoading ? (
                <View style={{width:pageWidth, height:pageHeight*0.7, justifyContent:"center", alignItems:"center"}}>
                    <ActivityIndicator size={"large"} color={"#000"}/>
                </View>
            ) : (<View
                style={{flex: 1, padding: 10, justifyContent: "center", alignItems: "center"}}>
                {!!serviceDetail.DoneDetails && ( <View style={Styles.contentContainerStyle}>
                    <Text style={[{...Styles.itemLabelStyle, marginBottom: 10}]}>
                        * مرکز خدمات داتیس *
                    </Text>
                    {renderSingleItem("شماره پرونده:", "#000", toFaDigit(serviceDetail.DoneDetails.projectID))}
                    {renderSingleItem("آدرس:", "#000", serviceDetail.DocumentDetails.Address)}
                    {renderSingleItem("نام و تلفن:", "#000", `${serviceDetail.DocumentDetails.PhoneName} ${toFaDigit(serviceDetail.DocumentDetails.Phone)}`)}
                    {renderSingleItem("علت خرابی:", "#000", serviceDetail.DocumentDetails.DetectedFailure)}
                    {renderSingleItem("سریال:", "#000", serviceDetail.DocumentDetails.Serial)}
                    {renderSingleItem("گارانتی برد:", "#000", serviceDetail.DocumentDetails.WarS)}
                    {renderSingleItem("تاریخ تولید:", "#000", toFaDigit(serviceDetail.DocumentDetails.DOM))}
                    {renderSingleItem("زمان اعلام:", "#000", toFaDigit(serviceDetail.DocumentDetails.Date))}
                    <View style={{width: "100%"}}>
                        <Text>{toFaDigit(serviceDetail.DocumentDetails.Msg.substr(serviceDetail.DocumentDetails.Msg.length - 12, 12))}</Text>
                    </View>
                    {renderSingleItem("مبلغ دریافتی:", "#CB3434", toFaDigit(serviceDetail.DoneDetails.RecivedAmount))}
                    {renderSingleItem("جمع فاکتور:", "#CB3434", toFaDigit(serviceDetail.DoneDetails.InvoiceAmount))}
                    {renderSingleItem("نوع سرویس:", "#CB3434", getServiceType(serviceDetail.DoneDetails.ServiceType))}
                    {renderSingleItem("نتیجه سرویس:", "#CB3434", getServiceResult(serviceDetail.DoneDetails.Result))}
                </View>)}
                <View style={Styles.footerButtonsContainerstyle}>
                    <TouchableOpacity style={Styles.buttonStyle}>
                        <Text style={Styles.buttonTextStyle}>
                            تسویه به حساب شرکت
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.buttonStyle}>
                        <Text style={Styles.buttonTextStyle}>
                            تسویه به حساب شخصی
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={Styles.imageIconContainerStyle}>
                    <Icon name={"camera-alt"} style={{color:"#000", fontSize:35, marginHorizontal: 7}} onPress={
                        () => ImagePicker.launchCamera({}, response =>{setFactorImage(response.data)})}/>
                    <Icon name={"file-upload"} style={{color:"#000", fontSize:35, marginHorizontal:7}} onPress={
                        ()=>ImagePicker.launchImageLibrary({},response=>{setFactorImage(response.data)})}/>
                </View>
                {!!factorImage && (
                    <Image
                        source={{uri: `data:image/gif;base64,${factorImage}`}}
                        style={{width:pageWidth*0.8, height:pageWidth*0.8, marginTop:15}}/>
                )}
            </View>)}
        </ScrollView>
    )
}

const Styles = StyleSheet.create({
    contentContainerStyle:{
        backgroundColor:"#fff",
        width:"93%",
        height:pageHeight*0.66,
        justifyContent:"center",
        alignItems:"flex-end",
        padding:10
    },
    singleItemContainerstyle:{
        width: "100%",
        marginVertical:5,
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "flex-end"
    },
    itemLabelStyle:{
        fontSize:14,
        fontWeight:"bold",
        marginLeft:10
    },
    itemLabelStyle2:{
        fontSize:14,
        fontWeight:"bold",
        marginLeft:10,
        color:"#CB3434"
    },
    footerButtonsContainerstyle:{
        flexDirection: "row",
        width:"93%",
        alignItems:"center",
        justifyContent:"space-between",
        height:pageHeight*0.1,
    },
    buttonStyle:{
        width:"45%",
        height:"75%",
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#660000"
    },
    buttonTextStyle:{
        fontSize:14,
        color:"#fff",
        textAlign:"center",
        fontWeight:"bold"
    },
    imageIconContainerStyle:{
        flexDirection:"row",
        width:"100%",
        height: pageHeight*0.09,
        justifyContent:"center",
        alignItems:"center"
    }
})

export default RemainingServiceDetail;