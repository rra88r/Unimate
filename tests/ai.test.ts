import { describe, it, expect } from "vitest";
import { processAcademicAiQuery } from "../src/lib/ai";

describe("AI Study Assistant Engine", () => {
  it("generates structured study plans upon query", async () => {
    const res = await processAcademicAiQuery("صمم لي خطة مذاكرة", "study_plan", {
      userName: "فيصل",
      major: "هندسة البرمجيات",
      targetGpa: 4.85,
    });
    expect(res.category).toBe("study_plan");
    expect(res.content).toContain("خطة المذاكرة الأكاديمية");
    expect(res.content).toContain("فيصل");
    expect(res.suggestedFollowUps?.length).toBeGreaterThan(0);
  });

  it("generates summaries when asked to summarize", async () => {
    const res = await processAcademicAiQuery("لخص لي موضوع هياكل البيانات", "summary", {
      userName: "فيصل",
    });
    expect(res.category).toBe("summary");
    expect(res.content).toContain("ملخص");
  });

  it("generates practice quiz questions", async () => {
    const res = await processAcademicAiQuery("اختبرني في أسئلة تدريبية", "quiz");
    expect(res.category).toBe("quiz");
    expect(res.content).toContain("بنك الأسئلة");
  });
});
