# HormoIQ MVP - Product Requirements Document
**The 5-Feature Hormone Optimization System**

---

## VISION

Build a mobile app that transforms hormone numbers into a daily optimization system. Users test their hormones, get a daily readiness score, discover what works for their biology, and use AI coaching to optimize.

**Core Promise:** "After 30 days, you'll know your body better than ever. After 90 days, you'll have quantified exactly what optimizes YOUR hormones."

---

## THE 5 CORE FEATURES

These features form a closed loop system. Each one feeds data to the others, creating compounding intelligence.

---

## FEATURE 1: TEST™ - Manual Hormone Input

### Purpose
Capture hormone test data with context. This is the fuel for everything else.

### User Flow

**Step 1: Select Hormone**
- Screen shows 3 large buttons:
  - **Cortisol** (💧 blue) - "Stress Hormone"
  - **Testosterone** (⚡ red) - "Performance Hormone"  
  - **DHEA** (🔥 orange) - "Vitality Hormone"
- User taps one

**Step 2: Input Value**
- Show hormone name at top
- Display a **horizontal slider** with range:
  - **Cortisol:** 0-50 ng/mL (optimal zone: 8-25 highlighted in green)
  - **Testosterone:** 0-1500 ng/dL (optimal: men 300-1000, women 15-70)
  - **DHEA:** 0-1000 ng/dL (optimal: 200-500)
- User drags slider OR types exact number
- Show where their value falls: "Below Optimal" / "Optimal" / "Above Optimal"

**Step 3: Add Context (Required)**
These tags are critical for pattern detection:

1. **Date/Time** (auto-filled to now, editable)
2. **Sleep Quality** (1-5 stars, tap to select)
3. **Exercise Today?** (Yes/No toggle)
4. **Stress Level** (5 emoji buttons: 😌 😊 😐 😰 😫)
5. **Supplements** (optional text input, placeholder: "Vitamin D, Zinc...")

**Step 4: Save & Insight**
- Animated checkmark
- Immediate feedback:
  - "Your cortisol of 15 ng/mL is optimal for morning"
  - "This is your 3rd test this week 🔥"
  - If anomaly: "This is 40% higher than your average. Everything okay?"
- Auto-navigate to Track tab after 3 seconds

### What to Store

```typescript
interface HormoneTest {
  id: string;
  user_id: string;
  hormone_type: 'cortisol' | 'testosterone' | 'dhea';
  value: number;
  timestamp: Date;
  context: {
    sleep_quality: 1 | 2 | 3 | 4 | 5;
    exercised: boolean;
    stress_level: 1 | 2 | 3 | 4 | 5;
    supplements?: string;
  };
  created_at: Date;
}
```

### Intelligence Needed

**Immediate Calculations:**
- Compare to optimal range for their demographics
- Calculate % difference from their personal average
- Detect if it's a personal record (high or low)
- Flag anomalies (>40% deviation from average)

**Pattern Detection (Background):**
- After 5+ tests: Start looking for correlations
- Sleep quality → hormone levels
- Exercise → next-day hormone response
- Stress → cortisol patterns
- Day of week patterns

### Retention Mechanics

**Streak Tracking:**
- Count consecutive days with at least 1 test
- Show 🔥 with number in tab icon
- Lose streak after 48 hours
- Push notification before streak breaks: "Test in 6 hours to keep your 12-day streak"

**Progress to Unlocks:**
- After 3 tests: Unlock BioAge calculation
- After 10 tests: Unlock Impact™ analysis
- After 15 tests: Unlock personalized predictions
- Show progress: "2 more tests to unlock BioAge!"

---

## FEATURE 2: READYSCORE™ - Daily Readiness Number

### Purpose
Give users ONE number to check every morning that tells them how to approach their day. This becomes the daily habit anchor.

### What It Shows

