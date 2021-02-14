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
  const [isScreenModeNew, setIsScreenModeNew] = useState(true);
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

  const [hasToBeRefreshed, setHasToBeRefreshed] = useState(false);

  const Separator = () => <View style={Styles.separator} />;

  return (
    <View style={Styles.containerStyle}>
      <View style={Styles.headerButtonsContainerStyle}>
        <TouchableOpacity
          elevation={5}
          style={
            isScreenModeNew
              ? Styles.deactiveHeaderButtonStyle
              : Styles.activeHeaderButtonStyle
          }
          onPress={() => setIsScreenModeNew(false)}>
          <Text
            style={
              isScreenModeNew
                ? Styles.deactiveHeaderButtonTextStyle
                : Styles.activeHeaderButtonTextStyle
            }>
            ناسالم
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          elevation={5}
          style={
            !isScreenModeNew
              ? Styles.deactiveHeaderButtonStyle
              : Styles.activeHeaderButtonStyle
          }
          onPress={() => setIsScreenModeNew(true)}>
          <Text
            style={
              !isScreenModeNew
                ? Styles.deactiveHeaderButtonTextStyle
                : Styles.activeHeaderButtonTextStyle
            }>
            سالم
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{flex: 1}}>
        <FlatList
          data={isScreenModeNew ? newObjectsList : failedObjectsList}
          renderItem={({item, index}) => (
            <TouchableOpacity
              onPress={() => {
                if (
                  !item.isExpanded &&
                  item.objectInventory.length == 0
                ) {
                  Alert.alert('از این قطعه موجود نداریم!');
                } else {
                  let currentList = isScreenModeNew
                    ? newObjectsList
                    : failedObjectsList;
                  currentList.splice(index, 1, {
                    ...item,
                    isExpanded: item.isExpanded ? false : true,
                  });
                  if (isScreenModeNew) {
                    setNewObjectsList(currentList);
                  } else {
                    setFailedObjectsList(currentList);
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
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}>
                {item.objectName}
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
                        <Text>{I.version}</Text>
                        <Text>{!!I.serial ? I.serial : I.count}</Text>
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
    borderColor: 'transparent',
    borderBottomColor: '#9C0000',
    borderWidth: 1.5,
    width: '30%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deactiveHeaderButtonStyle: {
    borderColor: 'transparent',
    borderBottomColor: 'gray',
    borderWidth: 1.5,
    width: '30%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default WarehouseHandling;
