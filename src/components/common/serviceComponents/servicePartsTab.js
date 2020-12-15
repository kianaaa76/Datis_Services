import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
  TextInput,
  ActivityIndicator,
  TouchableHighlight,
  Alert,
  Keyboard,
  BackHandler,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DropdownPicker from '../DropdownPicker';
import {useSelector} from 'react-redux';
import {getObjBySerial} from '../../../actions/api';
import {CameraKitCameraScreen} from 'react-native-camera-kit';
import {normalize, addDotsToPrice} from '../../utils/utilities';
import {atan} from "react-native-reanimated";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServicePartsTab = ({
  setInfo,
  info,
  navigation,
  renderSaveModal,
  hasNew,
  setHasNew,
}) => {
  const selector = useSelector(state => state);
  const [fieldsObject, setFieldsObject] = useState({
    objectType: '',
    serial: '',
    partTypeSelected: {},
    partVersionSelected: {},
    Price: '0',
    failureDescription: '',
    hasGarantee: null,
  });
  const dropRef = useRef();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isNewPartFormExpanded, setIsNewPartFormExpanded] = useState(false);
  const [partsListName, setPartsListName] = useState(selector.objectsList);
  const [selectedPartVersionsList, setSelectedPartVersionsList] = useState([]);
  const [screenMode, setScreenMode] = useState(false);
  const [searchBarcodeLoading, setSearchBarcodeLoading] = useState(false);
  const [objectsList, setObjectsList] = useState(info);
  const [selectedItemList, setSelectedItemList] = useState({});
  const [rerender, setRerender] = useState(false);
  const [qrScannerLoading, setQrScannerLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      renderSaveModal();
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  const onSuccess = async code => {
    setScreenMode(false);
    let header = parseInt(code.toString().substr(0, 3));
    numOfZeros = 0;
    while (code.toString()[numOfZeros] == '0') {
      numOfZeros = numOfZeros + 1;
    }
    let prefix = '';
    while (numOfZeros > 0) {
      prefix = '0'.concat(prefix);
      numOfZeros = numOfZeros - 1;
    }
    let selectedObject = partsListName.filter(
      item => prefix.concat(item.value.SerialBarcode) == header,
    );
    let serialHeaderIndex = selectedObject[0].value.SerialFormat.indexOf('#');
    let leftOfCode = code
      .toString()
      .substr(
        header.toString().length+numOfZeros,
        code.toString().length - header.toString().length,
      );
    if (selectedObject.length > 0) {
      getObjBySerial(
        selector.token,
        `${selectedObject[0].value.SerialFormat.substr(
          0,
          serialHeaderIndex,
        )}${leftOfCode}`,
        selectedObject[0].value.Id,
      ).then(data => {
        if (data.errorCode == 0) {
          let selectedVersion = selectedObject[0].value.Versions.filter(
            item => item.Key == data.result.VersionId,
          );
          if (!!selectedItemList.Id) {
            refactorObjectListItems(
              'tempPart',
              selectedObject[0],
              selectedItemList.index,
            );
            refactorObjectListItems(
              'tempVersion',
              selectedVersion[0],
              selectedItemList.index,
            );
            refactorObjectListItems(
              'tempSerial',
              `${selectedObject[0].value.SerialFormat.substr(
                0,
                serialHeaderIndex,
              )}${leftOfCode}`,
              selectedItemList.index,
            );
            setSelectedItemList({});
            setQrScannerLoading(false);
          } else {
            setFieldsObject({
              ...fieldsObject,
              partTypeSelected: selectedObject[0],
              partVersionSelected: selectedVersion[0],
              serial: `${selectedObject[0].value.SerialFormat.substr(
                0,
                serialHeaderIndex,
              )}${leftOfCode}`,
            });
            setQrScannerLoading(false);
          }
        } else {
          ToastAndroid.showWithGravity(
            data.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
          setQrScannerLoading(false);
        }
      });
    } else {
      ToastAndroid.showWithGravity(
        'کد اسکن شده معتبر نیست.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  const searchBarcode = selectedItemList => {
    setSearchBarcodeLoading(true);
    const object =
      !!selectedItemList && !!selectedItemList.id
        ? !!selectedItemList.partType
          ? selectedItemList.partType
          : null
        : !!fieldsObject.partTypeSelected
        ? fieldsObject.partTypeSelected
        : null;
    const sserial =
      !!selectedItemList && !!selectedItemList.id
        ? selectedItemList.serial.toUpperCase()
        : !!fieldsObject.serial
        ? fieldsObject.serial.toUpperCase()
        : null;
    if (!!object && !!sserial) {
      if (!!object.value.SerialFormat.length > 0) {
        let serialFormatHeader = object.value.SerialFormat.substr(
          0,
          object.value.SerialFormat.indexOf('#'),
        );
        let serialLengthWithoutHeader =
          object.value.SerialFormat.length - serialFormatHeader.length;
        let leftOfSerialFormat = object.value.SerialFormat.substr(
          object.value.SerialFormat.indexOf('#'),
          object.value.SerialFormat.length,
        );
        if (sserial.length === object.value.SerialFormat.length) {
          if (
            serialFormatHeader === sserial.substr(0, serialFormatHeader.length)
          ) {
            getObjBySerial(selector.token, sserial, object.value.Id).then(
              data => {
                if (data.errorCode == 0) {
                  let selectedVersion = object.value.Versions.filter(
                    item => item.Key == data.result.VersionId,
                  );
                  if (!!selectedItemList.id) {
                    refactorObjectListItems(
                      'tempPart',
                      object,
                      selectedItemList.index,
                    );
                    refactorObjectListItems(
                      'tempVersion',
                      selectedVersion[0],
                      selectedItemList.index,
                    );
                    setSelectedItemList({});
                  } else {
                    setFieldsObject({
                      ...fieldsObject,
                      partTypeSelected: object,
                      partVersionSelected: selectedVersion[0],
                    });
                  }
                  setSearchBarcodeLoading(false);
                } else {
                  setSearchBarcodeLoading(false);
                  ToastAndroid.showWithGravity(
                    data.errorCode,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                  );
                }
              },
            );
          } else {
            setSearchBarcodeLoading(false);
            ToastAndroid.showWithGravity(
              `فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
          }
        } else if (sserial.length === serialLengthWithoutHeader) {
          getObjBySerial(
            selector.token,
            `${serialFormatHeader}${sserial}`,
            object.value.Id,
          ).then(data => {
            if (data.errorCode == 0) {
              let selectedVersion = object.value.Versions.filter(
                item => item.Key == data.result.VersionId,
              );
              if (!!selectedItemList.id) {
                refactorObjectListItems(
                  'tempPart',
                  object,
                  selectedItemList.index,
                );
                refactorObjectListItems(
                  'tempVersion',
                  selectedVersion[0],
                  selectedItemList.index,
                );
                setSelectedItemList({});
              } else {
                setFieldsObject({
                  ...fieldsObject,
                  partTypeSelected: object,
                  partVersionSelected: selectedVersion[0],
                });
              }
              setSearchBarcodeLoading(false);
            } else {
              setSearchBarcodeLoading(false);
              ToastAndroid.showWithGravity(
                data.errorCode,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            }
          });
        } else {
          setSearchBarcodeLoading(false);
          ToastAndroid.showWithGravity(
            `فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }
      } else {
        setSearchBarcodeLoading(false);
        ToastAndroid.showWithGravity(
          'برای این قطعه باید نسخه را به صورت دستی وارد کنید.',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }
    } else {
      setSearchBarcodeLoading(false);
      ToastAndroid.showWithGravity(
        'لطفا نوع قطعه را مشخص کنید.',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  const refactorObjectListItems = (refactorFeild, newValue, objectIndex) => {
    let currentList = !!objectsList.length ? objectsList : [];
    let selectedObject = {};
    let Index = 0;
    currentList.map((item, index) => {
      if (item.index === objectIndex) {
        selectedObject = item;
        switch (refactorFeild) {
          case 'isExpanded':
            selectedObject = {...selectedObject, isExpanded: newValue};
            break;
          case 'availableVersions':
            selectedObject = {...selectedObject, availableVersions: newValue};
            break;
          case 'hasGarantee':
            selectedObject = {...selectedObject, hasGarantee: newValue};
            break;
          case 'tempSerial':
            selectedObject = {
              ...selectedObject,
              tempSerial: newValue,
              isConfirmed: false,
            };
            break;
          case 'tempPart':
            selectedObject = {
              ...selectedObject,
              tempPart: newValue,
              isConfirmed: false,
            };
            break;
          case 'tempVersion':
            selectedObject = {
              ...selectedObject,
              tempVersion: newValue,
              isConfirmed: false,
            };
            break;
          case 'tempPrice':
            selectedObject = {
              ...selectedObject,
              tempPrice: newValue,
              isConfirmed: false,
            };
            break;
          case 'tempFailureDescription':
            selectedObject = {
              ...selectedObject,
              tempFailureDescription: newValue,
              isConfirmed: false,
            };
            break;
          case 'setDirect':
            selectedObject = {
              ...selectedObject,
              serial: selectedObject.tempSerial,
              version: selectedObject.tempVersion,
              partType: selectedObject.tempPart,
              Price: selectedObject.tempPrice,
              failureDescription: selectedObject.tempFailureDescription,
              isExpanded: false,
              isConfirmed: true,
            };
            break;
        }
        Index = index;
      }
    });
    currentList.splice(Index, 1, selectedObject);
    setObjectsList(currentList);
    setInfo(currentList);
    setRerender(!rerender);
  };

  const renderServicePartItem = item => {
    let Item = item;
    return (
      <View
        style={[
          Styles.newformContainerStyle,
          {
            marginBottom: 10,
            backgroundColor: !Item.isConfirmed ? '#FF9090' : null,
          },
        ]}>
        <TouchableHighlight
          style={Styles.formHeaderStyle}
          onPress={() => {
            refactorObjectListItems('isExpanded', !Item.isExpanded, Item.index);
          }}
          underlayColor="none">
          <>
            <TouchableOpacity
              style={{
                width: 37,
                height: 37,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#660000',
                borderRadius: 5,
              }}
              onPress={() =>
                refactorObjectListItems(
                  'isExpanded',
                  !Item.isExpanded,
                  Item.index,
                )
              }>
              {Item.isExpanded ? (
                <Feather
                  name={'minus'}
                  style={{color: '#fff', fontSize: normalize(17)}}
                />
              ) : (
                <Feather
                  name={'plus'}
                  style={{color: '#fff', fontSize: normalize(17)}}
                />
              )}
            </TouchableOpacity>
            <Text
              style={{
                color: '#660000',
                fontSize: normalize(12),
                textAlign: 'center',
                fontFamily: 'IRANSansMobile_Light',
              }}>
              {!!Item.serial ? Item.serial : 'سریال'}
            </Text>
            <Text
              style={{
                color: '#660000',
                fontSize: normalize(12),
                textAlign: 'center',
                fontFamily: 'IRANSansMobile_Light',
              }}>
              {!!Item.partType ? Item.partType.label : 'نام'}
            </Text>
            {Item.objectType == 'new' ? (
              <FontAwesome5
                name={'arrow-right'}
                style={{color: 'green', fontSize: normalize(20)}}
              />
            ) : (
              <FontAwesome5
                name={'arrow-left'}
                style={{color: 'red', fontSize: normalize(20)}}
              />
            )}
          </>
        </TouchableHighlight>
        {Item.isExpanded && (
          <View style={Styles.bothOptionsContainerStyle}>
            <View style={Styles.partTypeContainerStyle}>
              <DropdownPicker
                list={partsListName}
                onSelect={value => {
                  refactorObjectListItems('tempPart', value, Item.index);
                  refactorObjectListItems('tempSerial', '', Item.index);
                  refactorObjectListItems('tempVersion', {}, Item.index);
                  refactorObjectListItems(
                    'availableVersions',
                    value.value.Versions,
                    Item.index,
                  );
                  dropRef.current.setList(value.value.Versions);
                }}
                placeholder={
                  !!Item.tempPart
                    ? Item.tempPart.label.length > 30
                      ? `${Item.tempPart.label.substr(0, 30)}...`
                      : `${Item.tempPart.label}`
                    : 'قطعه مورد نظر خود را انتخاب کنید.'
                }
                listHeight={150}
              />
              <Text
                style={{
                  fontSize: normalize(13),
                  fontFamily: 'IRANSansMobile_Light',
                }}>
                نوع قطعه:
              </Text>
            </View>
            <View style={Styles.serialContainerStyle}>
              {searchBarcodeLoading ? (
                <ActivityIndicator size={'small'} color={'#000'} />
              ) : (
                <Icon
                  name={'search'}
                  style={{color: '#000', fontSize: normalize(30)}}
                  onPress={async () => {
                    await setSelectedItemList(Item);
                    searchBarcode(Item);
                  }}
                />
              )}
              <Icon
                name={'qr-code-2'}
                style={{
                  color: '#000',
                  fontSize: normalize(30),
                  marginHorizontal: 5,
                }}
                onPress={() => {
                  setSelectedItemList(Item);
                  setScreenMode(true);
                }}
              />
              <TextInput
                style={Styles.serialInputStyle}
                onChangeText={text => {
                  refactorObjectListItems('tempSerial', text, Item.index);
                }}
                value={Item.tempSerial}
              />
              <View style={{flexDirection: 'row'}}>
                {!!Item.partType.label &&
                Item.tempPart.value.SerialFormat.length > 0 ? (
                  <Icon name={'star'} style={{color: 'red'}} />
                ) : null}
                <Text style={Styles.labelStyle}>سریال:</Text>
              </View>
            </View>
            <View style={Styles.partTypeContainerStyle}>
              <DropdownPicker
                ref={dropRef}
                list={Item.availableVersions}
                placeholder={
                  !!Item.tempVersion
                    ? Item.tempVersion.Value
                    : 'نسخه مورد نظر خود را انتخاب کنید.'
                }
                onSelect={item =>
                  refactorObjectListItems('tempVersion', item, Item.index)
                }
                listHeight={150}
              />
              <Text style={Styles.labelStyle}>نسخه: </Text>
            </View>
          </View>
        )}
        {Item.isExpanded && Item.objectType === 'new' ? (
          <View style={Styles.priceContainerStyle}>
            <Text style={Styles.labelStyle}>ریال</Text>
            <TextInput
              style={Styles.priceInputStyle}
              onChangeText={text =>
                refactorObjectListItems('tempPrice', text, Item.index)
              }
              value={addDotsToPrice(Item.tempPrice)}
              keyboardType="numeric"
            />
            <Text style={Styles.labelStyle}>قیمت:</Text>
          </View>
        ) : Item.isExpanded && Item.objectType === 'failed' ? (
          <View style={{marginTop: 15, width: '100%'}}>
            <Text style={Styles.labelStyle}>
              شرح نوع خرابی و علت احتمالی آن:{' '}
            </Text>
            <View style={Styles.failureDescriptionContainerStyle}>
              <Text style={[Styles.labelStyle, {marginBottom: 5}]}>
                توضیحات:{' '}
              </Text>
              <TextInput
                style={Styles.descriptionInputStyle}
                onChangeText={text =>
                  refactorObjectListItems(
                    'tempFailureDescription',
                    text,
                    Item.index,
                  )
                }
                value={Item.tempFailureDescription}
                multiline
              />
            </View>
            <View style={Styles.garanteeContainerStyle}>
              <Text style={{marginRight: 10}}>
                {!!Item.hasGarantee ? Item.hasGarantee : '-'}
              </Text>
              <Text style={Styles.labelStyle}>گارانتی:</Text>
            </View>
            <View style={Styles.prePriceContainerStyle}>
              <Text style={Styles.labelStyle}>ریال</Text>
              <TextInput
                style={Styles.prePriceInputStyle}
                onChangeText={text =>
                  refactorObjectListItems('tempPrice', text, Item.index)
                }
                value={addDotsToPrice(Item.tempPrice)}
                keyboardType="numeric"
              />
              <Text style={Styles.labelStyle}>مبلغ عودت داده شده:</Text>
            </View>
          </View>
        ) : null}
        {Item.isExpanded && (
          <View style={Styles.formFooterContainerstyle}>
            <TouchableOpacity
              style={Styles.footerIconContainerStyle}
              onPress={async () => {
                await setInfo(c => c.filter(_ => _.index !== Item.index));
                await setObjectsList(c =>
                  c.filter(_ => _.index !== Item.index),
                );
              }}>
              <Octicons
                name={'trashcan'}
                style={{fontSize: normalize(17), color: '#fff'}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={Styles.footerIconContainerStyle}
              onPress={() => {
                if (!Item.tempPart.label) {
                  Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else if (!Item.tempVersion.Key) {
                  Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else if (
                  !!Item.tempPart.value.SerialFormat &&
                  Item.tempSerial === ''
                ) {
                  Alert.alert('', 'لطفا سریال را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else {
                  const serialFormat = Item.tempPart.value.SerialFormat;
                  if (!!serialFormat) {
                    if (serialFormat.length === Item.tempSerial.length) {
                      let i = 0;
                      let faults = 0;
                      while (serialFormat[i] !== '#') {
                        if (
                          serialFormat[i].toUpperCase() !==
                          Item.tempSerial[i].toUpperCase()
                        ) {
                          faults = faults + 1;
                        }
                        i = i + 1;
                      }
                      if (faults > 0) {
                        Alert.alert(
                          '',
                          'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                          [{text: 'OK', onPress: () => {}}],
                        );
                      } else {
                        refactorObjectListItems('setDirect', '', Item.index);
                      }
                    } else {
                      let hashtagIndex = 0;
                      while (serialFormat[hashtagIndex] !== '#') {
                        hashtagIndex = hashtagIndex + 1;
                      }
                      let rest = serialFormat.length - hashtagIndex;
                      if (rest == Item.tempSerial.length) {
                        const actualSerial = serialFormat
                          .substr(0, hashtagIndex)
                          .concat(Item.tempSerial);
                        refactorObjectListItems('setDirect', '', Item.index);
                      } else {
                        Alert.alert(
                          '',
                          'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                          [{text: 'OK', onPress: () => {}}],
                        );
                      }
                    }
                  } else {
                    refactorObjectListItems('setDirect', '', Item.index);
                  }
                }
              }}>
              <Octicons
                name={'check'}
                style={{fontSize: normalize(17), color: '#fff'}}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const addNewObject = (list, serial) => {
    let maxIndex = 0;
    if (list.length > 0) {
      list.map(item => {
        if (item.index > maxIndex) {
          maxIndex = item.index;
        }
      });
    }
    list.push({
      index: maxIndex + 1,
      serial: serial,
      isExpanded: false,
      failureDescription: !!fieldsObject.failureDescription
        ? fieldsObject.failureDescription
        : '',
      hasGarantee: fieldsObject.hasGarantee,
      Price: !!fieldsObject.Price ? fieldsObject.Price : '0',
      objectType: fieldsObject.objectType,
      partType: fieldsObject.partTypeSelected,
      availableVersions: [],
      version: fieldsObject.partVersionSelected,
      tempPart: fieldsObject.partTypeSelected,
      tempVersion: fieldsObject.partVersionSelected,
      tempPrice: !!fieldsObject.Price ? fieldsObject.Price : '0',
      tempSerial: !!fieldsObject.serial
        ? fieldsObject.serial.toUpperCase()
        : '',
      isConfirmed: true,
      tempFailureDescription: !!fieldsObject.failureDescription
        ? fieldsObject.failureDescription
        : '',
    });
    if (fieldsObject.objectType == 'new') {
      setFieldsObject({
        ...fieldsObject,
        objectType: '',
        serial: '',
        partTypeSelected: {},
        partVersionSelected: {},
        Price: '',
        failureDescription: '',
        hasGarantee: null,
      });
      setHasNew(false);
      setObjectsList(list);
      setInfo(list);
    } else {
      setSelectedPartVersionsList(fieldsObject.partTypeSelected.value.Versions)
      setObjectsList(list);
      setInfo(list);
      let obj = {
        objectType: 'new',
        serial: '',
        partTypeSelected: fieldsObject.partTypeSelected,
        partVersionSelected: fieldsObject.partVersionSelected,
        Price: '0',
        failureDescription: '',
        hasGarantee: null,
      };
      setFieldsObject(obj);
    }
  };

  return !screenMode ? (
    <>
      {qrScannerLoading && (
        <View
          style={{
            flex:1,
            width:pageWidth,
            backgroundColor: '#000',
            opacity: 0.5,
            position: 'absolute',
            top:0,
            bottom:0,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf:"center",
            zIndex:9999
          }}>
          <ActivityIndicator size="large" color="#fff"/>
        </View>
      )}
      <ScrollView style={{flex: 0.8, padding: 15}}>
        {!!info && info.length > 0 && (
          <View style={{flex: 1, marginBottom: 10}}>
            {info.map(item => renderServicePartItem(item))}
          </View>
        )}
        {hasNew && (
          <View style={Styles.newformContainerStyle}>
            <View style={Styles.formHeaderStyle}>
              <TouchableOpacity
                style={{
                  width: 37,
                  height: 37,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#660000',
                  borderRadius: 5,
                }}
                onPress={() =>
                  setIsNewPartFormExpanded(!isNewPartFormExpanded)
                }>
                {isNewPartFormExpanded ? (
                  <Feather
                    name={'minus'}
                    style={{color: '#fff', fontSize: normalize(17)}}
                  />
                ) : (
                  <Feather
                    name={'plus'}
                    style={{color: '#fff', fontSize: normalize(17)}}
                  />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  color: '#660000',
                  fontSize: normalize(12),
                  textAlign: 'center',
                  fontFamily: 'IRANSansMobile_Light',
                }}>
                {!!fieldsObject.serial ? fieldsObject.serial : 'سریال'}
              </Text>
              <Text
                style={{
                  color: '#660000',
                  fontSize: normalize(12),
                  textAlign: 'center',
                  fontFamily: 'IRANSansMobile_Light',
                }}>
                {!!fieldsObject.partTypeSelected.label
                  ? fieldsObject.partTypeSelected.label
                  : 'نام'}
              </Text>
            </View>
            <View style={Styles.partTypeSelectionContainerStyle}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  onValueChange={value => {
                    if (value) {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'failed',
                      });
                      setIsNewPartFormExpanded(true);
                    } else {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: '',
                      });
                      setIsNewPartFormExpanded(false);
                    }
                  }}
                  value={fieldsObject.objectType === 'failed' ? true : false}
                  tintColors={{true: 'red', false: 'red'}}
                />
                <TouchableHighlight
                  onPress={() => {
                    if (fieldsObject.objectType == 'new') {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'failed',
                      });
                      setIsNewPartFormExpanded(true);
                    } else if (fieldsObject.objectType == 'failed') {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: '',
                      });
                      setIsNewPartFormExpanded(false);
                    } else {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'failed',
                      });
                      setIsNewPartFormExpanded(true);
                    }
                  }}
                  underlayColor="none">
                  <Text
                    style={{
                      color: '#000',
                      fontSize: normalize(12),
                      fontFamily: 'IRANSansMobile_Medium',
                    }}>
                    قطعه معیوب
                  </Text>
                </TouchableHighlight>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  onValueChange={value => {
                    if (value) {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'new',
                      });
                      setIsNewPartFormExpanded(true);
                    } else {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: '',
                      });
                      setIsNewPartFormExpanded(false);
                    }
                  }}
                  value={fieldsObject.objectType == 'new' ? true : false}
                  tintColors={{true: 'green', false: 'green'}}
                  style={{marginLeft: 20}}
                />
                <TouchableHighlight
                  onPress={() => {
                    if (fieldsObject.objectType == 'failed') {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'new',
                      });
                      setIsNewPartFormExpanded(true);
                    } else if (fieldsObject.objectType == 'new') {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: '',
                      });
                      setIsNewPartFormExpanded(false);
                    } else {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'new',
                      });
                      setIsNewPartFormExpanded(true);
                    }
                  }}
                  underlayColor="none">
                  <Text
                    style={{
                      color: '#000',
                      fontSize: normalize(12),
                      fontFamily: 'IRANSansMobile_Medium',
                    }}>
                    قطعه جدید
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
            {!!fieldsObject.objectType && isNewPartFormExpanded && (
              <View style={Styles.bothOptionsContainerStyle}>
                <View style={Styles.partTypeContainerStyle}>
                  <DropdownPicker
                    list={partsListName}
                    onSelect={async value => {
                      await setFieldsObject({
                        ...fieldsObject,
                        partTypeSelected: value,
                        serial: '',
                        partVersionSelected: {},
                      });
                      setSelectedPartVersionsList(value.value.Versions);
                      dropRef.current.setList(value.value.Versions);
                    }}
                    placeholder={
                      !!fieldsObject.partTypeSelected.label
                        ? fieldsObject.partTypeSelected.label.length > 30
                          ? `${fieldsObject.partTypeSelected.label.substr(
                              0,
                              30,
                            )}...`
                          : `${fieldsObject.partTypeSelected.label}`
                        : 'قطعه مورد نظر خود را انتخاب کنید.'
                    }
                    listHeight={150}
                  />
                  <Text style={Styles.labelStyle}>نوع قطعه:</Text>
                </View>
                <View style={Styles.serialContainerStyle}>
                  {searchBarcodeLoading ? (
                    <ActivityIndicator size={'small'} color={'#000'} />
                  ) : (
                    <Icon
                      name={'search'}
                      style={{
                        color: '#000',
                        fontSize: normalize(30),
                        marginHorizontal: 5,
                      }}
                      onPress={() => searchBarcode({})}
                    />
                  )}
                  <Icon
                    name={'qr-code-2'}
                    style={{
                      color: '#000',
                      fontSize: normalize(30),
                      marginHorizontal: 5,
                    }}
                    onPress={() => setScreenMode(true)}
                  />
                  <TextInput
                    style={Styles.serialInputStyle}
                    onChangeText={text => {
                      setFieldsObject({
                        ...fieldsObject,
                        serial: text,
                      });
                      setSelectedPartVersionsList([]);
                    }}
                    value={fieldsObject.serial}
                  />
                  <View style={{flexDirection: 'row'}}>
                    {!!fieldsObject.partTypeSelected.label &&
                    !!fieldsObject.partTypeSelected.value.SerialFormat ? (
                      <Icon name={'star'} style={{color: 'red'}} />
                    ) : null}
                    <Text style={Styles.labelStyle}>سریال:</Text>
                  </View>
                </View>
                <View style={Styles.partTypeContainerStyle}>
                  <DropdownPicker
                    ref={dropRef}
                    list={selectedPartVersionsList}
                    placeholder={
                      !!fieldsObject.partVersionSelected.Key
                        ? fieldsObject.partVersionSelected.Value
                        : 'نسخه مورد نظر خود را انتخاب کنید.'
                    }
                    onSelect={item =>
                      setFieldsObject({
                        ...fieldsObject,
                        partVersionSelected: item,
                      })
                    }
                    listHeight={150}
                  />
                  <Text style={Styles.labelStyle}>نسخه: </Text>
                </View>
              </View>
            )}
            {isNewPartFormExpanded && fieldsObject.objectType === 'new' ? (
              <View style={Styles.priceContainerStyle}>
                <Text style={Styles.labelStyle}>ریال</Text>
                <TextInput
                  style={Styles.priceInputStyle}
                  onChangeText={text =>
                    setFieldsObject({...fieldsObject, Price: text})
                  }
                  value={addDotsToPrice(fieldsObject.Price)}
                  keyboardType="numeric"
                />
                <Text style={Styles.labelStyle}>قیمت:</Text>
              </View>
            ) : isNewPartFormExpanded &&
              fieldsObject.objectType === 'failed' ? (
              <View style={{marginTop: 15, width: '100%'}}>
                <Text style={Styles.labelStyle}>
                  شرح نوع خرابی و علت احتمالی آن:{' '}
                </Text>
                <View style={Styles.failureDescriptionContainerStyle}>
                  <Text style={[Styles.labelStyle, {marginBottom: 5}]}>
                    توضیحات:{' '}
                  </Text>
                  <TextInput
                    style={Styles.descriptionInputStyle}
                    onChangeText={text =>
                      setFieldsObject({
                        ...fieldsObject,
                        failureDescription: text,
                      })
                    }
                    value={fieldsObject.failureDescription}
                    multiline
                  />
                </View>
                <View style={Styles.garanteeContainerStyle}>
                  <Text style={{marginRight: 10}}>
                    {!!fieldsObject.hasGarantee
                      ? fieldsObject.hasGarantee
                      : '-'}
                  </Text>
                  <Text style={Styles.labelStyle}>گارانتی:</Text>
                </View>
                <View style={Styles.prePriceContainerStyle}>
                  <Text style={Styles.labelStyle}>ریال</Text>
                  <TextInput
                    style={Styles.prePriceInputStyle}
                    onChangeText={text =>
                      setFieldsObject({...fieldsObject, Price: text})
                    }
                    value={addDotsToPrice(fieldsObject.Price)}
                    keyboardType="numeric"
                  />
                  <Text style={Styles.labelStyle}>مبلغ عودت داده شده:</Text>
                </View>
              </View>
            ) : null}
            <View style={Styles.formFooterContainerstyle}>
              <TouchableOpacity
                style={Styles.footerIconContainerStyle}
                onPress={() => {
                  setIsNewPartFormExpanded(false);
                  setHasNew(false);
                  setFieldsObject({
                    ...fieldsObject,
                    objectType: '',
                    serial: '',
                    partTypeSelected: {},
                    partVersionSelected: {},
                    failureDescription: '',
                    hasGarantee: null,
                    Price: '',
                  });
                }}>
                <Octicons
                  name={'trashcan'}
                  style={{fontSize: normalize(17), color: '#fff'}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={Styles.footerIconContainerStyle}
                onPress={() => {
                  if (
                    fieldsObject.objectType !== 'new' &&
                    fieldsObject.objectType !== 'failed'
                  ) {
                    Alert.alert(
                      '',
                      'لطفا جدید یا معیوب بودن قطعه را مشخص کنید.',
                      [{text: 'OK', onPress: () => {}}],
                    );
                  } else if (!fieldsObject.partTypeSelected.label) {
                    Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                      {text: 'OK', onPress: () => {}},
                    ]);
                  } else if (!fieldsObject.partVersionSelected.Key) {
                    Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                      {text: 'OK', onPress: () => {}},
                    ]);
                  } else if (
                    !!fieldsObject.partTypeSelected.value.SerialFormat &&
                    fieldsObject.serial === ''
                  ) {
                    Alert.alert('', 'لطفا سریال را مشخص کنید.', [
                      {text: 'OK', onPress: () => {}},
                    ]);
                  } else {
                    const serialFormat =
                      fieldsObject.partTypeSelected.value.SerialFormat;
                    if (!!serialFormat) {
                      if (serialFormat.length === fieldsObject.serial.length) {
                        let i = 0;
                        let faults = 0;
                        while (serialFormat[i] !== '#') {
                          if (
                            serialFormat[i].toUpperCase() !==
                            fieldsObject.serial[i].toUpperCase()
                          ) {
                            faults = faults + 1;
                          }
                          i = i + 1;
                        }
                        if (faults > 0) {
                          Alert.alert(
                            '',
                            'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                            [{text: 'OK', onPress: () => {}}],
                          );
                        } else {
                          let INFO = !!objectsList ? objectsList : [];
                          let SERIAL = !!fieldsObject.serial
                            ? fieldsObject.serial
                            : '';
                          addNewObject(INFO, SERIAL);
                        }
                      } else {
                        let hashtagIndex = 0;
                        while (serialFormat[hashtagIndex] !== '#') {
                          hashtagIndex = hashtagIndex + 1;
                        }
                        let rest = serialFormat.length - hashtagIndex;
                        if (rest == fieldsObject.serial.length) {
                          const actualSerial = serialFormat
                            .substr(0, hashtagIndex)
                            .concat(fieldsObject.serial);
                          let INFO = !!objectsList ? objectsList : [];
                          addNewObject(INFO, actualSerial);
                        } else {
                          Alert.alert(
                            '',
                            'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                            [{text: 'OK', onPress: () => {}}],
                          );
                        }
                      }
                    } else {
                      let INFO = !!objectsList ? objectsList : [];
                      let SERIAL = !!fieldsObject.serial
                        ? fieldsObject.serial
                        : '';
                      addNewObject(INFO, SERIAL);
                    }
                  }
                }}>
                <Octicons
                  name={'check'}
                  style={{fontSize: normalize(17), color: '#fff'}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      {!isKeyboardVisible && (
        <View style={{flex: 0.2, paddingHorizontal: 10}}>
          <TouchableOpacity
            style={Styles.newPartbuttonStyle}
            onPress={() => {
              if (hasNew) {
                ToastAndroid.showWithGravity(
                  'لطفا ابتدا قطعه ی ناتمام را کامل کنید.',
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER,
                );
              } else {
                setHasNew(true);
              }
            }}>
            <Octicons
              name="plus"
              style={{
                fontSize: normalize(33),
                color: '#dadfe1',
              }}
            />
          </TouchableOpacity>
        </View>
      )}
    </>
  ) : (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          width: pageWidth * 0.12,
          height: pageWidth * 0.12,
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 9999,
          borderRadius: pageWidth * 0.06,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setScreenMode(false)}>
        <Icon name="close" style={{fontSize: 30, color: '#000'}} />
      </TouchableOpacity>
      <CameraKitCameraScreen
        scanBarcode={true}
        laserColor={'#660000'}
        frameColor={'yellow'}
        onReadCode={event => {
          setQrScannerLoading(true);
          setScreenMode(false);
          onSuccess(event.nativeEvent.codeStringValue);
        }} 
        hideControls={false} 
        showFrame={true}
        colorForScannerFrame={'red'} 
      />
    </>
  );
};

const Styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barcodeContainerStyle: {
    width: pageWidth * 0.7,
    height: pageWidth * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'green',
  },
  barcodeLineStyle: {
    width: pageWidth * 0.5,
    height: 0,
    borderWidth: 1,
    borderColor: '#660000',
  },
  newPartbuttonStyle: {
    width: pageWidth * 0.2,
    height: pageWidth * 0.2,
    borderRadius: pageWidth * 0.1,
    backgroundColor: '#660000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newformContainerStyle: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 8,
    marginBottom: 30,
  },
  formContainerStyle: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
  },
  formHeaderStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ItemFromHeaderStyle: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partTypeSelectionContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formFooterContainerstyle: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  footerIconContainerStyle: {
    width: 35,
    height: 35,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#660000',
    marginHorizontal: 10,
  },
  partTypeContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  bothOptionsContainerStyle: {
    marginTop: 10,
  },
  serialContainerStyle: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serialInputStyle: {
    width: '55%',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    height: 40,
    marginHorizontal: 10,
  },
  priceContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  priceInputStyle: {
    width: '70%',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    marginHorizontal: 10,
    height: 40,
    paddingHorizontal: 10,
  },
  descriptionInputStyle: {
    width: '100%',
    height: pageHeight * 0.15,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    textAlignVertical: 'top',
    padding: 15,
  },
  failureDescriptionContainerStyle: {
    width: '100%',
    marginVertical: 10,
  },
  garanteeContainerStyle: {
    width: '100%',
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  prePriceContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 10,
    width: '100%',
  },
  prePriceInputStyle: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    padding: 10,
    marginHorizontal: 5,
  },
  labelStyle: {
    fontSize: normalize(13),
    fontFamily: 'IRANSansMobile_Light',
  },
});

export default ServicePartsTab;
