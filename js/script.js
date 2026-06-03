// ==============================================
// 0. pindah ke supabase.js untuk inisialisasi global client supabase
// ==============================================

const supabase = window.supabaseClient;

// ==============================================
// 1. KONFIGURASI & DATABASE PRODUK
// ==============================================

const imgMap = {
  1: "https://i.ibb.co.com/BHqVmDMt/download.jpg",
  2: "https://i.ibb.co.com/Y7xw4DPf/download.jpg",
  3: "https://i.ibb.co.com/35bRqKfp/download.jpg",
  4: "https://i.ibb.co.com/Y73nsryF/download.jpg",
  5: "https://i.ibb.co.com/QjHy80X4/download.jpg",
  6: "https://i.ibb.co.com/5hcMPMnx/download.jpg",
  7: "https://i.ibb.co.com/Xx8d8fmQ/download.jpg",
  8: "https://i.ibb.co.com/39cMJK7c/download.jpg",
  9: "https://i.ibb.co.com/9H7tdRY9/download.jpg",
  10: "https://i.ibb.co.com/xtyhnk3H/download.jpg",
  11: "https://i.ibb.co.com/fVwF5Yj8/download.jpg",
  12: "https://i.ibb.co.com/xtGFVyGH/download.jpg",
};

const db = [
  { id:1, nama:"Kursi Tamu Ukir Klasik Jepara", kategori:"Kursi Tamu", harga:28500000, diskon:15, icon:"🪑", deskripsi:"Kursi tamu set 1+2+3 dari kayu jati pilihan dengan ukiran motif khas Jepara. Finishing natural politur.", baru:false },
  { id:2, nama:"Kursi Tamu Minimalis Modern", kategori:"Kursi Tamu", harga:5500000, diskon:0, icon:"🛋️", deskripsi:"Desain minimalis kontemporer dengan bahan kayu mahoni solid. Cocok untuk ruangan modern.", baru:true },
  { id:3, nama:"Meja Makan Jati 6 Kursi", kategori:"Meja Makan", harga:9800000, diskon:10, icon:"🍽️", deskripsi:"Set meja makan 6 kursi dari kayu jati grade A. Ukiran halus di sisi meja. Ukuran 180x90cm.", baru:false },
  { id:4, nama:"Meja Makan Minimalis 4 Kursi", kategori:"Meja Makan", harga:3900000, diskon:0, icon:"🪑", deskripsi:"Meja makan minimalis 4 kursi kayu mahoni. Finishing duco putih elegan.", baru:true },
  { id:5, nama:"Lemari Pakaian 4 Pintu Ukir", kategori:"Lemari", harga:14500000, diskon:20, icon:"🚪", deskripsi:"Lemari 4 pintu kayu jati ukiran penuh. Dilengkapi cermin dan laci dalam. Ukuran 200x220x60cm.", baru:false },
  { id:6, nama:"Lemari Hias Minimalis", kategori:"Lemari", harga:5200000, diskon:0, icon:"🗄️", deskripsi:"Lemari hias pintu kaca kayu mahoni. Ideal untuk ruang tamu atau ruang keluarga.", baru:false },
  { id:7, nama:"Tempat Tidur Ukir Mewah", kategori:"Tempat Tidur", harga:22000000, diskon:10, icon:"🛏️", deskripsi:"Dipan king size kayu jati dengan kepala ranjang ukiran penuh. Ukuran 200x180cm. Termasuk nakas.", baru:false },
  { id:8, nama:"Tempat Tidur Minimalis Scandinavian", kategori:"Tempat Tidur", harga:6800000, diskon:0, icon:"🛏️", deskripsi:"Dipan minimalis gaya Scandinavian, kayu mahoni solid finishing natural. Ukuran 200x160cm.", baru:true },
  { id:9, nama:"Sofa Minimalis 3 Dudukan", kategori:"Sofa", harga:5500000, diskon:15, icon:"🛋️", deskripsi:"Sofa kayu jati 3 dudukan dengan bantalan busa premium. Tersedia pilihan warna kain.", baru:false },
  { id:10, nama:"Sofa L Sudut Modern", kategori:"Sofa", harga:9800000, diskon:0, icon:"🛋️", deskripsi:"Sofa L corner bahan kayu mahoni rangka kuat. Busa tebal HD40. Pilihan 5 warna kain.", baru:true },
  { id:11, nama:"Kitchen Set Minimalis Modern", kategori:"Kitchen Set", harga:15000000, diskon:5, icon:"🍳", deskripsi:"Kitchen set full set dengan lemari atas bawah, kompor area, sink area. Material HPL anti gores.", baru:false },
  { id:12, nama:"Meja Kerja Kayu Jati", kategori:"Meja Kerja", harga:4200000, diskon:0, icon:"💼", deskripsi:"Meja kerja kayu jati dengan laci samping. Finishing natural politur. Ukuran 120x60x75cm.", baru:true },
];

