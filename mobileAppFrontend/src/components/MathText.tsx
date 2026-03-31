import { useMemo, useState } from "react";
import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import WebView from "react-native-webview";
import { SecureText } from "@/components/SecureText";
import { buildMathHtml, hasMathMarkup } from "@/lib/math-render";

function extractContainerStyle(style?: TextStyle): ViewStyle {
  if (!style) {
    return {};
  }

  return {
    margin: style.margin,
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    marginHorizontal: style.marginHorizontal,
    marginVertical: style.marginVertical,
    flex: style.flex,
    flexBasis: style.flexBasis,
    flexGrow: style.flexGrow,
    flexShrink: style.flexShrink,
    alignSelf: style.alignSelf,
    width: style.width,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
  };
}

function normalizeTextStyle(style?: TextStyle): TextStyle | undefined {
  if (!style) {
    return undefined;
  }

  return {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    color: style.color,
    fontFamily: style.fontFamily,
    textAlign: style.textAlign,
  };
}

export function MathText({
  value,
  style,
  containerStyle,
}: {
  value: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const flattenedStyle = StyleSheet.flatten(style);
  const [contentHeight, setContentHeight] = useState(
    typeof flattenedStyle?.lineHeight === "number"
      ? flattenedStyle.lineHeight + 4
      : typeof flattenedStyle?.fontSize === "number"
        ? Math.round(flattenedStyle.fontSize * 1.6)
        : 28,
  );
  const [hasRenderError, setHasRenderError] = useState(false);
  const isMath = useMemo(() => hasMathMarkup(value), [value]);
  const html = useMemo(
    () => buildMathHtml(value, normalizeTextStyle(flattenedStyle)),
    [flattenedStyle, value],
  );

  if (!isMath || hasRenderError) {
    return <SecureText style={style}>{value}</SecureText>;
  }

  return (
    <View style={[extractContainerStyle(flattenedStyle), containerStyle]}>
      <View pointerEvents="none" style={[styles.webviewWrap, { minHeight: contentHeight }]}>
        <WebView
          source={{ html }}
          originWhitelist={["*"]}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled
          automaticallyAdjustContentInsets={false}
          onError={() => setHasRenderError(true)}
          onMessage={(event) => {
            const nextHeight = Number(event.nativeEvent.data);

            if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
              return;
            }

            setContentHeight((currentHeight) =>
              Math.abs(currentHeight - nextHeight) > 1 ? Math.ceil(nextHeight) : currentHeight,
            );
          }}
          style={[styles.webview, { height: contentHeight }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webviewWrap: {
    width: "100%",
    backgroundColor: "transparent",
  },
  webview: {
    width: "100%",
    backgroundColor: "transparent",
  },
});
