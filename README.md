# 🎓 UniMate - الرفيق الجامعي الذكي (The Ultimate University Companion)

> **Arabic-first, Modern, Full-stack University Student Platform & Progressive Web App (PWA)** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS (RTL/LTR)**, **PostgreSQL & Prisma ORM**, **JWT Authentication**, and an **AI Academic Assistant**.

---

## 🌟 Overview & Key Highlights

**UniMate (يوني ميت)** is a production-grade academic companion engineered specifically for university students. It combines timetable organization, assignment tracking, exam countdowns, GPA calculations (both **5.0 Saudi standard** and **4.0 international scale**), a smart **Target GPA Simulator**, and an **AI Study Assistant** into a single, intuitive interface.

- 🌍 **Arabic-first with Dynamic RTL/LTR Toggle:** Full native Arabic typography (Cairo font) with instant bilingual switching to English.
- 📱 **Production-Ready PWA for iPhone & iPad:** Installable standalone web application with offline fallback, custom app shell caching, and Apple Human Interface Guidelines (HIG) touch targets.
- 🌓 **Dark & Light Mode:** System-detected with manual override, smooth transitions, and high-contrast accessibility.
- 📐 **Safe-Area Architecture:** Custom responsive layouts for iPhone notch/Dynamic Island (`pt-safe`, `pb-safe`), iPad landscape rails, and touch targets (minimum 44×44px).
- 🔒 **Secure Authentication & Edge Guard:** Password hashing via bcrypt, stateless edge-compatible HS256 JWT tokens stored in HttpOnly secure cookies, and Next.js middleware protection.
- 🛡️ **Zero Private Data Leakage:** The Service Worker explicitly bypasses `/api/*` requests, ensuring private student data, auth tokens, and grades are never cached insecurely.
- 📅 **Interactive Timetable & Conflict Engine:** Visual grid for university lecture schedules (Sunday to Thursday), conflict detection to alert when two classes overlap, and one-click iCal (.ics) export.
- 🎯 **GPA Calculator & Target Simulator:** Real-time projected semester calculations and target projection math (*"What grades do I need this semester to reach 4.85?"*).
- 🤖 **AI Academic Study Buddy:** Generates custom study schedules, summarizes lecture notes, creates practice quizzes with flashcards, and explains complex concepts.
- ⏱️ **Study Planner & Pomodoro:** 25/5/15 minute focus timer with celebratory confetti and productivity tracking.
- 🐳 **Docker & Production Ready:** Multi-stage Dockerfile and Docker Compose orchestration with PostgreSQL 16.

---

## 📱 iPhone & iPad Installation Guide (PWA)

UniMate is configured as a standalone Progressive Web App (PWA), providing a native-like experience without the browser address bar or navigation buttons.

### 📲 How to Install on iPhone (iOS Safari)

1. Open Safari on your iPhone and navigate to your UniMate address (e.g., `https://unimate.app` or your local server address).
2. Tap the **Share** button (the square icon with an upward arrow `[↑]`) in the Safari toolbar at the bottom of the screen.
3. In the share sheet, scroll down and select **"Add to Home Screen"** (`إضافة إلى الصفحة الرئيسية`).
4. Review the app title (**UniMate | يوني ميت**) and tap **"Add"** (`إضافة`) in the top right corner.
5. The UniMate icon will appear on your home screen. Tapping it launches UniMate in full-screen standalone mode with native iOS gestures and safe-area margins.

### 📲 How to Install on iPad (iPadOS Safari)

1. Open Safari on your iPad and navigate to your UniMate deployment.
2. Tap the **Share** button (`[↑]`) in the top toolbar next to the address bar.
3. Select **"Add to Home Screen"** (`إضافة إلى الصفحة الرئيسية`).
4. Tap **"Add"** (`إضافة`).
5. On iPad, UniMate automatically adapts to the larger canvas, offering an expanded navigation drawer, optimized split-view touch targets, and full keyboard/trackpad accessibility.

### 📴 Offline Experience & Security
- When connectivity drops, UniMate automatically detects the disconnection and displays an offline status indicator with a one-click reconnect button.
- A branded offline fallback page (`/offline.html`) is cached locally so students never encounter broken browser error pages.
- **Security Guarantee:** Private student information (courses, GPA calculations, exam schedules, and authentication cookies) is **never cached insecurely**. The service worker explicitly excludes all `/api/*` endpoints from offline cache storage.

---

## 🍎 iOS & iPad Native App Packaging (Capacitor & App Store)

UniMate includes a pre-configured native **Capacitor 8** iOS project in `ios/App`, enabling full distribution to the **Apple App Store** and **TestFlight** alongside its PWA mode.

### 🌟 Native Features Integrated
- **1024×1024 High-Res Universal App Store Icon:** Automatically generated and synced into `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`.
- **Dynamic Native iOS Status Bar (`@capacitor/status-bar`):** Automatically switches between dark and light content to match student theme preferences.
- **Physical Haptic Feedback (`@capacitor/haptics`):** Tactile responses when students complete assignments, finish Pomodoro timers, or switch themes/languages.
- **Branded Native Splash Screen (`@capacitor/splash-screen`):** Instant launch animation with UniMate's signature indigo gradient.
- **Safe Area & Dynamic Island Geometry:** Edge-to-edge support with custom `pt-safe` and `pb-safe` constraints.

### 🛠️ Developer Workflow Commands

```bash
# Sync web assets, configuration, and plugins to the native iOS project
npm run cap:sync

# Copy public assets only
npm run cap:copy

# Open the native Xcode project (on macOS)
npm run cap:open
```

