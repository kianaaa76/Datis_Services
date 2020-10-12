import React, {useState, useEffect} from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    Dimensions,
    TouchableOpacity,
    ToastAndroid,
    FlatList,
    TextInput,
    ActivityIndicator,
    TouchableHighlight
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import Octicons from 'react-native-vector-icons/Octicons';
import Feather from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import DropdownPicker from "../../common/DropdownPicker";
import {useSelector} from 'react-redux';
import {getObjects, getObjBySerial} from "../../../actions/api";
import {RNCamera} from "react-native-camera";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;


const ServicePartsTab = ({setInfo, info}) => {
    const selector = useSelector((state) => state);
    const [fieldsObject, setFieldsObject] = useState({
        objectType:"",
        serial:"",
        partTypeSelected:{},
        partVersionSelected:{},
        newObjectPrice:"",
        failureDescription:"",
        hasGarantee:null,
        prePrice:""
    })
    const [newHasStarted, setNewHasStarted] = useState(Boolean);
    const [isNewPartFormExpanded,setIsNewPartFormExpanded] = useState(false);
    const [partsListName, setPartsListName] = useState([]);
    const [selectedPartVersionsList, setSelectedPartVersionsList] = useState([]);
    const [screenMode, setScreenMode] = useState(false);
    const [searchBarcodeLoading, setSearchBarcodeLoading] = useState(false);
    const [objectsList, setObjectsList] = useState(info);
    const [refresh, setRefresh] = useState(false);
    const [selectedItemList, setSelectedItemList] = useState({});

    const onSuccess = async (code) => {
        await setScreenMode(false);
        let header = parseInt(code.data.toString().substr(0,3));
        let selectedObject = partsListName.filter(item=> item.value.SerialBarcode == header);
        let serialHeaderIndex = selectedObject[0].value.SerialFormat.indexOf('#');
        let leftOfCode = code.data.toString().substr(serialHeaderIndex,code.data.length-3);
        if (selectedObject.length>0) {
            getObjBySerial(
                selector.token,
                `${selectedObject[0].value.SerialFormat.substr(0,serialHeaderIndex)}${leftOfCode}`,
                selectedObject[0].value.Id).then(data=>{
                if (data.errorCode == 0){
                    let selectedVersion =
                        selectedObject[0].value.Versions.filter(item=>item.Key == data.result.VersionId);
                    if (!!selectedItemList.id){
                        refactorObjectListItems("partType",selectedObject[0],selectedItemList.id)
                        refactorObjectListItems("version",selectedVersion[0],selectedItemList.id)
                        refactorObjectListItems(
                            "serial",
                            `${selectedObject[0].value.SerialFormat.substr(0,serialHeaderIndex)}${leftOfCode}`,
                            selectedItemList.id)
                        setSelectedItemList({});
                    } else {
                        setFieldsObject({...fieldsObject,
                            partTypeSelected: selectedObject[0],
                            partVersionSelected: selectedVersion[0],
                            serial:`${selectedObject[0].value.SerialFormat.substr(0,serialHeaderIndex)}${leftOfCode}`})
                    }
                } else {
                    ToastAndroid.showWithGravity(
                        data.message,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    )
                }
            })
        } else {
            ToastAndroid.showWithGravity(
                "کد اسکن شده معتبر نیست.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            )
        }
    }

    const searchBarcode = ()=>{
        let object = {};
        const sserial = !!selectedItemList.id ? selectedItemList.serial : fieldsObject.serial;
        partsListName.map(item=>{
            let serialFormatHeader = item.value.SerialFormat.substr(0,item.value.SerialFormat.indexOf('#'));
            if(!!serialFormatHeader && serialFormatHeader == sserial.substr(0,item.value.SerialFormat.indexOf('#'))){
                object = item;
            }
        });
        if (!!object.label){
            setSearchBarcodeLoading(true);
            getObjBySerial(selector.token, sserial, object.value.Id).then(data=>{
                if (data.errorCode == 0) {
                    let selectedVersion = object.value.Versions.filter(item=>item.Key == data.result.VersionId);
                    if(!!selectedItemList.id){
                        refactorObjectListItems("partType", object, selectedItemList.id);
                        refactorObjectListItems("version", selectedVersion[0], selectedItemList.id);
                        setSelectedItemList({});
                    } else {
                        setFieldsObject({...fieldsObject,
                            partTypeSelected: object,
                            partVersionSelected: selectedVersion[0]
                        });
                    }
                    setSearchBarcodeLoading(false);
                } else {
                    setSearchBarcodeLoading(false);
                    ToastAndroid.showWithGravity(
                        data.errorCode,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    )
                }
            })
        } else {
            ToastAndroid.showWithGravity(
                "فرمت سریال وارد شده صحیح نیست.",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER
            )
        }
    }

    const getPartsObject = (token) => {
        getObjects(token).then(data=>{
            if (data.errorCode == 0){
                const partsList = [];
                data.result.map(item=>partsList.push({label:item.Name, value:item}));
                setPartsListName(partsList);
            } else {
                ToastAndroid.showWithGravity(
                    data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
            }
        })
    }

    const refactorObjectListItems = (refactorFeild, newValue, objectId)=>{
        let currentList = !!info.length ? info : [];
        let selectedObject = {};
        let Index = 0;
        currentList.map((item, index)=>{
            if (item.id == objectId){
                selectedObject = item;
                switch (refactorFeild) {
                    case "isExpanded":
                        selectedObject = {...selectedObject, "isExpanded": newValue};
                        break;
                    case "failureDescription":
                        selectedObject = {...selectedObject, "failureDescription": newValue};
                        break;
                    case "availableVersions":
                        selectedObject = {...selectedObject, "availableVersions": newValue};
                        break;
                    case "hasGarantee":
                        selectedObject = {...selectedObject, "hasGarantee": newValue};
                        break;
                    case "partType":
                        selectedObject = {...selectedObject, "partType": newValue};
                        break;
                    case "price":
                        selectedObject = {...selectedObject, "price": newValue};
                        break;
                    case "serial":
                        selectedObject = {...selectedObject, "serial": newValue};
                        break;
                    case "version":
                        selectedObject = {...selectedObject, "version": newValue};
                        break;
                }
                Index = index;
            }
        });
        currentList.splice(Index,1,selectedObject);
        setInfo(currentList);
        setObjectsList(currentList);
        setRefresh(!refresh);
    }

    const renderServicePartItem = (item)=>{
        let Item = item.item;
        return(
            <View style={Styles.formContainerStyle}>
                <TouchableHighlight style={Styles.formHeaderStyle} onPress={()=>refactorObjectListItems("isExpanded", !Item.isExpanded, Item.id)}>
                    <View style={Styles.formHeaderStyle}>
                        <View style={Styles.ItemFromHeaderStyle}>
                            <TouchableOpacity
                                style={{width: 37, height: 37, justifyContent:"center", alignItems:"center", backgroundColor: "#660000", borderRadius:5}}
                                onPress={()=>refactorObjectListItems("isExpanded", !Item.isExpanded, Item.id)}>
                                {Item.isExpanded?(
                                    <Feather name={"minus"} style={{color:"#fff", fontSize:17}}/>
                                ):(
                                    <Feather name={"plus"} style={{color:"#fff", fontSize:17}}/>
                                )}
                            </TouchableOpacity>
                            <Text style={{color:"#660000", fontSize:12, textAlign:"center"}}>
                                {Item.serial}
                            </Text>
                            <Text style={{color:"#660000", fontSize:12, textAlign:"center"}}>
                                {!!Item.partType.label? Item.partType.label : "نام"}
                            </Text>
                        </View>
                        {Item.objectType == "new" ? (
                            <FontAwesome5 name={"arrow-right"} style={{color:"green", fontSize:20}}/>
                        ):(
                            <FontAwesome5 name={"arrow-left"} style={{color:"red", fontSize:20}}/>
                        )}
                    </View>
                </TouchableHighlight>
                {Item.isExpanded && (
                    <View style={Styles.bothOptionsContainerStyle}>
                        <View style={Styles.partTypeContainerStyle}>
                            <DropdownPicker
                                list={partsListName}
                                onSelect={value=> {
                                    refactorObjectListItems("partType", value.label, Item.id);
                                    let versions=[];
                                    value.value.Versions.map(item=>versions.push({label:item.Value, value:item}))
                                    refactorObjectListItems("availableVersions", versions, Item.id);
                                }}
                                placeholder={!!Item.partType.label
                                    ? Item.partType.label
                                    :"قطعه مورد نظر خود را انتخاب کنید."}/>
                            <Text style={{width:"20%"}}>نوع قطعه:</Text>
                        </View>
                        <View style={Styles.serialContainerStyle}>
                            <Icon
                                name={"search"}
                                style={{color: "#000", fontSize: 30}}
                                onPress={()=>{
                                    setSelectedItemList(Item);
                                    searchBarcode();
                                }}
                            />
                            <Icon
                                name={"qr-code-2"}
                                style={{color:"#000", fontSize:30}}
                                onPress={()=> {
                                    setSelectedItemList(Item);
                                    setScreenMode(true);
                                }}/>
                            <TextInput
                                style={Styles.serialInputStyle}
                                onChangeText={text=>refactorObjectListItems("serial", text, Item.id)}
                                value={Item.serial}
                            />
                            <View style={{flexDirection:"row"}}>
                                <Icon name={"star"} style={{color:"red"}}/>
                                <Text style={Styles.labelStyle}>سریال:</Text>
                            </View>
                        </View>
                        <View style={Styles.partTypeContainerStyle}>
                            <DropdownPicker
                                list={Item.availableVersions}
                                placeholder={!!Item.version.Key
                                    ? Item.version.Value
                                    :"نسخه مورد نظر خود را انتخاب کنید."}
                                onSelect={item=>refactorObjectListItems("version", item.Value, Item.id)}
                            />
                            <Text style={{width:65}}>نسخه:  </Text>
                        </View>
                    </View>
                )}
                {Item.isExpanded && Item.objectType === "new" ? (
                    <View style={Styles.priceContainerStyle}>
                        <Text>
                            ریال
                        </Text>
                        <TextInput
                            style={Styles.priceInputStyle}
                            onChangeText={text=>refactorObjectListItems("price", text, Item.id)}
                            value={Item.price}
                            keyboardType="numeric"
                        />
                        <Text>
                            قیمت:
                        </Text>
                    </View>
                ) : Item.isExpanded && Item.objectType === "failed" ? (
                    <View style={{marginTop:15, width:"100%"}}>
                        <Text>شرح نوع خرابی و علت احتمالی آن: </Text>
                        <View style={Styles.failureDescriptionContainerStyle}>
                            <Text style={{marginBottom:5}}>توضیحات: </Text>
                            <TextInput
                                style={Styles.descriptionInputStyle}
                                onChangeText={text=>refactorObjectListItems("failureDescription", text, Item.id)}
                                value={Item.failureDescription}
                            />
                        </View>
                        <View style={Styles.garanteeContainerStyle}>
                            <Text style={{marginRight:10}}>{!!Item.hasGarantee ? Item.hasGarantee : "-"}</Text>
                            <Text>
                                گارانتی:
                            </Text>
                        </View>
                        <View style={Styles.prePriceContainerStyle}>
                            <Text>
                                ریال
                            </Text>
                            <TextInput
                                style={Styles.prePriceInputStyle}
                                onChangeText={text=>refactorObjectListItems("price", text, Item.id)}
                                value={Item.price}
                                keyboardType="numeric"
                            />
                            <Text>
                                مبلغ عودت داده شده:
                            </Text>
                        </View>
                    </View>
                ):null}
                {Item.isExpanded && (
                    <View style={Styles.formFooterContainerstyle}>
                        <TouchableOpacity style={Styles.footerIconContainerStyle} onPress={()=> {
                            let currentList = objectsList.length>0 ? objectsList : [];
                            let selectedIndex = 0;
                            currentList.map((item, index)=>{
                                if (item.id == Item.id){
                                    selectedIndex = index;
                                }
                            });
                            delete currentList[selectedIndex];
                            setInfo(currentList);
                            setObjectsList(currentList);
                        }}>
                            <Octicons name={"trashcan"} style={{fontSize:17, color:"#fff"}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={Styles.footerIconContainerStyle} onPress={()=>{
                            refactorObjectListItems("isExpanded", false, Item.id);
                        }}>
                            <Octicons name={"check"} style={{fontSize:17, color:"#fff"}}/>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    useEffect(()=>{
        getPartsObject(selector.token);
    },[fieldsObject.objectType, newHasStarted]);
    return !screenMode ? (
        <>
            <ScrollView style={{flex: 0.8, padding: 15}}>
                {!!objectsList && objectsList.length > 0 && (
                    <View style={{flex:1, marginBottom:newHasStarted?0:30}}>
                        <FlatList
                            style={{width:"100%"}}
                            data={objectsList}
                            renderItem={item =>renderServicePartItem(item)}
                            keyExtractor={(item,index) => index.toString()}
                            extraData={refresh}
                        />
                    </View>
                )}
                {newHasStarted && (
                    <View style={Styles.newformContainerStyle}>
                        <View style={Styles.formHeaderStyle}>
                            <TouchableOpacity
                                style={{width: 37, height: 37, justifyContent:"center", alignItems:"center", backgroundColor: "#660000", borderRadius:5}}
                                onPress={()=>setIsNewPartFormExpanded(!isNewPartFormExpanded)}>
                                {isNewPartFormExpanded?(
                                    <Feather name={"minus"} style={{color:"#fff", fontSize:17}}/>
                                ):(
                                    <Feather name={"plus"} style={{color:"#fff", fontSize:17}}/>
                                )}
                            </TouchableOpacity>
                            <Text style={{color:"#660000", fontSize:12, textAlign:"center"}}>
                                {!!fieldsObject.serial? fieldsObject.serial : "سریال"}
                            </Text>
                            <Text style={{color:"#660000", fontSize:12, textAlign:"center"}}>
                                {!!fieldsObject.partTypeSelected.label? fieldsObject.partTypeSelected.label : "نام"}
                            </Text>
                        </View>
                        <View style={Styles.partTypeSelectionContainerStyle}>
                            <View style={{flexDirection:"row", alignItems:"center"}}>
                                <CheckBox
                                    onValueChange={()=>{
                                        if (fieldsObject.objectType !== "failed"){
                                            setFieldsObject({
                                                ...fieldsObject, objectType: "failed"
                                            });
                                            setIsNewPartFormExpanded(true);
                                        }
                                    }}
                                    value={fieldsObject.objectType === "failed" ? true : false}
                                    tintColors={{ true: 'red', false: 'red' }}
                                />
                                <Text style={{color:"#000", fontSize:12, fontWeight:"bold"}}>قطعه معیوب</Text>
                            </View>
                            <View style={{flexDirection:"row", alignItems:"center"}}>
                                <CheckBox
                                    onValueChange={()=>{
                                        if (fieldsObject.objectType !== "new"){
                                            setFieldsObject({
                                                ...fieldsObject, objectType: "new"
                                            });
                                            setIsNewPartFormExpanded(true);
                                        }
                                    }}
                                    value={fieldsObject.objectType == "new" ? true : false}
                                    tintColors={{ true: 'green', false: 'green' }}
                                    style={{marginLeft:20}}
                                />
                                <Text style={{color:"#000", fontSize:12, fontWeight:"bold"}}>قطعه جدید</Text>
                            </View>
                        </View>
                        {!!fieldsObject.objectType && isNewPartFormExpanded && (
                            <View style={Styles.bothOptionsContainerStyle}>
                                <View style={Styles.partTypeContainerStyle}>
                                    <DropdownPicker
                                        list={partsListName}
                                        onSelect={value=> {
                                            setFieldsObject({...fieldsObject, partTypeSelected: value})
                                            let versions=[];
                                            value.value.Versions.map(item=>versions.push({label:item.Value, value:item}))
                                            setSelectedPartVersionsList(versions);
                                        }}
                                        placeholder={!!fieldsObject.partTypeSelected.label
                                            ? fieldsObject.partTypeSelected.label
                                            :"قطعه مورد نظر خود را انتخاب کنید."}/>
                                    <Text style={{width:"20%"}}>نوع قطعه:</Text>
                                </View>
                                <View style={Styles.serialContainerStyle}>
                                    {searchBarcodeLoading ? (
                                        <ActivityIndicator size={"small"} color={"#000"}/>
                                    ) : (
                                        <Icon
                                            name={"search"}
                                            style={{color: "#000", fontSize: 30, marginHorizontal: 5}}
                                            onPress={searchBarcode}
                                        />)}
                                    <Icon
                                        name={"qr-code-2"}
                                        style={{color:"#000", fontSize:30, marginHorizontal:5}}
                                        onPress={()=>setScreenMode(true)}/>
                                    <TextInput
                                        style={Styles.serialInputStyle}
                                        onChangeText={text=>setFieldsObject({...fieldsObject, serial: text})}
                                        value={fieldsObject.serial}
                                    />
                                    <View style={{flexDirection:"row"}}>
                                        <Icon name={"star"} style={{color:"red"}}/>
                                        <Text style={Styles.labelStyle}>سریال:</Text>
                                    </View>
                                </View>
                                <View style={Styles.partTypeContainerStyle}>
                                    <DropdownPicker
                                        list={selectedPartVersionsList}
                                        placeholder={!!fieldsObject.partVersionSelected.Key
                                            ? fieldsObject.partVersionSelected.Value
                                            :"نسخه مورد نظر خود را انتخاب کنید."}
                                        onSelect={item=>setFieldsObject({...fieldsObject, partVersionSelected: item})}
                                    />
                                    <Text style={{width:65}}>نسخه:  </Text>
                                </View>
                            </View>
                        )}
                        {isNewPartFormExpanded && fieldsObject.objectType === "new" ? (
                            <View style={Styles.priceContainerStyle}>
                                <Text>
                                    ریال
                                </Text>
                                <TextInput
                                    style={Styles.priceInputStyle}
                                    onChangeText={text=>setFieldsObject({...fieldsObject, newObjectPrice: text})}
                                    value={fieldsObject.newObjectPrice}
                                    keyboardType="numeric"
                                />
                                <Text>
                                    قیمت:
                                </Text>
                            </View>
                        ) : isNewPartFormExpanded && fieldsObject.objectType === "failed" ? (
                            <View style={{marginTop:15, width:"100%"}}>
                                <Text>شرح نوع خرابی و علت احتمالی آن: </Text>
                                <View style={Styles.failureDescriptionContainerStyle}>
                                    <Text style={{marginBottom:5}}>توضیحات: </Text>
                                    <TextInput
                                        style={Styles.descriptionInputStyle}
                                        onChangeText={text=>setFieldsObject({...fieldsObject, failureDescription: text})}
                                        value={fieldsObject.failureDescription}
                                    />
                                </View>
                                <View style={Styles.garanteeContainerStyle}>
                                    <Text style={{marginRight:10}}>{!!fieldsObject.hasGarantee ? fieldsObject.hasGarantee : "-"}</Text>
                                    <Text>
                                        گارانتی:
                                    </Text>
                                </View>
                                <View style={Styles.prePriceContainerStyle}>
                                    <Text>
                                        ریال
                                    </Text>
                                    <TextInput
                                        style={Styles.prePriceInputStyle}
                                        onChangeText={text=>setFieldsObject({...fieldsObject, prePrice: text})}
                                        value={fieldsObject.prePrice}
                                        keyboardType="numeric"
                                    />
                                    <Text>
                                        مبلغ عودت داده شده:
                                    </Text>
                                </View>
                            </View>
                        ):null}
                        <View style={Styles.formFooterContainerstyle}>
                            <TouchableOpacity style={Styles.footerIconContainerStyle} onPress={()=> {
                                setIsNewPartFormExpanded(false);
                                setNewHasStarted(false);
                                setFieldsObject({
                                    ...fieldsObject,
                                    objectType: "",
                                    serial: "",
                                    partTypeSelected: {},
                                    partVersionSelected: {},
                                    newObjectPrice: "",
                                    failureDescription: "",
                                    hasGarantee: null,
                                    prePrice: ""});
                            }}>
                                <Octicons name={"trashcan"} style={{fontSize:17, color:"#fff"}}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={Styles.footerIconContainerStyle} onPress={()=>{
                                let INFO = !!objectsList ? objectsList : [];
                                INFO.push({
                                    id: INFO.length + 1,
                                    serial: fieldsObject.serial,
                                    isExpanded: false,
                                    failureDescription: fieldsObject.failureDescription,
                                    hasGarantee:fieldsObject.hasGarantee,
                                    price: fieldsObject.objectType == "new" ? fieldsObject.newObjectPrice : fieldsObject.prePrice,
                                    objectType:fieldsObject.objectType,
                                    partType: fieldsObject.partTypeSelected,
                                    availableVersions:[],
                                    version: fieldsObject.partVersionSelected
                                });
                                setNewHasStarted(false);
                                setFieldsObject({
                                    ...fieldsObject,
                                    objectType: "",
                                    serial: "",
                                    partTypeSelected: {},
                                    partVersionSelected: {},
                                    newObjectPrice: "",
                                    failureDescription: "",
                                    hasGarantee: null,
                                    prePrice: ""});
                                setObjectsList(INFO);
                                setInfo(INFO);
                            }}>
                                <Octicons name={"check"} style={{fontSize:17, color:"#fff"}}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
            <View style={{flex:0.2, paddingHorizontal: 10}}>
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
                            fontSize: 33,
                            color: '#dadfe1',
                        }}
                    />
                </TouchableOpacity>
            </View>
        </>
    ) : (
        <RNCamera
            defaultTouchToFocus
            onBarCodeRead={onSuccess}
            style={Styles.preview}
            type={RNCamera.Constants.Type.back}>
            <View style={Styles.barcodeContainerStyle}>
                <View style={Styles.barcodeLineStyle}/>
            </View>
        </RNCamera>
    );
}

const Styles = StyleSheet.create({
    preview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    barcodeContainerStyle:{
        width:pageWidth*0.7,
        height:pageWidth*0.4,
        justifyContent:"center",
        alignItems:"center",
        borderWidth:2,
        borderColor:"green"
    },
    barcodeLineStyle:{
        width:pageWidth*0.5,
        height:0,
        borderWidth:1,
        borderColor:"#660000"
    },
    newPartbuttonStyle: {
        width: pageWidth * 0.2,
        height: pageWidth * 0.2,
        borderRadius: pageWidth * 0.1,
        backgroundColor: '#660000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    newformContainerStyle:{
        borderWidth:1,
        borderColor:"#000",
        borderRadius: 10,
        padding:8,
        marginBottom:30
    },
    formContainerStyle:{
        borderWidth:1,
        borderColor:"#000",
        borderRadius: 10,
        padding:8,
        marginBottom:10
    },
    formHeaderStyle:{
        width:"100%",
        flexDirection:"row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ItemFromHeaderStyle:{
        width:"92%",
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    partTypeSelectionContainerStyle:{
        width:"100%",
        flexDirection: "row",
        justifyContent:"flex-end"
    },
    formFooterContainerstyle:{
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        marginTop:10
    },
    footerIconContainerStyle: {
        width:35,
        height:35,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor: "#660000",
        marginHorizontal:10
    },
    partTypeContainerStyle:{
        flexDirection:"row",
        width:"100%",
        justifyContent:"flex-end",
        alignItems:"center",
        marginTop:15
    },
    bothOptionsContainerStyle:{
        marginTop: 10
    },
    serialContainerStyle:{
        flexDirection:"row",
        width:"100%",
        marginVertical:10,
        alignItems:"center",
        justifyContent:"flex-end"
    },
    serialInputStyle:{
        width:"55%",
        borderBottomWidth:2,
        borderBottomColor:"#000",
        height: 40,
        marginHorizontal: 10
    },
    priceContainerStyle: {
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-end",
        width:"100%",
        marginVertical:10
    },
    priceInputStyle:{
        width:"70%",
        borderBottomWidth: 2,
        borderBottomColor: "#000",
        marginHorizontal:10,
        height: 40,
        paddingHorizontal: 10
    },
    descriptionInputStyle:{
        width: '100%',
        height: pageHeight * 0.15,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        textAlignVertical: 'top',
        padding: 15,
    },
    failureDescriptionContainerStyle:{
        width:"100%",
        marginVertical:10
    },
    garanteeContainerStyle:{
        width:"100%",
        marginVertical:10,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-end"
    },
    prePriceContainerStyle:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-end",
        marginVertical:10,
        width:"100%"
    },
    prePriceInputStyle:{
        borderBottomWidth:2,
        borderBottomColor:"#000",
        padding:10,
        width:pageWidth*0.5,
        marginHorizontal:5
    },
})

export default ServicePartsTab;