**The Score (Hero Element):**
- Large circular progress ring (animated)
- Number 0-100 in center (72pt font)
- Color-coded:
  - 80-100: Green ring - "Ready ⚡"
  - 60-79: Yellow ring - "Good 👍"
  - 40-59: Orange ring - "Moderate ⚠️"
  - 0-39: Red ring - "Recovering 🛌"

**Below Score:**
- Last updated: "Based on your 8 AM cortisol (2 hours ago)"
- Confidence: "High confidence ✅" or "Update with test for accuracy"

**The Protocol (3-4 Recommendations):**

Based on score, show personalized advice:

**80-100 (Ready):**
- "Perfect day for high-intensity training"
- "Schedule challenging tasks and meetings"
- "Your biology supports peak performance"

**60-79 (Good):**
- "Good for steady-state work"
- "Moderate intensity exercise recommended"
- "Reliable day, not peak but solid"

**40-59 (Moderate):**
- "Recovery focus - light movement only"
- "Handle routine tasks, delegate hard ones"
- "Early bedtime recommended (9 PM)"

**0-39 (Recovering):**
- "Rest day - no intense exercise"
- "Prioritize sleep and stress management"
- "This is temporary - recovery in 1-2 days"

**Quick Actions:**
- "Take Test Now" button (goes to Test tab)
- "Ask Why" button (goes to Ask tab with pre-filled question)

### Algorithm

**Base Calculation:**

```
Start: 50 (baseline)

Cortisol contribution (+/- 20 points):
- If in optimal range (8-25 ng/mL): +20
- If slightly off (6-8 or 25-30): +10
- If significantly off (<6 or >30): -10

Testosterone contribution (+/- 15 points):
- If in optimal range: +15
- If borderline: +5
- If low: -10

DHEA contribution (+/- 10 points):
- If in optimal range: +10
- If borderline: 0
- If low: -5

Context modifiers (+/- 15 points):
- Sleep 4-5 stars: +10
- Sleep 1-2 stars: -10
- Exercise yesterday: +5 (recovery bonus if no test today)
- High stress (4-5): -10

Trend bonus (+/- 10 points):
- Improving over last 3 tests: +10
- Declining over last 3 tests: -10

Final: Clamp between 0-100
```

**Confidence Calculation:**
- High: Test within last 12 hours + 10+ historical tests
- Medium: Test within 24 hours OR 5-10 historical tests
- Low: Test >24 hours ago OR <5 historical tests

**Show Predictions:**
- "Tomorrow's predicted ReadyScore: 75-82 (based on your pattern)"
- Updates daily as more data collected

### What to Store

```typescript
interface ReadyScore {
  id: string;
  user_id: string;
  date: Date;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  contributing_factors: {
    cortisol_score: number;
    testosterone_score: number;
    dhea_score: number;
    context_bonus: number;
    trend_bonus: number;
  };
  protocol: string[]; // Array of recommendations
  created_at: Date;
}
```

### Intelligence Needed

**Personalization Over Time:**
- First 5 tests: Use population averages for ranges
- Tests 6-20: Blend population + personal data (weight shifts from 80/20 → 50/50)
- Tests 21+: Mostly personal data (80% personal, 20% population)

**Learn Individual Patterns:**
- Their optimal ranges (might be different from population)
- Their day-of-week patterns (Mondays always higher cortisol?)
- Their recovery speed (how long after stress/exercise to normalize?)

**Prediction Accuracy Tracking:**
- Store: predicted score, actual score
- Calculate: mean absolute error
- Show user: "Our predictions are 82% accurate for you (improving!)"

### Retention Mechanics

**Daily Check-In:**
- Push notification at 8 AM: "Your ReadyScore is 76 today ⚡"
- Variable reward: Sometimes expected, sometimes surprising
- Creates: "I wonder what my score is today?" curiosity

**Validation Loop:**
- User checks score → Acts on it → Tests later → Sees if prediction was right
- Builds trust: "The app knows my body"

---

## FEATURE 3: BIOAGE™ - Biological Age Calculation

### Purpose
Single relatable metric that makes hormones understandable and shareable. "I'm 35 but biologically 28" is brag-worthy.

