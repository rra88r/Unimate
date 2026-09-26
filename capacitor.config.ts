import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV !== "production";

const config: CapacitorConfig = {
  appId: "app.unimate.student",
  appName: "UniMate",
  webDir: "public",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    // If CAPACITOR_SERVER_URL is set or in dev, point to server; otherwise fallback to bundled public webDir
    url: process.env.CAPACITOR_SERVER_URL || (isDev ? "http://localhost:3000" : undefined),
    cleartext: isDev,
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: false,
    scrollEnabled: true,
    preferredContentMode: "mobile",
    scheme: "UniMate",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#4f46e5",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
    },
  },
};

export default config;
