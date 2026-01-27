-- IC Voting Rounds table
CREATE TABLE IF NOT EXISTS public.ic_voting_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  title VARCHAR(255),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  deadline TIMESTAMPTZ NOT NULL,
  quorum_percentage INTEGER DEFAULT 50 CHECK (quorum_percentage > 0 AND quorum_percentage <= 100),
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IC Votes table
CREATE TABLE IF NOT EXISTS public.ic_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.ic_voting_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  vote VARCHAR(20) CHECK (vote IN ('strong_yes', 'yes', 'neutral', 'no', 'strong_no')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

-- IC Round Participants table
CREATE TABLE IF NOT EXISTS public.ic_round_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.ic_voting_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(round_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ic_voting_rounds_assessment ON public.ic_voting_rounds(assessment_id);
CREATE INDEX IF NOT EXISTS idx_ic_voting_rounds_org ON public.ic_voting_rounds(org_id);
CREATE INDEX IF NOT EXISTS idx_ic_voting_rounds_status ON public.ic_voting_rounds(org_id, status);
CREATE INDEX IF NOT EXISTS idx_ic_votes_round ON public.ic_votes(round_id);
CREATE INDEX IF NOT EXISTS idx_ic_votes_user ON public.ic_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_ic_participants_round ON public.ic_round_participants(round_id);
CREATE INDEX IF NOT EXISTS idx_ic_participants_user ON public.ic_round_participants(user_id);

-- RLS Policies
ALTER TABLE public.ic_voting_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ic_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ic_round_participants ENABLE ROW LEVEL SECURITY;

-- IC Voting Rounds: Org members can view
CREATE POLICY "Org members can view voting rounds"
  ON public.ic_voting_rounds
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = ic_voting_rounds.org_id
      AND org_memberships.user_id = auth.uid()
    )
  );

-- IC Voting Rounds: Admins can insert
CREATE POLICY "Admins can create voting rounds"
  ON public.ic_voting_rounds
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = ic_voting_rounds.org_id
      AND org_memberships.user_id = auth.uid()
      AND org_memberships.role IN ('owner', 'admin')
    )
  );

-- IC Voting Rounds: Admins can update
CREATE POLICY "Admins can update voting rounds"
  ON public.ic_voting_rounds
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_memberships
      WHERE org_memberships.org_id = ic_voting_rounds.org_id
      AND org_memberships.user_id = auth.uid()
      AND org_memberships.role IN ('owner', 'admin')
    )
  );

-- IC Votes: Participants can view their own votes
CREATE POLICY "Users can view votes in their rounds"
  ON public.ic_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ic_voting_rounds r
      JOIN public.org_memberships om ON om.org_id = r.org_id
      WHERE r.id = ic_votes.round_id
      AND om.user_id = auth.uid()
    )
  );

-- IC Votes: Participants can insert their own vote
CREATE POLICY "Participants can submit votes"
  ON public.ic_votes
  FOR INSERT
  WITH CHECK (
    ic_votes.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.ic_round_participants
      WHERE round_id = ic_votes.round_id
      AND user_id = auth.uid()
    )
  );

-- IC Participants: Org members can view
CREATE POLICY "Org members can view participants"
  ON public.ic_round_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ic_voting_rounds r
      JOIN public.org_memberships om ON om.org_id = r.org_id
      WHERE r.id = ic_round_participants.round_id
      AND om.user_id = auth.uid()
    )
  );

-- IC Participants: Admins can manage
CREATE POLICY "Admins can manage participants"
  ON public.ic_round_participants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ic_voting_rounds r
      JOIN public.org_memberships om ON om.org_id = r.org_id
      WHERE r.id = ic_round_participants.round_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );
