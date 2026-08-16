import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./Button";
import { cn } from "./utils/cn";

export interface DialogProps {
  visible: boolean;
  title: string;
  description?: string;
  /** Custom body content (e.g. a form) rendered between the description and the footer buttons. */
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Dialog({
  visible,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: DialogProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const isWeb = Platform.OS === "web";
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Keeps a long form (and the footer buttons) on screen instead of overflowing off the bottom.
  const bodyMaxHeight = Math.round(height * 0.55);
  // Android draws edge-to-edge: without this the Cancel/Confirm row sits behind
  // the system navigation buttons and can't be tapped.
  const footerInset = isWeb ? 0 : insets.bottom;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className={cn("flex-1 bg-black/40", isWeb ? "items-center justify-center" : "justify-end")}
          onPress={onCancel}
        >
          <Animated.View
            className={cn("w-full", isWeb ? "max-w-sm" : "")}
            style={{
              opacity: progress,
              transform: isWeb
                ? [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }]
                : [
                    {
                      translateY: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [24, 0],
                      }),
                    },
                  ],
            }}
          >
            <Pressable
              onPress={(event) => event.stopPropagation()}
              style={{ paddingBottom: (isWeb ? 24 : 32) + footerInset }}
              className={cn(
                "w-full bg-white px-6 pt-6 shadow-lg",
                isWeb ? "rounded-lg" : "rounded-t-xl",
              )}
            >
              <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
              {description ? (
                <Text className="mt-2 text-sm text-neutral-500">{description}</Text>
              ) : null}
              {children ? (
                <ScrollView
                  className="mt-4"
                  style={{ maxHeight: bodyMaxHeight }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>
              ) : null}
              <View className="mt-6 flex-row justify-end gap-3">
                <Button variant="secondary" size="sm" onPress={onCancel} disabled={loading}>
                  {cancelLabel}
                </Button>
                <Button
                  variant={destructive ? "destructive" : "primary"}
                  size="sm"
                  onPress={onConfirm}
                  loading={loading}
                >
                  {confirmLabel}
                </Button>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
