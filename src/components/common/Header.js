import React, { Component } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";

const pageWidth = Dimensions.get("screen").width;
const pageHeight = Dimensions.get("screen").height;

export default class extends Component {
  constructor(props) {
    super(props);
    this.renderHeaderLeft = this.renderHeaderLeft.bind(this);
  }

  renderHeaderLeft = () => {
    const { leftIcon } = this.props;
    return leftIcon;
  };

  render() {
    const { headerText, leftIcon } = this.props;
    return (
      <View style={Styles.headercontainerStyle}>
        <View style={Styles.headerContentStyle}>
          <View style={{ width: 100, justifyContent:'center', height:"100%" }}>
            {!!leftIcon && this.renderHeaderLeft()}
          </View>
          <View style={Styles.headerTextContainerStyle}>
            <Text style={Styles.headerTitleStyle}>{headerText}</Text>
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
    fontSize: 17,
    fontWeight:"bold",
    color: "#dadfe1"
  },
  headerTextContainerStyle: {
    width:"50%"
  }
});
