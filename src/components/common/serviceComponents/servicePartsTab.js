import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    Dimensions,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    TouchableHighlight,
    Alert,
    Keyboard,
    BackHandler,
    Animated
} from 'react-native';
import Toast from "react-native-simple-toast";
import CheckBox from 'react-native-check-box';
import DropdownPicker from '../DropdownPicker';
import {useSelector} from 'react-redux';
import {getObjBySerial, checkObjectVersion} from '../../../actions/api';
import {RNCamera} from 'react-native-camera';
import {normalize, getFontsName} from '../../utils/utilities';
import NumberFormat from "react-number-format";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    BarcodeScannerIcon,
    CheckIcon,
    DeleteIcon,
    MinusIcon,
    PlusIcon,
    SearchIcon,
    StarIcon
} from "../../../assets/icons";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;
let item = 0;
const ServicePartsTab = ({
                             setInfo,
                             info,
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
        availableVersions: [],
    });
    const dropRef = useRef();
    let Top = useRef(new Animated.Value(0)).current;
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [barCode, setBarCode] = useState({show: false, item: {}});
    const [isNewPartFormExpanded, setIsNewPartFormExpanded] = useState(false);
    const [partsListName] = useState(selector.objectsList);
    const [searchBarcodeLoading, setSearchBarcodeLoading] = useState(false);
    const [objectsList, setObjectsList] = useState(info);
    const [rerender, setRerender] = useState(false);
    const [qrScannerLoading, setQrScannerLoading] = useState(false);
    const getScanner = (e, Item) => {
        if (e !== item) {
            item = e;
            onSuccess(e, Item)
            setTimeout(() => {
                item = 0;
            }, 4000)
        }
    }
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
    }, [barCode]);

    const spin = Top.interpolate({
        inputRange: [0, 1, 2, 3, 4],
        outputRange: [50, 1, 50, 1, 50],
    });

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

    const onSuccess = async (code, item) => {
        Animated.timing(Top, {
            toValue: 0,
            duration: 10,
            useNativeDriver: true,
        }).start();
        // console.log("##########", code);
        try {
            let header = parseInt(code.toString().substr(0, 3));
            let numOfZeros = 0;
            while (code.toString()[numOfZeros] == '0') {
                numOfZeros = numOfZeros + 1;
            }
            let prefix = '';
            let leftOfCode = code
                .toString()
                .substr(
                    header.toString().length + numOfZeros,
                    code.toString().length - header.toString().length,
                );
            while (numOfZeros > 0) {
                prefix = '0'.concat(prefix);
                numOfZeros = numOfZeros - 1;
            }
            let selectedObject = partsListName.filter(
                item => prefix.concat(item.value.SerialBarcode) == header,
            );
            let serialHeaderIndex = selectedObject[0].value.SerialFormat.indexOf('#');
            if (selectedObject.length > 0) {
                getObjBySerial(
                    selector.token,
                    `${selectedObject[0].value.SerialFormat.substr(
                        0,
                        serialHeaderIndex,
                    )}${leftOfCode}`,
                    selectedObject[0].value.Id,
                ).then(data => {
                    if (data.errorCode === 0) {
                        setBarCode({show: false, item: undefined})
                        let selectedObjectt = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                        let selectedVersion = selectedObjectt[0].value.Versions.filter(
                            item => item.Key === data.result.VersionId,
                        );
                        if (!!item && !!item.index) {

                            refactorObjectListItems(
                                'tempPart',
                                selectedObjectt[0],
                                item.index,
                            );
                            refactorObjectListItems(
                                'tempVersion',
                                selectedVersion[0],
                                item.index,
                            );
                            refactorObjectListItems(
                                'tempSerial',
                                `${selectedObjectt[0].value.SerialFormat.substr(
                                    0,
                                    serialHeaderIndex,
                                )}${leftOfCode}`,
                                item.index,
                            );
                            refactorObjectListItems(
                                'availableVersions',
                                selectedObjectt[0].value.Versions,
                                item.index,
                            );
                            setQrScannerLoading(false);
                        } else {
                            setFieldsObject({
                                ...fieldsObject,
                                partTypeSelected: selectedObjectt[0],
                                partVersionSelected: selectedVersion[0],
                                serial: `${selectedObjectt[0].value.SerialFormat.substr(
                                    0,
                                    serialHeaderIndex,
                                )}${leftOfCode}`,
                                availableVersions: selectedObjectt[0].value.Versions,
                            });
                            dropRef.current.setList(selectedObjectt[0].value.Versions);
                            setQrScannerLoading(false);
                        }
                    } else {
                        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                        setQrScannerLoading(false);
                    }
                });
            } else {
                Toast.showWithGravity('کد اسکن شده معتبر نیست.', Toast.LONG, Toast.CENTER);
            }
        } catch {
            Toast.showWithGravity('مشکلی پیش آمد. لطفا دوباره تلاش کنید.', Toast.LONG, Toast.CENTER);
        }
    };

    const searchBarcode = selectedItemList => {
        try {
            if (!!selectedItemList) {
                if (!selectedItemList.tempPart.value.SerialFormat) {
                    setSearchBarcodeLoading(true);
                    getObjBySerial(
                        selector.token,
                        selectedItemList.tempSerial,
                        selectedItemList.tempPart.value.Id,
                    ).then(data => {
                        if (data.errorCode === 0) {
                            let responseObject = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                            let responseVersion = responseObject[0].value.Versions.filter(
                                item => item.Key === data.result.VersionId,
                            );
                            refactorObjectListItems(
                                'tempPart',
                                responseObject[0],
                                selectedItemList.index,
                            );
                            refactorObjectListItems(
                                'tempVersion',
                                responseVersion[0],
                                selectedItemList.index,
                            );
                            refactorObjectListItems(
                                'availableVersions',
                                responseObject[0].value.Versions,
                                selectedItemList.index,
                            );
                            setSearchBarcodeLoading(false);
                        } else {
                            setSearchBarcodeLoading(false);
                            Toast.showWithGravity('برای این قطعه نسخه معتبری یافت نشد.', Toast.LONG, Toast.CENTER);
                        }
                    })
                } else {
                    setSearchBarcodeLoading(true);
                    const object = !!selectedItemList.tempPart
                        ? selectedItemList.tempPart
                        : null;
                    const sserial = !!selectedItemList.tempSerial
                        ? selectedItemList.tempSerial.toUpperCase()
                        : null;
                    if (!!object && !!sserial) {
                        if (!!object.value.SerialFormat) {
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
                                    serialFormatHeader ===
                                    sserial.substr(0, serialFormatHeader.length)
                                ) {
                                    getObjBySerial(selector.token, sserial, object.value.Id).then(
                                        data => {
                                            if (data.errorCode === 0) {
                                                let selectedObjectt = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                                                let selectedVersion = selectedObjectt[0].value.Versions.filter(
                                                    item => item.Key == data.result.VersionId,
                                                );
                                                refactorObjectListItems(
                                                    'tempPart',
                                                    selectedObjectt[0],
                                                    selectedItemList.index,
                                                );
                                                refactorObjectListItems(
                                                    'tempVersion',
                                                    selectedVersion[0],
                                                    selectedItemList.index,
                                                );
                                                refactorObjectListItems(
                                                    'availableVersions',
                                                    object.value.Versions,
                                                    selectedItemList.index,
                                                );
                                                setSearchBarcodeLoading(false);
                                            } else {
                                                setSearchBarcodeLoading(false);
                                                Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                                            }
                                        },
                                    );
                                } else {
                                    setSearchBarcodeLoading(false);
                                    Toast.showWithGravity(`فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`, Toast.LONG, Toast.CENTER);
                                }
                            } else if (sserial.length === serialLengthWithoutHeader) {
                                getObjBySerial(
                                    selector.token,
                                    `${serialFormatHeader}${sserial}`,
                                    object.value.Id,
                                ).then(data => {
                                    if (data.errorCode === 0) {
                                        let selectedObjectt = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                                        let selectedVersion = selectedObjectt[0].value.Versions.filter(
                                            item => item.Key == data.result.VersionId,
                                        );
                                        refactorObjectListItems(
                                            'tempPart',
                                            selectedObjectt[0],
                                            selectedItemList.index,
                                        );
                                        refactorObjectListItems(
                                            'tempVersion',
                                            selectedVersion[0],
                                            selectedItemList.index,
                                        );
                                        setSearchBarcodeLoading(false);
                                    } else {
                                        setSearchBarcodeLoading(false);
                                        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                                    }
                                });
                            } else {
                                setSearchBarcodeLoading(false);
                                Toast.showWithGravity(`فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`, Toast.LONG, Toast.CENTER);
                            }
                        } else {
                            setSearchBarcodeLoading(false);
                            Toast.showWithGravity('برای این قطعه باید نسخه را به صورت دستی وارد کنید.', Toast.LONG, Toast.CENTER);
                        }
                    } else {
                        setSearchBarcodeLoading(false);
                        Toast.showWithGravity('لطفا نوع قطعه و سریال را مشخص کنید.', Toast.LONG, Toast.CENTER);
                    }
                }
            } else {
                if (!fieldsObject.partTypeSelected.value.SerialFormat) {
                    setSearchBarcodeLoading(true);
                    getObjBySerial(
                        selector.token,
                        fieldsObject.serial,
                        fieldsObject.partTypeSelected.value.Id,
                    ).then(data => {
                        if (data.errorCode === 0) {
                            let responseObject = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                            let responseVersion = responseObject[0].value.Versions.filter(
                                item => item.Key == data.result.VersionId,
                            );
                            setFieldsObject({
                                ...fieldsObject,
                                partTypeSelected: responseObject[0],
                                partVersionSelected: responseVersion[0],
                                availableVersions: responseObject[0].value.Versions,
                            });
                            setSearchBarcodeLoading(false);
                        } else {
                            Toast.showWithGravity('برای این قطعه نسخه معتبری یافت نشد.', Toast.LONG, Toast.CENTER);
                            setSearchBarcodeLoading(false);
                        }
                    })
                } else {
                    setSearchBarcodeLoading(true);
                    const object = !!fieldsObject.partTypeSelected
                        ? fieldsObject.partTypeSelected
                        : null;
                    const sserial = !!fieldsObject.serial
                        ? fieldsObject.serial.toUpperCase()
                        : null;
                    if (!!object && !!sserial) {
                        if (!!object.value.SerialFormat) {
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
                                    serialFormatHeader ===
                                    sserial.substr(0, serialFormatHeader.length)
                                ) {
                                    getObjBySerial(selector.token, sserial, object.value.Id).then(
                                        data => {
                                            if (data.errorCode == 0) {
                                                let selectedObjectt = partsListName.filter(item => item.value.Id === data.result.ObjectId);
                                                let selectedVersion = selectedObjectt[0].value.Versions.filter(
                                                    item => item.Key == data.result.VersionId,
                                                );
                                                setFieldsObject({
                                                    ...fieldsObject,
                                                    partTypeSelected: selectedObjectt[0],
                                                    partVersionSelected: selectedVersion[0],
                                                    availableVersions: selectedObjectt[0].value.Versions,
                                                });
                                                setSearchBarcodeLoading(false);
                                            } else {
                                                setSearchBarcodeLoading(false);
                                                Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                                            }
                                        },
                                    );
                                } else {
                                    setSearchBarcodeLoading(false);
                                    Toast.showWithGravity(`فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`, Toast.LONG, Toast.CENTER);
                                }
                            } else if (sserial.length === serialLengthWithoutHeader) {
                                getObjBySerial(
                                    selector.token,
                                    `${serialFormatHeader}${sserial}`,
                                    object.value.Id,
                                ).then(data => {
                                    if (data.errorCode == 0) {
                                        let selectedObjectt = partsListName.filter(item => item.value.Id === data.result.ObjectId)
                                        let selectedVersion = selectedObjectt[0].value.Versions.filter(
                                            item => item.Key === data.result.VersionId,
                                        );
                                        setFieldsObject({
                                            ...fieldsObject,
                                            partTypeSelected: selectedObjectt[0],
                                            partVersionSelected: selectedVersion[0],
                                        });
                                        setSearchBarcodeLoading(false);
                                    } else {
                                        setSearchBarcodeLoading(false);
                                        Toast.showWithGravity(data.message, Toast.LONG, Toast.CENTER);
                                    }
                                });
                            } else {
                                setSearchBarcodeLoading(false);
                                Toast.showWithGravity(`فرمت سریال وارد شده صحیح نیست. سریال باید به فرم ${leftOfSerialFormat}${serialFormatHeader} وارد شود.`, Toast.LONG, Toast.CENTER);
                            }
                        } else {
                            setSearchBarcodeLoading(false);
                            Toast.showWithGravity('برای این قطعه باید نسخه را به صورت دستی وارد کنید.', Toast.LONG, Toast.CENTER);
                        }
                    } else {
                        setSearchBarcodeLoading(false);
                        Toast.showWithGravity('لطفا نوع قطعه و سریال را مشخص کنید.', Toast.LONG, Toast.CENTER);
                    }
                }
            }
        } catch (err) {
            Toast.showWithGravity('مشکلی پیش آمد. لطفا دوباره تلاش کنید.', Toast.LONG, Toast.CENTER);
            setSearchBarcodeLoading(false);
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
                            serial: !!newValue ? newValue : selectedObject.tempSerial,
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
                        backgroundColor: !Item.isConfirmed ? 'rgba(66,00,00,0.4)' : null,
                        zIndex: -9999,
                        overflow: 'hidden',


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
                            {Item.isExpanded ? MinusIcon({
                                    color: "#fff"
                                })
                                : PlusIcon({
                                    color: "#fff"
                                })
                            }
                        </TouchableOpacity>
                        <Text
                            style={{
                                color: '#660000',
                                fontSize: normalize(12),
                                textAlign: 'center',
                                fontFamily: getFontsName('IRANSansMobile_Light'),
                            }}>
                            {!!Item.serial ? Item.serial : 'سریال'}
                        </Text>
                        <Text
                            style={{
                                color: '#660000',
                                fontSize: normalize(12),
                                textAlign: 'center',
                                fontFamily: getFontsName('IRANSansMobile_Light'),
                            }}>
                            {!!Item.partType ? Item.partType.label : 'نام'}
                        </Text>
                        {Item.objectType == 'new' ? ArrowRightIcon({
                            color: "green"
                        }) : ArrowLeftIcon({
                            color: "red"
                        })}
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
                                listHeight={200}
                                hasSearchBox={true}
                            />
                            <Text
                                style={{
                                    fontSize: normalize(13),
                                    fontFamily: getFontsName('IRANSansMobile_Light'),
                                }}>
                                نوع قطعه:
                            </Text>
                        </View>
                        <View style={Styles.serialContainerStyle}>
                            {searchBarcodeLoading ? (
                                <ActivityIndicator size={'small'} color={'#000'}/>
                            ) : SearchIcon({
                                color: "#000",
                                onPress: async () => {
                                    searchBarcode(Item);
                                }
                            })
                            }
                            {BarcodeScannerIcon({
                                width: 28,
                                height: 28,
                                strokeWidth: 6,
                                fill: "#000",
                                onPress: async () => {
                                    try {
                                        Animated.loop(
                                            Animated.timing(Top, {
                                                toValue: 4,
                                                // friction: 1,
                                                // tension: 1,
                                                duration: 1000,
                                                useNativeDriver: true,
                                                // isInteraction: false
                                            }),
                                        ).start();
                                        setBarCode({show: true, item: Item})
                                        // RnZxing.showQrReader(data => onSuccess(data, Item));
                                    } catch {
                                        Toast.showWithGravity('مشکلی پیش آمد. لطفا دوباره تلاش کنید.', Toast.LONG, Toast.CENTER);
                                    }
                                },
                                color: "#000"
                            })}
                            <TextInput
                                style={Styles.serialInputStyle}
                                onChangeText={text => {
                                    refactorObjectListItems('tempSerial', text, Item.index);
                                }}
                                value={Item.tempSerial}
                            />
                            <View style={{flexDirection: 'row'}}>
                                {!!Item.tempPart.value.SerialFormat && StarIcon()}
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
                                listHeight={200}
                                hasSearchBox={true}
                            />
                            <Text style={Styles.labelStyle}>نسخه: </Text>
                        </View>
                    </View>
                )}
                {Item.isExpanded && Item.objectType === 'new' ? (
                    <View style={Styles.priceContainerStyle}>
                        <Text style={Styles.labelStyle}>ریال</Text>
                        <NumberFormat thousandSeparator={true} renderText={value => (
                            <TextInput
                                style={Styles.priceInputStyle}
                                onChangeText={(text) => {
                                    refactorObjectListItems('tempPrice', text, Item.index);
                                }}
                                value={value}
                                keyboardType="numeric"
                            />
                        )} value={Item.tempPrice} displayType={'text'}/>
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
                            <NumberFormat thousandSeparator={true} renderText={value => (
                                <TextInput
                                    style={Styles.prePriceInputStyle}
                                    onChangeText={(text) => {
                                        refactorObjectListItems('tempPrice', text, Item.index);
                                    }}
                                    value={value}
                                    keyboardType="numeric"
                                />
                            )} value={Item.tempPrice} displayType={'text'}/>
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
                            {DeleteIcon({
                                color: "#fff",
                                width: 20,
                                height: 20
                            })}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={Styles.footerIconContainerStyle}
                            onPress={() => {
                                try {
                                    if (!Item.tempPart.label) {
                                        Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                                            {
                                                text: 'OK', onPress: () => {
                                                }
                                            },
                                        ]);
                                    } else if (!Item.tempVersion.Key) {
                                        Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                                            {
                                                text: 'OK', onPress: () => {
                                                }
                                            },
                                        ]);
                                    } else if (
                                        !!Item.tempPart.value.SerialFormat &&
                                        Item.tempSerial === ''
                                    ) {
                                        Alert.alert('', 'لطفا سریال را مشخص کنید.', [
                                            {
                                                text: 'OK', onPress: () => {
                                                }
                                            },
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
                                                        [{
                                                            text: 'OK', onPress: () => {
                                                            }
                                                        }],
                                                    );
                                                } else {
                                                    checkObjectVersion(
                                                        selector.token,
                                                        Item.tempSerial,
                                                        Item.tempPart.value.Id,
                                                        Item.tempVersion.Key,
                                                    ).then(data => {
                                                        if (data.errorCode == 0) {
                                                            refactorObjectListItems(
                                                                'setDirect',
                                                                '',
                                                                Item.index,
                                                            );
                                                        } else {
                                                            Toast.showWithGravity('نسخه انتخاب شده با سریال وارد شده همخوانی ندارد.', Toast.LONG, Toast.CENTER);
                                                        }
                                                    });
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
                                                    checkObjectVersion(
                                                        selector.token,
                                                        actualSerial,
                                                        Item.tempPart.value.Id,
                                                        Item.tempVersion.Key,
                                                    ).then(data => {
                                                        if (data.errorCode == 0) {
                                                            refactorObjectListItems(
                                                                'setDirect',
                                                                actualSerial,
                                                                Item.index,
                                                            );
                                                        } else {
                                                            Toast.showWithGravity('نسخه انتخاب شده با سریال وارد شده همخوانی ندارد.', Toast.LONG, Toast.CENTER);
                                                        }
                                                    });
                                                } else {
                                                    Alert.alert(
                                                        '',
                                                        'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                                                        [{
                                                            text: 'OK', onPress: () => {
                                                            }
                                                        }],
                                                    );
                                                }
                                            }
                                        } else {
                                            refactorObjectListItems('setDirect', '', Item.index);
                                        }
                                    }
                                } catch {
                                }
                            }}>
                            {CheckIcon({
                                width: 20,
                                height: 20,
                                color: "#fff"
                            })}
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
            availableVersions: fieldsObject.availableVersions,
            version: fieldsObject.partVersionSelected,
            tempPart: fieldsObject.partTypeSelected,
            tempVersion: fieldsObject.partVersionSelected,
            tempPrice: !!fieldsObject.Price ? fieldsObject.Price : '0',
            tempSerial: serial,
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
            setObjectsList(list);
            setInfo(list);
            let obj = {
                objectType: 'new',
                serial: '',
                partTypeSelected: fieldsObject.partTypeSelected,
                partVersionSelected: '',
                availableVersions: fieldsObject.availableVersions,
                Price: '0',
                failureDescription: '',
                hasGarantee: null,
            };
            setFieldsObject(obj);
        }
    };

    return (
        <>
            {
                barCode.show &&
                <RNCamera
                    style={Styles.preview}
                    onBarCodeRead={(e) => getScanner(e.data)}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: 'Permission to use audio recording',
                        message: 'We need your permission to use your audio',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                >
                    <Animated.View style={{
                        position: 'absolute',
                        top: '40%',
                        width: '100%',
                        alignItems: 'center',
                        transform: [{translateY: spin}]
                    }}>
                        <View style={{width: '95%', height: 1, backgroundColor: 'red'}}></View>
                    </Animated.View>
                </RNCamera>
            }
            {qrScannerLoading && (
                <View
                    style={{
                        flex: 1,
                        width: pageWidth,
                        backgroundColor: '#000',
                        opacity: 0.5,
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        zIndex: 9999,
                    }}>
                    <ActivityIndicator size="large" color="#fff"/>
                </View>
            )}
            <ScrollView
                style={{flex: 0.8, padding: 15}}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag">
                {!!info && info.length > 0 && (
                    <ScrollView style={{flex: 1, marginBottom: 10}}>
                        {info.map(item => renderServicePartItem(item))}
                    </ScrollView>
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
                                {isNewPartFormExpanded ? MinusIcon({
                                    color: "#fff"
                                }) : PlusIcon({
                                    color: "#fff"
                                })}
                            </TouchableOpacity>
                            <Text
                                style={{
                                    color: '#660000',
                                    fontSize: normalize(12),
                                    textAlign: 'center',
                                    fontFamily: getFontsName('IRANSansMobile_Light'),
                                }}>
                                {!!fieldsObject.serial ? fieldsObject.serial : 'سریال'}
                            </Text>
                            {/* TODO: check this color */}
                            <Text
                                style={{
                                    color: '#660000',
                                    fontSize: normalize(12),
                                    textAlign: 'center',
                                    fontFamily: getFontsName('IRANSansMobile_Light'),
                                }}>
                                {!!fieldsObject.partTypeSelected.label
                                    ? fieldsObject.partTypeSelected.label
                                    : 'نام'}
                            </Text>
                        </View>
                        <View style={Styles.partTypeSelectionContainerStyle}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <CheckBox
                                    onClick={() => {
                                        if (fieldsObject.objectType !== "failed") {
                                            setFieldsObject({
                                                ...fieldsObject,
                                                objectType: 'failed',
                                            });
                                            setIsNewPartFormExpanded(true);
                                        }
                                    }}
                                    isChecked={fieldsObject.objectType === 'failed' ? true : false}
                                    checkBoxColor="red"
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
                                            fontFamily: getFontsName('IRANSansMobile_Medium'),
                                        }}>
                                        قطعه معیوب
                                    </Text>
                                </TouchableHighlight>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <CheckBox
                                    onClick={() => {
                                        if (fieldsObject.objectType !== "new") {
                                            setFieldsObject({
                                                ...fieldsObject,
                                                objectType: 'new',
                                            });
                                            setIsNewPartFormExpanded(true);
                                        }
                                    }}
                                    isChecked={fieldsObject.objectType == 'new' ? true : false}
                                    checkBoxColor="green"
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
                                            fontFamily: getFontsName('IRANSansMobile_Medium'),
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
                                                availableVersions: value.value.Versions,
                                            });
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
                                        listHeight={200}
                                        hasSearchBox={true}
                                    />
                                    <Text style={Styles.labelStyle}>نوع قطعه:</Text>
                                </View>
                                <View style={Styles.serialContainerStyle}>
                                    {searchBarcodeLoading ? (
                                        <ActivityIndicator size={'small'} color={'#000'}/>
                                    ) : SearchIcon({
                                        onPress: () => searchBarcode(),
                                        color: "#000",
                                        style: {
                                            marginHorizontal: 5,
                                        }
                                    })}
                                    {BarcodeScannerIcon({
                                        width: 28,
                                        height: 28,
                                        strokeWidth: 6,
                                        fill: "#000",
                                        onPress: () => {
                                            try {
                                                Animated.loop(
                                                    Animated.timing(Top, {
                                                        toValue: 4,
                                                        // friction: 1,
                                                        // tension: 1,
                                                        duration: 1000,
                                                        useNativeDriver: true,
                                                        // isInteraction: false
                                                    }),
                                                ).start();
                                                setBarCode({show: true, item: undefined})
                                                // RnZxing.showQrReader(data => onSuccess(data));
                                            } catch {
                                                Toast.showWithGravity('مشکلی پیش آمد. لطفا دوباره تلاش کنید.', Toast.LONG, Toast.CENTER);
                                            }
                                        },
                                        color: "#000"
                                    })}
                                    <TextInput
                                        style={Styles.serialInputStyle}
                                        onChangeText={text => {
                                            setFieldsObject({
                                                ...fieldsObject,
                                                serial: text,
                                            });
                                        }}
                                        value={fieldsObject.serial}
                                    />
                                    <View style={{flexDirection: 'row'}}>
                                        {!!fieldsObject.partTypeSelected.label &&
                                        !!fieldsObject.partTypeSelected.value.SerialFormat ? StarIcon() : null}
                                        <Text style={Styles.labelStyle}>سریال:</Text>
                                    </View>
                                </View>
                                <View style={Styles.partTypeContainerStyle}>
                                    <DropdownPicker
                                        ref={dropRef}
                                        list={fieldsObject.availableVersions}
                                        placeholder={
                                            !!fieldsObject.partVersionSelected &&
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
                                        listHeight={200}
                                        hasSearchBox={true}
                                    />
                                    <Text style={Styles.labelStyle}>نسخه: </Text>
                                </View>
                            </View>
                        )}
                        {isNewPartFormExpanded && fieldsObject.objectType === 'new' ? (
                            <View style={Styles.priceContainerStyle}>
                                <Text style={Styles.labelStyle}>ریال</Text>
                                <NumberFormat thousandSeparator={true} renderText={value => (
                                    <TextInput
                                        style={Styles.priceInputStyle}
                                        onChangeText={(text) => {
                                            setFieldsObject({...fieldsObject, Price: text});
                                        }}
                                        value={value}
                                        keyboardType="numeric"
                                    />
                                )} value={fieldsObject.Price} displayType={'text'}/>
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
                                    <NumberFormat thousandSeparator={true} renderText={value => (
                                        <TextInput
                                            style={Styles.prePriceInputStyle}
                                            onChangeText={(text) => {
                                                setFieldsObject({...fieldsObject, Price: text});
                                            }}
                                            value={value}
                                            keyboardType="numeric"
                                        />
                                    )} value={fieldsObject.Price} displayType={'text'}/>
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
                                    setSearchBarcodeLoading(false);
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
                                {DeleteIcon({
                                    color: "#fff",
                                    width: 20,
                                    height: 20
                                })}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.footerIconContainerStyle}
                                onPress={() => {
                                    try {
                                        if (
                                            fieldsObject.objectType !== 'new' &&
                                            fieldsObject.objectType !== 'failed'
                                        ) {
                                            Alert.alert(
                                                '',
                                                'لطفا جدید یا معیوب بودن قطعه را مشخص کنید.',
                                                [{
                                                    text: 'OK', onPress: () => {
                                                    }
                                                }],
                                            );
                                        } else if (!fieldsObject.partTypeSelected.label) {
                                            Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                                                {
                                                    text: 'OK', onPress: () => {
                                                    }
                                                },
                                            ]);
                                        } else if (!fieldsObject.partVersionSelected.Key) {
                                            Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                                                {
                                                    text: 'OK', onPress: () => {
                                                    }
                                                },
                                            ]);
                                        } else if (
                                            !!fieldsObject.partTypeSelected.value.SerialFormat &&
                                            fieldsObject.serial === ''
                                        ) {
                                            Alert.alert('', 'لطفا سریال را مشخص کنید.', [
                                                {
                                                    text: 'OK', onPress: () => {
                                                    }
                                                },
                                            ]);
                                        } else {
                                            const serialFormat =
                                                fieldsObject.partTypeSelected.value.SerialFormat;
                                            if (!!serialFormat) {
                                                if (
                                                    serialFormat.length === fieldsObject.serial.length
                                                ) {
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
                                                            [{
                                                                text: 'OK', onPress: () => {
                                                                }
                                                            }],
                                                        );
                                                    } else {
                                                        checkObjectVersion(
                                                            selector.token,
                                                            fieldsObject.serial,
                                                            fieldsObject.partTypeSelected.value.Id,
                                                            fieldsObject.partVersionSelected.Key,
                                                        ).then(data => {
                                                            if (data.errorCode === 0) {
                                                                let INFO = !!objectsList ? objectsList : [];
                                                                let SERIAL = !!fieldsObject.serial
                                                                    ? fieldsObject.serial
                                                                    : '';
                                                                addNewObject(INFO, SERIAL);
                                                            } else {
                                                                Toast.showWithGravity('نسخه انتخاب شده با سریال وارد شده همخوانی ندارد.', Toast.LONG, Toast.CENTER);
                                                            }
                                                        });
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
                                                        checkObjectVersion(
                                                            selector.token,
                                                            actualSerial,
                                                            fieldsObject.partTypeSelected.value.Id,
                                                            fieldsObject.partVersionSelected.Key,
                                                        ).then(data => {
                                                            if (data.errorCode == 0) {
                                                                let INFO = !!objectsList ? objectsList : [];
                                                                addNewObject(INFO, actualSerial);
                                                            } else {
                                                                Toast.showWithGravity('نسخه انتخاب شده با سریال وارد شده همخوانی ندارد.', Toast.LONG, Toast.CENTER);
                                                            }
                                                        });
                                                    } else {
                                                        Alert.alert(
                                                            '',
                                                            'سریال قطعه انتخاب شده با سریال وارد شده مطابقت ندارد.',
                                                            [{
                                                                text: 'OK', onPress: () => {
                                                                }
                                                            }],
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
                                    } catch {
                                    }
                                }}>
                                {CheckIcon({
                                    color: "#fff",
                                    width: 20,
                                    height: 20
                                })}
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
                                Toast.showWithGravity('لطفا ابتدا قطعه ی ناتمام را کامل کنید.', Toast.LONG, Toast.CENTER);
                            } else {
                                setHasNew(true);
                            }
                        }}>
                        {PlusIcon({
                            color: "#fff",
                            width: 30,
                            height: 30
                        })}
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}

const Styles = StyleSheet.create({
    preview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
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
        fontFamily: getFontsName('IRANSansMobile_Light'),
        textAlign: "right"
    },
});

export default ServicePartsTab;
