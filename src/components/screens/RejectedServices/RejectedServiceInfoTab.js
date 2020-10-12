import React from "react";
import {View, StyleSheet, Text, ScrollView} from "react-native";
import {toFaDigit} from "../../utils/utilities";

const ServiceInfoTab = ({serviceData}) => {
    const data = serviceData;
    const renderSingleRow = (title, text) => {
        return (
            <View style={Styles.singleRowStyle}>
                {!!text ? (
                    <Text style={Styles.textStyle}>
                        {text}
                    </Text>
                ) : (
                    <Text style={Styles.textStyle}>
                        -
                    </Text>
                )}
                <Text style={Styles.titleTextStyle}>
                    {`${title}:   `}
                </Text>
            </View>
        )
    }
    return (
        <ScrollView style={{flex:1, padding:10}}>
            {renderSingleRow("شماره پرونده",toFaDigit(data.projectID))}
            {renderSingleRow("نام", data.DocText.PhoneName)}
            {renderSingleRow("شماره تماس", toFaDigit(data.DocText.Phone))}
            {renderSingleRow("سریال", data.DocText.Serial)}
            {renderSingleRow("گارانتی برد", data.DocText.WarS)}
            {renderSingleRow("تاریخ تولید", toFaDigit(data.DocText.DOM))}
            {renderSingleRow("آدرس", data.DocText.Address)}
            {renderSingleRow("علت خرابی", data.DocText.DetectedFailure)}
            {renderSingleRow("قطعات مورد نیاز", data.DocText.parts)}
            {renderSingleRow("زمان اعلام", toFaDigit(data.DocText.Date))}
        </ScrollView>
    )
}

const Styles = StyleSheet.create({
    contentStyle: {
        backgroundColor:"#fff",
        flex:1
    },
    singleRowStyle: {
        flexDirection:"row",
        justifyContent:"flex-end",
        width: "100%",
        height: 20,
        marginBottom:15
    },
    titleTextStyle: {
        fontSize:15,
        fontWeight:"bold",
        width:110,
    },
    textStyle: {
        fontSize: 15,
        textAlign:"center",
    }
})

export default ServiceInfoTab;