const promoDb = {
  "YMFIRST10": 10,
  "YMGRAND15": 15,
  "YMCUSTOM20": 20
};

let keranjang = [];
let diskonPromo = 0;
let metodeBayar = "";
let kategoriAktif = "all";

function hargaDiskon(p) {
  return p.diskon > 0 ? Math.round(p.harga * (1 - p.diskon/100)) : p.harga;
}

function formatRp(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ==============================================
// 2. FUNGSI PRODUK (RENDER, FILTER, KATEGORI)
// ==============================================

let currentPage = 1;
let itemsPerPage = 8;
let filteredData = [];

function renderProduk(list, page = 1) {
  const grid = document.getElementById("productsGrid");
  const pagination = document.getElementById("produkPagination");
  if (!grid) return;
  
  filteredData = list.length > 0 ? list : db;
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;
  
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = filteredData.slice(start, end);
  
  if (!pageData.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--abu)">
      <div style="font-size:3rem;margin-bottom:1rem">😔</div>
      <p>Produk tidak ditemukan</p></div>`;
    if (pagination) pagination.innerHTML = '';
    return;
  }
  
  grid.innerHTML = pageData.map(p => `
    <div class="product-card" id="pc${p.id}">
      <div class="product-img" style="padding:0;">
        ${imgMap[p.id] ? `<img src="${imgMap[p.id]}" style="width:100%;height:100%;object-fit:cover;" alt="${p.nama}">` : `<span style="font-size:4rem">${p.icon}</span>`}
        ${p.diskon > 0 ? `<span class="badge-diskon">-${p.diskon}%</span>` : ""}
        ${p.baru && !p.diskon ? `<span class="badge-baru" style="font-size:0.72rem;font-weight:600;position:absolute;top:12px;left:12px;background:var(--emas);color:var(--hitam);padding:4px 10px;border-radius:4px;">BARU</span>` : ""}
      </div>
      <div class="product-info">
        <div class="product-category">${p.kategori}</div>
        <div class="product-name">${p.nama}</div>
        <div class="product-price">
          <span class="price-now">${formatRp(hargaDiskon(p))}</span>
          ${p.diskon > 0 ? `<span class="price-old">${formatRp(p.harga)}</span>` : ""}
        </div>
        <p style="font-size:0.78rem;color:var(--abu);margin-bottom:12px;line-height:1.5">${p.deskripsi}</p>
        <div class="product-btns">
          <button class="btn-wa" onclick="pesanWA(${p.id})">💬 WhatsApp</button>
          <button class="btn-add-cart" onclick="tambahKeranjang(${p.id})">🛒 Keranjang</button>
        </div>
      </div>
    </div>
  `).join('');
  
  if (pagination) {
    renderPagination(pagination, totalPages, page, 'produk');
  }
}

function filterProduk() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const sort = document.getElementById("sortSelect").value;
  let hasil = db.filter(p => {
    const matchKat = kategoriAktif === "all" || p.kategori === kategoriAktif;
    const matchQ = p.nama.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q);
    return matchKat && matchQ;
  });
  if (sort === "low") hasil.sort((a,b) => hargaDiskon(a) - hargaDiskon(b));
  if (sort === "high") hasil.sort((a,b) => hargaDiskon(b) - hargaDiskon(a));
  if (sort === "diskon") hasil.sort((a,b) => b.diskon - a.diskon);
  renderProduk(hasil, 1);
}

function setKategori(kat, el) {
  kategoriAktif = kat;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
  filterProduk();
}

// ==============================================
// 3. KERANJANG FUNCTIONS
// ==============================================

function tambahKeranjang(id) {
  const p = db.find(x => x.id === id);
  const exist = keranjang.find(x => x.id === id);
  if (exist) {
    exist.qty++;
  } else {
    keranjang.push({ ...p, qty: 1 });
  }
  updateBadge();
  showToast(`✅ "${p.nama}" ditambahkan ke keranjang`);
}

function updateBadge() {
  const total = keranjang.reduce((s, x) => s + x.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (badge) badge.textContent = total;
}

function bukaKeranjang() {
  renderKeranjang();
  const modal = document.getElementById("modalKeranjang");
  if (modal) modal.classList.add("open");
}

function tutupKeranjang() {
  const modal = document.getElementById("modalKeranjang");
  if (modal) modal.classList.remove("open");
}

function renderKeranjang() {
  const el = document.getElementById("cartContent");
  const totalEl = document.getElementById("cartTotal");
  const btnCKO = document.getElementById("btnCKO");
  if (!el) return;
  
  if (!keranjang.length) {
    el.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div><p>Keranjang masih kosong</p></div>`;
    if (totalEl) totalEl.innerHTML = "";
    if (btnCKO) btnCKO.style.display = "none";
    return;
  }
  
  el.innerHTML = keranjang.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nama}</div>
        <div class="cart-item-price">${formatRp(hargaDiskon(item))} / pcs</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="ubahQty(${item.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="ubahQty(${item.id},1)">+</button>
          <span style="font-size:0.82rem;color:var(--abu);margin-left:8px">= ${formatRp(hargaDiskon(item)*item.qty)}</span>
        </div>
      </div>
      <button class="btn-hapus" onclick="hapusItem(${item.id})">🗑 Hapus</button>
    </div>
  `).join("");
  
  const subtotal = keranjang.reduce((s, x) => s + hargaDiskon(x)*x.qty, 0);
  const potongan = Math.round(subtotal * diskonPromo / 100);
  const total = subtotal - potongan;
  
  if (totalEl) {
    totalEl.innerHTML = `
      <div>
        <div style="font-size:0.82rem;color:var(--abu)">Subtotal: ${formatRp(subtotal)}</div>
        ${diskonPromo > 0 ? `<div style="font-size:0.82rem;color:green">Diskon promo (${diskonPromo}%): -${formatRp(potongan)}</div>` : ""}
      </div>
      <strong>Total: ${formatRp(total)}</strong>
    `;
  }
  if (btnCKO) btnCKO.style.display = "block";
}

function ubahQty(id, delta) {
  const item = keranjang.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    keranjang = keranjang.filter(x => x.id !== id);
  }
  updateBadge();
  renderKeranjang();
}

function hapusItem(id) {
  keranjang = keranjang.filter(x => x.id !== id);
  updateBadge();
  renderKeranjang();
}

function applyPromo() {
  const kode = document.getElementById("promoInput").value.toUpperCase().trim();
  const statusEl = document.getElementById("promoStatus");
  if (promoDb[kode]) {
    diskonPromo = promoDb[kode];
    statusEl.className = "promo-status ok";
    statusEl.textContent = `✅ Kode berhasil! Diskon ${diskonPromo}% diterapkan.`;
  } else {
    diskonPromo = 0;
    statusEl.className = "promo-status err";
    statusEl.textContent = "❌ Kode promo tidak valid.";
  }
  renderKeranjang();
}

function toggleMenu() {
  const nl = document.querySelector(".nav-links");
  if (!nl) return;
  if (nl.style.display === "flex") {
    nl.style.display = "none";
  } else {
    nl.style.display = "flex";
    nl.style.flexDirection = "column";
    nl.style.position = "fixed";
    nl.style.top = "65px";
    nl.style.left = "0";
    nl.style.right = "0";
    nl.style.background = "rgba(26,18,9,0.98)";
    nl.style.padding = "20px 5%";
    nl.style.zIndex = "998";
    nl.style.gap = "1.2rem";
  }
}

// ==============================================
// 4. CHECKOUT FUNCTIONS
// ==============================================

function bukaCKO() {
  tutupKeranjang();
  const subtotal = keranjang.reduce((s, x) => s + hargaDiskon(x)*x.qty, 0);
  const potongan = Math.round(subtotal * diskonPromo / 100);
  const total = subtotal - potongan;
  const totalItem = keranjang.reduce((s, x) => s + x.qty, 0);
  
  const dashJml = document.getElementById("dashJml");
  const dashSubtotal = document.getElementById("dashSubtotal");
  const dashTotal = document.getElementById("dashTotal");
  const dashItems = document.getElementById("dashItems");
  
  if (dashJml) dashJml.textContent = totalItem;
  if (dashSubtotal) dashSubtotal.textContent = formatRp(subtotal);
  if (dashTotal) dashTotal.textContent = formatRp(total);
  if (dashItems) {
    dashItems.innerHTML = keranjang.map(x =>
      `${x.icon} ${x.nama} <span style="float:right">${x.qty} × ${formatRp(hargaDiskon(x))}</span>`
    ).join("<br>") + (diskonPromo > 0 ? `<br><span style="color:#4ade80">🏷 Promo -${diskonPromo}% = -${formatRp(potongan)}</span>` : "");
  }
  
  const modal = document.getElementById("modalCKO");
  if (modal) modal.classList.add("open");
}

function tutupCKO() {
  const modal = document.getElementById("modalCKO");
  if (modal) modal.classList.remove("open");
}

function pilihBayar(metode, el) {
  metodeBayar = metode;
  document.querySelectorAll(".pay-item").forEach(x => x.classList.remove("selected"));
  if (el) el.classList.add("selected");
  
  const danaInfo = document.getElementById("danaInfo");
  const qrisBox = document.getElementById("qrisBox");
  
  if (danaInfo) {
    danaInfo.className = metode === "DANA" ? "dana-info show" : "dana-info";
  }
  if (qrisBox) {
    qrisBox.className = metode === "QRIS" ? "qris-box show" : "qris-box";
  }
}

function kirimWA() {
  const nama = document.getElementById("ckoNama").value.trim();
  const hp = document.getElementById("ckoHP").value.trim();
  const alamat = document.getElementById("ckoAlamat").value.trim();
  const ekspedisi = document.getElementById("ckoEkspedisi").value;
  const catatan = document.getElementById("ckoCatatan").value.trim();
  
  if (!nama || !hp || !alamat || !ekspedisi) {
    showToast("⚠️ Mohon lengkapi semua data!"); 
    return;
  }
  
  const subtotal = keranjang.reduce((s, x) => s + hargaDiskon(x)*x.qty, 0);
  const potongan = Math.round(subtotal * diskonPromo / 100);
  const total = subtotal - potongan;
  const itemsList = keranjang.map(x => `• ${x.nama} ×${x.qty} = ${formatRp(hargaDiskon(x)*x.qty)}`).join("\n");
  const promoInfo = diskonPromo > 0 ? `\n💸 Kode Promo: -${diskonPromo}% (-${formatRp(potongan)})` : "";
  
  const msg = `Halo YM FURNITUR 👋

