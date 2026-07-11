import { useEffect, useMemo, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { AssessmentData, TypeStat, scoreOf, todayStr, typeStatsCumulative } from '../../lib/assessment';

interface Props {
  data: AssessmentData;
}

// 이 문제 수 이상인 유형만 차트(막대·레이더)에 표시. 그 미만은 아래 비고 표로.
const MIN_CHART_TOTAL = 5;

function rateColor(rate: number): string {
  if (rate >= 0.8) return '#2C79D0';
  if (rate >= 0.5) return '#E3A72E';
  return '#D6443B';
}

function MinorNote({ stats }: { stats: TypeStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="type-minor">
      <div className="type-minor-head">
        참고 · 문제 수가 적은 유형 (각 {MIN_CHART_TOTAL}문제 미만이라 차트에서 제외)
      </div>
      <table className="type-minor-table">
        <thead>
          <tr><th>유형</th><th>정답률</th><th>문항</th></tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.type}>
              <td>{s.type}</td>
              <td style={{ color: rateColor(s.rate), fontWeight: 700 }}>{Math.round(s.rate * 100)}%</td>
              <td className="muted">{s.correct}/{s.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

const RADAR_W = 480;
const RADAR_H = 390;
const RADAR_R = 128;

function TypeRadar({ stats }: { stats: TypeStat[] }) {
  if (stats.length < 3) {
    return <p className="muted">레이더 차트는 유형이 3개 이상일 때 표시됩니다.</p>;
  }
  const cx = RADAR_W / 2;
  const cy = RADAR_H / 2 + 8;
  const n = stats.length;
  const angleOf = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const ptOf = (i: number, r: number): [number, number] => [
    cx + r * Math.cos(angleOf(i)),
    cy + r * Math.sin(angleOf(i)),
  ];
  const ringPoly = (ratio: number) =>
    stats.map((_, i) => ptOf(i, RADAR_R * ratio).map((v) => v.toFixed(1)).join(',')).join(' ');
  const dataPoly = stats
    .map((s, i) => ptOf(i, RADAR_R * s.rate).map((v) => v.toFixed(1)).join(','))
    .join(' ');
  const shorten = (t: string) => (t.length > 12 ? t.slice(0, 11) + '…' : t);

  return (
    <svg
      className="type-radar"
      viewBox={`0 0 ${RADAR_W} ${RADAR_H}`}
      role="img"
      aria-label="유형별 정답률 레이더 차트"
    >
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={ringPoly(ratio)}
          fill={ratio === 1 ? '#F3F7FD' : 'none'}
          stroke="#D5DFF0"
          strokeWidth={ratio === 1 ? 1.2 : 0.8}
        />
      ))}
      {stats.map((_, i) => {
        const [x, y] = ptOf(i, RADAR_R);
        return <line key={`axis-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#D5DFF0" strokeWidth={0.8} />;
      })}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <text
          key={`ring-label-${ratio}`}
          x={cx + 4}
          y={cy - RADAR_R * ratio - 2}
          fontSize={8.5}
          fill="#8894AB"
        >
          {Math.round(ratio * 100)}
        </text>
      ))}

      <polygon points={dataPoly} fill="rgba(44,121,208,0.22)" stroke="#2C79D0" strokeWidth={2} strokeLinejoin="round" />
      {stats.map((s, i) => {
        const [x, y] = ptOf(i, RADAR_R * s.rate);
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r={3.5} fill={rateColor(s.rate)} stroke="#fff" strokeWidth={1.2}>
            <title>{`${s.type} ${Math.round(s.rate * 100)}% (${s.correct}/${s.total})`}</title>
          </circle>
        );
      })}

      {stats.map((s, i) => {
        const a = angleOf(i);
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const [x, y] = ptOf(i, RADAR_R + 16);
        const anchor = Math.abs(cos) < 0.35 ? 'middle' : cos > 0 ? 'start' : 'end';
        const dy = sin < -0.35 ? -8 : sin > 0.35 ? 10 : 0;
        return (
          <g key={`label-${i}`} textAnchor={anchor}>
            <text x={x} y={y + dy} fontSize={11} fontWeight={600} fill="#16224E">
              {shorten(s.type)}
              <title>{s.type}</title>
            </text>
            <text x={x} y={y + dy + 13} fontSize={10} fill={rateColor(s.rate)} fontWeight={700}>
              {Math.round(s.rate * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TypeReport({ data }: Props) {
  const [studentId, setStudentId] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [busy, setBusy] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const student = data.students.find((s) => s.id === studentId);
  const examById = useMemo(() => new Map(data.exams.map((e) => [e.id, e])), [data.exams]);

  const studentResults = useMemo(
    () => data.results.filter((r) => r.studentId === studentId).sort((a, b) => a.date.localeCompare(b.date)),
    [data.results, studentId]
  );

  // 학생이 바뀌면 기간 초기화 + 그 학생의 모든 응시를 기본 선택
  useEffect(() => {
    setFromDate('');
    setToDate('');
    setSelectedIds(new Set(studentResults.map((r) => r.id)));
  }, [studentId, studentResults.length]);

  // 기간을 정하면 그 기간에 응시한 시험을 선택(날짜 문자열 YYYY-MM-DD 사전순 비교)
  const applyRange = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    const inRange = studentResults.filter((r) => (!from || r.date >= from) && (!to || r.date <= to));
    setSelectedIds(new Set(inRange.map((r) => r.id)));
  };

  const selectedResults = useMemo(
    () => studentResults.filter((r) => selectedIds.has(r.id)),
    [studentResults, selectedIds]
  );

  const stats: TypeStat[] = useMemo(
    () => (studentId ? typeStatsCumulative(data.exams, selectedResults) : []),
    [studentId, data.exams, selectedResults]
  );
  const mainStats = useMemo(() => stats.filter((s) => s.total >= MIN_CHART_TOTAL), [stats]);
  const minorStats = useMemo(() => stats.filter((s) => s.total < MIN_CHART_TOTAL), [stats]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const selectAll = () => applyRange('', '');
  const clearAll = () => {
    setFromDate('');
    setToDate('');
    setSelectedIds(new Set());
  };

  const today = todayStr();

  const downloadPdf = async () => {
    if (!captureRef.current || !student) return;
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const dataUrl = await toJpeg(captureRef.current, { backgroundColor: '#ffffff', quality: 0.92, pixelRatio: 2, cacheBust: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const MARGIN = 12; // 상하좌우 여백(mm) — 인쇄 시 잘림 방지
      const contentW = pageW - MARGIN * 2;
      const contentH = pageH - MARGIN * 2;
      const props = pdf.getImageProperties(dataUrl);
      const imgH = (props.height * contentW) / props.width;
      const pages = Math.max(1, Math.ceil(imgH / contentH));
      for (let k = 0; k < pages; k++) {
        if (k > 0) pdf.addPage();
        // 이미지를 여백 안쪽에 배치하고, 페이지마다 위로 밀어 다음 구간을 보여줌
        pdf.addImage(dataUrl, 'JPEG', MARGIN, MARGIN - k * contentH, contentW, imgH);
        // 인접 구간이 상·하 여백으로 넘쳐 보이지 않도록 여백 영역을 흰색으로 덮음
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageW, MARGIN, 'F');
        pdf.rect(0, pageH - MARGIN, pageW, MARGIN, 'F');
      }
      pdf.save(`리포트_${student.name}_${today}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="assess-pane">
      <div className="assess-row wrap">
        <label className="assess-field">
          학생
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">선택</option>
            {data.students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
            ))}
          </select>
        </label>
        {studentId && studentResults.length > 0 && (
          <button className="primary" onClick={downloadPdf} disabled={busy || selectedResults.length === 0}>
            {busy ? '저장 중…' : '📄 리포트 PDF 저장'}
          </button>
        )}
      </div>

      {!studentId ? (
        <p className="muted">학생을 선택하면 유형별 정답률이 표시됩니다.</p>
      ) : studentResults.length === 0 ? (
        <p className="muted">이 학생의 채점 결과가 없습니다. [채점 입력]에서 먼저 채점하세요.</p>
      ) : (
        <>
          <div className="assess-card">
            <div className="report-pick-head">
              <b>리포트에 포함할 시험</b>
              <span className="report-pick-actions">
                <button className="mini" onClick={selectAll}>전체 선택</button>
                <button className="mini ghost" onClick={clearAll}>전체 해제</button>
                <span className="muted">{selectedResults.length}/{studentResults.length}개 선택</span>
              </span>
            </div>
            <div className="report-range">
              <span className="report-range-label">기간으로 선택</span>
              <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => applyRange(e.target.value, toDate)} />
              <span>~</span>
              <input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => applyRange(fromDate, e.target.value)} />
              <span className="muted">기간을 정하면 그 기간에 응시한 시험이 선택됩니다. (개별 체크로 조정 가능)</span>
            </div>
            <div className="report-exam-list">
              {studentResults.map((r) => {
                const ex = examById.get(r.examId);
                const sc = scoreOf(r.marks);
                return (
                  <label key={r.id} className={`report-exam-item ${selectedIds.has(r.id) ? 'on' : ''}`}>
                    <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggle(r.id)} />
                    <span className="report-exam-name">{ex?.title ?? '시험'}</span>
                    <span className="muted">{ex?.kind ?? ''}평가 · {r.date} · {sc.correct}/{sc.total} ({Math.round(sc.rate * 100)}%)</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedResults.length === 0 ? (
            <p className="muted">시험을 하나 이상 선택하세요.</p>
          ) : (
            <div ref={captureRef} className="report-capture">
              <div className="report-cap-head">
                <div className="report-cap-title">{student?.name} 학생 · 유형별 평가 리포트</div>
                <div className="report-cap-sub">
                  {student?.grade} · 생성일 {today}
                  {(fromDate || toDate) && ` · 기간 ${fromDate || '처음'} ~ ${toDate || '끝'}`}
                  {' · '}대상 시험 {selectedResults.length}개
                </div>
              </div>

              <div className="assess-card">
                <h3>유형별 정답률</h3>
                {mainStats.length === 0 ? (
                  <p className="muted">
                    {stats.length === 0
                      ? '표시할 데이터가 없습니다.'
                      : `문제 수가 ${MIN_CHART_TOTAL}개 이상인 유형이 없어 차트를 생략합니다. (아래 참고 표)`}
                  </p>
                ) : (
                  <>
                    <TypeBars stats={mainStats} />
                    <div className="type-radar-wrap">
                      <TypeRadar stats={mainStats} />
                    </div>
                  </>
                )}
                <MinorNote stats={minorStats} />
              </div>

              <div className="assess-card">
                <h3>응시 이력 (선택한 시험)</h3>
                <table className="assess-table">
                  <thead>
                    <tr><th>시험지</th><th>종류</th><th>응시일</th><th>정답률</th></tr>
                  </thead>
                  <tbody>
                    {selectedResults.map((r) => {
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
