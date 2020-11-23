import React, {PureComponent} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import {toFaDigit, normalize} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

class MissionListItem extends PureComponent {
  render() {
    const Item = this.props.item.item;
    const navigation = this.props.navigation;
    // const Item = item.item;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate('MissionDetail', {mission: Item});
        }}>
        <View
          style={{
            width: pageWidth * 0.9,
            height: pageHeight * 0.1,
            backgroundColor: !!Item.EndDate ? '#fff' : 'red',
            padding: 10,
            marginVertical: 4,
            marginHorizontal: 3,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 3,
          }}>
          <View style={Styles.firstRowContainerStyle}>
            <View style={Styles.singleItemStyle}>
              <Text style={Styles.valueTextStyle}>{toFaDigit(Item.Id)}</Text>
              <Text style={Styles.titleTextStyle}>شماره‌‌ماموریت: </Text>
            </View>
            <View style={Styles.singleItemStyle}>
              <Text style={Styles.valueTextStyle}>
                {toFaDigit(Item.StartDate)}
              </Text>
              <Text style={Styles.titleTextStyle}>شروع: </Text>
            </View>
          </View>
          <View style={Styles.secondRowContainerStyle}>
            <View style={Styles.singleItemStyle}>
              <Text style={Styles.valueTextStyle}>
                {toFaDigit(Item.EndDate)}
              </Text>
              <Text style={Styles.titleTextStyle}>پایان: </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  firstRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondRowContainerStyle: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  singleItemStyle: {
    flexDirection: 'row',
  },
  titleTextStyle: {
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Medium',
  },
  valueTextStyle: {
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
  },
});

export default MissionListItem;
