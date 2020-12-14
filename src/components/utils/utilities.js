import {Dimensions, Platform, PixelRatio} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// based on iphone 5s's scale
const scale = SCREEN_WIDTH / 320;

export function normalize(size) {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
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

export function addDotsToPrice(price) {
  if (price.length > 0) {
    let removedDots = price.split('.').join("");
    let reverseString = removedDots
      .split('')
      .reverse()
      .join('');
    reverseString = reverseString.match(/.{1,3}/g);
    stringSplited = reverseString.reverse();
    let finalString = '';
    stringSplited.map((item, index) => {
      finalString = finalString.concat(
        item
          .split('')
          .reverse()
          .join(''),
      );
      if (index != stringSplited.length - 1) {
        finalString = finalString.concat('.');
      }
    });
    return finalString;
  } else {
    return price;
  }
}
