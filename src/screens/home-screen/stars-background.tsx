import MaskedViewOrig from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import ms from "ms";
import React, { FC, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleProp,
  ViewStyle,
} from "react-native";
import { images } from "@breathly/assets/images";
import { widestDeviceDimension } from "@breathly/design/metrics";
import { animate } from "@breathly/utils/animate";

const BACKGROUND_ANIM_DURATION = ms("2 min");

// RN 0.73+ typings are incompatible with MaskedView's export; cast to valid JSX component.
const MaskedView = MaskedViewOrig as unknown as React.ComponentType<
  React.PropsWithChildren<{ style?: object; maskElement: React.ReactNode }>
>;

interface Props {
  fadeIn?: boolean;
  onImageLoaded?: () => unknown;
  size?: number;
}

export const StarsBackground: FC<Props> = ({
  fadeIn,
  onImageLoaded,
  size = widestDeviceDimension * 0.6,
}) => {
  const backgroundAnimValue = useRef(new Animated.Value(0)).current;
  const fadeInAnimValue = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimValue, {
          toValue: 1,
          duration: BACKGROUND_ANIM_DURATION,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(backgroundAnimValue, {
          toValue: 0,
          duration: BACKGROUND_ANIM_DURATION,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  });

  const backgroundTransform = [
    {
      translateX: backgroundAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -size],
        extrapolate: "clamp",
      }),
    },
    {
      translateY: backgroundAnimValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -size],
        extrapolate: "clamp",
      }),
    },
  ];

  const handleLoad = () => {
    onImageLoaded?.();
    if (fadeIn) {
      animate(fadeInAnimValue, { toValue: 1, duration: 600 }).start();
    }
  };

  // Animated.View accepts animated transform; RN 0.73 ViewStyle typings don't include AnimatedInterpolation.
  const containerStyle = [
    { height: size * 2, width: size * 2 },
    { transform: backgroundTransform },
  ] as StyleProp<ViewStyle>;

  return (
    <Animated.View className="absolute w-full" style={{ height: size, opacity: fadeInAnimValue }}>
      <MaskedView
        style={{ flex: 1 }}
        maskElement={
          <LinearGradient
            colors={["black", "transparent"]}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0, y: 0.9 }}
          />
        }
      >
        <Animated.View style={containerStyle}>
          <Image
            className="absolute top-0 z-10 h-full w-full"
            source={images.starsBackgroundHorizontal}
            resizeMode="cover"
            onLoad={handleLoad}
          />
        </Animated.View>
      </MaskedView>
    </Animated.View>
  );
};
