/* ====================================================================
 * layout.js — HÀM TẠO LAYOUT THỐNG NHẤT (SIDEBAR + TOPBAR + AUTH)
 * Dành cho tất cả các trang nội bộ của app THÁI MỸ HƯƠNG
 * ==================================================================== */

// Danh sách chi tiết 7 bước quy trình chuyển dữ liệu từ KiotViet sang MISA
const DANH_SACH_7_BUOC = [
  { id: "buoc1", href: "buoc1_upload.html", ic: "📥", label: "1. Tải KiotViet", desc: "Nạp file Excel bán hàng & đồng bộ DM" },
  { id: "buoc2", href: "buoc2_phieu_xuat_kho.html", ic: "📊", label: "2. Tạo PXK & DSTT", desc: "Tạo phiếu xuất kho & danh sách thu tiền" },
  { id: "buoc3", href: "buoc3_luu_tru.html", ic: "🗄️", label: "3. Lưu trữ đợt", desc: "Quản lý 18 cột đối soát & chi tiết HĐ" },
  { id: "buoc4", href: "buoc4_kiem_don.html", ic: "📋", label: "4. Kiểm đơn", desc: "Đối soát tiền mặt, CK & tách đơn giao lại" },
  { id: "buoc5", href: "buoc5_bao_cao.html", ic: "💾", label: "5. Báo cáo đối soát", desc: "Tổng hợp MISA & gỡ đơn giao lại" },
  { id: "buoc6", href: "buoc6_nop_tien.html", ic: "📗", label: "6. Bảng kê nộp tiền", desc: "Đếm mệnh giá tiền mặt & sổ nộp xe" },
  { id: "buoc7", href: "buoc7_xuat_misa.html", ic: "📤", label: "7. Xuất file MISA", desc: "Xuất Excel 69 cột chuẩn kế toán MISA" }
];

// Danh sách Menu chính trên Sidebar
const MENU_CHINH = [
  { id: "quytrinh", href: "buoc1_upload.html", ic: "🔄", label: "Quy trình Bán hàng ➡ MISA", isProcess: true, desc: "Quy trình 7 bước từ KiotViet sang MISA", roles: ["admin", "quanly", "nhanvien"] },
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

  const tenNguoiDung = nd.ho_ten || "Quý nhân viên";
  const vaiTro = nd.vai_tro || "nhanvien";
  const capDo = nd.cap_tai_khoan || (vaiTro === "admin" ? 1 : 3);
  const tenCap = nd.ten_cap || (capDo === 1 ? "Toàn quyền" : (capDo === 2 ? "Cấp Quản lý" : "Nhân sự"));
  const tenVaiTro = tenCap;
  const chucVu = nd.chuc_vu || "Nhân sự";
  const userInitials = tenNguoiDung.trim().split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "TMH";

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
  const currentPath = window.location.pathname.split("/").pop() || "buoc1_upload.html";
  const isProcessPage = DANH_SACH_7_BUOC.some(b => b.href === currentPath) || options.activeMenuId === "quytrinh" || (options.activeMenuId && options.activeMenuId.startsWith("buoc"));

  // 5. Render Sidebar (Gom 7 bước thành 1 tab)
  const sidebarHtml = `
    <aside class="tmh-sidebar" id="tmhSidebar">
      <!-- Header Sidebar -->
      <div class="tmh-sidebar-header">
        <a href="buoc1_upload.html" class="tmh-brand-wrap">
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
          // Cấp 1 (Toàn quyền): Thấy tất cả các menu
          if (capDo !== 1) {
            // Kiểm tra theo ma trận phân quyền nếu có cấu hình
            if (userPq && Object.keys(userPq).length > 0) {
              const qVal = userPq[m.id];
              if (qVal === 'none' || qVal === '') return '';
            } else if (m.roles && !m.roles.includes(vaiTro)) {
              return '';
            }
          }

          const isActive = m.isProcess ? isProcessPage : (currentPath === m.href || options.activeMenuId === m.id);

          let subMenuHtml = '';
          if (m.isProcess && isProcessPage) {
            subMenuHtml = `
              <div class="tmh-submenu-wrap">
                ${DANH_SACH_7_BUOC.map((b, idx) => {
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
            <a href="${m.href}" class="tmh-menu-item ${isActive ? 'active' : ''}" title="${m.desc}">
              <span class="tmh-menu-ic">${m.ic}</span>
              <span class="tmh-menu-label">${m.label}</span>
            </a>
            ${subMenuHtml}
          `;
        }).join('')}
      </div>

      <!-- Chân Sidebar: User Profile -->
      <div class="tmh-sidebar-footer">
        <div class="tmh-sidebar-user">
          <div class="tmh-user-avatar">${userInitials}</div>
          <div class="tmh-user-meta">
            <div class="name" title="${tenNguoiDung}">${tenNguoiDung}</div>
            <div class="tmh-badge-role" style="font-size:11px;" title="${chucVu}">${chucVu} (${tenCap})</div>
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
          <a href="buoc1_upload.html">🏠 Thái Mỹ Hương</a>
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
      <div class="tmh-stepper-wrap">
        <div class="tmh-stepper-header">
          <div class="tmh-stepper-title">
            <span>🔄</span>
            <span>7 BƯỚC QUY TRÌNH CHUYỂN DỮ LIỆU: KIOTVIET ➡ MISA</span>
          </div>
          <div class="tmh-stepper-sub">
            Chọn bước để chuyển đổi liên hoàn trong quy trình xử lý
          </div>
        </div>
        <div class="tmh-stepper-track">
          ${DANH_SACH_7_BUOC.map((b, idx) => {
            const isStepActive = currentPath === b.href || options.activeMenuId === b.id;
            return `
              <a href="${b.href}" class="tmh-stepper-tab ${isStepActive ? 'active' : ''}" title="${b.desc}">
                <span class="tmh-stepper-num">${idx + 1}</span>
                <span>${b.label}</span>
              </a>
              ${idx < DANH_SACH_7_BUOC.length - 1 ? '<span class="tmh-stepper-arrow">➡</span>' : ''}
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

  // 9. Xử lý Toggle & Collapse Sidebar
  khoiTaoSidebarEvents();

  // 10. Ẩn loading
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
