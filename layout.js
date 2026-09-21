/* ====================================================================
 * layout.js — HÀM TẠO LAYOUT THỐNG NHẤT (SIDEBAR + TOPBAR + AUTH)
 * Dành cho tất cả các trang nội bộ của app THÁI MỸ HƯƠNG
 * ==================================================================== */

// Danh sách 3 bước quy trình tinh gọn chuyển dữ liệu từ KiotViet sang Quyết Toán & MISA
const DANH_SACH_7_BUOC = [
  { id: "buoc1", mod: "dieuxe", href: "buoc1_dieu_xe_xuat_kho.html", ic: "📊", label: "1. Điều Xe & Phiếu Xuất Kho", desc: "Nạp Excel KiotViet, ghép bổ sung, chia xe & tạo PXK, DSTT" },
  { id: "buoc2", mod: "quyettoan", href: "buoc2_quyet_toan_thu_tien.html", ic: "💵", label: "2. Quyết Toán Thu Tiền", desc: "Xe về tính tiền: Tiền mặt, CK ngân hàng, hàng trả về & bảng đếm tiền nộp" },
  { id: "buoc3", mod: "misa", href: "buoc3_day_misa.html", ic: "📤", label: "3. Đẩy Dữ Liệu Lên MISA", desc: "Tự động hạch toán nợ/có, kiểm tra & xuất Excel chuẩn MISA" }
];

// Danh sách Menu chính trên Sidebar
const MENU_CHINH = [
  { id: "tongquan", href: "trang_chu.html", ic: "🧭", label: "Tổng quan Quy trình", desc: "Trung tâm điều phối quy trình 3 bước KiotViet ➡ MISA", roles: ["admin", "quanly", "nhanvien"] },
  { id: "quytrinh", href: "buoc1_dieu_xe_xuat_kho.html", ic: "🔄", label: "Quy trình Bán hàng (3 Bước)", isProcess: true, desc: "Quy trình tinh gọn: Điều xe ➡ Thu tiền ➡ MISA", roles: ["admin", "quanly", "nhanvien"] },
  { id: "baocao", href: "bao_cao_tong_hop.html", ic: "📊", label: "Báo Cáo Tổng Hợp", desc: "Tổng kết xuất kho, tiền mặt, chuyển khoản, hàng trả về, công nợ — xem chi tiết để đối soát", roles: ["admin", "quanly"] },
  { id: "congno", href: "theo_doi_cong_no.html", ic: "📒", label: "Theo Dõi Công Nợ", desc: "Sổ theo dõi và quản lý công nợ khách hàng", roles: ["admin", "quanly", "nhanvien"] },
  { id: "danhmuc", href: "danh_muc.html", ic: "📚", label: "Danh Mục", desc: "Hàng hoá, Khách hàng, Xe, Ngân hàng, Nhân sự...", roles: ["admin", "quanly", "nhanvien"] },
  { id: "taikhoan", href: "quan_ly_taikhoan.html", ic: "🛡️", label: "Tài khoản & Phân quyền", desc: "Quản lý nhân viên & ma trận phân quyền", roles: ["admin"] }
];

/**
 * Khởi tạo Layout thống nhất cho toàn bộ trang
 * @param {Object} options - { pageTitle, breadcrumb, activeMenuId, contentElementId }
 */
