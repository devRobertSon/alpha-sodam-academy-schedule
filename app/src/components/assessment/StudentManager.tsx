import { useState } from 'react';
import { AssessmentData, Student, newId } from '../../lib/assessment';

const GRADES = ['초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3'];

interface Props {
  data: AssessmentData;
  setData: (d: AssessmentData) => void;
}

export default function StudentManager({ data, setData }: Props) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('중1');

  const add = () => {
    const n = name.trim();
    if (!n) return;
    const s: Student = { id: newId('stu'), name: n, grade };
    setData({ ...data, students: [...data.students, s] });
    setName('');
  };

  const update = (id: string, patch: Partial<Student>) =>
    setData({ ...data, students: data.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) });

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
      </div>

      {data.students.length === 0 ? (
        <p className="muted">아직 등록된 학생이 없습니다. 이름을 입력해 추가하세요.</p>
      ) : (
        <table className="assess-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>학년</th>
              <th>메모</th>
              <th>채점</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((s) => {
              const cnt = data.results.filter((r) => r.studentId === s.id).length;
              return (
                <tr key={s.id}>
                  <td>
                    <input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
                  </td>
                  <td>
                    <select value={s.grade} onChange={(e) => update(s.id, { grade: e.target.value })}>
                      {GRADES.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
