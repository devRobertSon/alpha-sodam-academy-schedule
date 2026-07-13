import { useEffect, useMemo, useRef, useState } from 'react';
import ConsultForm, { ConsultInfo } from './ConsultForm';
import RemainingRoadmap from './RemainingRoadmap';
import MonthlyTimetable from './MonthlyTimetable';
import AdminPage from './AdminPage';
import ExportBar from './ExportBar';
import PrintView from './PrintView';
import Logo from './Logo';
import CloudBar from './CloudBar';
import { GRADES, Grade, LAST_IDX, TimeSlot } from '../data/roadmap';
import { nowIndex, remainingCourses } from '../lib/logic';
import { loadStore, saveStore } from '../lib/store';
import { loadAssessment, saveAssessment, newId } from '../lib/assessment';
import { useCloudDoc } from '../lib/cloud';

type Page = 'consult' | 'admin';

const DEFAULT_CONSULT: ConsultInfo = {
  studentName: '',
  grade: '중1',
  month: 6,
};

export default function ConsultApp({ onHome }: { onHome: () => void }) {
  const [page, setPage] = useState<Page>('consult');
  const { value: store, setValue: setStore, status: cloudStatus } = useCloudDoc('roadmap', loadStore, saveStore);
  const { value: assess, setValue: setAssess } = useCloudDoc('assessment', loadAssessment, saveAssessment);

  const [info, setInfo] = useState<ConsultInfo>(DEFAULT_CONSULT);
  const [shifts, setShifts] = useState<Record<string, number>>({});
  const [slotOverrides, setSlotOverrides] = useState<Record<string, TimeSlot>>({});
  // 학생별 포함 과목(로드맵). 새 학생은 관리 탭의 기본 포함 과목에서 시작.
  const [includedList, setIncludedList] = useState<string[]>(() => store.includedIds);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  const includedIds = useMemo(() => new Set(includedList), [includedList]);

  const atIdx = useMemo(() => nowIndex(info.grade, info.month), [info.grade, info.month]);
  const [viewIdx, setViewIdx] = useState<number>(atIdx);

  useEffect(() => {
    setViewIdx((v) => Math.min(LAST_IDX, Math.max(atIdx, v)));
  }, [atIdx]);

  const exportRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('ko-KR');

  const remaining = remainingCourses(store.courses, '공통', atIdx, shifts, includedIds);
  const addable = store.courses.filter((c) => !includedIds.has(c.id));

  // 학생 불러오기 / 새 학생
  const selectStudent = (id: string) => {
    if (!id) {
      setCurrentStudentId(null);
      setInfo(DEFAULT_CONSULT);
      setIncludedList(store.includedIds);
      setShifts({});
      setSlotOverrides({});
      return;
    }
    const s = assess.students.find((x) => x.id === id);
    if (!s) return;
    setCurrentStudentId(id);
    const grade = (GRADES as string[]).includes(s.grade) ? (s.grade as Grade) : DEFAULT_CONSULT.grade;
    setInfo({ studentName: s.name, grade, month: s.consult?.month ?? DEFAULT_CONSULT.month });
    setIncludedList(s.consult?.includedIds ?? s.courseIds ?? store.includedIds);
    setShifts(s.consult?.shifts ?? {});
    setSlotOverrides(s.consult?.slotOverrides ?? {});
  };

  // 시간표 확정 → 학생 저장(평가 탭 등록)
  const saveStudent = () => {
    const name = info.studentName.trim();
    if (!name) {
      alert('상담 정보에 학생 이름을 입력하세요.');
      return;
    }
    const plan = { month: info.month, includedIds: includedList, shifts, slotOverrides };
    const courseIds = includedList.slice();
    const students = assess.students.slice();
    const idx = currentStudentId ? students.findIndex((s) => s.id === currentStudentId) : -1;
    if (idx >= 0) {
      students[idx] = { ...students[idx], name, grade: info.grade, courseIds, consult: plan };
    } else {
      const id = newId('stu');
      students.push({ id, name, grade: info.grade, courseIds, consult: plan });
      setCurrentStudentId(id);
    }
    setAssess({ ...assess, students });
    alert(`${name} 학생 시간표를 저장했습니다. 학생 개별 평가 탭에 등록됩니다.`);
  };

  return (
    <div className="app">
      <header className="app-header no-print">
        <div className="brand">
          <div className="brand-title">
            <button className="home-link" onClick={onHome}>← 홈</button>
            <Logo size={36} />
            <h1>소담 알파학원 입시 상담 로드맵</h1>
          </div>
          <nav className="page-nav">
            <button className={page === 'consult' ? 'active' : ''} onClick={() => setPage('consult')}>
              상담
            </button>
            <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>
              관리
            </button>
          </nav>
          <CloudBar status={cloudStatus} />
        </div>
        <p>
          {page === 'consult'
            ? '학생의 현재 학년·월을 입력하면, 남은 과목과 월별 시간표를 만들어 학부모님께 전달할 수 있습니다.'
            : '과정의 개설 월·기간·요일·시작시간·담당 선생님을 편집합니다. (브라우저 자동 저장 · JSON 백업 가능)'}
        </p>
      </header>

      {page === 'admin' ? (
        <section className="card">
          <AdminPage store={store} onChange={setStore} />
        </section>
      ) : (
        <>
          <section className="card no-print">
            <div className="consult-student-bar">
              <label className="field-inline">
                학생
                <select value={currentStudentId ?? ''} onChange={(e) => selectStudent(e.target.value)}>
                  <option value="">+ 새 학생</option>
                  {assess.students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                  ))}
                </select>
              </label>
              <button className="primary" onClick={saveStudent}>💾 학생 시간표 저장</button>
              {currentStudentId
                ? <span className="muted">저장된 학생을 편집 중 — 저장하면 갱신됩니다.</span>
                : <span className="muted">저장하면 학생 개별 평가 탭에 등록됩니다.</span>}
            </div>
            <h2>상담 정보</h2>
            <ConsultForm value={info} onChange={setInfo} />
            {addable.length > 0 && (
              <div className="add-course-row">
                <label className="field-inline">
                  과목 추가
                  <select
                    value=""
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id) setIncludedList((l) => (l.includes(id) ? l : [...l, id]));
                    }}
                  >
                    <option value="">+ 과목 선택</option>
                    {addable.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <span className="muted">이 학생 로드맵에 과목을 추가합니다. (막대의 ✕로 제거)</span>
              </div>
            )}
          </section>

          <ExportBar />

          <div className="export-region screen-only" ref={exportRef}>
            <div className="export-summary">
              <h2>
                {info.studentName ? `${info.studentName} 학생 · ` : ''}
                준비 로드맵
              </h2>
              <p>
                현재{' '}
                <b>
                  {info.grade} {info.month}월
                </b>
                <span className="gen-date"> · 상담일 {today}</span>
              </p>
            </div>

            <section className="card">
              <h2>
                ① 남은 과목 ({remaining.length}개)
              </h2>
              <p className="muted no-print">
                막대를 클릭하면 선택되고, 좌우 드래그로 시작 월을 옮길 수 있습니다.
                선택된 과목의 ✕를 누르면 로드맵에서 제거됩니다.
              </p>
              <div className="roadmap-scroll">
                <RemainingRoadmap
                  courses={store.courses}
                  atIdx={atIdx}
                  shifts={shifts}
                  onShiftChange={(id, shift) => setShifts((s) => ({ ...s, [id]: shift }))}
                  onRemove={(id) => setIncludedList((l) => l.filter((i) => i !== id))}
                  includedIds={includedIds}
                />
              </div>
            </section>

            <section className="card">
              <h2>② 월별 시간표</h2>
              <p className="muted no-print">
                ◀ ▶로 달을 바꿔 매월 시간표를 확인하고, 블록을 드래그해 요일·시간을 조정하세요.
                (같은 이름의 수업도 이 학생만의 요일·시간으로 저장됩니다.)
              </p>
              <MonthlyTimetable
                courses={store.courses}
                track={'공통'}
                atIdx={atIdx}
                viewIdx={viewIdx}
                onViewIdxChange={setViewIdx}
                shifts={shifts}
                slotOverrides={slotOverrides}
                onSlotOverrideChange={(key, slot) => setSlotOverrides((s) => ({ ...s, [key]: slot }))}
                includedIds={includedIds}
              />
            </section>
          </div>

          <PrintView
            courses={store.courses}
            atIdx={atIdx}
            shifts={shifts}
            slotOverrides={slotOverrides}
            includedIds={includedIds}
            studentName={info.studentName}
            grade={info.grade}
            month={info.month}
            today={today}
          />

          <footer className="app-footer no-print">
            <small>과목 목록·기본값은 [관리] 탭에서 변경 가능합니다. 학생별 시간표는 위에서 저장/불러오기 합니다.</small>
          </footer>
        </>
      )}
    </div>
  );
}
