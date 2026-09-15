/* ====================================================================
 * layout.js — HÀM TẠO LAYOUT THỐNG NHẤT (SIDEBAR + TOPBAR + AUTH)
 * Dành cho tất cả các trang nội bộ của app THÁI MỸ HƯƠNG
 * ==================================================================== */

// Danh sách các mục trên menu Sidebar
const MENU_QUY_TRINH_7_BUOC = [
  { id: "buoc1", href: "buoc1_upload.html", ic: "📥", label: "1. Tải KiotViet", desc: "Nạp file Excel bán hàng & đồng bộ DM" },
  { id: "buoc2", href: "buoc2_phieu_xuat_kho.html", ic: "📊", label: "2. Phiếu thu & Xuất kho", desc: "Tạo danh sách thu tiền & phiếu kho" },
  { id: "buoc3", href: "buoc3_luu_tru.html", ic: "🗄️", label: "3. Lưu trữ đợt", desc: "Quản lý 18 cột đối soát & chi tiết HĐ" },
  { id: "buoc4", href: "buoc4_kiem_don.html", ic: "📋", label: "4. Kiểm đơn giao về", desc: "Đối soát tiền mặt, CK & tách đơn giao lại" },
  { id: "buoc5", href: "buoc5_bao_cao.html", ic: "💾", label: "5. Báo cáo đối soát", desc: "Tổng hợp MISA & gỡ đơn giao lại" },
  { id: "buoc6", href: "buoc6_nop_tien.html", ic: "📗", label: "6. Bảng kê nộp tiền", desc: "Đếm mệnh giá tiền mặt & sổ nộp xe" },
  { id: "buoc7", href: "buoc7_xuat_misa.html", ic: "📤", label: "7. Xuất file MISA", desc: "Xuất Excel 69 cột chuẩn kế toán MISA" }
];

const MENU_QUAN_TRI = [
  { id: "trangchu", href: "trang_chu.html", ic: "🏠", label: "Bảng điều khiển", roles: ["admin", "quanly", "nhanvien"] },
  { id: "congno", href: "cong_no.html", ic: "💰", label: "Theo dõi công nợ", roles: ["admin", "quanly"] },
  { id: "danhmuc", href: "danh_muc.html", ic: "📚", label: "Danh mục dữ liệu", roles: ["admin", "quanly"] },
  { id: "taikhoan", href: "quan_ly_taikhoan.html", ic: "👤", label: "Quản lý tài khoản", roles: ["admin"] }
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
  const tenVaiTro = TEN_VAI_TRO[vaiTro] || vaiTro;
  const userInitials = tenNguoiDung.trim().split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "TMH";

  // 3. Chuẩn bị ngày hiện tại
  const now = new Date();
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const ngayHienTaiStr = `${days[now.getDay()]}, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // 4. Xác định menu active
  const currentPath = window.location.pathname.split("/").pop() || "trang_chu.html";

  // 5. Render Sidebar
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
        <div class="tmh-menu-cat">Quy trình 7 bước</div>
        ${MENU_QUY_TRINH_7_BUOC.map(m => {
          const isActive = currentPath === m.href || options.activeMenuId === m.id;
          return `
            <a href="${m.href}" class="tmh-menu-item ${isActive ? 'active' : ''}" title="${m.desc}">
              <span class="tmh-menu-ic">${m.ic}</span>
              <span class="tmh-menu-label">${m.label}</span>
            </a>
          `;
        }).join('')}

        <div class="tmh-menu-cat">Quản trị & Sổ sách</div>
        ${MENU_QUAN_TRI.map(m => {
          const isActive = currentPath === m.href || options.activeMenuId === m.id;
          return `
            <a href="${m.href}" class="tmh-menu-item ${isActive ? 'active' : ''}">
              <span class="tmh-menu-ic">${m.ic}</span>
              <span class="tmh-menu-label">${m.label}</span>
            </a>
          `;
        }).join('')}
      </div>

      <!-- Chân Sidebar: User Profile -->
      <div class="tmh-sidebar-footer">
        <div class="tmh-sidebar-user">
          <div class="tmh-user-avatar">${userInitials}</div>
          <div class="tmh-user-meta">
            <div class="name" title="${tenNguoiDung}">${tenNguoiDung}</div>
            <div class="tmh-badge-role">${tenVaiTro}</div>
          </div>
        </div>
      </div>
    </aside>
  `;

  // 6. Render Topbar
  const pageTitle = options.pageTitle || "Hệ thống Thái Mỹ Hương";
  const breadcrumb = options.breadcrumb || "Quy trình xử lý dữ liệu";

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
    tenVaiTro: tenVaiTro
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
