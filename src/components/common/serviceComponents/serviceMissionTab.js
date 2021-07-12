import React, {useState, useEffect} from 'react';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  BackHandler,
  Alert,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import Toast from 'react-native-simple-toast';
import {API_KEY, MAPBOX_API_KEY} from '../../../actions/types';
import {toFaDigit, normalize, getFontsName} from '../../utils/utilities';
import LocationServicesDialogBox from 'react-native-android-location-services-dialog-box';
import {CurrentLocationIcon, SearchIcon, MapMarkerIcon, RemoveMarkerIcon} from "../../../assets/icons";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
let cameraRef = {};
let EndObject = '';
const ServiceMissionTab = ({
  info,
  setInfo,
  renderSaveModal,
  isRejected,
}) => {
  const [startLocation, setStartLocation] = useState({
    startLatitude: info.startLatitude,
    startLongitude: info.startLongitude,
  });
  const [endLocation, setEndLocation] = useState({
    endLatitude: info.endLatitude,
    endLongitude: info.endLongitude,
  });
  const [userLatitude, setUserLatitude] = useState('');
  const [userLongitude, setUserLongitude] = useState('');
  const [areaHasChanged, setAreaHasChanged] = useState(false);
  const [startCity, setStartCity] = useState(info.startCity);
  const [endCity, setEndCity] = useState(info.endCity);
  const [travel, setTravel] = useState(info.travel);
  const [searchText, setSearchText] = useState("");
  const [searchLoading,setSearchLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [distance, setDistance] = useState(!!info.distance ?
    (parseFloat(info.distance) / 1000)
      .toString()
      .substr(
        0,
        (parseFloat(info.distance) / 1000).toString().indexOf('.') + 4,
      ) : 0
  );

  useEffect(() => {
    const backAction = () => {
      renderSaveModal();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        },
    );
    const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const renderMarker = (latitude, longitude, color, size, id, type) => {
    return (
      <View>
        <MapboxGL.MarkerView id={id} coordinate={[longitude, latitude]}>
          <View>
            <View
              style={{
                alignItems: 'center',
                width: 100,
                backgroundColor: 'transparent',
                height: 100,
              }}>
              {MapMarkerIcon({
                color:color,
                fill: color
              })}
              <Text style={Styles.markerLabelStyle}>
                {type === 'start' ? 'مبدا' : 'مقصد'}
              </Text>
            </View>
          </View>
        </MapboxGL.MarkerView>
      </View>
    );
  };

  const mapOnLongPress = feature => {
    if (!!feature) {
      if (!startLocation.startLatitude) {
        setAreaHasChanged(false);
        setStartLocation({
          startLatitude: feature.geometry.coordinates[1],
          startLongitude: feature.geometry.coordinates[0],
        });
        setInfo({
          ...info,
          startLatitude: feature.geometry.coordinates[1],
          startLongitude: feature.geometry.coordinates[0],
        });
        fetch(
          `https://map.ir/fast-reverse?lat=${
            feature.geometry.coordinates[1]
          }&lon=${feature.geometry.coordinates[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
            },
          },
        )
          .then(response => response.json())
          .then(data => {
            setStartCity(data.city);
            setInfo({
              ...info,
              startCity: data.city,
              startLatitude: feature.geometry.coordinates[1],
              startLongitude: feature.geometry.coordinates[0],
            });
          });
      } else if (!endLocation.endLatitude) {
        setEndLocation({
          endLatitude: feature.geometry.coordinates[1],
          endLongitude: feature.geometry.coordinates[0],
        });
        setInfo({
          ...info,
          endLatitude: feature.geometry.coordinates[1],
          endLongitude: feature.geometry.coordinates[0],
        });
        fetch(
          `https://map.ir/fast-reverse?lat=${
            feature.geometry.coordinates[1]
          }&lon=${feature.geometry.coordinates[0]}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
            },
          },
        )
          .then(response => response.json())
          .then(data => {
            EndObject = data.city;
            setEndCity(data.city);
          });
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${
            startLocation.startLongitude
          },${startLocation.startLatitude};${feature.geometry.coordinates[0]},${
            feature.geometry.coordinates[1]
          }?access_token=${MAPBOX_API_KEY}`,
          {
            method: 'GET',
          },
        )
          .then(response => response.json())
          .then(data => {
            try {
              if (!!data && !!data.routes[0].legs[0].distance) {
                let dist = (
                    parseFloat(data.routes[0].legs[0].distance) / 1000
                ).toString();
                setDistance(dist.substr(0, dist.indexOf('.') + 3));
                setInfo({
                  ...info,
                  distance: data.routes[0].legs[0].distance,
                  endCity: EndObject,
                  endLatitude: feature.geometry.coordinates[1],
                  endLongitude: feature.geometry.coordinates[0],
                });
              }else {
                setDistance(0);
                setInfo({
                  ...info,
                  distance: 0,
                  endCity: EndObject,
                  endLatitude: feature.geometry.coordinates[1],
                  endLongitude: feature.geometry.coordinates[0],
                });
              }
            }catch{
              setDistance(0);
              setInfo({
                ...info,
                distance: 0,
                endCity: EndObject,
                endLatitude: feature.geometry.coordinates[1],
                endLongitude: feature.geometry.coordinates[0],
              });
            }
          }).catch(()=>{
            setDistance(0);
            setInfo({
              ...info,
              distance: 0,
              endCity: EndObject,
              endLatitude: feature.geometry.coordinates[1],
              endLongitude: feature.geometry.coordinates[0],
            });
        });
        setInfo({
          ...info,
          startCity: startCity,
          endLatitude: feature.geometry.coordinates[1],
          endLongitude: feature.geometry.coordinates[0],
          startLatitude: startLocation.startLatitude,
          startLongitude: startLocation.startLongitude,
        });
        cameraRef.fitBounds(
          [startLocation.startLongitude, startLocation.startLatitude],
          [feature.geometry.coordinates[0], feature.geometry.coordinates[1]],
          [pageHeight * 0.1, 100, pageHeight * 0.4, 100],
          100,
        );
      }
    }
  };

  const handleSearchOnMap = () => {
    setSearchLoading(true);
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText.replace(" ", /%20/g)}.json?access_token=${MAPBOX_API_KEY}&language=ar&country=IR`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': MAPBOX_API_KEY,
          },
        }).then(response => response.json()).then(data=> {
          setSearchLoading(false);
      cameraRef.moveTo(data.features[0].geometry.coordinates);
      cameraRef.zoomTo(8);
      Keyboard.dismiss();
    }).catch(err=>
        Toast.showWithGravity('مکان مورد نظر یافت نشد.', Toast.LONG, Toast.CENTER))
  }

  return (
    <View style={Styles.containerStyle}>
      <MapboxGL.MapView
        style={{width: pageWidth, height: pageHeight}}
        onLongPress={feature => (isRejected ? {} : mapOnLongPress(feature))}
        onRegionDidChange={() => setAreaHasChanged(true)}>
        <MapboxGL.UserLocation
          onUpdate={location => {
            setUserLatitude(location.coords.latitude);
            setUserLongitude(location.coords.longitude);
            if (
              !startLocation.startLatitude &&
              !endLocation.endLongitude &&
              !areaHasChanged
            ) {
              cameraRef.moveTo([
                location.coords.longitude,
                location.coords.latitude,
              ]);
              cameraRef.zoomTo(11);
            } else if (
              !!startLocation.startLatitude &&
              !!endLocation.endLongitude
            ) {
              cameraRef.fitBounds(
                [startLocation.startLongitude, startLocation.startLatitude],
                [endLocation.endLongitude, endLocation.endLatitude],
                [pageHeight * 0.1, 100, pageHeight * 0.4, 100],
                100,
              );
            } else if (
              !!startLocation.startLatitude &&
              !endLocation.endLatitude &&
              !areaHasChanged
            ) {
              cameraRef.moveTo([
                startLocation.startLongitude,
                startLocation.startLatitude,
              ]);
              cameraRef.zoomTo(11);
            }
          }}
        />
        <MapboxGL.Camera ref={ref => (cameraRef = ref)} />
        {!!startLocation.startLongitude &&
          !!startLocation.startLatitude &&
          renderMarker(
            startLocation.startLatitude,
            startLocation.startLongitude,
            'blue',
            45,
            1,
            'start',
          )}
        {!!endLocation.endLatitude &&
          !!endLocation.endLongitude &&
          renderMarker(
            endLocation.endLatitude,
            endLocation.endLongitude,
            'red',
            45,
            2,
            'end',
          )}
      </MapboxGL.MapView>
      {!isRejected &&
      (!startLocation.startLongitude || !endLocation.endLongitude) && (
          <View style={Styles.searchInputContainerStyle}>
        <View style={Styles.searchInputContentContainerStyle} elevation={5}>
          <TextInput style={{width: "80%", height: "100%"}}
                     placeholder={"نام شهر مورد نظر خود را جستجو کنید..."}
                     onChangeText={text=>setSearchText(text)}/>
          {searchLoading ? (
              <ActivityIndicator/>
          ):SearchIcon({
            onPress:handleSearchOnMap,
            color: "#000"
          })}
        </View>
      </View>)}

      {isRejected && !startLocation.startLongitude ? (
        <View style={Styles.notHaveMissionTextContainerStyle}>
          <Text style={Styles.headerTextStyle}>
            این سرویس بدون ماموریت بسته شده است.
          </Text>
        </View>
      ) : null}
      {(!isRejected || (isRejected && !!startLocation.startLatitude)) && !isKeyboardVisible && (
          <View style={{width:"100%", flexDirection:"row",position:"absolute", bottom:
                !!startLocation.startLatitude && !!endLocation.endLatitude
                    ? pageHeight * 0.35 + 25
                    : 20, justifyContent:!startLocation.startLongitude || !endLocation.endLongitude ? "space-around" : isRejected ? "flex-end" : "space-between"}}>
            {!isRejected && !!startLocation.startLatitude && (
                <View
                    style={[
                      Styles.removeMarkerContainerStyle,
                      {
                        marginLeft:!!startLocation.startLatitude && !!endLocation.endLatitude ? 20 : 0
                      },
                    ]}>
                  {RemoveMarkerIcon({
                    width:30,
                    height:30,
                    onPress:() => {
                    if (!!endLocation.endLatitude) {
                    Alert.alert('', 'کدام موقعیت را میخواهید حذف کنید؟', [
                  {
                    text: 'هیچکدام',
                    onPress: () => {},
                  },
                  {
                    text: 'مقصد',
                    onPress: () => {
                    setEndLocation({});
                    setEndCity('');
                    setDistance('');
                    setInfo({
                    ...info,
                    endCity: '',
                    endLatitude: '',
                    startLongitude: '',
                  });
                  },
                  },
                  {
                    text: 'مبدا و مقصد',
                    onPress: () => {
                    setStartLocation({});
                    setEndLocation({});
                    setStartCity('');
                    setEndCity('');
                    setDistance('');
                    setInfo({
                    ...info,
                    startCity: '',
                    startLatitude: '',
                    startLongitude: '',
                    endCity: '',
                    endLatitude: '',
                    distance: '',
                  });
                  },
                    style: 'cancel',
                  },
                    ]);
                  } else {
                    Alert.alert('', 'آیا از حذف کردن مبدا اطمینان دارید؟', [
                  {
                    text: 'خیر',
                    onPress: () => {},
                    style: 'cancel',
                  },
                  {
                    text: 'بله',
                    onPress: () => {
                    setStartCity('');
                    setStartLocation({});
                    setInfo({
                    ...info,
                    startCity: '',
                    startLatitude: '',
                    startLongitude: '',
                  });
                  },
                  },
                    ]);
                  }
                  }
                  })}
                </View>
            )}
            {!isRejected &&
            (!startLocation.startLongitude || !endLocation.endLongitude) && (
                <>
                  {!startLocation.startLatitude && ( <View style={{width: 50}}/>)}
                <View style={Styles.headerTextContainerStyle}>
                  <Text style={Styles.headerTextStyle}>
                    {!!startLocation.startLatitude
                        ? !!endLocation.endLatitude
                            ? null
                            : 'لطفا مقصد ماموریت را انتخاب کنید.'
                        : 'لطفا مبدا ماموریت را انتخاب کنید.'}
                  </Text>
                </View>
                </>
            )}
            <View
              style={[
                Styles.myLocationContainerStyle,{marginRight:!!startLocation.startLatitude && !!endLocation.endLatitude ? 20 : 0}
              ]}>
              {CurrentLocationIcon({
                color:"red",
                width:28,
                height:28,
                onPress:async () => {
                LocationServicesDialogBox.checkLocationServicesIsEnabled({
                message:
                "<h2 style='color: #0af13e'>آیا میخواهید از امکانات لوکیشن استفاده کنید؟</h2><br/>",
                ok: 'YES',
                cancel: 'NO',
                enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                showDialog: true, // false => Opens the Location access page directly
                openLocationServices: true, // false => Directly catch method is called if location services are turned off
                preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
                providerListener: false, // true ==> Trigger locationProviderStatusChange listener when the location state changes
              })
                .then(async () => {
                if (!!cameraRef && !!userLatitude && !!userLongitude) {
                await cameraRef.moveTo([userLongitude, userLatitude], 500);
                await cameraRef.zoomTo(11, 500);
              }
              })
                .catch(() => {
                Toast.showWithGravity('موقعیت در دسترس نیست.', Toast.LONG, Toast.CENTER)
              });
              }
              })}
            </View>
          </View>
      )}
      {!!startLocation.startLongitude && !!endLocation.endLongitude && (
        <View style={Styles.cardContentContainerStyle}>
          <View style={Styles.cityDataContainerStyle}>
            <View style={Styles.cityDataContentContainerStyle}>
              <TextInput style={Styles.cityDataTextStyle} onChangeText={(text)=>{
                setInfo({...info, endCity: text});
              }}>{info.endCity}</TextInput>
              <Text style={Styles.titleStyle}>شهر مقصد: </Text>
            </View>
            <View style={Styles.cityDataContentContainerStyle}>
              <TextInput style={Styles.cityDataTextStyle} onChangeText={(text)=>{
                setInfo({...info, startCity: text})
              }}>
                {info.startCity}
              </TextInput>
              <Text style={Styles.titleStyle}>شهر مبدا: </Text>
            </View>
          </View>
          <View style={Styles.distanceRowStyle}>
            <View style={Styles.distanceContainerStyle}>
              <Text
                style={{
                  fontSize: normalize(13),
                  fontFamily: getFontsName('IRANSansMobile_Light'),
                }}>
                کیلومتر
              </Text>
              <Text
                style={{
                  marginHorizontal: 5,
                  fontSize: normalize(12),
                  fontFamily: getFontsName('IRANSansMobile_Light'),
                }}>
                {!!distance ? toFaDigit(distance) : toFaDigit('0')}
              </Text>
              <Text style={Styles.titleStyle}>فاصله: </Text>
            </View>
            <View style={Styles.switchContainerStyle}>
              <Switch
                trackColor={{false: 'gray', true: '#660000'}}
                thumbColor={travel ? '#990000' : '#C0C0C0'}
                onValueChange={() => {
                  if (!!travel){
                    setTravel(false);
                    setInfo({
                      ...info,
                      travel: false,
                    });
                  } else {
                    setTravel(true);
                    setInfo({
                      ...info,
                      travel: true,
                    });
                  }

                }}
                value={travel}
              />
              <Text style={Styles.titleStyle}>بازگشت به منزل:</Text>
            </View>
          </View>
          <View style={Styles.descriptionContainerStyle}>
            <Text style={Styles.descriptionTitleTextStyle}>توضیحات: </Text>
            <TextInput
              value={info.missionDescription}
              style={Styles.descriptionTextInputStyle}
              multiline
              onChangeText={description =>
                setInfo({...info, missionDescription: description})
              }
            />
          </View>
        </View>
      )}
    </View>
  );
};

const Styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextStyle: {
    fontSize: normalize(15),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    textAlign: 'center',
  },
  headerTextContainerStyle: {
    width: "60%",
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notHaveMissionTextContainerStyle: {
    width: pageWidth,
    height: pageHeight,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  markerLabelContainerStyle: {
    backgroundColor: 'red',
  },
  cardContainerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#505050',
    borderRadius: 5,
    padding: 6,
    width: pageWidth * 0.9,
    height: pageHeight * 0.35,
    position: 'absolute',
    bottom: 15,
  },
  cardContentContainerStyle: {
    width: pageWidth * 0.9,
    height: pageHeight * 0.35,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 7,
    borderRadius: 15,
    elevation: 6,
    position: 'absolute',
    bottom: 15,
  },
  cityContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '20%',
  },
  cityDataContainerStyle: {
    width: '100%',
    height: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityDataTextStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontSize: normalize(14),
    marginLeft: 10,
    width: '35%',
    textAlign: 'center',
    fontFamily: getFontsName('IRANSansMobile_Light'),
  },
  cityDataContentContainerStyle: {
    flexDirection: 'row',
    width: '50%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  descriptionContainerStyle: {
    width: '100%',
    height: '50%',
    justifyContent: 'flex-end',
  },
  descriptionTitleTextStyle: {
    fontSize: normalize(14),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    marginBottom: 5,
  },
  descriptionTextInputStyle: {
    width: '100%',
    height: '80%',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontFamily: getFontsName('IRANSansMobile_Light'),
    fontSize: normalize(13),
  },
  markerLabelStyle: {
    width: 50,
    height: 20,
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 10,
    backgroundColor: '#A8A7A7',
    color: '#000',
    fontSize: normalize(12),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
  },
  switchContainerStyle: {
    flexDirection: 'row',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  distanceRowStyle: {
    flexDirection: 'row',
    width: '100%',
    height: '18%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleStyle: {
    fontSize: normalize(14),
    fontFamily: getFontsName('IRANSansMobile_Medium'),
    textAlign: 'center',
  },
  distanceContainerStyle: {
    flexDirection: 'row',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  myLocationContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
  },
  removeMarkerContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
  },
  searchInputContainerStyle:{
    width:"100%",
    height:50,
    position:"absolute",
    top:10,
    justifyContent:"center",
    alignItems:"center",
    paddingHorizontal:15
  },
  searchInputContentContainerStyle:{
    height:"100%",
    width:"100%",
    backgroundColor:"#fff",
    borderRadius:15,
    alignItems:"center",
    justifyContent:"space-around",
    flexDirection:"row"
  }
});

export default ServiceMissionTab;
