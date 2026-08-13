import { Text, View } from "react-native";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react-native";
import { Card } from "./Card";
import { cn } from "./utils/cn";

const TREND_COLOR = { up: "#16A34A", down: "#DC2626" } as const;

export interface StatCardTrend {
  direction: "up" | "down";
  label: string;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: StatCardTrend;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("flex-row items-center justify-between", className)}>
      <View>
        <Text className="text-sm font-medium text-neutral-500">{label}</Text>
        <Text className="mt-1 text-2xl font-bold text-neutral-900">{value}</Text>
        {trend ? (
          <View className="mt-1 flex-row items-center gap-1">
            {trend.direction === "up" ? (
              <TrendingUp size={14} color={TREND_COLOR.up} />
            ) : (
              <TrendingDown size={14} color={TREND_COLOR.down} />
            )}
            <Text
              className={cn(
                "text-sm font-medium",
                trend.direction === "up" ? "text-success" : "text-error",
              )}
            >
              {trend.label}
            </Text>
          </View>
        ) : null}
      </View>
      {Icon ? (
        <View className="rounded-full bg-primary-50 p-3">
          <Icon size={24} color="#15803D" />
        </View>
      ) : null}
    </Card>
  );
}
