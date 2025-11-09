/**
 * Test Schedule Generator for 12-Test Kit
 * 
 * Business Model: Users receive 12 hormone tests to be used over 4 weeks
 * - 3 tests per week (alternating days to cover all 7 days)
 * - Pattern A: Week 1 (M/W/F), Week 2 (T/Th/S), repeat
 * - Pattern B: Week 1 (T/Th/S), Week 2 (M/W/F), repeat
 * - Custom: User picks 3 days
 * 
 * Hormone Priority:
 * - Male: Cortisol (high), Testosterone (high), DHEA (medium), Progesterone (none/low)
 * - Female: Cortisol (high), Progesterone (high), Testosterone (medium), DHEA (low)
 * 
 * Each week: 3 tests distributed across the priority hormones
 */

import { TestScheduleEvent } from '@/types';
import { supabase } from './supabase';

export type SchedulePattern = 'A' | 'B' | 'custom';
export type Gender = 'male' | 'female' | 'other';

interface HormonePriority {
  hormone: 'cortisol' | 'testosterone' | 'dhea' | 'progesterone';
  count: number; // How many tests for this hormone in the kit
}

/**
 * Get hormone distribution for 12-test kit based on gender
 */
function getHormoneDistribution(gender: Gender): HormonePriority[] {
  if (gender === 'female') {
    return [
      { hormone: 'cortisol', count: 5 },      // Most important
      { hormone: 'progesterone', count: 4 },  // Female-specific
      { hormone: 'testosterone', count: 2 },  // Medium priority
      { hormone: 'dhea', count: 1 },          // Least priority
    ];
  } else {
    // Default to male pattern for 'male' and 'other'
    return [
      { hormone: 'cortisol', count: 5 },      // Most important
      { hormone: 'testosterone', count: 4 },  // Male-specific
      { hormone: 'dhea', count: 2 },          // Medium priority
      { hormone: 'progesterone', count: 1 },  // Least priority (track for aromatization)
    ];
  }
}

/**
 * Get days of week for testing pattern
 * 0=Sunday, 1=Monday, ..., 6=Saturday
 */
function getPatternDays(pattern: SchedulePattern, customDays?: number[]): number[][] {
  if (pattern === 'custom' && customDays && customDays.length === 3) {
    // User-defined: same 3 days each week
    return [customDays, customDays, customDays, customDays];
  }
  
  if (pattern === 'B') {
    // Pattern B: Start with T/Th/S, alternate to M/W/F
    return [
      [2, 4, 6], // Week 1: Tuesday, Thursday, Saturday
      [1, 3, 5], // Week 2: Monday, Wednesday, Friday
      [2, 4, 6], // Week 3: Tuesday, Thursday, Saturday
      [1, 3, 5], // Week 4: Monday, Wednesday, Friday
    ];
  }
  
  // Pattern A (default): Start with M/W/F, alternate to T/Th/S
  return [
    [1, 3, 5], // Week 1: Monday, Wednesday, Friday
    [2, 4, 6], // Week 2: Tuesday, Thursday, Saturday
    [1, 3, 5], // Week 3: Monday, Wednesday, Friday
    [2, 4, 6], // Week 4: Tuesday, Thursday, Saturday
  ];
}

/**
 * Calculate date for a given week and day of week
 */
function calculateDate(startDate: Date, weekNumber: number, dayOfWeek: number): Date {
  const date = new Date(startDate);
  
  // Move to the start of the week (Sunday)
  const dayOffset = date.getDay();
  date.setDate(date.getDate() - dayOffset);
  
  // Add weeks
  date.setDate(date.getDate() + (weekNumber - 1) * 7);
  
  // Add day of week
  date.setDate(date.getDate() + dayOfWeek);
  
  return date;
}

/**
 * Distribute hormones across test slots intelligently
 * Ensures even distribution throughout the 4 weeks
 */
function distributeHormones(distribution: HormonePriority[]): string[] {
  const hormones: string[] = [];
  
  // Create array of all hormones based on their count
  for (const { hormone, count } of distribution) {
    for (let i = 0; i < count; i++) {
      hormones.push(hormone);
    }
  }
  
  // Shuffle to avoid clustering (Fisher-Yates)
  for (let i = hormones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [hormones[i], hormones[j]] = [hormones[j], hormones[i]];
  }
  
  // Ensure cortisol is first (most important baseline)
  const cortisolIndex = hormones.indexOf('cortisol');
  if (cortisolIndex !== 0) {
    [hormones[0], hormones[cortisolIndex]] = [hormones[cortisolIndex], hormones[0]];
  }
  
  return hormones;
}

/**
 * Generate 12-test schedule for a user
 */
export function generateTestSchedule(
  startDate: Date,
  pattern: SchedulePattern,
  gender: Gender,
  customDays?: number[]
): Omit<TestScheduleEvent, 'id' | 'user_id' | 'created_at'>[] {
  const hormoneDistribution = getHormoneDistribution(gender);
  const hormones = distributeHormones(hormoneDistribution);
  const patternDays = getPatternDays(pattern, customDays);
  
  const schedule: Omit<TestScheduleEvent, 'id' | 'user_id' | 'created_at'>[] = [];
  let testNumber = 1;
  
  // Generate 4 weeks of testing
  for (let week = 1; week <= 4; week++) {
    const daysThisWeek = patternDays[week - 1];
    
    // 3 tests per week
    for (const dayOfWeek of daysThisWeek) {
      const scheduledDate = calculateDate(startDate, week, dayOfWeek);
      const hormone = hormones[testNumber - 1];
      
      schedule.push({
        scheduled_date: scheduledDate.toISOString().split('T')[0], // YYYY-MM-DD
        hormone_type: hormone as 'cortisol' | 'testosterone' | 'dhea' | 'progesterone',
        week_number: week,
        day_of_week: dayOfWeek,
        test_number: testNumber,
        completed: false,
        completed_at: null,
        test_id: null,
        skipped: false,
        skipped_reason: null,
        reminder_sent: false,
      });
      
      testNumber++;
    }
  }
  
  return schedule;
}

