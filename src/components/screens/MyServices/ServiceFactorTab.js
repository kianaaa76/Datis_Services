import React,{useState, useEffect} from "react";
import {View, StyleSheet, Text, TextInput, Dimensions, ScrollView, Image} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceFactorTab = ({setInfo, info, projectId}) => {
    let dirs = RNFetchBlob.fs.dirs;

    return (
        <ScrollView style={Styles.containerStyle} contentContainerStyle={{justifyContent:"center", alignItems:"center"}}>
            <View style={Styles.rowDataStyle}>
                <Text style={Styles.rialTextStyle}>ریال</Text>
                <TextInput style={Styles.textInputStyle} onChangeText={text=> {
                    setInfo({
                        factorReceivedPrice:text,
                        factorTotalPrice: info.factorTotalPrice,
                    })
                }} value={info.factorReceivedPrice}  keyboardType="numeric"/>
                <View style={{width: 70}}>
                    <Icon name={"star"} style={{color:"red", fontSize:10}}/>
                    <Text style={Styles.labelStyle}>مبلغ دریافتی:</Text>
                </View>
            </View>
            <View style={Styles.rowDataStyle}>
                <Text style={Styles.rialTextStyle}>ریال</Text>
                <TextInput style={Styles.textInputStyle}
                           onChangeText={text=> {
                               setInfo({
                                   factorReceivedPrice: info.factorReceivedPrice,
                                   factorTotalPrice: text,
                               })
                           }}
                           value={info.factorTotalPrice}
                           keyboardType="numeric"/>
                <View style={{width: 70}}>
                    <Icon name={"star"} style={{color:"red"}}/>
                    <Text style={Styles.labelStyle}>جمع فاکتور:</Text>
                </View>
            </View>
            <View style={Styles.imageRowStyle}>
                <View style={Styles.getImageContainerViewStyle}>
                <Icon name={"camera-alt"} style={{color:"#000", fontSize:35}} onPress={
                    () => {
                        ImagePicker.launchCamera({}, response => {
                            setInfo({
                                factorReceivedPrice:info.factorReceivedPrice,
                                factorTotalPrice:info.factorTotalPrice,
                                factorImage: response.data,
                                billImage:info.billImage
                            });
                            RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${projectId}/1.png`, response.data, 'base64' )
                        })
                    }}
                />
                <Icon name={"file-upload"} style={{color:"#000", fontSize:35}} onPress={
                    ()=>{
                        ImagePicker.launchImageLibrary({},response=>{
                            setInfo({
                                factorReceivedPrice:info.factorReceivedPrice,
                                factorTotalPrice:info.factorTotalPrice,
                                factorImage: response.data,
                                billImage:info.billImage
                            });
                            RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${projectId}/1.png`,response.data, 'base64' )
                        })
                    }}/>
                </View>
                <View style={{width: 70}}>
                    <Icon name={"star"} style={{color:"red", fontSize:10}}/>
                    <Text style={Styles.labelStyle}>عکس فاکتور:</Text>
                </View>
            </View>
            {!!info.factorImage && (
                <Image
                    source={{uri: `data:image/gif;base64,${info.factorImage}`}}
                    style={{width:"100%", height:pageHeight*0.4, marginVertical:20}}/>
            )}
            <View style={Styles.imageRowStyle}>
                <View style={Styles.getImageContainerViewStyle}>
                    <Icon name={"camera-alt"} style={{color:"#000", fontSize:35}} onPress={
                        () => {
                            ImagePicker.launchCamera({}, response => {
                                setInfo({
                                    factorReceivedPrice:info.factorReceivedPrice,
                                    factorTotalPrice:info.factorTotalPrice,
                                    factorImage: info.factorImage,
                                    billImage:response.data
                                });
                                RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${serviceID}/2.png`,response.data, 'base64' )
                            })
                        }}
                    />
                    <Icon name={"file-upload"} style={{color:"#000", fontSize:35}} onPress={
                        ()=>ImagePicker.launchImageLibrary({},response=>{
                            setInfo({
                                factorReceivedPrice:info.factorReceivedPrice,
                                factorTotalPrice:info.factorTotalPrice,
                                factorImage: info.factorImage,
                                billImage:response.data
                            });
                            RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${serviceID}/2.png`,response.data, 'base64' )
                        })}/>
                </View>
                <View style={{width: 100}}>
                    <Text style={Styles.labelStyle}>عکس فیش واریزی:</Text>
                </View>
            </View>
            {!!info.billImage && (
                <Image
                    source={{uri: `data:image/gif;base64,${info.billImage}`}}
                    style={{width:"100%", height:pageHeight*0.4, marginVertical:20}}/>
            )}
        </ScrollView>
    );
}

const Styles = StyleSheet.create({
    containerStyle:{
        flex:1,
        padding:10
    },
    rowDataStyle: {
        flexDirection:"row",
        width:"100%",
        height:65,
        marginBottom:15,
        alignItems:"center",
        justifyContent:"center"
    },
    textInputStyle: {
        width: pageWidth*0.5,
        height: 55,
        marginHorizontal:10,
        borderBottomWidth:1,
        borderBottomColor:"#660000",
        paddingHorizontal: 10
    },
    imageRowStyle:{
        flexDirection: "row",
        width:pageWidth*0.8,
        height:65,
        alignItems:"center",
        justifyContent:"space-between",
    },
    getImageContainerViewStyle:{
        justifyContent:"space-between",
        alignItems:"center",
        flexDirection:"row",
        width:pageWidth*0.25,
        height:"100%"
    },
    rialTextStyle:{
        width:pageWidth*0.1
    },
    labelStyle: {
        width:"100%",
    },
})

export default ServiceFactorTab;