Saya ingin memesan mebel:

📦 *PESANAN:*
${itemsList}${promoInfo}
💰 *Total: ${formatRp(total)}*

📋 *DATA PEMESAN:*
Nama: ${nama}
No. HP: ${hp}
Alamat: ${alamat}
Ekspedisi: ${ekspedisi}
Pembayaran: DANA 088980723930
${catatan ? "Catatan: " + catatan : ""}

Terima kasih 🙏`;
  
  window.open("https://wa.me/6288980723930?text=" + encodeURIComponent(msg), "_blank");
}

function pesanWA(id) {
  const p = db.find(x => x.id === id);
  const msg = `Halo YM FURNITUR 👋\nSaya tertarik dengan:\n\n🪑 *${p.nama}*\nHarga: ${formatRp(hargaDiskon(p))}${p.diskon>0?" (diskon "+p.diskon+"%)":""}\n\nBoleh info ketersediaan dan detail pengiriman? 🙏`;
  window.open("https://wa.me/6288980723930?text=" + encodeURIComponent(msg), "_blank");
}

// ==============================================
// 5. TESTIMONI
// ==============================================

const testiData = [
  { nama:"Budi Santoso", kota:"Jakarta Selatan", bintang:5, teks:"Kursi tamu ukir yang saya beli sangat memuaskan! Kualitas kayu jatinya berat dan kokoh, ukiran sangat halus. Pengiriman cargo-nya aman, tidak ada yang cacat." },
  { nama:"Siti Rahayu", kota:"Surabaya", bintang:5, teks:"Sudah 3x pesan di sini untuk renovasi rumah. Meja makan, lemari, dan tempat tidur semua bagus. Pelayanannya ramah dan responsif via WhatsApp." },
  { nama:"Hendra Wijaya", kota:"Bandung", bintang:5, teks:"Custom order lemari 5 pintu sesuai ukuran ruangan saya, hasilnya luar biasa! Pengerjaan rapi, finishing bersih. Worth the price!" },
  { nama:"Dewi Kusuma", kota:"Yogyakarta", bintang:4, teks:"Kitchen set dari YM FURNITUR kualitasnya di atas ekspektasi. Material kuat, warna sesuai sample. Pengiriman tepat waktu." },
  { nama:"Agus Prabowo", kota:"Medan", bintang:5, teks:"Sofa jati yang saya beli sudah 5 tahun masih bagus banget! Sangat rekomendasikan buat yang mau investasi furniture tahan lama." },
  { nama:"Rina Marlina", kota:"Makassar", bintang:5, teks:"Harga terjangkau tapi kualitas premium. Bisa custom warna finishing juga. Admin responsif dan sabar menjelaskan. Pasti balik lagi!" },
];

let testiCurrentPage = 1;
const testiPerPage = 6;

function renderTesti(page = 1) {
  const grid = document.getElementById("testiGrid");
  const pagination = document.getElementById("testiPagination");
  if (!grid) return;
  
  const totalItems = testiData.length;
  const totalPages = Math.ceil(totalItems / testiPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  testiCurrentPage = page;
  
  const start = (page - 1) * testiPerPage;
  const end = start + testiPerPage;
  const pageData = testiData.slice(start, end);
  
  grid.innerHTML = pageData.map(t => `
    <div class="testi-card">
      <div class="testi-stars">${"⭐".repeat(t.bintang)}</div>
      <p class="testi-text">"${t.teks}"</p>
      <div class="testi-avatar">
        <div class="avatar-circle">${t.nama.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
        <div>
          <div class="testi-name">${t.nama}</div>
          <div class="testi-loc">📍 ${t.kota}</div>
        </div>
      </div>
    </div>
  `).join('');
  
  if (pagination) {
    renderPagination(pagination, totalPages, page, 'testi');
  }
}

// ==============================================
// 6. GALERI
// ==============================================

const galeriData = [
  "https://i.ibb.co.com/BHqVmDMt/download.jpg",
  "https://i.ibb.co.com/35bRqKfp/download.jpg",
  "https://i.ibb.co.com/QjHy80X4/download.jpg",
  "https://i.ibb.co.com/Xx8d8fmQ/download.jpg",
  "https://i.ibb.co.com/fVwF5Yj8/download.jpg",
  "https://i.ibb.co.com/xtGFVyGH/download.jpg",
  "https://i.ibb.co.com/Y7xw4DPf/download.jpg",
  "https://i.ibb.co.com/Y73nsryF/download.jpg",
  "https://i.ibb.co.com/5hcMPMnx/download.jpg",
  "https://i.ibb.co.com/39cMJK7c/download.jpg",
  "https://i.ibb.co.com/9H7tdRY9/download.jpg",
  "https://i.ibb.co.com/xtyhnk3H/download.jpg"
];

let galeriCurrentPage = 1;
const galeriPerPage = 6;

function renderGaleri(page = 1) {
  const grid = document.getElementById("galeriGrid");
  const pagination = document.getElementById("galeriPagination");
  if (!grid) return;
  
  const totalItems = galeriData.length;
  const totalPages = Math.ceil(totalItems / galeriPerPage);
  
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  galeriCurrentPage = page;
  
  const start = (page - 1) * galeriPerPage;
  const end = start + galeriPerPage;
  const pageData = galeriData.slice(start, end);
  
  grid.innerHTML = pageData.map(img => `
    <div class="galeri-item" style="padding:0;background:none;">
      <img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    </div>
  `).join('');
  
  if (pagination) {
    renderPagination(pagination, totalPages, page, 'galeri');
  }
}

// ==============================================
// 7. PAGINATION HELPER
// ==============================================

function renderPagination(container, totalPages, currentPage, type) {
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '';
  
  html += `<button class="pagination-btn" onclick="changePage(${currentPage - 1}, '${type}')" ${currentPage <= 1 ? 'disabled' : ''}>«</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="pagination-btn active">${i}</button>`;
    } else {
      html += `<button class="pagination-btn" onclick="changePage(${i}, '${type}')">${i}</button>`;
    }
  }
  
  html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1}, '${type}')" ${currentPage >= totalPages ? 'disabled' : ''}>»</button>`;
  html += `<span class="pagination-info">Halaman ${currentPage} dari ${totalPages}</span>`;
  
  container.innerHTML = html;
}

