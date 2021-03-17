import React, {useEffect, useState} from "react";
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    TouchableOpacity,
    ToastAndroid,
    ActivityIndicator,
    BackHandler
} from "react-native";
import Header from "../../common/Header";
import {getRecieptList} from "../../../actions/api";
import {useSelector, useDispatch} from "react-redux";
import {LOGOUT} from "../../../actions/types";
import {ArrowLeftIcon} from "../../../assets/icons/index";
import DatePickerDropDown from "../../common/DatePickerDropDown";
import moment from 'moment-jalaali';

const Salary = ({navigation}) => {
    const selector = useSelector(state => state);
    const dispatch = useDispatch();
    const [userToken, setUserToken] = useState("");
    const getPeriodList = (token) => {
        getRecieptList(token).then(response => {
            if (response.errorCode === 0) {
                setPeriods(response.result);
                setListLoading(false);
                setHasUpdatedList(true);
            } else if (response.errorCode === 3) {
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
        }).catch((e) => {
            setListLoading(false);
            ToastAndroid.showWithGravity(
                "مشکلی پیش آمد.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        })
    }


    const [periods, setPeriods] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [monthList] = useState([
        {id: 0, name: "همه"},
        {id: 1, name: "فروردین"},
        {id: 2, name: "اردیبهشت"},
        {id: 3, name: "خرداد"},
        {id: 4, name: "تیر"},
        {id: 5, name: "مرداد"},
        {id: 6, name: "شهریور"},
        {id: 7, name: "مهر"},
        {id: 8, name: "آبان"},
        {id: 9, name: "آذر"},
        {id: 10, name: "دی"},
        {id: 11, name: "بهمن"},
        {id: 12, name: "اسفند"}
    ]);
    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [showMonthList, setShowMonthList] = useState(false);
    const [showYearList, setShowYearList] = useState(false);
    const [hasUpdatedList, setHasUpdatedList] = useState(false);

    useEffect(() => {
        let date = new moment(Date.now()).format('jYYYY/jM/jD HH:mm:ss');
        let time = date.split('/');
        let tempList = [{id: 0, name: "همه"}];
        let year = 1399;
        while (year <= parseInt(time[0])) {
            tempList.push({id: tempList.length + 1, name: year});
            year += 1;
        }
        setYearList(tempList);
    }, []);

    useEffect(() => {
        getPeriodList(selector.token);
        setHasUpdatedList(true);
    }, [selector.token])

    return (
        <View style={{flex: 1}}>
            <Header headerText={"حقوق من"}/>
            <View style={Styles.contentContainerStyle}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Text style={Styles.serviceManNameStyle}>
                        {selector.serviceManName}
                    </Text>
                    <Text style={Styles.serviceManNameLabelStyle}>
                        نام سرویس کار:
                    </Text>
                    {ArrowLeftIcon({
                        color: "#000",
                        style: {marginLeft: 10},
                    })}
                </View>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
                    <Text style={Styles.serviceManNameLabelStyle}>
                        دوره های پرداخت:
                    </Text>
                    {ArrowLeftIcon({
                        color: "#000",
                        style: {marginLeft: 10},
                    })}
                </View>
                {/*<View style={Styles.datePickerContainerStyle}>*/}
                {/*    <DatePickerDropDown*/}
                {/*        showList={showYearList}*/}
                {/*        setShowList={value=>setShowYearList(value)}*/}
                {/*        selectedValue={!!selectedYear ? selectedYear.name : null}*/}
                {/*        list={yearList}*/}
                {/*        onSelect={value => {*/}
                {/*            setSelectedYear(value);*/}
                {/*        }}*/}
                {/*        placeholder={*/}
                {/*            "سال انتخابی"*/}
                {/*        }*/}
                {/*    />*/}
                {/*    <DatePickerDropDown*/}
                {/*        showList={showMonthList}*/}
                {/*        setShowList={value=>setShowMonthList(value)}*/}
                {/*        selectedValue={!!selectedMonth ? selectedMonth.name : null}*/}
                {/*        list={monthList}*/}
                {/*        onSelect={value => {*/}
                {/*            setSelectedMonth(value);*/}
                {/*        }}*/}
                {/*        placeholder={*/}
                {/*            "ماه انتخابی"*/}
                {/*        }*/}
                {/*    />*/}
                {/*</View>*/}
                {listLoading ? (
                    <View style={{flex: 1}}>
                        <ActivityIndicator size={"large"} color={"#660000"}/>
                    </View>
                ) : (<FlatList style={{flex: 1, marginTop: 7}} data={periods} renderItem={({item}) => (
                    <TouchableOpacity style={Styles.listItemContainerStyle}
                                      onPress={() => navigation.navigate("SalaryData", {reciept: item})}>
                        <Text style={{fontFamily: "IRANSansMobile_Light"}}>
                            {item.Name}
                        </Text>
                    </TouchableOpacity>
                )} keyExtractor={item => item.ID}/>)}
            </View>
        </View>
    );
}

const Styles = StyleSheet.create({
    serviceManNameStyle: {
        fontFamily: "IRANSansMobile_Light",
        marginRight: 10
    },
    serviceManNameLabelStyle: {
        fontFamily: "IRANSansMobile_Medium"
    },
    contentContainerStyle: {
        flex: 1,
        padding: 10,
    },
    listItemContainerStyle: {
        width: "96%",
        height: 50,
        backgroundColor: "#fff",
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        alignSelf: "center",
        zIndex: 1
    },
    datePickerContainerStyle: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around"
    }
})

export default Salary;
