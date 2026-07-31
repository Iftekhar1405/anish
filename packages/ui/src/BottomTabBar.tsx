import { Pressable, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "./utils/cn";

export interface TabItemConfig {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface BottomTabBarProps {
  items: TabItemConfig[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function BottomTabBar({ items, activeKey, onSelect, className }: BottomTabBarProps) {
  return (
    <View className={cn("flex-row border-t border-neutral-100 bg-white px-2 pb-2 pt-1", className)}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            className="flex-1 items-center gap-1 rounded-md py-2"
          >
            <Icon size={22} color={isActive ? "#15803D" : "#6B7280"} />
            <Text
              className={cn("text-xs font-medium", isActive ? "text-primary-700" : "text-neutral-500")}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
