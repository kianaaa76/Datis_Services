import React,{useEffect, useState} from "react";
import {View, StyleSheet, Text, FlatList, TouchableOpacity, ToastAndroid, ActivityIndicator} from "react-native";
import Header from "../../common/Header";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {normalize} from "../../utils/utilities";
import {getRecieptList} from "../../../actions/api";
import {useSelector, useDispatch} from "react-redux";
import {LOGOUT} from "../../../actions/types";

const Salary = ({navigation})=>{
    const selector = useSelector(state=>state);
    const dispatch = useDispatch();

    const getPeriodList = ()=>{
        getRecieptList(selector.token).then(data=>{
            console.warn("LLLLLL", data);
            if (data.errorCode === 0){
                setPeriods(data.result);
                setListLoading(false);
            } else if (data.errorCode === 3) {
                setListLoading(false);
                dispatch({
                    type: LOGOUT,
                });
                navigation.navigate('SignedOut');
            } else {
                setListLoading(false);
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
        })
    }

    const [periods, setPeriods] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    useEffect(()=>{
        getPeriodList();
    },[]);

    return(
        <View style={{flex:1}}>
            <Header headerText={"حقوق من"}/>
            <View style={Styles.contentContainerStyle}>
                <View style={{flexDirection:"row", alignItems:"center", justifyContent:"flex-end"}}>
                    <Text style={Styles.serviceManNameStyle}>
                        {selector.serviceManName}
                    </Text>
                    <Text style={Styles.serviceManNameLabelStyle}>
                        نام سرویس کار:
                    </Text>
                    <FontAwesome5 name='arrow-left'
                                  style={{color: "black", fontSize: normalize(20), marginLeft:10}}/>
                </View>
                <View style={{flexDirection:"row", alignItems:"center", justifyContent:"flex-end"}}>
                    <Text style={Styles.serviceManNameLabelStyle}>
                        دوره های پرداخت:
                    </Text>
                    <FontAwesome5 name='arrow-left'
                                  style={{color: "black", fontSize: normalize(20), marginLeft:10}}/>
                </View>
                {listLoading ? (
                    <View style={{flex:1}}>
                        <ActivityIndicator size={"large"} color={"#660000"}/>
                    </View>
                ) : (<FlatList style={{flex:1, marginTop:7}} data={periods} renderItem={({item})=>(
                    <TouchableOpacity style={Styles.listItemContainerStyle} onPress={()=>navigation.navigate("SalaryData",{reciept:item})}>
                        <Text style={{fontFamily:"IRANSansMobile_Light"}}>
                            {item.Name}
                        </Text>
                    </TouchableOpacity>
                )} keyExtractor={item=>item.ID}/>)}
            </View>
        </View>
    );
}

const Styles = StyleSheet.create({
    serviceManNameStyle:{
        fontFamily: "IRANSansMobile_Light",
        marginRight:10
    },
    serviceManNameLabelStyle:{
        fontFamily: "IRANSansMobile_Medium"
    },
    contentContainerStyle:{
        flex:1,
        padding: 10,
    },
    listItemContainerStyle:{
        width:"96%",
        height:50,
        backgroundColor:"#fff",
        elevation:5,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
        alignSelf:"center"
    }
})

export default Salary;