### What It Shows

**Hero Card (Top of Track Tab):**
- Large display: "28" (biological age in 60pt font)
- Label: "Your BioAge"
- Comparison: "Your chronological age: 35"
- Delta: "You're 7 years younger biologically 🎉"
- Confidence: "Based on 24 tests over 8 weeks - High confidence ✅"

**Breakdown (Expandable):**
Show what contributes:
- Cortisol: -2 years (optimal management)
- Testosterone: -3 years (above average for age)
- DHEA: -1 year (good levels)
- Consistency: -1 year (regular testing/optimization)

**Below Card:**
- Trend chart: BioAge over last 30 days
- Share button: "Share My BioAge" (generates image for social)

### Algorithm

```
Start: Chronological age

Cortisol adjustment (-1 to +2 years):
- Consistently optimal (80%+ tests in range): -1 year
- Mixed (40-80% in range): 0 years
- Consistently poor (<40% in range): +1 year
- Very poor: +2 years

Testosterone adjustment (-1 to +2 years):
- Same logic as cortisol

DHEA adjustment (-0.5 to +1 year):
- Optimal: -0.5 years
- Borderline: 0 years
- Low: +0.5 years
- Very low: +1 year

Trend factor (-0.5 to +0.5 years):
- Improving trend (hormones getting better): -0.5
- Stable: 0
- Declining trend: +0.5

Consistency bonus (-1 year):
- If testing 3+ times per week for 4+ weeks: -1 year

Final: Round to nearest integer
```

**Unlock Condition:**
- Requires minimum 10 tests over at least 2 weeks
- Before unlock: Show blurred number with "Unlock after 7 more tests"

### What to Store

```typescript
interface BioAge {
  id: string;
  user_id: string;
  chronological_age: number;
  biological_age: number;
  delta: number; // chrono - bio (positive = younger)
  confidence: 'high' | 'medium' | 'low';
  breakdown: {
    cortisol_years: number;
    testosterone_years: number;
    dhea_years: number;
    trend_years: number;
    consistency_bonus: number;
  };
  calculated_at: Date;
}
```

### Intelligence Needed

**Recalculation Frequency:**
- After every new test (background calculation)
- Only update displayed value if change >0.5 years (avoid constant fluctuation)

**Confidence Scoring:**
- High: 20+ tests over 4+ weeks
- Medium: 10-20 tests over 2-4 weeks
- Low: <10 tests or <2 weeks

**Social Proof:**
- Calculate percentile: "You rank in top 18% of men age 30-40"
- Show anonymously: Never reveal individual data

### Retention Mechanics

**Achievement Unlock:**
- First BioAge: Badge unlocked, confetti animation
- BioAge improves by 2+ years: Push notification + celebration

**Shareable Moment:**
- Generate pretty image with: BioAge, delta, date
- Include HormoIQ branding subtly
- One-tap share to Instagram/Twitter
- Drives viral acquisition

**Competitive Motivation:**
- "You're aging backwards. Can you reach -10 years?"
- Progress bar showing improvement potential

---

## FEATURE 4: IMPACT™ - Intervention Effectiveness

### Purpose
Show users what supplements/habits actually affect THEIR hormones. Saves money, proves ROI, creates sticky value.

### What It Shows

**Impact Score (Top):**
- "Your Optimization Score: 73/100"
- Based on: % of interventions showing positive effects
- Subtext: "12 interventions tracked, 9 working"

**What's Working (Green Section):**

For each working intervention:
```
💊 Vitamin D (3000 IU morning)
→ Testosterone: +18% average
→ Data: 12 tests with vs 15 without
→ Confidence: High ✅
→ Recommendation: Keep taking
→ Cost: $25/month - WORTH IT
```

Show top 3-5 most effective

**What's Not Working (Red Section):**

```
🐟 Fish Oil (1000mg daily)
→ Effect: No measurable change (-2%)
→ Data: 10 tests with vs 12 without
→ Confidence: Medium 🟡
→ Recommendation: Consider stopping
→ Potential Savings: $30/month
```

