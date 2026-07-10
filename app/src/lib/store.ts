// src/lib/store.ts — 과목 설정 영속화(localStorage) + JSON 백업
import { Course, TRACK_COURSES } from '../data/roadmap';

export interface StoreData {
  courses: Course[];
  includedIds: string[];
}

const KEY = 'asg.store.v4';
const OLD_KEYS = ['asg.store.v3', 'asg.store.v2', 'asg.store.v1'];

export function defaultStore(): StoreData {
  return {
    courses: TRACK_COURSES.map((c) => ({
      ...c,
      schedule: c.schedule.map((s) => ({ ...s })),
      start: { ...c.start },
      end: { ...c.end },
    })),
    includedIds: TRACK_COURSES.map((c) => c.id),
  };
}

export function loadStore(): StoreData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      OLD_KEYS.forEach((k) => localStorage.removeItem(k));
      return defaultStore();
    }
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const def = defaultStore();
    const validIds = new Set(TRACK_COURSES.map((c) => c.id));
    let courses = Array.isArray(parsed.courses)
      ? (parsed.courses as Course[]).filter((c) => validIds.has(c.id))
      : def.courses;
    const existingIds = new Set(courses.map((c) => c.id));
    const addedIds: string[] = [];
    for (const c of def.courses) {
      if (!existingIds.has(c.id)) {
        courses.push(c);
        addedIds.push(c.id);
      }
    }
    let includedIds = Array.isArray(parsed.includedIds)
      ? parsed.includedIds.filter((id) => validIds.has(id))
      : def.includedIds;
    // 새로 추가된 기본 과정(예: 수학)은 로드맵에 기본 포함
    const defIncluded = new Set(def.includedIds);
    const includedSet = new Set(includedIds);
    for (const id of addedIds) {
      if (defIncluded.has(id) && !includedSet.has(id)) {
        includedIds.push(id);
        includedSet.add(id);
      }
    }
    return { courses, includedIds };
  } catch {
    return defaultStore();
  }
}

export function saveStore(data: StoreData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 저장 실패는 무시 */
  }
}

export function exportStoreJson(data: StoreData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `소담알파학원_과목설정_${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseStoreJson(text: string): StoreData {
  const parsed = JSON.parse(text) as Partial<StoreData>;
  const def = defaultStore();
  if (!Array.isArray(parsed.courses)) throw new Error('courses 배열이 없습니다');
  return {
    courses: parsed.courses as Course[],
    includedIds: Array.isArray(parsed.includedIds) ? parsed.includedIds : def.includedIds,
  };
}

let _id = 0;
export function newCourseId(): string {
  _id += 1;
  return `c_${Date.now().toString(36)}_${_id}`;
}
