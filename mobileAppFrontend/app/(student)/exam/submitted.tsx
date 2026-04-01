import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, shadows } from "@/lib/theme";

const learningMsLogo = require("../../../assets/learning-ms-logo.png");
const REDIRECT_DELAY_MS = 2200;

export default function ExamSubmittedScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(student)/(tabs)/results");
    }, REDIRECT_DELAY_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.brandMarkWrap}>
          <Image source={learningMsLogo} style={styles.brandImage} resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.brandTop}>Learning</Text>
          <Text style={styles.brandBottom}>MS</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
            </View>
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>Шалгалт амжилттай илгээгдлээ</Text>
            <Text style={styles.description}>
              Үр дүнг хугацаа дууссаны дараа харах боломжтой
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    paddingBottom: 18,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },
  brandMarkWrap: {
    height: 32,
    width: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  brandImage: {
    width: 43,
    height: 32,
  },
  brandTop: {
    fontFamily: fonts.display.medium,
    fontSize: 19,
    color: colors.textPrimary,
  },
  brandBottom: {
    marginTop: -2,
    fontFamily: fonts.display.medium,
    fontSize: 19,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  card: {
    alignSelf: "center",
    width: 350,
    height: 160,
    justifyContent: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#D7D0FF",
    backgroundColor: "#F7F4FF",
    paddingHorizontal: 28,
    paddingVertical: 20,
    ...shadows.card,
  },
  iconOuter: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: "#E8E0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: "#F4EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    marginTop: 16,
    gap: 10,
    maxWidth: 260,
  },
  title: {
    fontFamily: fonts.display.semibold,
    fontSize: 16,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 19,
    color: "#8F8A99",
  },
});