**Need More Data (Gray Section):**
```
🧘 Meditation
→ Status: Only 3 tests while meditating
→ Need: 5 more tests to analyze
→ Action: Keep logging when you meditate
```

**Life Correlations Discovered:**
```
📉 Alcohol → -34% testosterone (2-3 day effect)
Pattern: Any drinking event drops T for 48-72h
Data: 6 tests after social events vs 18 sober days

☕ Coffee after 2 PM → +18% evening cortisol
But: Doesn't affect morning levels
Pattern: Detected in 8 late-caffeine days
```

### Algorithm (Correlation Detection)

**Requirements Before Analysis:**
- Minimum 15 total tests
- Minimum 5 tests in "with intervention" group
- Minimum 5 tests in "without intervention" group

**Process:**

1. **Parse Supplements from Text:**
   - From "supplements" field, extract: Vitamin D, Zinc, Ashwagandha, etc.
   - Use keyword matching: "vitamin d", "vit d", "d3" → all map to "Vitamin D"
   - Build list of unique interventions mentioned

2. **Group Tests:**
   - For each intervention: tests WITH vs tests WITHOUT
   - For each hormone: calculate average in each group

3. **Statistical Test:**
   - Calculate: mean difference between groups
   - Calculate: p-value (t-test)
   - Significant if: p < 0.05 AND effect size > 10%