### 📦 Archiving & Submitting to App Store Connect

1. **Open Xcode:** Run `npm run cap:open` on a Mac or transfer the `ios/` folder.
2. **Signing & Capabilities:** Select your Apple Developer Team and ensure the Bundle Identifier is set to `app.unimate.student`.
3. **Archive Build:** Select `Any iOS Device (arm64)` from the scheme selector, then go to **Product > Archive**.
4. **Distribute to App Store Connect:** In the Xcode Organizer, click **Distribute App** -> **App Store Connect** to push directly to TestFlight and App Store submission.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js `20+` or `24+`
- Docker & Docker Compose (or a running PostgreSQL instance)

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

The default `.env` includes:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unimate?schema=public"
JWT_SECRET="unimate_super_secret_jwt_key_secure_token_1234567890_development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
# Optional external LLM API key (if empty, built-in academic intelligence is used)
AI_API_KEY=""
```

### 3. Start PostgreSQL Database
```bash
docker compose up -d db
```

### 4. Setup Database Schema & Seed Demo Data
```bash
npm run db:setup
```

This initializes the PostgreSQL schema and seeds realistic academic demo data for a student taking Computer Science / Software Engineering courses.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

You can use the **Quick Demo Login** button on `/login` or enter:
- **Email:** `demo@unimate.app`
- **Password:** `password123`

---

## 🧪 Running Tests

The application includes comprehensive unit and integration tests powered by **Vitest**:

```bash
npm run test
```

Test suites cover:
- **`tests/ios-packaging.test.ts`**: Native Xcode project structure, `Info.plist` display names & orientations, 1024x1024 App Store icon verification, and Capacitor native plugin safe exports.
- **`tests/pwa.test.ts`**: PWA manifest validation, Service Worker API security bypass verification, icon file integrity, and offline fallback functionality.
- **`tests/gpa.test.ts`**: 5.0 and 4.0 GPA scale calculations, credit hour weighting, and target simulator feasibility.
- **`tests/timetable.test.ts`**: Overlap c
onflict detection algorithms, border-touching class verification, and RFC 5545 iCal generator.
- **`tests/translations.test.ts`**: Complete symmetry and key coverage between Arabic and English dictionaries.
- **`tests/ai.test.ts`**: AI Study Assistant prompt generation (study plans, summaries, flashcards).

---

## 🏗️ Docker & Deployment

### Production Multi-Stage Build
To build and run the entire production stack (Next.js app + PostgreSQL database) with Docker Compose:

```bash
docker compose up --build -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
├── prisma/
│   ├── schema.prisma        # PostgreSQL Prisma data models
│   └── seed.js              # Comprehensive academic seed dataset
├── public/
│   ├── favicon.ico          # Multi-resolution ICO favicon
│   ├── favicon.svg          # Vector favicon
│   ├── manifest.json        # W3C PWA Web App Manifest
│   ├── sw.js                # Service Worker with secure API bypass
│   ├── offline.html         # Standalone offline fallback page
│   └── icons/               # 192px, 512px, maskable, Apple Touch icons
├── scripts/
│   └── generate-pwa-icons.js # Standalone Node.js icon generator
├── src/
│   ├── app/
│   │   ├── api/             # RESTful API Routes (auth, courses, timetable, assignments, exams, gpa, ai, study-planner, settings, dashboard)
│   │   ├── dashboard/       # Dashboard overview with metrics, today's schedule, pending tasks
│   │   ├── courses/         # Course management (CRUD, colors, instructors, credits)
│   │   ├── timetable/       # Weekly interactive schedule with conflict alerts & iCal
│   │   ├── assignments/     # Assignments & projects tracker with status & priorities
│   │   ├── exams/           # Exam schedule with live countdown clocks & seat numbers
│   │   ├── gpa/             # GPA calculator, 4.0/5.0 scale, & target simulator
│   │   ├── ai-assistant/    # Conversational AI study buddy
│   │   ├── study-planner/   # Pomodoro focus timer & session logger
│   │   ├── settings/        # Preferences, profile, scale switch, demo reset
│   │   ├── offline/         # Next.js offline fallback route
│   │   ├── login/           # Login page with 1-click demo access
│   │   ├── register/        # Student registration
│   │   ├── globals.css      # Cairo typography & iOS safe-area utilities
│   │   ├── layout.tsx       # Root layout with Apple metadata & PWA providers
│   │   └── manifest.ts      # Next.js App Router manifest route
│   ├── components/
│   │   ├── layout/          # AppShell, ThemeToggle, LanguageToggle
│   │   ├── pwa/             # PwaRegister, IosInstallPrompt, SplashScreen
│   │   └── ui/              # Modal, Button, Card, Badge
│   ├── context/
│   │   └── AppContext.tsx   # Language, Theme, User session state
│   ├── lib/
│   │   ├── auth.ts          # JWT & bcrypt authentication
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── gpa.ts           # GPA math calculation engine
│   │   ├── timetable.ts     # Time conflict detection & iCal export
│   │   ├── ai.ts            # Academic assistant reasoning engine
│   │   └── i18n/            # Arabic RTL and English dictionaries
│   └── middleware.ts        # Route authentication guard
├── tests/                   # Vitest test suites (PWA, GPA, Timetable, Translations, AI)
├── docker-compose.yml       # Production orchestration (app + db)
├── Dockerfile               # Multi-stage optimized production image
└── package.json
```

---

## 📜 License
MIT License. Built for students worldwide.