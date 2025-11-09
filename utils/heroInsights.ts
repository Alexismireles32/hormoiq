import { HormoneTest } from '@/types';

export interface HeroInsight {
  insight: string;
  recommendations: string[];
  primaryAction: {
    label: string;
    route: string;
  };
}

export function generateHeroInsight(
  tests: HormoneTest[],
  readyScore?: number,
  lastTestDate?: string
): HeroInsight {
  // No tests yet - onboarding state
  if (!tests || tests.length === 0) {
    return {
      insight: "Ready to discover what's happening inside your body? Your first test unlocks your ReadyScore™ and starts your journey.",
      recommendations: [
        "Take your first saliva test",
        "Learn about optimal hormone ranges"
      ],
      primaryAction: {
        label: "Log Your First Test →",
        route: "/test"
      }
    };
  }

  // Calculate days since last test
  const daysSinceLastTest = lastTestDate 
    ? Math.floor((new Date().getTime() - new Date(lastTestDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Needs to test (2+ days since last test)
  if (daysSinceLastTest >= 2) {
    return {
      insight: `It's been ${daysSinceLastTest} days since your last test. Your hormone patterns change daily - let's capture today's snapshot!`,
      recommendations: [
        "Track your current levels",
        "See how yesterday's changes affected you"
      ],
      primaryAction: {
        label: "Log Test Now →",
        route: "/test"
      }
    };
  }

  // Recent test - show insights from data
  const latestTest = tests[tests.length - 1];
  const previousTest = tests.length > 1 ? tests[tests.length - 2] : null;

  // Analyze hormone changes if we have previous data
  if (previousTest && latestTest.hormone_type === previousTest.hormone_type) {
    const change = ((latestTest.value - previousTest.value) / previousTest.value) * 100;
    
    if (Math.abs(change) > 15) {
      const direction = change > 0 ? "higher" : "lower";
      const hormoneName = latestTest.hormone_type.charAt(0).toUpperCase() + latestTest.hormone_type.slice(1);
      
      let meaning = "";
      if (latestTest.hormone_type === 'cortisol') {
        meaning = change > 0 ? "your body might be under stress" : "you're recovering well";
      } else if (latestTest.hormone_type === 'testosterone') {
        meaning = change > 0 ? "great for energy and mood" : "worth exploring what changed";
      } else {
        meaning = change > 0 ? "showing improvement" : "worth monitoring";
      }
      
      return {
        insight: `Your ${hormoneName} is ${Math.abs(Math.round(change))}% ${direction} than last time - ${meaning}.`,
        recommendations: [
          "Ask AI about what's driving this change",
          "Review your recent protocols"
        ],
        primaryAction: {
          label: "Talk to AI Coach →",
          route: "/ask"
        }
      };
    }
  }

  // High ReadyScore
  if (readyScore && readyScore >= 80) {
    return {
      insight: `Your ReadyScore is ${readyScore} - you're in the top 10% today! Your hormones are fired up. This is an "attack big goals" kind of day.`,
      recommendations: [
        "Tackle your most challenging task",
        "Try a new optimization protocol"
      ],
      primaryAction: {
        label: "Browse Protocols →",
        route: "/protocols"
      }
    };
  }

  // Low ReadyScore
  if (readyScore && readyScore < 60) {
    return {
      insight: `Your ReadyScore is ${readyScore} - your body needs recovery. Listen to the signals and prioritize rest today.`,
      recommendations: [
        "Review sleep optimization tips",
        "Check your stress resilience pattern"
      ],
      primaryAction: {
        label: "Get Recovery Tips →",
        route: "/ask"
      }
    };
  }

  // Approaching unlock milestones
  if (tests.length >= 7 && tests.length < 10) {
    return {
      insight: `You're ${10 - tests.length} tests away from unlocking BioAge™ and Impact™. These features reveal patterns you can't see yet.`,
      recommendations: [
        "Maintain your testing consistency",
        "Learn what BioAge™ measures"
      ],
      primaryAction: {
        label: "View Progress →",
        route: "/track"
      }
    };
  }

  // Default - steady state
  return {
    insight: "Your hormone journey is progressing nicely. Keep your testing rhythm consistent to unlock deeper insights.",
    recommendations: [
      "Check your testing history",
      "Explore new optimization protocols"
    ],
    primaryAction: {
      label: "View Your Data →",
      route: "/track"
    }
  };
}