4. **Confidence Scoring:**
   - High: p < 0.01, n > 10 per group
   - Medium: p < 0.05, n = 5-10 per group
   - Low: p < 0.1, n < 5 per group (don't show)

5. **Time-Lagged Effects:**
   - Check if intervention affects next-day hormones
   - Example: "Exercise today" → testosterone tomorrow
   - Lag: 0-3 days

### What to Store

```typescript
interface ImpactAnalysis {
  id: string;
  user_id: string;
  intervention_name: string;
  intervention_type: 'supplement' | 'habit' | 'context';
  hormone_affected: 'cortisol' | 'testosterone' | 'dhea';
  effect_size: number; // Percentage change
  p_value: number;
  confidence: 'high' | 'medium' | 'low';
  tests_with: number;
  tests_without: number;
  recommendation: 'keep' | 'stop' | 'need_more_data';
  calculated_at: Date;
}
```

### Intelligence Needed

**Natural Language Processing:**
- User types: "vitamin d 5000iu, zinc, ashwagandha"
- Extract: ["Vitamin D", "Zinc", "Ashwagandha"]
- Normalize: Handle typos, variations, common abbreviations

**Pattern Recognition:**
- Sleep quality → cortisol correlation
- Exercise → next-day testosterone
- Stress level → cortisol spikes
- Day of week → patterns

**Cost-Benefit Analysis:**
- If user mentioned cost in past (via AI chat), factor it in
- "You're spending $180/month. 3 supplements show no effect. Save $90."

### Retention Mechanics

**Unlock Condition:**
- Requires 15+ tests
- Before unlock: "Unlock Impact™ after 12 more tests"
- Teaser: "We've found 3 patterns so far..."

**Discovery Notifications:**
- "New insight discovered 💡 - Check Impact tab"
- Variable reward: Sometimes find pattern, sometimes don't
- Drives daily check-ins

**ROI Proof:**
- "HormoIQ paid for itself: $1,200/year saved on useless supplements"
- User calculates this, becomes brand evangelist

---

## FEATURE 5: ASK™ - AI Hormone Coach

### Purpose
Let users ask questions about their hormones anytime. Fills gaps between tests. Reduces anxiety. Creates engagement.

### What It Shows

**Chat Interface:**
- iMessage/WhatsApp style
- User messages: right-aligned, blue bubbles
- AI messages: left-aligned, gray bubbles
- Text input at bottom + send button
- Typing indicator while AI responds

**If Chat Empty (First Visit):**
Show 6 suggested questions (tappable):
- "Why is my ReadyScore low today?"
- "What affects testosterone most?"
- "Is my cortisol level healthy?"
- "Should I exercise today?"
- "What supplements should I try?"
- "How do I improve my BioAge?"

**Dynamic Suggestions:**
Change based on their data:
- If cortisol high: "Why is my cortisol high?"
- If just unlocked BioAge: "Explain my BioAge calculation"
- If declining trend: "Why are my hormones declining?"

### AI Behavior & Constraints

**System Prompt Structure:**

```
You are HormoIQ's personal hormone optimization coach. You help users understand and optimize their hormones.

CRITICAL RULES:
1. You are a WELLNESS coach, not a medical professional
2. NEVER diagnose medical conditions
3. NEVER recommend medications or medical treatments
4. ALWAYS say "Consult your doctor" for medical questions
5. Focus on optimization, not treatment

CAPABILITIES:
- Explain hormone patterns using THEIR specific data
- Suggest lifestyle interventions (sleep, exercise, stress management)
- Recommend supplements (but note: "Consider talking to your doctor")
- Interpret test results in context
- Provide general hormone education

TONE:
- Knowledgeable but conversational
- Encouraging and empathetic
- Concise (2-3 sentences unless asked for detail)
- Reference THEIR data specifically

USER CONTEXT PROVIDED:
- Current ReadyScore: {score}
- BioAge: {bioage}
- Recent tests: {last_5_tests}
- Patterns detected: {patterns}
- User profile: {age, gender, goals}

RESPONSE FORMAT:
- Start with direct answer
- Reference their specific data
- Provide 1-2 actionable suggestions
- End with follow-up question or suggestion
```

**Example Interaction:**

**User:** "Why is my cortisol high?"

**AI Response:**
"Your cortisol of 22 ng/mL this morning is above your average of 16. Looking at your context:

1. You marked stress level 4/5 yesterday
2. You slept only 6 hours (your note: 'bad sleep')
3. Your pattern: High stress + poor sleep = 20-30% cortisol spike

This is your body's normal stress response. Not dangerous, just activated. It should normalize in 1-2 days once you catch up on sleep.

Want tips for lowering stress cortisol faster?"

**Medical Questions (MUST REFUSE):**

**User:** "Do I have Cushing's disease?"

**AI Response:**
"I can't diagnose medical conditions - that's beyond my scope and potentially dangerous. Your cortisol levels can have many causes, and only a doctor can properly diagnose conditions like Cushing's.

I strongly recommend scheduling an appointment with your doctor and showing them your hormone history. They'll be able to run appropriate tests and provide medical guidance.

I'm here to help you optimize your hormones within normal ranges, but medical diagnosis requires a healthcare professional."

### What to Store

```typescript
interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context_provided: {
    readyscore?: number;
    bioage?: number;
    recent_tests?: HormoneTest[];
    patterns?: string[];
  };
}
```

### Intelligence Needed

**Context Building:**
Before each AI call, gather:
- User's last 5 tests (with context)
- Current ReadyScore
- BioAge (if unlocked)
- Any patterns detected in Impact™
- User profile (age, gender, goals)
- Previous chat messages (last 10 for context)

**Response Enhancement:**
- If AI references a chart, include [View Chart] button that navigates to Track tab
- If AI mentions a pattern, include [View Pattern] button that goes to Impact tab
- If AI suggests testing, include [Test Now] button that goes to Test tab

**Safety Checks:**
- Flag responses that look like medical advice
- Block medication recommendations
- Detect diagnosis language and refuse
- Log all conversations for review

### Retention Mechanics

**Daily Engagement:**
- User can chat even on days they don't test
- Fills gaps: Test every 2-3 days, but chat daily
- Variable reward: Sometimes learn something new, sometimes routine answer

**Proactive Messages (Optional):**
- Morning greeting: "Good morning! Your ReadyScore is 76 today. Questions?"
- After test: "Saw you just tested. Want to discuss your result?"
- Pattern discovered: "I found something interesting in your data. Want to hear it?"

**Chat History:**
- Persist last 50 messages locally
- User can scroll back and reference past conversations
- "Clear history" option in settings

---

## HOW THE 5 FEATURES WORK TOGETHER

**The Intelligence Loop:**

```
TEST™ (data input)
   ↓
[Store in database]
   ↓
READYSCORE™ (daily metric calculated from tests)
   ↓
BIOAGE™ (long-term progress from tests)
   ↓
IMPACT™ (patterns detected across tests)
   ↓
ASK™ (AI uses all above data to answer questions)
   ↓
User gets insights → Takes action → Tests again
   ↓
[Loop repeats, gets smarter]
```

**Example User Journey:**

**Week 1:**
- Day 1: TEST cortisol (15 ng/mL)
- Day 1: READYSCORE shows 72 (based on single test + population avg)
- Day 2: ASK "Is 15 good?" → AI: "Yes, optimal for your age"
- Day 3: TEST again (17 ng/mL)
- Day 4: READYSCORE now 68 (adjusted based on 2 tests)
- Day 7: TEST third time (14 ng/mL)

**Week 2:**
- Day 10: TEST #5 → BIOAGE unlocks: "You're 3 years younger"
- Day 12: ASK "Why am I younger?" → AI explains using their specific data
- Day 14: TEST #7 → READYSCORE accuracy improving (more personal data)

**Week 3:**
- Day 15: IMPACT™ unlocks: "Pattern detected - sleep affects your cortisol by 20%"
- Day 16: ASK "How do I improve sleep?" → AI gives personalized tips
- Day 18: TEST with context "tried magnesium" in supplements
- Day 21: READYSCORE trending up → User sees cause-effect

**Week 4:**
- Day 25: IMPACT™ confirms: "Magnesium: -15% cortisol (confirmed)"
- Day 28: BIOAGE updates: Now 4 years younger
- Day 30: User is hooked. Can't imagine not using app.

**The Compounding Effect:**
- More tests → Better ReadyScore accuracy
- More context → More patterns in Impact™
- More patterns → Better AI answers in Ask™
- Better answers → More trust → More testing
- More testing → Improved BioAge → Motivation to continue

**Each feature makes the others better.**

---

## DATA ARCHITECTURE

### Supabase Tables Needed

**1. users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  birth_year INTEGER,
  gender TEXT, -- 'male' | 'female' | 'other'
  goals TEXT[], -- ['energy', 'fitness', 'sleep', 'stress']
  created_at TIMESTAMP DEFAULT NOW()
);
```

**2. hormone_tests**
```sql
CREATE TABLE hormone_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  hormone_type TEXT NOT NULL, -- 'cortisol' | 'testosterone' | 'dhea'
  value DECIMAL NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  sleep_quality INTEGER, -- 1-5
  exercised BOOLEAN,
  stress_level INTEGER, -- 1-5
  supplements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hormone_tests_user ON hormone_tests(user_id);
