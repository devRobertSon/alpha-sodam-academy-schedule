import { useEffect, useMemo, useRef, useState } from 'react';
import ConsultForm, { ConsultInfo } from './components/ConsultForm';
import CoursePicker from './components/CoursePicker';
import RemainingRoadmap from './components/RemainingRoadmap';
import MonthlyTimetable from './components/MonthlyTimetable';
import AdminPage from './components/AdminPage';
import ExportBar from './components/ExportBar';
import {
  MATH_GYO_SEQUENCE,
  SCI_GYO_HS_PARALLEL,
  SCI_GYO_MID_SEQUENCE,
  TimeSlot,
} from './data/roadmap';
import { nowIndex, remainingCourses } from './lib/logic';
import { StoreData, loadStore, saveStore } from './lib/store';

type Page = 'consult' | 'admin';

const DEFAULT_CONSULT: ConsultInfo = {
  studentName: '',
  grade: '중1',
  month: 6,
  mathIdx: MATH_GYO_SEQUENCE.indexOf('중3-2학기'),
  sciMode: 'mid',
  sciIdx: SCI_GYO_MID_SEQUENCE.indexOf('중2-2학기'),
};

export default function App() {
  const [page, setPage] = useState<Page>('consult');
  const [store, setStoreState] = useState<StoreData>(() => loadStore());
  const setStore = (next: StoreData) => {
    setStoreState(next);
    saveStore(next);
  };

  const [info, setInfo] = useState<ConsultInfo>(DEFAULT_CONSULT);
  const [shifts, setShifts] = useState<Record<string, number>>({});
  const [gyoShift, setGyoShift] = useState<{ math: number; sci: number }>({ math: 0, sci: 0 });
  const [slotOverrides, setSlotOverrides] = useState<Record<string, TimeSlot>>({});
  const [includedIds, setIncludedIds] = useState<Set<string>>(() =>
    new Set(store.courses.map((c) => c.id))
  );

  const atIdx = useMemo(() => nowIndex(info.grade, info.month), [info.grade, info.month]);
  const [viewIdx, setViewIdx] = useState<number>(atIdx);

  useEffect(() => {
    setViewIdx((v) => Math.min(59, Math.max(atIdx, v)));
  }, [atIdx]);

  const handleToggleCourse = (courseId: string) => {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const handleAddAll = (ids: string[]) => {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleRemoveAll = (ids: string[]) => {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const exportRef = useRef<HTMLDivElement>(null);

  const mathProgress = MATH_GYO_SEQUENCE[info.mathIdx];
  const sciSeq = info.sciMode === 'mid' ? SCI_GYO_MID_SEQUENCE : SCI_GYO_HS_PARALLEL;
  const sciProgress = sciSeq[info.sciIdx];
  const today = new Date().toLocaleDateString('ko-KR');

  const remaining = remainingCourses(store.courses, '일반', atIdx, shifts, includedIds);

  return (
    <div className="app">
      <header className="app-header no-print">
        <div className="brand">
          <h1>소담 알파학원 입시 상담 로드맵</h1>
          <nav className="page-nav">
            <button className={page === 'consult' ? 'active' : ''} onClick={() => setPage('consult')}>
              상담
            </button>
            <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>
              관리
            </button>
          </nav>
        </div>
        <p>
          {page === 'consult'
            ? '학생의 현재 학년·월·진도를 입력하면, 남은 과목과 월별 시간표를 만들어 학부모님께 전달할 수 있습니다.'
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
            <h2>상담 정보</h2>
            <ConsultForm value={info} onChange={setInfo} />
          </section>

          <section className="card no-print">
            <CoursePicker
              courses={store.courses}
              includedIds={includedIds}
              onToggle={handleToggleCourse}
              onAddAll={handleAddAll}
              onRemoveAll={handleRemoveAll}
            />
          </section>

          <ExportBar targetRef={exportRef} />

          <div className="export-region" ref={exportRef}>
            <div className="export-summary">
              <h2>
                {info.studentName ? `${info.studentName} 학생 · ` : ''}
                준비 로드맵
              </h2>
              <p>
                현재{' '}
                <b>
                  {info.grade} {info.month}월
                </b>{' '}
                · 수학 진도 <b>{mathProgress}</b> 완료 · 과학 진도 <b>{sciProgress}</b> 완료
                <span className="gen-date"> · 상담일 {today}</span>
              </p>
            </div>

            <section className="card">
              <h2>
                ① 남은 과목 ({remaining.length}개)
              </h2>
              <p className="muted no-print">
                막대를 좌우로 드래그하면 수강 시작 월을 옮길 수 있고, 월별 시간표에 바로 반영됩니다.
                과목 선택 패널에서 체크박스로 과목을 추가/제거하세요.
              </p>
              <div
                className="roadmap-scroll"
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
                onDrop={(e) => {
                  const courseId = e.dataTransfer.getData('courseId');
                  if (courseId && !includedIds.has(courseId)) {
                    handleToggleCourse(courseId);
                  }
                }}
              >
                <RemainingRoadmap
                  courses={store.courses}
                  gyo={store.gyo}
                  form={info}
                  track={'일반'}
                  atIdx={atIdx}
                  shifts={shifts}
                  onShiftChange={(id, shift) => setShifts((s) => ({ ...s, [id]: shift }))}
                  gyoShift={gyoShift}
                  onGyoShiftChange={(subject, shift) => setGyoShift((g) => ({ ...g, [subject]: shift }))}
                  includedIds={includedIds}
                />
              </div>
            </section>

            <section className="card">
              <h2>② 월별 시간표</h2>
              <p className="muted no-print">
                ◀ ▶로 달을 바꿔 매월 시간표를 확인하고, 블록을 드래그해 요일·시간을 조정하세요.
              </p>
              <MonthlyTimetable
                courses={store.courses}
                track={'일반'}
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

          <footer className="app-footer no-print">
            <small>과목 선택 패널에서 과목을 자유롭게 추가·제거할 수 있습니다 · 과정 내용은 [관리] 탭에서 수정</small>
          </footer>
        </>
      )}
    </div>
  );
}
