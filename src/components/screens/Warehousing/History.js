import React, {useEffect, useState, useRef} from "react";
import {
    TextInput,
    View,
    StyleSheet,
    Dimensions,
    FlatList,
    Text,
    TouchableOpacity,
    ToastAndroid,
    ActivityIndicator
} from "react-native";
import {
    requestsHistory,
    acceptRequestGoods,
    rejectReguestGoods,
    getReadyToSendList,
    sendObjects,
    getInventoryObjects
} from "../../../actions/api";
import {useSelector, useDispatch} from "react-redux";
import Input from "../../common/Input";
import {LOGOUT} from "../../../actions/types";
import {
    SearchIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    PlusIcon,
    MinusIcon,
    CameraIcon,
    UploadFileIcon,
    DeleteIcon
} from "../../../assets/icons/index";
import {normalize, toEnglishDigit, toFaDigit, getFontsName} from "../../utils/utilities";
import DropDownPicker from "react-native-dropdown-picker";
import {ScrollView} from "react-native-gesture-handler";
import ImageViewer from "../../common/ImageViwer";
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Modal from 'react-native-modalbox';

let hamedType = [];
const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;
const History = ({navigation}) => {
    const selector = useSelector(state => state);
    const dispatch = useDispatch();
    const [listLoading, setListLoading] = useState(true);
    const [acceptRejectLoading, setAcceptRejectLoading] = useState(false);
    const [rejectedListByCompany, setRejectedListByCompany] = useState([]);
    const [constRejectedListByCompany, setConstRejectedListByCompany] = useState([]);
    const [rejectedListByMe, setRejetedListByMe] = useState([]);
    const [constRejectedListByMe, setConstRejectedListByMe] = useState([]);
    const [historyCardsList, setHistoryCardsList] = useState([]);
    const [constHistoryCardsList, setConstHistoryCardsList] = useState([]);
    const [screenMode, setScreenMode] = useState("ReadyToSend");
    const [searchText, setSearchText] = useState("");
    const [readyToSendListLoading, setReadyToSendListLoading] = useState(false);
    const [readyToSendList, setReadyToSendList] = useState([]);
    const [constReadyToSendList, setConstReadyToSendList] = useState([]);
    const [availableObjectsList, setAvailableObjectsList] = useState([]);
    const [availableObjectsListForEdit, setAvailableObjectsListForEdit] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [showAddObjectModal, setShowAddObjectModal] = useState(false);
    const [finalSendLoading, setFinalSendLoading] = useState(false);
    const [showFinalSendModal, setShowFinalSendModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [barnameNumber, setBarnameNumber] = useState("");
    const [barnameImage, setBarnameImage] = useState("");
    const [sendDescription, setSendDescription] = useState("");
    const [openObjectDropDown, setOpenObjectDropDown] = useState(false);
    const [openVersionDropDown, setOpenVersionDropDown] = useState(false);
    const [openSerialDropDown, setOpenSerialDropDown] = useState(false);
    const [newSelectedObject, setNewSelectedObject] = useState(null);
    const [newSelectedVersion, setNewSelectedVersion] = useState(null);
    const [newSelectedSerial, setNewSelectedSerial] = useState(null);
    const [availableObjectVersion, setAvailableObjectVersion] = useState([])
    const [availableVersionSerial, setAvailableVersionSerial] = useState([]);
    const [newSelectedCount, setNewSelectedCount] = useState(0);
    const [newTotalCount, setNewTotalCount] = useState(0);
    const [selectedReq, setSelectedReq] = useState(null);

    useEffect(() => {
        if (!!newSelectedObject && !!newSelectedVersion) {
            if (newSelectedObject.hasSerialFormat) {
                let tempSerialList = [];
                    newSelectedVersion.SerialList.map(item => {
                        tempSerialList.push({
                            label: item,
                            value: item
                        });
                    });
                setAvailableVersionSerial(tempSerialList);
            } else {
                setNewTotalCount(newSelectedVersion.Count);
            }
        } else if (!!newSelectedObject) {
            let tempVersionList = [];
            newSelectedObject.Versions.map(item => {
                tempVersionList.push({
                    label: String(item.VersionId) + ' / ' + item.Version_Name,
                    value: item
                });
            });
            setAvailableObjectVersion(tempVersionList);
        }
        // setNewSelectedCount(0);
        // setNewSelectedSerial(null);
    }, [newSelectedVersion, newSelectedObject]);

    const getInitialData = async () => {
        await getReadyToSendRequests()
    }

    useEffect(() => {
        getInitialData();
    }, []);

    const Separator = ({color}) => <View style={[Styles.separator, {borderBottomColor: color}]}/>;

    const refactorAvailableObjects = (list) => {
        let tmp = [];
        let idx = 0;
        list.map(item => {
            let objct = selector.objectsList.filter(obj => obj.value.Id === item.ObjectID);
            let tempVersions = [];
            if (!!objct[0].value.SerialFormat) {
                let currentVersion = item.Versions[0];
                let serialList = [];
                item.Versions.map((I, index) => {
                    if (index === item.Versions.length - 1) {
                        if (I.VersionId === currentVersion.VersionId) {
                            serialList.push(I.Serial)
                            tempVersions.push({
                                ...currentVersion, SerialList: serialList
                            });
                        } else {
                            tempVersions.push({
                                ...currentVersion, SerialList: serialList
                            })
                            tempVersions.push({
                                ...I, SerialList: [I.Serial]
                            });
                        }
                    } else {
                        if (I.VersionId !== currentVersion.VersionId) {
                            tempVersions.push({
                                ...currentVersion, SerialList: serialList
                            });
                            currentVersion = I;
                            serialList = [I.Serial];
                        } else {
                            serialList.push(I.Serial);
                        }
                    }
                });
                tmp.push({
                    ...item,
                    ID: idx,
                    Versions: tempVersions,
                    hasSerialFormat: true
                });
            } else {
                let currentVersion = item.Versions[0];
                let totalCount = 0;
                item.Versions.map((I, index) => {
                    if (index === item.Versions.length - 1) {
                        if (I.VersionId === currentVersion.VersionId) {
                            tempVersions.push({
                                ...currentVersion,
                                Count: totalCount + I.Count
                            });
                        } else {
                            tempVersions.push({
                                ...currentVersion, Count: totalCount
                            });
                            tempVersions.push(I);
                        }
                    } else {
                        if (I.VersionId !== currentVersion.VersionId) {
                            tempVersions.push({
                                ...currentVersion, Count: totalCount
                            });
                            currentVersion = I;
                            totalCount = I.Count;
                        } else {
                            totalCount += I.Count;
                        }
                    }
                });
                tmp.push({
                    ...item,
                    ID: idx,
                    Versions: tempVersions,
                    hasSerialFormat: false
                });
            }
            idx += 1;
        });
        let finalTmp = [];
        tmp.map(item => {
            finalTmp.push({
                label: String(item.ObjectID) + ' / ' + item.Object_Name,
                value: item
            });
        });
        return (finalTmp);
    }

    const getReadyToSendRequests = () => {
        setReadyToSendListLoading(true);
        getInventoryObjects(selector.token).then(data => {
            if (data.errorCode === 0) {
                setAvailableObjectsList(refactorAvailableObjects(data.result));
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
        });
        getReadyToSendList(selector.token).then(data => {
            if (data.errorCode === 0) {
                let tempList = [];
                data.result.map((req, reqIndex) => {
                    let objectList = [];
                    req.Objects.map(obj => {
                        let serialList = [];
                        let versionId = null;
                        let versionList = [];
                        obj.Versions.map((vers, index) => {
                            if (!!vers.Serial) {
                                if (index === obj.Versions.length - 1) {
                                    if (vers.VersionId === versionId) {
                                        serialList.push(vers.Serial);
                                        versionList.push({...vers, SerialList: serialList, Count: serialList.length});
                                    } else {
                                        if (!versionId) {
                                            serialList.push(vers.Serial);
                                            versionList.push({
                                                ...vers,
                                                SerialList: serialList,
                                                Count: serialList.length
                                            });
                                        } else {
                                            versionList.push({
                                                ...obj.Versions[index - 1],
                                                SerialList: serialList,
                                                Count: serialList.length
                                            });
                                            versionList.push({
                                                ...obj.Versions[index],
                                                SerialList: [vers.Serial],
                                                Count: 1
                                            });
                                        }
                                    }
                                } else {
                                    if (vers.VersionId === versionId) {
                                        serialList.push(vers.Serial);
                                    } else {
                                        if (!versionId) {
                                            versionId = vers.VersionId;
                                            serialList.push(vers.Serial);

                                        } else {
                                            versionList.push({
                                                ...obj.Versions[index - 1],
                                                SerialList: serialList,
                                                Count: serialList.length
                                            });
                                            serialList = [];
                                            serialList.push(vers.Serial);
                                            versionId = vers.VersionId;
                                        }
                                    }
                                }
                            }
                        })
                        if (!!obj.Versions[0].Serial) {
                            objectList.push({...obj, Versions: versionList});

                        } else {
                            objectList.push(obj);
                        }
                    });
                    tempList.push({...req, Objects: objectList, isExpanded: false});

                });
                setReadyToSendList(tempList);
                hamedType = tempList;
                setConstReadyToSendList(tempList);
                setReadyToSendListLoading(false);
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                navigation.navigate('SignedOut');
                setReadyToSendListLoading(false);
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setReadyToSendListLoading(false);
            }
        }).then(() => {
            getHistory()
        })
    }

    const getHistory = () => {
        let list1 = []
        let list2 = []
        let list3 = []
        setListLoading(true);
        requestsHistory(selector.token).then(async data => {
            if (data.errorCode === 0) {
                let tempList = [];
                await data.result.map((req, reqIndex) => {
                    let objectList = [];
                    req.Objects.map(obj => {
                        let serialList = [];
                        let versionId = null;
                        let versionList = obj.Versions;
                        obj.Versions.map((vers, index) => {
                            if (!!vers.Serial) {
                                if (vers.VersionId === versionId) {
                                    serialList.push(vers.Serial);
                                } else {
                                    if (!versionId) {
                                        versionId = vers.VersionId;
                                        serialList.push(vers.Serial);
                                        delete vers["Serial"];
                                        delete vers["Count"];
                                        versionList[index] = {
                                            ...vers,
                                            SerialList: serialList,
                                            Count: serialList.length
                                        };
                                    } else {
                                        serialList.push(vers.Serial);
                                        versionList.splice(index, 1);
                                        serialList = [];
                                    }
                                }
                            }
                        })
                        if (!!obj.Versions[0].Serial) {
                            objectList.push({...obj, Versions: versionList})
                        } else {
                            objectList.push(obj);
                        }
                    });
                    tempList.push({...req, Objects: objectList, isExpanded: false});
                });

                await tempList.map(item => {
                    console.log(item.Type, item.State)
                    if (item.Type === 0 && item.State === 110) {
                        list1.push(item);
                    } else if (item.Type === 1 && item.State === 120) {
                        list2.push(item);
                    } else {
                        list3.push(item);
                    }
                });
                setRejectedListByCompany(list1);
                setConstRejectedListByCompany(list1);
                setRejetedListByMe(list2);
                setConstRejectedListByMe(list2);
                setHistoryCardsList(list3);
                setConstHistoryCardsList(list3);
                setListLoading(false);
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                setListLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setListLoading(false);
            }
        }).then(() => {
            console.log(readyToSendList, '0')
            if (list1.length === 0 && list2.length === 0 && hamedType.length === 0) {
                setScreenMode("History");
            } else if (list1.length === 0 && hamedType.length === 0) {
                setScreenMode("MRejected");
            } else if (hamedType.length === 0) {
                setScreenMode("CRejected");
            }
        })
    };

    const getStateName = (code) => {
        switch (code) {
            case 120:
                return "ارسال شده";
            case 125:
                return "تحویل داده شده";
            case 20:
                return "لغو شده";
            case 106:
                return "منتظر تایید";
            case 110:
                return "آماده ارسال";
            default:
                return "نامعلوم";
        }
    };

    const handleSearchRequest = (searchText) => {
        searchText = toEnglishDigit(searchText);
        setListLoading(true);
        if (!!searchText) {
            if (screenMode === "History") {
                let tmpList = constHistoryCardsList.filter(item => item.ID.toString().includes(searchText));
                setHistoryCardsList(tmpList);
            } else if (screenMode === "CRejected") {
                let tmpList = constRejectedListByCompany.filter(item => item.ID.toString().includes(searchText));
                setRejectedListByCompany(tmpList);
            } else if (screenMode === "ReadyToSend") {
                let tmpList = constReadyToSendList.filter(item => item.ID.toString().includes(searchText));
                setReadyToSendList(tmpList);
            } else {
                let tmpList = constRejectedListByMe.filter(item => item.ID.toString().includes(searchText));
                setConstRejectedListByMe(tmpList);
            }
            setListLoading(false);
        } else {
            setReadyToSendList(constReadyToSendList);
            getHistory();
        }
    }

    const acceptRequest = (id) => {
        setAcceptRejectLoading(true);
        acceptRequestGoods(selector.token, id).then(data => {
            if (data.errorCode === 0) {
                setAcceptRejectLoading(false);
                getHistory();
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                setAcceptRejectLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setAcceptRejectLoading(false);
            }
        })
    }

    const rejectRequest = (id) => {
        setAcceptRejectLoading(true);
        rejectReguestGoods(selector.token, id).then(data => {
            if (data.errorCode === 0) {
                setAcceptRejectLoading(false);
                getHistory();
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                setAcceptRejectLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setAcceptRejectLoading(false);
            }
        })
    }

    const handleDeleteItem = () => {
        const {verIndex, reqIndex, objIndex, objId, verId, broken, hasSerial} = deletingItem;
        let tempList = [...readyToSendList];
        if (verIndex !== undefined) {
            let tempReq = {...readyToSendList[reqIndex]};
            let tempObj = {...tempReq.Objects[objIndex]};
            let tempVerList = [...tempObj.Versions];
            let tempAvailable = [...availableObjectsList];
            if (hasSerial) {
                let selectedObjIndex = undefined;
                let selectedVerIndex = undefined;
                tempAvailable.map((item, indx1) => {
                    if (item.value.ObjectID === objId && item.value.Broken === broken) {
                        selectedObjIndex = indx1;
                        item.value.Versions.map((verItem, idx2) => {
                            if (verItem.VersionId === verId) {
                                selectedVerIndex = idx2;
                            }
                        });
                    }
                });
                if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                    tempVerList[verIndex].SerialList.map(serial => {
                        if (!tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].SerialList.includes(serial)) {
                            tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].SerialList.push(serial);
                        }
                    });
                } else if (selectedObjIndex !== undefined) {
                    tempAvailable[selectedObjIndex].value.Versions.push({
                        Count: 1,
                        SerialList: tempVerList[verIndex].value.SerialList,
                        Version_Id: tempVerList[verIndex].value.VersionId,
                        Version_Name: tempVerList[verIndex].value.Version_Name
                    });
                } else {
                    tempAvailable.push({
                        label: String(tempObj.ObjectID) + ' / ' + tempObj.Object_Name,
                        value: {
                            Broken: broken,
                            ObjectID: tempObj.ObjectID,
                            Object_Name: tempObj.Object_Name,
                            Total: 1,
                            Versions: tempObj.Versions,
                            ID: tempAvailable.length + 1
                        }
                    });
                }
                setAvailableObjectsList(tempAvailable);
            } else {
                let selectedObjIndex = undefined;
                let selectedVerIndex = undefined;
                tempAvailable.map((item, indx1) => {
                    if (item.value.ObjectID === objId) {
                        selectedObjIndex = indx1;
                        item.value.Versions.map((verItem, idx2) => {
                            if (verItem.VersionId === verId) {
                                selectedVerIndex = idx2;
                            }
                        })
                    }
                });
                if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                    tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].Count += tempVerList[verIndex].Count;
                } else if (selectedObjIndex !== undefined) {
                    tempAvailable[selectedObjIndex].value.Versions.push({
                        Count: tempVerList[verIndex].Count,
                        Serial: "",
                        Version_Id: tempVerList[verIndex].VersionId,
                        Version_Name: tempVerList[verIndex].Version_Name
                    });
                } else {
                    tempAvailable.push({
                        label: String(tempObj.ObjectID) + ' / ' + tempObj.Object_Name,
                        value: {
                            Broken: broken,
                            ObjectID: tempObj.ObjectID,
                            Object_Name: tempObj.Object_Name,
                            Total: 1,
                            Versions: tempObj.Versions,
                            ID: tempAvailable.length + 1
                        }
                    });
                }
            }
            setAvailableObjectsList(tempAvailable);
            let removingCount = !!tempVerList[verIndex].Serial ? tempVerList[verIndex].SerialList.length : tempVerList[verIndex].Count;
            tempVerList.splice(verIndex, 1);
            if (tempVerList.length > 0) {
                tempObj = {...tempObj, Versions: tempVerList, Total: tempObj.Total - removingCount};
                tempReq.Objects[objIndex] = tempObj;
                tempList[reqIndex] = tempReq;
                setReadyToSendList(tempList);
                setConstReadyToSendList(tempList);
            } else {
                tempReq.Objects.splice(objIndex, 1);
                tempList[reqIndex] = tempReq;
                setReadyToSendList(tempList);
                setConstReadyToSendList(tempList);
            }
        } else {
            let tempReq = {...readyToSendList[reqIndex]};
            let tempObjList = [...tempReq.Objects];
            let tmpObj = tempObjList[objIndex].value;
            let tempAvailable = [...availableObjectsList];
            let selectedObjIndex = undefined;
            if (hasSerial) {
                tempAvailable.map((item, indx1) => {
                    if (item.value.ObjectID === objId && item.value.Broken === broken) {
                        selectedObjIndex = indx1;
                    }
                });
                if (selectedObjIndex !== undefined) {
                    let flag = false;
                    tmpObj.Versions.map(version => {
                        tempAvailable[selectedObjIndex].value.Versions.map((ver, verIdx) => {
                            if (version.VersionId === ver.VersionId) {
                                version.SerialList.map(serial => {
                                    tempAvailable[selectedObjIndex].value.Versions[verIdx].SerialList.push(serial);
                                    flag = true;
                                });
                            }
                        });
                        if (!flag) {
                            tempAvailable[selectedObjIndex].value.Versions.push(version);
                        }
                    })
                    setAvailableObjectsList(tempAvailable);
                } else {
                    tempAvailable.push({
                        label: String(tmpObj.ObjectID) + ' / ' + tmpObj.Object_Name,
                        value: {...tmpObj, ID: tempAvailable.length + 1}
                    });
                    setAvailableObjectsList(tempAvailable);
                }
            } else {
                tempAvailable.map((item, indx1) => {
                    if (item.value.ObjectID === objId && item.value.Broken === broken) {
                        selectedObjIndex = indx1;
                    }
                });
                if (selectedObjIndex !== undefined) {
                    let flag = false;
                    tmpObj.Versions.map(version => {
                        tempAvailable[selectedObjIndex].value.Versions.map((ver, verIdx) => {
                            if (version.VersionId === ver.VersionId) {
                                tempAvailable[selectedObjIndex].value.Versions[verIdx].Count += version.Count;
                                flag = true;
                            }
                        });
                        if (!flag) {
                            availableObjectsList[selectedObjIndex].value.Versions.push(version);
                        }
                    })
                    setAvailableObjectsList(tempAvailable);
                } else {
                    tempAvailable.push({
                        label: String(tmpObj.ObjectID) + ' / ' + tmpObj.Object_Name,
                        value: {...tmpObj, ID: tempAvailable.length + 1}
                    });
                    setAvailableObjectsList(tempAvailable);
                }
            }
            tempObjList.splice(objIndex, 1);
            tempReq = {...tempReq, Objects: tempObjList};
            tempList[reqIndex] = tempReq;
            setReadyToSendList(tempList);
            setConstRejectedListByCompany(tempList);
        }
        setShowDeleteModal(false);
    }

    const constructListInEditting = (item) => {
        const {verIndex, reqIndex, objIndex, objId, verId, broken, hasSerial} = item;
        let tempReq = {...readyToSendList[reqIndex]};
        let tempObj = {...tempReq.Objects[objIndex]};
        let tempVerList = [...tempObj.Versions];
        let tempAvailable = [...availableObjectsList];
        if (hasSerial) {
            let selectedObjIndex = undefined;
            let selectedVerIndex = undefined;

            tempAvailable.map((item, indx1) => {
                if (item.value.ObjectID === objId && item.value.Broken === broken) {
                    selectedObjIndex = indx1;
                    item.value.Versions.map((verItem, idx2) => {
                        if (verItem.VersionId === verId) {
                            selectedVerIndex = idx2;
                        }
                    });
                }
            });
            if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                tempVerList[verIndex].SerialList.map(serial => {
                    if (!tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].SerialList.includes(serial)) {
                        tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].SerialList.push(serial);
                    }
                });
                setNewSelectedObject(tempAvailable[selectedObjIndex].value)
                setNewSelectedSerial(tempVerList[verIndex].SerialList)
                setNewSelectedVersion(tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex])
                let hamed = [];
                tempAvailable[selectedObjIndex].value.Versions.map((v, i) => {
                    hamed.push({
                        label: String(v.VersionId) + ' / ' + v.Version_Name,
                        value: v
                    });
                })
                setAvailableObjectVersion(hamed)
            } else if (selectedObjIndex !== undefined) {
                tempAvailable[selectedObjIndex].value.Versions.push({
                    Count: 1,
                    SerialList: tempVerList[verIndex].SerialList,
                    Version_Id: tempVerList[verIndex].value.VersionId,
                    Version_Name: tempVerList[verIndex].value.Version_Name
                });
                setNewSelectedObject(tempAvailable[selectedObjIndex].value)
                setNewSelectedSerial(tempVerList[verIndex].SerialList)
                setNewSelectedVersion({
                    Count: 1,
                    SerialList: tempVerList[verIndex].SerialList,
                    Version_Id: tempVerList[verIndex].value.VersionId,
                    Version_Name: tempVerList[verIndex].value.Version_Name
                })
                let hamed = [];
                tempAvailable[selectedObjIndex].value.Versions.map((v, i) => {
                    hamed.push({
                        label: String(v.VersionId) + ' / ' + v.Version_Name,
                        value: v
                    });
                })
                setAvailableObjectVersion(hamed)
            } else {
                tempAvailable.push({
                    label: String(tempObj.ObjectID) + ' / ' + tempObj.Object_Name,
                    value: {
                        Broken: broken,
                        ObjectID: tempObj.ObjectID,
                        Object_Name: tempObj.Object_Name,
                        Total: 1,
                        Versions: tempObj.Versions,
                        ID: tempAvailable.length + 1,
                        hasSerialFormat: hasSerial
                    }
                });
                setNewSelectedObject({
                    Broken: broken,
                    ObjectID: tempObj.ObjectID,
                    Object_Name: tempObj.Object_Name,
                    Total: 1,
                    Versions: tempObj.Versions,
                    ID: tempAvailable.length + 1,
                    hasSerialFormat: hasSerial
                })
                setNewSelectedSerial(tempVerList[verIndex].SerialList)
                setNewSelectedVersion(tempVerList[verIndex])
                let tmpAvailableVersions = []
                readyToSendList[reqIndex].Objects[objIndex].Versions.map(item => {
                    tmpAvailableVersions.push({
                        label: String(item.VersionId) + ' / ' + tempObj.Version_Name,
                        value: item
                    })
                });
                setAvailableObjectVersion(tmpAvailableVersions);
            }
            setAvailableObjectsListForEdit(tempAvailable);
        } else {
            let selectedObjIndex = undefined;
            let selectedVerIndex = undefined;
            tempAvailable.map((item, indx1) => {
                if (item.value.ObjectID === objId) {
                    selectedObjIndex = indx1;
                    item.value.Versions.map((verItem, idx2) => {
                        if (verItem.VersionId === verId) {
                            selectedVerIndex = idx2;
                        }
                    })
                }
            });
            if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex].Count += tempVerList[verIndex].Count;
                let hamed = [];
                tempAvailable[selectedObjIndex].value.Versions.map((v, i) => {
                    hamed.push({
                        label: String(v.VersionId) + ' / ' + v.Version_Name,
                        value: v
                    });
                })
                setAvailableObjectVersion(hamed)
                setNewSelectedObject(tempAvailable[selectedObjIndex].value)
                setNewSelectedCount(tempVerList[verIndex].Count)
                setNewSelectedVersion(tempAvailable[selectedObjIndex].value.Versions[selectedVerIndex])
            } else if (selectedObjIndex !== undefined) {
                tempAvailable[selectedObjIndex].value.Versions.push({
                    Count: tempVerList[verIndex].Count,
                    Serial: "",
                    Version_Id: tempVerList[verIndex].VersionId,
                    Version_Name: tempVerList[verIndex].Version_Name
                });
                setNewSelectedObject(tempAvailable[selectedObjIndex].value)
                setNewSelectedCount(tempVerList[verIndex].Count)
                setNewSelectedVersion({
                    Count: tempVerList[verIndex].Count,
                    Serial: "",
                    Version_Id: tempVerList[verIndex].VersionId,
                    Version_Name: tempVerList[verIndex].Version_Name
                })
                let hamed = [];
                tempAvailable[selectedObjIndex].value.Versions.map((v, i) => {
                    hamed.push({
                        label: String(v.VersionId) + ' / ' + v.Version_Name,
                        value: v
                    });
                })
                setAvailableObjectVersion(hamed)
            } else {
                tempAvailable.push({
                    label: String(tempObj.ObjectID) + ' / ' + tempObj.Object_Name,
                    value: {
                        Broken: broken,
                        ObjectID: tempObj.ObjectID,
                        Object_Name: tempObj.Object_Name,
                        Total: 1,
                        Versions: tempObj.Versions,
                        ID: tempAvailable.length + 1,
                        hasSerialFormat: hasSerial
                    }
                });
                setNewSelectedObject({
                    Broken: broken,
                    ObjectID: tempObj.ObjectID,
                    Object_Name: tempObj.Object_Name,
                    Total: 1,
                    Versions: tempObj.Versions,
                    ID: tempAvailable.length + 1,
                    hasSerialFormat: hasSerial
                })
                setNewSelectedSerial(tempVerList[verIndex].Count)
                setNewSelectedVersion(tempVerList[verIndex])
                let tmpAvailableVersions = []
                readyToSendList[reqIndex].Objects[objIndex].Versions.map(item => {
                    tmpAvailableVersions.push({
                        label: String(item.VersionId) + ' / ' + tempObj.Version_Name,
                        value: item
                    })
                });
                setAvailableObjectVersion(tmpAvailableVersions);
            }
            setAvailableObjectsListForEdit(tempAvailable);
        }
    }

    const resetNewObjectValues = () => {
        setNewSelectedSerial(null);
        setNewSelectedObject(null);
        setNewSelectedVersion(null);
        setNewTotalCount(0);
        setNewSelectedCount(0);
        setSelectedReq(null);
        setDeletingItem(null);
    }

    const handleAddItem = () => {
        if (!newSelectedObject) {
            ToastAndroid.showWithGravity(
                "لطفا نوع قطعه را مشخص کنید.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        } else if (!newSelectedVersion) {
            ToastAndroid.showWithGravity(
                "لطفا نسخه قطعه را مشخص کنید.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        } else if (!newSelectedSerial && !newSelectedCount) {
            ToastAndroid.showWithGravity(
                "درخواست شما مجاز نیست.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        } else {
            let tempAvailable = [...availableObjectsList];
            let selectedObjectIndex = undefined;
            let selectedVersionIndex = undefined;
            if (newSelectedObject.hasSerialFormat) {
                let selectedSerialIndexes = [];
                tempAvailable.map((item, index) => {
                    if (item.value.Broken === newSelectedObject.Broken && item.value.ObjectID === newSelectedObject.ObjectID) {
                        selectedObjectIndex = index;
                        item.value.Versions.map((vers, versIndex) => {
                            if (vers.VersionId === newSelectedVersion.VersionId) {
                                selectedVersionIndex = versIndex;
                                vers.SerialList.map((serial, serialIndex) => {
                                    newSelectedSerial.map(serr=>{
                                        if (serial === serr) {
                                            selectedSerialIndexes.push(serialIndex);
                                        }
                                    })
                                })
                            }
                        })
                    }
                });
                selectedSerialIndexes.map(serial_index=>{
                    tempAvailable[selectedObjectIndex].value.Versions[selectedVersionIndex].SerialList.splice(serial_index, 1);
                })
                setAvailableObjectsList(tempAvailable);
                let tempReady = [...readyToSendList];
                let selectedReqIndex = undefined;
                let selectedObjIndexInReady = undefined;
                let selectedVerIndexInReady = undefined;
                tempReady.map((item, itemIndex) => {
                    if (item.ID === selectedReq.ID) {
                        selectedReqIndex = itemIndex;
                        item.Objects.map((object, objIndex) => {
                            if (object.ObjectID === newSelectedObject.ObjectID && object.Broken === newSelectedObject.Broken) {
                                selectedObjIndexInReady = objIndex;
                                object.Versions.map((verss, versIndex) => {
                                    if (verss.VersionId === newSelectedVersion.VersionId) {
                                        selectedVerIndexInReady = versIndex;
                                    }
                                })
                            }
                        })
                    }
                });
                if (selectedVerIndexInReady !== undefined) {
                    newSelectedSerial.map(serial=>{
                        tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions[selectedVerIndexInReady].SerialList.push(serial);
                    })
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Total += newSelectedSerial.length;
                } else if (selectedObjIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions.push({
                        ...newSelectedVersion, SerialList: newSelectedSerial
                    });
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Total += newSelectedSerial.length;
                } else {
                    tempReady[selectedReqIndex].Objects.push({
                        ...newSelectedObject,
                        Total: newSelectedSerial.length,
                        Versions: [{...newSelectedVersion, SerialList: newSelectedSerial}]
                    });
                }
                setReadyToSendList(tempReady);
                setConstReadyToSendList(tempReady);
            } else {
                tempAvailable.map((item, index) => {
                    if (item.value.Broken === newSelectedObject.Broken && item.value.ObjectID === newSelectedObject.ObjectID) {
                        selectedObjectIndex = index;
                        item.value.Versions.map((vers, versIndex) => {
                            if (vers.VersionId === newSelectedVersion.VersionId) {
                                selectedVersionIndex = versIndex;
                            }
                        })
                    }
                });
                let remained = tempAvailable[selectedObjectIndex].value.Versions[selectedVersionIndex].Count - newSelectedCount;
                tempAvailable[selectedObjectIndex].value.Versions[selectedVersionIndex].Count = remained;
                setAvailableObjectsList(tempAvailable);
                let tempReady = [...readyToSendList];
                let selectedReqIndex = undefined;
                let selectedObjIndexInReady = undefined;
                let selectedVerIndexInReady = undefined;
                tempReady.map((item, itemIndex) => {
                    if (item.ID === selectedReq.ID) {
                        selectedReqIndex = itemIndex;
                        item.Objects.map((object, objIndex) => {
                            if (object.ObjectID === newSelectedObject.ObjectID && object.Broken === newSelectedObject.Broken) {
                                selectedObjIndexInReady = objIndex;
                                object.Versions.map((verss, versIndex) => {
                                    if (verss.VersionId === newSelectedVersion.VersionId) {
                                        selectedVerIndexInReady = versIndex;
                                    }
                                })
                            }
                        })
                    }
                });
                if (selectedVerIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions[selectedVerIndexInReady].Count += newSelectedCount;
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Total += newSelectedCount;
                } else if (selectedObjIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions.push({
                        ...newSelectedVersion, Count: newSelectedCount
                    });
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Total += newSelectedCount;
                } else {
                    tempReady[selectedReqIndex].Objects.push({
                        ...newSelectedObject,
                        Total: newSelectedCount,
                        Versions: [{...newSelectedVersion, Count: newSelectedCount}]
                    });
                }
                setReadyToSendList(tempReady);
                setConstReadyToSendList(tempReady);
            }
        }
        setShowAddObjectModal(false);
        resetNewObjectValues();
    }

    const handleFinalSend = () => {
        setFinalSendLoading(true);
        let objectsList = [];
        let reqIndex = 0;
        readyToSendList.map((req, reqidx) => {
            if (req.ID === selectedRequest.ID) {
                reqIndex = reqidx;
            }
        })
        readyToSendList[reqIndex].Objects.map(obj => {
            if (!!obj.Versions[0].Serial) {
                obj.Versions.map(vers => {
                    vers.SerialList.map(serial => {
                        objectsList.push({
                            ObjectID: obj.ObjectID,
                            VersionID: vers.VersionId,
                            Serial: serial,
                            Count: 1,
                            Broken: obj.Broken,
                            ItemId: !!vers.ItemId ? vers.ItemId : null
                        });
                    })
                })
            } else {
                obj.Versions.map(vers => {
                    objectsList.push({
                        ObjectID: obj.ObjectID,
                        VersionID: vers.VersionId,
                        Serial: null,
                        Count: vers.Count,
                        Broken: obj.Broken,
                        ItemId: !!vers.ItemId ? vers.ItemId : null
                    })
                })
            }
        })
        sendObjects(selector.token, objectsList, selectedRequest.ID, sendDescription, barnameNumber, barnameImage).then(data => {
            if (data.errorCode === 0) {
                setFinalSendLoading(false);
                setShowFinalSendModal(false);
                ToastAndroid.showWithGravity(
                    "رخواست شما با موفقیت انجام شد.",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setBarnameImage("");
                setBarnameNumber("");
                setSendDescription("");
                setSelectedRequest(null);
                getReadyToSendRequests();
            } else if (data.errorCode === 3) {
                dispatch({
                    type: LOGOUT,
                });
                setFinalSendLoading(false);
                navigation.navigate('SignedOut');
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setFinalSendLoading(false);
            }
        })
    }

    return (
        <View style={{flex: 1, paddingHorizontal: 5}}>
            <View style={Styles.headerButtonsContainerStyle}>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "History"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        setSearchText("");
                        setScreenMode("History");
                    }}>
                    <Text
                        style={
                            screenMode === "History"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        تاریخچه
                    </Text>
                    <View
                        style={screenMode === "History" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "MRejected"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        setSearchText("");
                        setScreenMode("MRejected");
                    }}>
                    <Text
                        style={
                            screenMode === "MRejected"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        تحویل شد
                    </Text>
                    <View
                        style={screenMode === "MRejected" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "CRejected"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        setSearchText("");
                        setScreenMode("CRejected");
                    }}>
                    <Text
                        style={
                            screenMode === "CRejected"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        بازگشت از شرکت
                    </Text>
                    <View
                        style={screenMode === "CRejected" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    elevation={5}
                    style={
                        screenMode === "ReadyToSend"
                            ? Styles.activeHeaderButtonStyle
                            : Styles.deactiveHeaderButtonStyle
                    }
                    onPress={() => {
                        setSearchText("");
                        setScreenMode("ReadyToSend");
                    }}>
                    <Text
                        style={
                            screenMode === "ReadyToSend"
                                ? Styles.activeHeaderButtonTextStyle
                                : Styles.deactiveHeaderButtonTextStyle
                        }>
                        آماده ارسال
                    </Text>
                    <View
                        style={screenMode === "ReadyToSend" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
                </TouchableOpacity>
            </View>
            <View style={Styles.searchbarContainerStyle}>
                <TextInput
                    style={Styles.textinputStyle}
                    placeholder={"شماره درخواست مورد نظر خود را جستجو کنید..."}
                    onChangeText={(text) => {
                        setSearchText(text);
                        handleSearchRequest(text);
                    }}
                    value={searchText}
                />
                {SearchIcon({
                    color: '#000'
                })}
            </View>
            {(screenMode === "ReadyToSend" && readyToSendListLoading) || (screenMode !== "ReadyToSend" && listLoading) ? (
                <View style={{flex: 1, justifyContent: "center", alignItem: "center"}}>
                    <ActivityIndicator color={"#660000"} size={"large"}/>
                </View>
            ) : (<FlatList style={{flex: 1, paddingHorizontal: 10,}} data={
                screenMode === "ReadyToSend" ? readyToSendList :
                    screenMode === "History" ? historyCardsList :
                        screenMode === "CRejected" ? rejectedListByCompany : rejectedListByMe}
                           keyExtractor={item => item.ID.toString()}
                           renderItem={({item, index}) => screenMode === "ReadyToSend" ? (
                               <View
                                   style={Styles.cardHeaderStyle2}>
                                   <TouchableOpacity style={{
                                       width: "100%",
                                       flexDirection: "row",
                                       alignItems: "center",
                                       justifyContent: "space-around"
                                   }} onPress={() => {
                                       let currentList = [...readyToSendList];
                                       currentList[index] = {...item, isExpanded: !item.isExpanded};
                                       setReadyToSendList(currentList);
                                   }}>
                                       <Text style={[Styles.labelTextStyle, {fontSize: 13}]}>
                                           تاریخ: {toFaDigit(item.Date.split(' ')[1].concat(' ').concat(item.Date.split(' ')[0]))}
                                       </Text>
                                       <Text style={[Styles.labelTextStyle, {
                                           flexShrink: 1,
                                           width: '55%',
                                           textAlign: "right",
                                           fontSize: 13
                                       }]}>
                                           شناسه
                                           : {(toFaDigit(item.ID))}
                                       </Text>
                                   </TouchableOpacity>
                                   {item.isExpanded ? (
                                       <>
                                           <Separator color={"black"}/>
                                           {item.Objects.length > 0 ? item.Objects.map((obj, objIndex) => (
                                               <>
                                                   <View style={{padding: 5, width: "100%"}}>
                                                       <View style={{
                                                           width: "100%",
                                                           flexDirection: "row",
                                                           alignItems: "flex-start",
                                                           justifyContent: "space-between",
                                                           marginBottom: 10,
                                                           backgroundColor: "#E6E6E6",
                                                           padding: 5
                                                       }}>
                                                           <View style={{flexDirection: "row"}}>
                                                               <TouchableOpacity style={{
                                                                   width: pageWidth * 0.06,
                                                                   height: pageWidth * 0.06,
                                                                   borderRadius: pageWidth * 0.03,
                                                                   backgroundColor: "#660000",
                                                                   justifyContent: "center",
                                                                   alignItems: "center",
                                                                   marginRight: 5
                                                               }} onPress={() => {
                                                                   setDeletingItem({
                                                                       reqIndex: index,
                                                                       objIndex: objIndex,
                                                                       reqId: item.ID,
                                                                       objId: obj.ObjectID,
                                                                       broken: obj.Broken,
                                                                       hasSerial: !!obj.Versions[0].Serial
                                                                   });
                                                                   setShowDeleteModal(true);
                                                               }}>
                                                                   {MinusIcon({
                                                                       color: "#fff"
                                                                   })}
                                                               </TouchableOpacity>
                                                               <Text style={Styles.labelTextStyle}>
                                                                   تعداد کل: {obj.Total}
                                                               </Text>
                                                           </View>
                                                           <View style={{
                                                               flexDirection: "row",
                                                               alignItems: "flex-start",
                                                               width: "50%",
                                                               flexShrink: 1,
                                                               justifyContent: 'flex-end'
                                                           }}>
                                                               <Text style={Styles.labelTextStyle}>
                                                                   نام قطعه: {obj.Object_Name}
                                                               </Text>
                                                               <View style={{
                                                                   width: 14,
                                                                   height: 14,
                                                                   borderRadius: 7,
                                                                   backgroundColor: !!obj.Broken ? 'red' : "green",
                                                                   marginHorizontal: 5,
                                                                   marginTop: 5
                                                               }}/>
                                                           </View>
                                                       </View>
                                                       <View
                                                           style={{
                                                               alignItems: 'flex-start',
                                                               justifyContent: 'space-around',
                                                           }}>
                                                           {obj.Versions.map((version, versionIndex) => (
                                                               <View style={{
                                                                   flexDirection: "row",
                                                                   alignItems: "flex-start",
                                                                   justifyContent: "space-between",
                                                                   width: "100%",
                                                                   marginBottom: 10
                                                               }}>
                                                                   <View>
                                                                       {version && !version.SerialList ? (
                                                                           <Text style={Styles.labelTextStyle}>
                                                                               تعداد: {version.Count}
                                                                           </Text>
                                                                       ) : version.SerialList.map((serial, serIndex) => {
                                                                           return (<Text>{serial}</Text>)
                                                                       })}
                                                                   </View>
                                                                   <View style={{
                                                                       flexDirection: "row",
                                                                       justifyContent: "flex-end"
                                                                   }}>
                                                                       <TouchableOpacity
                                                                           style={{width: "60%", marginRight: 10}}
                                                                           onPress={async () => {
                                                                               await setSelectedReq(item);
                                                                               await setDeletingItem({
                                                                                   reqIndex: index,
                                                                                   objIndex: objIndex,
                                                                                   verIndex: versionIndex,
                                                                                   reqId: item.ID,
                                                                                   objId: obj.ObjectID,
                                                                                   verId: version.VersionId,
                                                                                   broken: obj.Broken,
                                                                                   hasSerial: !!obj.Versions[0].Serial
                                                                               });
                                                                               await constructListInEditting(
                                                                                   {
                                                                                       reqIndex: index,
                                                                                       objIndex: objIndex,
                                                                                       verIndex: versionIndex,
                                                                                       reqId: item.ID,
                                                                                       objId: obj.ObjectID,
                                                                                       verId: version.VersionId,
                                                                                       broken: obj.Broken,
                                                                                       hasSerial: !!obj.Versions[0].Serial
                                                                                   }
                                                                               );
                                                                               await setShowAddObjectModal(true);
                                                                           }}>
                                                                           <Text
                                                                               style={[Styles.labelTextStyle, {
                                                                                   width: "100%",
                                                                                   flexShrink: 1
                                                                               }]}>
                                                                               نام
                                                                               نسخه: {version.Version_Name}</Text>
                                                                       </TouchableOpacity>
                                                                       <TouchableOpacity style={{
                                                                           width: pageWidth * 0.06,
                                                                           height: pageWidth * 0.06,
                                                                           borderRadius: pageWidth * 0.03,
                                                                           backgroundColor: "#660000",
                                                                           justifyContent: "center",
                                                                           alignItems: "center",
                                                                           marginRight: 5
                                                                       }} onPress={() => {
                                                                           setDeletingItem({
                                                                               reqIndex: index,
                                                                               objIndex: objIndex,
                                                                               verIndex: versionIndex,
                                                                               reqId: item.ID,
                                                                               objId: obj.ObjectID,
                                                                               verId: version.VersionId,
                                                                               broken: obj.Broken,
                                                                               hasSerial: !!obj.Versions[0].Serial
                                                                           });
                                                                           setShowDeleteModal(true);
                                                                       }}>
                                                                           {MinusIcon({
                                                                               color: "#fff"
                                                                           })}
                                                                       </TouchableOpacity>
                                                                   </View>
                                                               </View>
                                                           ))}
                                                       </View>
                                                   </View>
                                               </>
                                           )) : (
                                               <Text style={{fontFamily: "IRANSansMobile_Light"}}>قطعه ای در این درخواست
                                                   وجود ندارد.</Text>
                                           )}
                                           <>
                                               <Separator color={"black"}/>
                                               <View style={{
                                                   width: "100%",
                                                   height: pageHeight * 0.08,
                                                   justifyContent: "space-between",
                                                   alignItems: "center",
                                                   flexDirection: "row",
                                                   paddingHorizontal: 20
                                               }}>
                                                   <TouchableOpacity style={{
                                                       height: pageHeight * 0.06,
                                                       width: pageHeight * 0.12,
                                                       borderRadius: 8,
                                                       backgroundColor: '#660000',
                                                       justifyContent: "center",
                                                       alignItems: "center"
                                                   }} onPress={() => {
                                                       setSelectedRequest(item);
                                                       setShowFinalSendModal(true);
                                                   }}>
                                                       <Text
                                                           style={{color: "#fff", fontFamily: "IRANSansMobile_Light"}}>
                                                           تایید نهایی
                                                       </Text>
                                                   </TouchableOpacity>
                                                   <TouchableOpacity style={{
                                                       height: pageHeight * 0.06,
                                                       width: pageHeight * 0.12,
                                                       borderRadius: 8,
                                                       backgroundColor: '#660000',
                                                       justifyContent: "center",
                                                       alignItems: "center"
                                                   }} onPress={() => {
                                                       setSelectedReq(item);
                                                       setShowAddObjectModal(true);
                                                   }}>
                                                       <Text
                                                           style={{color: "#fff", fontFamily: "IRANSansMobile_Light"}}>
                                                           قطعه جدید
                                                       </Text>
                                                   </TouchableOpacity>
                                               </View>
                                           </>
                                       </>
                                   ) : null}
                               </View>
                           ) : (
                               <View style={Styles.cardHeaderStyle}>
                                   <TouchableOpacity
                                       style={{
                                           width: "100%",
                                           justifyContent: "center",
                                           alignItems: "center",
                                           flexDirection: "row"
                                       }}
                                       onPress={() => {
                                           if (screenMode === "History") {
                                               let tmp = [...historyCardsList];
                                               tmp[index] = {...item, isExpanded: !item.isExpanded}
                                               setHistoryCardsList(tmp);
                                           } else if (screenMode === "CRejected") {
                                               let tmp = [...rejectedListByCompany];
                                               tmp[index] = {...item, isExpanded: !item.isExpanded}
                                               setRejectedListByCompany(tmp);
                                           } else if (screenMode === "MRejected") {
                                               let tmp = [...rejectedListByMe];
                                               tmp[index] = {...item, isExpanded: !item.isExpanded}
                                               setRejetedListByMe(tmp);
                                           }
                                       }}>
                                       <View style={{width: "85%"}}>
                                           <View style={{
                                               flexDirection: "row",
                                               width: "100%",
                                               justifyContent: "space-between"
                                           }}>
                                               <Text style={Styles.labelTextStyle}>
                                                   وضعیت: {getStateName(item.State)}
                                               </Text>
                                               <Text style={Styles.labelTextStyle}>
                                                   شناسه: {item.ID}
                                               </Text>
                                           </View>
                                           <View style={{
                                               width: "100%",
                                               flexDirection: "row",
                                               justifyContent: "flex-end",
                                               alignItems: "center"
                                           }}>
                                               <Text style={Styles.labelTextStyle}>
                                                   تاریخ: {toFaDigit(item.Date.split(' ')[1].concat(' ').concat(item.Date.split(' ')[0]))}
                                               </Text>
                                           </View>
                                       </View>
                                       <View style={{
                                           width: "15%",
                                           justifyContent: "center",
                                           alignItems: "center",
                                           marginLeft: 8
                                       }}>
                                           {item.Type === 1 ? ArrowDownIcon({}) : ArrowUpIcon({})}
                                       </View>
                                   </TouchableOpacity>
                                   {item.isExpanded ? (
                                       <>
                                           <Separator color={"black"}/>
                                           {item.Objects.length > 0 ? item.Objects.map((obj, objIndex) => (
                                               <>
                                                   <View style={{padding: 5, width: "100%"}}>
                                                       <View style={{
                                                           width: "100%",
                                                           flexDirection: "row",
                                                           alignItems: "flex-start",
                                                           justifyContent: "space-between",
                                                           marginBottom: 10,
                                                           backgroundColor: "#E6E6E6",
                                                           padding: 5
                                                       }}>
                                                           <Text style={Styles.labelTextStyle}>
                                                               تعداد کل: {obj.Total}
                                                           </Text>
                                                           <View style={{
                                                               flexDirection: "row",
                                                               alignItems: "flex-start",
                                                               width: "70%",
                                                               flexShrink: 1,
                                                               justifyContent: 'flex-end'
                                                           }}>
                                                               <Text style={Styles.labelTextStyle}>
                                                                   نام قطعه: {obj.Object_Name}
                                                               </Text>
                                                               <View style={{
                                                                   width: 14,
                                                                   height: 14,
                                                                   borderRadius: 7,
                                                                   backgroundColor: !!obj.Broken ? 'red' : "green",
                                                                   marginHorizontal: 5,
                                                                   marginTop: 5
                                                               }}/>
                                                           </View>
                                                       </View>
                                                       <View
                                                           style={{
                                                               alignItems: 'flex-start',
                                                               justifyContent: 'space-around',
                                                           }}>
                                                           {obj.Versions.map((version, versionIndex) => !version.Serial && (
                                                               <View style={{
                                                                   flexDirection: "row",
                                                                   alignItems: "flex-start",
                                                                   justifyContent: "space-between",
                                                                   width: "100%",
                                                                   marginBottom: 10
                                                               }}>
                                                                   <View>
                                                                       {!version.SerialList ? (
                                                                           <Text style={Styles.labelTextStyle}>
                                                                               تعداد: {version.Count}
                                                                           </Text>
                                                                       ) : version.SerialList.map((serial) => (
                                                                           <Text>
                                                                               {serial}
                                                                           </Text>
                                                                       ))}
                                                                   </View>
                                                                   <Text
                                                                       style={[Styles.labelTextStyle, {marginRight: pageWidth * 0.08}]}>نام
                                                                       نسخه: {version.Version_Name}</Text>
                                                               </View>
                                                           ))}
                                                       </View>
                                                   </View>
                                               </>
                                           )) : (
                                               <Text style={{fontFamily: "IRANSansMobile_Light"}}>قطعه ای در این درخواست
                                                   وجود ندارد.</Text>
                                           )}
                                           {item.Type === 1 && item.State === 120 && (
                                               <>
                                                   <Separator color={"black"}/>
                                                   <View style={{
                                                       flexDirection: "row",
                                                       justifyContent: "space-around",
                                                       alignItems: "center",
                                                       width: "100%",
                                                       height: 35
                                                   }}>
                                                       {acceptRejectLoading ? (
                                                           <ActivityIndicator size={"small"} color={"#660000"}/>
                                                       ) : (<>
                                                           <TouchableOpacity style={Styles.acceptRejectButtonsStyle}
                                                                             onPress={() => rejectRequest(item.ID)}>
                                                               <Text
                                                                   style={Styles.acceptRejectButtonsTextStyle}>مغایرت</Text>
                                                           </TouchableOpacity>
                                                           <TouchableOpacity style={Styles.acceptRejectButtonsStyle}
                                                                             onPress={() => acceptRequest(item.ID)}>
                                                               <Text
                                                                   style={Styles.acceptRejectButtonsTextStyle}>تایید</Text>
                                                           </TouchableOpacity>
                                                       </>)}
                                                   </View>
                                               </>)}
                                       </>
                                   ) : null}
                               </View>
                           )}
                           ListEmptyComponent={() => (
                               <View style={{
                                   height: pageHeight * 0.4,
                                   flex: 1,
                                   justifyContent: "center",
                                   alignItems: "center"
                               }}>
                                   <Text style={{color: "#000", fontFamily: "IRANSansMobile_Light"}}>
                                       موردی یافت نشد.
                                   </Text>
                               </View>
                           )}/>)}
            {showDeleteModal && (
                <View style={Styles.modalBackgroundStyle}>
                    <View style={{
                        height: pageHeight * 0.35,
                        width: pageWidth * 0.8,
                        justifyContent: "space-around",
                        alignItems: "center",
                        backgroundColor: "#fff",
                        position: "absolute",
                        top: pageHeight * 0.2,
                        borderRadius: 10,
                        paddingVertical: "10%"
                    }}>
                        <Text style={{fontFamily: "IRANSansMobile_Medium"}}>آیا از درخواست حذف خود اطمینان دارید؟</Text>
                        <View style={Styles.modalFooterContainerStyle}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeletingItem(null);
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={handleDeleteItem}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>)}
            <Modal
                style={Styles.modal}
                isOpen={showAddObjectModal}
                swipeToClose={() => {
                    resetNewObjectValues();
                    setShowAddObjectModal(false);
                }}
                onClosed={() => {
                    resetNewObjectValues();
                    setShowAddObjectModal(false);
                }}
                onOpened={() => setShowAddObjectModal(true)}
                onClosingState={() => {
                }}>
                <View style={{marginVertical: 15, width: "90%"}}>
                    <DropDownPicker
                        mode="BADGE"
                        renderBadgeItem={(props) => {
                            return (
                                <Text>
                                    {newSelectedObject.Object_Name}
                                </Text>)
                        }}
                        dropDownDirection="BOTTOM"
                        dropDownMaxHeight={200}
                        dropDownStyle={{
                            height: 200,
                        }}
                        dropDownContainerStyle={{
                            zIndex: 9999,
                            elevation: 5
                        }}
                        style={{
                            borderWidth: 2,
                            borderColor: '#000',
                            borderRadius: 10,
                            backgroundColor: '#fff',
                            elevation: 5,
                            zIndex: 9999
                        }}
                        showATickIcon={false}
                        listMode="FLATLIST"
                        placeholder="قطعه مورد نظر خود را انتخاب کنید."
                        placeholderStyle={{
                            color: "grey",
                            textAlign: "right",
                            fontFamily: 'IRANSansMobile_Light'
                        }}
                        renderListItem={(props) => (
                            <TouchableOpacity style={{
                                height: 40, backgroundColor: !!props.value.Broken ? "#FF9999" : "#90DA9F",
                                justifyContent: "center",
                                paddingHorizontal: 7
                            }} onPress={() => {
                                setOpenObjectDropDown(false);
                                setNewSelectedObject(props.value);
                                setNewSelectedVersion(null);
                                setNewSelectedCount(0);
                                setNewTotalCount(0);
                            }}>
                                <Text style={{fontFamily: 'IRANSansMobile_Light'}}>
                                    {props.item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        open={openObjectDropDown}
                        value={newSelectedObject}
                        items={!!deletingItem ? availableObjectsListForEdit : availableObjectsList}
                        setOpen={() => {
                            setOpenObjectDropDown(!openObjectDropDown);
                            setOpenVersionDropDown(false);
                            setOpenSerialDropDown(false);
                        }}
                        setValue={setNewSelectedObject}
                        setItems={setAvailableObjectsList}
                        itemSeparator={true}
                        searchable={true}
                        searchPlaceholder="جستجو کنید..."
                        searchContainerStyle={{
                            height: 40,
                            padding: 0
                        }}
                        searchTextInputStyle={{
                            borderWidth: 0
                        }}
                        ListEmptyComponent={() => (
                            <View style={{
                                height: 40,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Text style={{
                                    fontFamily: 'IRANSansMobile_Light'
                                }}>
                                    {"موردی یافت نشد."}
                                </Text>
                            </View>
                        )}
                    />
                </View>
                <View style={{marginVertical: 15, width: "90%"}}>
                    <DropDownPicker
                        dropDownDirection="BOTTOM"
                        dropDownMaxHeight={200}
                        listItemLabelStyle={{fontFamily: "IRANSansMobile_Light"}}
                        dropDownStyle={{
                            height: 200,
                        }}
                        dropDownContainerStyle={{
                            zIndex: 9999,
                            elevation: 5
                        }}
                        style={{
                            borderWidth: 2,
                            borderColor: '#000',
                            borderRadius: 10,
                            backgroundColor: '#fff',
                        }}
                        showATickIcon={false}
                        listMode="FLATLIST"
                        placeholder="نسخه مورد نظر خود را انتخاب کنید."
                        placeholderStyle={{
                            color: "grey",
                            textAlign: "right",
                            fontFamily: 'IRANSansMobile_Light'
                        }}
                        open={openVersionDropDown}
                        value={newSelectedVersion}
                        items={availableObjectVersion}
                        setOpen={() => {
                            setOpenVersionDropDown(!openVersionDropDown);
                            setOpenObjectDropDown(false);
                            setOpenSerialDropDown(false);
                        }}
                        renderListItem={(props) => (
                            <TouchableOpacity style={{
                                height: 40,
                                justifyContent: "center",
                                paddingHorizontal: 7
                            }} onPress={() => {
                                setOpenVersionDropDown(false);
                                setNewSelectedVersion(props.value);
                                setNewSelectedSerial(null);
                                setNewSelectedCount(0);
                                setNewTotalCount(props.value.Count);
                            }}>
                                <Text style={{fontFamily: 'IRANSansMobile_Light'}}>
                                    {props.item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                        setValue={setNewSelectedVersion}
                        setItems={setAvailableObjectVersion}
                        itemSeparator={true}
                        searchable={true}
                        searchPlaceholder="جستجو کنید..."
                        searchContainerStyle={{
                            height: 40,
                            padding: 0
                        }}
                        searchTextInputStyle={{
                            borderWidth: 0
                        }}
                        ListEmptyComponent={() => (
                            <View style={{
                                height: 40,
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Text style={{
                                    fontFamily: 'IRANSansMobile_Light'
                                }}>
                                    {"موردی یافت نشد."}
                                </Text>
                            </View>
                        )}
                    />
                </View>
                {!!newSelectedObject && !!newSelectedObject.hasSerialFormat ? (
                    <View style={{marginVertical: 15, width: "90%"}}>
                        <DropDownPicker
                            badgeTextStyle={{
                                fontFamily: "IRANSansMobile_Light"
                            }}
                            badgeSeparatorStyle={{
                                width: 2,
                                marginHorizontal: 5,
                                backgroundColor: "#000",
                                height: 5,
                                marginTop: 17
                            }}
                            showBadgeDot={true}
                            mode="BADGE"
                            renderBadgeItem={(props) => {
                                return (
                                    <Text>
                                        {props.value}
                                    </Text>)
                            }}
                            multiple={true}
                            dropDownDirection="BOTTOM"
                            dropDownMaxHeight={200}
                            dropDownStyle={{
                                height: 200
                            }}
                            dropDownContainerStyle={{
                                zIndex: 9999,
                                elevation: 5
                            }}
                            style={{
                                borderWidth: 2,
                                borderColor: '#000',
                                borderRadius: 10,
                                backgroundColor: '#fff',
                            }}
                            showATickIcon={false}
                            listMode="FLATLIST"
                            placeholder="سریال مورد نظر خود را انتخاب کنید."
                            placeholderStyle={{
                                color: "grey",
                                textAlign: "right",
                                fontFamily: 'IRANSansMobile_Light'
                            }}
                            open={openSerialDropDown}
                            value={newSelectedSerial}
                            items={availableVersionSerial}
                            setOpen={() => {
                                setOpenSerialDropDown(!openSerialDropDown)
                                setOpenObjectDropDown(false);
                                setOpenVersionDropDown(false);
                            }}
                            setValue={setNewSelectedSerial}
                            setItems={setAvailableVersionSerial}
                            itemSeparator={true}
                            searchable={true}
                            searchPlaceholder="جستجو کنید..."
                            searchContainerStyle={{
                                height: 40,
                                padding: 0
                            }}
                            searchTextInputStyle={{
                                borderWidth: 0
                            }}
                            ListEmptyComponent={() => (
                                <View style={{
                                    height: 40,
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}>
                                    <Text style={{
                                        fontFamily: 'IRANSansMobile_Light'
                                    }}>
                                        {"موردی یافت نشد."}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                ) : !!newSelectedObject ? (
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                          onPress={() => {
                                              if (newSelectedCount < newTotalCount) {
                                                  let count = newSelectedCount + 1;
                                                  setNewSelectedCount(count);
                                              }
                                          }}>
                            {PlusIcon({
                                color: "#fff"
                            })}
                        </TouchableOpacity>
                        <Text style={{
                            textAlign: "center",
                            fontFamily: "IRANSansMobile_Light"
                        }}>
                            از {!!newTotalCount ? newTotalCount : 0}
                        </Text>
                        <Text style={{marginHorizontal: 5, fontFamily: "IRANSansMobile_Light"}}>
                            {!!newSelectedCount ? newSelectedCount : 0}
                        </Text>
                        <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                          onPress={() => {
                                              if (newSelectedCount > 0) {
                                                  let count = newSelectedCount - 1;
                                                  setNewSelectedCount(count);
                                              }
                                          }}>
                            {MinusIcon({
                                color: "#fff"
                            })}
                        </TouchableOpacity>
                        <Text style={{
                            textAlign: "center",
                            fontFamily: "IRANSansMobile_Light"
                        }}>
                            تعداد :
                        </Text>
                    </View>) : null}
                <View style={[Styles.modalFooterContainerStyle, {marginTop: 15}]}>
                    <TouchableOpacity style={Styles.modalButtonStyle} onPress={() => {
                        resetNewObjectValues();
                        setShowAddObjectModal(false);
                    }}>
                        <Text style={Styles.modalButtonTextStyle}>
                            انصراف
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={Styles.modalButtonStyle} onPress={() => {
                        if (!!deletingItem) {
                            handleDeleteItem()
                            handleAddItem()
                        } else {
                            handleAddItem()
                        }
                    }}>
                        <Text style={Styles.modalButtonTextStyle}>
                            تایید
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal
                style={Styles.modal}
                isOpen={showFinalSendModal}
                swipeToClose={() => {
                    setBarnameNumber("");
                    setBarnameImage("");
                    setSendDescription("");
                    setShowFinalSendModal(false)
                }}
                onClosed={() => {
                    setBarnameNumber("");
                    setBarnameImage("");
                    setSendDescription("");
                    setShowFinalSendModal(false)
                }}
                onOpened={() => setShowFinalSendModal(true)}
                onClosingState={() => {
                }}>
                <ScrollView style={Styles.modalBodyContainerStyle2}>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center', width: '100%'
                    }}>
                        <Input label={"شماره بارنامه"} keyboardType={"numeric"}
                               onChangeText={text => setBarnameNumber(text)} value={barnameNumber}/>
                        <View
                            style={{
                                width: pageWidth * 0.8,
                                marginBottom: 10,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                            }}>
                            <Text style={Styles.labelStyle}>توضیحات:</Text>
                        </View>
                        <TextInput
                            style={Styles.descriptionInputStyle}
                            onChangeText={text => {
                                setSendDescription(text)
                            }}
                            value={sendDescription}
                            multiline
                        />
                        {!barnameImage &&
                        <Text style={{fontFamily: "IRANSansMobile_Light", marginTop: 5}}>لطفا عکس بارنامه را بارگذاری
                            کنید.</Text>}
                        <View style={Styles.getImageContainerViewStyle}>
                            {CameraIcon({
                                style: {marginHorizontal: 10},
                                color: "#000",
                                onPress: () => {
                                    launchCamera(
                                        {
                                            mediaType: 'photo',
                                            includeBase64: true,
                                            quality: 0.5
                                        },
                                        (response) => {
                                            setBarnameImage(response.assets[0].base64);
                                        },
                                    )
                                }
                            })}
                            {UploadFileIcon({
                                style: {marginHorizontal: 10},
                                color: '#000',
                                onPress: () => {
                                    launchImageLibrary(
                                        {
                                            mediaType: 'photo',
                                            includeBase64: true,
                                            quality: 0.5
                                        },
                                        (response) => {
                                            setBarnameImage(response.base64);
                                        },
                                    )
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
                        {finalSendLoading ? (
                            <View style={Styles.modalFooterContainerStyle}>
                                <ActivityIndicator size={"small"} color={"#660000"}/>
                            </View>
                        ) : (<View style={Styles.modalFooterContainerStyle}>
                            <TouchableOpacity
                                style={[Styles.modalButtonStyle, {
                                    elevation: !!openVersionDropDown || !!openObjectDropDown ? 0 : 5
                                }]}
                                onPress={() => {
                                    setBarnameNumber("");
                                    setBarnameImage("");
                                    setSendDescription("");
                                    setShowFinalSendModal(false)
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[Styles.modalButtonStyle, {
                                    elevation: !!openVersionDropDown || !!openObjectDropDown ? 0 : 5
                                }]}
                                onPress={() => {
                                    handleFinalSend()
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>)}
                    </View>
                </ScrollView>

            </Modal>
        </View>
    );
}

const Styles = StyleSheet.create({
    searchbarContainerStyle: {
        marginTop: 10,
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
    cardHeaderStyle: {
        width: pageWidth * 0.9,
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        alignSelf: 'center',
        backgroundColor: "white"
    },
    labelTextStyle: {
        fontSize: 13,
        fontFamily: "IRANSansMobile_Medium"
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: "#000",
        borderBottomWidth: 1,
        width: '100%',
    },
    acceptRejectButtonsStyle: {
        width: "27%",
        height: "90%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#660000",
        borderRadius: 10
    },
    acceptRejectButtonsTextStyle: {
        color: "#fff",
        fontFamily: "IRANSansMobile_Medium"
    },
    headerButtonsContainerStyle: {
        flexDirection: 'row',
        height: pageHeight * 0.08,
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
    },
    activeHeaderButtonStyle: {
        width: '18%',
        flexShrink: 1,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    deactiveHeaderButtonStyle: {
        width: '18%',
        flexShrink: 1,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    activeHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(12),
        color: '#9C0000',
        textAlign: "center",
    },
    deactiveHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(12),
        color: 'gray',
        textAlign: "center",
    },
    activeRadioButtonStyle: {
        width: pageWidth * 0.05,
        height: pageWidth * 0.05,
        borderRadius: pageWidth * 0.025,
        borderColor: "#7C0000",
        borderWidth: 1.5,
        marginLeft: 5,
        backgroundColor: "#7C0000"
    },
    deactiveRadioButtonStyle: {
        width: pageWidth * 0.05,
        height: pageWidth * 0.05,
        borderRadius: pageWidth * 0.025,
        borderColor: "gray",
        borderWidth: 1.5,
        marginLeft: 5,
    },
    cardHeaderStyle2: {
        width: pageWidth * 0.9,
        padding: 10,
        marginVertical: 4,
        marginHorizontal: 3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        alignSelf: 'center',
        backgroundColor: "#fff"
    },
    modalBackgroundStyle: {
        zIndex: 9999,
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
        marginHorizontal: 20
    },
    modalFooterContainerStyle: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
        justifyContent: "space-around",
        width: "60%"
    },
    listItemsContainerStyle: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 5,
        // justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',

    },
    objectlistItemsContainerStyle: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 5,
        // justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
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
    descriptionInputStyle: {
        width: pageWidth * 0.8,
        height: pageHeight * 0.15,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        textAlignVertical: 'top',
        textAlign: 'right',
        paddingHorizontal: 15,
        paddingVertical: 5,
        fontSize: normalize(13),
        fontFamily: getFontsName('IRANSansMobile_Light'),
    },
    getImageContainerViewStyle: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: "center",
        marginVertical: 20
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: pageHeight * 0.6,
        marginTop: pageHeight * 0.085,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15
    },
})

export default History;
