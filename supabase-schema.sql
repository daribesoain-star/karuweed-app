-- ============================================
-- KARUWEED - Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. TABLA: profiles (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  country_code TEXT DEFAULT 'CL',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: plants
CREATE TABLE public.plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strain TEXT,
  strain_type TEXT CHECK (strain_type IN ('indica', 'sativa', 'hybrid', 'auto')),
  stage TEXT DEFAULT 'germination' CHECK (stage IN ('germination', 'seedling', 'vegetative', 'flowering', 'harvest', 'drying', 'curing')),
  start_date DATE DEFAULT CURRENT_DATE,
  expected_harvest DATE,
  nutrients JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: checkins
CREATE TABLE public.checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  photo_url TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  height_cm NUMERIC,
  notes TEXT,
  issues TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: stores
CREATE TABLE public.stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT DEFAULT 'CL',
  city TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'silver', 'gold', 'platinum')),
  logo_url TEXT,
  hours JSONB DEFAULT '{}'::jsonb,
  contact JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: products (para marketplace futuro)
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  price NUMERIC,
  currency TEXT DEFAULT 'CLP',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDICES para performance
-- ============================================
CREATE INDEX idx_plants_user_id ON public.plants(user_id);
CREATE INDEX idx_plants_active ON public.plants(user_id, is_active);
CREATE INDEX idx_checkins_plant_id ON public.checkins(plant_id);
CREATE INDEX idx_checkins_user_id ON public.checkins(user_id);
CREATE INDEX idx_checkins_date ON public.checkins(date DESC);
CREATE INDEX idx_stores_location ON public.stores(latitude, longitude);
CREATE INDEX idx_stores_country ON public.stores(country_code);
CREATE INDEX idx_products_store ON public.products(store_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================

-- Profiles: usuarios solo ven y editan su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Plants: usuarios solo ven y gestionan sus propias plantas
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plants"
  ON public.plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plants"
  ON public.plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants"
  ON public.plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants"
  ON public.plants FOR DELETE
  USING (auth.uid() = user_id);

-- Checkins: usuarios solo ven y crean sus propios check-ins
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checkins"
  ON public.checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON public.checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Stores: todos pueden ver, nadie puede crear desde el cliente
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stores"
  ON public.stores FOR SELECT
  USING (true);

-- Products: todos pueden ver productos activos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- ============================================
-- STORAGE Bucket para fotos de plantas
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true);

-- Politica: usuarios pueden subir sus propias fotos
CREATE POLICY "Users can upload plant photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politica: fotos publicas para leer
CREATE POLICY "Plant photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-photos');

-- Politica: usuarios pueden eliminar sus propias fotos
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- TRIGGER: Crear perfil automaticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: updated_at automatico
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- DATOS DE EJEMPLO: Tiendas en Chile
-- ============================================
INSERT INTO public.stores (name, country_code, city, address, latitude, longitude, tier, contact, description, is_verified) VALUES
('Green House Grow', 'CL', 'Santiago', 'Av. Providencia 1234, Providencia', -33.4265, -70.6150, 'gold', '{"phone": "+56912345678", "instagram": "@greenhousegrow"}', 'Grow shop especializado en cultivo indoor y outdoor', true),
('Cultivo Nacional', 'CL', 'Santiago', 'Av. Irarrázaval 4567, Ñuñoa', -33.4520, -70.5980, 'silver', '{"phone": "+56987654321", "instagram": "@cultivonacional"}', 'Todo para tu cultivo: semillas, nutrientes y equipos', true),
('SeedBank Chile', 'CL', 'Valparaíso', 'Av. Pedro Montt 890, Valparaíso', -33.0472, -71.6127, 'basic', '{"phone": "+56911112222", "instagram": "@seedbankchile"}', 'Banco de semillas con genéticas premium', false),
('Indoor Pro', 'CL', 'Concepción', 'Calle Barros Arana 567, Concepción', -36.8270, -73.0503, 'silver', '{"phone": "+56933334444", "instagram": "@indoorpro"}', 'Especialistas en cultivo indoor con tecnología LED', true);

-- ============================================
-- FIN DEL SCHEMA
-- Ejecutar este archivo COMPLETO en Supabase SQL Editor
-- ============================================
