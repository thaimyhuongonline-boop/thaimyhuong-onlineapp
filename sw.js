/* ====================================================================
 * sw.js â€” SERVICE WORKER PWA Tá»° Äá»˜NG Cáº¬P NHáº¬T (AUTO-UPDATE)
 * THÃI Má»¸ HÆ¯Æ NG â€” KiotViet âž¡ MISA
 * ====================================================================
 * - Chá»‘ng "app cháº¿t" (Anti-Stale Cache): LuÃ´n Æ°u tiÃªn náº¡p báº£n má»›i tá»« máº¡ng
 * - Tá»± Ä‘á»™ng cáº­p nháº­t code má»›i khi má»Ÿ app hoáº·c táº£i láº¡i trang
 * - Bá» qua cache hoÃ n toÃ n Ä‘á»‘i vá»›i dá»¯ liá»‡u Ä‘Ã¡m mÃ¢y Supabase
 * ==================================================================== */

const CACHE_VERSION = 'tmh-pwa-v1.0.57';
const CACHE_NAME = `thaimyhuong-${CACHE_VERSION}`;

// Danh sÃ¡ch tÃ i nguyÃªn cá»‘t lÃµi táº£i trÆ°á»›c khi cÃ i Ä‘áº·t
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './trang_chu.html',
  './buoc1_dieu_xe_xuat_kho.html',
  './buoc2_quyet_toan_thu_tien.html',
  './buoc3_day_misa.html',
  './danh_muc.html',
  './theo_doi_cong_no.html',
  './bao_cao_tong_hop.html',
  './quan_ly_taikhoan.html',
  './layout.css',
  './layout.js',
  './config.js',
  './phan_quyen.js',
  './pwa.js',
  './searchable-select.js',
  './khach_tra_truoc.js',
  './han_muc_cong_no.js',
  './phieu_thu_misa.js',
  './misa_ban_hang.js',
  './danh_muc_dieu_xe.js',
  './logo.png',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

// 1. CÃ€I Äáº¶T: KÃ­ch hoáº¡t ngay láº­p tá»©c (skipWaiting)
self.addEventListener('install', (event) => {
  console.log(`ðŸš€ [ServiceWorker] Äang cÃ i Ä‘áº·t phiÃªn báº£n má»›i: ${CACHE_VERSION}`);
  self.skipWaiting(); // KhÃ´ng chá» Ä‘Ã³ng tab, kÃ­ch hoáº¡t ngay

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Táº£i trÆ°á»›c tÃ i nguyÃªn cá»‘t lÃµi, khÃ´ng Ä‘á»ƒ lá»—i 1 file lÃ m há»ng toÃ n bá»™
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW Cache Warning] Bá» qua náº¡p trÆ°á»›c: ${url}`, err);
          })
        )
      );
    })
  );
});

// 2. KÃCH HOáº T: Chiáº¿m quyá»n kiá»ƒm soÃ¡t trang ngay (clients.claim) & xÃ³a cache cÅ©
self.addEventListener('activate', (event) => {
  console.log(`âœ¨ [ServiceWorker] PhiÃªn báº£n ${CACHE_VERSION} Ä‘Ã£ kÃ­ch hoáº¡t thÃ nh cÃ´ng!`);

  event.waitUntil(
    Promise.all([
      // Chiáº¿m quyá»n Ä‘iá»u khiá»ƒn táº¥t cáº£ cÃ¡c client Ä‘ang má»Ÿ
      self.clients.claim(),

      // QuÃ©t vÃ  xÃ³a toÃ n bá»™ cache cá»§a cÃ¡c phiÃªn báº£n cÅ©
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('thaimyhuong-')) {
              console.log(`ðŸ§¹ [ServiceWorker] Äang xÃ³a bá»™ nhá»› Ä‘á»‡m cÅ©: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      // ThÃ´ng bÃ¡o cho táº¥t cáº£ cÃ¡c tab biáº¿t Ä‘Ã£ cáº­p nháº­t báº£n má»›i
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'TMH_SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// 3. ÄÃ“N Báº®T YÃŠU Cáº¦U Máº NG (FETCH STRATEGY)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // A. Bá»Ž QUA HOÃ€N TOÃ€N: Supabase API, REST, Auth, CDN ngoÃ i cáº§n real-time
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/auth/v1/') ||
    url.pathname.includes('/realtime/') ||
    req.method !== 'GET'
  ) {
    return; // Äá»ƒ trÃ¬nh duyá»‡t thá»±c hiá»‡n request máº¡ng bÃ¬nh thÆ°á»ng
  }

  // B. Äá»I Vá»šI CÃC TRANG HTML VÃ€ ÄIá»€U HÆ¯á»šNG: Network-First (Æ¯u tiÃªn máº¡ng)
  // Äáº£m báº£o nhÃ¢n viÃªn má»Ÿ app luÃ´n tháº¥y giao diá»‡n vÃ  code má»›i nháº¥t
  const isHtmlRequest =
    req.mode === 'navigate' ||
    (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) ||
    url.pathname.endsWith('.html');

  if (isHtmlRequest) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Khi máº¥t káº¿t ná»‘i internet thÃ¬ má»›i láº¥y báº£n cache Ä‘Ã£ lÆ°u
          return caches.match(req).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // C. Äá»I Vá»šI CÃC FILE TÄ¨NH (CSS, JS, HÃ¬nh áº£nh, Font): Stale-While-Revalidate
  // Náº¡p nhanh tá»©c thÃ¬ tá»« cache, Ä‘á»“ng thá»i ngáº§m táº£i báº£n má»›i tá»« máº¡ng Ä‘á»ƒ cáº­p nháº­t
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy);
            });
          }
          return networkResponse;
        })
        .catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Láº®NG NGHE TIN NHáº®N Tá»ª TRANG CLIENT
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
