import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "./utils/cn";

export interface TopBarProps {
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function TopBar({ title, actions, className }: TopBarProps) {
  return (
    <View
      className={cn(
        "h-16 flex-row items-center justify-between border-b border-neutral-100 bg-white px-6",
        className,
      )}
    >
      <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      {actions ? <View className="flex-row items-center gap-3">{actions}</View> : null}
    </View>
  );
}
