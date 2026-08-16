import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "./utils/cn";

export interface KeyboardScreenProps {
  children: ReactNode;
  /** Classes for the scroll view itself (usually just a background). */
  className?: string;
  /** Classes for the scrolled content (padding, gaps, centring). */
  contentContainerClassName?: string;
  /** Vertically centre the content when it's shorter than the screen (auth screens). */
  center?: boolean;
  /**
   * Add the bottom safe-area inset under the content. Only needed on screens
   * with no tab bar below them (auth screens) — inside the tab navigator the
   * tab bar already absorbs that inset.
   */
  safeAreaBottom?: boolean;
  /** Extra space under the content. */
  bottomPadding?: number;
}

/**
 * A scrollable screen body that keeps the focused input and the submit button
 * above the keyboard.
 *
 * `KeyboardAvoidingView` has to do this on Android too, not just iOS: apps now
 * draw edge-to-edge, so the window no longer resizes when the keyboard opens
 * and the old `adjustResize` behaviour can't be relied on.
 */
export function KeyboardScreen({
  children,
  className,
  contentContainerClassName,
  center = false,
  safeAreaBottom = false,
  bottomPadding = 24,
}: KeyboardScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView
        className={cn("flex-1", className)}
        contentContainerClassName={cn(
          center ? "grow justify-center" : undefined,
          contentContainerClassName,
        )}
        contentContainerStyle={{
          paddingBottom: bottomPadding + (safeAreaBottom ? insets.bottom : 0),
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
