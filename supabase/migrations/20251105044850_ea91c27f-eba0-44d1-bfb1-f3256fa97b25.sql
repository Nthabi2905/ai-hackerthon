-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nat_emis TEXT UNIQUE NOT NULL,
  province TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  status TEXT,
  sector TEXT,
  type_doe TEXT,
  phase_ped TEXT,
  district TEXT,
  circuit TEXT,
  quintile TEXT,
  no_fee_school TEXT,
  urban_rural TEXT,
  longitude DECIMAL(10, 7),
  latitude DECIMAL(10, 7),
  town_city TEXT,
  suburb TEXT,
  township_village TEXT,
  street_address TEXT,
  postal_address TEXT,
  telephone TEXT,
  learners_2024 INTEGER,
  educators_2024 INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on province and district for faster searches
CREATE INDEX idx_schools_province ON public.schools(province);
CREATE INDEX idx_schools_district ON public.schools(district);
CREATE INDEX idx_schools_location ON public.schools(longitude, latitude);

-- Enable RLS but make schools publicly readable (public data)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools are viewable by everyone" 
ON public.schools 
FOR SELECT 
USING (true);