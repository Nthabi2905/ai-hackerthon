-- Drop the restrictive policy that requires organization membership
DROP POLICY IF EXISTS "Users can view schools from their organizations" ON public.schools;

-- Create a new policy that allows anyone to view schools
CREATE POLICY "Anyone can view schools"
ON public.schools
FOR SELECT
USING (true);