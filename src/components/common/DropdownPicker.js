import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import {normalize} from '../utils/utilities';

const pageWidth = Dimensions.get('screen').width;

const DropdownPicker = forwardRef(
  ({placeholder, list, onSelect, listHeight, opensList, itemIndex, renderItem, hasSearchBox}, ref) => {
    const [listIsShown, setListIsShown] = useState(false);
    const [showingList, setShowingList] = useState(list);
    const [searchText, setSearchText] = useState('');

    useImperativeHandle(ref, () => ({
      setList(LIST) {
        setShowingList(LIST);
      }
    }));

    const renderListItem = item => {
      try {
        return !!item.item.Key ? (
          <TouchableOpacity
            style={Styles.listItemsContainerStyle}
            onPress={() => {
              onSelect(item.item);
              setListIsShown(false);
              setSearchText("");
              setShowingList(list);
            }}>
            <Text>{item.item.Key}</Text>
            <Text> / </Text>
            <Text>{item.item.Value}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={Styles.listItemsContainerStyle}
            onPress={() => {
              onSelect(item.item);
              setListIsShown(false);
              setSearchText("");
              setShowingList(list);
            }}>
            <Text>{item.item.value.Id}</Text>
            <Text> / </Text>
            <Text>{item.item.label}</Text>
          </TouchableOpacity>
        );
      } catch {}
    };

    const searchInList = text => {
      try {
        let TEXT = text
          .toString()
          .toLowerCase()
          .replace(/\s/g, '');
        if (!!TEXT) {
          let temp = list.filter(
            item =>
              (!!item.label &&
                item.label
                  .toLowerCase()
                  .replace(/\s/g, '')
                  .includes(TEXT)) ||
              (!!item.Value && item.Value.toLowerCase().includes(TEXT)) ||
              (!!item.value &&
                !!item.value.Id &&
                item.value.Id.toString().includes(TEXT)) ||
              (!!item.Key && item.Key.toString().includes(TEXT)),
          );
          setShowingList(temp);
        } else {
          setShowingList(list);
        }
      } catch (err) {
        console.warn('err', err);
      }
    };
    try {
      return (
        <View style={{width: pageWidth * 0.7}}>
          <TouchableOpacity
            style={Styles.containerStyle}
            onPress={() => {
                if(listIsShown){
                    setSearchText("");
                }
              setListIsShown(!listIsShown);
            }}>
            <Text style={{color: '#000', fontFamily:'IRANSansMobile_Light'}}>
              {placeholder}
            </Text>
          </TouchableOpacity>
          {listIsShown && (
            <View style={[Styles.listContainerStyle, {height: listHeight}]}
            >
              {hasSearchBox && (<View style={Styles.searchbarContainerStyle}>
                <TextInput
                  value={searchText}
                  placeholder={'جستجو کنید...'}
                  style={Styles.searchInputStyle}
                  onChangeText={text => {
                    setSearchText(text);
                    searchInList(text);
                  }}
                />
                {/* <FontAwesome name={"search"} style={Styles.searchIconStyle}/> */}
              </View>)}
              <ScrollView
                nestedScrollEnabled={true}
                scrollEnabled={!!showingList.length}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag">
                <FlatList
                  data={showingList}
                  renderItem={item => !!renderItem ? renderItem(item) : renderListItem(item)}
                  ListEmptyComponent={() => (
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}>
                      <Text style={{fontFamily:'IRANSansMobile_Light'}}>موردی یافت نشد.</Text>
                    </View>
                  )}
                />
              </ScrollView>
            </View>
          )}
        </View>
      );
    } catch {}
  },
);

const Styles = StyleSheet.create({
  searchbarContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: pageWidth * 0.7,
    height: 50,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  searchInputStyle: {
    width: '100%',
    height: 50,
    textAlign:"right",
    paddingHorizontal:10,
    fontFamily:'IRANSansMobile_Light'
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
  containerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    paddingHorizontal: 6,
  },
  upDownIconStyle: {
    fontSize: normalize(15),
    color: '#000',
    marginHorizontal: 8,
  },
  listContainerStyle: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  searchIconStyle: {
    fontSize: normalize(15),
    color: 'gray',
    marginHorizontal: 8,
  },
});

export default DropdownPicker;
