// src/lib/brand.ts — 업로드된 로고를 자동으로 사용
// app/src/assets/brand/ 폴더에 logo.png / logo.svg / logo.jpg 등이 있으면
// 그 파일을 앱 로고로 씁니다. 파일이 없으면 null → 컴포넌트가 기본 SVG로 대체.
const found = import.meta.glob(
  '../assets/brand/logo.{png,jpg,jpeg,svg,webp,PNG,JPG,JPEG,SVG,WEBP}',
  { eager: true, query: '?url', import: 'default' }
);

export const logoUrl: string | null = (Object.values(found)[0] as string | undefined) ?? null;