async function khoiTaoLayout(options = {}) {
  // 1. Hiển thị màn hình chờ tải
  let overlay = document.getElementById("tmhPageLoading");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "tmhPageLoading";
    overlay.innerHTML = `
      <div class="tmh-spinner"></div>
      <div style="font-weight: 700; color: #236446; font-size: 14px;">Đang tải Thái Mỹ Hương…</div>
    `;
    document.body.prepend(overlay);
  }

  // 2. Kiểm tra đăng nhập và lấy hồ sơ
  const nd = await baoVeTrang();
  if (!nd) return null; // Chưa đăng nhập -> baoVeTrang() đã chuyển hướng về index.html

  // 2b. Làm mới ma trận quyền mới nhất từ Supabase rồi kiểm tra quyền truy cập trang
  await lamMoiMaTranQuyen(nd.chuc_vu);
  const moduleTrang = layModuleCuaTrang();
  const quyenTrang = moduleTrang ? layQuyenModule(moduleTrang) : "all";
  if (quyenTrang === "none") {
    return chanTruyCapTrang(overlay);
  }
  if (quyenTrang === "view") {
    window.TMH_CHE_DO_XEM = true;
  }

  const tenNguoiDung = nd.ho_ten || "Quý nhân viên";
  const vaiTro = nd.vai_tro || "nhanvien";
  const capDo = nd.cap_tai_khoan || (vaiTro === "admin" ? 1 : 3);
  const tenCap = nd.ten_cap || (capDo === 1 ? "Toàn quyền" : (capDo === 2 ? "Cấp Quản lý" : "Nhân sự"));
  const tenVaiTro = tenCap;
  const chucVu = nd.chuc_vu || "Nhân sự";
  const userInitials = tenNguoiDung.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(-2).join("").toUpperCase() || "TMH";
  const tenNguoiDungH = escapeHtml(tenNguoiDung);
  const chucVuH = escapeHtml(chucVu);
  const tenCapH = escapeHtml(tenCap);
  const userInitialsH = escapeHtml(userInitials);

  // Đọc phân quyền ma trận của người dùng hiện tại
  let userPq = {};
  try {
    const rawPq = localStorage.getItem("userPermissions");
    if (rawPq) userPq = JSON.parse(rawPq);
  } catch (e) {}

  // 3. Chuẩn bị ngày hiện tại
  const now = new Date();
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const ngayHienTaiStr = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // 4. Xác định trang quy trình và menu active
  const currentPath = window.location.pathname.split("/").pop() || "buoc2_phieu_xuat_kho.html";
  const isProcessPage = DANH_SACH_7_BUOC.some(b => b.href === currentPath) || options.activeMenuId === "quytrinh" || (options.activeMenuId && options.activeMenuId.startsWith("buoc"));

  // 5. Render Sidebar (Gom 7 bước thành 1 tab)
  const sidebarHtml = `
    <aside class="tmh-sidebar" id="tmhSidebar">
      <!-- Header Sidebar -->
      <div class="tmh-sidebar-header">
        <a href="trang_chu.html" class="tmh-brand-wrap">
          <div class="tmh-brand-logo">
            <img src="logo.png" alt="Logo Thái Mỹ Hương">
          </div>
          <div class="tmh-brand-text">
            <div class="tmh-brand-title">THÁI MỸ HƯƠNG</div>
            <div class="tmh-brand-sub">KiotViet ➡ MISA</div>
          </div>
        </a>
        <button type="button" class="tmh-btn-collapse" id="tmhBtnCollapse" title="Thu gọn / Mở rộng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </button>
      </div>

      <!-- Danh sách Menu -->
      <div class="tmh-sidebar-menu">
        <div class="tmh-menu-cat">Chức năng hệ thống</div>
        ${MENU_CHINH.map(m => {
          // Lọc menu theo ma trận phân quyền (cấp 1 luôn thấy tất cả)
          const modMenu = m.isProcess ? null : m.id;
          if (m.isProcess) {
            if (!DANH_SACH_7_BUOC.some(b => layQuyenModule(b.mod) !== "none")) return "";
          } else if (layQuyenModule(modMenu) === "none") {
            return "";
          }
          const hrefMenu = m.isProcess
            ? (DANH_SACH_7_BUOC.find(b => layQuyenModule(b.mod) !== "none") || DANH_SACH_7_BUOC[0]).href
            : m.href;


          const isActive = m.isProcess ? isProcessPage : (currentPath === m.href || options.activeMenuId === m.id);

          let subMenuHtml = '';
          if (m.isProcess && isProcessPage) {
            subMenuHtml = `
              <div class="tmh-submenu-wrap">
                ${DANH_SACH_7_BUOC.map((b, idx) => {
                  if (layQuyenModule(b.mod) === "none") return "";
                  const isStepActive = currentPath === b.href || options.activeMenuId === b.id;
                  return `
                    <a href="${b.href}" class="tmh-submenu-item ${isStepActive ? 'active' : ''}" title="${b.desc}">
                      <span class="tmh-sub-num">${idx + 1}</span>
                      <span>${b.label}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            `;
          }

          return `
            <a href="${hrefMenu}" class="tmh-menu-item ${isActive ? 'active' : ''}" title="${m.desc}">
              <span class="tmh-menu-ic">${m.ic}</span>
              <span class="tmh-menu-label">${m.label}</span>
            </a>
            ${subMenuHtml}
          `;
        }).join('')}
      </div>

      <!-- Chân Sidebar: User Profile & Cài đặt App -->
      <div class="tmh-sidebar-footer">
        <button type="button" class="btn btn-outline btn-pwa-install" onclick="moModalCaiDatApp()" title="Cài đặt App Thái Mỹ Hương lên điện thoại / máy tính" style="width:100%; margin-bottom:10px; justify-content:center;">
          <span>📲</span>
          <span>Cài đặt ứng dụng</span>
        </button>
        <div class="tmh-sidebar-user">
          <div class="tmh-user-avatar">${userInitialsH}</div>
          <div class="tmh-user-meta">
            <div class="name" title="${tenNguoiDungH}">${tenNguoiDungH}</div>
            <div class="tmh-badge-role" style="font-size:11px;" title="${chucVuH}">${chucVuH} (${tenCapH})</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  // 6. Render Topbar
  const pageTitle = options.pageTitle || "Hệ thống Thái Mỹ Hương";
  const breadcrumb = options.breadcrumb || (isProcessPage ? "Quy trình KiotViet ➡ MISA" : "Hệ thống");

  const topbarHtml = `
    <header class="tmh-topbar">
      <div class="tmh-topbar-left">
        <button type="button" class="tmh-btn-mobile-toggle" id="tmhBtnMobileToggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div class="tmh-topbar-breadcrumb">
          <a href="trang_chu.html">🏠 Thái Mỹ Hương</a>
          <span>/</span>
          <span>${breadcrumb}</span>
          <span>/</span>
          <span class="current">${pageTitle}</span>
        </div>
      </div>

      <div class="tmh-topbar-right">
        <div class="tmh-pill">
          <span>📅</span>
          <span>${ngayHienTaiStr}</span>
        </div>
        <div class="tmh-pill tmh-pill-green" title="Kết nối Supabase ổn định">
          <span>🟢</span>
          <span>Supabase Online</span>
        </div>
        <button type="button" class="btn btn-outline btn-pwa-install" onclick="moModalCaiDatApp()" title="Cài đặt App lên điện thoại hoặc máy tính">
          <span>📲</span>
          <span>Cài đặt</span>
        </button>
        <button type="button" class="btn btn-outline" onclick="dangXuat()" title="Đăng xuất khỏi hệ thống">
          <span>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  `;

  // 7. Render Footer
  const footerHtml = `
    <footer class="tmh-footer">
      <div>
        <strong>🌿 CÔNG TY TNHH THÁI MỸ HƯƠNG</strong> — MST: <b>4001085814</b> | 291 Văn Tiến Dũng, Hòa Xuân, Cẩm Lệ, Đà Nẵng
      </div>
      <div>
        <span>Hotline: 090 580 1918 / 090 585 1918</span> | <span>VCB: <b>0041000266096</b></span>
      </div>
    </footer>
  `;

  // Chuẩn bị thanh tiến trình 7 bước nằm ngang (Stepper) nếu đang trong quy trình
  let stepperHtml = "";
  if (isProcessPage) {
    stepperHtml = `
      <div class="tmh-stepper-wrap no-print">
        <div class="tmh-stepper-header">
          <div class="tmh-stepper-title">
            <span>🔄 Quy trình 3 bước: Điều Xe ➡ Quyết Toán Thu Tiền ➡ Đẩy MISA</span>
          </div>
          <div style="display:flex; gap:14px; flex-wrap:wrap; align-items:center;">
          <a href="trang_chu.html" class="tmh-stepper-sub" style="text-decoration:none; color:var(--primary); font-weight:700;">
            ← Xem toàn bộ quy trình
          </a>
          ${layQuyenModule("baocao") !== "none" ? `<a href="bao_cao_tong_hop.html" class="tmh-stepper-sub" style="text-decoration:none; color:var(--primary); font-weight:700;">📊 Báo cáo tổng hợp →</a>` : ""}
        </div>
          </div>
        <div class="tmh-stepper-track">
          ${DANH_SACH_7_BUOC.map((b, idx) => {
                  if (layQuyenModule(b.mod) === "none") return "";
            const isStepActive = currentPath === b.href || options.activeMenuId === b.id || (b.id === 'buoc1' && currentPath === 'buoc2_phieu_xuat_kho.html');
            return `
              <a href="${b.href}" class="tmh-stepper-tab ${isStepActive ? 'active' : ''}" title="${b.desc}">
                <span class="tmh-stepper-num">${idx + 1}</span>
                <span>${b.label}</span>
              </a>
              ${DANH_SACH_7_BUOC.slice(idx + 1).some(x => layQuyenModule(x.mod) !== 'none') ? '<span class="tmh-stepper-arrow">›</span>' : ''}
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 8. Đưa cấu trúc vào trang
  const existingApp = document.getElementById("tmhAppWrapper");
  if (!existingApp) {
    const wrapper = document.createElement("div");
    wrapper.id = "tmhAppWrapper";
    wrapper.className = "tmh-layout";

    // Tìm thẻ main hiện có
    const targetContent = document.getElementById("mainContent") || document.querySelector("main") || document.body.firstElementChild;

    wrapper.innerHTML = `
      <div class="tmh-backdrop" id="tmhBackdrop"></div>
      ${sidebarHtml}
      <div class="tmh-main-wrapper" id="tmhMainWrapper">
        ${topbarHtml}
        <div class="tmh-page-body" id="tmhPageBody"></div>
        ${footerHtml}
      </div>
    `;

    document.body.appendChild(wrapper);

    // Di chuyển nội dung cũ vào tmhPageBody
    const bodyContainer = document.getElementById("tmhPageBody");
    if (targetContent && targetContent !== wrapper) {
      if (stepperHtml) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = stepperHtml;
        bodyContainer.appendChild(tempDiv.firstElementChild);
      }
      bodyContainer.appendChild(targetContent);
      targetContent.style.display = "block";
    }
  }

  hienBannerCheDoXem();

  // 9. Xử lý Toggle & Collapse Sidebar
  khoiTaoSidebarEvents();

  // 10. Khởi tạo PWA (Manifest, Meta tags, Service Worker & Auto-update)
  khoiTaoPWALayout();

  // 11. Ẩn loading
  if (overlay) {
    overlay.style.display = "none";
  }

  return {
    user: nd,
    tenNguoiDung: tenNguoiDung,
    vaiTro: vaiTro,
    tenVaiTro: tenVaiTro,
    capTaiKhoan: capDo,
    chucVu: chucVu,
    tenCap: tenCap
  };
}

