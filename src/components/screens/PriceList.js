import React,{useState} from "react";
import {View, StyleSheet, FlatList, Text, TouchableOpacity, TextInput, Dimensions} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {normalize} from "../utils/utilities";
import Header from "../common/Header";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const pageWidth = Dimensions.get('screen').width;
const pageHeight = Dimensions.get('screen').height;

const PriceList = () => {
    const [partList, setPartList]=useState([
        {
            id:1,
            name:"قطعه تست",
            price:150000,
            isExpanded:false
        },
        {
            id:2,
            name:"قطعه تست2",
            price:1510000,
            isExpanded:false
        }
    ]);

    const renderListItem = (item,index)=>{
        return(
        <TouchableOpacity elevation={5} style={Styles.listItemContainerStyle} onPress={()=>{
            let tempList = [...partList];
            tempList.splice(index, 1, {
                id : item.id,
                name: item.name,
                price: item.price,
                isExpanded: !item.isExpanded
            });
            setPartList(tempList);
        }}>
            {item.isExpanded ? (
                <View style={Styles.partListItemContainerStyle}>
                    <Text>
                        {item.name}
                    </Text>
                    <Text>
                        {item.price}
                    </Text>
                </View>
            ):( <Text>{item.name}</Text>)}
        </TouchableOpacity>
    )};

    return(
        <View style={Styles.containerStyle}>
            <Header
                headerText="لیست قطعات"
                leftIcon={
                    <Icon
                        name="refresh"
                        style={{
                            fontSize: normalize(30),
                            color: '#dadfe1',
                        }}
                        onPress={() => {}}
                    />
                }
            />
            <View style={{flex:1, padding:5}}>
            <View style={Styles.searchInputContainerStyle}>
                <TextInput
                    onChangeText={searchText=>{}}
                    style={Styles.searchInputStyle}
                    placeholder={'قطعه مورد نظر خود را جستجو کنید...'}
                />
                <FontAwesome
                    name={'search'}
                    style={{fontSize: 25, color: '#000', width: '10%'}}
                />
            </View>
            <FlatList
                data={partList}
                renderItem={(item,index) => renderListItem(item,index)}
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
        </View>
    )
}

const Styles = StyleSheet.create({
    containerStyle:{
        alignItems: 'center',
        flex:1
    },
    listItemContainerStyle:{
        width:"100%",
        flexDirection:"row",
        height: 100,
        backgroundColor: "red",
        marginBottom: 10
    },
    partListItemContainerStyle:{
        width:"100%",
        flexDirection:"row"
    },
    searchInputContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: pageWidth * 0.9,
        height: pageHeight * 0.08,
        borderRadius: 10,
        borderColor: '#000',
        marginBottom: 10,
        padding: 5,
        elevation: 5,
    },
    searchInputStyle: {
        width: '85%',
        padding: 5,
        marginRight: '5%',
    },
})

export default PriceList;