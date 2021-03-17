import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Text,
    FlatList,
    TextInput,
    ScrollView,
    ToastAndroid,
    ActivityIndicator
} from 'react-native';
import {normalize} from '../../utils/utilities';
import CheckBox from 'react-native-check-box';
import Input from "../../common/Input";
import ImagePicker from "react-native-image-crop-picker";
import ImageViewer from "../../common/ImageViwer";
import {useSelector, useDispatch} from 'react-redux';
import {getInventoryObjects} from "../../../actions/api";
import {LOGOUT} from "../../../actions/types";
import {
    SearchIcon,
    PlusIcon,
    MinusIcon,
    CameraIcon,
    UploadFileIcon,
    DeleteIcon
} from "../../../assets/icons/index";

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const WarehouseHandling = ({navigation}) => {
    const dispatch = useDispatch();
    const selector = useSelector(state => state);
    const [screenMode, setScreenMode] = useState("all");
    const [allObjectsList, setAllObjectsList] = useState([
        {
            objectName: 'testObject1',
            totalItems: 5,
            type: 1,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [{
                        serialString: 'TEST1111111',
                        isChecked: false
                    }, {
                        serialString: "TEST2222222",
                        isChecked: false
                    }],
                    version: 'testVersion1',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST2222222',
                        isChecked: false
                    }, {
                        serialString: "TEST11113456",
                        isChecked: false
                    }],
                    version: 'testVersion2',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST3333333',
                        isChecked: false
                    }],
                    version: 'testVersion3',
                    count: 1
                },
            ],
            isExpanded: false,
        },
        {
            objectName: 'testObject2',
            totalItems: 3,
            type: 1,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [{
                        serialString: 'TEST11113456',
                        isChecked: false
                    }, {
                        serialString: "TEST22222345",
                        isChecked: false
                    }],
                    version: 'testVersion1',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST22222345',
                        isChecked: false
                    }],
                    version: 'testVersion2',
                    count: 1
                },
            ],
            isExpanded: false,
        },
        {
            objectName: 'testObject3',
            totalItems: 7,
            type: 0,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion1',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 3,
                    version: 'testVersion2',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion3',
                },
            ],
            isExpanded: false,
        },
        {
            type: 0,
            objectName: 'testObject4',
            totalItems: 7,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion1',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 3,
                    version: 'testVersion2',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion3',
                },
            ],
            isExpanded: false,
        },
    ]);
    const [constList, setConstList] = useState([
        {
            objectName: 'testObject1',
            totalItems: 5,
            type: 1,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [{
                        serialString: 'TEST1111111',
                        isChecked: false
                    }, {
                        serialString: "TEST2222222",
                        isChecked: false
                    }],
                    version: 'testVersion1',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST2222222',
                        isChecked: false
                    }, {
                        serialString: "TEST11113456",
                        isChecked: false
                    }],
                    version: 'testVersion2',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST3333333',
                        isChecked: false
                    }],
                    version: 'testVersion3',
                    count: 1
                },
            ],
            isExpanded: false,
        },
        {
            objectName: 'testObject2',
            totalItems: 3,
            type: 1,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [{
                        serialString: 'TEST11113456',
                        isChecked: false
                    }, {
                        serialString: "TEST22222345",
                        isChecked: false
                    }],
                    version: 'testVersion1',
                    count: 2
                },
                {
                    serialList: [{
                        serialString: 'TEST22222345',
                        isChecked: false
                    }],
                    version: 'testVersion2',
                    count: 1
                },
            ],
            isExpanded: false,
        },
        {
            objectName: 'testObject3',
            totalItems: 7,
            type: 0,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion1',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 3,
                    version: 'testVersion2',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion3',
                },
            ],
            isExpanded: false,
        },
        {
            type: 0,
            objectName: 'testObject4',
            totalItems: 7,
            isChecked: false,
            objectInventory: [
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion1',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 3,
                    version: 'testVersion2',
                },
                {
                    serialList: [],
                    selectedCount: 0,
                    count: 2,
                    version: 'testVersion3',
                },
            ],
            isExpanded: false,
        },
    ]);
    const [hasToBeRefreshed, setHasToBeRefreshed] = useState(false);
    const [allSelected, setAllSelected] = useState("");
    const [searchText, setSearchText] = useState("");
    const [renderConfirmModal, setRenderConfirmModal] = useState(false);
    const [barnameNumber, setBarnameNumber] = useState("");
    const [barnameImage, setBarnameImage] = useState("");
    const [inventoryLoading, setInventoryLoading] = useState(true);

    const Separator = () => <View style={Styles.separator}/>;

    useEffect(() => {
        getInventory();
    }, [])

    const getInventory = () => {
        getInventoryObjects(selector.token).then(data => {
            console.warn("FFFFF", data.result[12].Versions);
            if (data.errorCode === 0) {
                let tmp = [];
                data.result.map(item => {
                    tmp.push({...item, isExpanded: false, isChecked: false});
                })
                setAllObjectsList(tmp);
                setInventoryLoading(false);
            } else {
                if (data.errorCode === 3) {
                    dispatch({
                        type: LOGOUT,
                    });
                    navigation.navigate('SignedOut');
                } else {
                    ToastAndroid.showWithGravity(
                        data.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }
            }
            setInventoryLoading(false);
            console.warn("DDDDD", data.result[12].Versions);
        })
    }

    const handleSearch = (searchValue) => {
        if (!!searchValue) {
            let tempList = constList.filter(item => item.objectName.toLowerCase().includes(searchValue));
            setAllObjectsList(tempList);
        } else {
            setAllObjectsList(constList);
        }
    };

    return (
        <View style={Styles.containerStyle}>
            <View style={Styles.headerButtonsContainerStyle}>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "fail"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        if (screenMode !== "fail") {
                            let tmp = [...allObjectsList];
                            tmp.map((it, itIndex) => {
                                tmp[itIndex] = {...it, isExpanded: false}
                            })
                            setAllObjectsList(tmp);
                            setScreenMode("fail")
                        }
                    }}>
                    <Text
                        style={
                            screenMode === "fail"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        ناسالم
                    </Text>
                    <View
                        style={screenMode === "fail" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "new"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        if (screenMode !== "new") {
                            let tmp = [...allObjectsList];
                            tmp.map((it, itIndex) => {
                                tmp[itIndex] = {...it, isExpanded: false}
                            })
                            setAllObjectsList(tmp);
                            setScreenMode("new")
                        }
                    }}>
                    <Text
                        style={
                            screenMode === "new"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        سالم
                    </Text>
                    <View
                        style={screenMode === "new" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "all"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        if (screenMode !== "all") {
                            let tmp = [...allObjectsList];
                            tmp.map((it, itIndex) => {
                                tmp[itIndex] = {...it, isExpanded: false}
                            })
                            setAllObjectsList(tmp);
                            setScreenMode("all")
                        }
                    }}>
                    <Text
                        style={
                            screenMode === "all"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        همه
                    </Text>
                    <View
                        style={screenMode === "all" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
            </View>
            <View style={[Styles.searchbarContainerStyle, {elevation: renderConfirmModal ? 0 : 5}]}>
                <TextInput
                    style={Styles.textinputStyle}
                    placeholder={"نام قطعه و نسخه را جستجو کنید..."}
                    onChangeText={(text) => {
                        setSearchText(text);
                        handleSearch(text);
                    }}
                    value={searchText}
                />
                {SearchIcon(
                    {
                        color: "#000",
                    }
                )}
            </View>
            <View style={Styles.selectAllCheckBoxContainerStyle}>
                <TouchableOpacity style={Styles.confirmButtonStyle} onPress={() => setRenderConfirmModal(true)}>
                    <Text style={Styles.confirmButtonTextStyle}>
                        تایید
                    </Text>
                </TouchableOpacity>
                <View style={{flexDirection: "row"}}>
                    <Text style={{fontFamily: 'IRANSansMobile_Light'}}>
                        انتخاب همه
                    </Text>
                    <CheckBox checkBoxColor={"#9C0000"} onClick={() => {
                        let currentList = [...allObjectsList];
                        currentList.map((item, index) => {
                            if (screenMode === "all") {
                                currentList.splice(index, 1, {
                                    ...item, isChecked: allSelected !== "all"
                                });
                                currentList[index].objectInventory.map((ver, verIndex) => {
                                    if (!!ver.serialList.length) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].objectInventory[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected !== "all"
                                            }
                                        })
                                    } else {
                                        currentList[index].objectInventory[verIndex].selectedCount = currentList[index].objectInventory[verIndex].count;
                                    }
                                })
                                setAllSelected(allSelected === "all" ? "" : screenMode);
                            } else if (screenMode === "new" && !!item.type) {
                                currentList.splice(index, 1, {
                                    ...item, isChecked: allSelected === "fail" || allSelected === ""
                                });
                                currentList[index].objectInventory.map((ver, verIndex) => {
                                    if (!!ver.serialList.length) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].objectInventory[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "fail" || allSelected === ""
                                            }
                                        })
                                    } else {
                                        currentList[index].objectInventory[verIndex].selectedCount = currentList[index].objectInventory[verIndex].count;
                                    }
                                });
                                setAllSelected(allSelected === "all" ? "fail" : allSelected === "new" ? "" : allSelected === "fail" ? "all" : screenMode);
                            } else if (screenMode === "fail" && !item.type) {
                                currentList.splice(index, 1, {
                                    ...item, isChecked: allSelected === "new" || allSelected === ""
                                });
                                currentList[index].objectInventory.map((ver, verIndex) => {
                                    if (!!ver.serialList.length) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].objectInventory[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "new" || allSelected === ""
                                            }
                                        });
                                    } else {
                                        currentList[index].objectInventory[verIndex].selectedCount = currentList[index].objectInventory[verIndex].count;
                                    }
                                });
                                setAllSelected(allSelected === "all" ? "new" : allSelected === "fail" ? "" : allSelected === "new" ? "all" : screenMode);
                            }
                        });
                        setAllObjectsList(currentList);
                        setHasToBeRefreshed(!hasToBeRefreshed);
                    }} isChecked={allSelected === "all" ? true : allSelected === screenMode}/>
                </View>
            </View>
            <View style={{flex: 1}}>
                {inventoryLoading ? (
                    <ActivityIndicator/>
                ) : (
                    <FlatList
                        data={allObjectsList}
                        renderItem={({item, index}) => screenMode === "all" || (screenMode === "new" && !!item.type) || (screenMode === "fail" && !item.type) ? (
                            <View
                                style={[Styles.cardHeaderStyle, {
                                    backgroundColor: !!item.Broken ? "#90DA9F" : "#FF9999",
                                }]}>
                                <TouchableOpacity style={{
                                    width: "100%",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-around"
                                }} onPress={() => {
                                    let currentList = [...allObjectsList];
                                    currentList[index] = {...item, isExpanded: !item.isExpanded};
                                    setAllObjectsList(currentList);
                                    setHasToBeRefreshed(!hasToBeRefreshed);
                                }
                                }>
                                    <Text style={Styles.labelTextStyle}>
                                        تعداد کل: {item.Total}
                                    </Text>
                                    <Text style={Styles.labelTextStyle}>
                                        نام
                                        قطعه: {item.Object_Name.length > 13 ? `${item.Object_Name.substr(0, 13)}...` : item.Object_Name}
                                    </Text>
                                    <CheckBox checkBoxColor={'#9C0000'} isChecked={item.isChecked} onClick={() => {
                                        if (item.isChecked) {
                                            if (allSelected === "all" && !!item.type) {
                                                setAllSelected("fail");
                                            } else if (allSelected === "all" && !item.type) {
                                                setAllSelected("new");
                                            } else {
                                                setAllSelected('');
                                            }
                                        }
                                        let currentList = [];
                                        currentList = [...allObjectsList];
                                        let ITEM_OBJECT_INVENTORY = currentList[index].objectInventory;
                                        ITEM_OBJECT_INVENTORY.map((version, versionIndex) => {
                                            if (!!ITEM_OBJECT_INVENTORY[versionIndex].serialList.length) {
                                                ITEM_OBJECT_INVENTORY[versionIndex].serialList.map((serial, serialIndex) => {
                                                    ITEM_OBJECT_INVENTORY[versionIndex].serialList[serialIndex] = {
                                                        ...serial,

                                                        isChecked: !item.isChecked
                                                    }
                                                })
                                            } else {
                                                ITEM_OBJECT_INVENTORY[versionIndex].selectedCount = ITEM_OBJECT_INVENTORY[versionIndex].count
                                            }
                                        })
                                        currentList[index] = {
                                            ...item, isChecked: !item.isChecked, objectInventory: ITEM_OBJECT_INVENTORY
                                        };
                                        setAllObjectsList(currentList);
                                        setHasToBeRefreshed(!hasToBeRefreshed);
                                    }}/>
                                </TouchableOpacity>
                                {item.isExpanded && (
                                    <>
                                        <Separator/>
                                        <View style={{width: '100%'}}>
                                            {item.Versions.map((I, IIndex) => (
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'flex-start',
                                                        marginBottom: 15,
                                                        justifyContent: 'space-around',
                                                    }}>
                                                    {!!I.Serials.length ? (
                                                        <View>
                                                            {I.Serials.map((serial, serialIndex) => (
                                                                <View style={{
                                                                    flexDirection: "row",
                                                                    alignItems: "center"
                                                                }}>
                                                                    <CheckBox checkBoxColor={'#9C0000'}
                                                                              isChecked={serial.isChecked}
                                                                              onClick={() => {
                                                                                  if (serial.isChecked) {
                                                                                      if (allSelected === "all" && !!item.type) {
                                                                                          setAllSelected("fail");
                                                                                      } else if (allSelected === "all" && !item.type) {
                                                                                          setAllSelected("new");
                                                                                      } else if (allSelected === "new" && !!item.type) {
                                                                                          setAllSelected("");
                                                                                      } else if (allSelected === "fail" && !item.type) {
                                                                                          setAllSelected("");
                                                                                      }
                                                                                  }
                                                                                  let currentList = [...I.serialList];
                                                                                  currentList.splice(serialIndex, 1, {
                                                                                      ...serial,
                                                                                      isChecked: !serial.isChecked
                                                                                  })
                                                                                  let LIST = [...allObjectsList];
                                                                                  let tempObjectInventory = [...item.objectInventory];
                                                                                  tempObjectInventory[IIndex] = {
                                                                                      ...I, serialList: currentList
                                                                                  };
                                                                                  LIST[index] = {
                                                                                      ...item,
                                                                                      objectInventory: tempObjectInventory,
                                                                                      isChecked: serial.isChecked ? false : item.isChecked
                                                                                  };
                                                                                  setAllObjectsList(LIST);
                                                                                  setHasToBeRefreshed(!hasToBeRefreshed);
                                                                              }}/>
                                                                    <Text
                                                                        style={Styles.labelTextStyle}>{serial.serialString}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    ) : (
                                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                                            <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                                                              onPress={() => {
                                                                                  if (I.selectedCount < I.count) {
                                                                                      let tempList = [...allObjectsList];
                                                                                      tempList[index].objectInventory[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.selectedCount + 1
                                                                                      }
                                                                                      setAllObjectsList(tempList);
                                                                                      setHasToBeRefreshed(!hasToBeRefreshed);
                                                                                  }
                                                                              }}>
                                                                {PlusIcon({
                                                                    color: "#fff"
                                                                })}
                                                            </TouchableOpacity>
                                                            <Text style={{
                                                                textAlign: "center",
                                                                fontFamily: "IRANSansMobile_Medium"
                                                            }}>
                                                                از {I.Count}
                                                            </Text>
                                                            <Text style={{marginHorizontal: 5}}>
                                                                {I.selectedCount}
                                                            </Text>
                                                            <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                                                              onPress={() => {
                                                                                  if (I.selectedCount > 0) {
                                                                                      if (allSelected === "all") {
                                                                                          if (!!item.type) {
                                                                                              setAllSelected("fail");
                                                                                          } else {
                                                                                              setAllSelected("new");
                                                                                          }
                                                                                      } else if (!!allSelected) {
                                                                                          setAllSelected("");
                                                                                      }
                                                                                      let tempList = [...allObjectsList];
                                                                                      tempList[index].isChecked = false;
                                                                                      tempList[index].objectInventory[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.selectedCount - 1
                                                                                      }
                                                                                      setAllObjectsList(tempList);
                                                                                      setHasToBeRefreshed(!hasToBeRefreshed);
                                                                                  }
                                                                              }}>
                                                                {MinusIcon({
                                                                    color: "#fff"
                                                                })}
                                                            </TouchableOpacity>
                                                            <Text style={{
                                                                textAlign: "center",
                                                                fontFamily: "IRANSansMobile_Medium"
                                                            }}>
                                                                تعداد :
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <Text style={Styles.labelTextStyle}>نام
                                                        نسخه: {I.Version_Name}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>
                                )}
                            </View>
                        ) : null}
                    />
                )}
            </View>
            {renderConfirmModal && (
                <View style={Styles.modalBackgroundStyle}>
                    <ScrollView style={[Styles.modalContainerStyle, {
                        height: !!barnameImage ? "70%" : "40%",
                        top: !!barnameImage ? pageHeight * 0.04 : pageHeight * 0.17
                    }]} contentContainerStyle={{justifyContent: "center", alignSelf: "center", alignItems: 'center'}}>
                        <View style={Styles.modalBodyContainerStyle2}>
                            <Input label={"شماره بارنامه"} keyboardType={"numeric"}
                                   onChangeText={text => setBarnameNumber(text)} value={barnameNumber}/>
                            {!barnameImage &&
                            <Text style={{fontFamily: "IRANSansMobile_Light"}}>لطفا عکس بارنامه را بارگذاری
                                کنید.</Text>}
                            <View style={Styles.getImageContainerViewStyle}>
                                {CameraIcon({
                                    style: {marginHorizontal: 10},
                                    color: "#000",
                                    onPress: () => {
                                        ImagePicker.openCamera({
                                            width: pageWidth - 20,
                                            height: pageHeight * 0.7,
                                            includeBase64: true,
                                            compressImageQuality: 0.7,
                                        }).then(response => {
                                            setBarnameImage(response.data);
                                        }).catch(err => {
                                            ToastAndroid.showWithGravity(
                                                'مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
                                                ToastAndroid.SHORT,
                                                ToastAndroid.CENTER,
                                            );
                                        });
                                    }
                                })}
                                {UploadFileIcon({
                                    style: {marginHorizontal: 10},
                                    color: '#000',
                                    onPress: () => {
                                        ImagePicker.openPicker({
                                            width: pageWidth - 20,
                                            height: pageHeight * 0.7,
                                            includeBase64: true,
                                            compressImageQuality: 0.7,
                                        }).then(response => {
                                            setBarnameImage(response.data);
                                        }).catch(err => {
                                            ToastAndroid.showWithGravity(
                                                'مشکلی پیش آمد. لطفا دوباره تلاش کنید.',
                                                ToastAndroid.SHORT,
                                                ToastAndroid.CENTER,
                                            );
                                        });
                                    }
                                })}
                                {!!barnameImage && DeleteIcon({
                                    onPress: () => {
                                        setBarnameImage("")
                                    },
                                    color: '#000',
                                    style: {marginHorizontal: 10}
                                })}
                            </View>
                            {!!barnameImage && (
                                <ImageViewer
                                    width={pageWidth - 30}
                                    height={pageHeight * 0.7}
                                    imageUrl={`data:image/jpeg;base64,${barnameImage}`}
                                />
                            )}
                        </View>
                        <View style={Styles.modalFooterContainerStyle}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    setBarnameNumber("");
                                    setBarnameImage("");
                                    setRenderConfirmModal(false)
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const Styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
    },
    headerButtonsContainerStyle: {
        flexDirection: 'row',
        height: pageHeight * 0.08,
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    activeHeaderButtonStyle: {
        width: '25%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    deactiveHeaderButtonStyle: {
        width: '25%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    activeHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(15),
        color: '#9C0000',
    },
    deactiveHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(15),
        color: 'gray',
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: "#000",
        borderBottomWidth: 1,
        width: '100%',
    },
    labelTextStyle: {
        textAlign: 'center',
        fontFamily: 'IRANSansMobile_Medium'
    },
    serialTextStyle: {
        textAlign: 'center',
        fontFamily: 'IRANSansMobile_Light'
    },
    activeRadioButtonStyle: {
        width: pageWidth * 0.05,
        height: pageWidth * 0.05,
        borderRadius: pageWidth * 0.025,
        borderColor: "#7C0000",
        borderWidth: 1.5,
        marginLeft: 10,
        backgroundColor: "#7C0000"
    },
    deactiveRadioButtonStyle: {
        width: pageWidth * 0.05,
        height: pageWidth * 0.05,
        borderRadius: pageWidth * 0.025,
        borderColor: "gray",
        borderWidth: 1.5,
        marginLeft: 10,
    },
    searchbarContainerStyle: {
        width: "94%",
        height: pageHeight * 0.08,
        backgroundColor: "#fff",
        borderRadius: 30,
        alignSelf: "center",
        marginBottom: 5,
        paddingHorizontal: 10,
        paddingVertical: 7,
        flexDirection: "row",
        justifyContent: 'space-around',
        alignItems: "center"
    },
    textinputStyle: {
        width: "84%",
        height: "100%",
        fontFamily: 'IRANSansMobile_Light',
        fontSize: 12,
    },
    selectAllCheckBoxContainerStyle: {
        width: "100%",
        height: pageHeight * 0.08,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        justifyContent: "space-between"
    },
    cardHeaderStyle: {
        width: pageWidth * 0.9,
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        alignSelf: 'center',
    },
    confirmButtonStyle: {
        width: pageWidth * 0.2,
        height: pageHeight * 0.06,
        backgroundColor: "#660000",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center"
    },
    confirmButtonTextStyle: {
        color: "#fff",
        fontFamily: "IRANSansMobile_Medium"
    },
    plusButtonContainerStyle: {
        width: 30,
        height: 30,
        backgroundColor: "#660000",
        borderRadius: 15,
        marginRight: 5,
        justifyContent: "center",
        alignItems: "center"
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
    modalContainerStyle: {
        position: 'absolute',
        height: '70%',
        width: pageWidth - 15,
        backgroundColor: '#fff',
        marginBottom: pageHeight * 0.25,
        borderRadius: 15,
        overflow: 'scroll',
    },
    modalBodyContainerStyle2: {
        width: '100%',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'center',
    },
    modalButtonTextStyle: {
        color: 'white',
        fontSize: normalize(14),
        fontFamily: 'IRANSansMobile_Medium',
    },
    modalButtonStyle: {
        backgroundColor: '#660000',
        width: pageWidth * 0.2,
        height: 35,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        marginHorizontal: 20
    },
    modalFooterContainerStyle: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15
    },
    getImageContainerViewStyle: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: "center",
        marginVertical: 20
    },
});

export default WarehouseHandling;
