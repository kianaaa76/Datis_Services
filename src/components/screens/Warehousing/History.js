import React,{useEffect, useState} from "react";
import {TextInput, View, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CheckBox from "@react-native-community/checkbox";
import Octicons from "react-native-vector-icons/Octicons";
import {normalize} from "../../utils/utilities";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;

const History = ()=>{
    const [historyList, setHistoryList] = useState([
        {
            Id:1,
        Objects:[
            {
                objectName:"objectTest1",
                count:3,
                versions:[
                    {
                        versionName:"v3",
                        serialList:["TEST1234567", "TEST44444444"],
                        count:2
                    },
                    {
                        versionName:"v4",
                        serialList:["TEST1234555"],
                        count: 1
                    }
                ],
                type: 1
            },
            {
                objectName: "objectTest2",
                count:2,
                versions: [
                    {
                        versionName:"v1",
                        serialList: [],
                        count: 1
                    },
                    {
                        versionName:"v2",
                        serialList: [],
                        count: 1
                    }
                ],
                type: 1
            }
        ],
            date:"1399/12/11",
            interchangeType:1,  //1 for received 0 for sent
            isExpanded: false
        },
        {
            Id:2,
            Objects:[
                {
                    objectName: "objectTest2",
                    count:1,
                    versions: [
                        {
                            versionName:"v5",
                            serialList: ["test2222222"],
                            count: 1
                        }
                    ],
                    type:1   // 1 for new objects and 0 for failed objects
                },
                {
                    objectName:"objectTest1",
                    count:3,
                    versions:[
                        {
                            versionName: "v6",
                            serialList:[],
                            count:2
                        },
                        {
                            versionName: "v7",
                            serialList:[],
                            count: 1
                        }
                    ],
                    type: 0
                }
            ],
            date:"1399/12/10",
            interchangeType:0,  //1 for received 0 for sent
            isExpanded: false
        }
    ]);

    const Separator = ({color}) => <View style={[Styles.separator,{borderBottomColor:color}]} />;

    return(
        <View style={{flex:1, paddingHorizontal: 5}}>
            <View style={Styles.searchbarContainerStyle}>
                <TextInput
                    style={Styles.textinputStyle}
                    placeholder={"شماره درخواست مورد نظر خود را جستجو کنید..."}
                    onChangeText={(text)=>{
                    }}
                />
                <FontAwesome
                    name={'search'}
                    style={{fontSize: 25, color: '#000'}}
                />
            </View>
            <FlatList style={{flex:1, paddingHorizontal: 10}} data={historyList} renderItem={({item, index})=>(
                <View style={Styles.cardHeaderStyle}>
                    <TouchableOpacity style={{ width:"100%", justifyContent:"center", alignItems:"center"}} onPress={()=>{
                        let tmp = [...historyList];
                        tmp[index] = {...item, isExpanded: !item.isExpanded}
                        setHistoryList(tmp);
                    }}>
                        <View style={{flexDirection: "row", width:"100%", justifyContent:"space-between"}}>
                            <Text style={Styles.labelTextStyle}>
                                وضعیت: {!!item.interchangeType?"دریافت شده":"ارسال شده"}
                            </Text>
                            <Text style={Styles.labelTextStyle}>
                                شناسه: {item.Id}
                            </Text>
                        </View>
                        <View style={{width:"100%", flexDirection: "row", justifyContent:"flex-end", alignItems:"center" }}>
                            <Text style={Styles.labelTextStyle}>
                                تاریخ: {item.date}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    {item.isExpanded ? (
                        <>
                            <Separator color={"black"}/>
                            {item.Objects.map((obj,objIndex)=>(
                                <>
                                <View style={{padding: 5, width:"100%"}}>
                                    <View style={{width:"100%", flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom: 10, backgroundColor: "#E6E6E6", padding:5 }}>
                                        <Text style={Styles.labelTextStyle}>
                                            تعداد کل: {obj.count}
                                        </Text>
                                        <View style={{flexDirection: "row", alignItems:"center"}}>
                                        <Text style={Styles.labelTextStyle}>
                                            نام قطعه: {obj.objectName}
                                        </Text>
                                        <FontAwesome5
                                            name={!!obj.type ? 'arrow-right' : "arrow-left"}
                                            style={{color: !!obj.type ? 'green' : "red", fontSize: normalize(20), width:pageWidth*0.08, justifyContent:"center", textAlign:"center"}}
                                        />
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            alignItems: 'flex-start',
                                             justifyContent: 'space-around',
                                        }}>
                                                {obj.versions.map((version, versionIndex)=>(
                                                    <View style={{flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", width:"100%", marginBottom: 10}}>
                                                        <View>
                                                        {version.serialList.length === 0 ? (
                                                            <Text style={Styles.labelTextStyle}>
                                                                تعداد: {version.count}
                                                            </Text>
                                                        ) : version.serialList.map((serial)=>(
                                                            <Text>
                                                                {serial}
                                                            </Text>
                                                            ))}
                                                        </View>
                                                        <Text style={[Styles.labelTextStyle,{marginRight:pageWidth*0.08}]}>نام نسخه: {version.versionName}</Text>
                                                    </View>
                                                ))}
                                    </View>
                                </View>
                                    {(!!item.interchangeType || objIndex!==item.Objects.length -1) && <Separator color={"#C0C0C0"}/>}
                                    </>
                            ))}
                            {!!item.interchangeType && (
                                <TouchableOpacity style={{width:pageWidth*0.3, height: pageHeight*0.08, backgroundColor:'#660000', justifyContent:"center", alignItems:"center", borderRadius: 15}}>
                                    <Text style={{color:"white", fontSize:14, fontFamily:'IRANSansMobile_Medium'}}>
                                        دریافت شد
                                    </Text>
                                </TouchableOpacity>)}
                        </>
                    ):null}
                </View>
            )}/>
        </View>
    );
}

const Styles = StyleSheet.create({
    searchbarContainerStyle: {
        marginTop:10,
        width:"94%",
        height:pageHeight*0.08,
        backgroundColor: "#fff",
        borderRadius:30,
        elevation:5,
        alignSelf:"center",
        marginBottom:5,
        paddingHorizontal:10,
        paddingVertical:7,
        flexDirection:"row",
        justifyContent:'space-around',
        alignItems:"center"
    },
    textinputStyle:{
        width:"84%",
        height:"100%",
        fontFamily:'IRANSansMobile_Light',
        fontSize:12,
    },
    cardHeaderStyle: {
        width: pageWidth * 0.9,
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        alignSelf: 'center',
        backgroundColor: "white"
    },
    labelTextStyle:{
        fontSize: 13,
        fontFamily: "IRANSansMobile_Medium"
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: "#000",
        borderBottomWidth: 1,
        width: '100%',
    },
})

export default History;