import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { isNativePlatform, triggerHaptic, triggerHapticNotification, setNativeStatusBar } from "../src/lib/capacitor";

describe("iOS & iPad Capacitor Packaging Verification", () => {
  const rootDir = path.resolve(__dirname, "..");

  it("should have capacitor.config.ts with required bundle ID and app title", () => {
    const configPath = path.join(rootDir, "capacitor.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);

    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("app.unimate.student");
    expect(content).toContain("UniMate");
    expect(content).toContain("SplashScreen");
    expect(content).toContain("StatusBar");
  });

  it("should have generated native Xcode project structure in ios/", () => {
    const xcodeProj = path.join(rootDir, "ios", "App", "App.xcodeproj");
    const infoPlist = path.join(rootDir, "ios", "App", "App", "Info.plist");
    const appDelegate = path.join(rootDir, "ios", "App", "App", "AppDelegate.swift");

    expect(fs.existsSync(xcodeProj)).toBe(true);
    expect(fs.existsSync(infoPlist)).toBe(true);
    expect(fs.existsSync(appDelegate)).toBe(true);
  });

  it("should configure Info.plist with UniMate display name and safe orientation settings", () => {
    const infoPlist = path.join(rootDir, "ios", "App", "App", "Info.plist");
    const content = fs.readFileSync(infoPlist, "utf-8");

    expect(content).toContain("<string>UniMate</string>");
    expect(content).toContain("UIInterfaceOrientationPortrait");
    expect(content).toContain("UISupportedInterfaceOrientations~ipad");
    expect(content).toContain("UIViewControllerBasedStatusBarAppearance");
  });

  it("should have App Store 1024x1024 high-res icon in Xcode xcassets and public icons", () => {
    const iosAppIcon = path.join(
      rootDir,
      "ios",
      "App",
      "App",
      "Assets.xcassets",
      "AppIcon.appiconset",
      "AppIcon-512@2x.png"
    );
    const pubIcon1024 = path.join(rootDir, "public", "icons", "icon-1024x1024.png");

    expect(fs.existsSync(iosAppIcon)).toBe(true);
    expect(fs.existsSync(pubIcon1024)).toBe(true);

    const iosStat = fs.statSync(iosAppIcon);
    const pubStat = fs.statSync(pubIcon1024);

    expect(iosStat.size).toBeGreaterThan(10000);
    expect(pubStat.size).toBeGreaterThan(10000);
  });

  it("should export Capacitor native integration helpers safely", () => {
    expect(typeof isNativePlatform).toBe("function");
    expect(typeof triggerHaptic).toBe("function");
    expect(typeof triggerHapticNotification).toBe("function");
    expect(typeof setNativeStatusBar).toBe("function");

    // In Node/Vitest environment, isNativePlatform should safely return false without crashing
    expect(isNativePlatform()).toBe(false);
  });
});
