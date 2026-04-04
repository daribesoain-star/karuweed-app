# KaruWeed App - Complete Setup Guide

## Step-by-Step Setup Instructions

### Step 1: Get API Keys & Credentials

#### Supabase Setup
1. Go to https://supabase.com and create a free account
2. Create a new project (choose region close to you)
3. In Project Settings > API, copy:
   - Project URL (EXPO_PUBLIC_SUPABASE_URL)
   - anon/public key (EXPO_PUBLIC_SUPABASE_ANON_KEY)

#### Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Create an API key in the settings
4. Copy it (EXPO_PUBLIC_ANTHROPIC_API_KEY)

### Step 2: Configure Environment Variables

Edit `.env` file in project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key...
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...your-key...
```

### Step 3: Setup Supabase Database

1. Go to Supabase project dashboard
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Copy and run each SQL block below

#### Query 1: Create Users Table

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  country_code varchar(2) default 'CL',
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);
```

#### Query 2: Create Plants Table

```sql
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  strain text not null,
  strain_type text check (strain_type in ('indica', 'sativa', 'hybrid', 'auto')),
  stage text check (stage in ('germination', 'seedling', 'vegetative', 'flowering', 'harvest')),
  start_date timestamp with time zone,
  expected_harvest timestamp with time zone,
  nutrients jsonb,
  notes text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.plants enable row level security;

create policy "Users can read own plants"
  on public.plants for select
  using (auth.uid() = user_id);

create policy "Users can create plants"
  on public.plants for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plants"
  on public.plants for update
  using (auth.uid() = user_id);

create policy "Users can delete own plants"
  on public.plants for delete
  using (auth.uid() = user_id);

create index plants_user_id_idx on public.plants(user_id);
```

#### Query 3: Create Check-ins Table

```sql
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  date timestamp with time zone default timezone('utc'::text, now()),
  photo_url text,
  ai_analysis jsonb,
  height_cm decimal(5,2),
  notes text,
  issues text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.checkins enable row level security;

create policy "Users can read checkins for own plants"
  on public.checkins for select
  using (
    exists (
      select 1 from plants
      where plants.id = checkins.plant_id
      and plants.user_id = auth.uid()
    )
  );

create policy "Users can create checkins for own plants"
  on public.checkins for insert
  with check (
    exists (
      select 1 from plants
      where plants.id = plant_id
      and plants.user_id = auth.uid()
    )
  );

create index checkins_plant_id_idx on public.checkins(plant_id);
create index checkins_date_idx on public.checkins(date);
```

#### Query 4: Create Stores Table (Future Feature)

```sql
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code varchar(2),
  city text,
  address text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  tier text default 'basic',
  logo_url text,
  hours jsonb,
  contact jsonb,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.stores enable row level security;

create policy "Anyone can read stores"
  on public.stores for select
  to anon, authenticated
  using (true);

create index stores_country_code_idx on public.stores(country_code);
create index stores_city_idx on public.stores(city);
```

### Step 4: Setup Storage Bucket

1. Go to Supabase dashboard > Storage
2. Click "New bucket"
3. Name: `checkin-photos`
4. Uncheck "Private bucket" (make public)
5. Create

### Step 5: Install Dependencies & Run

The project already has `node_modules` installed with all required packages.

If you need to reinstall:

```bash
npm install
```

### Step 6: Start Development Server

```bash
npm start
```

You'll see a QR code in the terminal.

### Step 7: Test on Device

#### Option A: Expo Go (Easiest)

1. Install Expo Go app on iOS or Android
2. Open the app
3. Scan QR code from terminal
4. Wait for app to load

#### Option B: Android Emulator

```bash
npm run android
```

#### Option C: iOS Simulator (macOS only)

```bash
npm run ios
```

## Testing the App

### 1. Create Account

1. Tap "Regístrate aquí"
2. Fill in:
   - Nombre: Your name
   - Correo: Your email
   - Contraseña: 6+ characters
   - Confirmar: Same password
