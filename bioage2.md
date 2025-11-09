# BIOAGE ALGORITHM - QUICK REFERENCE CARD

## OPTIMAL HORMONE RANGES BY AGE

### CORTISOL (Morning, 8 AM, ng/mL)

| Age | Men Range | Women Range |
|-----|-----------|-------------|
| 20-30 | 8-20 | 7-18 |
| 31-40 | 8-18 | 7-17 |
| 41-50 | 8-16 | 7-15 |
| 51-60 | 9-19 | 8-18 |
| 61-70 | 10-22 | 9-21 |
| 71+ | 11-25 | 10-24 |

### TESTOSTERONE (ng/dL)

**MEN:**
| Age | Optimal | Low Threshold |
|-----|---------|---------------|
| 18-35 | 500-900 | <300 |
| 36-45 | 400-800 | <300 |
| 46-55 | 350-700 | <300 |
| 56-65 | 300-600 | <250 |
| 66+ | 250-550 | <200 |

**WOMEN:**
| Age | Optimal | Low Threshold |
|-----|---------|---------------|
| 18-35 | 35-70 | <15 |
| 36-45 | 30-60 | <15 |
| 46-55 | 25-55 | <10 |
| 56+ | 15-40 | <7 |

### DHEA (ng/dL)

**MEN:**
| Age | Optimal | Low Threshold |
|-----|---------|---------------|
| 20-29 | 400-560 | <300 |
| 30-39 | 350-500 | <250 |
| 40-49 | 280-400 | <200 |
| 50-59 | 200-300 | <150 |
| 60-69 | 120-200 | <100 |
| 70+ | 80-150 | <50 |

**WOMEN:**
| Age | Optimal | Low Threshold |
|-----|---------|---------------|
| 20-29 | 350-500 | <250 |
| 30-39 | 280-400 | <200 |
| 40-49 | 200-320 | <150 |
| 50-59 | 140-220 | <100 |
| 60-69 | 80-150 | <60 |
| 70+ | 50-100 | <30 |

---

## BIOAGE SCORING (Years to Add/Subtract)

### CORTISOL
- ✅ In optimal range: **0 years**
- 🟡 10-30% above: **+0.5 years**
- 🟠 30-50% above: **+1 year**
- 🔴 >50% above: **+2 years**
- ⭐ 80%+ tests optimal (4+ weeks): **-1 year**

### TESTOSTERONE (Men)
- ⭐ Top 30% for age: **-1.5 years**
- ✅ Normal range: **0 years**
- 🟡 Bottom 30%: **+1 year**
- 🔴 Below clinical threshold: **+2 years**

### TESTOSTERONE (Women)
- ✅ In optimal range: **0 years**
- 🟡 10-20% below: **+0.5 years**
- 🟠 20-40% below: **+1 year**
- 🔴 >40% below: **+1.5 years**

### DHEA
- ✅ In optimal range: **0 years**
- 🟡 10-30% below: **+0.5 years**
- 🟠 30-60% below: **+1 year**
- 🔴 >60% below: **+1.5 years**
- ⭐ Stable/improving over time: **-1 year**

### CORTISOL/DHEA RATIO
- ⭐ <5:1: **-0.5 years**
- ✅ 5-10:1: **0 years**
- 🟡 10-20:1: **+0.5 years**
- 🔴 >20:1: **+1 year**

### BONUSES
- Testing 3+ times/week, 4+ weeks: **-1 year**
- All 3 hormones optimal: **-1 year**
- 2+ hormones severely dysregulated: **+1 year**

---

## THE FORMULA

```
BioAge = Chronological Age 
         + Cortisol Score 
         + Testosterone Score 
         + DHEA Score 
         + Bonuses/Penalties

Min: Chrono Age - 15 years
Max: Chrono Age + 15 years
```

---

## KEY RESEARCH FACTS

1. **Cortisol doubles → BioAge +50%** (Osaka 2025)
2. **Testosterone declines 1-2%/year after 30** (Multiple studies)
3. **DHEA declines 80-90% by age 70** (DHEAge Study)
4. **Low DHEAS in men <70: 6.5x mortality risk** (PAQUID)
5. **Cortisol/DHEAS ratio = best predictor** (MIDUS 2024)

---

## CONFIDENCE LEVELS

| Tests | Weeks | Confidence | Display |
|-------|-------|------------|---------|
| <10 | <2 | Don't show | "7 more tests to unlock" |
| 10-20 | 2-4 | Low 🔴 | Show with caveat |
| 20-40 | 4-8 | Medium 🟡 | Show normally |
| 40+ | 8+ | High ✅ | Show with pride |

---

## PERCENTILE RANKINGS

| BioAge Delta | Percentile | Message |
|--------------|------------|---------|
| -12+ years | Top 2% | "Elite optimizer 🏆" |
| -8 to -11 | Top 10% | "Exceptional 🌟" |
| -5 to -7 | Top 25% | "Above average 💪" |
| -2 to -4 | Top 50% | "Doing well 👍" |
| ±2 years | Average | "Normal range" |
| +5 to +7 | Bottom 25% | "Room for improvement" |
| +8+ years | Bottom 10% | "Needs attention ⚠️" |

---

## COPY/PASTE INTO YOUR CODE

```javascript
function calculateBioAge(user) {
  let score = 0;
  
  // Cortisol
  if (cortisolInRange) score += 0;
  else if (cortisol10to30AboveOptimal) score += 0.5;
  else if (cortisol30to50AboveOptimal) score += 1;
  else if (cortisol50PlusAbove) score += 2;
  
  if (cortisol80PercentOptimal) score -= 1;
  
  // Testosterone (Men)
  if (user.gender === 'male') {
    if (testosteroneTop30Percent) score -= 1.5;
    else if (testosteroneNormal) score += 0;
    else if (testosteroneBottom30) score += 1;
    else if (testosteroneBelowClinical) score += 2;
  }
  
  // DHEA
  if (dheaInRange) score += 0;
  else if (dhea10to30Below) score += 0.5;
  else if (dhea30to60Below) score += 1;
  else if (dhea60PlusBelow) score += 1.5;
  
  if (dheaStableImproving) score -= 1;
  
  // Cortisol/DHEA Ratio
  const ratio = cortisol / dhea;
  if (ratio < 5) score -= 0.5;
  else if (ratio >= 10 && ratio <= 20) score += 0.5;
  else if (ratio > 20) score += 1;
  
  // Bonuses
  if (testing3PlusTimesWeek4PlusWeeks) score -= 1;
  if (all3HormonesOptimal) score -= 1;
  if (twoOrMoreSeverelyOff) score += 1;
  
  const bioAge = user.chronologicalAge + score;
  return Math.max(
    user.chronologicalAge - 15, 
    Math.min(bioAge, user.chronologicalAge + 15)
  );
}
```

---

**THAT'S IT. USE THESE EXACT NUMBERS.**