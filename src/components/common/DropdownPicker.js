import React,{useState} from "react";
import {View, TextInput, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, FlatList} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";


const pageWidth = Dimensions.get("screen").width;
const pageHeight = Dimensions.get("screen").height;

const DropdownPicker = ({placeholder, list, onSelect, listHeight}) => {



    const [listIsShown, setListIsShown] = useState(false);
    const [showingList, setShowingList] = useState(list);
    const [searchText, setSearchText] = useState("");
    const [selectedItemName, setSelecedItemName] = useState("");

    const renderListItem = (item) => {
        return(!!item.item.Key?(
            <TouchableOpacity
                style={Styles.listItemsContainerStyle}
                onPress={()=> {
                    setSelecedItemName(item.item.Value);
                    onSelect(item.item);
                    setListIsShown(false);
                    setShowingList(list);
                }}
            >
                <Text>{item.item.Value}</Text>
            </TouchableOpacity>
            ):(
            <TouchableOpacity
                style={Styles.listItemsContainerStyle}
                onPress={()=> {
                    setSelecedItemName(item.item.label);
                    onSelect(item.item);
                    setListIsShown(false);
                    setShowingList(list);
                }}
            >
                <Text>{item.item.label}</Text>
            </TouchableOpacity>
        )
        )
    }

    const searchInList = (text)=>{
        let TEXT = text.toLowerCase().replace(/\s/g, '');
        if (!!TEXT){
            let temp = list.filter(item=>item.label.toLowerCase().replace(/\s/g, '').includes(TEXT))
            setShowingList(temp);
        } else {
            setShowingList(list);
        }
    }

    return(
        <View style={{width:pageWidth*0.7}}>
            <TouchableOpacity style={Styles.containerStyle}
            onPress={()=> {
                setListIsShown(!listIsShown)
            }}>
                <Text style={{color: !!selectedItemName ? "#000" : "gray"}}>
                    {!!selectedItemName ? selectedItemName: placeholder}
                </Text>
                {listIsShown?(
                    <FontAwesome name={"chevron-up"} style={Styles.upDownIconStyle} onPress={()=> {
                        setShowingList(list);
                        setSearchText("");
                        setListIsShown(false);
                    }}/>
                ):(
                    <FontAwesome name={"chevron-down"} style={Styles.upDownIconStyle}/>
                )}
            </TouchableOpacity>
            {listIsShown && (
                <View style={[Styles.listContainerStyle, {height: listHeight}]}>
                    <View style={Styles.searchbarContainerStyle}>
                        <TextInput
                            value={searchText}
                            placeholder={"جستجو کنید..."}
                            style={Styles.searchInputStyle}
                            onChangeText={text => {
                                setSearchText(text);
                                searchInList(text)
                            }}/>
                        <FontAwesome name={"search"} style={Styles.searchIconStyle}/>
                    </View>
                    <ScrollView nestedScrollEnabled={true} scrollEnabled={!!showingList.length}>
                        <FlatList
                            data={showingList}
                            renderItem={(item)=>renderListItem(item)}
                            ListEmptyComponent={()=>(
                                <View style={{justifyContent:"center", alignItems:"center", height:"100%"}}>
                                    <Text>موردی یافت نشد.</Text>
                                </View>
                            )}
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const Styles= StyleSheet.create({
    searchbarContainerStyle:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"flex-end",
        width:pageWidth*0.7,
        height:50,
        borderBottomWidth:1,
        borderColor:"gray",
    },
    searchInputStyle:{
        width:pageWidth*0.6,
        height: 50,
    },
    listItemsContainerStyle:{
        width:"100%",
        height:30,
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor:"#fff",
        paddingHorizontal:8,
        borderBottomWidth: 1,
        borderBottomColor:"gray"
    },
    containerStyle:{
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems:"center",
        borderWidth:1,
        borderColor:"#000",
        borderRadius:10,
        backgroundColor:"#fff",
        width:"100%",
        height:50
    },
    upDownIconStyle:{
        fontSize:15,
        color:"#000",
        marginHorizontal:8
    },
    listContainerStyle:{
        width:"100%",
        backgroundColor:"#fff",
        borderWidth:1,
        borderColor: "#000",
        borderRadius:10,
        overflow:"hidden",
        marginBottom:10
    },
    searchIconStyle:{
        fontSize:15,
        color:"gray",
        marginHorizontal:8
    }
})

export default DropdownPicker;