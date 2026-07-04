// src/data/roadmap.ts
export type Grade = '초5' | '초6' | '중1' | '중2' | '중3';
export type Track = '공통';
export type Subject = '과학';
export type CourseType = '중등교과' | '고등교과';
export const COURSE_TYPES: CourseType[] = ['중등교과', '고등교과'];
export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';
export type Season = '봄' | '여름' | '가을' | '겨울';

export const GRADES: Grade[] = ['초5', '초6', '중1', '중2', '중3'];
export const TRACKS: Track[] = ['공통'];
export const ACADEMIC_MONTHS: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

export const COLORS: Record<string, { fill: string; text: string }> = {
  과학: { fill: '#F0997B', text: '#4A1B0C' },
};

export function academicMonthIndex(month: number): number {
  return (month + 9) % 12;
}
export function gmIndex(grade: Grade, month: number): number {
  return GRADES.indexOf(grade) * 12 + academicMonthIndex(month);
}
export function monthToSeason(month: number): Season {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

export function gradeOfIndex(idx: number): Grade {
  return GRADES[Math.max(0, Math.min(GRADES.length - 1, Math.floor(idx / 12)))];
}
export function monthOfIndex(idx: number): number {
  return ACADEMIC_MONTHS[((idx % 12) + 12) % 12];
}
export function ymLabel(idx: number): string {
  return `${gradeOfIndex(idx)} ${monthOfIndex(idx)}월`;
}

export interface TimeSlot {
  day: Weekday;
  start: string;
  end: string;
}
export interface YM {
  grade: Grade;
  month: number;
}

export interface Course {
  id: string;
  name: string;
  track: Track | '공통';
  subject: Subject;
  type: CourseType;
  start: YM;
  end: YM;
  schedule: TimeSlot[];
  teacher?: string;
}

export const TRACK_COURSES: Course[] = [
  // ── 과학 교과 (중등) ──
  { id: 'gyo_sci_m1_1', name: '과학 중1-1', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중1', month: 3 }, end: { grade: '중1', month: 4 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_m1_2', name: '과학 중1-2', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중1', month: 5 }, end: { grade: '중1', month: 6 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_m2_1', name: '과학 중2-1', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 3 }, end: { grade: '중2', month: 5 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_m2_2', name: '과학 중2-2', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 6 }, end: { grade: '중2', month: 8 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_m3_1', name: '과학 중3-1', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 9 }, end: { grade: '중2', month: 11 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_m3_2', name: '과학 중3-2', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 12 }, end: { grade: '중2', month: 1 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  // ── 과학 교과 (고등) ──
  { id: 'gyo_sci_h_chem', name: '고등화학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중2', month: 2 }, end: { grade: '중3', month: 5 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_h_chem_prob', name: '화학문제풀이', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 6 }, end: { grade: '중3', month: 9 }, schedule: [{ day: '토', start: '13:30', end: '16:00' }] },
  { id: 'gyo_sci_h_physics', name: '고등물리학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 10 }, schedule: [{ day: '토', start: '10:00', end: '12:30' }] },
  { id: 'gyo_sci_h_int1', name: '고등 통합과학 1', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 5 }, schedule: [{ day: '토', start: '16:10', end: '18:40' }] },
  { id: 'gyo_sci_h_int2', name: '고등 통합과학 2', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 6 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '토', start: '16:10', end: '18:40' }] },
];
