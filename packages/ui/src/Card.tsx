import { View, type ViewProps } from "react-native";
import { cn } from "./utils/cn";

export interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, children, ...viewProps }: CardProps) {
  return (
    <View className={cn("rounded-lg bg-white p-4 shadow-md", className)} {...viewProps}>
      {children}
    </View>
  );
}
