import { ActivityIndicator, Pressable, Text, View, type PressableProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "./utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends Omit<PressableProps, "children" | "disabled"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading lucide icon — keeps labels like "New booking" off ASCII glyphs. */
  icon?: LucideIcon;
  className?: string;
}

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 active:bg-primary-700",
  secondary: "bg-neutral-100 active:bg-neutral-300",
  outline: "border border-primary-600 bg-transparent active:bg-primary-50",
  destructive: "bg-error active:opacity-80",
  ghost: "bg-transparent active:bg-primary-50",
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-neutral-900",
  outline: "text-primary-600",
  destructive: "text-white",
  ghost: "text-primary-600",
};

// min-h keeps every button at/above the 44px minimum touch target.
const SIZE_CONTAINER: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2",
  md: "min-h-12 px-6 py-3",
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
};

const SIZE_ICON: Record<ButtonSize, number> = {
  sm: 16,
  md: 18,
};

const VARIANT_ICON_COLOR: Record<ButtonVariant, string> = {
  primary: "#FFFFFF",
  secondary: "#111827",
  outline: "#15803D",
  destructive: "#FFFFFF",
  ghost: "#15803D",
};

const SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: "#FFFFFF",
  secondary: "#111827",
  outline: "#15803D",
  destructive: "#FFFFFF",
  ghost: "#15803D",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  className,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-md",
        VARIANT_CONTAINER[variant],
        SIZE_CONTAINER[size],
        isDisabled && "opacity-50",
        className,
      )}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <>
          {Icon ? (
            <View>
              <Icon size={SIZE_ICON[size]} color={VARIANT_ICON_COLOR[variant]} />
            </View>
          ) : null}
          <Text className={cn("font-semibold", VARIANT_TEXT[variant], SIZE_TEXT[size])}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
