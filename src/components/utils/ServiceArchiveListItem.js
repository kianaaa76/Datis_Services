import React, {useState, useEffect} from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import {toFaDigit} from '../utils/utilities';
import {unsettledServiceDetail} from "../../actions/api";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionListItem = ({item, navigation}) => {
    const shadowOpt = {
        width: pageWidth * 0.9,
        height: pageHeight * 0.1,
        color: '#000',
        radius: 5,
        opacity: 0.1,
        x: 2,
        y: 3,
        style: {justifyContent: 'center', alignItems: 'center', marginVertical: 6},
    };

    const getState = (stateNum) =>{
        switch (stateNum) {
            case 0:
                return "تکمیل ثانویه";
            case 200:
                return "پیش پرداخت و تایید مشتری";
            case 300:
                return "در حال انجام سرویس";
            case 310:
                return "رد شده";
            case 320:
                return "تایید اطلاعات";
            case 340:
                return "تایید کارشناس";
            case 400:
                return "تایید پرداخت";
            case 401:
                return "یگیری مالی";
            case 402:
                return "مسدود مالی";
            case 450:
                return "مانده دار";
            case 500:
                return "تایید مالی";
            case 600:
                return "تمام شده";
            case 700:
                return "لغو شده";
            default:
                return "";
        }
    }

    const getStateColor = (stateNum) => {
        switch (stateNum) {
            case 0:
                return "#21B767";
            case 200:
                return "#21B767";
            case 300:
                return "#21B767";
            case 310:
                return "red";
            case 320:
                return "#21B767";
            case 340:
                return "#21B767";
            case 400:
                return "#21B767";
            case 401:
                return "#21B767";
            case 402:
                return "#21B767";
            case 450:
                return "#339FDE";
            case 500:
                return "#21B767";
            case 600:
                return "#21B767";
            case 700:
                return "red";
            default:
                return "#000";
        }
    }

    const Item = item.item;
    return (
        <View style={{flex: 1}}>
            <BoxShadow setting={shadowOpt}>
                <TouchableWithoutFeedback
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    onPress={() => {
                        navigation.navigate('ServiceArchiveDetail', {service: Item})
                    }}>
                    <View style={{
                        width: pageWidth * 0.9,
                        height: pageHeight * 0.1,
                        backgroundColor: '#fff',
                        padding: 10,
                        marginVertical: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(158, 150, 150, 0.3)',
                    }}>
                        <View style={Styles.firstRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text style={{color: getStateColor(Item.State), fontSize:13}}>{getState(Item.State)}</Text>
                                <Text style={{fontWeight: 'bold'}}>وضعیت: </Text>
                            </View>
                            <View style={Styles.singleItemStyle}>
                                <Text>{Item.Name}</Text>
                                <Text style={{fontWeight: 'bold'}}>نام: </Text>
                            </View>
                        </View>
                        <View style={Styles.firstRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.projectID)}</Text>
                                <Text style={{fontWeight: 'bold'}}>پروژه: </Text>
                            </View>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.cell)}</Text>
                                <Text style={{fontWeight: 'bold'}}>همراه: </Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </BoxShadow>
        </View>
    );
};

const Styles = StyleSheet.create({

    firstRowContainerStyle: {
        width: '100%',
        height: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    secondRowContainerStyle: {
        width: '100%',
        height: '50%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    singleItemStyle: {
        flexDirection: 'row',
    },
});

export default MissionListItem;
