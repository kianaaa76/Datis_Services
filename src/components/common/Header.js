import React, { Component } from "react";
import { View, StyleSheet, Text, Dimensions, Platform } from "react-native";
import {normalize, getFontsName} from "../utils/utilities";
import {BackIosIcon, RefreshIcon} from "../../assets/icons";

const pageWidth = Dimensions.get("screen").width;
const pageHeight = Dimensions.get("screen").height;

export default class extends Component {
  constructor(props) {
    super(props);
    this.renderHeaderLeft = this.renderHeaderLeft.bind(this);
    this.renderHeaderRight = this.renderHeaderRight.bind(this);
  }

  renderHeaderLeft = () => {
    const { leftIcon } = this.props;
    return leftIcon;
  };

  renderHeaderRight = ()=>{
    const {rightIcon} = this.props;
    return rightIcon;
  }

  render() {
    const { headerText, leftIcon, rightIcon, onBackPress, isCurrentRootHome } = this.props;
    return (
      <View style={Styles.headercontainerStyle}>
        <View style={Styles.headerContentStyle}>
          <View style={{ justifyContent:'center', height:"100%", flexDirection:"row", alignItems:"center" }}>
            {Platform.OS == "ios" && !isCurrentRootHome && (
              <View style={{marginRight:10, justifyContent:"center", alignItems:"center"}}>
              {BackIosIcon({
              onPress:()=>onBackPress()
            })}
            </View>
            )} 
            {!!leftIcon && this.renderHeaderLeft()}
          </View>
          <View style={Styles.headerTextContainerStyle}>
            <Text style={Styles.headerTitleStyle}>{headerText}</Text>
            {!!rightIcon && this.renderHeaderRight()}
          </View>
        </View>
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  headercontainerStyle: {
    justifyContent: "center",
    alignItems: "center",
    height: pageHeight*0.075,
    width: pageWidth,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "#660000",

  },
  headerContentStyle: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleStyle: {
    fontSize: normalize(15),
    color: "#dadfe1",
    fontFamily:getFontsName("IRANSansMobile")
  },
  headerTextContainerStyle: {
    flexDirection: "row",
    justifyContent:"flex-end",
    alignItems:"center"
  }
});
