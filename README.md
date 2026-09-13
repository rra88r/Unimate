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

## 🍎 Next Step: Packaging UniMate for the Apple App Store

To convert UniMate into a native iOS app (`.ipa`) ready for distribution on the **Apple App Store**:

### Step 1: Initialize Capacitor
UniMate's standalone Next.js architecture is 100% compatible with **Capacitor** or **WKWebView native wrappers**:

```bash
# Install Capacitor core and iOS platform
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Initialize Capacitor configuration
npx cap init UniMate app.unimate.student --web-dir .next/standalone/public
```

### Step 2: Configure capacitor.config.json
Point Capacitor to your production Next.js server or build:
```json
{
  "appId": "app.unimate.student",
  "appName": "UniMate",
  "webDir": "public",
  "server": {
    "url": "https://your-production-unimate-domain.com",
    "cleartext": false
  },
  "ios": {
    "contentInset": "always",
    "allowsLinkPreview": false,
    "scrollEnabled": true
  }
}
```

### Step 3: Generate Xcode Project
```bash
# Add the iOS platform
npx cap add ios

# Open project in Xcode
npx cap open ios
```

### Step 4: Configure Xcode Project
In Xcode:
1. **Signing & Capabilities:** Select your Apple Developer Team and specify your Bundle Identifier (`app.unimate.student`).
2. **App Icons & Launch Images:** Capacitor will automatically map the icons generated in `public/icons/` into `AppIcon.appiconset`.
3. **Status Bar & Appearance:** Set `Status bar style` to `Light Content` and `View controller-based status bar appearance` to `YES`.
4. **Push Notifications (Optional):** Add the *Push Notifications* capability if integrating APNs for assignment and exam reminders.

### Step 5: Archive & Submit to App Store Connect
1. Select the generic iOS device or your connected test iPhone/iPad.
2. Go to **Product > Archive**.
3. Once archived, click **Distribute App** and choose **App Store Connect**.
4. Test with internal and external testers via **TestFlight**.
5. Submit for final App Review with Arabic and English descriptions, keywords, and screenshots.

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
- **`tests/pwa.test.ts`**: PWA manifest validation, Service Worker API security bypass verification, icon file integrity, and offline fallback functionality.
- **`tests/gpa.test.ts`**: 5.0 and 4.0 GPA scale calculations, credit hour weighting, and target simulator feasibility.
- **`tests/timetable.test.ts`**: Overlap conflict detection algorithms, border-touching class verification, and RFC 5545 iCal generator.
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