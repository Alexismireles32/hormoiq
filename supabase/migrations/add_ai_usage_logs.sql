-- Create AI usage logs table for tracking and billing
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'gpt-4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only the service (Edge Functions) can insert logs
CREATE POLICY "Service can insert usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all logs
CREATE POLICY "Admins can view all usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Create a view for daily usage stats
CREATE OR REPLACE VIEW daily_ai_usage AS
SELECT 
  user_id,
  DATE(created_at) as usage_date,
  COUNT(*) as request_count,
  SUM(total_tokens) as total_tokens,
  SUM(estimated_cost) as total_cost,
  AVG(total_tokens) as avg_tokens_per_request
FROM ai_usage_logs
GROUP BY user_id, DATE(created_at);

-- Grant access to the view
GRANT SELECT ON daily_ai_usage TO authenticated;

-- Add RLS to the view
ALTER VIEW daily_ai_usage SET (security_invoker = on);

