/* ====================================================================
 * config.js — CẤU HÌNH CHUNG cho mọi trang của app THÁI MỸ HƯƠNG
 * ====================================================================
 * Mọi trang HTML nạp thư viện supabase-js TRƯỚC, rồi nạp file này.
 * Khóa "anon public" của Supabase để ở ĐÂY (một chỗ duy nhất).
 * ==================================================================== */

// 1) URL: đối chiếu Settings → API → Project URL
const SUPABASE_URL = "https://oedidnctnteeegkdcwaa.supabase.co";

// 2) DÁN khóa "anon public" (Settings → API) vào giữa 2 dấu nháy:
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZGlkbmN0bnRlZWVna2Rjd2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMzE3MTYsImV4cCI6MjEwNDkwNzcxNn0.3ZO5ZO9_VJ7vsr9qC586kXl4XAbDCjQcamP66FkDkTE";

// Tạo kết nối dùng chung
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tên vai trò để hiển thị
const TEN_VAI_TRO = { admin: "Quản trị", quanly: "Cấp quản lý", nhanvien: "Nhân viên" };

// Số điện thoại → email nội bộ (dùng chung hệ đăng nhập Supabase).
// Có "@" nghĩa là đã là email → dùng thẳng.
function taiKhoanThanhEmail(tk) {
  tk = (tk || "").trim();
  if (tk.indexOf("@") !== -1) return tk;
  return tk.replace(/[^0-9]/g, "") + "@thaimyhuong.local";
}

// Dùng ở ĐẦU mỗi trang bên trong: đảm bảo đã đăng nhập + lấy hồ sơ.
// Chưa đăng nhập / bị khóa / chưa có hồ sơ → đá về trang đăng nhập.
// Trả về { uid, ho_ten, vai_tro, trang_thai } nếu hợp lệ.
async function baoVeTrang() {
  var phien = await sb.auth.getSession();
  var session = phien.data ? phien.data.session : null;
  if (!session) { window.location.href = "index.html"; return null; }

  var uid = session.user.id;
  var hs = await sb.from("ho_so")
                   .select("ho_ten, vai_tro, trang_thai")
                   .eq("id", uid).single();

  if (hs.error || !hs.data || hs.data.trang_thai === "khoa") {
    await sb.auth.signOut();
    window.location.href = "index.html";
    return null;
  }
  return { uid: uid, ho_ten: hs.data.ho_ten, vai_tro: hs.data.vai_tro, trang_thai: hs.data.trang_thai };
}

// Đăng xuất rồi về trang đăng nhập
async function dangXuat() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}
