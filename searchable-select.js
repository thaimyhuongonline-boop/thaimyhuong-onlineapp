/* ====================================================================
 * searchable-select.js — Ô CHỌN CÓ TÌM KIẾM (dùng chung mọi trang)
 * THÁI MỸ HƯƠNG — KiotViet ➡ MISA
 * ====================================================================
 * Biến 1 thẻ <select> thông thường thành ô chọn gõ-để-tìm:
 *  - Gõ không dấu vẫn tìm được ("dat" ra "ĐẠT", "xe18" ra "XE18 (VŨ)")
 *  - Phím ↑ ↓ để di chuyển, Enter để chọn, Esc để đóng
 *  - Thẻ <select> gốc VẪN GIỮ NGUYÊN trong trang (chỉ ẩn đi), nên mọi
 *    đoạn code cũ đọc/ghi select.value, innerHTML, add(new Option...)
 *    đều chạy như trước — ô tìm kiếm tự đồng bộ theo.
 *
 * Cách dùng:  TMHSearchSelect.enhance(document.getElementById('taiXe'));
 * ==================================================================== */
(function () {
  if (window.TMHSearchSelect) return;

  function boDau(s) {
    return String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function chenCSS() {
    if (document.getElementById('tmhSearchSelectCSS')) return;
    const st = document.createElement('style');
    st.id = 'tmhSearchSelectCSS';
    st.textContent = `
      .tmh-ss { position: relative; width: 100%; }
      .tmh-ss > select { display: none !important; }
      .tmh-ss-input { width: 100%; box-sizing: border-box; padding-right: 28px !important; cursor: pointer; text-overflow: ellipsis; }
      .tmh-ss.is-open .tmh-ss-input { cursor: text; }
      .tmh-ss-caret { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 10px; color: #64748b; transition: transform .15s ease; }
      .tmh-ss.is-open .tmh-ss-caret { transform: translateY(-50%) rotate(180deg); }
      .tmh-ss-list { position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 2000; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16); max-height: 280px; overflow-y: auto; padding: 4px; }
      .tmh-ss-list[hidden] { display: none; }
      .tmh-ss-item { padding: 7px 10px; border-radius: 6px; font-size: 13px; color: #0f172a; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .tmh-ss-item.is-active { background: #f0fdf4; color: #15803d; }
      .tmh-ss-item.is-selected { font-weight: 800; }
      .tmh-ss-item.is-selected::after { content: '✓'; color: #16a34a; font-weight: 900; }
      .tmh-ss-item mark { background: #fef08a; color: inherit; padding: 0; border-radius: 2px; }
      .tmh-ss-empty { padding: 10px; font-size: 12px; color: #64748b; text-align: center; }
      .tmh-ss-count { padding: 4px 10px 6px; font-size: 11px; color: #64748b; border-bottom: 1px dashed #e2e8f0; margin-bottom: 4px; }
      @media (max-width: 640px) { .tmh-ss-input { font-size: 16px !important; } }
    `;
    document.head.appendChild(st);
  }

  function escapeHtmlSS(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Tô sáng phần khớp từ khoá (so khớp không dấu nhưng tô trên chữ gốc có dấu)
  function toSang(text, tuKhoa) {
    if (!tuKhoa) return escapeHtmlSS(text);
    const goc = String(text);
    // boDau giữ nguyên độ dài từng ký tự với chữ tiếng Việt thông dụng (NFC) nên
    // vị trí tìm được trên chuỗi không dấu dùng được cho chuỗi gốc
    const khongDau = Array.from(goc).map(ch => boDau(ch) || ch).join('');
    if (khongDau.length !== goc.length) return escapeHtmlSS(goc);
    const viTri = khongDau.indexOf(tuKhoa);
    if (viTri < 0) return escapeHtmlSS(goc);
    return escapeHtmlSS(goc.slice(0, viTri)) + '<mark>' + escapeHtmlSS(goc.slice(viTri, viTri + tuKhoa.length)) + '</mark>' + escapeHtmlSS(goc.slice(viTri + tuKhoa.length));
  }

  function enhance(sel, opts) {
    if (!sel || sel.tagName !== 'SELECT' || sel._tmhSS) return sel && sel._tmhSS;
    opts = opts || {};
    chenCSS();

    const placeholder = opts.placeholder || '🔍 Gõ để tìm...';
    const wrap = document.createElement('div');
    wrap.className = 'tmh-ss';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = (sel.className || '') + ' tmh-ss-input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    if (sel.getAttribute('style')) input.setAttribute('style', sel.getAttribute('style'));
    if (sel.title) input.title = sel.title;
    if (sel.id) input.id = sel.id + '__timKiem';

    const caret = document.createElement('span');
    caret.className = 'tmh-ss-caret';
    caret.textContent = '▼';

    const list = document.createElement('div');
    list.className = 'tmh-ss-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    wrap.appendChild(input);
    wrap.appendChild(caret);
    wrap.appendChild(list);
    sel.tabIndex = -1;

    let dangMo = false;
    let chiSoSang = -1;
    let dsLoc = [];

    const nhanHienTai = () => {
      const o = sel.options[sel.selectedIndex];
      return o ? o.text : '';
    };

    function capNhatNhan() {
      input.disabled = !!sel.disabled;
      if (!dangMo) {
        input.value = nhanHienTai();
        input.placeholder = sel.options.length ? placeholder : '(Danh sách trống)';
      }
    }

    function danhDauSang() {
      const items = list.querySelectorAll('.tmh-ss-item');
      items.forEach((el, i) => el.classList.toggle('is-active', i === chiSoSang));
      const el = items[chiSoSang];
      if (el) {
        const top = el.offsetTop, bottom = top + el.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top - 4;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 4;
      }
    }

    function veDanhSach(tuKhoaRaw) {
      const tuKhoa = boDau(tuKhoaRaw);
      const cacTu = tuKhoa ? tuKhoa.split(' ') : [];
      dsLoc = Array.from(sel.options).filter(o => {
        if (o.disabled && !o.value) return false;
        if (!cacTu.length) return true;
        const t = boDau(o.text + ' ' + o.value);
        return cacTu.every(w => t.includes(w));
      });
      list.innerHTML = '';
      if (tuKhoa) {
        const dem = document.createElement('div');
        dem.className = 'tmh-ss-count';
        dem.textContent = `${dsLoc.length} kết quả`;
        list.appendChild(dem);
      }
      if (!dsLoc.length) {
        const rong = document.createElement('div');
        rong.className = 'tmh-ss-empty';
        rong.textContent = tuKhoa ? `Không tìm thấy "${tuKhoaRaw.trim()}"` : 'Danh sách trống';
        list.appendChild(rong);
        chiSoSang = -1;
        return;
      }
      dsLoc.forEach(o => {
        const d = document.createElement('div');
        d.className = 'tmh-ss-item' + (o.selected ? ' is-selected' : '');
        d.setAttribute('role', 'option');
        d.innerHTML = `<span>${toSang(o.text, cacTu.length === 1 ? cacTu[0] : '')}</span>`;
        // mousedown + preventDefault: chọn trước khi ô nhập bị mất focus (blur)
        d.addEventListener('mousedown', e => { e.preventDefault(); chon(o); });
        list.appendChild(d);
      });
      const idxChon = dsLoc.findIndex(o => o.selected);
      chiSoSang = tuKhoa ? 0 : Math.max(0, idxChon);
      danhDauSang();
    }

    function mo(giuNoiDung) {
      if (dangMo || sel.disabled) return;
      dangMo = true;
      wrap.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      input.placeholder = nhanHienTai() || placeholder;
      if (!giuNoiDung) input.value = '';
      list.hidden = false;
      veDanhSach(giuNoiDung ? input.value : '');
    }

    function dong() {
      if (!dangMo) return;
      dangMo = false;
      wrap.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      list.hidden = true;
      capNhatNhan();
    }

    function chon(o) {
      const doi = sel.value !== o.value;
      giaTriGoc.set.call(sel, o.value);
      dong();
      if (doi) sel.dispatchEvent(new Event('change', { bubbles: true }));
    }

    input.addEventListener('mousedown', () => {
      if (document.activeElement === input) {
        if (dangMo) dong(); else mo(false);
      }
    });
    input.addEventListener('focus', () => { mo(false); setTimeout(() => input.select(), 0); });
    input.addEventListener('blur', () => dong());
    input.addEventListener('input', () => {
      if (!dangMo) mo(true);
      veDanhSach(input.value);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!dangMo) { mo(false); return; }
        if (!dsLoc.length) return;
        chiSoSang = (chiSoSang + (e.key === 'ArrowDown' ? 1 : -1) + dsLoc.length) % dsLoc.length;
        danhDauSang();
      } else if (e.key === 'Enter') {
        if (dangMo) {
          e.preventDefault();
          if (dsLoc[chiSoSang]) chon(dsLoc[chiSoSang]);
        }
      } else if (e.key === 'Escape') {
        if (dangMo) { e.preventDefault(); dong(); }
      } else if (e.key === 'Tab') {
        dong();
      }
    });

    // Đồng bộ khi code cũ gán trực tiếp select.value / selectedIndex (không phát sinh sự kiện change)
    const giaTriGoc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    const chiSoGoc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    Object.defineProperty(sel, 'value', {
      configurable: true,
      get() { return giaTriGoc.get.call(this); },
      set(v) { giaTriGoc.set.call(this, v); capNhatNhan(); }
    });
    Object.defineProperty(sel, 'selectedIndex', {
      configurable: true,
      get() { return chiSoGoc.get.call(this); },
      set(v) { chiSoGoc.set.call(this, v); capNhatNhan(); }
    });
    sel.addEventListener('change', capNhatNhan);

    // Đồng bộ khi code cũ nạp lại danh sách (innerHTML = '', add(new Option...), sửa chữ option)
    new MutationObserver(() => {
      capNhatNhan();
      if (dangMo) veDanhSach(input.value);
    }).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'selected', 'label'] });

    capNhatNhan();
    sel._tmhSS = { input, dong, capNhat: capNhatNhan };
    return sel._tmhSS;
  }

  window.TMHSearchSelect = { enhance, boDau };
})();
