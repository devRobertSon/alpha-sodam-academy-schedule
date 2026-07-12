import { Fragment, useRef, useState } from 'react';
import {
  AssessmentData,
  CourseOption,
  DIAGNOSTIC_COURSE_ID,
  Student,
  downloadText,
  newId,
  parseStudentsCsv,
  studentsToCsv,
  todayStr,
  upsertStudents,
} from '../../lib/assessment';

const GRADES = ['초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

// 업로드 예시(양식) — 받아서 내용만 바꿔 다시 올리면 됩니다.
const SAMPLE_STUDENTS_CSV = `이름,학년,듣는수업
이영희,중2,과학 중2-1;수학 중2-1
김민수,중3,과학 중3-1;공통수학1`;

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
  courses: CourseOption[];
}

export default function StudentManager({ data, setData, courses }: Props) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('중1');
  const [openId, setOpenId] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  // 진단테스트는 수강 과목이 아니라 채점 입력에서만 쓰는 특수 수업 → 수강 목록에서 제외
  const enrollCourses = courses.filter((c) => c.id !== DIAGNOSTIC_COURSE_ID);

  const exportCsv = () => downloadText(`학생목록_${todayStr()}.csv`, studentsToCsv(data.students, courses));
  const downloadSample = () => downloadText('학생목록_예시.csv', SAMPLE_STUDENTS_CSV);

  const importCsv = async (file: File) => {
    const { drafts, errors } = parseStudentsCsv(await file.text(), courses);
    if (drafts.length === 0) {
      alert('학생을 읽지 못했습니다.\n' + errors.join('\n'));
      return;
    }
    const { data: next, added, updated } = upsertStudents(data, drafts);
    setData(next);
    alert(`가져오기 완료 — 추가 ${added}명, 갱신 ${updated}명.` + (errors.length ? '\n\n주의:\n' + errors.slice(0, 8).join('\n') : ''));
  };

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const s: Student = { id: newId('stu'), name: n, grade, courseIds: [] };
    setData({ ...data, students: [...data.students, s] });
    setName('');
  };

  const update = (id: string, patch: Partial<Student>) =>
    setData({ ...data, students: data.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

  const toggleCourse = (student: Student, courseId: string) => {
    const cur = student.courseIds ?? [];
    const next = cur.includes(courseId) ? cur.filter((c) => c !== courseId) : [...cur, courseId];
    update(student.id, { courseIds: next });
  };

  const remove = (id: string) => {
    const s = data.students.find((x) => x.id === id);
    const cnt = data.results.filter((r) => r.studentId === id).length;
    if (!confirm(`${s?.name} 학생을 삭제할까요?${cnt ? ` (채점 결과 ${cnt}건도 함께 삭제)` : ''}`)) return;
    setData({
      ...data,
      students: data.students.filter((x) => x.id !== id),
      results: data.results.filter((r) => r.studentId !== id),
    });
  };

  const nameOf = (id: string) => courses.find((c) => c.id === id)?.name ?? '(삭제된 수업)';

  return (
    <div className="assess-pane">
      <div className="assess-row">
        <input
          className="assess-input"
          placeholder="학생 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button className="primary" onClick={add}>+ 학생 추가</button>
        <span style={{ marginLeft: 'auto' }} />
        <button className="ghost" onClick={exportCsv}>CSV 내려받기</button>
        <button className="ghost" onClick={downloadSample}>예시 CSV</button>
        <button className="ghost" onClick={() => csvRef.current?.click()}>CSV 올리기</button>
        <input
          ref={csvRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importCsv(f);
            e.target.value = '';
          }}
        />
      </div>
      <details className="csv-help">
        <summary>CSV 어떻게 만드나요?</summary>
        <p>
          엑셀·구글 시트에서 아래 형식으로 만들어 <b>CSV로 저장</b>해 올리거나, <b>[예시 CSV]</b> 버튼으로 양식을 받아 내용만 바꿔 올리세요.
        </p>
        <ul>
          <li><b>이름</b> — 학생 이름 (필수)</li>
          <li><b>학년</b> — 예: 초5, 중2 (필수)</li>
          <li><b>듣는수업</b> — 로드맵의 수업 이름. 여러 개면 <b>;</b>(세미콜론)으로 구분 (선택)</li>
        </ul>
        <pre className="manual-code">{SAMPLE_STUDENTS_CSV}</pre>
        <p className="muted">열 순서는 무관하고 헤더 이름으로 인식합니다. 같은 이름의 학생은 갱신됩니다. 수업 이름은 <b>관리 탭 / 로드맵</b>의 과정 이름과 같아야 합니다.</p>
      </details>

      {data.students.length === 0 ? (
        <p className="muted">아직 등록된 학생이 없습니다. 이름을 입력해 추가하세요.</p>
      ) : (
        <table className="assess-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>학년</th>
              <th>듣는 수업</th>
              <th>메모</th>
              <th>채점</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => {
              const cnt = data.results.filter((r) => r.studentId === s.id).length;
              const enrolled = (s.courseIds ?? []).filter((id) => id !== DIAGNOSTIC_COURSE_ID);
              return (
                <Fragment key={s.id}>
                  <tr>
                    <td>
                      <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
                    </td>
                    <td>
                      <select value={s.grade} onChange={(e) => update(s.id, { grade: e.target.value })}>
                        {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                      </select>
                    </td>
                    <td>
                      <button className="mini" onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                        {enrolled.length ? `${enrolled.length}개 수업` : '수업 선택'} {openId === s.id ? '▲' : '▾'}
                      </button>
                    </td>
                    <td>
                      <input
                        className="wide"
                        value={s.memo ?? ''}
                        placeholder="메모"
                        onChange={(e) => update(s.id, { memo: e.target.value })}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{cnt}건</td>
                    <td>
                      <button className="del" onClick={() => remove(s.id)} title="삭제">✕</button>
                    </td>
                  </tr>
                  {openId === s.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="course-picker-row">
                          <span className="hint">듣는 수업을 선택하세요(여러 개 가능) · 입시 상담 로드맵의 과정 목록</span>
                          <div className="course-chips">
                            {enrollCourses.map((c) => {
                              const on = enrolled.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  className={`course-chip ${on ? 'on' : ''}`}
                                  onClick={() => toggleCourse(s, c.id)}
                                >
                                  {on ? '✓ ' : ''}{c.name}
                                </button>
                              );
                            })}
                          </div>
                          {enrolled.length > 0 && (
                            <div className="course-selected muted">
                              선택됨: {enrolled.map(nameOf).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
