import React, {useState, useEffect} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Text,
  BackHandler
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useSelector, useDispatch} from 'react-redux';
import {getMissionList} from '../../../actions/api';
import {LOGOUT} from '../../../actions/types';
import Header from '../../common/Header';
import MissionListItem from '../../utils/missionListItem';
import {normalize} from '../../utils/utilities';
import {RefreshIcon, SearchIcon} from "../../../assets/icons";
const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const MissionList = ({navigation}) => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [missionListLoading, setMissionListLoading] = useState(false);
  const [missionList, setMissionList] = useState([]);
  const [showingMissionList, setShowingMissionList] = useState([]);

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

  const getMissions = () => {
    setMissionListLoading(true);
    getMissionList(selector.userId, selector.token).then(data => {
      if (data.errorCode === 0) {
        setMissionList(data.result);
        setShowingMissionList(data.result);
      } else {
        if (data.errorCode === 3) {
          dispatch({
            type: LOGOUT,
          });
          navigation.navigate('SignedOut');
        } else {
          Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
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
      <View
        style={{
          width: pageWidth,
          height: pageHeight * 0.8,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: normalize(15),
            fontFamily: 'IRANSansMobile_Medium',
            color: '#000',
          }}>
          ماموریتی وجود ندارد.
        </Text>
      </View>
    );
  };

  const searchCity = city => {
    if (city.length > 0) {
      setShowingMissionList(
        missionList.filter(
          i =>
            (!!i.StartCity && i.StartCity.includes(city)) ||
            (!!i.EndCity && i.EndCity.includes(city)),
        ),
      );
    } else {
      setShowingMissionList(missionList);
    }
  };

  return (
    <View style={Styles.containerStyle}>
      <Header
        headerText="ماموریت‌های من"
        leftIcon={
          RefreshIcon({
            color:"#fff",
            onPress:() => getMissions(),
            style:{
              fontSize: normalize(30)
            }
          })
        }
      />
      {missionListLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#66000" />
        </View>
      ) : (
        <View style={Styles.contentContianerStyle}>
          <View style={Styles.searchInputContainerStyle}>
            <TextInput
              onChangeText={city => searchCity(city)}
              style={Styles.searchInputStyle}
              placeholder={'شهر مورد نظر خود را جستجو کنید...'}
            />
            {SearchIcon({
              color: "#000"
            })}
          </View>
          <View style={Styles.flatlistContainerStyle}>
            <FlatList
              data={showingMissionList}
              renderItem={item => (
                <MissionListItem item={item} navigation={navigation} />
              )}
              keyExtractor={item => item.ID.toString()}
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
    alignItems: 'center',
  },
  flatlistContainerStyle: {
    flex:1,
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
  searchInputContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: pageWidth * 0.9,
    height: pageHeight * 0.08,
    borderRadius: 10,
    borderColor: '#000',
    marginBottom: 10,
    padding: 5,
    elevation: 5,
  },
  searchInputStyle: {
    width: '85%',
    padding: 5,
    marginRight: '5%',
  },
});

export default MissionList;
