import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { cn } from "./utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends Omit<PressableProps, "children" | "disabled"> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
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

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
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
  className,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-md",
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
        <Text className={cn("font-semibold", VARIANT_TEXT[variant], SIZE_TEXT[size])}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}
