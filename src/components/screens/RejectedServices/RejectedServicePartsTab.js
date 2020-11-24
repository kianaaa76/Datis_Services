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
import DropdownPicker from '../../common/DropdownPicker';
import {useSelector} from 'react-redux';
import {getObjBySerial} from '../../../actions/api';
import {RNCamera} from 'react-native-camera';
import {normalize} from '../../utils/utilities';

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const ServicePartsTab = ({setInfo, info, navigation, renderSaveModal}) => {
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
  const [newHasStarted, setNewHasStarted] = useState(Boolean);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isNewPartFormExpanded, setIsNewPartFormExpanded] = useState(false);
  const [partsListName, setPartsListName] = useState(selector.objectsList);
  const [selectedPartVersionsList, setSelectedPartVersionsList] = useState([]);
  const [screenMode, setScreenMode] = useState(false);
  const [searchBarcodeLoading, setSearchBarcodeLoading] = useState(false);
  const [objectsList, setObjectsList] = useState(info);
  const [refresh, setRefresh] = useState(false);
  const [selectedItemList, setSelectedItemList] = useState({});

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
      if (screenMode) {
        setScreenMode(false);
      } else {
        renderSaveModal();
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  const onSuccess = async code => {
    await setScreenMode(false);
    let header = parseInt(code.data.toString().substr(0, 3));
    let selectedObject = partsListName.filter(
      item => item.value.SerialBarcode == header,
    );
    let serialHeaderIndex = selectedObject[0].value.SerialFormat.indexOf('#');
    let leftOfCode = code.data
      .toString()
      .substr(serialHeaderIndex, code.data.length - 3);
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
              'partType',
              selectedObject[0],
              selectedItemList.index,
            );
            refactorObjectListItems(
              'version',
              selectedVersion[0],
              selectedItemList.index,
            );
            refactorObjectListItems(
              'serial',
              `${selectedObject[0].value.SerialFormat.substr(
                0,
                serialHeaderIndex,
              )}${leftOfCode}`,
              selectedItemList.index,
            );
            setSelectedItemList({});
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
          }
        } else {
          ToastAndroid.showWithGravity(
            data.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
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
        : !!fieldsObject.serial ? fieldsObject.serial.toUpperCase(): null;
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
                      'partType',
                      object,
                      selectedItemList.index,
                    );
                    refactorObjectListItems(
                      'version',
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
                  'partType',
                  object,
                  selectedItemList.index,
                );
                refactorObjectListItems(
                  'version',
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
    let currentList = !!info.length ? info : [];
    let selectedObject = {};
    let Index = 0;
    currentList.map((item, index) => {
      if (item.index === objectIndex) {
        selectedObject = item;
        switch (refactorFeild) {
          case 'isExpanded':
            selectedObject = {...selectedObject, isExpanded: newValue};
            break;
          case 'failureDescription':
            selectedObject = {...selectedObject, failureDescription: newValue};
            break;
          case 'availableVersions':
            selectedObject = {...selectedObject, availableVersions: newValue};
            break;
          case 'hasGarantee':
            selectedObject = {...selectedObject, hasGarantee: newValue};
            break;
          case 'partType':
            selectedObject = {...selectedObject, partType: newValue};
            break;
          case 'price':
            selectedObject = {...selectedObject, Price: newValue};
            break;
          case 'serial':
            selectedObject = {...selectedObject, serial: newValue};
            break;
          case 'version':
            selectedObject = {...selectedObject, version: newValue};
            break;
        }
        Index = index;
      }
    });
    currentList.splice(Index, 1, selectedObject);
    setInfo(currentList);
    setObjectsList(currentList);
    setRefresh(!refresh);
  };

  const renderServicePartItem = (item, index) => {
    let Item = item;
    return (
      <View style={[Styles.newformContainerStyle, {marginBottom: 10}]}>
        <TouchableHighlight
          style={Styles.formHeaderStyle}
          onPress={() =>
            refactorObjectListItems('isExpanded', !Item.isExpanded, Item.index)
          }>
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
                  refactorObjectListItems('partType', value, Item.index);
                  refactorObjectListItems('serial', '', Item.index);
                  refactorObjectListItems('version', {}, Item.index);
                  refactorObjectListItems(
                    'availableVersions',
                    value.value.Versions,
                    Item.index,
                  );
                  dropRef.current.setList(value.value.Versions);
                }}
                placeholder={
                  !!Item.partType
                    ? `${Item.partType.label.substr(0, 25)}...`
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
                  refactorObjectListItems('serial', text, Item.index);
                }}
                value={Item.serial}
              />
              <View style={{flexDirection: 'row'}}>
                {!!Item.partType.label &&
                Item.partType.value.SerialFormat.length > 0 ? (
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
                  !!Item.version
                    ? Item.version.Value
                    : 'نسخه مورد نظر خود را انتخاب کنید.'
                }
                onSelect={item =>
                  refactorObjectListItems('version', item, Item.index)
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
                refactorObjectListItems('price', text, Item.index)
              }
              value={Item.Price}
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
                    'failureDescription',
                    text,
                    Item.index,
                  )
                }
                value={Item.failureDescription}
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
                  refactorObjectListItems('price', text, Item.index)
                }
                value={Item.Price}
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
                if (!Item.partType.label) {
                  Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else if (!Item.version.Key) {
                  Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else if (
                  !!Item.partType.value.SerialFormat &&
                  Item.serial === ''
                ) {
                  Alert.alert('', 'لطفا سریال را مشخص کنید.', [
                    {text: 'OK', onPress: () => {}},
                  ]);
                } else {
                  refactorObjectListItems('isExpanded', false, Item.index);
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
  return !screenMode ? (
    <>
      <ScrollView style={{flex: 0.8, padding: 15}}>
        {!!objectsList && objectsList.length > 0 && (
          <View style={{flex: 1, marginBottom: 10}}>
            {objectsList.map((item, index) =>
              renderServicePartItem(item, index),
            )}
          </View>
        )}
        {newHasStarted && (
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
                  onValueChange={(value) => {
                    if (value) {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'failed',
                      });
                      setIsNewPartFormExpanded(true);
                    } else {
                        setFieldsObject({
                            ...fieldsObject,
                            objectType: "",
                          });
                          setIsNewPartFormExpanded(false);
                    }
                  }}
                  value={fieldsObject.objectType === 'failed' ? true : false}
                  tintColors={{true: 'red', false: 'red'}}
                />
                <Text
                  style={{
                    color: '#000',
                    fontSize: normalize(12),
                    fontFamily: 'IRANSansMobile_Medium',
                  }}>
                  قطعه معیوب
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  onValueChange={(value) => {
                    if (value) {
                      setFieldsObject({
                        ...fieldsObject,
                        objectType: 'new',
                      });
                      setIsNewPartFormExpanded(true);
                    } else {
                        setFieldsObject({
                            ...fieldsObject,
                            objectType: "",
                          });
                          setIsNewPartFormExpanded(false);
                    }
                  }}
                  value={fieldsObject.objectType == 'new' ? true : false}
                  tintColors={{true: 'green', false: 'green'}}
                  style={{marginLeft: 20}}
                />
                <Text
                  style={{
                    color: '#000',
                    fontSize: normalize(12),
                    fontFamily: 'IRANSansMobile_Medium',
                  }}>
                  قطعه جدید
                </Text>
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
                        ? `${fieldsObject.partTypeSelected.label.substr(
                            0,
                            25,
                          )}...`
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
                  value={fieldsObject.Price}
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
                    value={fieldsObject.Price}
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
                  setNewHasStarted(false);
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
                    let INFO = !!objectsList ? objectsList : [];
                    let maxIndex = 0;
                    if (INFO.length > 0) {
                      INFO.map(item => {
                        if (item.index > maxIndex) {
                          maxIndex = item.index;
                        }
                      });
                    }
                    INFO.push({
                      index: maxIndex + 1,
                      serial: !!fieldsObject.serial ? fieldsObject.serial : "",
                      isExpanded: false,
                      failureDescription: !!fieldsObject.failureDescription ? fieldsObject.failureDescription : "",
                      hasGarantee: fieldsObject.hasGarantee,
                      Price: !!fieldsObject.Price ? fieldsObject.Price : "0",
                      objectType: fieldsObject.objectType,
                      partType: fieldsObject.partTypeSelected,
                      availableVersions: [],
                      version: fieldsObject.partVersionSelected,
                    });
                    setNewHasStarted(false);
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
                    setObjectsList(INFO);
                    setInfo(INFO);
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
              if (newHasStarted) {
                ToastAndroid.showWithGravity(
                  'لطفا ابتدا قطعه ی ناتمام را کامل کنید.',
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER,
                );
              } else {
                setNewHasStarted(true);
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
    <RNCamera
      defaultTouchToFocus
      onBarCodeRead={onSuccess}
      style={Styles.preview}
      type={RNCamera.Constants.Type.back}>
      <View style={Styles.barcodeContainerStyle}>
        <View style={Styles.barcodeLineStyle} />
      </View>
    </RNCamera>
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
