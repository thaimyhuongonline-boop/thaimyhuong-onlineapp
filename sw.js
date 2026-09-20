/* ====================================================================
 * sw.js — SERVICE WORKER PWA TỰ ĐỘNG CẬP NHẬT (AUTO-UPDATE)
 * THÁI MỸ HƯƠNG — KiotViet ➡ MISA
 * ====================================================================
 * - Chống "app chết" (Anti-Stale Cache): Luôn ưu tiên nạp bản mới từ mạng
 * - Tự động cập nhật code mới khi mở app hoặc tải lại trang
 * - Bỏ qua cache hoàn toàn đối với dữ liệu đám mây Supabase
 * ==================================================================== */

const CACHE_VERSION = 'tmh-pwa-v1.0.2';
const CACHE_NAME = `thaimyhuong-${CACHE_VERSION}`;

// Danh sách tài nguyên cốt lõi tải trước khi cài đặt
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './trang_chu.html',
  './buoc1_dieu_xe_xuat_kho.html',
  './buoc2_quyet_toan_thu_tien.html',
  './buoc3_day_misa.html',
  './danh_muc.html',
  './theo_doi_cong_no.html',
  './quan_ly_taikhoan.html',
  './layout.css',
  './layout.js',
  './config.js',
  './pwa.js',
  './logo.png',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

// 1. CÀI ĐẶT: Kích hoạt ngay lập tức (skipWaiting)
self.addEventListener('install', (event) => {
  console.log(`🚀 [ServiceWorker] Đang cài đặt phiên bản mới: ${CACHE_VERSION}`);
  self.skipWaiting(); // Không chờ đóng tab, kích hoạt ngay

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tải trước tài nguyên cốt lõi, không để lỗi 1 file làm hỏng toàn bộ
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW Cache Warning] Bỏ qua nạp trước: ${url}`, err);
          })
        )
      );
    })
  );
});

// 2. KÍCH HOẠT: Chiếm quyền kiểm soát trang ngay (clients.claim) & xóa cache cũ
self.addEventListener('activate', (event) => {
  console.log(`✨ [ServiceWorker] Phiên bản ${CACHE_VERSION} đã kích hoạt thành công!`);

  event.waitUntil(
    Promise.all([
      // Chiếm quyền điều khiển tất cả các client đang mở
      self.clients.claim(),

      // Quét và xóa toàn bộ cache của các phiên bản cũ
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('thaimyhuong-')) {
              console.log(`🧹 [ServiceWorker] Đang xóa bộ nhớ đệm cũ: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => {
      // Thông báo cho tất cả các tab biết đã cập nhật bản mới
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

// 3. ĐÓN BẮT YÊU CẦU MẠNG (FETCH STRATEGY)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // A. BỎ QUA HOÀN TOÀN: Supabase API, REST, Auth, CDN ngoài cần real-time
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/auth/v1/') ||
    url.pathname.includes('/realtime/') ||
    req.method !== 'GET'
  ) {
    return; // Để trình duyệt thực hiện request mạng bình thường
  }

  // B. ĐỐI VỚI CÁC TRANG HTML VÀ ĐIỀU HƯỚNG: Network-First (Ưu tiên mạng)
  // Đảm bảo nhân viên mở app luôn thấy giao diện và code mới nhất
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
          // Khi mất kết nối internet thì mới lấy bản cache đã lưu
          return caches.match(req).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // C. ĐỐI VỚI CÁC FILE TĨNH (CSS, JS, Hình ảnh, Font): Stale-While-Revalidate
  // Nạp nhanh tức thì từ cache, đồng thời ngầm tải bản mới từ mạng để cập nhật
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

// 4. LẮNG NGHE TIN NHẮN TỪ TRANG CLIENT
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});
