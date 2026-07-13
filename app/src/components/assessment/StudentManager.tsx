import { Fragment, useState } from 'react';
import {
  AssessmentData,
  CourseOption,
  DIAGNOSTIC_COURSE_ID,
  Student,
  downloadText,
  studentsToCsv,
  todayStr,
} from '../../lib/assessment';

const GRADES = ['초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
  courses: CourseOption[];
}

export default function StudentManager({ data, setData, courses }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  // 진단테스트는 수강 과목이 아니라 채점 입력에서만 쓰는 특수 수업 → 수강 목록에서 제외
  const enrollCourses = courses.filter((c) => c.id !== DIAGNOSTIC_COURSE_ID);

  const exportCsv = () => downloadText(`학생목록_${todayStr()}.csv`, studentsToCsv(data.students, courses));

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
        <p className="muted" style={{ margin: 0, flex: 1 }}>
          학생은 <b>입시 상담 로드맵</b>에서 학생 시간표를 저장하면 자동으로 등록됩니다. 여기서는 등록된 학생을 확인·편집·삭제합니다.
        </p>
        <button className="ghost" onClick={exportCsv}>CSV 내려받기</button>
      </div>

      {data.students.length === 0 ? (
        <p className="muted">아직 등록된 학생이 없습니다. [입시 상담 로드맵]에서 학생 시간표를 저장하면 여기에 등록됩니다.</p>
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
