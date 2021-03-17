import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import * as Easing from 'react-native';
// props in input
//             onChangeText={() => setChangeText()}
//             value={''}
//             label={''}
//             autoCompleteType={''}
//             keyboardType={''}
//             dir={''}
//             errorInput={''}
//             img={require('')}
//             renderRightAccessory={<> </>}
const Input = (props) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const changeColor = useRef();
  const changeBorder = useRef();
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  useEffect(() => {
    if (!!props.errorInput && props.errorInput.length > 1) {
      changeColor.current.setNativeProps({
        style: {
          color: "yellow",
        },
      });
      changeBorder.current.setNativeProps({
        style: {
          borderColor:"yellow",
        },
      });
    }
  }, [props.errorInput]);
  useEffect(() => {
    if (!!props.value && props.value !== '' && props.value.length > 1) {
      focusAnimated();
    }
  }, []);
  const focusAnimated = () => {
    changeColor.current.setNativeProps({
      style: {
        color: "#660000",
      },
    });
    changeBorder.current.setNativeProps({
      style: {
        borderColor:"#660000",
      },
    });
    Animated.timing(scale, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: true, // To make use of native driver for performance
    }).start();
    // First set up animation
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.linear, // Easing is an additional import from react-native
      useNativeDriver: true, // To make use of native driver for performance
    }).start();
  };
  const blurAnimated = () => {
    if (!props.value) {
      changeColor.current.setNativeProps({
        style: {
          color: "gray",
        },
      });
      changeBorder.current.setNativeProps({
        style: {
          borderColor:"gray",
        },
      });
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear, // Easing is an additional import from react-native
        useNativeDriver: true, // To make use of native driver for performance
      }).start();
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true, // To make use of native driver for performance
      }).start();
    }
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 16,
        width: '90%',
        position: 'relative',
      }}>
      <TextInput
        style={[
          styles.input,
          {
            textAlign: props.dir ? props.dir : 'right',
            paddingRight: props.img || props.renderRightAccessory ? 24 : 10,
          },
          !!props.style && props.style,
        ]}
        maxLength={props.maxLength ? props.maxLength : 20}
        ref={changeBorder}
        multiline={props.multiline ? (props.multiline ? true : false) : false}
        onFocus={focusAnimated}
        onBlur={blurAnimated}
        onChangeText={props.onChangeText}
        // onChangeText={(text) => changeBorder.setNativeProps({text: text})}
        value={props.value ? props.value : ''}
        keyboardType={props.keyboardType ? props.keyboardType : 'default'}
        autoCompleteType={
          props.autoCompleteType ? props.autoCompleteType : 'off'
        }
      />
      {!!props.img && (
        <Image
          onLoad={() => <ActivityIndicator />}
          style={{
            width: 24,
            height: 24,
            position: 'absolute',
            right: 0,
            bottom: 18,
          }}
          source={props.img}
        />
      )}
      {!!props.renderRightAccessory && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 20,
            color: "gray",
            zIndex: -1,
            textAlign: 'right',
            paddingRight: 0,
          }}>
          {props.renderRightAccessory}
        </View>
      )}
      {!!props.errorInput && (
        <Text style={{position: 'absolute', right: 4, bottom: -10, fontSize: 12, color: "yellow"}}>
          {props.errorInput}
        </Text>
      )}
      <Animated.Text
        ref={changeColor}
        style={{
          fontFamily: "IRANSansMobile_Light",
          transform: [{translateY: spin}, {scale: scale}],
          position: 'absolute',
          right: 4,
          bottom: 20,
          color: "gray",
          zIndex: -1,
          textAlign: 'right',
          paddingRight: props.img || props.renderRightAccessory ? 24 : 0,
        }}>
        {props.label}
      </Animated.Text>
    </View>
  );
};
const styles = StyleSheet.create({
  section: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
    paddingBottom: 20,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: "gray",
    borderBottomWidth: 1,
    fontSize: 16,
    padding: 0,
    marginVertical: 8,
    fontFamily: 'IRANSansMobile',
  },
});
export default Input;