/**
 * Save generated schedule to database for a user
 */
export async function saveScheduleToDatabase(
  userId: string,
  schedule: Omit<TestScheduleEvent, 'id' | 'user_id' | 'created_at'>[]
): Promise<{ success: boolean; error?: any }> {
  try {
    // Add user_id to each event
    const eventsWithUser = schedule.map(event => ({
      ...event,
      user_id: userId,
    }));
    
    // Insert all schedule events
    const { error } = await supabase
      .from('test_schedule_events')
      .insert(eventsWithUser);
    
    if (error) {
      console.error('Error saving schedule:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in saveScheduleToDatabase:', error);
    return { success: false, error };
  }
}

/**
 * Get upcoming tests for a user (next 7 days)
 */
export async function getUpcomingTests(
  userId: string,
  daysAhead: number = 7
): Promise<TestScheduleEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('test_schedule_events')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .gte('scheduled_date', today)
    .lte('scheduled_date', futureDateStr)
    .order('scheduled_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching upcoming tests:', error);
    return [];
  }
  
  return data as TestScheduleEvent[];
}

/**
 * Get next scheduled test for a user
 */
export async function getNextTest(userId: string): Promise<TestScheduleEvent | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('test_schedule_events')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - user has completed all tests
      return null;
    }
    if (error.code === 'PGRST205') {
      // Table doesn't exist yet - database migration needed
      // Silently return null until schema is deployed
      return null;
    }
    console.error('Error fetching next test:', error);
    return null;
  }
  
  return data as TestScheduleEvent;
}

/**
 * Mark a test as completed
 */
export async function markTestCompleted(
  scheduleEventId: string,
  testId: string
): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase
    .from('test_schedule_events')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      test_id: testId,
    })
    .eq('id', scheduleEventId);
  
  if (error) {
    console.error('Error marking test completed:', error);
    return { success: false, error };
  }
  
  return { success: true };
}

/**
 * Mark a test as skipped with reason
 */
export async function markTestSkipped(
  scheduleEventId: string,
  reason?: string
): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase
    .from('test_schedule_events')
    .update({
      skipped: true,
      skipped_reason: reason || 'User skipped',
    })
    .eq('id', scheduleEventId);
  
  if (error) {
    console.error('Error marking test skipped:', error);
    return { success: false, error };
  }
  
  return { success: true };
}

/**
 * Get schedule adherence statistics
 */
export async function getScheduleAdherence(userId: string): Promise<{
  totalTests: number;
  completedTests: number;
  skippedTests: number;
  upcomingTests: number;
  adherenceRate: number; // 0-100%
  daysRemaining: number;
}> {
  const { data: allTests, error } = await supabase
    .from('test_schedule_events')
    .select('*')
    .eq('user_id', userId);
  
  // Handle missing table or no data
  if (error?.code === 'PGRST205' || !allTests || allTests.length === 0) {
    return {
      totalTests: 0,
      completedTests: 0,
      skippedTests: 0,
      upcomingTests: 0,
      adherenceRate: 0,
      daysRemaining: 0,
    };
  }
  
  const today = new Date().toISOString().split('T')[0];
  const completed = allTests.filter(t => t.completed).length;
  const skipped = allTests.filter(t => t.skipped).length;
  const upcoming = allTests.filter(t => !t.completed && !t.skipped && t.scheduled_date >= today).length;
  
  // Calculate adherence: completed / (completed + skipped that were due)
  const pastDue = allTests.filter(t => t.scheduled_date < today);
  const adherenceRate = pastDue.length > 0 
    ? (completed / pastDue.length) * 100 
    : 100;
  
  // Days until last scheduled test
  const lastTest = allTests.sort((a, b) => 
    b.scheduled_date.localeCompare(a.scheduled_date)
  )[0];
  const lastDate = new Date(lastTest.scheduled_date);
  const todayDate = new Date(today);
  const daysRemaining = Math.max(0, Math.ceil(
    (lastDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  return {
    totalTests: allTests.length,
    completedTests: completed,
    skippedTests: skipped,
    upcomingTests: upcoming,
    adherenceRate: Math.round(adherenceRate),
    daysRemaining,
  };
}

/**
 * Detect if user has skipped tests and needs schedule adjustment
 */
export async function detectSkippedTests(userId: string): Promise<TestScheduleEvent[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('test_schedule_events')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .eq('skipped', false)
    .lte('scheduled_date', yesterdayStr);
  
  if (error) {
    if (error.code === 'PGRST205') {
      // Table doesn't exist yet - database migration needed
      // Silently return empty array until schema is deployed
      return [];
    }
    console.error('Error detecting skipped tests:', error);
    return [];
  }
  
  return data as TestScheduleEvent[];
}

/**
 * Get schedule pattern explanation text
 */
export function getPatternExplanation(pattern: SchedulePattern): string {
  if (pattern === 'A') {
    return 'Week 1 & 3: Monday, Wednesday, Friday\nWeek 2 & 4: Tuesday, Thursday, Saturday';
  }
  if (pattern === 'B') {
    return 'Week 1 & 3: Tuesday, Thursday, Saturday\nWeek 2 & 4: Monday, Wednesday, Friday';
  }
  return 'Custom: Your selected days each week';
}

/**
 * Get day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}

