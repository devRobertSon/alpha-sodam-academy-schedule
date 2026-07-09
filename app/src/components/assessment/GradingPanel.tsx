import { useEffect, useMemo, useState } from 'react';
import { AssessmentData, CourseOption, Mark, Result, newId, scoreOf, todayStr } from '../../lib/assessment';

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
  courses: CourseOption[];
}

type Cell = boolean | null; // true=O(맞음), false=X(틀림), null=미입력

export default function GradingPanel({ data, setData, courses }: Props) {
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [examId, setExamId] = useState('');
  const [cells, setCells] = useState<Record<number, Cell>>({});
  const [date, setDate] = useState(todayStr());

  const exam = data.exams.find((e) => e.id === examId);

  // 선택한 수업의 시험지·학생만
  const examOptions = useMemo(
    () => (courseId ? data.exams.filter((e) => e.courseId === courseId) : []),
    [courseId, data.exams]
  );
  const enrolled = useMemo(
    () => data.students.filter((s) => (s.courseIds ?? []).includes(courseId)),
    [courseId, data.students]
  );
  const usingAllStudents = !!courseId && enrolled.length === 0 && data.students.length > 0;
  const studentOptions = courseId ? (enrolled.length > 0 ? enrolled : data.students) : [];

  const existing = useMemo(
    () => data.results.find((r) => r.studentId === studentId && r.examId === examId),
    [data.results, studentId, examId]
  );

  const changeCourse = (id: string) => {
    setCourseId(id);
    setStudentId('');
    setExamId('');
  };

  // 학생·시험 바뀌면 기존 채점 불러오기(없으면 빈칸)
  useEffect(() => {
    if (!exam) {
      setCells({});
      return;
    }
    const map: Record<number, Cell> = {};
    exam.questions.forEach((q) => (map[q.no] = null));
    if (existing) {
      existing.marks.forEach((m) => (map[m.no] = m.correct));
      setDate(existing.date);
    } else {
      setDate(todayStr());
    }
    setCells(map);
  }, [examId, studentId, exam, existing]);

  const setCell = (no: number, v: Cell) => setCells((c) => ({ ...c, [no]: v }));
  const setAll = (v: Cell) => {
    if (!exam) return;
    const map: Record<number, Cell> = {};
    exam.questions.forEach((q) => (map[q.no] = v));
    setCells(map);
  };

  const marks: Mark[] = exam
    ? exam.questions.filter((q) => cells[q.no] !== null && cells[q.no] !== undefined).map((q) => ({ no: q.no, correct: cells[q.no] === true }))
    : [];
  const answered = marks.length;
  const score = scoreOf(marks);

  const save = () => {
    if (!studentId || !exam) {
      alert('수업·학생·시험지를 모두 선택하세요.');
      return;
    }
    const res: Result = {
      id: existing?.id ?? newId('res'),
      studentId,
      examId,
      date,
      marks,
    };
    const others = data.results.filter((r) => !(r.studentId === studentId && r.examId === examId));
    setData({ ...data, results: [...others, res] });
    alert('채점을 저장했습니다.');
  };

  const canGrade = data.students.length > 0 && data.exams.length > 0;

  return (
    <div className="assess-pane">
      {!canGrade ? (
        <p className="muted">먼저 [학생]과 [시험지]를 등록하세요.</p>
      ) : (
        <>
          <div className="assess-row wrap">
            <label className="assess-field">
              수업
              <select value={courseId} onChange={(e) => changeCourse(e.target.value)}>
                <option value="">선택</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="assess-field">
              학생
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!courseId}>
                <option value="">선택</option>
                {studentOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </label>
            <label className="assess-field">
              시험지
              <select value={examId} onChange={(e) => setExamId(e.target.value)} disabled={!courseId}>
                <option value="">선택</option>
                {examOptions.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title} ({ex.kind}·{ex.questions.length}문항)</option>
                ))}
              </select>
            </label>
            <label className="assess-field">
              응시일
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          </div>

          {!courseId && <p className="muted">먼저 수업을 선택하면 그 수업의 학생과 시험지를 고를 수 있습니다.</p>}
          {courseId && examOptions.length === 0 && (
            <p className="muted">이 수업의 시험지가 없습니다. [시험지 관리]에서 이 수업으로 CSV를 업로드하세요.</p>
          )}
          {usingAllStudents && (
            <p className="muted">이 수업에 등록된 학생이 없어 전체 학생을 표시합니다. [학생 관리]에서 수업을 지정할 수 있습니다.</p>
          )}

          {exam && (
            <>
              <div className="assess-row">
                <button className="mini" onClick={() => setAll(true)}>전체 O</button>
                <button className="mini" onClick={() => setAll(false)}>전체 X</button>
                <button className="mini ghost" onClick={() => setAll(null)}>초기화</button>
                {existing && <span className="assess-badge">저장된 채점 불러옴</span>}
              </div>

              <div className="ox-grid">
                {exam.questions.map((q) => {
                  const v = cells[q.no];
                  return (
                    <div key={q.no} className="ox-item">
                      <div className="ox-no" title={q.type}>{q.no}</div>
                      <div className="ox-btns">
                        <button
                          className={`ox-o ${v === true ? 'on' : ''}`}
                          onClick={() => setCell(q.no, v === true ? null : true)}
                        >O</button>
                        <button
                          className={`ox-x ${v === false ? 'on' : ''}`}
                          onClick={() => setCell(q.no, v === false ? null : false)}
                        >X</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="assess-scorebar">
                <span>맞은 개수 <b>{score.correct}</b> / {exam.questions.length}</span>
                <span>정답률 <b>{Math.round(score.rate * 100)}%</b></span>
                <span className="muted">입력 {answered}/{exam.questions.length}</span>
                <button className="primary" onClick={save}>채점 저장</button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
