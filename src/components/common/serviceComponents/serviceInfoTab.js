import React, {useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Linking,
  Dimensions,
  BackHandler,
} from 'react-native';
import {toFaDigit, normalize} from '../../utils/utilities';
import Icon from 'react-native-vector-icons/FontAwesome';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServiceInfoTab = ({serviceData, renderSaveModal}) => {
  const data = serviceData;
  // console.log("dataaaa", data);

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

  const renderSingleRow = (title, text) => {
    return (
      <View style={Styles.singleRowStyle}>
        <View>
          {title === 'شماره تماس' ? (
            <Icon
              name={'phone-square'}
              style={{fontSize: normalize(30), color: 'gray', marginLeft: 10}}
              onPress={() => Linking.openURL(`tel:${text}`)}
            />
          ) : null}
        </View>
        <View style={Styles.rightSideContainerStyle}>
          {!!text ? (
            <Text style={Styles.textStyle}>{text}</Text>
          ) : (
            <Text style={Styles.textStyle}>-</Text>
          )}
          <Text style={Styles.titleTextStyle}>{`${title}:   `}</Text>
        </View>
      </View>
    );
  };
  return (
    <ScrollView
      style={{flex: 1, padding: 10}}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="on-drag">
      {renderSingleRow('شماره پرونده', toFaDigit(data.projectID))}
      {renderSingleRow('نام', data.DocText.PhoneName)}
      {renderSingleRow('شماره تماس', toFaDigit(data.DocText.Phone))}
      {renderSingleRow('سریال', data.DocText.Serial)}
      {renderSingleRow('گارانتی برد', data.DocText.WarS)}
      {renderSingleRow('تاریخ تولید', toFaDigit(data.DocText.DOM))}
      {renderSingleRow('آدرس', data.DocText.Address)}
      {renderSingleRow('علت خرابی', data.DocText.DetectedFailure)}
      {renderSingleRow('قطعات مورد نیاز', data.DocText.parts)}
      {renderSingleRow('زمان اعلام', toFaDigit(data.DocText.Date))}
    </ScrollView>
  );
};

const Styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: '#fff',
    flex: 1,
  },
  singleRowStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  titleTextStyle: {
    fontSize: normalize(14),
    fontFamily: 'IRANSansMobile_Medium',
    width: '39%',
  },
  textStyle: {
    fontSize: normalize(14),
    textAlign: 'right',
    width: pageWidth - 160,
    fontFamily: 'IRANSansMobile_Light',
    flexShrink: 1,
  },
  rightSideContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '88%',
    height: '100%',
    marginBottom: 15,
  },
});

export default ServiceInfoTab;
