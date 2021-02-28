import React,{useEffect, useState} from "react";
import {View, StyleSheet, Dimensions, ToastAndroid, ActivityIndicator} from "react-native";
import Header from "../../common/Header";
import {TabBar, TabView} from "react-native-tab-view";
import {normalize} from "../../utils/utilities";
import ServicesTab from "./ServicesTab";
import MissionsTab from "./MissionsTab";
import {useSelector, useDispatch} from "react-redux";
import {getRecieptDetails} from "../../../actions/api";
import {LOGOUT} from "../../../actions/types";

const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;

const SalaryDetail = ({navigation})=>{
    const selector = useSelector(state=>state);
    const dispatch = useDispatch();
    const recieptID = navigation.getParam("recieptID");
    const [index, setIndex] = useState(1);
    const [routes] = useState([
        {key: 'first', title: 'ماموریت ها'},
        {key: 'second', title: 'سرویس ها'},
    ]);
    const [missions, setMissions] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        if (!!recieptID) {
            getBillDetail();
        }
    },[]);

    const getBillDetail = ()=>{
        getRecieptDetails(selector.token, recieptID).then(data=>{
            if (data.errorCode === 0){
                setMissions(data.result.Missions);
                setProjects(data.result.Projects);
                setLoading(false);
            } else if (data.errorCode === 3){
                setLoading(false);
                dispatch({
                    type: LOGOUT,
                });
                navigation.navigate('SignedOut');
            } else {
                setLoading(false);
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
        })
    }

    const renderScene = () => {
        switch (routes.key) {
            case 'first':
                return (
                    <MissionsTab missionList={missions}/>
                );
            case 'second':
                return (
                    <ServicesTab projectList={projects}/>
                );
            default:
                return (
                    <ServicesTab projectList={projects}/>
                );
        }
    };

    return(
        <View style={{flex:1}}>
            <Header headerText={"جزئیات فیش"}/>
            {loading ? (
                <View style={{flex:1}}>
                    <ActivityIndicator size={"large"} color={"#660000"}/>
                </View>
            ) :(<View style={Styles.contentContainerStyle}>
                <TabView
                    renderTabBar={props => (
                        <TabBar
                            {...props}
                            style={{backgroundColor: '#FFFFFF', height: pageHeight * 0.07}}
                            labelStyle={{
                                color: '#000',
                                textAlign: 'center',
                                fontSize: normalize(15),
                                fontFamily: 'IRANSansMobile_Medium',
                            }}
                            indicatorStyle={{backgroundColor: '#660000'}}
                        />
                    )}
                    navigationState={{index, routes}}
                    style={{flex: 1}}
                    renderScene={({route})=>renderScene(route)}
                    onIndexChange={Index => setIndex(Index)}
                    lazy="false"
                />
            </View>)}
        </View>
    );
}

const Styles = StyleSheet.create({
    contentContainerStyle:{
        flex:1
    }
})

export default SalaryDetail;
