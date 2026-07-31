import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { cn } from "./utils/cn";

export interface SpinnerProps {
  label?: string;
  color?: string;
  className?: string;
}

export function Spinner({ label, color = "#15803D", className }: SpinnerProps) {
  return (
    <View className={cn("items-center justify-center py-8", className)}>
      <ActivityIndicator color={color} />
      {label ? <Text className="mt-2 text-sm text-neutral-500">{label}</Text> : null}
    </View>
  );
}

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View className={cn("rounded-md bg-neutral-200", className)} style={{ opacity }} />;
}
