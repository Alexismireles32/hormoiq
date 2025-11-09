export interface ReadyScoreContext {
  label: string;
  emoji: string;
  percentile: string;
  message: string;
  color: string;
}

export function getReadyScoreContext(score: number): ReadyScoreContext {
  if (score >= 85) {
    return {
      label: "ELITE MODE",
      emoji: "🔥",
      percentile: "Top 10%",
      message: "Your hormones are fired up. Perfect day for big challenges.",
      color: "#10B981" // Green
    };
  } else if (score >= 70) {
    return {
      label: "STRONG",
      emoji: "💪",
      percentile: "Top 30%",
      message: "You're ready for action. Good energy and focus available.",
      color: "#3B82F6" // Blue
    };
  } else if (score >= 55) {
    return {
      label: "MODERATE",
      emoji: "😊",
      percentile: "Average",
      message: "Decent readiness. Pace yourself and prioritize.",
      color: "#F59E0B" // Orange
    };
  } else if (score >= 40) {
    return {
      label: "LOW",
      emoji: "😴",
      percentile: "Bottom 30%",
      message: "Your body needs recovery. Listen to the signals.",
      color: "#EF4444" // Red
    };
  } else {
    return {
      label: "RECOVERY NEEDED",
      emoji: "🛌",
      percentile: "Bottom 10%",
      message: "Prioritize rest and recovery today. Your body is asking for it.",
      color: "#DC2626" // Dark red
    };
  }
}

