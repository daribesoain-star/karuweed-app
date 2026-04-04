# KaruWeed - Cannabis Cultivation Companion App

A comprehensive Expo/React Native mobile app for tracking cannabis plant growth with AI-powered plant analysis using Claude Vision API.

## Features

- **User Authentication**: Secure sign-up and login with Supabase
- **Plant Management**: Create, track, and manage multiple cannabis plants
- **Check-ins**: Regular photo-based check-ins with AI analysis
- **AI Analysis**: Claude Vision API analyzes plant health, diagnoses issues, and provides recommendations
- **Plant Stages**: Track plants through germination, seedling, vegetative, flowering, and harvest stages
- **Health Scoring**: AI-generated health scores and issue identification
- **Dark Mode**: Beautiful dark UI with KaruWeed green accent colors
- **Spanish Interface**: Complete Spanish localization
- **Responsive Design**: Optimized for mobile phones and tablets

## Tech Stack

- **Framework**: Expo / React Native
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Claude 3.5 Sonnet (Vision API)
- **Styling**: NativeWind + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Secure Storage**: expo-secure-store
- **Camera/Gallery**: expo-image-picker, expo-camera
- **Maps**: react-native-maps
- **Navigation**: react-navigation

## Project Structure

```
karuweed-app/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with auth check
│   ├── (auth)/                  # Auth tab group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                  # Main tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Home dashboard
│   │   ├── plants.tsx           # Plants list
│   │   ├── map.tsx              # Store map
│   │   └── profile.tsx          # User profile
│   ├── plant/
│   │   ├── [id].tsx             # Plant detail screen
│   │   └── new.tsx              # Create new plant
│   └── checkin/
│       └── [plantId].tsx        # Check-in screen
├── src/
│   ├── lib/
│   │   ├── types.ts             # TypeScript types
│   │   ├── supabase.ts          # Supabase client
│   │   └── ai.ts                # Claude Vision API integration
│   ├── store/
│   │   ├── authStore.ts         # Auth state (Zustand)
│   │   └── plantStore.ts        # Plants state (Zustand)
│   └── components/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── PlantCard.tsx
│       ├── CheckInCard.tsx
│       └── StageIndicator.tsx
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
├── tailwind.config.js           # Tailwind config
├── global.css                   # Global styles
├── .env                         # Environment variables
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- An iOS or Android device/emulator
- Supabase account (free tier works)
- Anthropic API key

### 1. Environment Setup

Copy `.env` template and fill in your credentials:

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://ymvnflwcxwgsyhramhex.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 2. Install Dependencies

Dependencies are already installed via node_modules. If you need to reinstall:

```bash
npm install
# or
yarn install
```

### 3. Supabase Setup

Create the following tables in your Supabase project:

#### users table
```sql
create table public.users (
  id uuid primary key references auth.users(id),
  email text not null,
  full_name text,
  avatar_url text,
  country_code varchar(2),
  subscription_tier text default 'free',
  created_at timestamp with time zone default now()
);
```

#### plants table
```sql
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  strain text not null,
  strain_type text,
  stage text,
  start_date timestamp with time zone,
  expected_harvest timestamp with time zone,
  nutrients jsonb,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);
```

#### checkins table
```sql
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  date timestamp with time zone default now(),
  photo_url text,
  ai_analysis jsonb,
  height_cm decimal(5,2),
  notes text,
  issues text[],
  created_at timestamp with time zone default now()
);
```

#### stores table (for future map feature)
```sql
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code varchar(2),
  city text,
  address text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  tier text,
  logo_url text,
  hours jsonb,
  contact jsonb,
  is_verified boolean,
  created_at timestamp with time zone default now()
);
```

Create storage bucket for check-in photos:
```sql
-- In Supabase Storage, create a new bucket called "checkin-photos"
-- Make it public for easy access to uploaded photos
```

### 4. Run the App

```bash
# Start Expo development server
npm start

# For iOS (macOS only)
npm run ios

# For Android
npm run android

# For web
npm run web
```

### 5. Scan QR Code

Use Expo Go app on your device to scan the QR code from terminal.

## Architecture

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Session token stored in expo-secure-store
3. User profile data cached in Zustand store
4. App redirects to tabs on successful auth

### Plant Management

1. Plants stored in Supabase with user_id relationship
2. Zustand store syncs local state with database
3. Real-time updates via Supabase subscriptions (ready to implement)

### AI Analysis

1. User captures plant photo via expo-camera or expo-image-picker
2. Image converted to base64
3. Sent to Claude Vision API with cannabis cultivation prompt
4. Returns: diagnosis, health_score, recommendations, identified_issues
5. Results displayed immediately and saved to check-in

## Color Scheme

- **Dark Background**: #0A0A0A
- **Card Background**: #1A1A2E
- **Primary Green**: #22C55E (CTAs, highlights)
- **Dark Green**: #0B3D2E (card variants)
- **Light Green**: #86EFAC (accents)
- **Orange**: #C47A2C (warnings, important)
- **Gray**: #3A3A4E (borders, disabled)

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| expo-router | ^3.0.0 | File-based routing |
| zustand | ^4.5.0 | State management |
| @supabase/supabase-js | ^2.41.0 | Backend & auth |
| nativewind | ^4.1.0 | Tailwind styling |
| react-hook-form | ^7.51.0 | Form handling |
| date-fns | ^3.3.0 | Date formatting |
| expo-secure-store | ^13.0.0 | Secure token storage |
| expo-image-picker | ^14.0.0 | Photo selection |
| expo-camera | ^14.0.0 | Camera access |

## Development Notes

### Hot Reload

Changes to JavaScript automatically reload. Native module changes require app restart.

### Debugging

- React Native Debugger: Works with Expo
- Console logs appear in Expo terminal
- Network requests visible in browser DevTools (web)

### Testing

Current setup includes Jest and @types/jest. Add tests to:
```bash
npm test
```

### Building for Production

```bash
# Build for iOS (requires Apple Developer account)
npm run build

# Submit to App Store
npm run deploy
```

## Known Limitations

- Map store feature is placeholder (will implement in future)
- Real-time subscriptions not yet implemented
- OCR for nutrient tracking not implemented
- Push notifications configured but not fully integrated

## Future Enhancements

- [ ] Real-time plant health monitoring
- [ ] Community plant tips and discussions
- [ ] Advanced nutrient tracking with OCR
- [ ] Store locator with Google Maps
- [ ] Growth prediction model
- [ ] Export cultivation reports
- [ ] Wearable companion app
- [ ] Web dashboard

## API Keys & Security

**Important**: Never commit `.env` file with real keys.

- Supabase Anon Key: Used for public operations (signup, login)
- Anthropic API Key: Used for AI analysis (keep private)
- Store these in environment variables in production

## Support & Contribution

For issues, feature requests, or contributions, please refer to the project documentation.

## License

This project is proprietary software for KaruWeed. All rights reserved.