CREATE INDEX idx_hormone_tests_timestamp ON hormone_tests(timestamp);
```

**3. ready_scores**
```sql
CREATE TABLE ready_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  score INTEGER NOT NULL, -- 0-100
  confidence TEXT, -- 'high' | 'medium' | 'low'
  contributing_factors JSONB, -- {cortisol_score, testosterone_score, etc}
  protocol TEXT[], -- Array of recommendations
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**4. bio_ages**
```sql
CREATE TABLE bio_ages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  chronological_age INTEGER,
  biological_age INTEGER,
  delta INTEGER, -- chrono - bio
  confidence TEXT,
  breakdown JSONB, -- {cortisol_years, testosterone_years, etc}
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

**5. impact_analyses**
```sql
CREATE TABLE impact_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  intervention_name TEXT,
  intervention_type TEXT, -- 'supplement' | 'habit'
  hormone_affected TEXT,
  effect_size DECIMAL, -- Percentage change
  p_value DECIMAL,
  confidence TEXT,
  tests_with INTEGER,
  tests_without INTEGER,
  recommendation TEXT, -- 'keep' | 'stop' | 'need_more_data'
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

**6. chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  context_provided JSONB, -- Data sent to AI
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, timestamp DESC);
```

### Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Users can only see their own data
ALTER TABLE hormone_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tests" ON hormone_tests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tests" ON hormone_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Repeat for all tables
-- ready_scores, bio_ages, impact_analyses, chat_messages
```

