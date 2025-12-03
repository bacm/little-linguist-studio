# Little Linguist Studio

A React Native/Expo app for tracking a child's language development. Parents can capture new vocabulary, monitor milestones, and visualize progress with Supabase-backed storage and authentication.

## Features

- **Supabase authentication** for secure email/password sign-in and session persistence. 【F:contexts/AuthContext.tsx†L1-L90】【F:screens/AuthScreen.tsx†L1-L120】
- **Child profile management** with validation, deletion safeguards, and automatic default milestone seeding. 【F:contexts/ChildContext.tsx†L1-L66】【F:screens/SettingsScreen.tsx†L1-L192】
- **Vocabulary tracker** to add categorized words, search/filter, and manage entries by child. 【F:screens/VocabularyScreen.tsx†L1-L212】【F:screens/VocabularyScreen.tsx†L200-L312】
- **Flashcards and quick actions** directly from the home dashboard to review recent words. 【F:screens/HomeScreen.tsx†L1-L156】【F:screens/HomeScreen.tsx†L156-L252】
- **Milestone and progress dashboards** summarizing word counts, milestone completion, and recent activity. 【F:screens/MilestonesScreen.tsx†L1-L82】【F:screens/StatisticsScreen.tsx†L1-L248】

## Getting started

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Start the Expo development server**
   ```sh
   npm run start
   ```

3. **Open the app**
   - Press `i`, `a`, or `w` in the Expo CLI to launch iOS, Android, or web respectively, or scan the QR code with Expo Go on a physical device.

## Supabase configuration

Supabase connectivity is configured in `integrations/supabase/client.ts`. The client uses the provided project URL and anonymous key and persists sessions via AsyncStorage or `localStorage` on web. Update these values if you point the app to a different Supabase project. 【F:integrations/supabase/client.ts†L1-L40】

## Project structure

- `App.tsx` – navigation shell with tab layout and provider setup. 【F:App.tsx†L1-L88】
- `contexts/` – authentication and child profile providers. 【F:contexts/AuthContext.tsx†L1-L90】【F:contexts/ChildContext.tsx†L1-L66】
- `screens/` – feature views for auth, home, vocabulary, statistics, milestones, and settings. 【F:screens/HomeScreen.tsx†L1-L252】【F:screens/SettingsScreen.tsx†L1-L192】
- `integrations/` – Supabase client and generated types.
- `lib/` – helpers for database setup and seeding.

## Data model (Supabase)

Core tables include:
- `children` – child profiles linked to a user account. 【F:contexts/ChildContext.tsx†L18-L45】
- `words` – vocabulary entries with category references and learned dates. 【F:screens/VocabularyScreen.tsx†L17-L96】
- `word_categories` – color-coded categories used for filtering and flashcards. 【F:screens/VocabularyScreen.tsx†L17-L96】
- `milestones` – track progress and completion dates. 【F:screens/StatisticsScreen.tsx†L13-L90】

## Contributing

- Create feature branches for changes.
- Run `npm run start` to verify the app boots and core flows work.
- Submit a PR describing the change and any testing performed.
