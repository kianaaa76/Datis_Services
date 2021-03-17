import React,{useEffect, useState} from "react";
import {TextInput, View, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, ToastAndroid, ActivityIndicator} from "react-native";
import {requestsHistory} from "../../../actions/api";
import {useSelector, useDispatch} from "react-redux";
import {LOGOUT} from "../../../actions/types";
import {SearchIcon,ArrowDownIcon, ArrowUpIcon} from "../../../assets/icons/index";

const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;

const History = ({navigation})=>{
    const selector = useSelector(state=>state);
    const dispatch = useDispatch();
    const [historyList, setHistoryList] = useState([]);
    const [constHistoryList, setConstHistoryList] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    useEffect(()=>{
        getHistory();
    },[])

    const Separator = ({color}) => <View style={[Styles.separator,{borderBottomColor:color}]} />;

    const getHistory = ()=>{
        setListLoading(true);
        requestsHistory(selector.token).then(data=>{
            if (data.errorCode === 0){
                let tempList = [];
                data.result.map(req=>{
                    let objectList = [];
                    req.Objects.map(obj=>{
                        let serialList = [];
                        let versionId = null;
                        let versionList = obj.Versions;
                        obj.Versions.map((vers, index)=>{
                            if (!!vers.Serial) {
                                if (vers.VersionId === versionId){
                                    serialList.push(vers.Serial);
                                } else {
                                    if (!versionId){
                                        versionId = vers.VersionId;
                                        serialList.push(vers.Serial);
                                        delete vers["Serial"];
                                        delete vers["Count"];
                                        versionList[index] = {...vers, SerialList: serialList, Count: serialList.length};
                                    } else {
                                        serialList.push(vers.Serial);
                                        versionList.splice(index, 1);
                                        serialList = [];
                                    }
                                }
                            }
                        })
                        if (!!obj.Versions[0].Serial) {
                            objectList.push({...obj, Versions: versionList})
                        } else {
                            objectList.push(obj);
                        }
                    });
                    tempList.push({...req, Objects:objectList, isExpanded:false});
                });
                setHistoryList(tempList);
                setConstHistoryList(tempList);
                setListLoading(false);
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                setListLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setListLoading(false);
            }
        })
    };

    const getStateName = (code)=>{
        switch (code) {
            case 120:
                return "ارسال شده";
            case 125:
                return "تحویل داده شده";
            case 20:
                return "لغو شده";
            case 106:
                return "منتظر تایید";
            case 110:
                return "آماده ارسال";
            default:
                return "نامعلوم";
        }
    };

    const handleSearchRequest = (searchText)=>{
        setListLoading(true);
        if (!!searchText) {
            let tmpList = constHistoryList.filter(item => item.ID.toString().includes(searchText));
            setHistoryList(tmpList);
            setListLoading(false);
        } else {
            getHistory();
        }
    }

    return(
        <View style={{flex:1, paddingHorizontal: 5}}>
            <View style={Styles.searchbarContainerStyle}>
                <TextInput
                    style={Styles.textinputStyle}
                    placeholder={"شماره درخواست مورد نظر خود را جستجو کنید..."}
                    onChangeText={(text)=>{
                        handleSearchRequest(text);
                    }}
                />
                {SearchIcon({
                    color: '#000'
                })}
            </View>
            {listLoading ? (
                <View style={{flex:1, justifyContent:"center", alignItem:"center"}}>
                    <ActivityIndicator color={"#660000"} size={"large"}/>
                </View>
            ):(<FlatList style={{flex: 1, paddingHorizontal: 10}} data={historyList} keyExtractor={item=>item.ID.toString()} renderItem={({item, index}) => (
                <View style={Styles.cardHeaderStyle}>
                    <TouchableOpacity
                        style={{width: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row"}}
                        onPress={() => {
                            let tmp = [...historyList];
                            tmp[index] = {...item, isExpanded: !item.isExpanded}
                            setHistoryList(tmp);
                        }}>
                        <View style={{width: "85%"}}>
                            <View style={{flexDirection: "row", width: "100%", justifyContent: "space-between"}}>
                                <Text style={Styles.labelTextStyle}>
                                    وضعیت: {getStateName(item.State)}
                                </Text>
                                <Text style={Styles.labelTextStyle}>
                                    شناسه: {item.ID}
                                </Text>
                            </View>
                            <View style={{
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                alignItems: "center"
                            }}>
                                <Text style={Styles.labelTextStyle}>
                                    تاریخ: {item.Date}
                                </Text>
                            </View>
                        </View>
                        <View style={{width: "15%", justifyContent: "center", alignItems: "center"}}>
                            {!!item.Type ? ArrowDownIcon() : ArrowUpIcon()}
                        </View>
                    </TouchableOpacity>
                    {item.isExpanded ? (
                        <>
                            <Separator color={"black"}/>
                            {item.Objects.map((obj, objIndex) => (
                                <>
                                    <View style={{padding: 5, width: "100%"}}>
                                        <View style={{
                                            width: "100%",
                                            flexDirection: "row",
                                            alignItems: "flex-start",
                                            justifyContent: "space-between",
                                            marginBottom: 10,
                                            backgroundColor: "#E6E6E6",
                                            padding: 5
                                        }}>
                                            <Text style={Styles.labelTextStyle}>
                                                تعداد کل: {obj.Total}
                                            </Text>
                                            <View style={{flexDirection: "row", alignItems: "flex-start", width:"70%", flexShrink:1, justifyContent:'flex-end'}}>
                                                <Text style={Styles.labelTextStyle}>
                                                    نام قطعه: {obj.Object_Name}
                                                </Text>
                                                <View style={{width:14, height:14, borderRadius: 7, backgroundColor: !!obj.Broken ? 'red' : "green", marginHorizontal: 5, marginTop: 5}}/>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-around',
                                            }}>
                                            {obj.Versions.map((version, versionIndex) => !version.Serial && (
                                                <View style={{
                                                    flexDirection: "row",
                                                    alignItems: "flex-start",
                                                    justifyContent: "space-between",
                                                    width: "100%",
                                                    marginBottom: 10
                                                }}>
                                                    <View>
                                                        {!version.SerialList ? (
                                                            <Text style={Styles.labelTextStyle}>
                                                                تعداد: {version.Count}
                                                            </Text>
                                                        ) : version.SerialList.map((serial) => (
                                                            <Text>
                                                                {serial}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                    <Text
                                                        style={[Styles.labelTextStyle, {marginRight: pageWidth * 0.08}]}>نام
                                                        نسخه: {version.Version_Name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            ))}
                        </>
                    ) : null}
                </View>
            )}/>)}
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
