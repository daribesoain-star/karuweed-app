# KaruWeed Quick Start Checklist

## Before You Run

- [ ] Get Supabase URL and anon key
- [ ] Get Anthropic API key
- [ ] Edit `.env` file with your keys
- [ ] Create Supabase database tables (see SETUP_GUIDE.md)
- [ ] Create `checkin-photos` storage bucket in Supabase

## Getting Started (5 minutes)

```bash
# 1. Navigate to project
cd /sessions/inspiring-focused-maxwell/karuweed-app

# 2. Start development server
npm start

# 3. Scan QR code with Expo Go app on your phone
# OR press 'a' for Android or 'i' for iOS
```

## Test Flow (10 minutes)

1. **Sign Up**
   - Email: test@example.com
   - Password: test123456
   - Full name: Test User

2. **Create Plant**
   - Name: Test Plant
   - Strain: Blue Dream
   - Type: Hybrid
   - Stage: Seedling
   - Start: Today
   - Harvest: 60 days from now

3. **Check-in**
   - Take or pick a plant photo
   - Wait for AI analysis
   - Height: 45 cm
   - Save

4. **View Results**
   - See plant detail
   - View check-in history
   - See AI analysis

## File Locations

```
Configuration:
- .env                    (Add your API keys here)
- app.json               (Expo config)
- tsconfig.json          (TypeScript)
- tailwind.config.js     (Colors & styling)

Source Code:
- src/lib/               (Types, Supabase, AI)
- src/store/             (Auth & Plants state)
- src/components/        (Reusable UI)
- app/                   (Screens & routing)

Documentation:
- README.md              (Full overview)
- SETUP_GUIDE.md         (Detailed setup)
- API_INTEGRATION.md     (API reference)
- PROJECT_SUMMARY.md     (Architecture)
- QUICK_START.md         (This file)
```

## Key Features Ready

- ✅ User authentication
- ✅ Plant management
- ✅ Camera integration
- ✅ Claude Vision AI analysis
- ✅ Check-in history
- ✅ Dark mode UI
- ✅ Spanish interface
- ✅ Secure storage

## Common Commands

```bash
# Start dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## API Keys to Add

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
EXPO_PUBLIC_ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
```

## Color Scheme

- Dark: #0A0A0A
- Green: #22C55E
- Orange: #C47A2C
- Cards: #1A1A2E

## Troubleshooting

**App won't load?**
- Check `.env` file exists with correct keys
- Restart Expo: press `r` in terminal
- Clear cache: `npm start -- --reset-cache`

**Camera not working?**
- Grant camera permissions on device
- Check expo-camera is installed

**AI analysis fails?**
- Verify Anthropic API key
- Check image is valid
- Ensure API has available credits

**Database errors?**
- Verify Supabase tables exist
- Check RLS policies are enabled
- Verify storage bucket is public

## Next Steps

1. Read `README.md` for full overview
2. Follow `SETUP_GUIDE.md` for detailed setup
3. Check `API_INTEGRATION.md` for API details
4. Start building!

## Project Stats

- 22 TypeScript/TSX files
- 33 total configuration & documentation files
- 5 reusable components
- 12 screens/pages
- 3 data stores
- 3 external APIs integrated
- 100% dark mode UI
- 100% Spanish localization

## Support

For issues or questions, check:
- README.md - General overview
- SETUP_GUIDE.md - Setup problems
- API_INTEGRATION.md - API issues
- Code comments - Implementation details

---

Ready to build something amazing with KaruWeed!
