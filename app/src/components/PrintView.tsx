// src/components/PrintView.tsx — 인쇄(B-1 클린 레저) 전용 레이아웃
// 1페이지: "로드맵" 제목 + 로드맵만
// 2페이지~: 가로 방향, 한 장에 월 시간표 2개(좌·우), 마지막 달까지
import {
  Course,
  TimeSlot,
  Weekday,
  courseColor,
  gradeOfIndex,
  monthOfIndex,
} from '../data/roadmap';
import { buildMonthlyTimetable, remainingCourses } from '../lib/logic';
import RemainingRoadmap from './RemainingRoadmap';

interface Props {
  courses: Course[];
  atIdx: number;
  shifts: Record<string, number>;
  slotOverrides: Record<string, TimeSlot>;
  includedIds: Set<string>;
  studentName?: string;
  grade: string;
  month: number;
  today: string;
}

const DAYS: Weekday[] = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_W = 34;
const DAY_W = 48;
const SLOT_H = 16;
const HEAD_H = 20;
const SLOT_MIN = 30;

const toMin = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

function StaticTimetable({
  courses,
  monthIdx,
  shifts,
  slotOverrides,
  includedIds,
}: {
  courses: Course[];
  monthIdx: number;
  shifts: Record<string, number>;
  slotOverrides: Record<string, TimeSlot>;
  includedIds: Set<string>;
}) {
  const { blocks } = buildMonthlyTimetable(courses, '공통', monthIdx, shifts, slotOverrides, includedIds);

  // 기본 시간대 13~19시, 그 밖의 수업이 있으면 그만큼 확장
  let minStart = 13 * 60;
  let maxEnd = 19 * 60;
  if (blocks.length) {
    minStart = Math.min(minStart, ...blocks.map((b) => toMin(b.slot.start)));
    maxEnd = Math.max(maxEnd, ...blocks.map((b) => toMin(b.slot.end)));
  }
  minStart = Math.floor(minStart / 60) * 60;
  maxEnd = Math.ceil(maxEnd / 60) * 60;

  const slotCount = Math.max(1, (maxEnd - minStart) / SLOT_MIN);
  const gridW = TIME_W + DAYS.length * DAY_W;
  const gridH = HEAD_H + slotCount * SLOT_H;

  return (
    <div className="pt-grid" style={{ position: 'relative', width: gridW, height: gridH }}>
      {DAYS.map((d, i) => (
        <div
          key={d}
          className="pt-day-head"
          style={{ position: 'absolute', left: TIME_W + i * DAY_W, top: 0, width: DAY_W, height: HEAD_H }}
        >
          {d}
        </div>
      ))}
      {Array.from({ length: slotCount + 1 }).map((_, s) => {
        const min = minStart + s * SLOT_MIN;
        const onHour = min % 60 === 0;
        return (
          <div key={`row-${s}`}>
            {onHour && (
              <div
                className="pt-time"
                style={{ position: 'absolute', left: 0, top: HEAD_H + s * SLOT_H - 6, width: TIME_W - 4 }}
              >
                {toHHMM(min)}
              </div>
            )}
            <div
              className="pt-line"
              style={{
                position: 'absolute',
                left: TIME_W,
                top: HEAD_H + s * SLOT_H,
                width: DAYS.length * DAY_W,
                borderTop: onHour ? '1px solid #D7DEEA' : '1px dashed #E9EEF5',
              }}
            />
          </div>
        );
      })}
      {DAYS.map((_, i) => (
        <div
          key={`col-${i}`}
          className="pt-col"
          style={{ position: 'absolute', left: TIME_W + i * DAY_W, top: HEAD_H, width: DAY_W, height: slotCount * SLOT_H }}
        />
      ))}
      {blocks.map((b) => {
        const dayIdx = DAYS.indexOf(b.slot.day);
        if (dayIdx < 0) return null;
        const top = HEAD_H + ((toMin(b.slot.start) - minStart) / SLOT_MIN) * SLOT_H;
        const h = ((toMin(b.slot.end) - toMin(b.slot.start)) / SLOT_MIN) * SLOT_H;
        const c = courseColor(b.type);
        return (
          <div
            key={b.key}
            className="pt-block"
            style={{
              position: 'absolute',
              left: TIME_W + dayIdx * DAY_W + 1,
              top: top + 1,
              width: DAY_W - 2,
              height: h - 2,
              background: c.fill,
              color: c.text,
            }}
          >
            <strong>{b.label}</strong>
            <div className="pt-time-range">{b.slot.start}~{b.slot.end}</div>
            {b.teacher && <div className="pt-teacher">{b.teacher} 쌤</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function PrintView({
  courses,
  atIdx,
  shifts,
  slotOverrides,
  includedIds,
  studentName,
  grade,
  month,
  today,
}: Props) {
  const rem = remainingCourses(courses, '공통', atIdx, shifts, includedIds);
  const endIdx = rem.length ? Math.min(59, Math.max(...rem.map((e) => e.endIdx))) : atIdx;

  // 현재 달 ~ 마지막 수업 달 중, 실제로 수업이 있는 달만 인쇄
  const months: number[] = [];
  for (let i = atIdx; i <= endIdx && i <= 59; i++) {
    const { blocks } = buildMonthlyTimetable(courses, '공통', i, shifts, slotOverrides, includedIds);
    if (blocks.length > 0) months.push(i);
  }

  const pages: number[][] = [];
  for (let i = 0; i < months.length; i += 2) pages.push(months.slice(i, i + 2));

  return (
    <div className="print-only">
      {/* 1페이지 — 로드맵 */}
      <section className="print-page print-roadmap-page" data-pngname="로드맵">
        <h1 className="print-title">로드맵</h1>
        <div className="print-sub">
          {studentName ? `${studentName} 학생 · ` : ''}
          {grade} {month}월 · 상담일 {today}
        </div>
        <div className="print-roadmap-wrap">
          <RemainingRoadmap
            courses={courses}
            atIdx={atIdx}
            shifts={shifts}
            onShiftChange={() => {}}
            onRemove={() => {}}
            includedIds={includedIds}
            showHeading={false}
          />
        </div>
      </section>

      {/* 2페이지~ — 월별 시간표 2개씩 */}
      {pages.map((pair, pi) => (
        <section
          className="print-page print-tt-page"
          key={`pg-${pi}`}
          data-pngname={pair.map((m) => `${gradeOfIndex(m)}_${monthOfIndex(m)}월`).join('+')}
        >
          {pair.map((mIdx) => (
            <div className="print-tt" key={`tt-${mIdx}`}>
              <div className="print-tt-title">
                {gradeOfIndex(mIdx)}_{monthOfIndex(mIdx)}월_시간표
              </div>
              <div className="print-tt-cal">
                <StaticTimetable
                  courses={courses}
                  monthIdx={mIdx}
                  shifts={shifts}
                  slotOverrides={slotOverrides}
                  includedIds={includedIds}
                />
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
