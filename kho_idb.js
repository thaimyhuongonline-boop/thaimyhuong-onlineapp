/* ====================================================================
 * kho_idb.js — CHUYỂN DỮ LIỆU LỚN TỪ localStorage SANG IndexedDB
 * THÁI MỸ HƯƠNG — KiotViet ➡ MISA
 * ====================================================================
 * localStorage chỉ chứa được ~5 MB → lịch sử chuyến xe, hoá đơn, sổ công nợ, danh mục… làm đầy bộ nhớ.
 * File này phải nạp TRƯỚC config.js. Nó giữ nguyên mọi lời gọi cũ localStorage.getItem / setItem /
 * removeItem của các trang, nhưng với các khoá dữ liệu "tmh_…" (trừ vài khoá nhỏ của phiên đăng nhập):
 *   - Đọc: lấy từ bộ nhớ đệm trong RAM (nạp sẵn từ IndexedDB khi mở trang).
 *   - Ghi: cập nhật RAM ngay + ghi xuống IndexedDB. Đồng thời ghi TẠM vào localStorage (nếu còn chỗ) để
 *     không mất dữ liệu khi trang chuyển đi trước lúc IndexedDB ghi xong; ghi xong thì xoá bản tạm.
 *   - Lần đầu chạy: dữ liệu cũ đang nằm trong localStorage được chép sang IndexedDB rồi mới xoá khỏi
 *     localStorage (chỉ xoá khi IndexedDB đã ghi thành công).
 *   - Nhiều tab cùng máy: báo cho nhau qua BroadcastChannel để luôn đọc được dữ liệu mới nhất.
 * Các trang chờ TMHKho.sanSang trước khi khởi tạo (sự kiện DOMContentLoaded + khoiTaoLayout).
 * Không mở được IndexedDB (trình duyệt chặn / chế độ ẩn danh) → chạy y như cũ bằng localStorage.
 * KHÔNG có cơ chế tự động xoá dữ liệu: file này không gọi Supabase, không xoá khoá nào của các trang.
 * Thứ duy nhất nó tự gỡ là BẢN SAO trong localStorage của một khoá, và chỉ sau khi IndexedDB đã ghi
 * thành công đúng giá trị đó (dữ liệu được chuyển chỗ, không mất). Xoá chỉ xảy ra khi trang gọi removeItem
 * như trước (thao tác của người dùng).
 * ==================================================================== */
