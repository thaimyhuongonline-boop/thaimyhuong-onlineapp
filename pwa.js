/* ====================================================================
 * pwa.js — QUẢN LÝ CÀI ĐẶT PWA & TỰ ĐỘNG CẬP NHẬT (AUTO-UPDATE)
 * THÁI MỸ HƯƠNG — KiotViet ➡ MISA
 * ==================================================================== */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  let swRegistration = null;
  let daThongBaoCapNhat = false;

  // 1. ĐĂNG KÝ SERVICE WORKER VỚI CHẾ ĐỘ AUTO-UPDATE
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then((reg) => {
          swRegistration = reg;
          console.log('✅ [PWA] Service Worker đã đăng ký thành công');

          // Kiểm tra bản cập nhật mới ngay khi mở trang
          reg.update().catch(() => {});

          // Lắng nghe khi tìm thấy Service Worker mới
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 [PWA] Phát hiện phiên bản mới! Đang tự động nạp...');
                // Kích hoạt ngay lập tức
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] Đăng ký Service Worker thất bại:', err);
        });

      // Lắng nghe sự kiện Service Worker mới chiếm quyền điều khiển (Controller change)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('✨ [PWA] Service Worker mới đã kiểm soát trang. Tải lại nhẹ để áp dụng...');
        hienThiThongBaoCapNhatMoi();
      });

      // Lắng nghe tin nhắn từ Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'TMH_SW_UPDATED') {
          console.log(`🎉 [PWA] Ứng dụng đã cập nhật phiên bản: ${event.data.version}`);
          hienThiThongBaoCapNhatMoi();
        }
      });
    });

    // 2. TỰ ĐỘNG KIỂM TRA BẢN MỚI MỖI KHI NHÂN VIÊN MỞ LẠI APP / CHUYỂN TAB
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && swRegistration) {
        swRegistration.update().catch(() => {});
      }
    });

    window.addEventListener('focus', () => {
      if (swRegistration) {
        swRegistration.update().catch(() => {});
      }
    });

    // Định kỳ kiểm tra bản mới mỗi 15 phút khi app đang mở
    setInterval(() => {
      if (swRegistration) {
        swRegistration.update().catch(() => {});
      }
    }, 15 * 60 * 1000);
  }

  // 3. BẮT SỰ KIỆN CÀI ĐẶT APP (ANDROID / CHROME / EDGE)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Ngăn chặn trình duyệt hiển thị thanh cài đặt mặc định để dùng nút riêng
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('📱 [PWA] Sẵn sàng cài đặt ứng dụng vào thiết bị');
    capNhatGiaoDienNutCaiDat(true);
  });

  // Khi app đã được cài đặt xong
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    console.log('🎉 [PWA] Đã cài đặt ứng dụng Thái Mỹ Hương thành công!');
    capNhatGiaoDienNutCaiDat(false);
    hienThiToastPWA('🎉 Chúc mừng! Ứng dụng Thái Mỹ Hương đã được cài đặt vào điện thoại/máy tính của bạn.');
  });

  // 4. HÀM MỞ HỘP THOẠI HOẶC HƯỚNG DẪN CÀI ĐẶT
  window.moModalCaiDatApp = async function () {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      hienThiToastPWA('✅ Bạn đang sử dụng App Thái Mỹ Hương (đã cài đặt). Hệ thống luôn tự động cập nhật bản mới nhất!');
      kiemTraCapNhatThuCong();
      return;
    }

    // Nếu trình duyệt có sẵn prompt cài đặt native (Android, Chrome, Edge)
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`[PWA] Người dùng chọn: ${outcome}`);
      if (outcome === 'accepted') {
        deferredInstallPrompt = null;
      }
      return;
    }

    // Nếu dùng iPhone / iPad (iOS Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      hienThiModalHuongDanIOS();
      return;
    }

    // Hướng dẫn mặc định cho Desktop hoặc trình duyệt khác
    hienThiModalHuongDanChung();
  };

  // 5. KIỂM TRA BẢN CẬP NHẬT THỦ CÔNG
  window.kiemTraCapNhatThuCong = async function () {
    if (!swRegistration) {
      hienThiToastPWA('ℹ️ Ứng dụng đang nạp trực tiếp phiên bản mới nhất từ hệ thống.');
      return;
    }

    hienThiToastPWA('🔍 Đang kiểm tra bản cập nhật từ máy chủ...');
    try {
      await swRegistration.update();
      setTimeout(() => {
        if (!daThongBaoCapNhat) {
          hienThiToastPWA('✅ Bạn đang dùng phiên bản mới nhất của Thái Mỹ Hương!');
        }
      }, 1200);
    } catch (e) {
      hienThiToastPWA('✅ Hệ thống hoạt động bình thường, mã nguồn đã đồng bộ.');
    }
  };

  // Cập nhật trạng thái các nút "Cài đặt" trên giao diện
  function capNhatGiaoDienNutCaiDat(coTheCai) {
    document.querySelectorAll('.btn-pwa-install').forEach((btn) => {
      btn.style.display = 'inline-flex';
      if (coTheCai) {
        btn.classList.add('pulse-highlight');
      }
    });
  }

  // Thông báo khi có bản cập nhật mới
  function hienThiThongBaoCapNhatMoi() {
    if (daThongBaoCapNhat) return;
    daThongBaoCapNhat = true;

    let banner = document.getElementById('tmhPwaUpdateBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'tmhPwaUpdateBanner';
      banner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
        color: #ffffff;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        z-index: 9999999;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13.5px;
        font-weight: 600;
        animation: tmhSlideUp 0.35s ease;
      `;
      banner.innerHTML = `
        <span>✨ Đã có bản cập nhật mới!</span>
        <button type="button" onclick="window.location.reload()" style="background:#ffffff; color:#15803d; border:none; padding:6px 14px; border-radius:6px; font-weight:700; cursor:pointer; font-size:12.5px; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          Áp dụng ngay 🚀
        </button>
      `;
      document.body.appendChild(banner);
    }
  }

  // Modal hướng dẫn cài đặt trên iOS Safari
  function hienThiModalHuongDanIOS() {
    let m = document.getElementById('tmhModalPwaIOS');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tmhModalPwaIOS';
      m.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,0.65);
        backdrop-filter: blur(4px);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      `;
      m.innerHTML = `
        <div style="background:#ffffff; width:100%; max-width:380px; border-radius:18px; padding:22px; box-shadow:0 20px 40px rgba(0,0,0,0.25); text-align:center; font-family:'Plus Jakarta Sans', sans-serif;">
          <img src="icons/icon-192.png" alt="Icon Thái Mỹ Hương" style="width:72px; height:72px; border-radius:16px; box-shadow:0 4px 12px rgba(22,163,74,0.3); margin-bottom:12px;">
          <h3 style="font-size:17px; font-weight:800; color:#0f172a; margin-bottom:6px;">Cài đặt Thái Mỹ Hương</h3>
          <p style="font-size:12.5px; color:#64748b; margin-bottom:18px;">Để mở app toàn màn hình và nhận thông báo tự động trên iPhone/iPad:</p>
          
          <div style="text-align:left; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; margin-bottom:18px; display:flex; flex-direction:column; gap:10px; font-size:13px; color:#1e293b;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:#16a34a; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; flex-shrink:0;">1</span>
              <span>Chạm vào nút <b>Chia sẻ</b> <em>(biểu tượng <b>⎋</b> ở thanh Safari)</em></span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:#16a34a; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; flex-shrink:0;">2</span>
              <span>Cuộn xuống và chọn <b>"Thêm vào MH chính"</b> (Add to Home Screen)</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="background:#16a34a; color:#fff; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; flex-shrink:0;">3</span>
              <span>Bấm <b>"Thêm"</b> ở góc trên bên phải để hoàn tất 🎉</span>
            </div>
          </div>

          <button type="button" onclick="document.getElementById('tmhModalPwaIOS').style.display='none'" style="width:100%; background:#16a34a; color:#fff; border:none; padding:10px; border-radius:10px; font-weight:700; cursor:pointer; font-size:13.5px;">
            Đã hiểu
          </button>
        </div>
      `;
      document.body.appendChild(m);
    }
    m.style.display = 'flex';
  }

  // Modal hướng dẫn chung cho máy tính/trình duyệt
  function hienThiModalHuongDanChung() {
    let m = document.getElementById('tmhModalPwaChung');
    if (!m) {
      m = document.createElement('div');
      m.id = 'tmhModalPwaChung';
      m.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,0.65);
        backdrop-filter: blur(4px);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      `;
      m.innerHTML = `
        <div style="background:#ffffff; width:100%; max-width:400px; border-radius:18px; padding:22px; box-shadow:0 20px 40px rgba(0,0,0,0.25); text-align:center; font-family:'Plus Jakarta Sans', sans-serif;">
          <img src="icons/icon-192.png" alt="Icon Thái Mỹ Hương" style="width:68px; height:68px; border-radius:16px; box-shadow:0 4px 12px rgba(22,163,74,0.3); margin-bottom:12px;">
          <h3 style="font-size:17px; font-weight:800; color:#0f172a; margin-bottom:6px;">Cài đặt Ứng dụng Thái Mỹ Hương</h3>
          <p style="font-size:12.5px; color:#64748b; margin-bottom:16px;">Cài đặt để mở ứng dụng toàn màn hình, tải nhanh hơn và tự động cập nhật code mới:</p>
          
          <div style="text-align:left; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; margin-bottom:18px; font-size:13px; color:#1e293b; line-height:1.5;">
            • <b>Trên Google Chrome / Edge:</b> Bấm vào biểu tượng <b>Cài đặt (biểu tượng máy tính / dấu cộng)</b> trên thanh địa chỉ URL của trình duyệt.<br><br>
            • <b>Trên Điện thoại:</b> Bấm menu <b>(⋮)</b> của trình duyệt ➡ Chọn <b>"Cài đặt ứng dụng"</b> hoặc <b>"Thêm vào Màn hình chính"</b>.
          </div>

          <div style="display:flex; gap:8px;">
            <button type="button" onclick="kiemTraCapNhatThuCong()" style="flex:1; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; padding:9px; border-radius:10px; font-weight:600; cursor:pointer; font-size:12.5px;">
              🔄 Kiểm tra bản mới
            </button>
            <button type="button" onclick="document.getElementById('tmhModalPwaChung').style.display='none'" style="flex:1; background:#16a34a; color:#fff; border:none; padding:9px; border-radius:10px; font-weight:700; cursor:pointer; font-size:12.5px;">
              Đóng
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(m);
    }
    m.style.display = 'flex';
  }

  function hienThiToastPWA(msg) {
    let t = document.getElementById('tmhPwaToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'tmhPwaToast';
      t.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        padding: 10px 18px;
        border-radius: 10px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        z-index: 99999999;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(t);
    }
    t.innerHTML = msg;
    t.style.opacity = '1';
    t.style.display = 'block';
    clearTimeout(t.timer);
    t.timer = setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => { t.style.display = 'none'; }, 300);
    }, 4000);
  }
})();
