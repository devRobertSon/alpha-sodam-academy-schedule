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
  // 선택: 반개월 정밀 배치. 있으면 로드맵/시간표가 이 값을 우선 사용한다.
  // spanStart = 시작 월 인덱스(소수 허용, 포함), spanMonths = 기간(개월, 소수 허용).
  // start/end(YM)는 관리 화면 표시·정수 격자 대비용 근사값.
  spanStart?: number;
  spanMonths?: number;
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

// ── 수학 교과 — 선행 커리큘럼(초4 3월부터 순서대로 이어 배치) ──
// 과정별 기간: 초등 2.5개월 · 중등 3.5개월 · 고등 5개월.
// spanStart/spanMonths(소수)로 반개월까지 정밀 배치한다.
const MATH_PLAN: { id: string; name: string; type: CourseType; months: number }[] = [
  { id: 'gyo_math_e4_1', name: '수학 초4-1', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_e4_2', name: '수학 초4-2', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_e5_1', name: '수학 초5-1', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_e5_2', name: '수학 초5-2', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_e6_1', name: '수학 초6-1', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_e6_2', name: '수학 초6-2', type: '초등교과', months: 2.5 },
  { id: 'gyo_math_m1_1', name: '수학 중1-1', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_m1_2', name: '수학 중1-2', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_m2_1', name: '수학 중2-1', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_m2_2', name: '수학 중2-2', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_m3_1', name: '수학 중3-1', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_m3_2', name: '수학 중3-2', type: '중등교과', months: 3.5 },
  { id: 'gyo_math_h_common1', name: '공통수학1', type: '고등교과', months: 5 },
  { id: 'gyo_math_h_common2', name: '공통수학2', type: '고등교과', months: 5 },
  { id: 'gyo_math_h_algebra', name: '대수', type: '고등교과', months: 5 },
  { id: 'gyo_math_h_calculus', name: '미적분', type: '고등교과', months: 5 },
  { id: 'gyo_math_h_geometry', name: '기하', type: '고등교과', months: 5 },
  { id: 'gyo_math_h_prob', name: '확률과통계', type: '고등교과', months: 5 },
];

const MATH_COURSES: Course[] = (() => {
  const out: Course[] = [];
  let cursor = 0; // 타임라인 시작(초4 3월)부터의 누적 개월(소수 허용)
  for (const m of MATH_PLAN) {
    const spanStart = cursor;
    cursor += m.months;
    // 관리 화면 표시용 근사 YM(정수 월). 실제 배치는 spanStart/spanMonths 사용.
    const startAnchor = Math.min(LAST_IDX, Math.round(spanStart));
    const endAnchor = Math.min(LAST_IDX, Math.max(startAnchor, Math.ceil(cursor) - 1));
    // 수업 시간: 선행 트랙이라 동시에 하나만 수강 → 같은 슬롯(화 17:00~19:00)
    out.push({
      id: m.id,
      name: m.name,
      track: '공통',
      subject: '수학',
      type: m.type,
      start: { grade: gradeOfIndex(startAnchor), month: monthOfIndex(startAnchor) },
      end: { grade: gradeOfIndex(endAnchor), month: monthOfIndex(endAnchor) },
      spanStart,
      spanMonths: m.months,
      schedule: [{ day: '화', start: '17:00', end: '19:00' }],
    });
  }
  return out;
})();

export const TRACK_COURSES: Course[] = [
  ...SCIENCE_COURSES,
  ...MATH_COURSES,
];
