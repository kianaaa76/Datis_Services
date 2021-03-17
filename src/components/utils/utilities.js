import {Dimensions, PixelRatio, Platform} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize))-2;
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 4;
  }
}

export function toFaDigit(input) {
  if (input == undefined) return;
  var returnModel = '',
    symbolMap = {
      '1': '۱',
      '2': '۲',
      '3': '۳',
      '4': '۴',
      '5': '۵',
      '6': '۶',
      '7': '۷',
      '8': '۸',
      '9': '۹',
      '0': '۰',
    };
  input = input.toString();
  for (var i = 0; i < input.length; i++)
    if (symbolMap[input[i]]) returnModel += symbolMap[input[i]];
    else returnModel += input[i];
  return returnModel;
}

export function getFontsName(name) {
  if (Platform.OS === "android") {
    return name;
  } else {
    if (name === 'IRANSansMobile_Medium') {
      return 'IRANSansMobile-Medium';
    } else if (name === 'IRANSansMobile_Light') {
      return 'IRANSansMobile-Light';
    } else if (name === 'IRANSansMobile_Bold') {
      return 'IRANSansMobile-Bold';
    } else if (name === 'IRANSansMobile') {
      return name;
    }
  }
}
