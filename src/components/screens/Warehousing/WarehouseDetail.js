import React,{useEffect, useState} from "react";
import {View, Text, StyleSheet, Dimensions} from "react-native";
import Header from "../../common/Header";
import {TabView, TabBar} from 'react-native-tab-view';
import WarehouseHandling from "./WarehouseHandling";
import History from "./History";
import RequestGoods from "./RequestGoods";
import {normalize} from "../../utils/utilities";

const pageHeight = Dimensions.get("screen").height;

const WarehouseDetail = ()=>{
const [index, setIndex] = React.useState(2);
  const [routes] = React.useState([
      {key: 'third', title: 'ارسال / دریافت'},
    {key: 'second', title: 'درخواست کالا'},
    {key: 'first', title: 'انبارگردانی'}
  ]);
  const renderScene = ({route}) => {
    switch (route.key) {
        case 'first':
        return (
          <WarehouseHandling setTabIndex={index=>setIndex(index)}/>
        );
      case 'second':
        return (
          <RequestGoods/>
        );
      case 'third':
        return (
          <History/>
        );
      default:
        return null;
    }
  };

    return(
        <View style={Styles.containerStyle}>
            <Header headerText="انبارداری"/>
            <TabView
          renderTabBar={props => (
            <TabBar
              {...props}
              style={{backgroundColor: '#FFFFFF', height: pageHeight * 0.07}}
              labelStyle={{
                color: '#000',
                textAlign: 'center',
                fontSize: normalize(12),
                fontFamily: 'IRANSansMobile_Light',
              }}
              indicatorStyle={{backgroundColor: '#660000'}}
            />
          )}
          navigationState={{index, routes}}
          style={{flex: 1}}
          renderScene={renderScene}
          onIndexChange={Index => setIndex(Index)}
          lazy="false"
        />
        </View>
    )
};

const Styles = StyleSheet.create({
    containerStyle: {
        flex:1
    },
    contentContainerStyle:{
        flex:1
    }
})

export default WarehouseDetail;
