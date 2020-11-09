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

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RemainingServiceListItem = ({item, navigation}) => {
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

    const Item = item.item;
    return (
                <TouchableWithoutFeedback
                    onPress={() => {
                        navigation.navigate('RemainingServiceDetail', {service: Item})
                    }}>
                    <View style={{
                        width: pageWidth * 0.9,
                        height: pageHeight * 0.1,
                        backgroundColor: '#fff',
                        padding: 10,
                        marginVertical: 4,
                        marginHorizontal:3,
                        justifyContent: 'center',
                        alignItems: 'center',
                        elevation:3
                    }}>
                        <View style={Styles.secondRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text>{toFaDigit(Item.projectID)}</Text>
                                <Text style={{fontWeight: 'bold', fontSize:14}}>پروژه: </Text>
                            </View>
                        </View>
                        <View style={Styles.secondRowContainerStyle}>
                            <View style={Styles.singleItemStyle}>
                                <Text style={{color:"#CB3434"}}>{Item.remaind == 0 ? `${toFaDigit(0)} ریال`:` ${toFaDigit(Item.remaind)}-  ریال`}</Text>
                                <Text style={{fontWeight: 'bold', fontSize:14, color:"#CB3434"}}>مانده: </Text>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

    );
};

const Styles = StyleSheet.create({
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

export default RemainingServiceListItem;
