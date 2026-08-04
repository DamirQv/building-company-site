import Script from "next/script";

/**
 * Аналитика: Google Tag Manager, Meta Pixel, Google Analytics 4, Яндекс.Метрика.
 * Скрипты подключаются только если заданы соответствующие env-переменные.
 *
 * Переменные окружения (.env.local):
 *   NEXT_PUBLIC_GTM_ID        — GTM-XXXXXXX
 *   NEXT_PUBLIC_META_PIXEL_ID — цифровой ID пикселя Meta
 *   NEXT_PUBLIC_GA4_ID        — G-XXXXXXXXXX
 *   NEXT_PUBLIC_YM_ID         — номер счётчика Яндекс.Метрики
 */

export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const ymId = process.env.NEXT_PUBLIC_YM_ID;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script id="gtm-base" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');`}
        </Script>
      )}

      {/* Google Analytics 4 */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-base" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}

      {/* Яндекс.Метрика */}
      {ymId && (
        <Script id="ym-base" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${ymId}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true
          });`}
        </Script>
      )}
    </>
  );
}