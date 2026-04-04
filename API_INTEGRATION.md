# KaruWeed API Integration Guide

## Overview

This document details how KaruWeed integrates with external APIs: Supabase and Anthropic Claude.

## 1. Supabase Integration

### Authentication Flow

```
User Input
    ↓
authStore.signUp/signIn()
    ↓
supabase.auth.signUpWithPassword/signInWithPassword()
    ↓
Supabase Auth Service
    ↓
expo-secure-store (token persistence)
    ↓
App Redirect (auth/tabs)
```

### Key Methods

#### Sign Up
```typescript
// In: authStore.ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Create user profile
const { data: profile, error: profileError } = await supabase
  .from('users')
  .insert({
    id: data.user.id,
    email,
    full_name: fullName,
    country_code: countryCode,
    subscription_tier: 'free',
  })
  .select()
  .single();
```

#### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Fetch user profile
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('id', data.user.id)
  .single();
```

### CRUD Operations

#### Create Plant
```typescript
const { data, error } = await supabase
  .from('plants')
  .insert(plant)
  .select()
  .single();
```

#### Read Plants
```typescript
const { data, error } = await supabase
  .from('plants')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

#### Update Plant
```typescript
const { error } = await supabase
  .from('plants')
  .update(updates)
  .eq('id', plantId);
```

#### Delete Plant
```typescript
const { error } = await supabase
  .from('plants')
  .delete()
  .eq('id', plantId);
```

### Check-in Storage

#### Upload Photo
```typescript
const { error } = await supabase.storage
  .from('checkin-photos')
  .upload(filename, {
    uri: photo,
    type: 'image/jpeg',
    name: filename,
  });

const { data: { publicUrl } } = supabase
  .storage
  .from('checkin-photos')
  .getPublicUrl(filename);
```

#### Save Check-in
```typescript
const { error } = await supabase
  .from('checkins')
  .insert({
    plant_id: plantId,
    date: new Date().toISOString(),
    photo_url: publicUrl,
    ai_analysis: analysis,
    height_cm: height,
    notes: notes,
    issues: issues,
  });
```

## 2. Claude Vision API Integration

### Overview

The app uses Claude 3.5 Sonnet's vision capabilities to analyze cannabis plant photos.

### Implementation

**File**: `src/lib/ai.ts`

```typescript
export async function analyzePlantImage(base64Image: string): Promise<AIAnalysis>
```

### Request Format

```typescript
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image, // Without data: prefix
            },
          },
          {
            type: 'text',
            text: CANNABIS_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  }),
})
```

### System Prompt

```
You are an expert cannabis cultivation advisor. Analyze this plant image and provide:
1. A detailed diagnosis of the plant's current state
2. A health score from 0-100
3. 3-5 specific recommendations for improvement
4. Any identified issues or problems

Respond in valid JSON format with these exact keys:
{
  "diagnosis": "string describing the plant's current state",
  "health_score": number from 0-100,
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "identified_issues": ["issue 1", "issue 2", ...] or []
}

Be specific about nutrient deficiencies, pest issues, lighting problems,
growth stage indicators, and environmental concerns for cannabis cultivation.
```

### Response Format

```json
{
  "diagnosis": "Plant shows healthy green coloration with normal leaf structure. Stems appear strong and well-developed. Currently in early vegetative stage with good potential for flowering.",
  "health_score": 82,
  "recommendations": [
    "Increase nitrogen slightly to promote fuller foliage",
    "Ensure consistent 18-hour light cycle for vegetative growth",
    "Monitor humidity levels - currently optimal at 60-70%",
    "Prepare to transition to flowering schedule in 2-3 weeks"
  ],
  "identified_issues": []
}
```

### Error Handling

```typescript
try {
  const response = await fetch('https://api.anthropic.com/v1/messages', { ... });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse JSON response from Claude');
  }

  const analysis: AIAnalysis = JSON.parse(jsonMatch[0]);
  return analysis;
} catch (error) {
  console.error('Error analyzing plant image:', error);
  throw error;
}
```

## 3. Data Flow Diagrams

