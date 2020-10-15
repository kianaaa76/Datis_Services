import React,{useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Dimensions,
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import {useDispatch} from 'react-redux';
import {toFaDigit} from './utilities';
import AsyncStorage from "@react-native-community/async-storage";
import {RESTORE_SERVICE_DATA} from "../../actions/types";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MyServiceListItem = ({item, navigation, setModalState, setSelectedProjectId, setNetworkModalState}) => {
    const [isNetworkSaved, setIsNetworkSaved] = useState(false);
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
    const dispatch = useDispatch();
    useEffect(async ()=>{
        await AsyncStorage.getItem("savedServicesList").then(list=> {
            if(!!list){
                JSON.parse(list).map(item=>{
                    if (item.projectId === Item.projectID) {
                        if (item.saveType == "network"){
                            setIsNetworkSaved(true);
                        }
                    }
                });
            }
        });
    },[]);

    useEffect(()=>{

    })

  return (
    <View style={{flex: 1}}>
      <BoxShadow setting={shadowOpt}>
        <TouchableWithoutFeedback
          style={{
            width: '100%',
            height: '100%',
          }}
          onPress={async () =>{
             await AsyncStorage.getItem("savedServicesList").then(list=> {
                  if(!!list){
                      let flag = false;
                      JSON.parse(list).map(item=>{
                          if (item.projectId === Item.projectID) {
                              if (item.saveType === "self"){
                                  setModalState(true);
                              } else {
                                  setNetworkModalState(true);
                              }
                              setSelectedProjectId(Item.projectID);
                              flag = true;
                          }
                      });
                      if (!flag){
                          dispatch({
                              type:RESTORE_SERVICE_DATA,
                              savedServiceInfo:{
                                  projectId:"",
                                  factorReceivedPrice:"",
                                  factorTotalPrice:"",
                                  serviceDescription:"",
                                  address:"",
                                  time:"",
                                  date:"",
                                  finalDate: "",
                                  serviceResult:"",
                                  serviceType:"",
                                  objectList:[],
                                  startLatitude: "",
                                  startLongitude: "",
                                  endLatitude: "",
                                  endLongitude: "",
                                  startCity: "",
                                  endCity: "",
                                  missionDescription: ""
                              }
                          });
                          navigation.navigate('MyServiceDetails', {serviceID: Item.projectID})
                      }
                  } else {
                      dispatch({
                          type:RESTORE_SERVICE_DATA,
                          savedServiceInfo:{
                              projectId:"",
                              factorReceivedPrice:"",
                              factorTotalPrice:"",
                              serviceDescription:"",
                              address:"",
                              time:"",
                              date:"",
                              finalDate: "",
                              serviceResult:"",
                              serviceType:"",
                              objectList:[],
                              startLatitude: "",
                              startLongitude: "",
                              endLatitude: "",
                              endLongitude: "",
                              startCity: "",
                              endCity: "",
                              missionDescription: ""
                          }
                      });
                      navigation.navigate('MyServiceDetails', {serviceID: Item.projectID})
                  }
              });

          }}>
          <View
            style={{
              width: pageWidth * 0.9,
              height: pageHeight * 0.1,
              backgroundColor: isNetworkSaved? "#287495": "#fff",
              padding: 10,
              marginVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(158, 150, 150, 0.3)',
            }}>
              {isNetworkSaved?
                  (<View style={Styles.secondRowContainerStyle}>
                      <Text>درحال ارسال</Text>
                      <View style={Styles.singleItemStyle}>
                          <Text>{toFaDigit(Item.Name)}</Text>
                          <Text style={{fontWeight: 'bold'}}>نام: </Text>
                      </View>
                  </View>
              ):(
                <View style={Styles.firstRowContainerStyle}>
                  <View style={Styles.singleItemStyle}>
                      <Text>{toFaDigit(Item.Name)}</Text>
                      <Text style={{fontWeight: 'bold'}}>نام: </Text>
                  </View>
                </View>
              )}
            <View style={Styles.secondRowContainerStyle}>
                <View style={Styles.singleItemStyle}>
                    <Text>{toFaDigit(Item.projectID)}</Text>
                    <Text style={{fontSize: 13}}>شماره‌‌ماموریت: </Text>
                </View>
              <View style={Styles.singleItemStyle}>
                <Text>{toFaDigit(Item.cell)}</Text>
                <Text style={{fontSize: 13}}>همراه: </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </BoxShadow>
    </View>
  );
};

const Styles = StyleSheet.create({
    firstRowContainerStyle:{
        width: '100%',
        height: '50%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    secondRowContainerStyle:{
        width: '100%',
        height: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    singleItemStyle: {
        flexDirection: 'row',
    },
});

export default MyServiceListItem;
