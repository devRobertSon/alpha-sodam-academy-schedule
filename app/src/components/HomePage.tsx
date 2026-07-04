interface Props {
  onNavigate: (view: 'consult' | 'assessment') => void;
}

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="app home">
      <header className="home-header">
        <div className="home-logo" aria-hidden>
          <svg viewBox="0 0 100 100" width="56" height="56">
            <defs>
              <linearGradient id="home-ag" x1="15" y1="80" x2="85" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#1C2B70" />
                <stop offset="0.55" stopColor="#2C6FC4" />
                <stop offset="1" stopColor="#57B2E6" />
              </linearGradient>
            </defs>
            <path
              d="M62 30c-14-6-32-1-38 13-6 15 3 30 18 32 11 1 20-6 24-16l6-26 -7 34c-1 8 3 12 9 11"
              fill="none"
              stroke="url(#home-ag)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1>소담 알파학원</h1>
        <p>원하는 작업을 선택하세요.</p>
      </header>

      <div className="home-cards">
        <button className="home-card" onClick={() => onNavigate('consult')}>
          <span className="home-card-emoji" aria-hidden>🗺️</span>
          <span className="home-card-title">입시 상담 로드맵</span>
          <span className="home-card-desc">학년·월 기준 남은 과목과 월별 시간표를 만들어 학부모님께 전달</span>
        </button>

        <button className="home-card" onClick={() => onNavigate('assessment')}>
          <span className="home-card-emoji" aria-hidden>📊</span>
          <span className="home-card-title">학생 개별 평가</span>
          <span className="home-card-desc">진단·주별 평가를 채점하고 유형별 리포트로 취약점 파악</span>
        </button>
      </div>
    </div>
  );
}
