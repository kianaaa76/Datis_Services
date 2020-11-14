import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {getMissionList} from '../../../actions/api';
import {LOGOUT} from '../../../actions/types';
import Header from '../../common/Header';
import MissionListItem from '../../utils/missionListItem';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionList = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const [missionListLoading, setMissionListLoading] = useState(false);
  const [missionList, setMissionList] = useState([]);
  const getMissions = () => {
    setMissionListLoading(true);
    getMissionList(selector.userId, selector.token).then((data) => {
      if (data.errorCode === 0) {
        setMissionList(data.result);
      } else {
        if (data.errorCode === 3){
          dispatch({
            type:LOGOUT
          });
          navigation.navigate("SignedOut");
        } else {
          ToastAndroid.showWithGravity(
              data.message,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
          );
        }
      }
      setMissionListLoading(false);
    });
  };

  useEffect(() => {
    getMissions();
  }, []);

  const renderEmptyList = () => {
    return (
      <View style={{width:pageWidth,height:pageHeight*0.8, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 15, fontFamily:"IRANSansMobile_Medium", color: '#000'}}>
          ماموریتی وجود ندارد.
        </Text>
      </View>
    );
  };

  return (
    <View style={Styles.containerStyle}>
      <Header
        headerText="ماموریت‌های من"
        leftIcon={
          <Icon
            name="refresh"
            style={{
              fontSize: 30,
              color: '#dadfe1',
            }}
            onPress={() => getMissions()}
          />
        }
      />
      {missionListLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#66000" />
        </View>
      ) : (
        <View style={Styles.contentContianerStyle}>
          <View style={Styles.flatlistContainerStyle}>
            <FlatList
              data={missionList}
              renderItem={(item) => (
                <MissionListItem item={item} navigation={navigation} />
              )}
              keyExtractor={(item) => item.Id.toString()}
              ListEmptyComponent={() => renderEmptyList()}
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
  contentContianerStyle: {
    flex: 1,
    padding: 5,
  },
  flatlistContainerStyle: {
    width: pageWidth * 0.95,
    justifyContent: 'center',
    alignItems: 'center',
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

export default MissionList;
