-- Create deal_submissions table for public intake form
CREATE TABLE IF NOT EXISTS public.deal_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  founder_name TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  website TEXT,
  pitch_deck_url TEXT,
  stage TEXT,
  sector TEXT,
  raise_amount DECIMAL,
  description TEXT,
  referral_source TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  company_id UUID REFERENCES public.companies(id),
  notes TEXT
);

-- Add intake_enabled to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS intake_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS intake_custom_message TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deal_submissions_org_id ON public.deal_submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_deal_submissions_status ON public.deal_submissions(org_id, status);
CREATE INDEX IF NOT EXISTS idx_deal_submissions_created_at ON public.deal_submissions(org_id, created_at DESC);

-- RLS policies for deal_submissions
ALTER TABLE public.deal_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only org members can view submissions
CREATE POLICY "Org members can view submissions"
  ON public.deal_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = deal_submissions.org_id
      AND org_memberships.user_id = auth.uid()
    )
  );

-- Policy: Only org admins/owners can update submissions
CREATE POLICY "Org admins can update submissions"
  ON public.deal_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = deal_submissions.org_id
      AND org_memberships.user_id = auth.uid()
      AND org_memberships.role IN ('owner', 'admin')
    )
  );

-- Policy: Allow public insert (for intake form)
CREATE POLICY "Public can insert submissions"
  ON public.deal_submissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations
      WHERE organizations.id = deal_submissions.org_id
      AND organizations.intake_enabled = true
    )
  );

-- Rate limiting table for intake submissions
CREATE TABLE IF NOT EXISTS public.intake_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  ip_address INET NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.intake_rate_limits(org_id, ip_address, created_at);

-- Cleanup old rate limit entries (run periodically)
-- DELETE FROM public.intake_rate_limits WHERE created_at < NOW() - INTERVAL '1 hour';
