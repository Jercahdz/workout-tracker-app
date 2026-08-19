# Workout Tracker App

A modern React Native fitness app for workout management, progress tracking, and AI-powered routine generation

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![License](https://img.shields.io/badge/license-Educational-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Screens](#screens)
- [Gamification System](#gamification-system)
- [AI Integration](#ai-integration)
- [Internationalization](#internationalization)
- [Backend](#backend)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

---

## Overview

Workout Tracker is a comprehensive fitness mobile application that combines modern workout management with AI-powered personalization and gamification. Users can:

- Register and authenticate with JWT tokens stored securely via Expo SecureStore
- Create and manage fitness profiles with goals, level, and training preferences
- Browse 100+ exercises with animated GIFs and step-by-step instructions
- Build custom workout routines with sets, reps, and weight tracking
- Monitor body weight and exercise progression with visual charts
- Generate personalized AI-powered workout routines in seconds
- Earn XP, level up, maintain streaks and unlock achievements
- Use the app in English or Spanish with automatic language detection

> **Mobile Client** for the [Workout Tracker API](https://github.com/Jercahdz/workout_tracker_api), built with Expo for iOS, Android, and Web.

## Features

### Authentication & Profile
- Email/password registration and login with JWT tokens
- Secure credential storage with Expo SecureStore
- User profile with fitness goals, level, and training days
- Age, weight, height and unit system preferences

### Workouts & Exercises
- Create, edit, and delete custom workout routines
- Browse 100+ exercises with muscle group filters
- Exercise details with animated GIFs and instructions (ExerciseDB)
- Add/remove exercises with sets, reps, and weight
- Log completed sessions and track session history

### Progress Tracking
- Visual charts for body weight progression
- Weight progression per exercise across sessions
- Filter progress by specific exercises
- Notes support for sessions and weight entries

### AI-Powered Generation
- Generate personalized 5-day workout plans with AI
- Structured with muscle groups, sets, reps, and duration
- One-tap save to create workouts from generated routines
- Based on fitness profile and user preferences

### Gamification
- **Streaks**: Track consecutive training days
- **Shields**: Earn every 5 sessions to protect streaks
- **XP System**: +100 per session, +50 bonus, +200 per achievement
- **Levels**: Rookie → Athlete → Warrior → Champion → Legend
- **Achievements**: 7 unlockable badges for milestones

### Internationalization
- English and Spanish language support
- Automatic language detection from device locale
- All UI strings, labels, and error messages translated

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native + Expo | 54.0 |
| **Language** | TypeScript | 5.9+ |
| **Navigation** | Expo Router | 6.0+ |
| **State Mgmt** | Zustand | 5.0+ |
| **Data Fetching** | React Query | 5.101+ |
| **HTTP Client** | Fetch API (native) | — |
| **Auth Storage** | Expo SecureStore | 15.0+ |
| **UI Icons** | @expo/vector-icons | 15.0+ |
| **Validation** | Zod | 4.4+ |
| **Forms** | React Hook Form | 7.82+ |
| **i18n** | i18n-js + expo-localization | 4.5+/17.0+ |
| **Markdown** | react-native-markdown-display | 7.0+ |
| **Backend** | Node.js + Fastify | — |
| **Database** | MySQL + Prisma | — |
| **Exercise DB** | ExerciseDB (RapidAPI) | — |

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Screens](#-screens)
- [Gamification System](#-gamification-system)
- [AI Integration](#-ai-integration)
- [Internationalization](#-internationalization)
- [Backend](#-backend)
- [Roadmap](#-roadmap)
- [License](#-license)

## Getting Started

### Prerequisites

- **Node.js** 22+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Expo CLI** - Install globally:
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go App** on your mobile device (iOS/Android)
- **RapidAPI Account** with ExerciseDB subscription ([Free tier available](https://rapidapi.com/api-sports/api/api-sports))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jercahdz/workout-tracker-app.git
   cd workout-tracker-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # or create .env with:
   EXPO_PUBLIC_EXERCISEDB_KEY=your_rapidapi_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - **iOS**: Press `i` or scan QR code with Expo Go
   - **Android**: Press `a` or scan QR code with Expo Go
   - **Web**: Press `w`

## Project Structure

```
workout-tracker-app/
├── app/                          # Expo Router navigation & screens
│   ├── _layout.tsx              # Root layout
│   ├── ai-routine.tsx           # AI routine generation screen
│   ├── (auth)/                  # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Dashboard
│   │   ├── exercises.tsx        # Exercise catalog
│   │   ├── workouts.tsx         # Workouts list
│   │   ├── progress.tsx         # Progress tracking
│   │   └── profile.tsx          # User profile
│   ├── workout/[id].tsx         # Workout detail
│   └── exercise/[id].tsx        # Exercise detail
│
├── components/                  # Reusable React components
│   ├── ui/                      # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── AlertModal.tsx
│   │   └── LineChart.tsx
│   ├── auth/                    # Auth-specific components
│   ├── workout/                 # Workout components
│   ├── progress/                # Progress components
│   └── stats/                   # Stats components
│
├── hooks/                       # Custom React hooks
│   └── useAuth.ts              # Authentication hook
│
├── lib/                         # Business logic & utilities
│   ├── api/                     # API clients & endpoints
│   │   ├── client.ts            # HTTP client config
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── workouts.ts          # Workouts endpoints
│   │   ├── exercises.ts         # Exercises endpoints
│   │   ├── sessions.ts          # Sessions endpoints
│   │   ├── progress.ts          # Progress endpoints
│   │   ├── stats.ts             # Stats endpoints
│   │   ├── achievements.ts      # Achievements endpoints
│   │   └── ai.ts                # AI endpoints
│   ├── constants/               # Global constants
│   │   └── muscleGroups.ts
│   └── i18n/                    # Internationalization
│       ├── en.ts                # English translations
│       └── es.ts                # Spanish translations
│
├── store/                       # Zustand state management
│   ├── authStore.ts             # Auth state
│   └── statsStore.ts            # Stats state
│
├── assets/                      # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── app.json                     # Expo configuration
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler config
├── package.json                # Dependencies
└── .env                        # Environment variables (local)
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# ExerciseDB API (required)
EXPO_PUBLIC_EXERCISEDB_KEY=your_rapidapi_key

# Optional: Backend API URL (if self-hosted)
# EXPO_PUBLIC_API_URL=http://your-backend-url
```

Get your `EXPO_PUBLIC_EXERCISEDB_KEY`:
1. Visit [RapidAPI - ExerciseDB](https://rapidapi.com/api-sports/api/api-sports)
2. Subscribe to the free tier
3. Copy your API key
4. Add it to `.env`

## Available Scripts

```bash
# Start development server
npm start

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Clear cache and restart
npm start -- --clear

# View logs in real-time
npm start -- --verbose
```

## Screens
| Screen | Description |
|--------|-------------|
| **Login / Register** | Email/password auth with form validation and error modals |
| **Dashboard** | Streak display, level/XP progress, recent workouts and quick AI access |
| **Workouts** | Weekly-grouped workouts with search, color-coded by muscle group |
| **Workout Detail** | Exercise list with sets/reps, add/remove exercises, log sessions |
| **Exercises** | 100+ exercise catalog with filters, search and muscle group chips |
| **Exercise Detail** | Animated GIFs, step-by-step instructions and muscles worked |
| **Progress** | Body weight chart and per-exercise progression tracking |
| **AI Routine** | Generate and save personalized 5-day workout plans |
| **Profile** | User data, achievements, stats and logout |

## Gamification System

| Element | Details |
|---------|---------|
| **Streak** | Track consecutive training days based on your schedule |
| **Shields** | Earn every 5 sessions to protect streaks on rest days |
| **XP & Levels** | +100 XP per session, +50 streak bonus, +200 per achievement |
| **Level Tiers** | Rookie → Athlete → Warrior → Champion → Legend |
| **Achievements** | 7 unlockable badges for milestones (first session, streaks, etc.) |

## AI Integration

The app connects to the [Workout Tracker API](https://github.com/Jercahdz/workout_tracker_api) which powers AI routine generation through an interchangeable provider pattern:

- **Cloud**: Groq (llama-3.3-70b)
- **Local**: Ollama (llama3.2)

**How it works:**
1. User completes fitness profile (goals, level, training days)
2. AI generates a structured 5-day workout plan in JSON format
3. App displays the plan with muscle groups, exercises, sets, reps, and duration
4. One-tap save creates individual workouts from the routine

## Internationalization

The app supports **English** and **Spanish** with:
- Automatic language detection from device locale
- Manual language switching in profile settings
- All UI strings, labels, error messages and placeholders translated
- Built with `i18n-js` and `expo-localization`

## Backend

This is the mobile client for the **Workout Tracker API**, a production-grade REST API built with:

- **Framework**: Node.js + Fastify
- **Database**: MySQL + Prisma ORM
- **Features**: JWT auth, workout management, AI generation, gamification

**Links:**
- [API Docs](https://workout-tracker-api-gkno.onrender.com/docs)
- [Backend Repository](https://github.com/Jercahdz/workout_tracker_api)

## Roadmap

- [ ] Rest timer between sets
- [ ] Extended body measurements tracking

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

Found a bug or have a feature request? 
- [Create an Issue](https://github.com/Jercahdz/workout-tracker-app/issues)
- [Start a Discussion](https://github.com/Jercahdz/workout-tracker-app/discussions)

---

## License

This project is for **educational and portfolio purposes**. All content and code are provided as-is.