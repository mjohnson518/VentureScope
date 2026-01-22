-- Add pipeline_position column for Kanban view ordering
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS pipeline_position INTEGER DEFAULT 0;

-- Create index for efficient ordering by status and position
CREATE INDEX IF NOT EXISTS idx_companies_status_position ON public.companies(org_id, status, pipeline_position);

-- Set initial positions based on creation order
UPDATE public.companies
SET pipeline_position = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY org_id, status ORDER BY created_at DESC) as row_num
  FROM public.companies
) AS subquery
WHERE public.companies.id = subquery.id;
