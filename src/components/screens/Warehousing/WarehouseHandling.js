import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  FlatList,
  Alert,
    TextInput
} from 'react-native';
import {normalize} from '../../utils/utilities';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CheckBox from '@react-native-community/checkbox';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from "react-native-vector-icons/Entypo";
import iterableToArray from "@babel/runtime/helpers/esm/iterableToArray";


const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const WarehouseHandling = () => {
  const [screenMode, setScreenMode] = useState("all");
  const [allObjectsList, setAllObjectsList] = useState([
    {
      objectName: 'testObject1',
      totalItems: 5,
      type:1,
      isChecked:false,
      objectInventory: [
        {
          serialList: [{
            serialString:'TEST1111111',
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
      type:1,
      isChecked:false,
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
      type:0,
      isChecked:false,
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
      type:0,
      objectName: 'testObject4',
      totalItems: 7,
      isChecked:false,
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
      type:1,
      isChecked:false,
      objectInventory: [
        {
          serialList: [{
            serialString:'TEST1111111',
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
      type:1,
      isChecked:false,
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
      type:0,
      isChecked:false,
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
      type:0,
      objectName: 'testObject4',
      totalItems: 7,
      isChecked:false,
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

  const Separator = () => <View style={Styles.separator} />;

  const handleSearch = (searchValue)=>{
    if (!!searchValue){
      let tempList = constList.filter(item=>item.objectName.toLowerCase().includes(searchValue));
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
          <View style={screenMode === "fail" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
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
          <View style={screenMode === "new" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
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
          <View style={screenMode === "all" ? Styles.activeRadioButtonStyle : Styles.deactiveRadioButtonStyle}/>
        </TouchableOpacity>
      </View>
      <View style={Styles.searchbarContainerStyle}>
        <TextInput
            style={Styles.textinputStyle}
            placeholder={"نام قطعه و نسخه را جستجو کنید..."}
            onChangeText={(text)=>{
              setSearchText(text);
              handleSearch(text);
            }}
            value={searchText}
        />
        <FontAwesome
            name={'search'}
            style={{fontSize: 25, color: '#000'}}
        />
      </View>
      <View style={Styles.selectAllCheckBoxContainerStyle}>
          <TouchableOpacity style={Styles.confirmButtonStyle}>
            <Text style={Styles.confirmButtonTextStyle}>
              تایید
            </Text>
          </TouchableOpacity>
        <View style={{flexDirection:"row"}}>
          <Text style={{fontFamily:'IRANSansMobile_Light'}}>
            انتخاب همه
          </Text>
          <CheckBox tintColors={{ true: '#9C0000', false: 'black' }} onValueChange={()=>{
            let currentList = [...allObjectsList];
                currentList.map((item,index)=>{
                  if (screenMode === "all"){
                    currentList.splice(index, 1, {
                      ...item, isChecked: allSelected !== "all"
                    });
                    currentList[index].objectInventory.map((ver, verIndex)=>{
                      if (!!ver.serialList.length)
                      {
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
                    setAllSelected(allSelected==="all" ? "" : screenMode);
                  } else if (screenMode === "new" && !!item.type){
                    currentList.splice(index, 1, {
                      ...item, isChecked: allSelected === "fail" || allSelected === ""
                    });
                    currentList[index].objectInventory.map((ver, verIndex)=>{
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
                    currentList[index].objectInventory.map((ver, verIndex)=>{
                      if (!!ver.serialList.length) {
                        ver.serialList.map((ser, serIndex) => {
                          currentList[index].objectInventory[verIndex].serialList[serIndex] = {
                            ...ser,
                            isChecked: allSelected === "new" || allSelected === ""
                          }
                        });
                      }else {
                        currentList[index].objectInventory[verIndex].selectedCount = currentList[index].objectInventory[verIndex].count;
                      }
                    });
                    setAllSelected(allSelected==="all" ? "new" : allSelected==="fail" ? "" : allSelected === "new" ? "all" : screenMode);
                  }
                });
                setAllObjectsList(currentList);
                setHasToBeRefreshed(!hasToBeRefreshed);
            }} value={allSelected === "all" ? true : allSelected === screenMode}/>
        </View>
      </View>
      <View style={{flex: 1}}>
        <FlatList
          data={allObjectsList}
          renderItem={({item, index}) => screenMode === "all" || (screenMode === "new" && !!item.type ) || (screenMode === "fail" && !item.type) ? (
            <View
              style={[Styles.cardHeaderStyle,{
                backgroundColor: !!item.type ? "#90DA9F" : "#FF9999",
              }]}>
              <TouchableOpacity style={{width:"100%", flexDirection:"row", alignItems:"center", justifyContent:"space-around"}} onPress={() => {
                  let currentList = allObjectsList;
                  currentList.splice(index, 1, {
                    ...item,
                    isExpanded: !item.isExpanded,
                  });
                    setAllObjectsList(currentList);
                  setHasToBeRefreshed(!hasToBeRefreshed);
                }
              }>
                <Text style={Styles.labelTextStyle}>
                  تعداد کل: {item.totalItems}
                </Text>
                <Text
                  style={Styles.labelTextStyle}>
                 نام قطعه: {item.objectName}
                </Text>
                <CheckBox tintColors={{true: '#9C0000', false: 'black'}} value={item.isChecked} onChange={()=>{
                  if (item.isChecked){
                    if (allSelected === "all" && !!item.type){
                      setAllSelected("fail");
                    } else if (allSelected === "all" && !item.type){
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
                    currentList[index] ={
                      ...item, isChecked : !item.isChecked, objectInventory: ITEM_OBJECT_INVENTORY
                    };
                    setAllObjectsList(currentList);
                  setHasToBeRefreshed(!hasToBeRefreshed);
                }}/>
              </TouchableOpacity>
              {item.isExpanded && !!item.objectInventory && (
                <>
                  <Separator />
                  <View style={{width: '100%'}}>
                    {item.objectInventory.map((I, IIndex) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 15,
                          justifyContent: 'space-around',
                        }}>
                        {!!I.serialList.length ? (
                            <View>
                              {I.serialList.map((serial, serialIndex)=>(
                                  <View style={{flexDirection:"row", alignItems:"center"}}>
                                    <CheckBox tintColors={{true: '#9C0000', false: 'black'}} value={serial.isChecked} onChange={()=>{
                                      if (serial.isChecked){
                                        if (allSelected === "all" && !!item.type) {
                                          setAllSelected("fail");
                                        } else if (allSelected === "all" && !item.type) {
                                          setAllSelected("new");
                                        } else if (allSelected === "new" && !!item.type){
                                          setAllSelected("");
                                        } else if (allSelected === "fail" && !item.type) {
                                          setAllSelected("");
                                        }
                                      }
                                      let currentList = [...I.serialList];
                                      currentList.splice(serialIndex, 1, {
                                        ...serial, isChecked: !serial.isChecked
                                      })
                                        let LIST = [...allObjectsList];
                                        let tempObjectInventory = [...item.objectInventory];
                                        tempObjectInventory[IIndex] = {
                                          ...I, serialList: currentList
                                        };
                                        LIST[index] = {...item, objectInventory: tempObjectInventory, isChecked: serial.isChecked ? false : item.isChecked};
                                        setAllObjectsList(LIST);
                                      setHasToBeRefreshed(!hasToBeRefreshed);}}/>
                                    <Text style={Styles.labelTextStyle}>{serial.serialString}</Text>
                                  </View>
                        ))}
                            </View>
                        ) : (
                            <View style={{flexDirection: "row", alignItems:"center"}}>
                              <TouchableOpacity style={Styles.plusButtonContainerStyle} onPress={()=>{
                                if (I.selectedCount < I.count){
                                  let tempList = [...allObjectsList];
                                  tempList[index].objectInventory[IIndex] = {...I, selectedCount: I.selectedCount + 1}
                                  setAllObjectsList(tempList);
                                  setHasToBeRefreshed(!hasToBeRefreshed);
                                }
                              }}>
                                <Octicons
                                    name="plus"
                                    style={{
                                      fontSize: normalize(20),
                                      color: '#fff',
                                    }}
                                />
                              </TouchableOpacity>
                              <Text style={{textAlign:"center", fontFamily:"IRANSansMobile_Medium"}}>
                                از {I.count}
                              </Text>
                              <Text style={{marginHorizontal: 5}}>
                                {I.selectedCount}
                              </Text>
                              <TouchableOpacity style={Styles.plusButtonContainerStyle} onPress={()=>{
                                if (I.selectedCount > 0){
                                  if (allSelected === "all"){
                                    if (!!item.type) {
                                      setAllSelected("fail");
                                    } else {
                                      setAllSelected("new");
                                    }
                                  } else if (!!allSelected){
                                    setAllSelected("");
                                  }
                                  let tempList = [...allObjectsList];
                                  tempList[index].isChecked = false;
                                  tempList[index].objectInventory[IIndex] = {...I, selectedCount: I.selectedCount - 1}
                                  setAllObjectsList(tempList);
                                  setHasToBeRefreshed(!hasToBeRefreshed);
                                }
                              }}>
                                <Entypo
                                    name="minus"
                                    style={{
                                      fontSize: normalize(20),
                                      color: '#fff',
                                    }}
                                />
                              </TouchableOpacity>
                              <Text style={{textAlign:"center", fontFamily:"IRANSansMobile_Medium"}}>
                                تعداد :
                              </Text>
                            </View>
                        )}
                        <Text style={Styles.labelTextStyle}>نام نسخه: {I.version}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          ) : null}
        />
      </View>
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
    flexDirection:"row"
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
  serialTextStyle:{
    textAlign: 'center',
    fontFamily: 'IRANSansMobile_Light'
  },
  activeRadioButtonStyle:{
    width:pageWidth*0.05,
    height:pageWidth*0.05,
    borderRadius:pageWidth*0.025,
    borderColor: "#7C0000",
    borderWidth:1.5,
    marginLeft:10,
    backgroundColor:"#7C0000"
  },
  deactiveRadioButtonStyle: {
    width:pageWidth*0.05,
    height:pageWidth*0.05,
    borderRadius:pageWidth*0.025,
    borderColor: "gray",
    borderWidth:1.5,
    marginLeft:10,
  },
  searchbarContainerStyle: {
    width:"94%",
    height:pageHeight*0.08,
    backgroundColor: "#fff",
    borderRadius:30,
    elevation:5,
    alignSelf:"center",
    marginBottom:5,
    paddingHorizontal:10,
    paddingVertical:7,
    flexDirection:"row",
    justifyContent:'space-around',
    alignItems:"center"
  },
  textinputStyle:{
    width:"84%",
    height:"100%",
    fontFamily:'IRANSansMobile_Light',
    fontSize:12,
  },
  selectAllCheckBoxContainerStyle:{
    width:"100%",
    height:pageHeight*0.08,
    flexDirection:"row",
    alignItems:"center",
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
  confirmButtonStyle:{
    width:pageWidth*0.2,
    height:pageHeight*0.06,
    backgroundColor:"#660000",
    borderRadius:15,
    justifyContent:"center",
    alignItems:"center"
  },
  confirmButtonTextStyle:{
    color:"#fff",
    fontFamily:"IRANSansMobile_Medium"
  },
  plusButtonContainerStyle: {
    width:30,
    height:30,
    backgroundColor:"#660000",
    borderRadius:15,
    marginRight:5,
    justifyContent:"center",
    alignItems:"center"
  }
});

export default WarehouseHandling;
