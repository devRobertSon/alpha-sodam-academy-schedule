// src/lib/logic.test.ts
import { describe, expect, it } from 'vitest';
import { gmIndex } from '../data/roadmap';
import { defaultStore } from './store';
import {
  buildMonthlyTimetable,
  courseStatus,
  detectConflicts,
  nowIndex,
  remainingCourses,
  sessionKey,
  shiftedRange,
} from './logic';

const courses = defaultStore().courses;
const byId = (id: string) => courses.find((c) => c.id === id)!;

describe('월 인덱스', () => {
  it('중2 9월 → 42, 중1 6월 → 27', () => {
    expect(nowIndex('중2', 9)).toBe(42);
    expect(nowIndex('중1', 6)).toBe(27);
  });
  it('초5 3월 = 0, 중3 2월 = 59', () => {
    expect(gmIndex('초5', 3)).toBe(0);
    expect(gmIndex('중3', 2)).toBe(59);
  });
});

describe('남은 과목(remainingCourses) — 중2 9월 공통', () => {
  const atIdx = nowIndex('중2', 9);
  const rem = remainingCourses(courses, '공통', atIdx);
  const names = rem.map((e) => e.course.name);

  it('완료된 과정(gyo_sci_m1_1)은 제외된다', () => {
    expect(courseStatus(byId('gyo_sci_m1_1'), atIdx)).toBe('완료');
    const ids = rem.map((e) => e.course.id);
    expect(ids).not.toContain('gyo_sci_m1_1');
  });
  it('고등화학이 남는다', () => {
    expect(names).toContain('고등화학');
  });
  it('시작 월 순으로 정렬된다', () => {
    const starts = rem.map((e) => e.startIdx);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });
});

describe('남은 과목 — 중1 3월 공통(전 과정 남음)', () => {
  it('과정들이 포함된다', () => {
    const atIdx = nowIndex('중1', 3);
    const rem = remainingCourses(courses, '공통', atIdx);
    expect(rem.length).toBeGreaterThan(0);
  });
});

describe('수강 월 이동(shift)', () => {
  it('shift가 시작/종료 인덱스를 함께 민다', () => {
    const c = byId('gyo_sci_h_chem');
    const base = shiftedRange(c, 0);
    const moved = shiftedRange(c, 3);
    expect(moved.startIdx).toBe(base.startIdx + 3);
    expect(moved.endIdx).toBe(base.endIdx + 3);
  });
  it('shift로 상태가 예정으로 바뀔 수 있다', () => {
    const atIdx = nowIndex('중2', 9); // 42
    const c = byId('gyo_sci_m3_1'); // 중2 9월~11월 → 진행중
    expect(courseStatus(c, atIdx, 0)).toBe('진행중');
    expect(courseStatus(c, atIdx, 6)).toBe('예정');
  });
});

describe('월별 시간표(buildMonthlyTimetable) — 공통 중2 9월', () => {
  const atIdx = nowIndex('중2', 9);
  const tt = buildMonthlyTimetable(courses, '공통', atIdx, {}, {});

  it('그 달 진행 중인 과정이 들어간다', () => {
    const labels = tt.blocks.map((b) => b.label);
    expect(labels).toContain('과학 중3-1');
  });
  it('드래그(slotOverride)는 해당 세션만 바꾼다', () => {
    const moved = buildMonthlyTimetable(courses, '공통', atIdx, {}, {
      [sessionKey('gyo_sci_m3_1', 0)]: { day: '월', start: '19:00', end: '21:00' },
    });
    const s0 = moved.blocks.find((b) => b.key === sessionKey('gyo_sci_m3_1', 0))!;
    expect(s0.slot.day).toBe('월');
  });
});

describe('충돌 감지', () => {
  it('같은 요일·겹치는 시간을 잡는다', () => {
    const c = detectConflicts([
      { key: 'a', label: 'A', subject: '과학', movable: true, slot: { day: '수', start: '17:00', end: '19:00' } },
      { key: 'b', label: 'B', subject: '과학', movable: true, slot: { day: '수', start: '18:00', end: '20:00' } },
    ]);
    expect(c.length).toBe(1);
  });
  it('끝=시작(붙은 시간)은 충돌이 아니다', () => {
    const c = detectConflicts([
      { key: 'a', label: 'A', subject: '과학', movable: true, slot: { day: '수', start: '16:00', end: '18:00' } },
      { key: 'b', label: 'B', subject: '과학', movable: true, slot: { day: '수', start: '18:00', end: '20:00' } },
    ]);
    expect(c.length).toBe(0);
  });
});