(function () {
  "use strict";
  if (window.TMHKho) return;

  const TEN_DB = "tmh_kho_du_lieu";
  const TEN_BANG = "kv";
  const KHOA_DA_DUNG = "tmh__idb_da_dung";      // đánh dấu máy này đã chuyển dữ liệu sang IndexedDB
  const KHOA_CHO_XOA = "tmh__idb_cho_xoa";      // khoá đã xoá nhưng IndexedDB chưa xoá xong
  // Khoá nhỏ của phiên đăng nhập / giao diện → để nguyên trong localStorage
  const GIU_TRONG_LS = new Set([
    "tmh_sidebar_collapsed", "tmh_quyen_rieng_tk", "tmh_quyen_rieng_local", "tmh_trang_tu_dang_ky"
  ]);

  let LS = null;
  try { LS = window.localStorage; } catch (e) { LS = null; }
  if (!LS || !window.Storage) { window.TMHKho = { sanSang: Promise.resolve(), cheDo: "ls" }; return; }

  const P = Storage.prototype;
  const goc = { get: P.getItem, set: P.setItem, rm: P.removeItem };
  const lsGet = k => { try { return goc.get.call(LS, k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { goc.set.call(LS, k, v); return true; } catch (e) { return false; } };
  const lsRm = k => { try { goc.rm.call(LS, k); } catch (e) {} };

  const laKhoaLon = k => typeof k === "string" && k.indexOf("tmh_") === 0 && k.indexOf("tmh__") !== 0 && !GIU_TRONG_LS.has(k);

  const cache = new Map();   // khoá → chuỗi giá trị
  let cheDo = "cho";         // "cho" (đang mở IndexedDB) | "idb" | "ls" (dùng localStorage như cũ)
  let db = null;
  const hangDoi = [];        // thao tác ghi xếp hàng trước khi IndexedDB mở xong
  let kenh = null;
  try { kenh = new BroadcastChannel("tmh_kho_du_lieu"); } catch (e) { kenh = null; }

  function docChoXoa() { try { return JSON.parse(lsGet(KHOA_CHO_XOA) || "[]") || []; } catch (e) { return []; } }
  function ghiChoXoa(ds) { if (ds.length) lsSet(KHOA_CHO_XOA, JSON.stringify(ds)); else lsRm(KHOA_CHO_XOA); }

  // ---------- Ghi xuống IndexedDB ----------
  function thucHienGhi(viec) {
    return new Promise(resolve => {
      let tx;
      try { tx = db.transaction(TEN_BANG, "readwrite"); } catch (e) { resolve(false); return; }
      const st = tx.objectStore(TEN_BANG);
      if (viec.v === null) st.delete(viec.k); else st.put(viec.v, viec.k);
      tx.oncomplete = () => {
        if (viec.v === null) {
          ghiChoXoa(docChoXoa().filter(x => x !== viec.k));
        } else if (lsGet(viec.k) === viec.v) {
          lsRm(viec.k); // bản tạm trong localStorage không cần nữa
        }
        resolve(true);
      };
      tx.onerror = tx.onabort = () => resolve(false);
    });
  }
  function xepGhi(k, v) {
    const viec = { k, v };
    if (cheDo === "idb" && db) thucHienGhi(viec); else hangDoi.push(viec);
  }

  // ---------- Thay hàm localStorage (chỉ tác động localStorage, không đụng sessionStorage) ----------
  P.getItem = function (k) {
    if (this === LS && cheDo !== "ls" && laKhoaLon(String(k))) {
      k = String(k);
      if (cache.has(k)) return cache.get(k);
      if (cheDo === "cho") return lsGet(k);
      return null;
    }
    return goc.get.apply(this, arguments);
  };
  P.setItem = function (k, v) {
    if (this === LS && cheDo !== "ls" && laKhoaLon(String(k))) {
      k = String(k); v = String(v);
      cache.set(k, v);
      if (!lsSet(k, v)) lsRm(k); // bản tạm (localStorage đầy → bỏ bản tạm cũ hơn, IndexedDB vẫn ghi)
      xepGhi(k, v);
      if (kenh) { try { kenh.postMessage({ k, v }); } catch (e) {} }
      return;
    }
    return goc.set.apply(this, arguments);
  };
  P.removeItem = function (k) {
    if (this === LS && cheDo !== "ls" && laKhoaLon(String(k))) {
      k = String(k);
      cache.delete(k);
      lsRm(k);
      const ds = docChoXoa(); if (ds.indexOf(k) < 0) { ds.push(k); ghiChoXoa(ds); }
      xepGhi(k, null);
      if (kenh) { try { kenh.postMessage({ k, v: null }); } catch (e) {} }
      return;
    }
    return goc.rm.apply(this, arguments);
  };
  if (kenh) {
    kenh.onmessage = ev => {
      const m = ev && ev.data; if (!m || typeof m.k !== "string") return;
      if (m.v === null) cache.delete(m.k); else cache.set(m.k, String(m.v));
    };
  }

  // ---------- Mở IndexedDB, nạp dữ liệu, chuyển dữ liệu cũ ----------
  function moDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error("Trình duyệt không hỗ trợ IndexedDB")); return; }
      let req;
      try { req = indexedDB.open(TEN_DB, 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(TEN_BANG)) req.result.createObjectStore(TEN_BANG); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("Không mở được IndexedDB"));
      req.onblocked = () => {};
    });
  }
  function docTatCa(d) {
    return new Promise((resolve, reject) => {
      const kq = new Map();
      const tx = d.transaction(TEN_BANG, "readonly");
      const rq = tx.objectStore(TEN_BANG).openCursor();
      rq.onsuccess = () => { const c = rq.result; if (c) { kq.set(String(c.key), c.value); c.continue(); } };
      tx.oncomplete = () => resolve(kq);
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
  }
  function cacKhoaLonTrongLS() {
    const ds = [];
    try { for (let i = 0; i < LS.length; i++) { const k = LS.key(i); if (laKhoaLon(k)) ds.push(k); } } catch (e) {}
    return ds;
  }

  const sanSang = (async function () {
    try {
      const d = await Promise.race([
        moDB(),
        new Promise((_, rej) => setTimeout(() => rej(new Error("Mở IndexedDB quá lâu")), 8000))
      ]);
      const tuDB = await docTatCa(d);
      tuDB.forEach((v, k) => { if (!cache.has(k)) cache.set(k, typeof v === "string" ? v : JSON.stringify(v)); });
      // Khoá đã xoá nhưng IndexedDB chưa kịp xoá (trang chuyển đi ngay sau khi xoá)
      const choXoa = docChoXoa();
      choXoa.forEach(k => { if (!lsGet(k)) cache.delete(k); });
      // Dữ liệu trong localStorage (dữ liệu cũ chưa chuyển hoặc bản tạm chưa ghi xong) luôn MỚI hơn IndexedDB
      const canGhi = choXoa.filter(k => !lsGet(k)).map(k => ({ k, v: null }));
      cacKhoaLonTrongLS().forEach(k => {
        const v = lsGet(k);
        if (v == null) return;
        if (!hangDoi.some(x => x.k === k)) cache.set(k, v);
        canGhi.push({ k, v: cache.has(k) ? cache.get(k) : v });
      });
      db = d;
      cheDo = "idb";
      lsSet(KHOA_DA_DUNG, "1");
      try { d.onversionchange = () => { try { d.close(); } catch (e) {} }; } catch (e) {}
      const tatCa = canGhi.concat(hangDoi.splice(0));
      for (const viec of tatCa) await thucHienGhi(viec);
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}
    } catch (e) {
      console.warn("[TMHKho] Không dùng được IndexedDB → dùng localStorage như cũ:", e);
      // Ghi trước khi mở xong IndexedDB → đưa về localStorage
      hangDoi.splice(0).forEach(x => { if (x.v === null) lsRm(x.k); else lsSet(x.k, x.v); });
      cheDo = "ls";
      if (lsGet(KHOA_DA_DUNG) === "1") {
        setTimeout(() => {
          try {
            alert("⚠️ Không mở được bộ nhớ IndexedDB của trình duyệt — dữ liệu lưu trên máy (lịch sử chuyến xe, sổ công nợ…) có thể chưa hiện đủ.\n\nHãy đóng bớt các tab của ứng dụng rồi tải lại trang (F5). Dữ liệu trên máy chủ không bị ảnh hưởng.");
          } catch (_) {}
        }, 500);
      }
    }
  })();

  // Các trang khởi tạo trong DOMContentLoaded → chờ dữ liệu sẵn sàng rồi mới chạy
  function boc(fn) {
    if (typeof fn !== "function" || fn.__tmhBoc) return fn;
    const w = function (ev) { const self = this; return sanSang.then(() => fn.call(self, ev)); };
    w.__tmhBoc = true;
    return w;
  }
  [window, document].forEach(o => {
    const ael = o.addEventListener;
    o.addEventListener = function (type, fn, opt) {
      if (type === "DOMContentLoaded") fn = boc(fn);
      return ael.call(this, type, fn, opt);
    };
  });

  // ---------- Dung lượng ----------
  function dungLuongLocalStorageMB() {
    let byte = 0;
    try {
      for (let i = 0; i < LS.length; i++) { const k = LS.key(i) || ""; byte += (k.length + (lsGet(k) || "").length) * 2; }
    } catch (e) {}
    return byte / (1024 * 1024);
  }
  function dungLuongDuLieuMB() {
    let byte = 0;
    cache.forEach((v, k) => { byte += (k.length + (v || "").length) * 2; });
    return byte / (1024 * 1024);
  }
  /** { cheDo, lsMB, lsGioiHanMB, duLieuMB, daDungMB, hanMucMB } — daDung/hanMuc theo navigator.storage.estimate (IndexedDB + bộ nhớ đệm) */
  async function thongKeDungLuong() {
    await sanSang;
    const kq = { cheDo, lsMB: dungLuongLocalStorageMB(), lsGioiHanMB: 5, duLieuMB: cheDo === "idb" ? dungLuongDuLieuMB() : 0, daDungMB: null, hanMucMB: null };
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const e = await navigator.storage.estimate();
        if (e && e.quota) { kq.daDungMB = (e.usage || 0) / (1024 * 1024); kq.hanMucMB = e.quota / (1024 * 1024); }
      }
    } catch (e) {}
    return kq;
  }

  window.TMHKho = {
    sanSang,
    get cheDo() { return cheDo; },
    laKhoaLon,
    thongKeDungLuong
  };
})();
