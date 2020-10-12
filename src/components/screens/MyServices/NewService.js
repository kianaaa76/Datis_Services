import React,{useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  PermissionsAndroid,
  ToastAndroid,
    ActivityIndicator
} from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { selectContactPhone } from 'react-native-select-contact';
import {useSelector, useDispatch} from 'react-redux';
import {BoxShadow} from 'react-native-shadow';
import Header from "../../common/Header";
import {submitNewService} from "../../../actions/api";
import {LOGOUT} from "../../../actions/types";

const pageWidth = Dimensions.get("screen").width;
const pageHeight = Dimensions.get("screen").height;

const shadowOpt = {
  width: pageWidth * 0.32,
  height: pageWidth * 0.16,
  color: '#000',
  radius: 1,
  opacity: 0.2,
  x: 0,
  y: 3,
  style: {justifyContent:"center", alignItems:"center"},
};

const NewService = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [projectSerial, setProjectSerial] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getPhoneByContacts = () =>{
    let granted = PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
    if (!!granted){
      selectContactPhone().then(selection =>{
        setName(selection.contact.name);
        setPhone(selection.selectedPhone.number);
      })
    }
  }

  const onConfirmPress = (token, servicemanId, name, phone, address, serial) => {
    submitNewService(token, servicemanId, name, phone, address, serial).then(data=>{
      setConfirmLoading(true);
      if (data.errorCode === 0){
        setConfirmLoading(false);
        navigation.replace("MyServices");
      }
      else {
        if (data.errorCode == 3){
          dispatch({
            type: LOGOUT
          });
          navigation.navigate("SignedOut");
        } else {
          ToastAndroid.showWithGravity(
              data.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
          );
        }
        setConfirmLoading(false);
      }
    })
  }

  return (
      <ScrollView
          style={Styles.containerStyle}
          contentContainerStyle={Styles.contentContainerStyle}
          keyboardShouldPersistTaps="handled"
      >
        <Header headerText={"سرویس جدید"}/>
        <View style={Styles.contentStyle}>
          <View style={Styles.singleItemContainerStyle}>
            <Text>نام و نام خانوادگی صاحب پروژه</Text>
            <View style={Styles.nameRowInputStyle}>
              <View style={Styles.iconContainerStyle}>
                <FontAwesome
                    name={"phone"}
                    style={{color:"#000", fontSize:30}}
                    onPress={getPhoneByContacts}/>
              </View>
              <TextInput
                  placeholder={"نام و نام خانوادگی"}
                  placeholderTextColor={"#DBDBDB"}
                  style={Styles.textInputStyle}
                  onChangeText={text=>setName(text)}
                  value={name}
              />
              <View style={Styles.iconContainerStyle}/>
            </View>
          </View>
          <View style={Styles.singleItemContainerStyle}>
            <Text>شماره تماس صاحب پروژه</Text>
            <TextInput
                placeholder={"شماره همراه"}
                style={Styles.textInputStyle}
                placeholderTextColor={"#DBDBDB"}
                keyboardType={"numeric"}
                onChangeText={text=>setPhone(text)}
                value={phone}
            />
          </View>
          <View style={Styles.singleItemContainerStyle}>
            <Text>آدرس محل پروژه</Text>
            <TextInput
                placeholder={"آدرس"}
                style={Styles.textInputStyle}
                placeholderTextColor={"#DBDBDB"}
                onChangeText={text=>setAddress(text)}
                value={address}
            />
          </View>
          <View style={Styles.singleItemContainerStyle}>
            <Text>سریال پروژه</Text>
            <TextInput
                placeholder={"سریال"}
                style={Styles.textInputStyle}
                placeholderTextColor={"#DBDBDB"}
                keyboardType={"numeric"}
                onChangeText={text=>setProjectSerial(text)}
                value={projectSerial}
            />
          </View>
              <BoxShadow setting={shadowOpt}>
                {confirmLoading?(
                    <View style={Styles.buttonStyle}>
                      <ActivityIndicator size={"small"} color={"#fff"}/>
                    </View>
                ):(<TouchableOpacity style={Styles.buttonStyle} onPress={() => {
                  onConfirmPress(selector.token, selector.userId, name, phone, address, projectSerial);
                }}>
                  <Text style={Styles.buttonTextStyle}>
                    ثبت
                  </Text>
                </TouchableOpacity>)}
              </BoxShadow>
        </View>
      </ScrollView>
  );
};

const Styles = StyleSheet.create({
  containerStyle:{
    width:pageWidth,
    height:pageHeight,
    backgroundColor:"#fff"
  },
  contentContainerStyle:{
    flexGrow:1,
    justifyContent:"center",
    alignItems:"center"
  },
  contentStyle:{
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  nameRowInputStyle:{
    flexDirection: "row",
    alignItems:"center",
    justifyContent:"space-around"
  },
  textInputStyle:{
    width:pageWidth*0.6,
    height:pageHeight*0.07,
    borderBottomWidth:2,
    borderBottomColor:"#660000",
    textAlign: "center"
  },
  buttonStyle:{
    backgroundColor: "#660000",
    width: pageWidth * 0.32,
    height: pageWidth * 0.16,
    justifyContent:"center",
    alignItems:"center"
  },
  buttonTextStyle:{
    textAlign:"center",
    color: "#fff",
    fontSize:17
  },
  singleItemContainerStyle:{
    width:"100%",
    height:pageHeight*0.1,
    justifyContent:"space-between",
    alignItems:"center"
  },
  iconContainerStyle: {
    width:pageWidth*0.12,
    height:pageWidth*0.12,
    justifyContent:"center",
    alignItems:"center"
  }
})

export default NewService;
