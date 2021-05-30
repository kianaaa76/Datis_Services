import React, { useEffect, useState, useRef } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import Input from "../../common/Input";
import { LOGOUT } from "../../../actions/types";
import { SearchIcon, ArrowDownIcon, ArrowUpIcon, PlusIcon, MinusIcon, CameraIcon, UploadFileIcon, DeleteIcon } from "../../../assets/icons/index";
import { normalize, toEnglishDigit, toFaDigit, getFontsName } from "../../utils/utilities";
import DropdownPicker from "../../common/DropdownPicker";
import { ScrollView } from "react-native-gesture-handler";
import ImageViewer from "../../common/ImageViwer";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
let hamedType = [];
const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;
const History = ({ navigation }) => {
    const selector = useSelector(state => state);
    const dispatch = useDispatch();
    const [historyList, setHistoryList] = useState([]);
    const [constHistoryList, setConstHistoryList] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [acceptRejectLoading, setAcceptRejectLoading] = useState(false);
    const [openAccordionstate, setOpenAccordionState] = useState(null);
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [showAddObjectModal, setShowAddObjectModal] = useState(false);
    const [newObject, setNewObject] = useState(null);
    const [finalSendLoading, setFinalSendLoading] = useState(false);
    const [showFinalSendModal, setShowFinalSendModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [barnameNumber, setBarnameNumber] = useState("");
    const [barnameImage, setBarnameImage] = useState("");
    const [sendDescription, setSendDescription] = useState("");
    const versDropRef = useRef();
    const serDropRef = useRef();

    const getInitialData = async ()=>{
        await getReadyToSendRequests()
        // await getHistory();
    }

    useEffect(() => {
        getInitialData();
    }, []);

    const Separator = ({ color }) => <View style={[Styles.separator, { borderBottomColor: color }]} />;

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
                                ...currentVersion, serialList: serialList
                            });
                        } else {
                            tempVersions.push({
                                ...currentVersion, serialList: serialList
                            })
                            tempVersions.push({
                                ...I, serialList: [I.Serial]
                            });
                        }
                    } else {
                        if (I.VersionId !== currentVersion.VersionId) {
                            tempVersions.push({
                                ...currentVersion, serialList: serialList
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
            }
            else {
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
        return (tmp);
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
                                        versionList.push({ ...vers, SerialList: serialList, Count: serialList.length });
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
                            objectList.push({ ...obj, Versions: versionList });

                        } else {
                            objectList.push(obj);
                        }
                    });
                    tempList.push({ ...req, Objects: objectList, isExpanded: false });

                });
                setReadyToSendList(tempList);
                hamedType = tempList;
                setConstReadyToSendList(tempList);
                setReadyToSendListLoading(false);
                console.log("kianaaaa1111");
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
        }).then(()=>{
            getHistory()
        })
    }

    const getHistory = () => {
        let list1 = []
        let list2 = []
        let list3 = []
        console.log("kianaaaa22222")
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
                            objectList.push({ ...obj, Versions: versionList })
                        } else {
                            objectList.push(obj);
                        }
                    });
                    tempList.push({ ...req, Objects: objectList, isExpanded: false });
                });

             await  tempList.map(item => {
                 console.log(item.Type, item.State)
                    if (item.Type === 0 && item.State === 110) {
                        console.log('sheytooon')
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
                setHistoryList(tempList);
                setConstHistoryList(tempList);
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
        }).then(()=>{
            console.log(readyToSendList, '0')
            if (list1.length === 0 && list2.length === 0 && hamedType.length === 0) {
                console.log("1111111")
                setScreenMode("History");
            } else if (list1.length === 0 && hamedType.length === 0) {
                console.log("222222")
                setScreenMode("MRejected");
            } else if (hamedType.length === 0){
                console.log("333333")
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
        const { verIndex, reqIndex, objIndex, objId, reqId, verId, broken, hasSerial } = deletingItem;
        let tempList = [...readyToSendList];
        if (verIndex !== undefined) {
            let tempReq = { ...readyToSendList[reqIndex] };
            let tempObj = { ...tempReq.Objects[objIndex] };
            let tempVerList = [...tempObj.Versions];
            let tempAvailable = [...availableObjectsList];
            if (hasSerial) {
                let selectedObjIndex = undefined;
                let selectedVerIndex = undefined;
                tempAvailable.map((item, indx1) => {
                    if (item.ObjectID === objId && item.Broken === broken) {
                        selectedObjIndex = indx1;
                        item.Versions.map((verItem, idx2) => {
                            if (verItem.VersionId === verId) {
                                selectedVerIndex = idx2;
                            }
                        });
                    }
                });
                if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                    tempVerList[verIndex].SerialList.map(serial => {
                        tempAvailable[selectedObjIndex].Versions[selectedVerIndex].serialList.push(serial);
                    });
                } else if (selectedObjIndex !== undefined) {
                    tempAvailable[selectedObjIndex].Versions.push({
                        Count: 1,
                        serialList: tempVerList[verIndex].serialList,
                        Version_Id: tempVerList[verIndex].VersionId,
                        Version_Name: tempVerList[verIndex].Version_Name
                    });
                } else {
                    tempAvailable.push({
                        Broken: broken,
                        ObjectID: tempObj.ObjectID,
                        Object_Name: tempObj.Object_Name,
                        Total: 1,
                        Versions: tempObj.Versions
                    });
                }
                setAvailableObjectsList(tempAvailable);
            }
            else {
                let selectedObjIndex = undefined;
                let selectedVerIndex = undefined;
                tempAvailable.map((item, indx1) => {
                    if (item.ObjectID === objId) {
                        selectedObjIndex = indx1;
                        item.Versions.map((verItem, idx2) => {
                            if (verItem.VersionId === verId) {
                                selectedVerIndex = idx2;
                            }
                        })
                    }
                });
                if (selectedObjIndex !== undefined && selectedVerIndex !== undefined) {
                    tempAvailable[selectedObjIndex].Versions[selectedVerIndex].Count += tempVerList[verIndex].Count;
                } else if (selectedObjIndex !== undefined) {
                    tempAvailable[selectedObjIndex].Versions.push({
                        Count: tempVerList[verIndex].Count,
                        Serial: "",
                        Version_Id: tempVerList[verIndex].VersionId,
                        Version_Name: tempVerList[verIndex].Version_Name
                    });
                } else {
                    tempAvailable.push({
                        Broken: broken,
                        ObjectID: tempObj.ObjectID,
                        Object_Name: tempObj.Object_Name,
                        Total: 1,
                        Versions: tempObj.Versions
                    });
                }
            }
            setAvailableObjectsList(tempAvailable);
            let removingCount = !!tempVerList[verIndex].Serial ? tempVerList[verIndex].SerialList.length : tempVerList[verIndex].Count;
            tempVerList.splice(verIndex, 1);
            if (tempVerList.length > 0) {
                tempObj = { ...tempObj, Versions: tempVerList,  Total: tempObj.Total - removingCount};
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
        }
        else {
            let tempReq = { ...readyToSendList[reqIndex] };
            let tempObjList = [...tempReq.Objects];
            let tmpObj = tempObjList[objIndex];
            let tempAvailable = [...availableObjectsList];
            let selectedObjIndex = undefined;
            if (hasSerial) {
                tempAvailable.map((item, indx1) => {
                    if (item.ObjectID === objId && item.Broken === broken) {
                        selectedObjIndex = indx1;
                    }
                });
                if (selectedObjIndex !== undefined) {
                    let flag = false;
                    tmpObj.Versions.map(version => {
                        tempAvailable[selectedObjIndex].Versions.map((ver, verIdx) => {
                            if (version.VersionId === ver.VersionId) {
                                version.SerialList.map(serial => {
                                    tempAvailable[selectedObjIndex].Versions[verIdx].serialList.push(serial);
                                    flag = true;
                                });
                            }
                        });
                        if (!flag) {
                            tempAvailable[selectedObjIndex].Versions.push(version);
                        }
                    })
                    setAvailableObjectsList(tempAvailable);
                } else {
                    tempAvailable.push(tmpObj);
                    setAvailableObjectsList(tempAvailable);
                }
            }
            else {
                tempAvailable.map((item, indx1) => {
                    if (item.ObjectID === objId && item.Broken === broken) {
                        selectedObjIndex = indx1;
                    }
                });
                if (selectedObjIndex !== undefined) {
                    let flag = false;
                    tmpObj.Versions.map(version => {
                        tempAvailable[selectedObjIndex].Versions.map((ver, verIdx) => {
                            if (version.VersionId === ver.VersionId) {
                                tempAvailable[selectedObjIndex].Versions[verIdx].Count += version.Count;
                                flag = true;
                            }
                        });
                        if (!flag) {
                            availableObjectsList[selectedObjIndex].Versions.push(version);
                        }
                    })
                    setAvailableObjectsList(tempAvailable);
                } else {
                    tempAvailable.push(tmpObj);
                    setAvailableObjectsList(tempAvailable);
                }
            }
            tempObjList.splice(objIndex, 1);
            tempReq = { ...tempReq, Objects: tempObjList };
            tempList[reqIndex] = tempReq;
            setReadyToSendList(tempList);
            setConstRejectedListByCompany(tempList);
        }
        setShowDeleteModal(false);
    }

    const handleAddItem = () => {
        const {
            obj,
            hasSerial,
            availableVersions,
            availableSerials,
            totalCount,
            selectedCount,
            version,
            ser,
            broken,
            req
        } = newObject;
        if (ser === undefined && !selectedCount) {
            ToastAndroid.showWithGravity(
                "درخواست شما مجاز نیست.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
        } else {
            let tempAvailable = [...availableObjectsList];
            let selectedObjectIndex = undefined;
            let selectedVersionIndex = undefined;
            if (hasSerial) {
                let selectedSerialIndex = undefined;
                tempAvailable.map((item, index) => {
                    if (item.Broken === broken && item.ObjectID === obj.ObjectID) {
                        selectedObjectIndex = index;
                        item.Versions.map((vers, versIndex) => {
                            if (vers.VersionId === version.VersionId) {
                                selectedVersionIndex = versIndex;
                                vers.serialList.map((serial, serialIndex) => {
                                    if (serial === ser) {
                                        selectedSerialIndex = serialIndex;
                                    }
                                })
                            }
                        })
                    }
                });
                tempAvailable[selectedObjectIndex].Versions[selectedVersionIndex].serialList.splice(selectedSerialIndex, 1);
                setAvailableObjectsList(tempAvailable);
                let tempReady = [...readyToSendList];
                let selectedReqIndex = undefined;
                let selectedObjIndexInReady = undefined;
                let selectedVerIndexInReady = undefined;
                tempReady.map((item, itemIndex) => {
                    if (item.ID === req.ID) {
                        selectedReqIndex = itemIndex;
                        item.Objects.map((object, objIndex) => {
                            if (object.ObjectID === obj.ObjectID && object.Broken === broken) {
                                selectedObjIndexInReady = objIndex;
                                object.Versions.map((verss, versIndex) => {
                                    if (verss.VersionId === version.VersionId) {
                                        selectedVerIndexInReady = versIndex;
                                    }
                                })
                            }
                        })
                    }
                });
                if (selectedVerIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions[selectedVerIndexInReady].SerialList.push(ser);
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Total += 1;
                } else if (selectedObjIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions.push({
                        ...version, SerialList: [ser]
                    });
                } else {
                    tempReady[selectedReqIndex].Objects.push({
                        ...obj, Total:1, Versions: [{ ...version, SerialList: [ser] }]
                    });
                }
                setReadyToSendList(tempReady);
                setConstReadyToSendList(tempReady);
            }
            else {
                tempAvailable.map((item, index) => {
                    if (item.Broken === broken && item.ObjectID === obj.ObjectID) {
                        selectedObjectIndex = index;
                        item.Versions.map((vers, versIndex) => {
                            if (vers.VersionId === version.VersionId) {
                                selectedVersionIndex = versIndex;
                            }
                        })
                    }
                });
                let remained = tempAvailable[selectedObjectIndex].Versions[selectedVersionIndex].Count - selectedCount;
                tempAvailable[selectedObjectIndex].Versions[selectedVersionIndex].Count = remained;
                setAvailableObjectsList(tempAvailable);
                let tempReady = [...readyToSendList];
                let selectedReqIndex = undefined;
                let selectedObjIndexInReady = undefined;
                let selectedVerIndexInReady = undefined;
                tempReady.map((item, itemIndex) => {
                    if (item.ID === req.ID) {
                        selectedReqIndex = itemIndex;
                        item.Objects.map((object, objIndex) => {
                            if (object.ObjectID === obj.ObjectID && object.Broken === broken) {
                                selectedObjIndexInReady = objIndex;
                                object.Versions.map((verss, versIndex) => {
                                    if (verss.VersionId === version.VersionId) {
                                        selectedVerIndexInReady = versIndex;
                                    }
                                })
                            }
                        })
                    }
                });
                if (selectedVerIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions[selectedVerIndexInReady].Count += selectedCount;
                } else if (selectedObjIndexInReady !== undefined) {
                    tempReady[selectedReqIndex].Objects[selectedObjIndexInReady].Versions.push({
                        ...version, Count: selectedCount
                    });
                } else {
                    tempReady[selectedReqIndex].Objects.push({
                        ...obj, Total: selectedCount, Versions: [{ ...version, Count: selectedCount }]
                    });
                }
                setReadyToSendList(tempReady);
                setConstReadyToSendList(tempReady);
            }
        }
        setShowAddObjectModal(false);
        setNewObject(null);
    }

    const handleSelectedNewObject = (item) => {
        let tmp = { ...newObject };
        tmp = {
            req: tmp.req,
            obj: item,
            hasSerial: !!item.Versions[0].Serial,
            availableVersions: item.Versions,
            broken: item.Broken
        };
        setNewObject(tmp);
        versDropRef.current.setList(item.Versions);
    }

    const handleSelectNewObjectVersion = (item) => {
        let tempNEw = { ...newObject };
        tempNEw = { ...tempNEw, version: item, ser: undefined, selectedCount: undefined, availableSerials: [], totalCount: undefined };
        if (!!newObject.hasSerial) {
            tempNEw = { ...tempNEw, availableSerials: item.serialList };
            serDropRef.current.setList(item.serialList);
        } else {
            tempNEw = { ...tempNEw, totalCount: item.Count, selectedCount: 0 };
        }
        setNewObject(tempNEw);
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
                            Broken: obj.Broken
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
                        Broken: obj.Broken
                    })
                })
            }
        })
        sendObjects(selector.token, objectsList, selectedRequest.ID, sendDescription, barnameNumber, barnameImage).then(data => {
            if (data.errorCode === 0) {
                setFinalSendLoading(false);
                setShowFinalSendModal(false);
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
                setBarnameImage("");
                setBarnameNumber("");
                setSendDescription("");
                setSelectedRequest(null);
                getReadyToSendList();
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
        <View style={{ flex: 1, paddingHorizontal: 5 }}>
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
                        style={screenMode === "History" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle} />
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
                        style={screenMode === "MRejected" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle} />
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
                        style={screenMode === "CRejected" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle} />
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
                        style={screenMode === "ReadyToSend" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle} />
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
                <View style={{ flex: 1, justifyContent: "center", alignItem: "center" }}>
                    <ActivityIndicator color={"#660000"} size={"large"} />
                </View>
            ) : (<FlatList style={{ flex: 1, paddingHorizontal: 10, }} data={
                screenMode === "ReadyToSend" ? readyToSendList :
                    screenMode === "History" ? historyCardsList :
                        screenMode === "CRejected" ? rejectedListByCompany : rejectedListByMe}
                keyExtractor={item => item.ID.toString()}
                renderItem={({ item, index }) => screenMode === "ReadyToSend" ? (
                    <View
                        style={Styles.cardHeaderStyle2}>
                        <TouchableOpacity style={{
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around"
                        }} onPress={() => {
                            let currentList = [...readyToSendList];
                            currentList[index] = { ...item, isExpanded: !item.isExpanded };
                            setReadyToSendList(currentList);
                        }}>
                            <Text style={[Styles.labelTextStyle, { fontSize: 13 }]}>
                                تاریخ: {toFaDigit(item.Date)}
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
                                <Separator color={"black"} />
                                {item.Objects.length > 0 ? item.Objects.map((obj, objIndex) => (
                                    <>
                                        <View style={{ padding: 5, width: "100%" }}>
                                            <View style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                alignItems: "flex-start",
                                                justifyContent: "space-between",
                                                marginBottom: 10,
                                                backgroundColor: "#E6E6E6",
                                                padding: 5
                                            }}>
                                                <View style={{ flexDirection: "row" }}>
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
                                                    }} />
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
                                                        <View style={{ flexDirection: "row" }}>
                                                            <Text
                                                                style={[Styles.labelTextStyle, { marginRight: 10 }]}>
                                                                نام
                                                                           نسخه: {version.Version_Name}</Text>
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
                                        <Text style={{ fontFamily: "IRANSansMobile_Light" }}>قطعه ای در این درخواست
                                                   وجود ندارد.</Text>
                                    )}
                                <>
                                    <Separator color={"black"} />
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
                                            <Text style={{ color: "#fff", fontFamily: "IRANSansMobile_Light" }}>
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
                                            setNewObject({
                                                req: item
                                            });
                                            setShowAddObjectModal(true);
                                        }}>
                                            <Text style={{ color: "#fff", fontFamily: "IRANSansMobile_Light" }}>
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
                                        tmp[index] = { ...item, isExpanded: !item.isExpanded }
                                        setHistoryCardsList(tmp);
                                    } else if (screenMode === "CRejected") {
                                        let tmp = [...rejectedListByCompany];
                                        tmp[index] = { ...item, isExpanded: !item.isExpanded }
                                        setRejectedListByCompany(tmp);
                                    } else if (screenMode === "MRejected") {
                                        let tmp = [...rejectedListByMe];
                                        tmp[index] = { ...item, isExpanded: !item.isExpanded }
                                        setRejetedListByMe(tmp);
                                    }
                                }}>
                                <View style={{ width: "85%" }}>
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
                                            تاریخ: {item.Date}
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
                                    <Separator color={"black"} />
                                    {item.Objects.length > 0 ? item.Objects.map((obj, objIndex) => (
                                        <>
                                            <View style={{ padding: 5, width: "100%" }}>
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
                                                        }} />
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
                                                                style={[Styles.labelTextStyle, { marginRight: pageWidth * 0.08 }]}>نام
                                                                       نسخه: {version.Version_Name}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </>
                                    )) : (
                                            <Text style={{ fontFamily: "IRANSansMobile_Light" }}>قطعه ای در این درخواست
                                                   وجود ندارد.</Text>
                                        )}
                                    {item.Type === 1 && item.State === 120 && (
                                        <>
                                            <Separator color={"black"} />
                                            <View style={{
                                                flexDirection: "row",
                                                justifyContent: "space-around",
                                                alignItems: "center",
                                                width: "100%",
                                                height: 35
                                            }}>
                                                {acceptRejectLoading ? (
                                                    <ActivityIndicator size={"small"} color={"#660000"} />
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
                    <View style={{height:pageHeight*0.4, flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ color: "#000", fontFamily: "IRANSansMobile_Light" }}>
                            موردی یافت نشد.
                            </Text>
                    </View>
                )} />)}
            {(showDeleteModal || showAddObjectModal) && (
                <View style={Styles.modalBackgroundStyle}>
                    {showDeleteModal ? (<View style={{
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
                        <Text style={{ fontFamily: "IRANSansMobile_Medium" }}>آیا از درخواست حذف خود اطمینان دارید؟</Text>
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
                    </View>) : (
                            <ScrollView style={{
                                width: pageWidth * 0.8,
                                backgroundColor: "#fff",
                                maxHeight: pageHeight * 0.6,
                                position: "absolute",
                                borderRadius: 10,
                                top: pageHeight * 0.1,
                                paddingTop: 10,
                                paddingBottom: 30,
                                flex: 1
                            }} contentContainerStyle={{ alignItems: "center", justifyContent: "flex-start" }}>
                                <View style={{ marginVertical: 5 }}>
                                    <DropdownPicker
                                        list={availableObjectsList}
                                        placeholder={
                                            !!newObject && !!newObject.obj ? newObject.obj.Object_Name
                                                : 'قطعه مورد نظر خود را انتخاب کنید.'
                                        }
                                        listHeight={200}
                                        renderItem={(item) => (
                                            <TouchableOpacity
                                                style={[Styles.objectlistItemsContainerStyle, {
                                                    backgroundColor: !!item.item.Broken ? "#FF9999" : "#90DA9F"
                                                }]}
                                                onPress={() => {
                                                    handleSelectedNewObject(item.item);
                                                }}>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}>{item.item.ObjectID}</Text>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}> / </Text>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}>{item.item.Object_Name}</Text>
                                            </TouchableOpacity>
                                        )}
                                        hasSearchBox={false}
                                    />
                                </View>
                                <View style={{ marginVertical: 5 }}>
                                    <DropdownPicker
                                        ref={versDropRef}
                                        list={!!newObject ? newObject.availableVersions : []}
                                        placeholder={
                                            !!newObject && !!newObject.version ? newObject.version.Version_Name
                                                : 'نسخه مورد نظر خود را انتخاب کنید.'
                                        }
                                        listHeight={200}
                                        renderItem={(item) => (
                                            <TouchableOpacity
                                                style={Styles.listItemsContainerStyle}
                                                onPress={() => {
                                                    handleSelectNewObjectVersion(item.item);
                                                }}>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}>{item.item.VersionId}</Text>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}> / </Text>
                                                <Text style={{ fontFamily: 'IRANSansMobile_Light' }}>{item.item.Version_Name}</Text>
                                            </TouchableOpacity>
                                        )}
                                        hasSearchBox={false}

                                    />
                                </View>
                                {!!newObject && !!newObject.hasSerial ? (
                                    <View style={{ marginVertical: 5 }}>
                                        <DropdownPicker
                                            ref={serDropRef}
                                            list={!!newObject ? newObject.availableSerials : []}
                                            placeholder={
                                                !!newObject && !!newObject.ser ? newObject.ser
                                                    : 'سریال مورد نظر خود را انتخاب کنید.'
                                            }
                                            listHeight={200}
                                            renderItem={(item) => (
                                                <TouchableOpacity
                                                    style={Styles.listItemsContainerStyle}
                                                    onPress={() => {
                                                        let tmp = { ...newObject };
                                                        tmp = { ...tmp, ser: item.item }
                                                        setNewObject(tmp);
                                                    }}>
                                                    <Text style={{ fontFamily: 'IRANSansMobile_Light' }}>{item.item}</Text>
                                                </TouchableOpacity>
                                            )}
                                            hasSearchBox={false}asSearchBox={false}
                                        />
                                    </View>
                                ) : !!newObject && !!newObject.obj ? (
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                            onPress={() => {
                                                if (newObject.selectedCount < newObject.totalCount) {
                                                    let tmp = { ...newObject };
                                                    tmp = { ...tmp, selectedCount: newObject.selectedCount + 1 }
                                                    setNewObject(tmp);
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
                                            از {!!newObject.totalCount ? newObject.totalCount : null}
                                        </Text>
                                        <Text style={{ marginHorizontal: 5, fontFamily: "IRANSansMobile_Light" }}>
                                            {newObject.selectedCount !== undefined ? newObject.selectedCount : null}
                                        </Text>
                                        <TouchableOpacity style={Styles.plusButtonContainerStyle}
                                            onPress={() => {
                                                if (newObject.selectedCount > 0) {
                                                    let tmp = { ...newObject };
                                                    tmp = { ...tmp, selectedCount: newObject.selectedCount - 1 }
                                                    setNewObject(tmp);
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
                                <View style={[Styles.modalFooterContainerStyle, { marginTop: 15 }]}>
                                    <TouchableOpacity style={Styles.modalButtonStyle} onPress={() => {
                                        setNewObject(null);
                                        setShowAddObjectModal(false);
                                    }}>
                                        <Text style={Styles.modalButtonTextStyle}>
                                            انصراف
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={Styles.modalButtonStyle} onPress={() => handleAddItem()}>
                                        <Text style={Styles.modalButtonTextStyle}>
                                            تایید
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                </View>
            )}
            {showFinalSendModal && (
                <View style={Styles.modalBackgroundStyle}>
                    <ScrollView style={[Styles.modalContainerStyle, {
                        height: !!barnameImage ? "70%" : "55%",
                        top: !!barnameImage ? pageHeight * 0.04 : pageHeight * 0.08
                    }]} contentContainerStyle={{ justifyContent: "center", alignSelf: "center", alignItems: 'center' }}>
                        <View style={Styles.modalBodyContainerStyle2}>
                            <Input label={"شماره بارنامه"} keyboardType={"numeric"}
                                onChangeText={text => setBarnameNumber(text)} value={barnameNumber} />
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
                                <Text style={{ fontFamily: "IRANSansMobile_Light", marginTop: 5 }}>لطفا عکس بارنامه را بارگذاری
                                کنید.</Text>}
                            <View style={Styles.getImageContainerViewStyle}>
                                {CameraIcon({
                                    style: { marginHorizontal: 10 },
                                    color: "#000",
                                    onPress: () => {
                                        launchCamera(
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
                                {UploadFileIcon({
                                    style: { marginHorizontal: 10 },
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
                                    style: { marginHorizontal: 10 }
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
                        {finalSendLoading ? (
                            <View style={Styles.modalFooterContainerStyle}>
                                <ActivityIndicator size={"small"} color={"#660000"} />
                            </View>
                        ) : (<View style={Styles.modalFooterContainerStyle}>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    setBarnameNumber("");
                                    setBarnameImage("");
                                    setSendDescription("");
                                    setShowFinalSendModal(false)
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>انصراف</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={Styles.modalButtonStyle}
                                onPress={() => {
                                    handleFinalSend()
                                }}>
                                <Text style={Styles.modalButtonTextStyle}>تایید</Text>
                            </TouchableOpacity>
                        </View>)}
                    </ScrollView>
                </View>

            )}
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
        flexShrink:1,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    deactiveHeaderButtonStyle: {
        width: '18%',
        flexShrink:1,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row"
    },
    activeHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(15),
        color: '#9C0000',
        textAlign: "center",
        // width:"20%",
        // flexShrink:1
    },
    deactiveHeaderButtonTextStyle: {
        fontFamily: 'IRANSansMobile',
        fontSize: normalize(15),
        color: 'gray',
        textAlign: "center",
        // width:"20%",
        // flexShrink:1
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
})

export default History;
