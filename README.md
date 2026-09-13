# 🎓 UniMate - الرفيق الجامعي الذكي (The Ultimate University Companion)

> **Arabic-first, Modern, Full-stack University Student Platform** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS (RTL/LTR)**, **PostgreSQL & Prisma ORM**, **JWT Authentication**, and an **AI Academic Assistant**.

---

## 🌟 Overview & Key Highlights

**UniMate (يوني ميت)** is a production-grade academic companion engineered specifically for university students. It combines timetable organization, assignment tracking, exam countdowns, GPA calculations (both **5.0 Saudi standard** and **4.0 international scale**), a smart **Target GPA Simulator**, and an **AI Study Assistant** into a single, intuitive interface.

- 🌍 **Arabic-first with Dynamic RTL/LTR Toggle:** Full native Arabic typography (Cairo font) with instant bilingual switching to English.
- 🌓 **Dark & Light Mode:** System-detected with manual override, smooth transitions, and high-contrast accessibility.
- 📱 **Mobile & Tablet Optimized:** Custom bottom navigation bar designed for iPhone safe-areas (home indicator, notch) and tablet/iPad side layouts.
- 🔒 **Secure Authentication:** Password hashing via bcrypt, stateless edge-compatible HS256 JWT tokens stored in HttpOnly secure cookies, and Next.js middleware protection.
- 📅 **Interactive Timetable & Conflict Engine:** Visual grid for university lecture schedules (Sunday to Thursday), conflict detection to alert when two classes overlap, and one-click iCal (.ics) export.
- 🎯 **GPA Calculator & Target Simulator:** Real-time projected semester calculations and target projection math (*"What grades do I need this semester to reach 4.85?"*).
- 🤖 **AI Academic Study Buddy:** Generates custom study schedules, summarizes lecture notes, creates practice quizzes with flashcards, and explains complex concepts.
- ⏱️ **Study Planner & Pomodoro:** 25/5/15 minute focus timer with celebratory confetti and productivity tracking.
- 🐳 **Docker & Production Ready:** Multi-stage Dockerfile and Docker Compose orchestration with PostgreSQL 16.

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

The application includes unit and integration tests powered by **Vitest**:

```bash
npm run test
```

Test suites cover:
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
│   │   ├── login/           # Login page with 1-click demo access
│   │   ├── register/        # Student registration
│   │   ├── globals.css      # Cairo Arabic typography & iOS safe-areas
│   │   └── layout.tsx       # Root layout with AppProvider
│   ├── components/
│   │   ├── layout/          # AppShell, ThemeToggle, LanguageToggle
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
├── tests/                   # Vitest unit & integration test suites
├── docker-compose.yml       # Production orchestration (app + db)
├── Dockerfile               # Multi-stage optimized production image
└── package.json
```

---

## 📜 License
MIT License. Built for students worldwide.