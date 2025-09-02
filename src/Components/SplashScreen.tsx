import Constants from "expo-constants";
import { Image } from "expo-image";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Images } from "../Constants/Images";
import CardWithBubbles from "./SplashBloodDrop";


const { width, height } = Dimensions.get("window");
const shortest = Math.min(width, height);
const isTablet = shortest >= 600; // seuil simple pour tabletter
const logoSize = isTablet ? shortest * 0.35 : shortest * 0.55; // logo plus petit sur tablette

export default function SplashScreen() {

  const version = Constants.expoConfig?.version;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Image
        source={Images.splashIconDecouper}
        style={styles.image}
        contentFit="contain"
      />
      <View style={[styles.versionContainer, { bottom: 20 + insets.bottom }]}>
        <ActivityIndicator size={isTablet ? "large" : "small"} color="#fff" animating={true} />
        <Text style={styles.versionText}>Version : {version}</Text>
      </View>
      <View style={styles.bulleSpace}>
        {/* 3 bulles animées avec rebond */}
        <CardWithBubbles height={height * 0.4} width={width} />
      </View>

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
    width: logoSize,
    height: logoSize,
    marginBottom: 20,
  },
  versionContainer: {
    position : "absolute",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  versionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  bulleSpace: {
    width: "100%",
    height: height * (isTablet ? 0.35 : 0.4),
    // backgroundColor: "#f00", // debug
    zIndex: 1,
    position: "relative",
    justifyContent: "flex-end",
  },

});
