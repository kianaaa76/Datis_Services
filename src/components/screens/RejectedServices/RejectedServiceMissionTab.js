import React,{useState,useEffect} from 'react';
import {View, Dimensions, Text, StyleSheet, TextInput, Switch, BackHandler} from "react-native";
import MapboxGL from '@react-native-mapbox-gl/maps';
import Icon from "react-native-vector-icons/Foundation";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {API_KEY, MAPBOX_API_KEY} from "../../../actions/types";
import {toFaDigit} from "../../utils/utilities";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
let cameraRef={};
let EndObject="";
const ServiceMissionTab = ({info, setInfo, navigation}) => {
    const [startLocation, setStartLocation] = useState({
        startLatitude: info.startLatitude,
        startLongitude: info.startLongitude
    });
    const [endLocation, setEndLocation] = useState({
        endLatitude:info.endLatitude,
        endLongitude: info.endLongitude
    });
    const [userLatitude, setUserLatitude] = useState("");
    const [userLongitude, setUserLongitude] = useState("");
    const [areaHasChanged, setAreaHasChanged] = useState(false);
    const [startCity, setStartCity] = useState(info.startCity);
    const [endCity, setEndCity] = useState(info.endCity);
    const [travel, setTravel] = useState(info.travel);
    const [distance, setDistance] = useState(parseFloat(info.distance)/1000);

    useEffect(() => {
        const backAction = () => {
            if(!!endLocation.endLongitude){
                setEndLocation({endLongitude: "", endLatitude: ""});
                setEndCity("");
                setDistance("0");
                setInfo({...info,
                    endLatitude: "",
                    endLongitude: "",
                    endCity: "",
                    distance:"0"
                })
            } else if (!!startLocation.startLatitude){
                setStartLocation({startLatitude: "", startLongitude: ""});
                setStartCity("");
                setInfo({...info,
                    startLatitude: "",
                    startLongitude: "",
                    startCity: ""
                })
            } else {
                navigation.goBack();
            }
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    });

    const renderMarker = (latitude,longitude, color, size, id, type) =>{
        return(
            <View>
                <MapboxGL.MarkerView
                    id={id}
                    coordinate={[longitude, latitude]}>
                    <View>
                        <View style={{
                            alignItems: 'center',
                            width: 100,
                            backgroundColor: 'transparent',
                            height: 100,
                        }}>
                            <Icon name="marker" color={color} size={size}/>
                            <Text style={Styles.markerLabelStyle}>{type === "start"? "مبدا" : "مقصد"}</Text>
                        </View>
                    </View>
                </MapboxGL.MarkerView>
            </View>
        )
    }

    const mapOnLongPress = (feature) => {
        if (!startLocation.startLatitude){
            setAreaHasChanged(false);
            setStartLocation({
                startLatitude: feature.geometry.coordinates[1],
                startLongitude: feature.geometry.coordinates[0]
            })
            setInfo({
                ...info,
                startLatitude: feature.geometry.coordinates[1],
                startLongitude: feature.geometry.coordinates[0],
            })
            fetch(`https://map.ir/fast-reverse?lat=${feature.geometry.coordinates[1]}&lon=${feature.geometry.coordinates[0]}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            })
                .then(response => response.json())
                .then(data => {
                    setStartCity(data.city);
                    setInfo({...info,
                        startLatitude: feature.geometry.coordinates[1],
                        startLongitude: feature.geometry.coordinates[0],
                        startCity: data.city
                    })
                });
        } else if (!endLocation.endLatitude) {
            setEndLocation({
                endLatitude: feature.geometry.coordinates[1],
                endLongitude: feature.geometry.coordinates[0]
            });
            setInfo({
                ...info,
                endLatitude: feature.geometry.coordinates[1],
                endLongitude: feature.geometry.coordinates[0]
            })
            fetch(`https://map.ir/reverse?lat=${feature.geometry.coordinates[1]}&lon=${feature.geometry.coordinates[0]}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            })
                .then(response => response.json())
                .then(data => {
                    setEndCity(data.city);
                    EndObject = data.city;
                });
            fetch(`https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${startLocation.startLongitude},${startLocation.startLatitude};${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}?access_token=${MAPBOX_API_KEY}`,{
                method: 'GET'
            }).then(response=> response.json()).then(data=>{
                setDistance(parseFloat(data.routes[0].legs[0].distance)/1000);
                setInfo({
                    ...info,
                    distance: data.routes[0].legs[0].distance,
                    endLatitude: feature.geometry.coordinates[1],
                    endLongitude: feature.geometry.coordinates[0],
                    startCity:startCity,
                    startLatitude:startLocation.startLatitude,
                    startLongitude: startLocation.startLongitude,
                    endCity: EndObject
                })
            })
            cameraRef.fitBounds([startLocation.startLongitude,startLocation.startLatitude],[feature.geometry.coordinates[0], feature.geometry.coordinates[1]],[pageHeight*0.1,100,pageHeight*0.4,100],100);
        }
    }

    return(
        <View style={Styles.containerStyle}>
            <MapboxGL.MapView
                style={{width:pageWidth, height:pageHeight}}
                onLongPress={feature => mapOnLongPress(feature)}
                onRegionDidChange={()=>setAreaHasChanged(true)}>
                <MapboxGL.UserLocation
                    onUpdate={location => {
                        setUserLatitude(location.coords.latitude);
                        setUserLongitude(location.coords.longitude);
                        if (!startLocation.startLatitude && !endLocation.endLongitude && !areaHasChanged) {
                            cameraRef.moveTo([location.coords.longitude, location.coords.latitude]);
                            cameraRef.zoomTo(11)
                        } else if (!!startLocation.startLatitude && !!endLocation.endLongitude){
                        cameraRef.fitBounds([startLocation.startLongitude,startLocation.startLatitude],[endLocation.endLongitude, endLocation.endLatitude],[pageHeight*0.1,100,pageHeight*0.4,100],100);
                        } else if (!!startLocation.startLatitude && !endLocation.endLatitude && !areaHasChanged){
                            cameraRef.moveTo([startLocation.startLongitude, startLocation.startLatitude]);
                            cameraRef.zoomTo(11);
                        }
                    }}
                />
                <MapboxGL.Camera
                    ref={ref=>cameraRef=ref}
                />
                {!!startLocation.startLongitude && !!startLocation.startLatitude && (
                    renderMarker(startLocation.startLatitude, startLocation.startLongitude, "blue", 45, 1, "start")
                )}
                {!!endLocation.endLatitude && !!endLocation.endLongitude && (
                    renderMarker(endLocation.endLatitude, endLocation.endLongitude, "red", 45, 2, "end")
                )}
            </MapboxGL.MapView>
            {(!startLocation.startLongitude || !endLocation.endLongitude) && (
                <View style={Styles.headerTextContainerStyle}>
                    <Text style={Styles.headerTextStyle}>
                        {!!startLocation.startLatitude ?
                            !!endLocation.endLatitude ?
                                null : "لطفا مقصد ماموریت را انتخاب کنید." : "لطفا مبدا ماموریت را انتخاب کنید."}
                    </Text>
                </View>
            )}
            <View style={{
                position:"absolute", 
                bottom:!!startLocation.startLatitude && !!endLocation.endLatitude ? pageHeight*0.35 + 25 : 20, 
                right:20, 
                borderRadius:10,
                justifyContent:"center",
                alignItems:"center"
            }}>
                <MaterialIcons 
                name={"my-location"} 
                style={{fontSize:30, color:"#000"}} 
                onPress={async()=>{
                    await cameraRef.moveTo([userLongitude, userLatitude]);
                    await cameraRef.zoomTo(11);
                }}/>
            </View>
            {!!startLocation.startLongitude && !!endLocation.endLongitude && (
                <View style={Styles.cardContainerStyle}>
                    <View style={Styles.cardContentContainerStyle}>
                        <View style={Styles.cityDataContainerStyle}>
                            <View style={Styles.cityDataContentContainerStyle}>
                                <Text style={Styles.cityDataTextStyle}>{endCity}</Text>
                                <Text style={Styles.titleStyle}>شهر مقصد: </Text>
                            </View>
                            <View style={Styles.cityDataContentContainerStyle}>
                                <Text style={Styles.cityDataTextStyle}>{startCity}</Text>
                                <Text style={Styles.titleStyle}>شهر مبدا: </Text>
                            </View>
                        </View>
                        <View style={Styles.distanceRowStyle}>
                            <View style={Styles.distanceContainerStyle}>
                                <Text>کیلومتر</Text>
                                <Text style={{marginHorizontal:5}}>{toFaDigit(distance).substr(0,10)}</Text>
                                <Text style={Styles.titleStyle}>فاصله: </Text>
                            </View>
                            <View style={Styles.switchContainerStyle}>
                                <Switch
                                    trackColor={{ false: "gray", true: "#660000" }}
                                    thumbColor={travel ? "#990000" : "#C0C0C0"}
                                    onValueChange={()=>{
                                        setTravel(!travel);
                                        setInfo({
                                            ...info,
                                            travel: !info.travel
                                        });
                                    }}
                                    value={travel}
                                />
                                <Text style={Styles.titleStyle}>
                                    بازگشت به منزل:
                                </Text>
                            </View>
                        </View>
                        <View style={Styles.descriptionContainerStyle}>
                            <Text style={Styles.descriptionTitleTextStyle}>توضیحات: </Text>
                            <TextInput
                                value={info.missionDescription}
                                style={Styles.descriptionTextInputStyle}
                                multiline
                                onChangeText={description => setInfo({...info, missionDescription: description})}/>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

const Styles = StyleSheet.create({
    containerStyle:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
    },
    headerTextStyle:{
        fontSize:16,
        fontWeight:"bold",
        textAlign:"center",
    },
    headerTextContainerStyle:{
        width:pageWidth*0.65,
        height:50,
        backgroundColor: "rgba(255,255,255,0.7)",
        borderWidth:1,
        borderColor:"gray",
        borderRadius:10,
        justifyContent: "center",
        alignItems: "center",
        position:"absolute",
        bottom:pageHeight*0.68,
        left:pageWidth*0.2,
    },
    markerLabelContainerStyle:{
        backgroundColor:"red"
    },
    cardContainerStyle:{
        backgroundColor:"transparent",
        borderWidth: 1,
        borderColor: "#505050",
        borderRadius: 5,
        padding:6,
        width: pageWidth*0.9,
        height: pageHeight*0.35,
        position: "absolute",
        bottom: 15
    },
    cardContentContainerStyle:{
        flex:1,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent:"center",
        alignItems:"center",
        padding:5
    },
    cityContainerStyle:{
        flexDirection:"row",
        alignItems:'center',
        justifyContent:"space-around",
        width:"100%",
        height:"20%"
    },
    cityDataContainerStyle: {
        width: "100%",
        height: pageHeight * 0.06,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cityDataTextStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        fontSize: 15,
        marginLeft: 10,
    },
    cityDataContentContainerStyle: {
        flexDirection: 'row',
        width: '50%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    descriptionContainerStyle: {
        width: "100%",
        height: "60%",
    },
    descriptionTitleTextStyle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    descriptionTextInputStyle: {
        width: '100%',
        height: pageHeight * 0.14,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        textAlignVertical: 'top',
        padding: 15,
    },
    markerLabelStyle:{
        width:50,
        height:20,
        justifyContent:"center",
        textAlign:"center",
        borderRadius:10,
        backgroundColor:"#A8A7A7",
        color:"#000"
    },
    switchContainerStyle:{
        flexDirection:"row",
        width:"50%",
        alignItems:"center",
        justifyContent:"flex-end",
        marginTop:8
    },
    distanceRowStyle:{
        flexDirection:"row",
        width:"100%",
        alignItems:"center",
        justifyContent:"space-between",
        marginTop:8
    },
    titleStyle:{
        fontSize: 15,
        fontWeight: 'bold',
        textAlign:'center'
    },
    distanceContainerStyle:{
        flexDirection:"row",
        width:"50%",
        alignItems:"center",
        justifyContent:"flex-end"

    }
})

export default ServiceMissionTab;