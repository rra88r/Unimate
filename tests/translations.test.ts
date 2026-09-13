import { describe, it, expect } from "vitest";
import { translations } from "../src/lib/i18n/translations";

describe("Translations Completeness", () => {
  it("verifies Arabic dictionary has all essential keys", () => {
    expect(translations.ar.appName).toBe("يوني ميت");
    expect(translations.ar.navDashboard).toBe("الرئيسية");
    expect(translations.ar.navCourses).toBe("المقررات الدراسية");
    expect(translations.ar.navTimetable).toBe("الجدول الدراسي");
    expect(translations.ar.navAssignments).toBe("الواجبات والمشاريع");
    expect(translations.ar.navExams).toBe("الاختبارات");
    expect(translations.ar.navGpa).toBe("حاسبة المعدل");
    expect(translations.ar.navAiAssistant).toBe("المساعد الذكي");
    expect(translations.ar.navStudyPlanner).toBe("منظم المذاكرة");
  });

  it("verifies English dictionary matches all Arabic keys", () => {
    const arKeys = Object.keys(translations.ar);
    const enKeys = Object.keys(translations.en);

    const missingInEn = arKeys.filter((k) => !(k in translations.en));
    expect(missingInEn).toEqual([]);

    const missingInAr = enKeys.filter((k) => !(k in translations.ar));
    expect(missingInAr).toEqual([]);
  });
});
