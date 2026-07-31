import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { Button } from "./Button";
import { cn } from "./utils/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn("items-center justify-center px-6 py-12", className)}>
      {Icon ? (
        <View className="mb-4 rounded-full bg-neutral-100 p-4">
          <Icon size={28} color="#6B7280" />
        </View>
      ) : null}
      <Text className="text-lg font-semibold text-neutral-900">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-neutral-500">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" size="sm" onPress={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
