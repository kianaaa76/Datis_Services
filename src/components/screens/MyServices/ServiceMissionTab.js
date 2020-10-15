import React,{useState,useEffect} from 'react';
import {View, ScrollView, Dimensions, Text, StyleSheet, TextInput, TouchableOpacity} from "react-native";
import MapboxGL from '@react-native-mapbox-gl/maps';
import Icon from "react-native-vector-icons/Foundation";
import {API_KEY} from "../../../actions/types";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;


const ServiceMissionTab = ({info, setInfo}) => {
    const [cameraLatitude, setCameraLatitude] = useState("");
    const [cameraLongitude, setCameraLongitude] = useState("");
    const [startLocation, setStartLocation] = useState({
        startLatitude: info.startLatitude,
        startLongitude: info.startLongitude
    });
    const [endLocation, setEndLocation] = useState({
        endLatitude:info.endLatitude,
        endLongitude: info.endLongitude
    });
    const [startCity, setStartCity] = useState(info.startCity);
    const [endCity, setEndCity] = useState(info.endCity);

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
                            <Text style={Styles.markerLabelStyle}>{type == "start"? "مبدا" : "مقصد"}</Text>
                        </View>

                    </View>
                </MapboxGL.MarkerView>
            </View>
        )
    }

    const mapOnLongPress = (feature) => {
        if (!startLocation.startLatitude){
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
                    setInfo({...info, startCity: data.city});
                    setStartLocation({
                        startLatitude: feature.geometry.coordinates[1],
                        startLongitude: feature.geometry.coordinates[0]
                    })
                    setInfo({...info,
                        startLatitude: feature.geometry.coordinates[1],
                        startLongitude: feature.geometry.coordinates[0],
                    })
                });
        } else if (!endLocation.endLatitude) {
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
                    setInfo({...info, endCity: data.city});
                    setEndLocation({
                        endLatitude: feature.geometry.coordinates[1],
                        endLongitude: feature.geometry.coordinates[0]
                    });
                    setInfo({...info,
                        endLatitude: feature.geometry.coordinates[1],
                        endLongitude: feature.geometry.coordinates[0],
                    })
                });
        }
    }

    return(
        <View style={Styles.containerStyle}>
            <MapboxGL.MapView
                style={{width:pageWidth, height:pageHeight}}
                onLongPress={feature => mapOnLongPress(feature)}>
                <MapboxGL.UserLocation
                    onUpdate={location => {
                        setCameraLatitude(location.coords.latitude);
                        setCameraLongitude(location.coords.longitude);
                    }}
                />
                {!!cameraLongitude && !!cameraLatitude && (
                    <MapboxGL.Camera
                        centerCoordinate={[cameraLongitude, cameraLatitude]}
                        zoomLevel={12}
                    />
                )}
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
            {!!startLocation.startLongitude && !!endLocation.endLongitude && (
                <View style={Styles.cardContainerStyle}>
                    <View style={Styles.cardContentContainerStyle}>
                        <View style={Styles.cityDataContainerStyle}>
                            <View style={Styles.cityDataContentContainerStyle}>
                                <Text style={Styles.cityDataTextStyle}>{endCity}</Text>
                                <Text style={Styles.cityDataTitleStyle}>شهر مقصد: </Text>
                            </View>
                            <View style={Styles.cityDataContentContainerStyle}>
                                <Text style={Styles.cityDataTextStyle}>{startCity}</Text>
                                <Text style={Styles.cityDataTitleStyle}>شهر مبدا: </Text>
                            </View>
                        </View>
                        <View style={Styles.dateContainerstyle}>
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
    cityDataTitleStyle: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
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
        height: "77%",
    },
    descriptionTitleTextStyle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    descriptionTextInputStyle: {
        width: '100%',
        height: pageHeight * 0.18,
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
    }
})

export default ServiceMissionTab;