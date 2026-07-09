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

const GRADES = ['초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

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
      <p className="hint" style={{ marginTop: -4 }}>
        CSV 열: 이름, 학년, 듣는수업(수업 이름을 <b>;</b>로 구분). 같은 이름은 갱신됩니다.
      </p>

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
