import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: '여객선 안전정보 QR 서비스 | KOMSA',
  description: '출항 전 안전점검표, 실시간 운항예보 등 여객선 안전 정보를 한눈에 확인하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <main style={{ maxWidth: '500px', margin: '0 auto', minHeight: '100vh', background: 'transparent', position: 'relative' }}>
          {children}
        </main>
        
        {/* 숨김 처리된 Google Translate 기본 요소 */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'ko',
                autoDisplay: false,
                includedLanguages: 'ko,en,zh-CN,ja,vi,ru' // 한국어, 영어, 중국어(간체), 일본어, 베트남어, 러시아어
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
