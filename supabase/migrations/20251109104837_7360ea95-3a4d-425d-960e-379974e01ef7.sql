-- First, drop dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_organization ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_with_role() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_organization() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;

-- Drop and recreate the enum
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('organization', 'admin', 'teacher', 'learner');

-- Drop and recreate user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Recreate the has_role function AFTER table exists
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Recreate is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role);
$$;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Update RLS policies for organizations
CREATE POLICY "Organizations and admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role));

CREATE POLICY "Organizations and admins can update their organizations"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  (id IN (SELECT get_user_organizations(auth.uid()))) 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

-- Update RLS policies for outreach_campaigns
CREATE POLICY "Organizations and admins can create campaigns"
ON public.outreach_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can update campaigns"
ON public.outreach_campaigns
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can delete campaigns"
ON public.outreach_campaigns
FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

-- Update organization_members policies
CREATE POLICY "Organizations and admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  (organization_id IN (SELECT get_user_organizations(auth.uid())))
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

CREATE POLICY "Organizations and admins can remove members"
ON public.organization_members
FOR DELETE
TO authenticated
USING (
  (organization_id IN (SELECT get_user_organizations(auth.uid())))
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
);

-- Update schools policies
CREATE POLICY "Organizations and admins can insert schools"
ON public.schools
FOR INSERT
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can update schools"
ON public.schools
FOR UPDATE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

CREATE POLICY "Organizations and admins can delete schools"
ON public.schools
FOR DELETE
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (organization_id IN (SELECT get_user_organizations(auth.uid())))
);

-- Update school_recommendations policies
CREATE POLICY "Organizations and admins can manage recommendations"
ON public.school_recommendations
FOR ALL
TO authenticated
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'organization'::app_role))
  AND (campaign_id IN (
    SELECT outreach_campaigns.id
    FROM outreach_campaigns
    WHERE outreach_campaigns.organization_id IN (SELECT get_user_organizations(auth.uid()))
  ))
);

-- Create a function to handle role assignment during signup
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  default_org_id UUID;
  user_role app_role;
BEGIN
  -- Get role from user metadata, default to 'learner'
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'learner'::app_role
  );
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If user is an organization or admin, create/join organization
  IF user_role IN ('organization', 'admin') THEN
    -- Get or create the default organization
    SELECT id INTO default_org_id
    FROM public.organizations
    WHERE name = 'STEM Outreach Organization'
    LIMIT 1;
    
    -- If no default organization exists, create one
    IF default_org_id IS NULL THEN
      INSERT INTO public.organizations (name)
      VALUES ('STEM Outreach Organization')
      RETURNING id INTO default_org_id;
    END IF;
    
    -- Add the new user to the default organization
    INSERT INTO public.organization_members (organization_id, user_id)
    VALUES (default_org_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_with_role();