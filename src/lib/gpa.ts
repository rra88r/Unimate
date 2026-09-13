export interface CourseGradeInput {
  id?: string;
  courseName?: string;
  creditHours: number;
  letterGrade: string;
  gradePoints?: number;
}

export const GRADE_POINTS_5 = {
  "A+": 5.0,
  "A": 4.75,
  "B+": 4.5,
  "B": 4.0,
  "C+": 3.5,
  "C": 3.0,
  "D+": 2.5,
  "D": 2.0,
  "F": 1.0,
} as const;

export const GRADE_POINTS_4 = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
} as const;

export function getGradePoints(letter: string, scale: number = 5.0): number {
  const normalized = letter.trim().toUpperCase();
  if (scale === 4.0) {
    return (GRADE_POINTS_4 as Record<string, number>)[normalized] ?? 0.0;
  }
  return (GRADE_POINTS_5 as Record<string, number>)[normalized] ?? 0.0;
}

export function calculateSemesterGpa(
  courses: Array<{ creditHours: number; letterGrade?: string; gradePoints?: number }>,
  scale: number = 5.0
): { gpa: number; totalCredits: number; totalQualityPoints: number } {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const course of courses) {
    const credits = Number(course.creditHours) || 0;
    if (credits <= 0) continue;

    const points =
      course.gradePoints !== undefined
        ? Number(course.gradePoints)
        : getGradePoints(course.letterGrade || "A+", scale);

    totalCredits += credits;
    totalQualityPoints += points * credits;
  }

  const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;
  return { gpa, totalCredits, totalQualityPoints: Number(totalQualityPoints.toFixed(2)) };
}

export function calculateCumulativeGpa(
  pastCourses: Array<{ creditHours: number; gradePoints: number }>,
  currentCourses: Array<{ creditHours: number; gradePoints: number }> = []
): { cumulativeGpa: number; totalCredits: number; totalQualityPoints: number } {
  const allCourses = [...pastCourses, ...currentCourses];
  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const item of allCourses) {
    const credits = Number(item.creditHours) || 0;
    const points = Number(item.gradePoints) || 0;
    totalCredits += credits;
    totalQualityPoints += credits * points;
  }

  const cumulativeGpa =
    totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;

  return {
    cumulativeGpa,
    totalCredits,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
  };
}

export function calculateRequiredSemesterGpa(
  currentCumulativeGpa: number,
  pastCredits: number,
  currentSemesterCredits: number,
  targetCumulativeGpa: number,
  scale: number = 5.0
): { requiredSemesterGpa: number; isPossible: boolean; status: "easy" | "moderate" | "challenging" | "impossible" } {
  if (currentSemesterCredits <= 0) {
    return { requiredSemesterGpa: 0, isPossible: false, status: "impossible" };
  }

  // Formula:
  // Target = (Past_Points + Required_Semester_Points) / (Past_Credits + Current_Credits)
  // Target * (Past_Credits + Current_Credits) - (Current_Cumulative * Past_Credits) = Current_Semester_Points
  // Required_Semester_GPA = Current_Semester_Points / Current_Credits
  const totalTargetPoints = targetCumulativeGpa * (pastCredits + currentSemesterCredits);
  const currentTotalPoints = currentCumulativeGpa * pastCredits;
  const neededSemesterPoints = totalTargetPoints - currentTotalPoints;
  const rawRequiredGpa = neededSemesterPoints / currentSemesterCredits;

  const requiredSemesterGpa = Number(Math.max(0, rawRequiredGpa).toFixed(2));
  const maxPossibleGpa = scale;

  if (requiredSemesterGpa > maxPossibleGpa) {
    return {
      requiredSemesterGpa,
      isPossible: false,
      status: "impossible",
    };
  }

  let status: "easy" | "moderate" | "challenging" = "moderate";
  if (scale === 5.0) {
    if (requiredSemesterGpa >= 4.75) status = "challenging";
    else if (requiredSemesterGpa <= 4.25) status = "easy";
  } else {
    if (requiredSemesterGpa >= 3.8) status = "challenging";
    else if (requiredSemesterGpa <= 3.3) status = "easy";
  }

  return {
    requiredSemesterGpa,
    isPossible: true,
    status,
  };
}

export function getGradeBadgeClass(letter: string): string {
  const norm = letter.trim().toUpperCase();
  if (norm.startsWith("A")) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  }
  if (norm.startsWith("B")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
  }
  if (norm.startsWith("C")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  }
  if (norm.startsWith("D")) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800";
  }
  return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
}
