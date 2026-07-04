// src/data/roadmap.ts
export type Grade = '초5' | '초6' | '중1' | '중2' | '중3';
export type Track = '영재학교' | '과학고' | '국제고' | '외고' | '전사고' | '일반';
export type Subject = '수학' | '과학' | '면접';
export type CourseType =
  | '영재학교입시'
  | '과학고입시'
  | '외고입시'
  | '국제고입시'
  | '고등내신'
  | '과학고내신'
  | '중등선행'
  | '고등선행'
  | '중등내신'
  | '중등교과'
  | '고등교과';
export const COURSE_TYPES: CourseType[] = [
  '영재학교입시',
  '과학고입시',
  '외고입시',
  '국제고입시',
  '고등내신',
  '과학고내신',
  '중등선행',
  '고등선행',
  '중등내신',
  '중등교과',
  '고등교과',
];
export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';
export type Season = '봄' | '여름' | '가을' | '겨울';

export const GRADES: Grade[] = ['초5', '초6', '중1', '중2', '중3'];
export const TRACKS: Track[] = ['일반', '영재학교', '과학고', '국제고', '외고', '전사고'];
export const ACADEMIC_MONTHS: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

export const COLORS: Record<string, { fill: string; text: string }> = {
  수학: { fill: '#85B7EB', text: '#042C53' },
  과학: { fill: '#F0997B', text: '#4A1B0C' },
  면접: { fill: '#AFA9EC', text: '#26215C' },
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
  // ── 영재학교 · 수학 ──
  { id: 'yj_chang1', name: '창의수학 1단계', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중1', month: 6 }, end: { grade: '중1', month: 2 }, schedule: [{ day: '월', start: '18:00', end: '20:00' }], teacher: '김민수' },
  { id: 'yj_kmo_algebra', name: 'KMO 대수', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중2', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '화', start: '18:00', end: '20:00' }], teacher: '이정훈' },
  { id: 'yj_kmo_geometry', name: 'KMO 기하', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중2', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '화', start: '20:00', end: '22:00' }], teacher: '이정훈' },
  { id: 'yj_kmo_number', name: 'KMO 정수', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중2', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '토', start: '10:00', end: '12:00' }], teacher: '김민수' },
  { id: 'yj_kmo_combi', name: 'KMO 조합', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중2', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '토', start: '13:00', end: '15:00' }], teacher: '김민수' },
  { id: 'yj_final_math', name: '영재 파이널 수학', track: '영재학교', subject: '수학', type: '영재학교입시',
    start: { grade: '중2', month: 12 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '목', start: '18:00', end: '21:00' }], teacher: '이정훈' },
  { id: 'yj_hs_math_review', name: '고등수학 총정리', track: '영재학교', subject: '수학', type: '고등선행',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '토', start: '10:00', end: '13:00' }], teacher: '김민수' },
  // ── 영재학교 · 과학 ──
  { id: 'yj_astro_genetics', name: '천체·유전 특강', track: '영재학교', subject: '과학', type: '영재학교입시',
    start: { grade: '중2', month: 6 }, end: { grade: '중2', month: 11 }, schedule: [{ day: '수', start: '18:00', end: '20:00' }], teacher: '정우성' },
  { id: 'yj_mid_adv_sci', name: '중등심화과학', track: '영재학교', subject: '과학', type: '영재학교입시',
    start: { grade: '중2', month: 12 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '금', start: '18:00', end: '20:00' }], teacher: '한지민' },
  { id: 'yj_final_sci', name: '영재 파이널 과학', track: '영재학교', subject: '과학', type: '영재학교입시',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '토', start: '14:00', end: '17:00' }], teacher: '정우성' },
  { id: 'yj_phys_chem_review', name: '물리학/화학 총정리', track: '영재학교', subject: '과학', type: '고등선행',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '일', start: '10:00', end: '13:00' }], teacher: '한지민' },
  // ── 과학고 · 수학 ──
  { id: 'sg_chang1', name: '창의수학 1단계', track: '과학고', subject: '수학', type: '과학고입시',
    start: { grade: '중2', month: 6 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '월', start: '17:00', end: '19:00' }] },
  { id: 'sg_chang2', name: '창의수학 2단계', track: '과학고', subject: '수학', type: '과학고입시',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '목', start: '17:00', end: '20:00' }] },
  { id: 'sg_interview_math', name: '과학고 면접 대비(수학)', track: '과학고', subject: '수학', type: '과학고입시',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '토', start: '13:00', end: '15:00' }] },
  { id: 'sg_hs_math_info_review', name: '고등수학 및 정보 총정리', track: '과학고', subject: '수학', type: '과학고내신',
    start: { grade: '중3', month: 12 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '토', start: '15:00', end: '18:00' }] },
  // ── 과학고 · 과학 ──
  { id: 'sg_mid_adv_sci', name: '중등심화과학', track: '과학고', subject: '과학', type: '과학고입시',
    start: { grade: '중3', month: 6 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '수', start: '17:00', end: '19:00' }] },
  { id: 'sg_interview_sci', name: '과학고 면접 대비(과학)', track: '과학고', subject: '과학', type: '과학고입시',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '토', start: '15:00', end: '17:00' }] },
  { id: 'sg_hs_sci_review', name: '고등과학 총정리', track: '과학고', subject: '과학', type: '과학고내신',
    start: { grade: '중3', month: 12 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '일', start: '13:00', end: '16:00' }] },
  // ── 국제고 ──
  { id: 'ig_interview', name: '면접 대비', track: '국제고', subject: '면접', type: '국제고입시',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '금', start: '19:00', end: '21:00' }] },
  { id: 'ig_int_sci1', name: '통합과학1', track: '국제고', subject: '과학', type: '고등선행',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '화', start: '17:00', end: '19:00' }] },
  // ── 외고 ──
  { id: 'fl_interview', name: '면접 대비', track: '외고', subject: '면접', type: '외고입시',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '금', start: '19:00', end: '21:00' }] },
  { id: 'fl_int_sci1', name: '통합과학1', track: '외고', subject: '과학', type: '고등선행',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '화', start: '17:00', end: '19:00' }] },
  // ── 전사고 ──
  { id: 'js_int_sci1', name: '통합과학1', track: '전사고', subject: '과학', type: '고등선행',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '목', start: '17:00', end: '19:00' }] },
  // ── 일반 (내신·선행 중심) ──
  { id: 'gen_mid_math', name: '중등내신 수학', track: '일반', subject: '수학', type: '중등내신',
    start: { grade: '중1', month: 3 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '화', start: '17:00', end: '19:00' }, { day: '목', start: '17:00', end: '19:00' }] },
  { id: 'gen_mid_sci', name: '중등내신 과학', track: '일반', subject: '과학', type: '중등내신',
    start: { grade: '중1', month: 3 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '수', start: '17:00', end: '19:00' }] },
  { id: 'gen_hs_math', name: '고등선행 수학', track: '일반', subject: '수학', type: '고등선행',
    start: { grade: '중2', month: 3 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '토', start: '10:00', end: '12:00' }] },
  { id: 'gen_hs_sci', name: '고등선행 과학', track: '일반', subject: '과학', type: '고등선행',
    start: { grade: '중2', month: 6 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '토', start: '13:00', end: '15:00' }] },
  { id: 'gen_naesin_math', name: '고등내신 수학', track: '일반', subject: '수학', type: '고등내신',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '금', start: '18:00', end: '20:00' }] },

  // ── 수학 교과 (중등: 학기별) ──
  { id: 'gyo_math_m1_1', name: '수학 중1-1학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중1', month: 3 }, end: { grade: '중1', month: 8 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  { id: 'gyo_math_m1_2', name: '수학 중1-2학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중1', month: 9 }, end: { grade: '중1', month: 2 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  { id: 'gyo_math_m2_1', name: '수학 중2-1학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중2', month: 3 }, end: { grade: '중2', month: 8 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  { id: 'gyo_math_m2_2', name: '수학 중2-2학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중2', month: 9 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  { id: 'gyo_math_m3_1', name: '수학 중3-1학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  { id: 'gyo_math_m3_2', name: '수학 중3-2학기', track: '공통', subject: '수학', type: '중등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '수', start: '16:00', end: '18:00' }] },
  // ── 수학 교과 (고등: 과목별) ──
  { id: 'gyo_math_h_common1', name: '공통수학1', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중2', month: 3 }, end: { grade: '중2', month: 8 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_common2', name: '공통수학2', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중2', month: 9 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_algebra', name: '대수', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 5 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_calc1', name: '미적분I', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 6 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_prob', name: '확률과 통계', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 11 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_calc2', name: '미적분II', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 12 }, end: { grade: '중3', month: 1 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },
  { id: 'gyo_math_h_geom', name: '기하', track: '공통', subject: '수학', type: '고등교과',
    start: { grade: '중3', month: 2 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '토', start: '14:00', end: '16:00' }] },

  // ── 과학 교과 (중등: 학기별) ──
  { id: 'gyo_sci_m1_1', name: '과학 중1-1학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중1', month: 3 }, end: { grade: '중1', month: 8 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  { id: 'gyo_sci_m1_2', name: '과학 중1-2학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중1', month: 9 }, end: { grade: '중1', month: 2 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  { id: 'gyo_sci_m2_1', name: '과학 중2-1학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 3 }, end: { grade: '중2', month: 8 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  { id: 'gyo_sci_m2_2', name: '과학 중2-2학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중2', month: 9 }, end: { grade: '중2', month: 2 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  { id: 'gyo_sci_m3_1', name: '과학 중3-1학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  { id: 'gyo_sci_m3_2', name: '과학 중3-2학기', track: '공통', subject: '과학', type: '중등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '금', start: '16:00', end: '18:00' }] },
  // ── 과학 교과 (고등: 과목별) ──
  { id: 'gyo_sci_h_physics', name: '물리학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '일', start: '10:00', end: '12:00' }] },
  { id: 'gyo_sci_h_chemistry', name: '화학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 3 }, end: { grade: '중3', month: 8 }, schedule: [{ day: '일', start: '13:00', end: '15:00' }] },
  { id: 'gyo_sci_h_biology', name: '생명과학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '일', start: '10:00', end: '12:00' }] },
  { id: 'gyo_sci_h_earth', name: '지구과학', track: '공통', subject: '과학', type: '고등교과',
    start: { grade: '중3', month: 9 }, end: { grade: '중3', month: 2 }, schedule: [{ day: '일', start: '13:00', end: '15:00' }] },
];