/**
 * Tự động chèn thẻ meta PWA, link manifest và nạp pwa.js
 */
function khoiTaoPWALayout() {
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'manifest.json';
    document.head.appendChild(link);
  }

  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = '#16a34a';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = 'icons/apple-touch-icon.png';
    document.head.appendChild(link);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-status-bar-style';
    meta.content = 'black-translucent';
    document.head.appendChild(meta);
  }

  if (!document.querySelector('script[src*="pwa.js"]')) {
    const s = document.createElement('script');
    s.src = 'pwa.js';
    document.head.appendChild(s);
  }
}

function khoiTaoSidebarEvents() {
  const layout = document.getElementById("tmhAppWrapper");
  const btnCollapse = document.getElementById("tmhBtnCollapse");
  const btnMobile = document.getElementById("tmhBtnMobileToggle");
  const backdrop = document.getElementById("tmhBackdrop");
  const sidebar = document.getElementById("tmhSidebar");

  if (!layout || !sidebar) return;

  // Khôi phục trạng thái thu gọn desktop
  const isCollapsed = localStorage.getItem("tmh_sidebar_collapsed") === "true";
  if (isCollapsed && window.innerWidth > 860) {
    layout.classList.add("sidebar-collapsed");
  }

  if (btnCollapse) {
    btnCollapse.addEventListener("click", () => {
      layout.classList.toggle("sidebar-collapsed");
      localStorage.setItem("tmh_sidebar_collapsed", layout.classList.contains("sidebar-collapsed") ? "true" : "false");
    });
  }

  if (btnMobile) {
    btnMobile.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      backdrop.classList.toggle("show");
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("show");
    });
  }
}

