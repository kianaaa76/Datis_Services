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
    TouchableHighlight,
    Alert,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import {requestObject} from "../../../actions/api";
import DropdownPicker from '../../common/DropdownPicker';
import {useSelector} from 'react-redux';
import {normalize} from '../../utils/utilities';
import {LOGOUT} from "../../../actions/types";
import {PlusIcon, MinusIcon, DeleteIcon, CheckIcon} from "../../../assets/icons/index";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const RequestObject = ({navigation}) => {
    const selector = useSelector(state => state);
    const [fieldsObject, setFieldsObject] = useState({
        partTypeSelected: {},
        partVersionSelected: {},
        count:0,
        availableVersions: [],
    });
    const dropRef = useRef();
    const new_dropRef = useRef();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [partsListName] = useState(selector.objectsList);
    const [objectsList, setObjectsList] = useState([]);
    const [rerender, setRerender] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const [openSendModal,setOpenSendModal] = useState(false);
    const [requestDescription, setRequestDescription] = useState("");
    const [requestLoading, setRequestLoading] = useState(false);

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
                    case 'tempCount':
                        selectedObject = {
                            ...selectedObject,
                            tempCount: newValue,
                            isConfirmed: false,
                        };
                        break;
                    case 'setDirect':
                        selectedObject = {
                            ...selectedObject,
                            version: selectedObject.tempVersion,
                            partType: selectedObject.tempPart,
                            count: selectedObject.tempPrice,
                            description: selectedObject.tempFailureDescription,
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
                                color:"#fff"
                            }) : PlusIcon({
                                color:"#fff"
                            })}
                        </TouchableOpacity>
                        <Text
                            style={{
                                color: '#660000',
                                fontSize: normalize(12),
                                textAlign: 'center',
                                fontFamily: 'IRANSansMobile_Light',
                            }}>
                            {!!Item.tempVersion.Value ? Item.tempVersion.Value : 'نسخه'}
                        </Text>
                        <Text
                            style={{
                                color: '#660000',
                                fontSize: normalize(12),
                                textAlign: 'center',
                                fontFamily: 'IRANSansMobile_Light',
                            }}>
                            {!!Item.partType ? Item.partType.label : 'قطعه'}
                        </Text>
                    </>
                </TouchableHighlight>
                {Item.isExpanded && (
                    <>
                    <View style={Styles.bothOptionsContainerStyle}>
                        <View style={Styles.partTypeContainerStyle}>
                            <DropdownPicker
                                list={partsListName}
                                onSelect={value => {
                                    refactorObjectListItems('tempPart', value, Item.index);
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
                            />
                            <Text
                                style={{
                                    fontSize: normalize(13),
                                    fontFamily: 'IRANSansMobile_Light',
                                }}>
                                نوع قطعه:
                            </Text>
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
                            />
                            <Text style={Styles.labelStyle}>نسخه: </Text>
                        </View>
                    </View>
                            <View style={Styles.countContainerStyle}>
                                <View style={Styles.countChangeButtonContainerStyle}>
                                    <TouchableOpacity style={Styles.countChangeButtonsStyle} onPress={()=>{
                                        if (Item.tempCount > 0) {
                                            refactorObjectListItems("tempCount",parseInt(Item.tempCount) - 1, Item.index);
                                        }
                                    }}>
                                        {
                                            MinusIcon({
                                                color:"#fff"
                                            })
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.countChangeButtonsStyle} onPress={()=>{
                                        refactorObjectListItems("tempCount",parseInt(Item.tempCount) + 1, Item.index);
                                    }}>
                                        {PlusIcon({
                                            color:"#fff"
                                        })}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={Styles.priceInputStyle}
                                    onChangeText={txt=>refactorObjectListItems("tempCount",parseInt(txt), Item.index)}
                                    keyboardType="numeric"
                                    value={Item.tempCount.toString()}/>
                                <Text style={Styles.labelStyle}>تعداد:</Text>
                            </View>
                            <View style={Styles.formFooterContainerstyle}>
                                <TouchableOpacity
                                    style={Styles.footerIconContainerStyle}
                                    onPress={async () => {
                                        await setObjectsList(c =>
                                            c.filter(_ => _.index !== Item.index),
                                        );
                                    }}>
                                    {DeleteIcon({
                                        color:"#fff"
                                    })}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Styles.footerIconContainerStyle}
                                    onPress={() => {
                                        try {
                                            if (!Item.tempPart.label) {
                                                Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                                                    {text: 'OK', onPress: () => {}},
                                                ]);
                                            } else if (!Item.tempVersion.Key) {
                                                Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                                                    {text: 'OK', onPress: () => {}},
                                                ]);
                                            } else if (!Item.tempCount) {
                                                Alert.alert('', 'لطفا تعداد را مشخص کنید.', [
                                                    {text: 'OK', onPress: () => {}},
                                                ]);
                                            } else {
                                                refactorObjectListItems('setDirect', '', Item.index);
                                            }
                                        } catch {}
                                    }}>
                                    {CheckIcon({
                                        color:"#fff"
                                    })}
                                </TouchableOpacity>
                            </View>
                        </>
                )}
            </View>
        );
    };

    const addNewObject = (list) => {
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
            isExpanded: false,
            count: !!fieldsObject.count ? fieldsObject.count : 0,
            objectType: fieldsObject.objectType,
            partType: fieldsObject.partTypeSelected,
            availableVersions: fieldsObject.availableVersions,
            version: fieldsObject.partVersionSelected,
            tempPart: fieldsObject.partTypeSelected,
            tempVersion: fieldsObject.partVersionSelected,
            tempCount: !!fieldsObject.count ? fieldsObject.count : 0,
            isConfirmed: true,
        });
            setObjectsList(list);
            setHasNew(false);
            setFieldsObject({
                partTypeSelected: {},
                partVersionSelected: {},
                count:0,
                availableVersions: [],
            });
    };

    const handleSubmitRequest = ()=>{
        setRequestLoading(true);
        let tempList = [];
        objectsList.map(item=>{
            tempList.push({
                ObjectID:item.partType.value.Id,
                VersionID:item.version.Key,
                Count:item.count,
            })
        });
        requestObject(selector.token, tempList, requestDescription).then(data=>{
            if (data.errorCode === 0){
                setOpenSendModal(false);
                setRequestDescription("");
                setObjectsList([]);
                ToastAndroid.showWithGravity(
                    "درخواست شما با موفقیت ثبت شد.",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else if (data.errorCode === 3){
                dispatch({
                    type: LOGOUT,
                });
                setRequestLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setRequestLoading(false);
            }
        })
    }

    return (
        <>
            <ScrollView
                style={{flex: 0.8, padding: 15}}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag">
                {objectsList.length > 0 && (
                    <View style={{flex: 1}}>
                        {objectsList.map(item => renderServicePartItem(item))}
                    </View>
                )}
                {hasNew && (
                    <View style={Styles.newformContainerStyle}>
                            <View style={Styles.partTypeContainerStyle}>
                                <DropdownPicker
                                    list={partsListName}
                                    onSelect={async value => {
                                        await setFieldsObject({
                                            ...fieldsObject,
                                            partTypeSelected: value,
                                            partVersionSelected: {},
                                            availableVersions: value.value.Versions,
                                        });
                                        new_dropRef.current.setList(value.value.Versions);
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
                                />
                                <Text style={Styles.labelStyle}>نوع قطعه:</Text>
                            </View>
                            <View style={Styles.partTypeContainerStyle}>
                                <DropdownPicker
                                    ref={new_dropRef}
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
                                />
                                <Text style={Styles.labelStyle}>نسخه: </Text>
                            </View>
                            <View style={Styles.countContainerStyle}>
                                <View style={Styles.countChangeButtonContainerStyle}>
                                    <TouchableOpacity style={Styles.countChangeButtonsStyle} onPress={()=>{
                                        if (parseInt(fieldsObject.count) > 0) {
                                            setFieldsObject({...fieldsObject, count: parseInt(fieldsObject.count) - 1})
                                        }
                                    }}>
                                        {MinusIcon({
                                            color:"#fff"
                                        })}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.countChangeButtonsStyle} onPress={()=>{
                                        setFieldsObject({...fieldsObject, count: parseInt(fieldsObject.count) + 1})
                                    }}>
                                        {PlusIcon({
                                            color:"#fff"
                                        })}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={Styles.priceInputStyle}
                                    onChangeText={txt=>setFieldsObject({...fieldsObject, count: parseInt(txt)})}
                                    keyboardType="numeric"
                                    value={fieldsObject.count.toString()}/>
                                <Text style={Styles.labelStyle}>تعداد:</Text>
                            </View>
                        <View style={Styles.formFooterContainerstyle}>
                            <TouchableOpacity
                                style={Styles.footerIconContainerStyle}
                                onPress={() => {
                                    setHasNew(false);
                                    setFieldsObject({
                                        ...fieldsObject,
                                        partTypeSelected: {},
                                        partVersionSelected: {},
                                        description: '',
                                        count: 0,
                                    });
                                }}>
                                {DeleteIcon({
                                    color:"#fff"
                                })}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.footerIconContainerStyle}
                                onPress={() => {
                                    try {
                                        if (!fieldsObject.partTypeSelected.label) {
                                            Alert.alert('', 'لطفا نوع قطعه را مشخص کنید.', [
                                                {text: 'OK', onPress: () => {}},
                                            ]);
                                        } else if (!fieldsObject.partVersionSelected.Key) {
                                            Alert.alert('', 'لطفا نسخه قطعه را مشخص کنید.', [
                                                {text: 'OK', onPress: () => {}},
                                            ]);
                                        } else {
                                            let INFO = !!objectsList ? objectsList : [];
                                            addNewObject(INFO);
                                        }
                                    } catch {}
                                }}>
                                {CheckIcon({
                                    color:"#fff"
                                })}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            {!isKeyboardVisible && (
                <View style={Styles.screenFooterContainerstyle}>
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
                    {PlusIcon({
                        color:"#dadfe1"
                    })}
                </TouchableOpacity>
                {objectsList.length > 0 && (<TouchableOpacity
                    style={Styles.newPartbuttonStyle}
                    onPress={() => {
                        setOpenSendModal(true);
                    }}>
                    {CheckIcon({
                        color:"#dadfe1"
                    })}
                </TouchableOpacity>)}
            </View>)}
            {openSendModal && (
                <TouchableHighlight
                    style={Styles.modalBackgroundStyle}
                    onPress={() => {
                        if(!isKeyboardVisible) {
                            setRequestDescription("");
                            setOpenSendModal(false);
                        }
                    }}
                    underlayColor="none">
                    <View style={{
                        top:isKeyboardVisible ? 0 : pageHeight*0.15,
                        position: 'absolute',
                        width: pageWidth * 0.8,
                        height: pageHeight*0.5,
                        backgroundColor: '#E8E8E8',
                        borderRadius: 15,
                        padding:10,
                        overflow: 'hidden',
                        alignItems: 'center'
                    }}>
                        <View style={Styles.modalBodyContainerStyle}>
                            <Text style={Styles.modalBodyTextStyle}>
                                آیا از درخواست خود اطمینان دارید؟
                            </Text>
                        </View>
                        <View style={{width:"100%", paddingRight:10}}>
                            <Text style={Styles.labelStyle}>توضیحات:</Text>
                        </View>
                        <TextInput value={requestDescription} onChangeText={txt=>setRequestDescription(txt)} style={Styles.descriptionTextInputStyle}/>
                        {requestLoading ? (
                            <View style={Styles.modalFooterContainerStyle}>
                                <ActivityIndicator size={"small"} color={"#660000"}/>
                            </View>
                        ) : (<View style={Styles.modalFooterContainerStyle}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    setOpenSendModal(false);
                                    setRequestDescription("");
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={handleSubmitRequest}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>)}
                    </View>
                </TouchableHighlight>
            )}
        </>
    );
};

const Styles = StyleSheet.create({
    newPartbuttonStyle: {
        width: pageWidth * 0.17,
        height: pageWidth * 0.17,
        borderRadius: pageWidth * 0.085,
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
        marginTop: 10,
    },
    countContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 10,
        height: pageHeight*0.08
    },
    priceInputStyle: {
        width: '40%',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        justifyContent:"center",
        textAlign:"center",
        height:35

    },
    labelStyle: {
        fontSize: normalize(13),
        fontFamily: 'IRANSansMobile_Light',
    },
    countChangeButtonsStyle:{
        width:pageWidth*0.11,
        height:pageWidth*0.11,
        borderRadius:pageWidth*0.055,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"#660000"
    },
    countChangeButtonContainerStyle:{
        flexDirection:"row",
        width:pageWidth*0.26,
        alignItems:"center",
        justifyContent:"space-between"
    },
    descriptionTextInputStyle: {
        width:"100%",
        height:pageHeight*0.15,
        borderWidth:1,
        marginTop:10,
        borderRadius:15,
        borderColor:"gray",
        textAlignVertical: 'top',
        padding:15
    },
    screenFooterContainerstyle:{
        flex: 0.2,
        paddingHorizontal: 10,
        flexDirection:"row",
        width:"100%",
        justifyContent:"space-between",
        alignItems:"center"
    },
    modalBackgroundStyle: {
        flex: 1,
        width: pageWidth,
        height: pageHeight,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    modalContainerStyle2: {
        position: 'absolute',
        width: pageWidth * 0.8,
        height: pageHeight*0.5,
        backgroundColor: '#E8E8E8',
        borderRadius: 15,
        padding:10,
        overflow: 'hidden',
        alignItems: 'center',
    },
    modalHeaderContainerStyle: {
        width: '100%',
        height: '23%',
        backgroundColor: '#660000',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    modalHeaderTextStyle: {
        color: '#fff',
        fontSize: normalize(15),
        fontFamily: 'IRANSansMobile_Medium',
    },
    modalBodyContainerStyle: {
        width: '100%',
        height: '26%',
        alignItems: 'center',
        justifyContent:"center",
        padding: 10,
    },
    modalBodyTextStyle: {
        color: '#660000',
        textAlign: 'center',
        fontSize: normalize(16),
        fontFamily: 'IRANSansMobile_Light',
    },
    modalFooterContainerStyle: {
        flexDirection: 'row',
        width: '100%',
        height: '30%',
        justifyContent: 'space-around',
    },
    modalButtonStyle: {
        backgroundColor: '#660000',
        width: pageWidth * 0.23,
        height: 45,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: pageHeight * 0.03,
        elevation: 5,
    },
    modalButtonTextStyle: {
        color: '#fff',
        fontSize: normalize(14),
        fontFamily: 'IRANSansMobile_Medium',
    },
});

export default RequestObject;
