import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    FlatList,
} from 'react-native';
import { TouchableOpacity} from 'react-native-gesture-handler'

const pageWidth = Dimensions.get('screen').width;

const DropdownPicker = ({placeholder, list, onSelect, selectedValue, showList, setShowList}) => {
    const renderListItem = item => {
        return (
            <TouchableOpacity
                style={Styles.listItemsContainerStyle}
                onPress={() => {
                    onSelect(item);
                    setShowList(false);
                }}>
                <Text style={{fontFamily:"IRANSansMobile_Light"}}>{item.name}</Text>
            </TouchableOpacity>
        )
    };
    return (
        <View style={{width: pageWidth * 0.4}}>
            <TouchableOpacity
                style={Styles.containerStyle}
                onPress={() => {
                    setShowList(!showList);
                }}>
                <Text style={{color: '#000', fontFamily:"IRANSansMobile_Light"}}>
                    {!!selectedValue ? selectedValue : placeholder}
                </Text>
            </TouchableOpacity>
            {showList && (
                <View
                    style={{
                        width: '100%',
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#C0C0C0',
                        borderRadius: 10,
                        overflow: 'hidden',
                        marginBottom: 10,
                        height: 200,
                        position:"absolute",
                        top:50,
                        elevation:5,
                        zIndex: 999999999
                    }}>
                        <FlatList
                            keyExtractor={item=>item.id.toString()}
                            data={list}
                            renderItem={({item, index}) => (
                                renderListItem(item)
                                )}
                            ListEmptyComponent={() => (
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                    }}>
                                    <Text>موردی یافت نشد.</Text>
                                </View>
                            )}
                        />
                </View>
            )}
        </View>
    );
}

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
        width: pageWidth*0.4,
        height: 50,
    },
    listItemsContainerStyle: {
        width: '100%',
        paddingVertical: 5,
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        zIndex:999
    },
    containerStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C0C0C0',
        borderRadius: 10,
        backgroundColor: '#fff',
        width: '100%',
        height: 50,
        paddingHorizontal: 6,
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
});

export default DropdownPicker;