/**
 * Chặn truy cập trang khi chức vụ không có quyền (mức 'none').
 * Chuyển về trang đầu tiên được phép; trang gọi sẽ không chạy tiếp (Promise không kết thúc).
 */
function chanTruyCapTrang(overlay) {
  if (overlay) overlay.style.display = "none";
  const trangDuocPhep = ["trang_chu.html", "buoc1_dieu_xe_xuat_kho.html", "buoc2_quyet_toan_thu_tien.html", "buoc3_day_misa.html", "theo_doi_cong_no.html", "danh_muc.html"]
    .find(f => layQuyenModule(layModuleCuaTrang(f)) !== "none");
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;inset:0;z-index:99999;background:#f0fdf4;display:flex;align-items:center;justify-content:center;font-family:sans-serif;padding:24px;text-align:center;";
  box.innerHTML = `
    <div style="max-width:420px;background:#fff;border:1px solid #bbf7d0;border-radius:16px;padding:32px;box-shadow:0 12px 32px rgba(15,23,42,.08);">
      <div style="font-size:42px;">🔒</div>
      <h2 style="margin:10px 0 6px;color:#14532d;">Bạn không có quyền truy cập mục này</h2>
      <p style="color:#64748b;font-size:14px;line-height:1.5;">Chức vụ của bạn chưa được cấp quyền. Vui lòng liên hệ Quản trị viên để được cấp quyền.</p>
      <div style="margin-top:18px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        ${trangDuocPhep ? `<a href="${trangDuocPhep}" style="padding:10px 18px;background:#16a34a;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;">Về trang được phép</a>` : ""}
        <button type="button" onclick="dangXuat()" style="padding:10px 18px;border:1px solid #86efac;background:#f0fdf4;color:#15803d;border-radius:10px;font-weight:700;cursor:pointer;">Đăng xuất</button>
      </div>
    </div>`;
  document.body.appendChild(box);
  return new Promise(function () {}); // dừng luôn phần khởi tạo còn lại của trang
}

/** Banner báo chế độ chỉ xem (hiển thị sau khi layout dựng xong) */
function hienBannerCheDoXem() {
  if (!window.TMH_CHE_DO_XEM || document.getElementById("tmhBannerXem")) return;
  const body = document.getElementById("tmhPageBody");
  if (!body) return;
  const b = document.createElement("div");
  b.id = "tmhBannerXem";
  b.className = "no-print";
  b.style.cssText = "background:#fef9c3;border:1px solid #fde047;color:#854d0e;padding:10px 14px;border-radius:10px;margin-bottom:12px;font-size:13px;font-weight:700;";
  b.textContent = "🟡 Bạn chỉ có quyền XEM ở mục này — mọi thao tác thêm / sửa / xoá dữ liệu trên hệ thống sẽ bị chặn.";
  body.prepend(b);
}
