import { forwardRef, useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { cn } from "./utils/cn";

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    containerClassName,
    className,
    editable,
    multiline,
    secureTextEntry,
    autoCapitalize,
    autoCorrect,
    ...textInputProps
  },
  ref,
) {
  const isDisabled = editable === false;
  const hasError = Boolean(error);
  const isSecure = Boolean(secureTextEntry);
  const [revealed, setRevealed] = useState(false);

  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? <Text className="mb-1 text-sm font-medium text-neutral-700">{label}</Text> : null}
      <View className="justify-center">
        <TextInput
          ref={ref}
          editable={!isDisabled}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : undefined}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure && !revealed}
          // A password must never be auto-capitalised or auto-corrected — the
          // keyboard would silently change what the user typed.
          autoCapitalize={isSecure ? "none" : autoCapitalize}
          autoCorrect={isSecure ? false : autoCorrect}
          accessibilityLabel={label}
          accessibilityHint={error ?? helperText}
          accessibilityState={{ disabled: isDisabled }}
          aria-invalid={hasError}
          className={cn(
            "rounded-md border px-4 py-3 text-base text-neutral-900",
            multiline ? "min-h-24" : "",
            isSecure ? "pr-14" : "",
            hasError ? "border-error" : "border-neutral-300 focus:border-primary-500",
            isDisabled ? "bg-neutral-100 text-neutral-500" : "",
            className,
          )}
          {...textInputProps}
        />
        {isSecure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            accessibilityState={{ selected: revealed }}
            className="absolute right-2 h-11 w-11 items-center justify-center"
          >
            {revealed ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <Text className="mt-1 text-sm text-error">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-sm text-neutral-500">{helperText}</Text>
      ) : null}
    </View>
  );
});
