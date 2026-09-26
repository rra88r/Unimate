import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * Returns true if running natively inside iOS/iPadOS/Android Capacitor container.
 */
export const isNativePlatform = (): boolean => {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
};

/**
 * Trigger subtle native physical haptic vibration for interactive actions.
 */
export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
  if (isNativePlatform()) {
    try {
      await Haptics.impact({ style });
    } catch {}
  }
};

/**
 * Trigger notification haptics (success / warning / error) on goal completion.
 */
export const triggerHapticNotification = async (type: NotificationType = NotificationType.Success) => {
  if (isNativePlatform()) {
    try {
      await Haptics.notification({ type });
    } catch {}
  }
};

/**
 * Dynamically adjust native iOS status bar style to match active light/dark theme.
 */
export const setNativeStatusBar = async (isDark: boolean) => {
  if (isNativePlatform()) {
    try {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light,
      });
    } catch {}
  }
};
