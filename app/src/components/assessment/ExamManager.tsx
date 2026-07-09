import { Fragment, useRef, useState } from 'react';
import {
  AssessmentData,
  CourseOption,
  DIAGNOSTIC_COURSE_ID,
  Exam,
  ExamKind,
  ExamQuestion,
  examQuestionsFromCsv,
  newId,
  resolveCourseName,
  todayStr,
} from '../../lib/assessment';

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
  courses: CourseOption[];
}

interface Draft {
  key: string;
  filename: string;
  title: string;
  subject: string;
  kind: ExamKind;
  date: string;
  courseId: string;
  questions: ExamQuestion[];
  errors: string[];
}

export default function ExamManager({ data, setData, courses }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const draftFromCsv = (file: File, text: string): Draft | null => {
    const res = examQuestionsFromCsv(text);
    if (res.questions.length === 0) return null;
    const base = file.name.replace(/\.csv$/i, '');
    const kind: ExamKind = /주별|주간|weekly/i.test(base) ? '주별' : '진단';
    // CSV에 수업 이름이 있으면 그 수업으로 자동 지정, 없으면 진단→진단테스트 기본
    let courseId = kind === '진단' ? DIAGNOSTIC_COURSE_ID : '';
    if (res.course) {
      const wanted = res.course.trim();
      const match =
        courses.find((c) => c.name.trim() === wanted) ??
        (/^진단(\s*테스트)?$/.test(wanted) ? courses.find((c) => c.id === DIAGNOSTIC_COURSE_ID) : undefined);
      if (match) courseId = match.id;
      else res.errors.push(`CSV의 수업 "${wanted}"을(를) 찾지 못해 수업을 직접 선택해야 합니다.`);
    }
    return {
      key: newId('draft'),
      filename: file.name,
      title: res.title || base,
      subject: res.subject || '과학',
      kind,
      date: todayStr(),
      courseId,
      questions: res.questions,
      errors: res.errors,
    };
  };

  const onFiles = async (files: File[]) => {
    const parsed = await Promise.all(files.map(async (f) => draftFromCsv(f, await f.text())));
    const ok = parsed.filter((d): d is Draft => d !== null);
    const failed = files.filter((_, i) => parsed[i] === null).map((f) => f.name);
    if (ok.length) setDrafts((prev) => [...prev, ...ok]);
    if (failed.length) alert('문항을 읽지 못한 파일: ' + failed.join(', '));
  };

  const updateDraft = (key: string, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const removeDraft = (key: string) => setDrafts((prev) => prev.filter((d) => d.key !== key));

  const saveAll = () => {
    const valid = drafts.filter((d) => d.courseId);
    const invalid = drafts.filter((d) => !d.courseId);
    if (valid.length === 0) {
      alert('저장할 시험지의 [수업]을 선택하세요.');
      return;
    }
    const newExams: Exam[] = valid.map((d) => ({
      id: newId('exam'),
      title: d.title.trim() || '제목 없음',
      subject: d.subject.trim() || '과학',
      kind: d.kind,
      date: d.date,
      courseId: d.courseId,
      questions: d.questions,
    }));
    setData({ ...data, exams: [...data.exams, ...newExams] });
    setDrafts(invalid);
    if (invalid.length) alert(`${valid.length}개 저장했습니다. ${invalid.length}개는 수업 미선택이라 남겨뒀습니다.`);
  };

  const removeExam = (id: string) => {
    const e = data.exams.find((x) => x.id === id);
    const cnt = data.results.filter((r) => r.examId === id).length;
    if (!confirm(`"${e?.title}" 시험지를 삭제할까요?${cnt ? ` (채점 결과 ${cnt}건도 함께 삭제)` : ''}`)) return;
    setData({
      ...data,
      exams: data.exams.filter((x) => x.id !== id),
      results: data.results.filter((r) => r.examId !== id),
    });
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const removeSelected = () => {
    if (selected.size === 0) return;
    const cnt = data.results.filter((r) => selected.has(r.examId)).length;
    if (!confirm(`선택한 시험지 ${selected.size}개를 삭제할까요?${cnt ? ` (채점 결과 ${cnt}건도 함께 삭제)` : ''}`)) return;
    setData({
      ...data,
      exams: data.exams.filter((x) => !selected.has(x.id)),
      results: data.results.filter((r) => !selected.has(r.examId)),
    });
    setSelected(new Set());
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allSelected = data.exams.length > 0 && selected.size === data.exams.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(data.exams.map((e) => e.id)));

  return (
    <div className="assess-pane">
      <div className="assess-row">
        <button className="primary" onClick={() => fileRef.current?.click()}>＋ CSV 시험지 업로드</button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const fs = Array.from(e.target.files ?? []);
            if (fs.length) onFiles(fs);
            e.target.value = '';
          }}
        />
        <span className="hint">여러 CSV를 한 번에 올릴 수 있습니다. 열: 문항번호·유형(필수), 과목·정답·배점·시험지·수업(선택).</span>
      </div>

      {drafts.length > 0 && (
        <div className="assess-card draft">
          <div className="report-pick-head">
            <h3 style={{ margin: 0 }}>업로드 미리보기 · {drafts.length}개 시험지</h3>
            <span className="report-pick-actions">
              <button className="primary" onClick={saveAll}>모두 저장</button>
              <button className="ghost" onClick={() => setDrafts([])}>모두 취소</button>
            </span>
          </div>
          {drafts.map((d) => {
            const typeCount = new Set(d.questions.map((q) => q.type)).size;
            return (
              <div key={d.key} className="draft-item">
                <div className="draft-item-head">
                  <b>{d.filename}</b>
                  <span className="muted">{d.questions.length}문항 · 유형 {typeCount}종</span>
                  <button className="del" onClick={() => removeDraft(d.key)} title="이 파일 제외">✕</button>
                </div>
                <div className="assess-row wrap">
                  <label className="assess-field">
                    시험지명
                    <input value={d.title} onChange={(e) => updateDraft(d.key, { title: e.target.value })} />
                  </label>
                  <label className="assess-field">
                    과목
                    <input value={d.subject} onChange={(e) => updateDraft(d.key, { subject: e.target.value })} />
                  </label>
                  <label className="assess-field">
                    종류
                    <select value={d.kind} onChange={(e) => updateDraft(d.key, { kind: e.target.value as ExamKind })}>
                      <option value="진단">진단평가</option>
                      <option value="주별">주별평가</option>
                    </select>
                  </label>
                  <label className="assess-field">
                    수업
                    <select value={d.courseId} onChange={(e) => updateDraft(d.key, { courseId: e.target.value })}>
                      <option value="">선택</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="assess-field">
                    날짜
                    <input type="date" value={d.date} onChange={(e) => updateDraft(d.key, { date: e.target.value })} />
                  </label>
                </div>
                {d.errors.length > 0 && (
                  <div className="assess-warn">⚠ {d.errors.slice(0, 5).join(' / ')}{d.errors.length > 5 ? ' …' : ''}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {data.exams.length === 0 ? (
        <p className="muted">등록된 시험지가 없습니다. CSV를 업로드하세요.</p>
      ) : (
        <>
          <div className="assess-row">
            <span className="hint">{data.exams.length}개 시험지 · {selected.size}개 선택됨</span>
            <span style={{ marginLeft: 'auto' }} />
            <button className="del-btn" disabled={selected.size === 0} onClick={removeSelected}>
              선택 삭제{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
          </div>
          <table className="assess-table">
            <thead>
              <tr>
                <th style={{ width: 28, textAlign: 'center' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} title="전체 선택" />
                </th>
                <th>시험지</th>
                <th>수업</th>
                <th>종류</th>
                <th>과목</th>
                <th>날짜</th>
                <th>문항</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.exams.map((ex) => (
                <Fragment key={ex.id}>
                  <tr className={selected.has(ex.id) ? 'row-selected' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={selected.has(ex.id)} onChange={() => toggle(ex.id)} />
                    </td>
                    <td>{ex.title}</td>
                    <td>{resolveCourseName(courses, ex.courseId)}</td>
                    <td>{ex.kind}평가</td>
                    <td>{ex.subject}</td>
                    <td>{ex.date}</td>
                    <td style={{ textAlign: 'center' }}>{ex.questions.length}</td>
                    <td>
                      <button className="mini" onClick={() => setOpenId(openId === ex.id ? null : ex.id)}>
                        {openId === ex.id ? '접기' : '유형 보기'}
                      </button>
                    </td>
                    <td>
                      <button className="del" onClick={() => removeExam(ex.id)} title="삭제">✕</button>
                    </td>
                  </tr>
                  {openId === ex.id && (
                    <tr>
                      <td colSpan={9}>
                        <div className="assess-preview-grid">
                          {ex.questions.map((q) => (
                            <span key={q.no} className="assess-chip">
                              <b>{q.no}</b> {q.type}{q.answer ? ` · 답 ${q.answer}` : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
