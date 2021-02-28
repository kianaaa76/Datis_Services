import React,{useEffect, useState} from "react";
import {View, StyleSheet, FlatList, TouchableOpacity, Text, TextInput, Dimensions, ActivityIndicator} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const pageHeight = Dimensions.get("screen").height;
const pageWidth = Dimensions.get("screen").width;

const ServicesTab = ({projectList})=>{
    const [services, setServices] = useState(projectList);

    const handleSearch = (searchValue)=>{
        if (!!searchValue) {
            let tmp = projectList.filter(item => item.ID.toString().substr(0,searchValue.length)=== searchValue);
            setServices(tmp);
        } else {
            setServices(projectList);
        }
    }

    return(
        <View style={{flex:1}}>
            <View style={Styles.searchbarContainerStyle}>
                <TextInput
                    style={Styles.textinputStyle}
                    placeholder={"شماره پرونده مورد نظر خود را جستجو کنید..."}
                    onChangeText={(text)=>{
                        handleSearch(text);
                    }}
                />
                <FontAwesome
                    name={'search'}
                    style={{fontSize: 25, color: '#000'}}
                />
            </View>
            <FlatList data={services} renderItem={({item}) => (
                <TouchableOpacity style={Styles.listItemContainerStyle} onPress={() => {
                }}>
                    <View style={Styles.cardSingleRowStyle}>
                        <View style={Styles.cardSingleItemStyle}>
                            <Text style={Styles.cardTextStyle}>
                                {item.DoneTime}
                            </Text>
                            <Text style={Styles.cardLabelTextStyle}>
                                تاریخ:
                            </Text>
                        </View>
                        <View style={Styles.cardSingleItemStyle}>
                            <Text style={Styles.cardTextStyle}>
                                {item.ID}
                            </Text>
                            <Text style={Styles.cardLabelTextStyle}>
                                شماره پرونده:
                            </Text>
                        </View>
                    </View>
                    <View style={Styles.cardSingleRowStyle}>
                        <View style={Styles.cardSingleItemStyle}>
                            <Text style={Styles.cardTextStyle}>
                                {item.InvoiceSum}
                            </Text>
                            <Text style={Styles.cardLabelTextStyle}>
                                جمع فاکتور:
                            </Text>
                        </View>
                        <View style={Styles.cardSingleItemStyle}>
                            <Text style={Styles.cardTextStyle}>
                                {item.AmountRecieved}
                            </Text>
                            <Text style={Styles.cardLabelTextStyle}>
                                مبلغ دریافتی:
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
                       ListEmptyComponent={() => (
                           <View style={{
                               flex: 1,
                               height: pageHeight * 0.6,
                               justifyContent: "center",
                               alignItems: "center"
                           }}>
                               <Text style={{fontFamily: 'IRANSansMobile_Light'}}>
                                   موردی یافت نشد.
                               </Text>
                           </View>
                       )} keyExtractor={item=>item.ID}/>
        </View>
    );
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        paddingTop: 30,
        backgroundColor: '#fff'
    },
    cardSingleRowStyle:{
        flexDirection:"row",
        width:"100%",
        alignItems:"center",
    },
    cardSingleItemStyle:{
        flexDirection:"row",
        width:"50%",
        alignItems:"center",
        justifyContent:"flex-end"
    },
    listItemContainerStyle:{
        width:"96%",
        backgroundColor:"#fff",
        elevation:5,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
        alignSelf:"center",
        padding: 10
    },
    searchbarContainerStyle: {
        marginTop:10,
        width:"94%",
        height:pageHeight*0.08,
        backgroundColor: "#fff",
        borderRadius:15,
        elevation:5,
        alignSelf:"center",
        marginBottom:10,
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
    cardTextStyle:{
        fontFamily:"IRANSansMobile_Light",
    },
    cardLabelTextStyle:{
        fontFamily:"IRANSansMobile_Medium",
        marginLeft:5
    }
})

export default ServicesTab;
