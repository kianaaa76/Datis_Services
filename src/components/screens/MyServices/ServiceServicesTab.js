import React,{useState, useEffect} from "react";
import {
    View,
    StyleSheet,
    TextInput,
    Text,
    Dimensions,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import RNFetchBlob from 'rn-fetch-blob';
import Icon from "react-native-vector-icons/MaterialIcons";
import Foundation from "react-native-vector-icons/Foundation";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import ImagePicker from "react-native-image-picker";
import PersianCalendarPicker from 'react-native-persian-calendar-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment-jalaali";
import MapboxGL from "@react-native-mapbox-gl/maps";
import {API_KEY} from "../../../actions/types";
import {toFaDigit} from "../../utils/utilities";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceServicesTab = ({setInfo, info, projectId}) => {
    let dirs = RNFetchBlob.fs.dirs;
    const [showDatePicker, setShowDatePicke] = useState(false);
    const [screenMode, setScreenMode] = useState("tab");
    const [selectedLatitude, setSelectedLatitude] = useState(null);
    const [selectedLongitude, setSelectedLongitude] = useState(null);
    const [userLatitude, setUserLatitude] = useState(null);
    const [userLongitude, setUserLongitude] = useState(null);
    const [renderTimePicker, setRenderTimePicker] = useState(false);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [image, setImage] = useState("");


    useEffect(()=>{
        RNFetchBlob.fs.readFile(`${dirs.DownloadDir}/${projectId}/3.png`, 'base64').then(data=>{
            setImage(data);
        })
    },[])


    const renderCheckbox = (title, checkboxPurpose, name) => {
        return (
            <View style={Styles.checkboxContainerStyle}>
                <Text style={Styles.checkboxTextStyle}>
                    {title}
                </Text>
                <CheckBox
                    onValueChange={()=>{
                        if (checkboxPurpose == "result"){
                            setInfo({
                                description:info.description,
                                address:info.address,
                                finalDate:info.finalDate,
                                serviceResult:name,
                                serviceType:info.serviceType
                            })
                        } else {
                            setInfo({
                                description:info.description,
                                address:info.address,
                                finalDate:info.finalDate,
                                serviceResult:info.serviceResult,
                                serviceType:name
                            })
                        }
                    }}
                    value={checkboxPurpose == "result"?
                        (info.serviceResult == name ? true : false) :
                        (info.serviceType == name ? true : false)}
                    tintColors={{ true: '#660000', false: 'black' }}
                />
            </View>
        )
    }

    return  screenMode == "tab" ? (
        <ScrollView style={Styles.containerStyle} contentContainerStyle={{justifyContent:"center", alignItems:"center"}}>
            <View style={Styles.descriptionRowStyle}>
                <View style={{width: 70, marginBottom:10}}>
                    <Icon name={"star"} style={{color:"red"}}/>
                    <Text style={Styles.descriptionLabelStyle}>توضیحات:</Text>
                </View>
                <TextInput
                    style={Styles.descriptionInputStyle}
                    onChangeText={text=>{
                        setInfo({
                            description:text,
                            address:info.address,
                            finalDate:info.finalDate,
                            serviceResult:info.serviceResult,
                            serviceType:info.serviceType
                        })
                    }}
                    value={info.description}
                />
            </View>
            <View style={Styles.addressRowStyle}>
                <Icon name={"location-searching"} style={{color:"#000", fontSize:20}} onPress={()=> {
                    setSelectedLongitude("");
                    setSelectedLatitude("");
                    setScreenMode("map")
                }}/>
                <TextInput
                    style={Styles.textInputStyle}
                    onChangeText={text=>{
                        setInfo({
                            description:info.description,
                            address:text,
                            finalDate:info.finalDate,
                            serviceResult:info.serviceResult,
                            serviceType:info.serviceType
                        })
                    }}
                    value={info.address}
                />
                <Text style={Styles.labelStyle}>آدرس:</Text>
            </View>
            <View style={Styles.imageRowStyle}>
                <View style={Styles.getImageContainerViewStyle}>
                    <Icon name={"camera-alt"} style={{color:"#000", fontSize:35}} onPress={
                        () => {
                            ImagePicker.launchCamera({}, response =>{
                                setImage(response.data);
                                RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${projectId}/3.png`,response.data, 'base64' )
                            })
                        }}
                    />
                    <Icon name={"file-upload"} style={{color:"#000", fontSize:35}} onPress={
                        ()=>ImagePicker.launchImageLibrary({},response=>{
                            setImage(response.data);
                            RNFetchBlob.fs.writeFile(`${dirs.DownloadDir}/${projectId}/3.png`,response.data, 'base64' )
                        })}/>
                </View>
                <View style={{width: 70}}>
                    <Text style={Styles.labelStyle}>عکس:</Text>
                </View>
            </View>
            {!!image && (
                <Image
                    source={{uri: `data:image/gif;base64,${image}`}}
                    style={{width:"100%", height:pageHeight*0.4, marginVertical:20}}/>
            )}
            <View style={Styles.datePickerRowStyle}>
                <FontAwesomeIcon name={"calendar"} style={{color:"#000", fontSize:30}} onPress={()=>setShowDatePicke(true)}/>
                <View style={{width: pageWidth*0.5, flexDirection:"row", alignItems:"center", justifyContent:"flex-end"}}>
                    {!!info.finalDate && (
                        <Text style={{fontSize:15, marginRight:10}}>
                            {`${toFaDigit(new moment(info.finalDate).format("jYYYY/jM/jD  HH:mm"))}`}
                        </Text>)}
                    <Icon name={"star"} style={{color:"red", fontSize:10}}/>
                    <Text style={Styles.labelStyle}>تاریخ انجام پروژه:</Text>
                </View>
            </View>
            <View style={Styles.serviceResultContainerStyle}>
                <View style={Styles.resultContainerstyle}>
                    <View style={{width: "100%", flexDirection:'row', justifyContent:"flex-end"}}>
                        <Icon name={"star"} style={{color:"red"}}/>
                        <Text style={Styles.serviceTypeTextStyle}>نوع سرویس:</Text>
                    </View>
                    {renderCheckbox("خرابی یا تعویض قطعه", "type", "breakdown")}
                    {renderCheckbox("ایراد نصب و تنظیم روتین", "type", "routinFail")}
                    {renderCheckbox("تنظیم و عیب غیرروتین", "type", "nonRoutinFail")}
                </View>
                <View style={Styles.servicetypeContainerStyle}>
                    <View style={{width: "100%", flexDirection:'row', justifyContent:"flex-end"}}>
                        <Icon name={"star"} style={{color:"red"}}/>
                        <Text style={Styles.serviceTypeTextStyle}>نتیجه سرویس:</Text>
                    </View>
                    {renderCheckbox("موفق", "result", "success")}
                    {renderCheckbox("موفق مشکوک", "result", "success-suspicious")}
                    {renderCheckbox("سرویس جدید- کسری قطعات", "result", "new-shortage")}
                    {renderCheckbox("سرویس جدید- آماده نبودن پروژه", "result", "new-notReady")}
                    {renderCheckbox("سرویس جدید- عدم تسلط", "result", "new-notMaster")}
                    {renderCheckbox("لغو موفق", "result", "fail")}
                </View>
            </View>
            {showDatePicker && (
                    <View style={Styles.datePickerContainerStyle}>
                        <PersianCalendarPicker
                            onDateChange={date=>{
                             setDate(Date.parse(date));
                            }}
                            width={pageWidth*0.95}
                            selectedDayColor={"red"}
                        />
                        <TouchableOpacity
                            style={Styles.datePickerConfirmButtonStyle}
                              onPress={()=> {
                                  setRenderTimePicker(true);
                                  setShowDatePicke(false);
                              }}>
                            <Text style={Styles.confirmdatePickerTextStyle}>
                                تایید
                            </Text>
                        </TouchableOpacity>
                    </View>
            )}
            {renderTimePicker && (
                <DateTimePickerModal
                    isVisible={renderTimePicker}
                    mode="time"
                    onConfirm={value=> {
                        setTime(Date.parse(value))
                        let datee = new moment(date).format("jYYYY/jM/jD HH:mm:ss");
                        let timee = datee.split(" ");
                        let timeSplit = timee[1].split(":");
                        let ss = (parseInt(timeSplit[0]*3600) + parseInt(timeSplit[1]*60) + parseInt(timeSplit[2]))*1000;
                        let pureDate = parseInt(date) - ss;
                        let addedTime = (new moment(Date.parse(value)).format("HH:mm:ss")).split(":");
                        let finalTime = pureDate + (parseInt(addedTime[0]*3600) + parseInt(addedTime[1]*60) + parseInt(addedTime[2]))*1000;
                        setInfo({
                            description:info.description,
                            address:info.address,
                            finalDate:finalTime,
                            serviceResult:info.serviceResult,
                            serviceType:info.serviceType
                        })
                        setRenderTimePicker(false);
                    }}
                    onCancel={()=>setRenderTimePicker(false)}
                    is24Hour={true}
                />
            )}
        </ScrollView>
    ):(
        <View style={{flex:1}}>
            <MapboxGL.MapView style={{flex:1}} onPress={feature=>{
                setSelectedLatitude(feature.geometry.coordinates[1]);
                setSelectedLongitude(feature.geometry.coordinates[0]);
            }}>
                <MapboxGL.UserLocation
                    onUpdate={location => {
                        setUserLatitude(location.coords.latitude);
                        setUserLongitude(location.coords.longitude);
                    }}
                />
                {!!userLatitude && !!userLongitude && (
                    <MapboxGL.Camera
                        centerCoordinate={[userLongitude, userLatitude]}
                    />
                )}
                {!!selectedLatitude && !!selectedLongitude && (
                    <View>
                        <MapboxGL.MarkerView
                            id={"1"}
                            coordinate={[selectedLongitude, selectedLatitude]}>
                            <View>
                                <View style={{
                                    alignItems: 'center',
                                    width: 100,
                                    backgroundColor: 'transparent',
                                    height: 100,
                                }}>
                                    <Foundation name="marker" color="red" size={45}/>
                                </View>
                            </View>
                        </MapboxGL.MarkerView>
                    </View>
                )}
            </MapboxGL.MapView>
            <View style={Styles.bottomBoxContainerStyle}>
                {(!!selectedLatitude && !!selectedLongitude) ? (
                    <TouchableOpacity style={Styles.confirmButtonStyle} onPress={()=> {
                        fetch(`https://map.ir/reverse?lat=${selectedLatitude}&lon=${selectedLongitude}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': API_KEY,
                            },
                        })
                            .then(response => response.json())
                            .then(data => {
                                setInfo({
                                    description:info.description,
                                    address:data.address,
                                    finalDate:info.finalDate,
                                    serviceResult:info.serviceResult,
                                    serviceType:info.serviceType
                                })
                            });
                        setScreenMode("tab")
                    }}>
                        <Text style={Styles.buttonTextStyle}>
                            تایید
                        </Text>
                    </TouchableOpacity>
                ):(
                    <View style={Styles.selectTextContainerStyle}>
                        <Text style={Styles.selectTextStyle}>
                            موقعیت را مشخص کنید.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const Styles = StyleSheet.create({
    containerStyle:{
        flex:1,
        padding:20,
    },
    descriptionRowStyle: {
        alignItems:"flex-end",
        justifyContent:"center",
        width:"100%",
        marginBottom: 10
    },
    descriptionInputStyle:{
        width: '100%',
        height: pageHeight * 0.15,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        textAlignVertical: 'top',
        padding: 15,
    },
    serviceTypeTextStyle:{
        fontSize:13,
        color:"#660000"
    },
    addressRowStyle:{
        flexDirection:"row",
        width:"100%",
        height:pageHeight*0.1,
        marginBottom:15,
        alignItems:"center",
        justifyContent:"flex-end",
    },
    textInputStyle: {
        width: pageWidth * 0.65,
        height: 55,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#660000",
        paddingHorizontal: 10,
    },
    imageRowStyle:{
        flexDirection: "row",
        width:"100%",
        height:65,
        alignItems:"center",
        justifyContent:"space-between",
    },
    datePickerRowStyle:{
        flexDirection: "row",
        width:"100%",
        height:65,
        alignItems:"center",
        justifyContent:"space-between",
    },
    getImageContainerViewStyle:{
        justifyContent:"space-between",
        alignItems:"center",
        flexDirection:"row",
        width:pageWidth*0.23,
        height:"100%",
    },
    bottomBoxContainerStyle:{
        position:"absolute",
        width:pageWidth*0.8,
        height:70,
        opacity:0.8,
        backgroundColor:"#fff",
        borderRadius:10,
        bottom: 10,
        left: pageWidth*0.1,
        padding:10,
        justifyContent:"center",
        alignItems:"center"
    },
    confirmButtonStyle:{
        width: pageWidth*0.7,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "gray"
    },
    buttonTextStyle:{
        fontSize:16,
        fontWeight:"bold",
        textAlign:"center"
    },
    selectTextContainerStyle:{
        width: pageWidth*0.7,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor:"gray",
        opacity: 1
    },
    selectTextStyle:{
        fontSize: 16,
        textAlign: "center",
        fontWeight:"bold",
    },
    datePickerContainerStyle:{
        flex: 1,
        backgroundColor: '#FFFFFF',
        position: "absolute",
        bottom: pageWidth*0.6,
        borderWidth: 2,
        borderColor: "#13A69D",
        borderRadius:10,
        overflow:"hidden"
    },
    datePickerConfirmButtonStyle:{
        width:"100%",
        height:60,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#13A69D"
    },
    confirmdatePickerTextStyle:{
        fontSize:17,
        fontWeight:"bold"
    },
    serviceResultContainerStyle:{
        flexDirection:"row",
        width:"90%",
        height:pageHeight*0.4,
        justifyContent:"space-between",
        marginBottom:30
    },
    resultContainerstyle:{
        width:pageWidth*0.37,
        height:"100%",
        borderWidth:1,
        borderColor:"#000",
        borderRadius:10,
        padding:5
    },
    servicetypeContainerStyle:{
        width:pageWidth*0.37,
        height:"100%",
        borderWidth:1,
        borderColor:"#000",
        borderRadius:10,
        padding:5
    },
    checkboxContainerStyle:{
        flexDirection:"row",
        width: "100%",
        justifyContent:"flex-end",
        alignItems:"center",
        marginBottom:5
    },
    checkboxTextStyle:{
        fontSize:12,
        width:"75%"
    }
})

export default ServiceServicesTab;