---

## INTELLIGENCE REQUIREMENTS

### Calculations That Need to Run

**After Every New Test:**

1. **Recalculate ReadyScore**
   - Query: Last test for each hormone
   - Calculate: Score using algorithm
   - Store: New ready_score row
   - Time: <1 second (synchronous)

2. **Update BioAge (if unlocked)**
   - Query: All user's tests
   - Calculate: BioAge using algorithm
   - Store: New bio_age row (if changed by >0.5 years)
   - Time: <2 seconds (can be background)

3. **Check for Patterns (Impact™)**
   - Query: All user's tests + context
   - If 15+ tests: Run correlation detection
   - Store: New impact_analyses rows for discovered patterns
   - Time: 5-10 seconds (background job)

**Daily (Background Jobs):**

1. **Prediction Generation**
   - For each user: Predict tomorrow's ReadyScore
   - Based on: Weekly patterns, recovery curves
   - Store: In ready_scores with future date
   - Schedule: Run at midnight

2. **Pattern Refresh**
   - Re-run Impact™ analysis for users with new tests
   - Update existing patterns with more data
   - Schedule: Run at 2 AM

### Where Intelligence Lives

**Client-side (React Native):**
- Real-time ReadyScore display
- Input validation
- Basic anomaly detection ("This seems high, double-check?")
- Chart rendering

**Server-side (Supabase Edge Functions or separate API):**
- BioAge calculation (complex algorithm)
- Impact™ correlation analysis (statistical tests)
- Pattern detection (NLP on supplements, correlation analysis)
- Prediction models (time-series forecasting)

**Third-party API (Claude via Anthropic):**
- AI chat responses
- Context building happens server-side, then sent to Claude
- Response streaming back to client

### Smart Defaults & Pre-filling

**Pattern Learning (Store in separate table):**

```sql
CREATE TABLE user_patterns (
  user_id UUID REFERENCES users(id),
  pattern_type TEXT, -- 'usual_test_time' | 'typical_sleep' | 'common_supplement'
  pattern_value TEXT,
  confidence DECIMAL,
  last_updated TIMESTAMP
);
```

**Examples:**
- User always tests at 8 AM → Pre-fill time to 8 AM
- User always takes "Vitamin D, Zinc" → Suggest these in supplements field
- User typically sleeps 7 hours → Pre-fill sleep to 3-4 stars

---

## DEVELOPMENT PHASES

### Phase 1: Foundation (Week 1)
**Goal: Users can log tests and see them**

**Build:**
- Supabase setup (tables, RLS, auth)
- Basic app shell (5 tabs, navigation)
- TEST™ feature:
  - Hormone selection screen
  - Slider input for value
  - Context form (sleep, exercise, stress, supplements)
  - Save to database
  - Confirmation screen
- Track tab: List view of all tests

**Success:** User can log test, see it in list

**Commit:** "Phase 1 complete: Test logging works"

---

### Phase 2: ReadyScore (Week 2)
**Goal: Users see daily score**

**Build:**
- ReadyScore calculation algorithm (function)
- Home tab UI:
  - Circular progress ring
  - Score display with color
  - Protocol recommendations
  - Last updated timestamp
- Auto-calculate on app open (fetch latest tests, compute)
- Store in database

**Success:** User sees ReadyScore that updates when they test

**Commit:** "Phase 2 complete: ReadyScore live"

---

### Phase 3: BioAge (Week 2-3)
**Goal: Users unlock biological age**

