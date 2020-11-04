import React, {useState,useEffect} from 'react';
import {
    View,
    Image,
    ImageBackground,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    Text,
    BackHandler,
    Linking,
    ActivityIndicator
} from 'react-native';
import {BoxShadow} from 'react-native-shadow';
import {useSelector} from 'react-redux';
import VersionInfo from 'react-native-version-info';
import backgroundImage from '../../../assets/images/background_splash_screen.jpg';
import splashImage from '../../../assets/images/image_splash_screen.png';
import {checkUpdate, getUsers} from "../../actions/api";

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const shadowOpt = {
    width: pageWidth * 0.32,
    height: pageWidth * 0.16,
    color: '#000',
    radius: 7,
    opacity: 0.2,
    x: 0,
    y: 3,
    style: {justifyContent:"center", alignItems:"center"},
};

const Splash = ({navigation}) => {
    const selector = useSelector((state) => state);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [usersList, setUsersList] = useState([]);

    useEffect(()=>{
        if (usersList.length === 0){
            getUsers().then(data=>{
                if (data.errorCode === 0) {
                    setUsersList(data.result);
                }
            })
        }
    })

    useEffect(()=>{
        if (usersList.length>0){
            let version = VersionInfo.appVersion;
            checkUpdate(version).then(data=>{
                if (data.errorCode === 5) {
                    setShowUpdateModal(true);
                } else {
                    if (!!selector.token){
                        navigation.navigate("Home", {users:usersList})
                    } else {
                        navigation.navigate("SignedOut");
                    }
                }
            });
        }
    });

    return (
        <ImageBackground source={backgroundImage} style={Styles.containerStyle}>
            <Image source={splashImage} style={{width:pageWidth*0.55, height: pageWidth*0.22}}/>
            {showUpdateModal && (<View style={Styles.modalBackgroundStyle}>
                <View style={Styles.modalContainerStyle}>
                    <View style={Styles.modalHeaderContainerStyle}>
                        <Text style={Styles.modalHeaderTextStyle}>
                            داتیس سرویس
                        </Text>
                    </View>
                    <View style={Styles.modalBodyContainerStyle}>
                        <Text style={Styles.modalBodyTextStyle}>
                            نسخه فعلی برنامه قدیمی است. لطفا به روزرسانی کنید.
                        </Text>
                    </View>
                    <View style={Styles.modalFooterContainerStyle}>
                        <BoxShadow setting={shadowOpt}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    BackHandler.exitApp()
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>
                                    بازگشت
                                </Text>
                            </TouchableOpacity>
                        </BoxShadow>
                        <BoxShadow setting={shadowOpt}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    Linking.openURL("http://deka.datis-elevator.ir/apk/DatisService.apk")
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>
                                    به روزرسانی
                                </Text>
                            </TouchableOpacity>
                        </BoxShadow>
                    </View>
                </View>
            </View>)}
        </ImageBackground>
    )
}

const Styles = StyleSheet.create({
    containerStyle : {
        flex: 1,
        width:pageWidth,
        justifyContent: 'center',
        alignItems:'center',
        alignSelf: 'center',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    modalBackgroundStyle:{
        width:pageWidth,
        height: pageHeight,
        position: "absolute",
        backgroundColor:"rgba(0,0,0,0.5)",
        justifyContent:"center",
        alignItems:"center",
    },
    modalContainerStyle:{
        width:pageWidth*0.85,
        height:pageHeight*0.35,
        backgroundColor:"#E8E8E8",
        borderRadius: 15,
        overflow:"hidden"
    },
    modalHeaderContainerStyle:{
        width:"100%",
        height:"20%",
        backgroundColor:"#660000",
        justifyContent:"center",
        paddingHorizontal:10
    },
    modalHeaderTextStyle:{
        color:"#fff",
        fontSize:18
    },
    modalBodyContainerStyle:{
        width:"100%",
        height:"50%",
        justifyContent:"center",
        alignItems:"center",
        padding: 10
    },
    modalBodyTextStyle:{
        color: "#660000",
        textAlign:"center",
        fontSize: 17
    },
    modalFooterContainerStyle:{
        flexDirection:"row",
        width:"100%",
        height:"30%",
        justifyContent:"space-around",
    },
    modalButtonStyle:{
        backgroundColor:"#fff",
        width:"97%",
        height:"97%",
        borderRadius:7,
        justifyContent:"center",
        alignItems:"center"
    },
    modalButtonTextStyle:{
        color:"gray",
        fontSize:16,
        fontWeight:"bold"
    }
})

export default Splash;
