import { useState } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export default function ExportBar() {
  const [busy, setBusy] = useState(false);

  const handlePrint = () => window.print();

  // 인쇄와 동일한 페이지 구성을 페이지별 PNG로 만들어 ZIP 한 개로 저장
  const handleZip = async () => {
    const container = document.querySelector<HTMLElement>('.print-only');
    if (!container) return;
    setBusy(true);
    container.classList.add('exporting');
    try {
      const pages = Array.from(container.querySelectorAll<HTMLElement>('.print-page'));
      if (pages.length === 0) {
        alert('저장할 페이지가 없습니다. 상담 정보를 입력해 주세요.');
        return;
      }
      const zip = new JSZip();
      for (let i = 0; i < pages.length; i++) {
        const el = pages[i];
        const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
        const base64 = dataUrl.split(',')[1];
        const label = el.getAttribute('data-pngname') || `page-${i + 1}`;
        const name = `${String(i + 1).padStart(2, '0')}_${label}.png`;
        zip.file(name, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.download = `알파학원_로드맵_시간표_${stamp}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('이미지 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      container.classList.remove('exporting');
      setBusy(false);
    }
  };

  return (
    <div className="export-bar no-print">
      <span className="export-title">최종본 내보내기</span>
      <button onClick={handlePrint}>🖨 인쇄 / PDF</button>
      <button onClick={handleZip} disabled={busy}>
        {busy ? '저장 중…' : '🖼 이미지(PNG·ZIP) 저장'}
      </button>
    </div>
  );
}
