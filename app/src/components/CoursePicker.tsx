import { useState } from 'react';
import { COLORS, Course, Track, TRACKS } from '../data/roadmap';

interface Props {
  courses: Course[];
  includedIds: Set<string>;
  onToggle: (courseId: string) => void;
  onAddAll: (ids: string[]) => void;
  onRemoveAll: (ids: string[]) => void;
}

export default function CoursePicker({ courses, includedIds, onToggle, onAddAll, onRemoveAll }: Props) {
  const [filterTrack, setFilterTrack] = useState<Track | '공통' | '전체'>('전체');
  const [collapsed, setCollapsed] = useState(false);

  const trackOptions: (Track | '공통')[] = [...TRACKS, '공통'];
  const filtered = filterTrack === '전체' ? courses : courses.filter((c) => c.track === filterTrack);

  const groupedByTrack = new Map<string, Course[]>();
  for (const c of filtered) {
    const key = c.track;
    if (!groupedByTrack.has(key)) groupedByTrack.set(key, []);
    groupedByTrack.get(key)!.push(c);
  }

  const allFilteredIds = filtered.map((c) => c.id);
  const allIncluded = allFilteredIds.every((id) => includedIds.has(id));

  return (
    <div className="course-picker">
      <div className="picker-header">
        <button className="picker-collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▶' : '▼'} ���목 선택
        </button>
        <span className="picker-count">{includedIds.size}개 선택됨</span>
      </div>

      {!collapsed && (
        <>
          <div className="picker-filter">
            <button
              className={`picker-tag ${filterTrack === '전체' ? 'active' : ''}`}
              onClick={() => setFilterTrack('전체')}
            >
              전체
            </button>
            {trackOptions.map((t) => (
              <button
                key={t}
                className={`picker-tag ${filterTrack === t ? 'active' : ''}`}
                onClick={() => setFilterTrack(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="picker-actions">
            {allIncluded ? (
              <button className="mini" onClick={() => onRemoveAll(allFilteredIds)}>전체 해제</button>
            ) : (
              <button className="mini" onClick={() => onAddAll(allFilteredIds)}>전체 선택</button>
            )}
          </div>

          <div className="picker-list">
            {[...groupedByTrack.entries()].map(([trackName, trackCourses]) => (
              <div key={trackName} className="picker-group">
                <div className="picker-group-title">{trackName}</div>
                {trackCourses.map((c) => {
                  const included = includedIds.has(c.id);
                  const color = COLORS[c.subject];
                  return (
                    <label
                      key={c.id}
                      className={`picker-item ${included ? 'included' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('courseId', c.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => onToggle(c.id)}
                      />
                      <span className="picker-swatch" style={{ background: color.fill }} />
                      <span className="picker-name">{c.name}</span>
                      <span className="picker-subject">{c.subject}</span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
