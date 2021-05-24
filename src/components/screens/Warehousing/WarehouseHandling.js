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
import {getFontsName, normalize} from '../../utils/utilities';
import CheckBox from 'react-native-check-box';
import Input from "../../common/Input";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ImageViewer from "../../common/ImageViwer";
import {useSelector, useDispatch} from 'react-redux';
import {garanteeInquiry, getInventoryObjects, sendUndoneObjects} from "../../../actions/api";
import {LOGOUT} from "../../../actions/types";
import {
    SearchIcon,
    PlusIcon,
    MinusIcon,
    CameraIcon,
    UploadFileIcon,
    DeleteIcon, StarIcon
} from "../../../assets/icons/index";
import Toast from "react-native-simple-toast";
import iterableToArray from "@babel/runtime/helpers/esm/iterableToArray";

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const WarehouseHandling = ({navigation, setTabIndex}) => {
    const dispatch = useDispatch();
    const selector = useSelector(state => state);
    const [screenMode, setScreenMode] = useState("all");
    const [allObjectsList, setAllObjectsList] = useState([]);
    const [constList, setConstList] = useState([]);
    const [hasToBeRefreshed, setHasToBeRefreshed] = useState(false);
    const [allSelected, setAllSelected] = useState("");
    const [searchText, setSearchText] = useState("");
    const [renderConfirmModal, setRenderConfirmModal] = useState(false);
    // const [barnameNumber, setBarnameNumber] = useState("");
    // const [barnameImage, setBarnameImage] = useState("");
    const [inventoryLoading, setInventoryLoading] = useState(true);
    // const [sendDescription, setSendDescription] = useState("");
    const [sendLoading, setSendLoading] = useState(false);

    const Separator = () => <View style={Styles.separator}/>;

    useEffect(() => {
        getInventory();
    }, [])

    const getInventory = () => {
        getInventoryObjects(selector.token).then(data => {
            if (data.errorCode === 0) {
                let tmp = [];
                let idx = 0;
                data.result.map(item => {
                    let objct = selector.objectsList.filter(obj=> obj.value.Id === item.ObjectID);
                    let tempVersions = [];
                    if (objct.length === 0){
                        setInventoryLoading(false)
                    }
                    if(!!objct[0].value.SerialFormat) {
                        let currentVersion = item.Versions[0];
                        let serialList = [];
                        item.Versions.map((I,index) => {
                            if (index === item.Versions.length - 1){
                                if (I.VersionId === currentVersion.VersionId){
                                    serialList.push({Serial:I.Serial, isChecked: false})
                                    tempVersions.push({
                                        ...currentVersion, serialList: serialList, isChecked: false
                                    });
                                } else {
                                    tempVersions.push({
                                        ...currentVersion, serialList: serialList, isChecked: false
                                    })
                                    tempVersions.push({
                                        ...I, serialList: [{Serial: I.Serial, isChecked: false}], isChecked: false
                                    });
                                }
                            } else {
                                if (I.VersionId !== currentVersion.VersionId) {
                                    tempVersions.push({
                                        ...currentVersion, serialList: serialList, isChecked: false
                                    });
                                    currentVersion = I;
                                    serialList = [{Serial: I.Serial, isChecked: false}];
                                } else {
                                    serialList.push({Serial: I.Serial, isChecked: false});
                                }
                            }
                        });
                        tmp.push({...item, ID: idx, Versions: tempVersions, isExpanded: false, isChecked: false, hasSerialFormat: true});
                    }
                    else {
                        let currentVersion = item.Versions[0];
                        let totalCount = 0;
                        item.Versions.map((I,index) => {
                            if (index === item.Versions.length - 1){
                                if (I.VersionId === currentVersion.VersionId){
                                    tempVersions.push({
                                        ...currentVersion, isChecked: false, Count: totalCount+I.Count, selectedCount: 0
                                    });
                                } else {
                                    tempVersions.push({
                                        ...currentVersion, isChecked: false, Count: totalCount, selectedCount: 0
                                    });
                                    tempVersions.push({
                                        ...I, isChecked: false, selectedCount: 0
                                    });
                                }

                            } else {
                                if (I.VersionId !== currentVersion.VersionId) {
                                    tempVersions.push({
                                        ...currentVersion, isChecked: false, Count: totalCount, selectedCount: 0
                                    });
                                    currentVersion = I;
                                    totalCount = I.Count;
                                } else {
                                    totalCount += I.Count;
                                }
                            }
                        });
                        tmp.push({...item, ID: idx, isExpanded: false, isChecked: false, Versions: tempVersions, hasSerialFormat: false});
                    }
                    idx += 1;
                })
                setAllObjectsList(tmp);
                setInventoryLoading(false);
                setConstList(tmp);
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
        })
    }

    const handleSearch = (searchValue) => {
        if (!!searchValue) {
            let tempList = constList.filter(item => item.Object_Name.toLowerCase().includes(searchValue));
            setAllObjectsList(tempList);
        } else {
            setAllObjectsList(constList);
        }
    };

    const sendRequest = ()=>{
        setSendLoading(true);
        let objectsList = [];
        constList.map(obj=> {
            if (obj.isChecked){
                if (obj.hasSerialFormat) {
                    obj.Versions.map(vers => {
                        vers.serialList.map(serial => {
                            if (serial.isChecked) {
                                objectsList.push({
                                    ObjectID: obj.ObjectID,
                                    VersionID: vers.VersionId,
                                    Serial: serial.Serial,
                                    Count: 1,
                                    Broken: obj.Broken
                                });
                            }
                        })
                    })
                } else {
                    obj.Versions.map(vers => {
                        if (vers.selectedCount > 0) {
                            objectsList.push({
                                ObjectID: obj.ObjectID,
                                VersionID: vers.VersionId,
                                Serial: null,
                                Count: vers.selectedCount,
                                Broken: obj.Broken
                            })
                        }
                    })
                }
            }
        })
        console.log("objectsList",objectsList);
        sendUndoneObjects(selector.token, objectsList).then(data => {
            if (data.errorCode === 0) {
                Toast.showWithGravity('درخواست شما با موفقیت ثبت شد.', Toast.LONG, Toast.CENTER);
                setSendLoading(false);
                setRenderConfirmModal(false);
                setTabIndex(0);
                getInventory();
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                navigation.navigate('SignedOut');
                setSendLoading(false);
            } else {
                setSendLoading(false);
                Toast.showWithGravity('مشکلی پیش آمد. لطفا دوباره تلاش کنید.', Toast.LONG, Toast.CENTER);
            }
        });
    }

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
                            let tmp = [...constList];
                            tmp.map((it, itIndex) => {
                                tmp[itIndex] = {...it, isExpanded: false}
                            })
                            setAllObjectsList(tmp);
                            setScreenMode("fail");
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
                            let tmp = [...constList];
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
                            if (!!searchText){
                                let tempList = constList.filter(item => item.Object_Name.toLowerCase().includes(searchText));
                                setAllObjectsList(tempList);
                            } else {
                                let tmp = [...constList];
                                tmp.map((it, itIndex) => {
                                    tmp[itIndex] = {...it, isExpanded: false}
                                })
                                setAllObjectsList(tmp);
                            }
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
            {screenMode === "all" && (<View style={[Styles.searchbarContainerStyle, {elevation: renderConfirmModal ? 0 : 5}]}>
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
            </View>)}
            <View style={Styles.selectAllCheckBoxContainerStyle}>
                <TouchableOpacity style={Styles.confirmButtonStyle} onPress={() => setRenderConfirmModal(true)}>
                    <Text style={Styles.confirmButtonTextStyle}>
                        ارسال
                    </Text>
                </TouchableOpacity>
                <View style={{flexDirection: "row"}}>
                    <Text style={{fontFamily: 'IRANSansMobile_Light'}}>
                        انتخاب همه
                    </Text>
                    <CheckBox checkBoxColor={"#9C0000"} onClick={() => {
                        let currentList = [...allObjectsList];
                        let tempConstList = [...constList];
                        currentList.map((item, index) => {
                            let index_in_constlist = constList.findIndex(x=> x.ID === item.ID);
                            if (screenMode === "all") {
                                currentList[index] = {
                                    ...item, isChecked: allSelected !== "all"
                                };
                                tempConstList[index_in_constlist] = {
                                    ...item, isChecked: allSelected !== "all"
                                }
                                currentList[index].Versions.map((ver, verIndex) => {
                                    if (item.hasSerialFormat) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected !== "all"
                                            }
                                            tempConstList[index_in_constlist].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected !== "all"
                                            }
                                        })
                                    } else {
                                        currentList[index].Versions[verIndex].selectedCount = allSelected !== "all" ? currentList[index].Versions[verIndex].Count : 0;
                                        tempConstList[index_in_constlist].Versions[verIndex].selectedCount = allSelected !== "all" ? tempConstList[index_in_constlist].Versions[verIndex].Count : 0;
                                    }
                                })
                                setAllSelected(allSelected === "all" ? "" : screenMode);
                            } else if (screenMode === "new" && !!item.Broken) {
                                currentList.splice(index, 1, {
                                    ...item, isChecked: allSelected === "fail" || allSelected === ""
                                });
                                tempConstList.splice(index_in_constlist, 1, {
                                    ...item, isChecked: allSelected === "fail" || allSelected === ""
                                });
                                currentList[index].Versions.map((ver, verIndex) => {
                                    if (currentList[index].hasSerialFormat) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "fail" || allSelected === ""
                                            };
                                            tempConstList[index_in_constlist].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "fail" || allSelected === ""
                                            }
                                        })
                                    } else {
                                        currentList[index].Versions[verIndex].selectedCount = currentList[index].Versions[verIndex].Count;
                                        tempConstList[index_in_constlist].Versions[verIndex].selectedCount = tempConstList[index_in_constlist].Versions[verIndex].Count;
                                    }
                                });
                                setAllSelected(allSelected === "all" ? "fail" : allSelected === "new" ? "" : allSelected === "fail" ? "all" : screenMode);
                            } else if (screenMode === "fail" && !item.Broken) {
                                currentList.splice(index, 1, {
                                    ...item, isChecked: allSelected === "new" || allSelected === ""
                                });
                                tempConstList.splice(index_in_constlist, 1, {
                                    ...item, isChecked: allSelected === "new" || allSelected === ""
                                });
                                currentList[index].Versions.map((ver, verIndex) => {
                                    if (currentList[index].hasSerialFormat) {
                                        ver.serialList.map((ser, serIndex) => {
                                            currentList[index].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "new" || allSelected === ""
                                            };
                                            tempConstList[index_in_constlist].Versions[verIndex].serialList[serIndex] = {
                                                ...ser,
                                                isChecked: allSelected === "new" || allSelected === ""
                                            };
                                        });
                                    } else {
                                        currentList[index].Versions[verIndex].selectedCount = currentList[index].Versions[verIndex].Count;
                                        tempConstList[index_in_constlist].Versions[verIndex].selectedCount = tempConstList[index_in_constlist].Versions[verIndex].Count;
                                    }
                                });
                                setAllSelected(allSelected === "all" ? "new" : allSelected === "fail" ? "" : allSelected === "new" ? "all" : screenMode);
                            }
                        });
                        setAllObjectsList(currentList);
                        setConstList(tempConstList);
                        setHasToBeRefreshed(!hasToBeRefreshed);
                    }} isChecked={allSelected === "all" ? true : allSelected === screenMode}/>
                </View>
            </View>
            <View style={{flex: 1}}>
                {inventoryLoading ? (
                    <ActivityIndicator color={"#660000"} size={"large"} style={{marginTop:pageHeight*0.2}}/>
                ) : (
                    <FlatList
                        data={allObjectsList}
                        renderItem={({item, index}) => screenMode === "all" || (screenMode === "new" && !!item.Broken) || (screenMode === "fail" && !item.Broken) ? (
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
                                    let tempConstList = [...constList];
                                    let index_in_constlist = constList.findIndex(x => x.ID === item.ID);
                                    currentList[index] = {...item, isExpanded: !item.isExpanded};
                                    tempConstList[index_in_constlist] = {...item, isExpanded: !item.isExpanded};
                                    setAllObjectsList(currentList);
                                    setConstList(tempConstList);
                                    setHasToBeRefreshed(!hasToBeRefreshed);
                                }
                                }>
                                    <Text style={[Styles.labelTextStyle,{fontSize:13}]}>
                                        تعداد کل: {item.Total}
                                    </Text>
                                    <Text style={[Styles.labelTextStyle,{flexShrink:1, width:'55%', textAlign: "right", fontSize:13}]}>
                                        نام
                                        قطعه: {item.Object_Name}
                                    </Text>
                                    {((item.hasSerialFormat && item.Total > 0) || !item.hasSerialFormat) && (
                                        <CheckBox checkBoxColor={'#9C0000'} isChecked={item.isChecked} onClick={() => {
                                        let flag = false;
                                        if (item.isChecked) {
                                            flag = true;
                                            if (allSelected === "all" && !!item.Broken) {
                                                setAllSelected("fail");
                                            } else if (allSelected === "all" && !item.Broken) {
                                                setAllSelected("new");
                                            } else {
                                                setAllSelected('');
                                            }
                                        }
                                        let currentList = [];
                                        currentList = [...allObjectsList];
                                        let tempConstList = [...constList];
                                        let index_in_constlist = constList.findIndex(x => x.ID === item.ID);
                                        let ITEM_OBJECT_INVENTORY = currentList[index].Versions;
                                        ITEM_OBJECT_INVENTORY.map((version, versionIndex) => {
                                            if (currentList[index].hasSerialFormat) {
                                                ITEM_OBJECT_INVENTORY[versionIndex].serialList.map((serial, serialIndex) => {
                                                    ITEM_OBJECT_INVENTORY[versionIndex].serialList[serialIndex] = {
                                                        ...serial,
                                                        isChecked: !flag
                                                    }
                                                })
                                            } else {
                                                ITEM_OBJECT_INVENTORY[versionIndex].selectedCount = flag
                                                    ? 0 : ITEM_OBJECT_INVENTORY[versionIndex].Count > 0
                                                        ? ITEM_OBJECT_INVENTORY[versionIndex].Count :
                                                        ITEM_OBJECT_INVENTORY[versionIndex].selectedCount;
                                            }
                                        })
                                        currentList[index] = {
                                            ...item, isChecked: !item.isChecked, Versions: ITEM_OBJECT_INVENTORY
                                        };
                                        tempConstList[index_in_constlist] = {
                                            ...item, isChecked: !item.isChecked, Versions: ITEM_OBJECT_INVENTORY
                                        };
                                        setAllObjectsList(currentList);
                                        setConstList(tempConstList);
                                        setHasToBeRefreshed(!hasToBeRefreshed);
                                    }}/>)}
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
                                                    {item.hasSerialFormat ? (
                                                        <View>
                                                            {I.serialList.map((serial, serialIndex) => (
                                                                <View style={{
                                                                    flexDirection: "row",
                                                                    alignItems: "center"
                                                                }}>
                                                                    {item.Total > 0 && (<CheckBox checkBoxColor={'#9C0000'}
                                                                               isChecked={serial.isChecked}
                                                                               onClick={() => {
                                                                                   let flag = false;
                                                                                   if (serial.isChecked) {
                                                                                       if (allSelected === "all" && !!item.Broken) {
                                                                                           setAllSelected("fail");
                                                                                       } else if (allSelected === "all" && !item.Broken) {
                                                                                           setAllSelected("new");
                                                                                       } else if (allSelected === "new" && !!item.Broken) {
                                                                                           setAllSelected("");
                                                                                       } else if (allSelected === "fail" && !item.Broken) {
                                                                                           setAllSelected("");
                                                                                       }
                                                                                   } else {
                                                                                       flag = true;
                                                                                   }
                                                                                   let currentList = [...I.serialList];
                                                                                   currentList[serialIndex] = {
                                                                                       ...serial,
                                                                                       isChecked: !serial.isChecked
                                                                                   }
                                                                                   let LIST = [...allObjectsList];
                                                                                   let tempConstList = [...constList];
                                                                                   let index_in_constlist = constList.findIndex(x => x.ID === item.ID);
                                                                                   let tempObjectInventory = [...item.Versions];
                                                                                   tempObjectInventory[IIndex] = {
                                                                                       ...I, serialList: currentList
                                                                                   };
                                                                                   LIST[index].Versions.map((v, vIndex) => {
                                                                                       v.serialList.map((s, sIndex) => {
                                                                                           if (s.isChecked && (sIndex !== serialIndex || vIndex !== IIndex)) {
                                                                                               flag = true;
                                                                                           }
                                                                                       })
                                                                                   })
                                                                                   LIST[index] = {
                                                                                       ...item,
                                                                                       Versions: tempObjectInventory,
                                                                                       isChecked: flag
                                                                                   };
                                                                                   tempConstList[index_in_constlist] = {
                                                                                       ...item,
                                                                                       Versions: tempObjectInventory,
                                                                                       isChecked: flag
                                                                                   }
                                                                                   setAllObjectsList(LIST);
                                                                                   setConstList(tempConstList);
                                                                                   setHasToBeRefreshed(!hasToBeRefreshed);
                                                                               }}/>)}
                                                                    <Text
                                                                        style={Styles.labelTextStyle}>{serial.Serial}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    ) : (
                                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                                            <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                                                              onPress={() => {
                                                                                  if (I.selectedCount < I.Count){
                                                                                      let tempList = [...allObjectsList];
                                                                                      let tempConstList = [...constList];
                                                                                      let index_in_constlist = constList.findIndex(x=>x.ID === item.ID);
                                                                                      tempList[index].Versions[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.Count
                                                                                      }
                                                                                      tempConstList[index_in_constlist].Versions[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.selectedCount + 1
                                                                                      }
                                                                                      tempList[index]={...tempList[index], isChecked: true};
                                                                                      tempConstList[index_in_constlist]={...tempConstList[index_in_constlist], isChecked: true};
                                                                                      setAllObjectsList(tempList);
                                                                                      setConstList(tempConstList)
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
                                                                                      let tempConstList = [...constList];
                                                                                      let index_in_constlist = constList.findIndex(x=> x.ID === item.ID);
                                                                                      tempList[index].isChecked = false;
                                                                                      tempConstList[index_in_constlist].isChecked = false;
;                                                                                      tempList[index].Versions[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.selectedCount - 1
                                                                                      }
                                                                                      tempConstList[index_in_constlist].Versions[IIndex] = {
                                                                                          ...I,
                                                                                          selectedCount: I.selectedCount - 1
                                                                                      };
                                                                                        let check_flag = false;
                                                                                      tempList[index].Versions.map(v=>{
                                                                                          if (v.selectedCount>0){
                                                                                              check_flag = true;
                                                                                          }
                                                                                      })
                                                                                      tempList[index] = {...tempList[index], isChecked: check_flag};
                                                                                      tempConstList[index_in_constlist] = {...tempConstList[index_in_constlist], isChecked: check_flag};
                                                                                      setConstList(tempConstList);
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
                                                    <Text style={[Styles.labelTextStyle,{flexShrink:1, width:"40%"}]}>نام
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
                // <View style={Styles.modalBackgroundStyle}>
                //     <ScrollView style={[Styles.modalContainerStyle, {
                //         height: !!barnameImage ? "70%" : "55%",
                //         top: !!barnameImage ? pageHeight * 0.04 : pageHeight * 0.08
                //     }]} contentContainerStyle={{justifyContent: "center", alignSelf: "center", alignItems: 'center'}}>
                //         <View style={Styles.modalBodyContainerStyle2}>
                //             <Input label={"شماره بارنامه"} keyboardType={"numeric"}
                //                    onChangeText={text => setBarnameNumber(text)} value={barnameNumber}/>
                //             <View
                //                 style={{
                //                     width: pageWidth*0.8,
                //                     marginBottom: 10,
                //                     flexDirection: 'row',
                //                     justifyContent: 'flex-end',
                //                 }}>
                //                 <Text style={Styles.labelStyle}>توضیحات:</Text>
                //             </View>
                //             <TextInput
                //                 style={Styles.descriptionInputStyle}
                //                 onChangeText={text => {
                //                     setSendDescription(text)
                //                 }}
                //                 value={sendDescription}
                //                 multiline
                //             />
                //             {!barnameImage &&
                //             <Text style={{fontFamily: "IRANSansMobile_Light", marginTop:5}}>لطفا عکس بارنامه را بارگذاری
                //                 کنید.</Text>}
                //             <View style={Styles.getImageContainerViewStyle}>
                //                 {CameraIcon({
                //                     style: {marginHorizontal: 10},
                //                     color: "#000",
                //                     onPress: () => {
                //                         launchCamera(
                //                             {
                //                                 mediaType: 'photo',
                //                                 includeBase64: true,
                //                                 quality:0.5
                //                             },
                //                             (response) => {
                //                                 setBarnameImage(response.base64);
                //                             },
                //                         )
                //                     }
                //                 })}
                //                 {UploadFileIcon({
                //                     style: {marginHorizontal: 10},
                //                     color: '#000',
                //                     onPress: () => {
                //                         launchImageLibrary(
                //                             {
                //                                 mediaType: 'photo',
                //                                 includeBase64: true,
                //                                 quality:0.5
                //                             },
                //                             (response) => {
                //                                 setBarnameImage(response.base64);
                //                             },
                //                         )
                //                     }
                //                 })}
                //                 {!!barnameImage && DeleteIcon({
                //                     onPress: () => {
                //                         setBarnameImage("")
                //                     },
                //                     color: '#000',
                //                     style: {marginHorizontal: 10}
                //                 })}
                //             </View>
                //             {!!barnameImage && (
                //                 <ImageViewer
                //                     width={pageWidth - 30}
                //                     height={pageHeight * 0.7}
                //                     imageUrl={`data:image/jpeg;base64,${barnameImage}`}
                //                 />
                //             )}
                //         </View>
                //         {sendLoading ? (
                //             <View style={Styles.modalFooterContainerStyle}>
                //                 <ActivityIndicator size={"small"} color={"#660000"}/>
                //             </View>
                //         ) :(<View style={Styles.modalFooterContainerStyle}>
                //             <TouchableOpacity
                //                 style={Styles.modalButtonStyle}
                //                 onPress={() => {
                //                     setBarnameNumber("");
                //                     setBarnameImage("");
                //                     setRenderConfirmModal(false)
                //                 }}>
                //                 <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                //             </TouchableOpacity>
                //             <TouchableOpacity
                //                 style={Styles.modalButtonStyle}
                //                 onPress={() => {
                //                     sendRequest()
                //                 }}>
                //                 <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                //             </TouchableOpacity>
                //         </View>)}
                //     </ScrollView>
                // </View>


                //-------------------------------------------------


                <View style={Styles.modalBackgroundStyle}>
                    <View style={{
                        height: pageHeight*0.35,
                        width: pageWidth*0.8,
                        justifyContent:"space-around",
                        alignItems:"center",
                        backgroundColor:"#fff",
                        position:"absolute",
                        top:pageHeight*0.2,
                        borderRadius:10,
                        paddingVertical: "10%"
                    }}>
                        <Text style={{fontFamily:"IRANSansMobile_Medium"}}>آیا از ارسال درخواست خود اطمینان دارید؟</Text>
                        {sendLoading ? (
                            <View style={Styles.modalFooterContainerStyle}>
                                <ActivityIndicator size={"small"} color={"#660000"}/>
                            </View>
                        ) :(<View style={Styles.modalFooterContainerStyle}>
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
                                    sendRequest()
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>)}
                    </View>
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
        fontFamily: 'IRANSansMobile_Medium',
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
    descriptionInputStyle: {
        width: pageWidth*0.8,
        height: pageHeight * 0.15,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        textAlignVertical: 'top',
        textAlign:'right',
        paddingHorizontal: 15,
        paddingVertical: 5,
        fontSize: normalize(13),
        fontFamily: getFontsName('IRANSansMobile_Light'),
    },
    labelStyle: {
        fontFamily: getFontsName('IRANSansMobile_Light'),
        fontSize: normalize(14),
    },
});

export default WarehouseHandling;