3. Tap "Crear cuenta"
4. Should see success message

### 2. Login

1. Use the email and password you just created
2. Tap "Iniciar sesión"
3. Should see home dashboard

### 3. Create Plant

1. Tap "Plantas" tab
2. Tap "Agregar" button
3. Fill in:
   - Nombre: "Mi primera planta"
   - Variedad: "Blue Dream"
   - Tipo: Select "hybrid"
   - Fase: Select "seedling"
   - Fecha de inicio: Today
   - Cosecha esperada: 2 months from now
4. Tap "Crear planta"
5. Should appear in plants list

### 4. Do Check-in

1. Tap the plant you created
2. Tap "Nuevo check-in"
3. Tap "Tomar foto" (or pick from gallery if available)
4. Grant camera permissions
5. Take a photo of a plant (any plant works)
6. Wait for AI analysis (Claude will analyze it)
7. Enter height: 45
8. See AI diagnosis and recommendations
9. Tap "Guardar check-in"

### 5. View Results

1. Go back to plant detail
2. Scroll down to see check-in history
3. See photo, AI analysis, and health score

## Troubleshooting

### "EXPO_PUBLIC_SUPABASE_URL is not configured"

- Check `.env` file exists in project root
- Verify you're using `EXPO_PUBLIC_` prefix for env vars
- Restart Expo: press `r` in terminal

### "Failed to fetch user"

- Check Supabase URL and key are correct
- Check Supabase is running and accessible
- Check user was created in Supabase Auth dashboard

### "Claude API error"

- Verify Anthropic API key is correct
- Check you have API credits remaining
- Check image is valid base64

### "Permission denied" for camera/photos

- Grant permissions when prompted
- On iOS: Settings > KaruWeed > Camera/Photos
- On Android: App Settings > Permissions

### App crashes on check-in

1. Check Expo console for error messages
2. Verify Supabase storage bucket exists and is public
3. Check Claude API key is valid
4. Try with a different image

### Storage upload fails

- Verify bucket name is exactly "checkin-photos"
- Make sure bucket is public (not private)
- Check file size is reasonable (< 5MB)

## Development Tips

### Hot Reload

The app will automatically reload when you save files. If it doesn't:
- Press `r` in Expo terminal to reload
- Press `i` to rebuild iOS
- Press `a` to rebuild Android

### View Console Logs

- Expo terminal shows all console.log() output
- Use `expo logs` command for more detailed logs

### Debug Network Requests

- Install React Native Debugger
- Connect via: `expo://192.168.1.X:8081`
- View network tab in debugger

### TypeScript Errors

All files are properly typed. Run `tsc --noEmit` to check for type errors.

## Production Deployment

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Submit to App Store

```bash
eas submit --platform ios
```

### Submit to Google Play

```bash
eas submit --platform android
```

## Important Security Notes

1. **Never commit `.env`** - Already in .gitignore
2. **Rotate API keys** if you accidentally commit them
3. **Use RLS policies** in Supabase (already configured)
4. **Validate on backend** - All data should be validated
5. **HTTPS only** - Always use HTTPS in production
6. **API key in headers** - Never expose in client code (currently in .env which is fine)

## Next Steps

1. Customize app colors in `tailwind.config.js`
2. Add push notifications via expo-notifications
3. Implement real-time updates with Supabase subscriptions
4. Add more plant species and strain data
5. Integrate Google Maps for store locator
6. Add growth prediction model

## Getting Help

- Expo Docs: https://docs.expo.dev
- Supabase Docs: https://supabase.com/docs
- React Native Docs: https://reactnative.dev
- Claude API Docs: https://anthropic.com/docs

## Project Timeline

- **Week 1**: Basic setup, auth, plant CRUD
- **Week 2**: Camera integration, AI analysis
- **Week 3**: Check-in storage, history timeline
- **Week 4**: Polish UI, testing, bug fixes
- **Week 5**: Deployment, App Store submission

Good luck! Happy coding!
