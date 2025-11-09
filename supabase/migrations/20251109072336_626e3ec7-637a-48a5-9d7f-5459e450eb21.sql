-- Create function to automatically set up organization for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_org_id uuid;
BEGIN
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
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically add new users to default organization
DROP TRIGGER IF EXISTS on_profile_created_add_to_org ON public.profiles;
CREATE TRIGGER on_profile_created_add_to_org
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_organization();