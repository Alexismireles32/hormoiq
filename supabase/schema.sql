-- HormoIQ Database Schema
-- Run this in your Supabase SQL Editor to set up all tables

-- ============================================
-- USERS TABLE (Extended from auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  birth_year INTEGER,
  age INTEGER, -- Current age for BioAge calculations
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  goals TEXT[], -- ['energy', 'fitness', 'sleep', 'stress']
  on_hormone_therapy BOOLEAN DEFAULT false, -- Currently taking HRT/TRT/BC
  hormone_therapy_unknown BOOLEAN DEFAULT false, -- User not sure about therapy status
  onboarding_completed BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false, -- Admin access flag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HORMONE TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hormone_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hormone_type TEXT NOT NULL CHECK (hormone_type IN ('cortisol', 'testosterone', 'dhea')),
  value DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  exercised BOOLEAN,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  supplements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hormone_tests_user ON hormone_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_hormone_tests_timestamp ON hormone_tests(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hormone_tests_user_timestamp ON hormone_tests(user_id, timestamp DESC);

-- ============================================
-- READY SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ready_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  contributing_factors JSONB,
  protocol TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ready_scores_user ON ready_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ready_scores_date ON ready_scores(date DESC);

-- ============================================
-- BIO AGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bio_ages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chronological_age INTEGER NOT NULL,
  biological_age DECIMAL NOT NULL,
  delta DECIMAL, -- chrono - bio (positive = younger)
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  breakdown JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bio_ages_user ON bio_ages(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_ages_calculated ON bio_ages(calculated_at DESC);

-- ============================================
-- PROTOCOLS TABLE (Library of optimization protocols)
-- ============================================
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('sleep', 'stress', 'exercise', 'nutrition', 'supplements', 'lifestyle')),
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'hard')),
  duration_days INTEGER, -- How many days to follow
  target_hormones TEXT[], -- ['cortisol', 'testosterone', 'dhea']
  instructions JSONB, -- Daily instructions
  expected_results TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_protocols_category ON protocols(category);

-- ============================================
-- USER PROTOCOLS TABLE (User's active/completed protocols)
-- ============================================
CREATE TABLE IF NOT EXISTS user_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  protocol_id UUID REFERENCES protocols(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('active', 'completed', 'stopped')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  UNIQUE(user_id, protocol_id, started_at)
);

CREATE INDEX IF NOT EXISTS idx_user_protocols_user ON user_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_user_protocols_status ON user_protocols(status);

-- ============================================
-- PROTOCOL LOGS TABLE (Daily compliance tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS protocol_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_protocol_id UUID REFERENCES user_protocols(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_protocol_id, date)
);

CREATE INDEX IF NOT EXISTS idx_protocol_logs_user_protocol ON protocol_logs(user_protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_logs_date ON protocol_logs(date DESC);

-- ============================================
-- IMPACT ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS impact_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  intervention_name TEXT NOT NULL,
  intervention_type TEXT CHECK (intervention_type IN ('supplement', 'habit', 'context', 'protocol')),
  hormone_affected TEXT CHECK (hormone_affected IN ('cortisol', 'testosterone', 'dhea')),
  effect_size DECIMAL, -- Percentage change
  p_value DECIMAL,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  tests_with INTEGER,
  tests_without INTEGER,
  recommendation TEXT CHECK (recommendation IN ('keep', 'stop', 'need_more_data')),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impact_analyses_user ON impact_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_impact_analyses_intervention ON impact_analyses(intervention_name);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_provided JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, timestamp DESC);

-- ============================================
-- USER PATTERNS TABLE (for smart defaults)
-- ============================================
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_value TEXT NOT NULL,
  confidence DECIMAL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pattern_type)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hormone_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_ages ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Hormone tests policies
CREATE POLICY "Users can view own tests" ON hormone_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests" ON hormone_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests" ON hormone_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests" ON hormone_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Ready scores policies
CREATE POLICY "Users can view own ready scores" ON ready_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ready scores" ON ready_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ready scores" ON ready_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Bio ages policies
CREATE POLICY "Users can view own bio ages" ON bio_ages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bio ages" ON bio_ages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Impact analyses policies
CREATE POLICY "Users can view own impact analyses" ON impact_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impact analyses" ON impact_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User patterns policies
CREATE POLICY "Users can view own patterns" ON user_patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns" ON user_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON user_patterns
  FOR UPDATE USING (auth.uid() = user_id);

-- Protocols policies (read-only for all users)
CREATE POLICY "Anyone can view protocols" ON protocols
  FOR SELECT USING (true);

-- User protocols policies
CREATE POLICY "Users can view own user protocols" ON user_protocols
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user protocols" ON user_protocols
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user protocols" ON user_protocols
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user protocols" ON user_protocols
  FOR DELETE USING (auth.uid() = user_id);

-- Protocol logs policies
CREATE POLICY "Users can view own protocol logs" ON protocol_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_protocols
      WHERE user_protocols.id = protocol_logs.user_protocol_id
      AND user_protocols.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own protocol logs" ON protocol_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_protocols
      WHERE user_protocols.id = protocol_logs.user_protocol_id
      AND user_protocols.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own protocol logs" ON protocol_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_protocols
      WHERE user_protocols.id = protocol_logs.user_protocol_id
      AND user_protocols.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own protocol logs" ON protocol_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_protocols
      WHERE user_protocols.id = protocol_logs.user_protocol_id
      AND user_protocols.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT ht.id) as total_tests,
  COUNT(DISTINCT DATE(ht.timestamp)) as days_tested,
  MAX(ht.timestamp) as last_test_date,
  MIN(ht.timestamp) as first_test_date,
  (SELECT COUNT(*) FROM ready_scores WHERE user_id = u.id) as total_ready_scores,
  (SELECT COUNT(*) FROM bio_ages WHERE user_id = u.id) as total_bio_ages,
  (SELECT COUNT(*) FROM chat_messages WHERE user_id = u.id AND role = 'user') as total_chat_messages
FROM users u
LEFT JOIN hormone_tests ht ON u.id = ht.user_id
GROUP BY u.id, u.email;

-- ============================================
-- INITIAL DATA / SEED DATA (Optional)
-- ============================================

-- You can add default goals or other reference data here if needed

-- ============================================
-- NOTES FOR IMPLEMENTATION
-- ============================================
-- 
-- 1. After creating these tables, verify RLS is working by testing queries
-- 2. Create a Supabase Edge Function for GPT-4 integration
-- 3. Set up database backups in Supabase dashboard
-- 4. Monitor query performance and add indexes as needed
-- 5. Consider adding a "deleted_at" column for soft deletes if needed
--

