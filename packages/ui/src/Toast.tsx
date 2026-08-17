import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react-native";
import { cn } from "./utils/cn";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_ICON: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const VARIANT_COLOR: Record<ToastVariant, string> = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",
};

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: "border-success",
  error: "border-error",
  warning: "border-warning",
  info: "border-info",
};

const AUTO_DISMISS_MS = 4000;

let idCounter = 0;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
    setToasts([]);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      idCounter += 1;
      const id = `toast_${idCounter}`;
      setToasts((current) => [...current, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/*
        Hosted in its own `Modal` on purpose. `Dialog` — which every master-data
        create/edit form lives in — is itself a `Modal`, i.e. a separate native
        window drawn above the whole app. A toast rendered in the normal view
        tree is therefore *invisible behind an open dialog*, no matter what
        zIndex/elevation it has, which silently hid every save error the forms
        reported. A nested Modal is the only thing that reliably draws on top.

        Toasts sit at the *top* of the screen: on phones a Dialog is a bottom
        sheet, so the bottom is exactly where the form and its buttons are.
      */}
      <Modal
        visible={toasts.length > 0}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismissAll}
      >
        {/*
          Android routes all touches to the topmost modal window, so this one
          would swallow taps on the dialog beneath it while a toast is up. Any
          tap therefore clears the toasts immediately and the next tap lands
          normally — the window is never in the way for more than one tap.
        */}
        <Pressable
          className="flex-1"
          onPress={dismissAll}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notifications"
        >
          <View
            pointerEvents="box-none"
            style={{ paddingTop: insets.top + 12 }}
            className="absolute inset-x-0 top-0 items-center px-4"
          >
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
            ))}
          </View>
        </Pressable>
      </Modal>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const Icon = VARIANT_ICON[toast.variant];
  const translateY = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }], opacity }}
      className={cn(
        "mt-2 w-full max-w-sm flex-row items-center rounded-lg border-l-4 bg-white p-4 shadow-lg",
        VARIANT_BORDER[toast.variant],
      )}
    >
      <Icon size={20} color={VARIANT_COLOR[toast.variant]} />
      <Text className="ml-3 flex-1 text-sm text-neutral-900">{toast.message}</Text>
      <Pressable
        onPress={onDismiss}
        hitSlop={14}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
      >
        <X size={16} color="#6B7280" />
      </Pressable>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
