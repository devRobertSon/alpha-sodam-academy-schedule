import Logo from './Logo';

interface Props {
  onNavigate: (view: 'consult' | 'assessment' | 'manual') => void;
}

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="app home">
      <header className="home-header">
        <div className="home-logo">
          <Logo size={104} />
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

      <button className="home-manual" onClick={() => onNavigate('manual')}>
        📖 사용 설명서
      </button>
    </div>
  );
}
