import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  hasTimeConflict,
  findConflicts,
  generateICalendar,
} from "../src/lib/timetable";

describe("Timetable Utilities", () => {
  it("converts HH:mm time string to minutes correctly", () => {
    expect(parseTimeToMinutes("08:00")).toBe(480);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("13:15")).toBe(795);
  });

  it("detects time overlap conflict on the same day", () => {
    const slotA = { dayOfWeek: 0, startTime: "08:00", endTime: "09:30" };
    const slotB = { dayOfWeek: 0, startTime: "09:00", endTime: "10:30" };
    expect(hasTimeConflict(slotA, slotB)).toBe(true);
  });

  it("does not report conflict for adjacent classes touching at the border", () => {
    const slotA = { dayOfWeek: 0, startTime: "08:00", endTime: "09:30" };
    const slotB = { dayOfWeek: 0, startTime: "09:30", endTime: "11:00" };
    expect(hasTimeConflict(slotA, slotB)).toBe(false);
  });

  it("does not report conflict for classes on different days even if same time", () => {
    const slotA = { dayOfWeek: 0, startTime: "08:00", endTime: "09:30" };
    const slotB = { dayOfWeek: 1, startTime: "08:00", endTime: "09:30" };
    expect(hasTimeConflict(slotA, slotB)).toBe(false);
  });

  it("findConflicts detects pairs of overlapping classes", () => {
    const slots = [
      { id: "1", courseId: "c1", dayOfWeek: 0, startTime: "08:00", endTime: "09:30" },
      { id: "2", courseId: "c2", dayOfWeek: 0, startTime: "09:00", endTime: "10:00" },
      { id: "3", courseId: "c3", dayOfWeek: 0, startTime: "11:00", endTime: "12:00" },
    ];
    const conflicts = findConflicts(slots);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0][0].id).toBe("1");
    expect(conflicts[0][1].id).toBe("2");
  });

  it("generates valid iCal RFC 5545 calendar string", () => {
    const slots = [
      {
        id: "1",
        courseId: "c1",
        courseCode: "CSC 212",
        courseName: "Data Structures",
        dayOfWeek: 0,
        startTime: "08:00",
        endTime: "09:30",
        room: "1A 12",
      },
    ];
    const ics = generateICalendar(slots, "Fall 2024");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:CSC 212 - Data Structures");
    expect(ics).toContain("LOCATION:1A 12");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=SU");
    expect(ics).toContain("END:VCALENDAR");
  });
});
