import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
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
    ...textInputProps
  },
  ref,
) {
  const isDisabled = editable === false;
  const hasError = Boolean(error);

  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? <Text className="mb-1 text-sm font-medium text-neutral-700">{label}</Text> : null}
      <TextInput
        ref={ref}
        editable={!isDisabled}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : undefined}
        placeholderTextColor="#9CA3AF"
        accessibilityLabel={label}
        accessibilityHint={error ?? helperText}
        accessibilityState={{ disabled: isDisabled }}
        aria-invalid={hasError}
        className={cn(
          "rounded-md border px-4 py-3 text-base text-neutral-900",
          multiline ? "min-h-24" : "",
          hasError ? "border-error" : "border-neutral-300 focus:border-primary-500",
          isDisabled ? "bg-neutral-100 text-neutral-500" : "",
          className,
        )}
        {...textInputProps}
      />
      {hasError ? (
        <Text className="mt-1 text-sm text-error">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-sm text-neutral-500">{helperText}</Text>
      ) : null}
    </View>
  );
});