### Authentication Flow
```
┌─────────────────┐
│  Login Screen   │
└────────┬────────┘
         │
         ├──> authStore.signIn(email, password)
         │
         ├──> supabase.auth.signInWithPassword()
         │
         ├──> expo-secure-store.setItemAsync(token)
         │
         ├──> Fetch user profile from 'users' table
         │
         ├──> Update authStore.user & authStore.session
         │
         └──> Redirect to /(tabs)
```

### Plant Creation Flow
```
┌──────────────────┐
│  New Plant Form  │
└────────┬─────────┘
         │
         ├──> Validate form data
         │
         ├──> plantStore.addPlant(plantData)
         │
         ├──> supabase.from('plants').insert()
         │
         ├──> Update plantStore.plants[]
         │
         └──> Navigate back to plant list
```

### Check-in & AI Analysis Flow
```
┌──────────────────┐
│  Camera/Gallery  │
└────────┬─────────┘
         │
         ├──> Convert image to base64
         │
         ├──> analyzePlantImage(base64)
         │
         ├──> Call Claude Vision API
         │
         ├──> Parse AI response JSON
         │
         ├──> Display analysis to user
         │
         ├──> Upload photo to Supabase Storage
         │
         ├──> Save check-in to 'checkins' table
         │
         └──> Show success message
```

## 4. Rate Limiting & Best Practices

### Anthropic API
- **Rate Limit**: 50,000 requests/minute (pay-as-you-go)
- **Model**: claude-3-5-sonnet-20241022
- **Token Limit**: 200K context window
- **Cost**: ~$0.003 per image analysis

### Supabase
- **Free Tier**: 500K reads, 100K writes per month
- **Connection Pool**: Up to 100 connections
- **Storage**: 1GB for free tier

### Optimization Strategies

1. **Cache Analysis Results**
   - Don't re-analyze same photo
   - Store results in check-in record

2. **Batch Database Queries**
   - Fetch all plants once, then filter locally
   - Use `.select()` efficiently

3. **Image Compression**
   - Use expo-image-picker quality: 0.8
   - Compress base64 before API call

4. **Token Management**
   - Use expo-secure-store for persistence
   - Auto-refresh tokens on app foreground
   - Clear tokens on logout

## 5. Environment Configuration

### Required Environment Variables

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Anthropic
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

### Accessing in Code

```typescript
// These are automatically available from .env
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
```

## 6. Error Handling Best Practices

### Try-Catch Pattern

```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Operation failed:', message);

  // Update state with error
  set({ error: message });

  // Show user-friendly message
  Alert.alert('Error', 'Failed to complete operation');

  throw error; // Re-throw if caller needs to handle
}
```

### Zustand Error Handling

```typescript
// In store
error: null,
clearError: () => set({ error: null }),

// In component
const { error, clearError } = useAuthStore();

useEffect(() => {
  if (error) {
    Alert.alert('Error', error);
    clearError();
  }
}, [error]);
```

## 7. Testing APIs Locally

### Test Supabase Connection

```typescript
// In any screen
import { supabase } from '@/lib/supabase';

useEffect(() => {
  (async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log('Session:', data);
    console.log('Auth error:', error);
  })();
}, []);
```

### Test Claude API

```typescript
import { analyzePlantImage } from '@/lib/ai';

// In check-in component
const testAnalysis = await analyzePlantImage(base64Image);
console.log('AI Analysis:', testAnalysis);
```

## 8. Monitoring & Logging

### Console Output

```typescript
// Auth logs
console.log('User logged in:', user.email);
console.log('Session token:', session);

// Database logs
console.log('Fetched plants:', plants);
console.log('Database error:', error);

// AI logs
console.log('API Response:', analysis);
console.log('Health Score:', analysis.health_score);
```

### Error Tracking (Ready for Sentry)

```typescript
// Install: npm install @sentry/react-native
import * as Sentry from '@sentry/react-native';

try {
  // operation
} catch (error) {
  Sentry.captureException(error);
}
```

## 9. Future API Integrations

### Ready for Implementation
- Google Maps API (store locator)
- Firebase Analytics
- Twilio (SMS notifications)
- Stripe (payments)
- AWS Lambda (image processing)

## 10. API Documentation References

- **Supabase**: https://supabase.com/docs/reference/javascript/introduction
- **Claude**: https://anthropic.com/docs/api/vision
- **Expo**: https://docs.expo.dev/

---

For questions or issues with API integration, refer to the main README.md or SETUP_GUIDE.md.
