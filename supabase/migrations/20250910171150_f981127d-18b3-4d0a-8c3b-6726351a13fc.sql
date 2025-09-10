-- Phase 1 Critical Security Fixes: Row Level Security Policy Updates

-- Fix leads table policies to require proper authentication
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
CREATE POLICY "Users can view their own leads" ON leads
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can update leads" ON leads;
CREATE POLICY "Users can update their own leads" ON leads  
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Fix menu_uploads policies to require authentication
DROP POLICY IF EXISTS "Users can view their own menu uploads" ON menu_uploads;
CREATE POLICY "Users can view their own menu uploads" ON menu_uploads
FOR SELECT USING (auth.uid() IS NOT NULL AND user_email = auth.email());

DROP POLICY IF EXISTS "Users can update their own menu uploads" ON menu_uploads;
CREATE POLICY "Users can update their own menu uploads" ON menu_uploads
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_email = auth.email());

-- Fix user_onboarding_drafts policies to require authentication
DROP POLICY IF EXISTS "Users can view their own onboarding drafts" ON user_onboarding_drafts;
CREATE POLICY "Users can view their own onboarding drafts" ON user_onboarding_drafts
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own onboarding drafts" ON user_onboarding_drafts;
CREATE POLICY "Users can update their own onboarding drafts" ON user_onboarding_drafts
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own onboarding drafts" ON user_onboarding_drafts;
CREATE POLICY "Users can create their own onboarding drafts" ON user_onboarding_drafts
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Fix user_onboarding_progress policies to require authentication  
DROP POLICY IF EXISTS "Users can view their own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can view their own onboarding progress" ON user_onboarding_progress
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can update their own onboarding progress" ON user_onboarding_progress
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own onboarding progress" ON user_onboarding_progress;
CREATE POLICY "Users can create their own onboarding progress" ON user_onboarding_progress
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Fix users table policies to require proper authentication
DROP POLICY IF EXISTS "Users can view their own record" ON users;
CREATE POLICY "Users can view their own record" ON users
FOR SELECT USING (auth.uid() IS NOT NULL AND ((email)::text = auth.email() OR (auth.uid())::text = (id)::text));

DROP POLICY IF EXISTS "Users can update their own record" ON users;
CREATE POLICY "Users can update their own record" ON users
FOR UPDATE USING (auth.uid() IS NOT NULL AND ((email)::text = auth.email() OR (auth.uid())::text = (id)::text));

-- Add missing NOT NULL constraints for security
ALTER TABLE leads ALTER COLUMN user_id SET NOT NULL;

-- Update database functions with secure search_path
ALTER FUNCTION get_landing_page_analytics SET search_path = public;
ALTER FUNCTION update_updated_at_column SET search_path = public;
ALTER FUNCTION touch_updated_at SET search_path = public;