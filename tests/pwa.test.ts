import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("PWA Configuration & Assets", () => {
  const rootDir = path.resolve(__dirname, "..");
  const publicDir = path.join(rootDir, "public");

  it("verifies public/manifest.json is valid and contains required PWA fields", () => {
    const manifestPath = path.join(publicDir, "manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);

    expect(manifest.name).toContain("UniMate");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/dashboard");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#4f46e5");
    expect(manifest.background_color).toBe("#0f172a");
    expect(manifest.lang).toBe("ar");
    expect(manifest.dir).toBe("rtl");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    // Verify all icons exist on disk
    for (const icon of manifest.icons) {
      const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
      expect(fs.existsSync(iconPath)).toBe(true);
    }

    // Verify shortcuts
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(2);
  });

  it("verifies all Apple touch icons and favicons exist in public directory", () => {
    const requiredFiles = [
      "favicon.ico",
      "favicon.svg",
      "icons/apple-touch-icon.png",
      "icons/apple-touch-icon-120x120.png",
      "icons/apple-touch-icon-152x152.png",
      "icons/apple-touch-icon-167x167.png",
      "icons/icon-192x192.png",
      "icons/icon-512x512.png",
      "icons/icon-maskable-512x512.png",
      "icons/icon.svg",
      "offline.html",
      "sw.js",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(publicDir, file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).toBe(true);
      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  it("verifies service worker security: NEVER caches private /api/ routes", () => {
    const swPath = path.join(publicDir, "sw.js");
    const swContent = fs.readFileSync(swPath, "utf-8");

    // Security check: Must check /api/ and return without caching
    expect(swContent).toMatch(/pathname\.startsWith\(["']\/api\/["']\)/);
    // Must listen to install, activate, and fetch
    expect(swContent).toContain('addEventListener("install"');
    expect(swContent).toContain('addEventListener("activate"');
    expect(swContent).toContain('addEventListener("fetch"');
    // Must reference offline fallback
    expect(swContent).toContain("/offline.html");
  });

  it("verifies offline.html contains bilingual support and auto-retry logic", () => {
    const offlinePath = path.join(publicDir, "offline.html");
    const html = fs.readFileSync(offlinePath, "utf-8");

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("لا يوجد اتصال بالإنترنت");
    expect(html).toContain("Retry");
    expect(html).toContain("addEventListener('online'");
  });
});
