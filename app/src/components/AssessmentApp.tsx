import { useMemo, useRef, useState } from 'react';
import {
  exportAssessmentJson,
  listCourses,
  loadAssessment,
  parseAssessmentJson,
  saveAssessment,
} from '../lib/assessment';
import { useCloudDoc } from '../lib/cloud';
import Logo from './Logo';
import CloudBar from './CloudBar';
import StudentManager from './assessment/StudentManager';
import ExamManager from './assessment/ExamManager';
import GradingPanel from './assessment/GradingPanel';
import TypeReport from './assessment/TypeReport';

type Tab = 'students' | 'exams' | 'grading' | 'report';

const TABS: { key: Tab; label: string }[] = [
  { key: 'students', label: '학생 관리' },
  { key: 'exams', label: '시험지 관리' },
  { key: 'grading', label: '채점 입력' },
  { key: 'report', label: '리포트' },
];

export default function AssessmentApp({ onHome }: { onHome: () => void }) {
  const { value: data, setValue: setData, status: cloudStatus } = useCloudDoc('assessment', loadAssessment, saveAssessment);
  const [tab, setTab] = useState<Tab>('students');
  const fileRef = useRef<HTMLInputElement>(null);
  const courses = useMemo(() => listCourses(), []);

  const importJson = async (file: File) => {
    try {
      setData(parseAssessmentJson(await file.text()));
      alert('불러왔습니다.');
    } catch (e) {
      alert('JSON을 읽지 못했습니다: ' + (e as Error).message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-title">
            <button className="home-link" onClick={onHome}>← 홈</button>
            <Logo size={36} />
            <h1>학생 개별 평가</h1>
          </div>
          <div className="admin-toolbar" style={{ margin: 0 }}>
            <CloudBar status={cloudStatus} />
            <button onClick={() => exportAssessmentJson(data)}>JSON 내보내기</button>
            <button onClick={() => fileRef.current?.click()}>JSON 가져오기</button>
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
          </div>
        </div>
        <p>진단·단원 평가를 학생별로 채점하고 유형별 리포트를 확인합니다. (브라우저 자동 저장 · JSON 백업)</p>
      </header>

      <nav className="assess-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>

      <section className="card">
        {tab === 'students' && <StudentManager data={data} setData={setData} courses={courses} />}
        {tab === 'exams' && <ExamManager data={data} setData={setData} courses={courses} />}
        {tab === 'grading' && <GradingPanel data={data} setData={setData} courses={courses} />}
        {tab === 'report' && <TypeReport data={data} />}
      </section>
    </div>
  );
}
