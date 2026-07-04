import { Fragment, useRef, useState } from 'react';
import {
  AssessmentData,
  Exam,
  ExamKind,
  ExamQuestion,
  examQuestionsFromCsv,
  newId,
  todayStr,
} from '../../lib/assessment';

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
}

interface Draft {
  title: string;
  subject: string;
  kind: ExamKind;
  date: string;
  questions: ExamQuestion[];
  errors: string[];
}

export default function ExamManager({ data, setData }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const onFile = async (file: File) => {
    const text = await file.text();
    const res = examQuestionsFromCsv(text);
    if (res.questions.length === 0) {
      alert('문항을 읽지 못했습니다.\n' + res.errors.join('\n'));
      return;
    }
    const base = file.name.replace(/\.csv$/i, '');
    setDraft({
      title: res.title || base,
      subject: res.subject || '과학',
      kind: /주별|주간|weekly/i.test(base) ? '주별' : '진단',
      date: todayStr(),
      questions: res.questions,
      errors: res.errors,
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const exam: Exam = {
      id: newId('exam'),
      title: draft.title.trim() || '제목 없음',
      subject: draft.subject.trim() || '과학',
      kind: draft.kind,
      date: draft.date,
      questions: draft.questions,
    };
    setData({ ...data, exams: [...data.exams, exam] });
    setDraft(null);
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
  };

  const types = draft ? Array.from(new Set(draft.questions.map((q) => q.type))) : [];

  return (
    <div className="assess-pane">
      <div className="assess-row">
        <button className="primary" onClick={() => fileRef.current?.click()}>＋ CSV 시험지 업로드</button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
        <span className="hint">CSV 열: 문항번호·유형(필수), 과목·정답·배점·시험지(선택)</span>
      </div>

      {draft && (
        <div className="assess-card draft">
          <h3>업로드 미리보기 · {draft.questions.length}문항 · 유형 {types.length}종</h3>
          <div className="assess-row wrap">
            <label className="assess-field">
              시험지명
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label className="assess-field">
              과목
              <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
            </label>
            <label className="assess-field">
              종류
              <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as ExamKind })}>
                <option value="진단">진단평가</option>
                <option value="주별">주별평가</option>
              </select>
            </label>
            <label className="assess-field">
              날짜
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </label>
          </div>
          {draft.errors.length > 0 && (
            <div className="assess-warn">⚠ {draft.errors.slice(0, 5).join(' / ')}{draft.errors.length > 5 ? ' …' : ''}</div>
          )}
          <div className="assess-preview-grid">
            {draft.questions.map((q) => (
              <span key={q.no} className="assess-chip">
                <b>{q.no}</b> {q.type}
              </span>
            ))}
          </div>
          <div className="assess-row">
            <button className="primary" onClick={saveDraft}>저장</button>
            <button className="ghost" onClick={() => setDraft(null)}>취소</button>
          </div>
        </div>
      )}

      {data.exams.length === 0 ? (
        <p className="muted">등록된 시험지가 없습니다. CSV를 업로드하세요.</p>
      ) : (
        <table className="assess-table">
          <thead>
            <tr>
              <th>시험지</th>
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
                <tr>
                  <td>{ex.title}</td>
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
                    <td colSpan={7}>
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
      )}
    </div>
  );
}
