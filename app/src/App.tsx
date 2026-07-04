import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import ConsultApp from './components/ConsultApp';
import AssessmentApp from './components/AssessmentApp';

type View = 'home' | 'consult' | 'assessment';

function viewFromHash(): View {
  const h = window.location.hash.replace(/^#\/?/, '').trim();
  if (h === 'consult') return 'consult';
  if (h === 'assessment') return 'assessment';
  return 'home';
}

export default function App() {
  const [view, setView] = useState<View>(() => viewFromHash());

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (v: View) => {
    window.location.hash = v === 'home' ? '' : `/${v}`;
    setView(v);
  };

  if (view === 'consult') return <ConsultApp onHome={() => go('home')} />;
  if (view === 'assessment') return <AssessmentApp onHome={() => go('home')} />;
  return <HomePage onNavigate={go} />;
}
