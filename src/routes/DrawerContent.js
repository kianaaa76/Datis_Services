import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import logo from '../../assets/images/image_splash_screen.png';

const DrawerContent = ({navigation}) => {
  return (
    <View style={{flex: 1}}>
      <View style={Styles.headerContainerStyle}>
        <Image source={logo} style={{resizeMode: 'contain', width: 120}} />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Garantee')}
        style={Styles.titleContainerStyle}>
        <Text style={Styles.titleTextStyle}>استعلام گارانتی</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={Styles.titleContainerStyle}
        onPress={()=> navigation.navigate('PriceList')
        //     Linking.openURL(
        //   'http://deka.datis-elevator.ir/download/ServicePriceList.pdf',
        // )
        }>
        <Text style={Styles.titleTextStyle}>لیست قیمت قطعات</Text>
      </TouchableOpacity>
    </View>
  );
};

const Styles = StyleSheet.create({
  titleTextStyle: {
    fontSize: 14,
    fontFamily: 'IRANSansMobile_Light',
    color: '#000',
  },
  titleContainerStyle: {
    alignSelf: 'center',
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderColor: '#A0A0A0',
  },
  headerContainerStyle: {
    flex: 0.4,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DrawerContent;
