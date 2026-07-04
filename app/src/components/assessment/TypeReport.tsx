import { useMemo, useState } from 'react';
import {
  AssessmentData,
  TypeStat,
  scoreOf,
  typeStatsCumulative,
  typeStatsForResult,
} from '../../lib/assessment';

interface Props {
  data: AssessmentData;
}

function rateColor(rate: number): string {
  if (rate >= 0.8) return '#2C79D0';
  if (rate >= 0.5) return '#E3A72E';
  return '#D6443B';
}

function TypeBars({ stats }: { stats: TypeStat[] }) {
  if (stats.length === 0) return <p className="muted">표시할 데이터가 없습니다.</p>;
  return (
    <div className="type-bars">
      {stats.map((s) => (
        <div key={s.type} className="type-bar-row">
          <div className="type-bar-label" title={s.type}>{s.type}</div>
          <div className="type-bar-track">
            <div className="type-bar-fill" style={{ width: `${Math.round(s.rate * 100)}%`, background: rateColor(s.rate) }} />
          </div>
          <div className="type-bar-val">
            {Math.round(s.rate * 100)}% <span className="muted">({s.correct}/{s.total})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TypeReport({ data }: Props) {
  const [studentId, setStudentId] = useState('');
  const [scope, setScope] = useState<string>('all'); // 'all' 또는 resultId

  const studentResults = useMemo(
    () => data.results.filter((r) => r.studentId === studentId).sort((a, b) => a.date.localeCompare(b.date)),
    [data.results, studentId]
  );

  const examById = useMemo(() => new Map(data.exams.map((e) => [e.id, e])), [data.exams]);

  const stats: TypeStat[] = useMemo(() => {
    if (!studentId) return [];
    if (scope === 'all') return typeStatsCumulative(data.exams, studentResults);
    const res = studentResults.find((r) => r.id === scope);
    const exam = res && examById.get(res.examId);
    if (!res || !exam) return [];
    return typeStatsForResult(exam, res.marks);
  }, [studentId, scope, data.exams, studentResults, examById]);

  return (
    <div className="assess-pane">
      <div className="assess-row wrap">
        <label className="assess-field">
          학생
          <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setScope('all'); }}>
            <option value="">선택</option>
            {data.students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
            ))}
          </select>
        </label>
        {studentId && (
          <label className="assess-field">
            범위
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all">전체 누적 ({studentResults.length}개 시험)</option>
              {studentResults.map((r) => {
                const ex = examById.get(r.examId);
                return (
                  <option key={r.id} value={r.id}>{ex?.title ?? '시험'} · {r.date}</option>
                );
              })}
            </select>
          </label>
        )}
      </div>

      {!studentId ? (
        <p className="muted">학생을 선택하면 유형별 정답률이 표시됩니다.</p>
      ) : studentResults.length === 0 ? (
        <p className="muted">이 학생의 채점 결과가 없습니다. [채점 입력]에서 먼저 채점하세요.</p>
      ) : (
        <>
          <div className="assess-card">
            <h3>유형별 정답률</h3>
            <TypeBars stats={stats} />
          </div>

          <div className="assess-card">
            <h3>응시 이력</h3>
            <table className="assess-table">
              <thead>
                <tr><th>시험지</th><th>종류</th><th>응시일</th><th>정답률</th></tr>
              </thead>
              <tbody>
                {studentResults.map((r) => {
                  const ex = examById.get(r.examId);
                  const sc = scoreOf(r.marks);
                  return (
                    <tr key={r.id}>
                      <td>{ex?.title ?? '—'}</td>
                      <td>{ex?.kind ?? ''}평가</td>
                      <td>{r.date}</td>
                      <td>{sc.correct}/{sc.total} · {Math.round(sc.rate * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
