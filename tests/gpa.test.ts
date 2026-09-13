import { describe, it, expect } from "vitest";
import {
  getGradePoints,
  calculateSemesterGpa,
  calculateCumulativeGpa,
  calculateRequiredSemesterGpa,
} from "../src/lib/gpa";

describe("GPA Calculator Engine", () => {
  describe("getGradePoints", () => {
    it("returns correct points for 5.0 scale (Saudi standard)", () => {
      expect(getGradePoints("A+", 5.0)).toBe(5.0);
      expect(getGradePoints("A", 5.0)).toBe(4.75);
      expect(getGradePoints("B+", 5.0)).toBe(4.5);
      expect(getGradePoints("B", 5.0)).toBe(4.0);
      expect(getGradePoints("C+", 5.0)).toBe(3.5);
      expect(getGradePoints("C", 5.0)).toBe(3.0);
      expect(getGradePoints("D+", 5.0)).toBe(2.5);
      expect(getGradePoints("D", 5.0)).toBe(2.0);
      expect(getGradePoints("F", 5.0)).toBe(1.0);
    });

    it("returns correct points for 4.0 scale (International standard)", () => {
      expect(getGradePoints("A+", 4.0)).toBe(4.0);
      expect(getGradePoints("A", 4.0)).toBe(4.0);
      expect(getGradePoints("A-", 4.0)).toBe(3.7);
      expect(getGradePoints("B+", 4.0)).toBe(3.3);
      expect(getGradePoints("B", 4.0)).toBe(3.0);
      expect(getGradePoints("F", 4.0)).toBe(0.0);
    });
  });

  describe("calculateSemesterGpa", () => {
    it("calculates weighted semester GPA accurately for 5.0 scale", () => {
      // 3 credits A+ (5.0*3=15) + 3 credits B+ (4.5*3=13.5) = 28.5 / 6 credits = 4.75
      const courses = [
        { creditHours: 3, letterGrade: "A+" },
        { creditHours: 3, letterGrade: "B+" },
      ];
      const result = calculateSemesterGpa(courses, 5.0);
      expect(result.totalCredits).toBe(6);
      expect(result.gpa).toBe(4.75);
    });

    it("returns 0 if total credits is zero", () => {
      const result = calculateSemesterGpa([], 5.0);
      expect(result.gpa).toBe(0.0);
      expect(result.totalCredits).toBe(0);
    });
  });

  describe("calculateCumulativeGpa", () => {
    it("correctly combines past and current courses", () => {
      // Past: 16 credits at 4.80 total points = 76.8
      // Current: 6 credits at 5.0 total points = 30.0
      // Total = 106.8 / 22 = 4.85
      const past = [
        { creditHours: 16, gradePoints: 4.8 },
      ];
      const current = [
        { creditHours: 3, gradePoints: 5.0 },
        { creditHours: 3, gradePoints: 5.0 },
      ];
      const result = calculateCumulativeGpa(past, current);
      expect(result.totalCredits).toBe(22);
      expect(result.cumulativeGpa).toBe(4.85);
    });
  });

  describe("calculateRequiredSemesterGpa (Target Simulator)", () => {
    it("correctly determines required semester GPA when feasible", () => {
      // Current: 30 credits with 4.5 GPA (135 points)
      // Enrolled: 15 credits
      // Target: 4.60 cumulative with 45 total credits (207 points needed)
      // Needed semester points = 207 - 135 = 72 points / 15 credits = 4.80
      const result = calculateRequiredSemesterGpa(4.5, 30, 15, 4.6, 5.0);
      expect(result.isPossible).toBe(true);
      expect(result.requiredSemesterGpa).toBe(4.8);
      expect(result.status).toBe("challenging");
    });

    it("identifies impossible target when required GPA exceeds scale maximum", () => {
      // Current: 60 credits with 3.0 GPA
      // Enrolled: 10 credits
      // Target: 4.90 cumulative (requires semester GPA > 5.0)
      const result = calculateRequiredSemesterGpa(3.0, 60, 10, 4.9, 5.0);
      expect(result.isPossible).toBe(false);
      expect(result.status).toBe("impossible");
    });
  });
});
