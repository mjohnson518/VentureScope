-- VentureScope Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (synced from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('angel', 'analyst', 'partner', 'family_office')) DEFAULT 'analyst',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_tier TEXT CHECK (plan_tier IN ('free', 'angel', 'pro', 'enterprise')) DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  assessments_used_this_month INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Memberships
CREATE TABLE IF NOT EXISTS public.org_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, org_id)
);

-- Companies (investment targets)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage TEXT CHECK (stage IN ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth')),
  sector TEXT,
  raise_amount DECIMAL,
  valuation DECIMAL,
  status TEXT CHECK (status IN ('active', 'passed', 'invested', 'watching')) DEFAULT 'active',
  website TEXT,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  classification TEXT CHECK (classification IN (
    'pitch_deck', 'financials', 'cap_table', 'legal',
    'product_demo', 'founder_video', 'customer_reference', 'other'
  )),
  extracted_text TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  type TEXT CHECK (type IN ('screening', 'full')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  content JSONB,
  scores JSONB,
  recommendation TEXT CHECK (recommendation IN (
    'strong_conviction', 'proceed', 'conditional', 'pass'
  )),
  overall_score DECIMAL,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Chat Threads
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Shares
CREATE TABLE IF NOT EXISTS public.assessment_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'comment', 'edit')) DEFAULT 'view',
  shared_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, shared_with_user_id)
);

-- Assessment Comments
CREATE TABLE IF NOT EXISTS public.assessment_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.assessment_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Records (for billing)
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  assessment_type TEXT CHECK (assessment_type IN ('screening', 'full')) NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  email_assessments BOOLEAN DEFAULT true,
  email_comments BOOLEAN DEFAULT true,
  email_sharing BOOLEAN DEFAULT true,
  email_digest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON public.companies(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON public.assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON public.assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON public.chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user_id ON public.org_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org_id ON public.org_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_company_id ON public.chat_threads(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_shares_assessment_id ON public.assessment_shares(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_comments_assessment_id ON public.assessment_comments(assessment_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Can read/update own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Organizations: Members can view their orgs
CREATE POLICY "Org members can view organization" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = organizations.id
      AND org_memberships.user_id = auth.uid()
    )
  );

-- Org Memberships: Users can view memberships for their orgs
CREATE POLICY "Users can view org memberships" ON public.org_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.org_memberships om
      WHERE om.org_id = org_memberships.org_id
      AND om.user_id = auth.uid()
    )
  );

-- Companies: Org members can CRUD
CREATE POLICY "Org members can view companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = companies.org_id
      AND org_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create companies" ON public.companies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = companies.org_id
      AND org_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update companies" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = companies.org_id
      AND org_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can delete companies" ON public.companies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = companies.org_id
      AND org_memberships.user_id = auth.uid()
      AND org_memberships.role IN ('owner', 'admin')
    )
  );

-- Documents: Access through company membership
CREATE POLICY "Org members can view documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = documents.company_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create documents" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = documents.company_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update documents" ON public.documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = documents.company_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can delete documents" ON public.documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = documents.company_id
      AND om.user_id = auth.uid()
    )
  );

-- Assessments: Access through company membership or sharing
CREATE POLICY "Users can view assessments" ON public.assessments
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = assessments.company_id
      AND om.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.assessment_shares
      WHERE assessment_shares.assessment_id = assessments.id
      AND assessment_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create assessments" ON public.assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = assessments.company_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Assessment creators can update" ON public.assessments
  FOR UPDATE USING (created_by = auth.uid());

-- Chat Threads: Access through company membership
CREATE POLICY "Users can view chat threads" ON public.chat_threads
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.companies c
      JOIN public.org_memberships om ON om.org_id = c.org_id
      WHERE c.id = chat_threads.company_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat threads" ON public.chat_threads
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chat Messages: Access through thread ownership
CREATE POLICY "Users can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.id = chat_messages.thread_id
      AND (
        ct.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.companies c
          JOIN public.org_memberships om ON om.org_id = c.org_id
          WHERE c.id = ct.company_id
          AND om.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_threads ct
      WHERE ct.id = chat_messages.thread_id
      AND ct.user_id = auth.uid()
    )
  );

-- Assessment Shares: Owners can manage
CREATE POLICY "Users can view their shares" ON public.assessment_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid() OR
    shared_by = auth.uid()
  );

CREATE POLICY "Assessment owners can share" ON public.assessment_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments
      WHERE assessments.id = assessment_shares.assessment_id
      AND assessments.created_by = auth.uid()
    )
  );

-- Assessment Comments: Access through assessment access
CREATE POLICY "Users can view comments" ON public.assessment_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_comments.assessment_id
      AND (
        a.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.companies c
          JOIN public.org_memberships om ON om.org_id = c.org_id
          WHERE c.id = a.company_id
          AND om.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.assessment_shares ash
          WHERE ash.assessment_id = a.id
          AND ash.shared_with_user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments" ON public.assessment_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.assessment_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Usage Records: Org admins can view
CREATE POLICY "Org admins can view usage" ON public.usage_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = usage_records.org_id
      AND org_memberships.user_id = auth.uid()
      AND org_memberships.role IN ('owner', 'admin')
    )
  );

-- User Settings: Users can manage own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create default organization for new users
CREATE OR REPLACE FUNCTION public.create_default_org_for_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate a unique slug from email
  org_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTR(NEW.id::TEXT, 1, 8);

  -- Create the organization
  INSERT INTO public.organizations (name, slug)
  VALUES (COALESCE(NEW.name, 'My Organization'), org_slug)
  RETURNING id INTO new_org_id;

  -- Add user as owner
  INSERT INTO public.org_memberships (user_id, org_id, role, accepted_at)
  VALUES (NEW.id, new_org_id, 'owner', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default org after user profile is created
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_org_for_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_threads_updated_at
  BEFORE UPDATE ON public.chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_comments_updated_at
  BEFORE UPDATE ON public.assessment_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
