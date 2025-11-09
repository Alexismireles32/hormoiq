import { HormoneTest } from '@/types';

export function calculateStreak(tests: HormoneTest[]): number {
  if (!tests || tests.length === 0) return 0;

  // Sort tests by date, most recent first
  const sortedTests = [...tests].sort((a, b) => 
    new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
  );

  // Group tests by day (ignore duplicates on same day)
  const testDays = new Set<string>();
  sortedTests.forEach(test => {
    const date = new Date(test.timestamp || test.created_at);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    testDays.add(dayKey);
  });

  const uniqueDays = Array.from(testDays).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  if (uniqueDays.length === 0) return 0;

  let streak = 1;
  let previousDate = new Date(sortedTests[0].timestamp || sortedTests[0].created_at);
  
  // Start from the most recent test and count backwards
  for (let i = 1; i < sortedTests.length; i++) {
    const currentDate = new Date(sortedTests[i].timestamp || sortedTests[i].created_at);
    
    // Calculate days difference
    const daysDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // If test was yesterday (1 day diff), continue streak
    // If same day (0 days diff), don't increment but continue checking
    if (daysDiff === 1) {
      streak++;
      previousDate = currentDate;
    } else if (daysDiff === 0) {
      // Same day, don't increment streak but update previous date
      previousDate = currentDate;
    } else {
      // More than 1 day gap - streak is broken
      break;
    }
  }
  
  return streak;
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return "";
  if (streak === 1) return "Start your streak!";
  if (streak < 7) return `${streak}-day streak`;
  if (streak < 14) return `${streak}-day streak! 🔥`;
  if (streak < 30) return `${streak}-day streak! 🔥🔥`;
  return `${streak}-day streak! 🔥🔥🔥`;
}

