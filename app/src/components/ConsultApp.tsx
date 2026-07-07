import { useEffect, useMemo, useRef, useState } from 'react';
import ConsultForm, { ConsultInfo } from './ConsultForm';
import RemainingRoadmap from './RemainingRoadmap';
import MonthlyTimetable from './MonthlyTimetable';
import AdminPage from './AdminPage';
import ExportBar from './ExportBar';
import PrintView from './PrintView';
import Logo from './Logo';
import { TimeSlot } from '../data/roadmap';
import { nowIndex, remainingCourses } from '../lib/logic';
import { StoreData, loadStore, saveStore } from '../lib/store';

type Page = 'consult' | 'admin';

const DEFAULT_CONSULT: ConsultInfo = {
  studentName: '',
  grade: '중1',
  month: 6,
};

export default function ConsultApp({ onHome }: { onHome: () => void }) {
  const [page, setPage] = useState<Page>('consult');
  const [store, setStoreState] = useState<StoreData>(() => loadStore());
  const setStore = (next: StoreData) => {
    setStoreState(next);
    saveStore(next);
  };

  const [info, setInfo] = useState<ConsultInfo>(DEFAULT_CONSULT);
  const [shifts, setShifts] = useState<Record<string, number>>({});
  const [slotOverrides, setSlotOverrides] = useState<Record<string, TimeSlot>>({});

  const includedIds = useMemo(() => new Set(store.includedIds), [store.includedIds]);

  const atIdx = useMemo(() => nowIndex(info.grade, info.month), [info.grade, info.month]);
  const [viewIdx, setViewIdx] = useState<number>(atIdx);

  useEffect(() => {
    setViewIdx((v) => Math.min(59, Math.max(atIdx, v)));
  }, [atIdx]);

  const exportRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('ko-KR');

  const remaining = remainingCourses(store.courses, '공통', atIdx, shifts, includedIds);

  return (
    <div className="app">
      <header className="app-header no-print">
        <div className="brand">
          <div className="brand-title">
            <button className="home-link" onClick={onHome}>← 홈</button>
            <Logo size={26} />
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
            <h2>상담 정보</h2>
            <ConsultForm value={info} onChange={setInfo} />
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
                  onRemove={(id) => setStore({ ...store, includedIds: store.includedIds.filter((i) => i !== id) })}
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
            <small>과목 선택은 [관리] 탭에서 변경 가능합니다</small>
          </footer>
        </>
      )}
    </div>
  );
}
