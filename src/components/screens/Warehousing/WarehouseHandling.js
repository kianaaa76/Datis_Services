import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import {normalize} from '../../utils/utilities';

const pageHeight = Dimensions.get('screen').height;
const pageWidth = Dimensions.get('screen').width;

const WarehouseHandling = () => {
  const [screenMode, setScreenMode] = useState("all");
  const [newObjectsList, setNewObjectsList] = useState([
    {
      objectName: 'testObject1',
      objectInventory: [
        {
          serial: 'TEST1111111',
          version: 'testVersion1',
          count: 1,
        },
        {
          serial: 'TEST2222222',
          version: 'testVersion2',
          count: 2,
        },
        {
          serial: 'TEST3333333',
          version: 'testVersion3',
          count: 3,
        },
      ],
      isExpanded: false,
    },
    {
      objectName: 'testObject2',
      objectInventory: [
        {
          serial: 'TEST11113456',
          version: 'testVersion1',
          count: 1,
        },
        {
          serial: 'TEST22222345',
          version: 'testVersion2',
          count: 2,
        },
        {
          serial: 'TEST3333345',
          version: 'testVersion3',
          count: 3,
        },
      ],
      isExpanded: false,
    },
  ]);

  const [failedObjectsList, setFailedObjectsList] = useState([
    {
      objectName: 'testObject3',
      objectInventory: [
        {
          count: 2,
          version: 'testVersion1',
        },
        {
          count: 3,
          version: 'testVersion2',
        },
        {
          count: 2,
          version: 'testVersion3',
        },
      ],
      isExpanded: false,
    },
    {
      objectName: 'testObject4',
      objectInventory: [
        {
          count: 2,
          version: 'testVersion1',
        },
        {
          count: 3,
          version: 'testVersion2',
        },
        {
          count: 2,
          version: 'testVersion3',
        },
      ],
      isExpanded: false,
    },
  ]);

  const [allObjectsList, setAllObjectsList] = useState([
    {
      objectName: 'testObject1',
      objectInventory: [
        {
          serial: 'TEST1111111',
          version: 'testVersion1',
          count: 1,
        },
        {
          serial: 'TEST2222222',
          version: 'testVersion2',
          count: 2,
        },
        {
          serial: 'TEST3333333',
          version: 'testVersion3',
          count: 3,
        },
      ],
      isExpanded: false,
    },
    {
      objectName: 'testObject2',
      objectInventory: [
        {
          serial: 'TEST11113456',
          version: 'testVersion1',
          count: 1,
        },
        {
          serial: 'TEST22222345',
          version: 'testVersion2',
          count: 2,
        },
        {
          serial: 'TEST3333345',
          version: 'testVersion3',
          count: 3,
        },
      ],
      isExpanded: false,
    },
    {
      objectName: 'testObject3',
      objectInventory: [
        {
          count: 2,
          version: 'testVersion1',
        },
        {
          count: 3,
          version: 'testVersion2',
        },
        {
          count: 2,
          version: 'testVersion3',
        },
      ],
      isExpanded: false,
    },
    {
      objectName: 'testObject4',
      objectInventory: [
        {
          count: 2,
          version: 'testVersion1',
        },
        {
          count: 3,
          version: 'testVersion2',
        },
        {
          count: 2,
          version: 'testVersion3',
        },
      ],
      isExpanded: false,
    },
  ])

  const [hasToBeRefreshed, setHasToBeRefreshed] = useState(false);

  const Separator = () => <View style={Styles.separator} />;

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
          onPress={() => setScreenMode("fail")}>
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
          onPress={() => setScreenMode("new")}>
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
            onPress={() => setScreenMode("all")}>
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
      <View style={{flex: 1}}>
        <FlatList
          data={screenMode === "new" ? newObjectsList : screenMode === "fail" ? failedObjectsList : allObjectsList}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => {
                if (
                  !item.isExpanded &&
                  item.objectInventory.length === 0
                ) {
                  Alert.alert('از این قطعه موجود نداریم!');
                } else {
                  let currentList = screenMode === "new"
                    ? newObjectsList
                    : screenMode === "fail" ? failedObjectsList : allObjectsList;
                  currentList.splice(index, 1, {
                    ...item,
                    isExpanded: item.isExpanded ? false : true,
                  });
                  if (screenMode === "new") {
                    setNewObjectsList(currentList);
                  } else if (screenMode === "fail") {
                    setFailedObjectsList(currentList);
                  } else {
                    setAllObjectsList(currentList);
                  }
                  setHasToBeRefreshed(!hasToBeRefreshed);
                }
              }}
              style={{
                width: pageWidth * 0.9,
                backgroundColor: '#fff',
                padding: 10,
                marginVertical: 4,
                marginHorizontal: 3,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 3,
                alignSelf: 'center',
              }}>
              <Text
                style={Styles.labelTextStyle}>
               نام قطعه: {item.objectName}
              </Text>
              {item.isExpanded && !!item.objectInventory && (
                <>
                  <Separator />
                  <View style={{width: '100%'}}>
                    {item.objectInventory.map(I => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginVertical: 5,
                          justifyContent: 'space-around',
                        }}>
                        {!!I.serial ? (
                            <Text style={Styles.labelTextStyle}>{I.serial}</Text>
                        ) : (
                            <View style={{flexDirection: "row"}}>
                              <TouchableOpacity style={{width:35, height:30, justifyContent:"center", alignItems:"center", backgroundColor:"#660000"}}>
                                <Text style={{color:"#fff"}}>
                                  کم
                                </Text>
                              </TouchableOpacity>
                              <Text style={{width:30, height:30, textAlign:"center", borderColor:"#660000", borderWidth:1}}>
                                {I.count}
                              </Text>
                              <TouchableOpacity style={{width:35, height:30, justifyContent:"center", alignItems:"center", backgroundColor:"#660000"}}>
                                <Text style={{color:"#fff"}}>
                                  اضافه
                                </Text>
                              </TouchableOpacity>
                            </View>
                        )}
                        <Text style={Styles.labelTextStyle}>نام نسخه: {I.version}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </TouchableOpacity>
          )}
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
    borderBottomColor: 'gray',
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
    borderColor: "#AC0000",
    borderWidth:1.5,
    marginLeft:10,
    backgroundColor:"#AC0000"
  },
  deactiveRadioButtonStyle: {
    width:pageWidth*0.05,
    height:pageWidth*0.05,
    borderRadius:pageWidth*0.025,
    borderColor: "gray",
    borderWidth:1.5,
    marginLeft:10,
  }
});

export default WarehouseHandling;
