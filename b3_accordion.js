/* ====================================================================
 * ACCORDION CHO BƯỚC 3 (thu gọn / mở rộng từng phần của trang)
 * --------------------------------------------------------------------
 * Mỗi phần có cấu trúc: <section class="b3-acc" id="X"> <button id="XHeader"> … </button> <div id="XBody"> … </div> </section>
 *   • Mở  : body không có thuộc tính hidden, section không có class b3-acc-dong, nút aria-expanded="true", mũi tên ▼
 *   • Đóng: body hidden, section có class b3-acc-dong, nút aria-expanded="false", mũi tên ▶
 * Chỉ ẩn / hiện — KHÔNG xoá nội dung nên dữ liệu & bộ lọc bên trong giữ nguyên khi mở lại.
 * ==================================================================== */
const TMHAccordion = (function () {
  function lay(id) {
    return { goc: document.getElementById(id), nut: document.getElementById(id + "Header"), than: document.getElementById(id + "Body") };
  }

  /** Đang mở? (không tìm thấy phần → false) */
  function dangMo(id) {
    const p = lay(id);
    return !!(p.than && !p.than.hidden);
  }

  /** Đặt trạng thái mở (true) / đóng (false); trả về trạng thái mới, null nếu không có phần tử */
  function datTrangThai(id, mo) {
    const p = lay(id);
    if (!p.goc || !p.than) return null;
    mo = !!mo;
    p.than.hidden = !mo;
    p.goc.classList.toggle("b3-acc-dong", !mo);
    if (p.nut) {
      p.nut.setAttribute("aria-expanded", mo ? "true" : "false");
      const bieuTuong = p.nut.querySelector(".b3-acc-icon");
      if (bieuTuong) bieuTuong.textContent = mo ? "▼" : "▶";
    }
    return mo;
  }

  function toggle(id) {
    const p = lay(id);
    if (!p.than) return null;
    return datTrangThai(id, !!p.than.hidden);
  }

  /** Mở / đóng tất cả các phần accordion trên trang */
  function datTatCa(mo) {
    Array.from(document.querySelectorAll(".b3-acc")).forEach(s => datTrangThai(s.id, mo));
  }

  return { dangMo: dangMo, datTrangThai: datTrangThai, toggle: toggle, datTatCa: datTatCa };
})();
