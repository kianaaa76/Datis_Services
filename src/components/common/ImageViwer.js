import React from 'react';
import {Dimensions, Image, StyleSheet, View} from "react-native";
import RNViewer from "react-native-viewer";

const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;

const ImageViewer = ({width, height, imageUrl}) => {
    return (
        <View style={[Styles.imageContainerStyle,{width:width, height: height}]}>
            <RNViewer
                style={{width: width, height:height}}
                realSize={{width: ScreenWidth, height: ScreenHeight}}>
                <Image
                    style={[Styles.imageStyle,{width:width, height:height}]}
                    source={{uri: imageUrl}}/>
            </RNViewer>
        </View>
    )
}

const Styles = StyleSheet.create({
    imageContainerStyle: {
        alignSelf:'center',
        alignItems: 'center',
        justifyContent :'center',
        marginBottom:20
    },
    imageStyle: {
        alignSelf: 'center',
        width: 300,
        height:400
    },
})

export default ImageViewer;