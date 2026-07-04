import { useRef, useState } from 'react';
import {
  COLORS,
  COURSE_TYPES,
  Course,
  CourseType,
  Grade,
  GRADES,
  Subject,
  Track,
  TRACKS,
  Weekday,
} from '../data/roadmap';
import {
  StoreData,
  defaultStore,
  exportStoreJson,
  newCourseId,
  parseStoreJson,
} from '../lib/store';

const SUBJECTS: Subject[] = ['과학'];
const TRACK_OPTIONS: Track[] = [...TRACKS];
const DAYS: Weekday[] = ['월', '화', '수', '목', '금', '토', '일'];
const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

interface Props {
  store: StoreData;
  onChange: (next: StoreData) => void;
}

export default function AdminPage({ store, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [filterTrack, setFilterTrack] = useState<string>('전체');
  const includedSet = new Set(store.includedIds);

  const updateCourse = (id: string, patch: Partial<Course>) =>
    onChange({ ...store, courses: store.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const updateSession = (
    id: string,
    i: number,
    patch: Partial<{ day: Weekday; start: string; end: string }>
  ) =>
    onChange({
      ...store,
      courses: store.courses.map((c) =>
        c.id !== id ? c : { ...c, schedule: c.schedule.map((s, j) => (j === i ? { ...s, ...patch } : s)) }
      ),
    });

  const addSession = (id: string) =>
    onChange({
      ...store,
      courses: store.courses.map((c) => {
        if (c.id !== id) return c;
        const last = c.schedule[c.schedule.length - 1] ?? { day: '월' as Weekday, start: '17:00', end: '19:00' };
        return { ...c, schedule: [...c.schedule, { ...last }] };
      }),
    });

  const removeSession = (id: string, i: number) =>
    onChange({
      ...store,
      courses: store.courses.map((c) =>
        c.id !== id || c.schedule.length <= 1 ? c : { ...c, schedule: c.schedule.filter((_, j) => j !== i) }
      ),
    });

  const addCourse = () => {
    const nc: Course = {
      id: newCourseId(),
      name: '새 과정',
      track: '공통',
      subject: '과학',
      type: '중등교과',
      start: { grade: '중1', month: 3 },
      end: { grade: '중1', month: 8 },
      schedule: [{ day: '토', start: '13:30', end: '16:00' }],
      teacher: '',
    };
    onChange({ ...store, courses: [...store.courses, nc], includedIds: [...store.includedIds, nc.id] });
  };

  const deleteCourse = (id: string) => {
    if (!confirm('이 과정을 삭제할까요?')) return;
    onChange({
      ...store,
      courses: store.courses.filter((c) => c.id !== id),
      includedIds: store.includedIds.filter((i) => i !== id),
    });
  };

  const toggleIncluded = (id: string) => {
    if (includedSet.has(id)) {
      onChange({ ...store, includedIds: store.includedIds.filter((i) => i !== id) });
    } else {
      onChange({ ...store, includedIds: [...store.includedIds, id] });
    }
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredCourses();
    const newIds = new Set(store.includedIds);
    filtered.forEach((c) => newIds.add(c.id));
    onChange({ ...store, includedIds: [...newIds] });
  };

  const deselectAllFiltered = () => {
    const filtered = new Set(getFilteredCourses().map((c) => c.id));
    onChange({ ...store, includedIds: store.includedIds.filter((id) => !filtered.has(id)) });
  };

  const getFilteredCourses = () =>
    filterTrack === '전체' ? store.courses : store.courses.filter((c) => c.track === filterTrack);

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      onChange(parseStoreJson(text));
      alert('불러왔습니다.');
    } catch (e) {
      alert('JSON을 읽지 못했습니다: ' + (e as Error).message);
    }
  };

  const resetAll = () => {
    if (!confirm('모든 과목 설정을 기본값으로 되돌릴까요?')) return;
    onChange(defaultStore());
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="admin">
      <div className="admin-toolbar no-print">
        <button className="primary" onClick={addCourse}>
          + 과정 추가
        </button>
        <button onClick={() => exportStoreJson(store)}>JSON 내보내기</button>
        <button onClick={() => fileRef.current?.click()}>JSON 가져오기</button>
        <button className="ghost" onClick={resetAll}>
          기본값 복원
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <span className="hint">변경 내용은 브라우저에 자동 저장됩니다.</span>
      </div>

      <div className="admin-filter">
        <span className="tabs-label">필터</span>
        <button className={`picker-tag ${filterTrack === '전체' ? 'active' : ''}`} onClick={() => setFilterTrack('전체')}>전체</button>
        {TRACK_OPTIONS.map((t) => (
          <button key={t} className={`picker-tag ${filterTrack === t ? 'active' : ''}`} onClick={() => setFilterTrack(t)}>{t}</button>
        ))}
        <span style={{ marginLeft: 12 }} />
        <button className="mini" onClick={selectAllFiltered}>전체 선택</button>
        <button className="mini" onClick={deselectAllFiltered}>전체 해제</button>
        <span className="hint" style={{ marginLeft: 8 }}>로드맵 {includedSet.size}개 선택됨</span>
      </div>

      <div className="admin-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th title="로드맵에 포함">로드맵</th>
              <th>과정명</th>
              <th>트랙</th>
              <th>과목</th>
              <th>유형</th>
              <th>시작</th>
              <th>종료</th>
              <th>수업 (요일·시간 · 주 N회)</th>
              <th>담당쌤</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c) => {
              const color = COLORS[c.subject] ?? { fill: '#D3D1C7' };
              return (
                <tr key={c.id} style={{ opacity: includedSet.has(c.id) ? 1 : 0.5 }}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={includedSet.has(c.id)}
                      onChange={() => toggleIncluded(c.id)}
                      title="로드맵에 포함"
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: color.fill, flexShrink: 0 }} />
                      <input value={c.name} onChange={(e) => updateCourse(c.id, { name: e.target.value })} />
                    </div>
                  </td>
                  <td>
                    <select value={c.track} onChange={(e) => updateCourse(c.id, { track: e.target.value as Track })}>
                      {TRACK_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={c.subject} onChange={(e) => updateCourse(c.id, { subject: e.target.value as Subject })}>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={c.type} onChange={(e) => updateCourse(c.id, { type: e.target.value as CourseType })}>
                      {COURSE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="ym">
                    <select value={c.start.grade} onChange={(e) => updateCourse(c.id, { start: { ...c.start, grade: e.target.value as Grade } })}>
                      {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    <select value={c.start.month} onChange={(e) => updateCourse(c.id, { start: { ...c.start, month: Number(e.target.value) } })}>
                      {MONTHS.map((m) => (<option key={m} value={m}>{m}월</option>))}
                    </select>
                  </td>
                  <td className="ym">
                    <select value={c.end.grade} onChange={(e) => updateCourse(c.id, { end: { ...c.end, grade: e.target.value as Grade } })}>
                      {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                    <select value={c.end.month} onChange={(e) => updateCourse(c.id, { end: { ...c.end, month: Number(e.target.value) } })}>
                      {MONTHS.map((m) => (<option key={m} value={m}>{m}월</option>))}
                    </select>
                  </td>
                  <td>
                    <div className="sessions">
                      {c.schedule.map((s, i) => (
                        <div className="session-row" key={i}>
                          <select value={s.day} onChange={(e) => updateSession(c.id, i, { day: e.target.value as Weekday })}>
                            {DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
                          </select>
                          <input type="time" value={s.start} onChange={(e) => updateSession(c.id, i, { start: e.target.value })} />
                          <span>~</span>
                          <input type="time" value={s.end} onChange={(e) => updateSession(c.id, i, { end: e.target.value })} />
                          <button className="del" title="세션 삭제" disabled={c.schedule.length <= 1} onClick={() => removeSession(c.id, i)}>−</button>
                        </div>
                      ))}
                      <button className="mini" onClick={() => addSession(c.id)}>+ 세션(주 N회)</button>
                    </div>
                  </td>
                  <td>
                    <input value={c.teacher ?? ''} placeholder="이름" onChange={(e) => updateCourse(c.id, { teacher: e.target.value })} />
                  </td>
                  <td>
                    <button className="del" onClick={() => deleteCourse(c.id)} title="삭제">✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
