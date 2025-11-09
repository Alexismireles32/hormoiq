import { HormoneTest } from '@/types';

export async function generateProactiveMessage(tests: HormoneTest[]): Promise<string | null> {
  if (!tests || tests.length < 2) return null;

  const latest = tests[tests.length - 1];
  const previous = tests[tests.length - 2];

  // Only compare if same hormone type
  if (latest.hormone_type !== previous.hormone_type) {
    // Look for patterns across all recent tests
    if (tests.length >= 5) {
      const recentTests = tests.slice(-5);
      
      // Check for consistent cortisol patterns
      const cortisolTests = recentTests.filter(t => t.hormone_type === 'cortisol');
      if (cortisolTests.length >= 3) {
        const avgCortisol = cortisolTests.reduce((sum, t) => sum + t.value, 0) / cortisolTests.length;
        
        if (avgCortisol > 15 && avgCortisol < 25) {
          return "Your cortisol rhythm has been consistently strong for several days. You've found something that works - want to lock it in as a protocol?";
        }
      }
    }
    
    return null;
  }

  // Analyze changes in same hormone
  const change = ((latest.value - previous.value) / previous.value) * 100;

  // Cortisol insights
  if (latest.hormone_type === 'cortisol') {
    // Significant drop
    if (change < -15) {
      return "I noticed your cortisol dropped significantly since last time. That's usually a sign of good recovery or reduced stress. What changed?";
    }
    
    // Significant spike
    if (change > 20) {
      return "Your cortisol spiked today - something triggered your stress response. Want to explore what might be causing it?";
    }
  }

  // Testosterone insights
  if (latest.hormone_type === 'testosterone') {
    // Improvement
    if (change > 10) {
      return "Your testosterone levels are trending up! This is linked to better energy and mood. Curious what's driving this improvement?";
    }
    
    // Decline
    if (change < -10) {
      return "Your testosterone dipped recently. This can affect energy and recovery. Let's talk about what might have changed.";
    }
  }

  // DHEA insights
  if (latest.hormone_type === 'dhea') {
    if (change > 15) {
      return "Your DHEA is rising - this is your body's resilience hormone. Something you're doing is working well!";
    }
  }

  // Progesterone insights
  if (latest.hormone_type === 'progesterone') {
    if (Math.abs(change) > 20) {
      return "Your progesterone levels shifted significantly. This hormone is key for sleep and mood. Want to understand the pattern?";
    }
  }

  // Milestone approaching
  if (tests.length === 9) {
    return "One more test and you unlock BioAge™! I'll be able to tell you your biological age vs. calendar age. Exciting, right?";
  }

  // Check for consistent patterns (5+ tests)
  if (tests.length >= 5) {
    const recentSameHormone = tests
      .filter(t => t.hormone_type === latest.hormone_type)
      .slice(-5);
    
    if (recentSameHormone.length >= 3) {
      const values = recentSameHormone.map(t => t.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      
      // Very stable pattern
      if (variance < 2) {
        return `Your ${latest.hormone_type} has been remarkably stable. Consistency like this is rare - whatever you're doing is working!`;
      }
    }
  }

  return null;
}

