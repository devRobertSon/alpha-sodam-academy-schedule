import { useEffect, useRef, useState } from 'react';
import {
  COLORS,
  Course,
  GRADES,
  gradeOfIndex,
  monthOfIndex,
  monthToSeason,
} from '../data/roadmap';
import { remainingCourses } from '../lib/logic';

const COL_W = 26;
const LABEL_W = 132;
const GRADE_H = 24;
const MONTH_H = 20;
const HEADER_H = GRADE_H + MONTH_H;
const BAR_H = 22;
const ROW_H = 28;
const PAD = 10;

const SEASON_TINT: Record<string, string> = {
  봄: '#EEF4EC',
  여름: '#FBF1E9',
  가을: '#F4F0E7',
  겨울: '#ECF0F6',
};

interface Props {
  courses: Course[];
  atIdx: number;
  shifts: Record<string, number>;
  onShiftChange: (courseId: string, shift: number) => void;
  includedIds: Set<string>;
}

interface DragState {
  id: string;
  startX: number;
  origShift: number;
  baseStart: number;
  baseEnd: number;
}

export default function RemainingRoadmap({
  courses,
  atIdx,
  shifts,
  onShiftChange,
  includedIds,
}: Props) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const axisStart = Math.min(atIdx, 59);
  const axisEnd = 59;
  const cols = Math.max(1, axisEnd - axisStart + 1);
  const plotW = cols * COL_W;
  const chartW = LABEL_W + plotW;
  const xOf = (idx: number) => LABEL_W + (idx - axisStart) * COL_W;

  const rem = remainingCourses(courses, '공통', atIdx, shifts, includedIds);

  const levelEnds: number[] = [];
  const placed = rem.map((e) => {
    let lvl = levelEnds.findIndex((end) => end < e.startIdx);
    if (lvl === -1) {
      lvl = levelEnds.length;
      levelEnds.push(e.endIdx);
    } else {
      levelEnds[lvl] = e.endIdx;
    }
    return { ...e, level: lvl };
  });
  const courseLevels = Math.max(1, levelEnds.length);

  const courseTop = HEADER_H + PAD;
  const chartH = courseTop + courseLevels * ROW_H + PAD;

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const deltaCols = Math.round((e.clientX - d.startX) / COL_W);
      let newShift = d.origShift + deltaCols;
      const minShift = atIdx - d.baseStart;
      const maxShift = 59 - d.baseEnd;
      if (newShift < minShift) newShift = minShift;
      if (newShift > maxShift) newShift = maxShift;
      onShiftChange(d.id, newShift);
    };
    const onUp = () => setDrag(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, atIdx, onShiftChange]);

  if (atIdx >= 59) {
    return <p className="muted">중3 2월 이후로는 남은 과정이 없습니다.</p>;
  }

  return (
    <svg
      className="roadmap-svg"
      width={chartW}
      height={chartH}
      viewBox={`0 0 ${chartW} ${chartH}`}
      role="img"
      aria-label="남은 과정 로드맵"
    >
      <text x={8} y={16} fontSize={13} fontWeight={700} fill="#2C2C2A">
        남은 과정
      </text>

      {Array.from({ length: cols }).map((_, k) => {
        const idx = axisStart + k;
        const season = monthToSeason(monthOfIndex(idx));
        return (
          <rect key={`tint-${k}`} x={xOf(idx)} y={HEADER_H} width={COL_W} height={chartH - HEADER_H} fill={SEASON_TINT[season]} opacity={0.5} />
        );
      })}

      {GRADES.map((g, gi) => {
        const gStart = Math.max(axisStart, gi * 12);
        const gEnd = Math.min(axisEnd + 1, gi * 12 + 12);
        if (gEnd <= gStart) return null;
        const x = xOf(gStart);
        const w = (gEnd - gStart) * COL_W;
        return (
          <g key={`grade-${g}`}>
            <rect x={x} y={0} width={w} height={GRADE_H} fill="#F6F5F0" stroke="#C9C7BD" strokeWidth={0.5} />
            <text x={x + w / 2} y={GRADE_H / 2 + 4} fontSize={12} fontWeight={600} fill="#2C2C2A" textAnchor="middle">
              {g}
            </text>
          </g>
        );
      })}

      {Array.from({ length: cols }).map((_, k) => {
        const idx = axisStart + k;
        const season = monthToSeason(monthOfIndex(idx));
        return (
          <g key={`m-${k}`}>
            <rect x={xOf(idx)} y={GRADE_H} width={COL_W} height={MONTH_H} fill={SEASON_TINT[season]} />
            <text x={xOf(idx) + COL_W / 2} y={GRADE_H + MONTH_H / 2 + 3} fontSize={8} fill="#6B6A64" textAnchor="middle">
              {monthOfIndex(idx)}
            </text>
          </g>
        );
      })}

      {placed.map((e) => {
        const x = xOf(e.startIdx);
        const w = (e.endIdx - e.startIdx + 1) * COL_W;
        const y = courseTop + e.level * ROW_H;
        const c = COLORS[e.course.subject] ?? { fill: '#D3D1C7', text: '#2C2C2A' };
        const isDragging = drag?.id === e.course.id;
        return (
          <g
            key={e.course.id}
            style={{ cursor: 'grab' }}
            onPointerDown={(ev) => {
              ev.preventDefault();
              setDrag({
                id: e.course.id,
                startX: ev.clientX,
                origShift: e.shift,
                baseStart: e.startIdx - e.shift,
                baseEnd: e.endIdx - e.shift,
              });
            }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={BAR_H}
              rx={5}
              fill={c.fill}
              stroke={isDragging ? '#D6443B' : e.status === '진행중' ? '#2C2C2A' : 'rgba(0,0,0,0.12)'}
              strokeWidth={isDragging ? 2.5 : e.status === '진행중' ? 1.5 : 0.8}
            />
            {w >= 30 && (
              <text x={x + w / 2} y={y + BAR_H / 2 - 1} fontSize={9.5} fill={c.text} textAnchor="middle" fontWeight={600}>
                {e.course.name}
              </text>
            )}
            {w >= 56 && e.course.teacher && (
              <text x={x + w / 2} y={y + BAR_H / 2 + 9} fontSize={8} fill={c.text} textAnchor="middle" opacity={0.8}>
                {e.course.teacher}
              </text>
            )}
          </g>
        );
      })}

      <line x1={xOf(atIdx)} y1={HEADER_H} x2={xOf(atIdx)} y2={chartH} stroke="#D6443B" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={xOf(atIdx) + 4} y={HEADER_H + 12} fontSize={9} fontWeight={700} fill="#D6443B">
        오늘 {gradeOfIndex(atIdx)} {monthOfIndex(atIdx)}월
      </text>
    </svg>
  );
}
