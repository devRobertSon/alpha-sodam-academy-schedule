// src/data/roadmap.ts
export type Grade = '초4' | '초5' | '초6' | '중1' | '중2' | '중3';
export type Track = '공통';
export type Subject = '과학' | '수학';
export type CourseType = '초등교과' | '중등교과' | '고등교과';
export const COURSE_TYPES: CourseType[] = ['초등교과', '중등교과', '고등교과'];
export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';
export type Season = '봄' | '여름' | '가을' | '겨울';

export const GRADES: Grade[] = ['초4', '초5', '초6', '중1', '중2', '중3'];
export const TRACKS: Track[] = ['공통'];
export const ACADEMIC_MONTHS: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

// 타임라인의 마지막 월 인덱스(초4 3월 = 0 ~ 중3 2월). GRADES 길이에 맞춰 계산.
export const LAST_IDX = GRADES.length * 12 - 1;

// 브랜드 팔레트(알파학원 로고) — 과학은 스카이블루→네이비, 수학은 그린 계열로 과목 구분.
export const COLORS: Record<string, { fill: string; text: string }> = {
  과학: { fill: '#2C79D0', text: '#FFFFFF' },
  수학: { fill: '#2E9074', text: '#FFFFFF' },
};

export const COURSE_COLORS: Record<CourseType, { fill: string; text: string }> = {
  초등교과: { fill: '#5AA0E0', text: '#FFFFFF' },
  중등교과: { fill: '#2C79D0', text: '#FFFFFF' },
  고등교과: { fill: '#1C2B70', text: '#FFFFFF' },
};

// 과목별 색(수학=그린 계열, 과학=블루/네이비). 유형으로 명암 구분.
const MATH_COLORS: Record<CourseType, { fill: string; text: string }> = {
  초등교과: { fill: '#4FB08C', text: '#FFFFFF' },
  중등교과: { fill: '#2E9074', text: '#FFFFFF' },
  고등교과: { fill: '#1C6B54', text: '#FFFFFF' },
};

export function courseColor(type?: CourseType, subject?: Subject): { fill: string; text: string } {
  if (subject === '수학') return (type && MATH_COLORS[type]) || MATH_COLORS.중등교과;
  return (type && COURSE_COLORS[type]) || { fill: '#2C79D0', text: '#FFFFFF' };
}

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

const SCIENCE_COURSES: Course[] = [
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

// ── 수학 교과 (학기별: 초4-1 ~ 중3-2) ──
// 각 학기를 해당 학년의 실제 학기 위치에 배치(1학기=봄 3~8월, 2학기=가을·겨울 9~2월).
const MATH_SEMESTER_GRADES: { grade: Grade; type: CourseType }[] = [
  { grade: '초4', type: '초등교과' },
  { grade: '초5', type: '초등교과' },
  { grade: '초6', type: '초등교과' },
  { grade: '중1', type: '중등교과' },
  { grade: '중2', type: '중등교과' },
  { grade: '중3', type: '중등교과' },
];
const MATH_SEMESTER_COURSES: Course[] = MATH_SEMESTER_GRADES.flatMap(({ grade, type }) => {
  const slug = grade.replace('초', 'e').replace('중', 'm');
  return [1, 2].map<Course>((sem) => ({
    id: `gyo_math_${slug}_${sem}`,
    name: `수학 ${grade}-${sem}`,
    track: '공통',
    subject: '수학',
    type,
    start: { grade, month: sem === 1 ? 3 : 9 },
    end: { grade, month: sem === 1 ? 8 : 2 },
    schedule: [{ day: '화', start: '17:00', end: '18:30' }],
  }));
});

// ── 수학 교과 (고등: 교과목 이름) — 중등 후반에 가속 배치, 목요일 ──
const MATH_HIGH_COURSES: Course[] = [
  { id: 'gyo_math_h_common1', name: '공통수학1', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중2', month: 9 }, end: { grade: '중2', month: 11 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
  { id: 'gyo_math_h_common2', name: '공통수학2', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중2', month: 12 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
  { id: 'gyo_math_h_algebra', name: '대수', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 5 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
  { id: 'gyo_math_h_calculus', name: '미적분', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 6 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
  { id: 'gyo_math_h_geometry', name: '기하', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
  { id: 'gyo_math_h_prob', name: '확률과통계', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 12 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '목', start: '17:00', end: '19:30' }] },
];

export const TRACK_COURSES: Course[] = [
  ...SCIENCE_COURSES,
  ...MATH_SEMESTER_COURSES,
  ...MATH_HIGH_COURSES,
];
