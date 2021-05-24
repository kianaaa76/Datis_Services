import React, {useState, useEffect} from 'react';
import {
    View,
    FlatList,
    Dimensions,
    ActivityIndicator,
    StyleSheet,
    Text,
    BackHandler
} from 'react-native';
import Toast from "react-native-simple-toast";
import {useSelector, useDispatch} from 'react-redux';
import {unsettledServiceList} from '../../../actions/api';
import {LOGOUT} from '../../../actions/types';
import Header from '../../common/Header';
import RemainingServiceListItem from '../../utils/RemainingServiceListItem';
import {normalize, getFontsName} from "../../utils/utilities";
import {RefreshIcon} from "../../../assets/icons";


const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RemainingServiceList = ({navigation}) => {
    const dispatch = useDispatch();
    const selector = useSelector((state) => state);
    const [listLoading, setListLoading] = useState(false);
    const [serviceList, setServiceList] = useState([]);

    useEffect(() => {
        const backAction = () => {
          navigation.goBack();
          return true;
        };
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          backAction,
        );
        return () => backHandler.remove();
      });

    const getServices = () => {
        setListLoading(true);
        unsettledServiceList(selector.userId, selector.token).then(data => {
            if (data.errorCode === 0) {
                setServiceList(data.result);
            } else {
                if (data.errorCode === 3){
                    dispatch({
                        type:LOGOUT
                    });
                    navigation.navigate("SignedOut");
                } else {
                    setServiceList([]);
                    Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                }
            }
            setListLoading(false);
        });
    };

    useEffect(() => {
        getServices();
    }, []);

    const renderEmptyList = () => {
        return (
            <View style={{width:pageWidth, height: pageHeight*0.8, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: normalize(15), fontFamily:getFontsName("IRANSansMobile"), color: '#000'}}>
                    شما سرویس مانده دار ندارید.
                </Text>
            </View>
        );
    };

    return (
        <View style={Styles.containerStyle}>
            <Header
                headerText="سرویس های مانده دار"
                leftIcon={
                    RefreshIcon({
                        color:"#fff",
                        onPress:() => getServices(),
                        style:{
                            fontSize: normalize(30)
                        }
                    })
                }
                isCurrentRootHome={false}
                onBackPress={()=>navigation.goBack()}
            />
            {listLoading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#66000" />
                </View>
            ) : (
                <View style={Styles.contentContianerStyle}>
                        <FlatList
                            data={serviceList}
                            renderItem={(item) => (
                                <RemainingServiceListItem item={item} navigation={navigation} />
                            )}
                            keyExtractor={(item) => item.projectID.toString()}
                            ListEmptyComponent={() => renderEmptyList()}
                        />
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
    contentContianerStyle: {
        flex: 1,
        padding: 5,
    },
    newMissionbuttonStyle: {
        width: pageWidth * 0.2,
        height: pageWidth * 0.2,
        borderRadius: pageWidth * 0.1,
        backgroundColor: '#660000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: pageWidth * 0.05,
        left: pageWidth * 0.05,
    },
});

export default RemainingServiceList;
