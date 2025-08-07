import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from "react-native-reanimated";
import { Images } from "../Constants/Images";
const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
    opacity.value = withDelay(300, withTiming(1, { duration: 800 }));
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={Images.splashIcon}
        resizeMode="contain"
        style={[styles.image, imageStyle]}
      />

      <Animated.View style={[styles.textContainer, textStyle]}>
        <Text style={styles.text}>Santé</Text>
        <Text style={styles.text}>Diabète</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E60000",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  textContainer: {
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
  },
});
