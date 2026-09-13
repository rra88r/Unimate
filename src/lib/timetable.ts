export interface TimetableSlotItem {
  id?: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  courseId: string;
  courseCode?: string;
  courseName?: string;
  courseColor?: string;
  room?: string | null;
  type?: string;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function hasTimeConflict(
  slotA: { dayOfWeek: number; startTime: string; endTime: string; id?: string },
  slotB: { dayOfWeek: number; startTime: string; endTime: string; id?: string }
): boolean {
  if (slotA.dayOfWeek !== slotB.dayOfWeek) return false;
  if (slotA.id && slotB.id && slotA.id === slotB.id) return false;

  const startA = parseTimeToMinutes(slotA.startTime);
  const endA = parseTimeToMinutes(slotA.endTime);
  const startB = parseTimeToMinutes(slotB.startTime);
  const endB = parseTimeToMinutes(slotB.endTime);

  // Overlap condition: startA < endB && startB < endA
  return startA < endB && startB < endA;
}

export function findConflicts(slots: TimetableSlotItem[]): Array<[TimetableSlotItem, TimetableSlotItem]> {
  const conflicts: Array<[TimetableSlotItem, TimetableSlotItem]> = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (hasTimeConflict(slots[i], slots[j])) {
        conflicts.push([slots[i], slots[j]]);
      }
    }
  }
  return conflicts;
}

export function generateICalendar(slots: TimetableSlotItem[], semesterName: string = "Semester"): string {
  // Simple RFC 5545 iCal generator for weekly repeating classes
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniMate//Academic Timetable//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:UniMate Schedule - ${semesterName}`,
  ];

  const dayMap = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  slots.forEach((slot, index) => {
    const dayStr = dayMap[slot.dayOfWeek] || "SU";
    const [startH, startM] = slot.startTime.split(":");
    const [endH, endM] = slot.endTime.split(":");

    ics.push(
      "BEGIN:VEVENT",
      `UID:unimate-slot-${slot.id || index}@unimate.app`,
      `SUMMARY:${slot.courseCode || "Course"} - ${slot.courseName || ""}`,
      `LOCATION:${slot.room || "Campus"}`,
      `DESCRIPTION:Class Type: ${slot.type || "Lecture"}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${dayStr}`,
      `DTSTART:20250101T${startH}${startM}00`,
      `DTEND:20250101T${endH}${endM}00`,
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}