function changePage(page, type) {
  if (type === 'produk') {
    renderProduk(filteredData, page);
  } else if (type === 'testi') {
    renderTesti(page);
  } else if (type === 'galeri') {
    renderGaleri(page);
  }
}

// ==============================================
// 8. UTILS
// ==============================================

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(function() {
    t.classList.remove("show");
  }, 2800);
}

function copyKode(kode) {
  navigator.clipboard.writeText(kode).catch(function() {});
  const promoInput = document.getElementById("promoInput");
  if (promoInput) promoInput.value = kode;
  showToast(`📋 Kode "${kode}" disalin! Tempel saat checkout.`);
}

// ==============================================
// 9. SUPABASE AUTH - USER SESSION & LOGIN
// ==============================================

// ===== CEK SESSION SAAT HALAMAN DIMUAT =====
document.addEventListener('DOMContentLoaded', async function() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    tampilkanUser(session.user);
  }
});

// ===== TAMPILKAN PROFIL USER DI NAVBAR =====
function tampilkanUser(user) {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;
  
  const nama = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';
  const foto = user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nama);
  
  authArea.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;cursor:pointer;">
      <img src="${foto}" style="width:35px;height:35px;border-radius:50%;object-fit:cover;border:2px solid var(--emas);">
      <span style="color:var(--cream);font-size:0.9rem;">${nama}</span>
      <button onclick="logoutUser()" style="border:none;background:var(--emas);color:var(--hitam);padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">Logout</button>
    </div>
  `;
}

// ===== LOGOUT =====
async function logoutUser() {
  await supabase.auth.signOut();
  sessionStorage.clear();
  localStorage.removeItem('ym_remember_email');
  location.reload();
}

// ==============================================
// 10. SUPABASE AUTH - REGISTER, LOGIN, FORGOT
// ==============================================

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// ===== REGISTER =====
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('regNama').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    if (nama === '') {
      if (errorMsg) { errorMsg.textContent = 'Nama lengkap harus diisi!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (email === '' || !email.includes('@')) {
      if (errorMsg) { errorMsg.textContent = 'Email tidak valid!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (phone === '') {
      if (errorMsg) { errorMsg.textContent = 'Nomor telepon harus diisi!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (password.length < 8) {
      if (errorMsg) { errorMsg.textContent = 'Password minimal 8 karakter!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (password !== confirm) {
      if (errorMsg) { errorMsg.textContent = 'Password dan konfirmasi tidak cocok!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nama_lengkap: nama,
            phone: phone,
            role: 'user'
          }
        }
      });
      
      if (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.style.display = 'block';
        }
        return;
      }
      
      if (successMsg) {
        successMsg.textContent = 'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.';
        successMsg.style.display = 'block';
      }
      
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 3000);
      
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        errorMsg.style.display = 'block';
      }
    }
  });
}

// ===== LOGIN =====
if (document.getElementById('loginForm')) {
  const savedEmail = localStorage.getItem('ym_remember_email');
  if (savedEmail) {
    const emailInput = document.getElementById('loginEmail');
    const rememberCheck = document.getElementById('rememberMe');
    if (emailInput) emailInput.value = savedEmail;
    if (rememberCheck) rememberCheck.checked = true;
  }
  
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    
    if (email === '' || password === '') {
      if (errorMsg) { errorMsg.textContent = 'Email dan password harus diisi!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.style.display = 'block';
        }
        return;
      }
      
      if (rememberMe) {
        localStorage.setItem('ym_remember_email', email);
      } else {
        localStorage.removeItem('ym_remember_email');
      }
      
      if (data.session) {
        sessionStorage.setItem('supabase_session', JSON.stringify(data.session));
        sessionStorage.setItem('ym_email', email);
        sessionStorage.setItem('ym_nama', data.user.user_metadata?.nama_lengkap || 'User');
        sessionStorage.setItem('ym_login_time', new Date().toISOString());
      }
      
      // Redirect ke halaman utama
      window.location.href = 'index.html';
      
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        errorMsg.style.display = 'block';
      }
    }
  });
}

// ===== LOGIN GOOGLE =====
document.querySelectorAll('.btn-google').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/index.html'
        }
      });
      
      if (error) {
        alert('Gagal login dengan Google: ' + error.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  });
});

// ===== FORGOT PASSWORD =====
if (document.getElementById('forgotForm')) {
  document.getElementById('forgotForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    if (email === '' || !email.includes('@')) {
      if (errorMsg) { errorMsg.textContent = 'Masukkan email yang valid!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      
      if (error) {
        if (errorMsg) {
          errorMsg.textContent = error.message;
          errorMsg.style.display = 'block';
        }
        return;
      }
      
      if (successMsg) {
        successMsg.textContent = `Link reset password telah dikirim ke ${email}`;
        successMsg.style.display = 'block';
      }
      
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 3000);
      
    } catch (err) {
      if (errorMsg) {
        errorMsg.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        errorMsg.style.display = 'block';
      }
    }
  });
}

// ==============================================
// 11. ADMIN AUTH (Manual - localStorage)
// ==============================================

if (document.getElementById('adminRegisterForm')) {
  document.getElementById('adminRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('adminNama').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    const confirm = document.getElementById('adminConfirm').value;
    
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    
    if (errorMsg) errorMsg.style.display = 'none';
    if (successMsg) successMsg.style.display = 'none';
    
    if (nama === '') {
      if (errorMsg) { errorMsg.textContent = 'Nama lengkap harus diisi!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (email === '' || !email.includes('@')) {
      if (errorMsg) { errorMsg.textContent = 'Email tidak valid!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (password.length < 8) {
      if (errorMsg) { errorMsg.textContent = 'Password minimal 8 karakter!'; errorMsg.style.display = 'block'; }
      return;
    }
    if (password !== confirm) {
      if (errorMsg) { errorMsg.textContent = 'Password dan konfirmasi tidak cocok!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    let admins = JSON.parse(localStorage.getItem('ym_admins')) || [];
    if (admins.find(a => a.email === email)) {
      if (errorMsg) { errorMsg.textContent = 'Email admin sudah terdaftar!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    admins.push({
      id: Date.now().toString(),
      email: email,
      password: btoa(password),
      nama_lengkap: nama,
      role: 'admin',
      sid: '',
      last_login: null,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('ym_admins', JSON.stringify(admins));
    
    if (successMsg) {
      successMsg.textContent = 'Pendaftaran admin berhasil! Silakan login.';
      successMsg.style.display = 'block';
    }
    
    setTimeout(function() {
      window.location.href = 'admin-login.html';
    }, 2000);
  });
}

if (document.getElementById('adminLoginForm')) {
  document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    const errorMsg = document.getElementById('errorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    
    if (email === '' || password === '') {
      if (errorMsg) { errorMsg.textContent = 'Email dan password harus diisi!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    const admins = JSON.parse(localStorage.getItem('ym_admins')) || [];
    const admin = admins.find(a => a.email === email && atob(a.password) === password);
    
    if (!admin) {
      if (errorMsg) { errorMsg.textContent = 'Email atau password salah!'; errorMsg.style.display = 'block'; }
      return;
    }
    
    const sid = 'SID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const loginTime = new Date().toISOString();
    
    admin.sid = sid;
    admin.last_login = loginTime;
    localStorage.setItem('ym_admins', JSON.stringify(admins));
    
    sessionStorage.setItem('ym_sid', sid);
    sessionStorage.setItem('ym_email', email);
    sessionStorage.setItem('ym_nama', admin.nama_lengkap);
    sessionStorage.setItem('ym_login_time', loginTime);
    
    window.location.href = 'dashboard.html';
  });
}

// ==============================================
// 12. DASHBOARD ADMIN
// ==============================================

if (window.location.pathname.includes('dashboard.html')) {
  const sidSession = sessionStorage.getItem('ym_sid');
  
  if (!sidSession) {
    alert('Silakan login sebagai admin terlebih dahulu!');
    window.location.href = 'admin-login.html';
  } else {
    const admins = JSON.parse(localStorage.getItem('ym_admins')) || [];
    const admin = admins.find(a => a.sid === sidSession);
    
    if (!admin) {
      alert('Sesi admin tidak valid! Silakan login kembali.');
      sessionStorage.clear();
      window.location.href = 'admin-login.html';
    } else {
      const adminName = document.getElementById('adminName');
      const sidDisplay = document.getElementById('sidDisplay');
      const sidDetail = document.getElementById('sidDetail');
      const loginTime = document.getElementById('loginTime');
      
      if (adminName) adminName.textContent = admin.nama_lengkap;
      if (sidDisplay) sidDisplay.textContent = sidSession;
      if (sidDetail) sidDetail.textContent = sidSession;
      if (loginTime) {
        loginTime.textContent = new Date(admin.last_login).toLocaleString('id-ID');
      }
      
      function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
        const clockDisplay = document.getElementById('clockDisplay');
        const lastActive = document.getElementById('lastActive');
        if (clockDisplay) clockDisplay.textContent = timeString;
        if (lastActive) lastActive.textContent = timeString;
      }
      updateClock();
      setInterval(updateClock, 1000);
      
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        var modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'logoutModal';
        modal.innerHTML = `
          <div class="modal-box">
            <h3>🔄 Konfirmasi Logout</h3>
            <p>Apakah Anda yakin ingin keluar dari dashboard admin?</p>
            <div class="btn-group">
              <button class="btn-cancel" id="cancelLogout">Batal</button>
              <button class="btn-confirm" id="confirmLogout">Logout</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        logoutBtn.addEventListener('click', function() {
          modal.classList.add('show');
        });
        
        document.getElementById('cancelLogout').addEventListener('click', function() {
          modal.classList.remove('show');
        });
        
        document.getElementById('confirmLogout').addEventListener('click', function() {
          const admins = JSON.parse(localStorage.getItem('ym_admins')) || [];
          const idx = admins.findIndex(a => a.sid === sidSession);
          if (idx !== -1) {
            admins[idx].sid = '';
            localStorage.setItem('ym_admins', JSON.stringify(admins));
          }
          sessionStorage.clear();
          modal.classList.remove('show');
          window.location.href = 'admin-login.html';
        });
        
        modal.addEventListener('click', function(e) {
          if (e.target === modal) modal.classList.remove('show');
        });
      }
      
      function checkSessionExpiry() {
        const loginTimeStr = sessionStorage.getItem('ym_login_time');
        if (!loginTimeStr) return;
        const loginTime = new Date(loginTimeStr);
        const now = new Date();
        const diffHours = (now - loginTime) / (1000 * 60 * 60);
        if (diffHours >= 24) {
          alert('Sesi Anda telah habis (24 jam). Silakan login kembali.');
          const confirmBtn = document.getElementById('confirmLogout');
          if (confirmBtn) confirmBtn.click();
        }
      }
      setInterval(checkSessionExpiry, 5 * 60 * 1000);
    }
  }
}

// ==============================================
// 13. VIDEO LOAD
// ==============================================

(function() {
  const vid = document.getElementById('aboutVideo');
  if (!vid) return;
  
  const videoUrl = 'https://stream.mux.com/L8373cixqirr5gkbskrp9niE2AxtxWWzG01C3ytzqo01M.m3u8';
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(vid);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      vid.play().catch(function() {});
    });
  } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
    vid.src = videoUrl;
    vid.addEventListener('loadedmetadata', function() {
      vid.play().catch(function() {});
    });
  }
})();

// ==============================================
// 14. FINAL INIT
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  const modalKeranjang = document.getElementById("modalKeranjang");
  if (modalKeranjang) {
    modalKeranjang.addEventListener("click", function(e) {
      if (e.target === this) tutupKeranjang();
    });
  }

  const modalCKO = document.getElementById("modalCKO");
  if (modalCKO) {
    modalCKO.addEventListener("click", function(e) {
      if (e.target === this) tutupCKO();
    });
  }

  renderProduk(db, 1);
  renderTesti(1);
  renderGaleri(1);
});

// ==============================================
// END OF SCRIPT
// ==============================================