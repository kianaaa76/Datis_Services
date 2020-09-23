import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import {useSelector, useDispatch} from 'react-redux';
import {getMissionList} from '../../actions/api';
import {
  GET_MISSION_LIST_SUCCESS,
  GET_MISSION_LIST_FAIL,
} from '../../actions/types';
import Header from '../common/Header';
import MissionListItem from '../utils/missionListItem';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionList = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [missionListLoading, setMissionListLoading] = useState(false);
  const getMissions = () => {
    setMissionListLoading(true);
    getMissionList(selector.userId, selector.token).then(data => {
      if (data.errorCode == 0) {
        dispatch({
          type: GET_MISSION_LIST_SUCCESS,
          error: '',
          missionList: data.result,
        });
      } else {
        dispatch({
          type: GET_MISSION_LIST_FAIL,
          error: data.message,
        });
        ToastAndroid.showWithGravity(
          data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
      setMissionListLoading(false);
    });
  };

  useEffect(() => {
    getMissions();
  }, []);

  const renderEmptyList = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 15, fontWeight: 'bold', color: '#000'}}>
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
              data={selector.missionList}
              renderItem={item => (
                <MissionListItem item={item} navigation={navigation} />
              )}
              keyExtractor={item => item.ID.toString()}
              ListEmptyComponent={() => renderEmptyList()}
            />
          </View>
          <TouchableOpacity
            style={Styles.newMissionbuttonStyle}
            onPress={() => {
              if (!!selector.unfinishedMissionId) {
                ToastAndroid.showWithGravity(
                  'به دلیل وجود ماموریت ناتمام امکان ایجاد ماموریت جدید وجود ندارد.',
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER,
                );
              } else {
                navigation.navigate('NewMissionStart');
              }
            }}>
            <Octicons
              name="plus"
              style={{
                fontSize: 33,
                color: '#dadfe1',
              }}
            />
          </TouchableOpacity>
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
    height: pageHeight * 0.95,
    backgroundColor: '#fff',
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
