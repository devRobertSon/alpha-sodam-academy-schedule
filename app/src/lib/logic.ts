// src/lib/logic.ts — 상담 도구 로직(남은 과목 + 월별 시간표)
import { Course, Grade, Subject, TimeSlot, Track, gmIndex } from '../data/roadmap';

export type Status = '완료' | '진행중' | '예정';

export function sessionKey(courseId: string, sessionIdx: number): string {
  return `${courseId}#${sessionIdx}`;
}

export function nowIndex(grade: Grade, month: number): number {
  return gmIndex(grade, month);
}

export function shiftedRange(course: Course, shift = 0): { startIdx: number; endIdx: number } {
  return {
    startIdx: gmIndex(course.start.grade, course.start.month) + shift,
    endIdx: gmIndex(course.end.grade, course.end.month) + shift,
  };
}

export function statusFromIdx(startIdx: number, endIdx: number, atIdx: number): Status {
  if (atIdx < startIdx) return '예정';
  if (atIdx > endIdx) return '완료';
  return '진행중';
}

export function courseStatus(course: Course, atIdx: number, shift = 0): Status {
  const { startIdx, endIdx } = shiftedRange(course, shift);
  return statusFromIdx(startIdx, endIdx, atIdx);
}

export interface RoadmapEntry {
  course: Course;
  status: Status;
  startIdx: number;
  endIdx: number;
  shift: number;
}

export function remainingCourses(
  courses: Course[],
  _track: Track,
  atIdx: number,
  shifts: Record<string, number> = {},
  includedIds?: Set<string>
): RoadmapEntry[] {
  return courses
    .filter((c) => includedIds ? includedIds.has(c.id) : true)
    .map((c) => {
      const shift = shifts[c.id] ?? 0;
      const { startIdx, endIdx } = shiftedRange(c, shift);
      return { course: c, status: statusFromIdx(startIdx, endIdx, atIdx), startIdx, endIdx, shift };
    })
    .filter((e) => e.status !== '완료')
    .sort((a, b) => a.startIdx - b.startIdx || a.course.name.localeCompare(b.course.name));
}

export interface TimetableBlock {
  key: string;
  courseId?: string;
  sessionIdx?: number;
  label: string;
  subject: Subject;
  teacher?: string;
  slot: TimeSlot;
  movable: boolean;
}

export interface ConflictPair {
  a: TimetableBlock;
  b: TimetableBlock;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function detectConflicts(blocks: TimetableBlock[]): ConflictPair[] {
  const conflicts: ConflictPair[] = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];
      if (a.slot.day !== b.slot.day) continue;
      const aS = toMinutes(a.slot.start);
      const aE = toMinutes(a.slot.end);
      const bS = toMinutes(b.slot.start);
      const bE = toMinutes(b.slot.end);
      if (aS < bE && bS < aE) conflicts.push({ a, b });
    }
  }
  return conflicts;
}

export interface MonthlyTimetable {
  blocks: TimetableBlock[];
  conflicts: ConflictPair[];
}

export function buildMonthlyTimetable(
  courses: Course[],
  _track: Track,
  viewIdx: number,
  shifts: Record<string, number>,
  slotOverrides: Record<string, TimeSlot>,
  includedIds?: Set<string>
): MonthlyTimetable {
  const blocks: TimetableBlock[] = [];
  for (const c of courses) {
    if (includedIds && !includedIds.has(c.id)) continue;
    const shift = shifts[c.id] ?? 0;
    const { startIdx, endIdx } = shiftedRange(c, shift);
    if (viewIdx < startIdx || viewIdx > endIdx) continue;
    c.schedule.forEach((base, i) => {
      const key = sessionKey(c.id, i);
      const slot = slotOverrides[key] ?? base;
      if (!slot) return;
      blocks.push({
        key,
        courseId: c.id,
        sessionIdx: i,
        label: c.name,
        subject: c.subject,
        teacher: c.teacher,
        slot,
        movable: true,
      });
    });
  }
  return { blocks, conflicts: detectConflicts(blocks) };
}
