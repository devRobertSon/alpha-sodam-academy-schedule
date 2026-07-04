import { Grade, GRADES } from '../data/roadmap';

export interface ConsultInfo {
  studentName: string;
  grade: Grade;
  month: number;
}

interface Props {
  value: ConsultInfo;
  onChange: (next: ConsultInfo) => void;
}

const MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

export default function ConsultForm({ value, onChange }: Props) {
  const set = (patch: Partial<ConsultInfo>) => onChange({ ...value, ...patch });

  return (
    <form className="input-form" onSubmit={(e) => e.preventDefault()}>
      <div className="field">
        <label htmlFor="studentName">학생 이름</label>
        <input
          id="studentName"
          type="text"
          placeholder="(선택)"
          value={value.studentName}
          onChange={(e) => set({ studentName: e.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="grade">현재 학년</label>
        <select id="grade" value={value.grade} onChange={(e) => set({ grade: e.target.value as Grade })}>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="month">상담 월</label>
        <select id="month" value={value.month} onChange={(e) => set({ month: Number(e.target.value) })}>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
