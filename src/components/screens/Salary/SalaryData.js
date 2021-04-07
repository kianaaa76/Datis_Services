import React,{useEffect, useState} from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    ToastAndroid,
    ActivityIndicator,
    TextInput
} from "react-native";
import Header from "../../common/Header";
import {getSingleReciept} from "../../../actions/api";
import {useSelector, useDispatch} from "react-redux";
import {LOGOUT} from "../../../actions/types";
import NumberFormat from 'react-number-format';

const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;

const SalaryData = ({navigation})=>{
    const selector = useSelector(state=>state);
    const dispatch = useDispatch();
    const reciept = navigation.getParam('reciept');
    const [paymentDetail, setPaymentDetail] = useState({});
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(()=>{
        if (!!reciept){
            getRecieptData();
        }
    },[]);

    const getRecieptData = ()=>{
        getSingleReciept(selector.token, reciept.ID).then(data=>{
            if (data.errorCode === 0){
                setPaymentDetail(data.result);
                setDataLoading(false);
            } else if (data.errorCode === 3){
                setDataLoading(false);
                dispatch({
                    type: LOGOUT,
                });
                navigation.navigate('SignedOut');
            } else {
                setDataLoading(false);
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
        })
    }


    const renderDataItem = (title, value, hasRial)=>{
        return(
            <View style={Styles.dataItemContainerStyle}>
                {hasRial &&(<Text style={Styles.rialStyle}>
                    ریال
                </Text>)}
                {hasRial ? (
                    <NumberFormat thousandSeparator={true} renderText={value => (
                        <Text style={Styles.itemValueTextStyle}>
                            {value}
                        </Text>
                    )} value={value} displayType={'text'}/>
                ) : (<Text style={Styles.itemValueTextStyle}>
                    {value.toString().length > 0 ? value : '-'}
                </Text>)}
                <Text style={Styles.itemTitleTextStyle}>
                    {title}
                </Text>
            </View>
        );
    };

    return(
        <View style={{flex:1}}>
            <Header headerText={"صورت حساب"}/>
            {dataLoading ? (
                <View style={{flex:1}}>
                    <ActivityIndicator size={"large"} color={"#660000"}/>
                </View>
            ) :(<View style={Styles.contentContainerStyle}>
                {renderDataItem("دوره: ", reciept.Name, false)}
                {renderDataItem(" دستمزد پرونده ها: ", paymentDetail.ProjectsWage, true)}
                {renderDataItem(" دستمزد ماموریت ها: ", paymentDetail.MissionWage, true)}
                {renderDataItem(" پاداش: ", paymentDetail.Reward, true)}
                {renderDataItem(" مانده از قبل: ", paymentDetail.PreBalance, true)}
                {renderDataItem(" دریافتی های مستقیم: ", paymentDetail.ReceivedAmount, true)}
                {renderDataItem(paymentDetail.PureWage >= 0 ? " خالص پرداختی: " : "بدهی شما به شرکت: ", paymentDetail.PureWage, true)}
                {renderDataItem(" شماره حساب واریزی: ", paymentDetail.BankAccountNumber, false)}
                <TouchableOpacity style={Styles.detailButtonStyle} onPress={() => navigation.navigate("SalaryDetail", {recieptID:reciept.ID})}>
                    <Text style={Styles.buttonTextStyle}>
                        جزِئیات دستمزد
                    </Text>
                </TouchableOpacity>
            </View>)}
        </View>
    );
}

const Styles = StyleSheet.create({
    contentContainerStyle:{
        flex:1,
        padding:10,
        justifyContent:"space-between"
    },
    dataItemContainerStyle:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:'flex-end'
    },
    itemTitleTextStyle:{
        fontFamily:'IRANSansMobile_Medium'
    },
    itemValueTextStyle:{
        fontFamily: "IRANSansMobile_Light"
    },
    rialStyle:{
        fontFamily: "IRANSansMobile_Light",
        marginRight: 5
    },
    detailButtonStyle:{
        width: pageWidth *0.28,
        height:pageHeight*0.08,
        backgroundColor:"#660000",
        justifyContent: "center",
        alignItems: "center",
        borderRadius:10,
        alignSelf:"center",
    },
    buttonTextStyle:{
        color:"#fff",
        textAlign:"center",
        fontFamily:"IRANSansMobile_Medium"
    }
})

export default SalaryData;