**Build:**
- BioAge calculation algorithm
- Track tab enhancement:
  - BioAge card at top
  - Locked state ("7 more tests to unlock")
  - Unlocked state (show age, delta, breakdown)
  - Trend chart
- Unlock notification (confetti, badge)

**Success:** User reaches 10 tests, sees BioAge unlock, celebrates

**Commit:** "Phase 3 complete: BioAge feature"

---

### Phase 4: AI Chat (Week 3)
**Goal: Users can ask questions**

**Build:**
- Ask tab:
  - Chat UI (bubbles, input, send)
  - Suggested questions (when empty)
  - Typing indicator
- Claude API integration:
  - Build context from user data
  - Send to Claude with system prompt
  - Stream response back
  - Store messages
- Safety checks (flag medical language)

**Success:** User asks question, gets personalized answer referencing their data

**Commit:** "Phase 4 complete: AI chat working"

---

### Phase 5: Impact™ (Week 4)
**Goal: Users discover what works**

**Build:**
- Impact™ analysis:
  - NLP to extract supplements from text
  - Correlation detection (with/without groups)
  - Statistical significance testing
  - Confidence scoring
- Impact tab UI:
  - Impact Score
  - What's Working section
  - What's Not Working section
  - Need More Data section
- Background job to run analysis after 15th test
- Notification when pattern discovered

**Success:** User hits 15 tests, sees first pattern ("Vitamin D: +18% testosterone")

**Commit:** "Phase 5 complete: Impact™ live"

---

### Phase 6: Polish & Retention (Week 5)
**Goal: Make it sticky**

**Build:**
- Streak tracking:
  - Count consecutive days
  - Show 🔥 icon in tab
  - Push notification before streak breaks
- Progress unlocks:
  - "3 more tests to BioAge"
  - "12 more tests to Impact™"
- Animations:
  - Checkmark on save
  - Confetti on milestones
  - Number count-up effects
  - Smooth transitions
- Push notifications:
  - Daily reminder (8 AM)
  - Insight discovered
  - Streak reminder
- Empty states (helpful, not just "no data")

**Success:** Users open app daily without reminders

**Commit:** "Phase 6 complete: MVP ready for users"

---

## SUCCESS METRICS

**Track These From Day 1:**

**Engagement:**
- Tests per user per week (target: 3-4)
- App opens per day (target: 1-2)
- AI chat messages per week (target: 2-3)

**Retention:**
- Day 1: % who log first test (target: >80%)
- Day 7: % who return (target: >40%)
- Day 30: % still active (target: >25%)

**Feature Adoption:**
- % who unlock BioAge (target: >60%)
- % who unlock Impact™ (target: >40%)
- % who use AI chat (target: >50%)

**Value Delivered:**
- Patterns discovered per user (target: 2-3 by month 1)
- Average BioAge delta (target: 3-5 years younger)
- ReadyScore accuracy improvement over time (target: 60% → 85% by month 3)

---

## FINAL NOTES FOR CURSOR

**Your Mission:**
Build an app that makes hormone numbers meaningful and actionable. After 30 days of use, the user should think: "I finally understand my body."

**Design Principles:**
1. **Fast** - Every interaction <100ms
2. **Clear** - No confusion, obvious next steps
3. **Rewarding** - Celebrate milestones, show progress
4. **Smart** - Gets better with every test
5. **Trustworthy** - Show confidence, admit uncertainty

**You Decide:**
- Exact UI implementation (as long as it's clean and minimal)
- State management approach (Zustand recommended)
- Component architecture (keep it simple)
- Animation details (make it feel premium)

**You Don't Decide:**
- The 5 features (these are fixed)
- The algorithms (follow the formulas given)
- The data structure (use Supabase schema provided)
- The user journey (Test → ReadyScore → BioAge → Impact → Ask)

**When Stuck:**
- Build the simplest version first
- Test on device immediately
- Make it work, then make it smart, then make it beautiful
- Commit after every working feature

**This is MVP. Ship it in 5 weeks. Then iterate based on user feedback.**

---

**Now build something users can't live without.**