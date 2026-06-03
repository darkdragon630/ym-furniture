// ==============================================
// CART.JS - PRODUK, KERANJANG, CHECKOUT, TESTIMONI, GALERI
// ==============================================

// ========== IMAGE MAP ==========
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

// ========== DATABASE PRODUK (Dari Supabase) ==========
let db = [];

// ========== DATABASE TESTIMONI (Dari Supabase) ==========
let testiData = [];

// ========== LOAD PRODUK DARI SUPABASE ==========
async function loadProdukFromDB() {
    const supabase = window.supabase;
    if (!supabase) {
        console.error('Supabase tidak tersedia');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('produk')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Gagal load produk:', error);
            return;
        }
        
        db = data;
        console.log('Produk loaded dari Supabase:', db.length);
        
        // Render produk setelah data dimuat
        renderProduk(db, 1);
    } catch (err) {
        console.error('Error load produk:', err);
    }
}

// ========== LOAD TESTIMONI DARI SUPABASE ==========
async function loadTestimoniFromDB() {
    const supabase = window.supabase;
    if (!supabase) {
        console.error('Supabase tidak tersedia');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('testimoni')
            .select('*')
            .order('id', { ascending: false });
        
        if (error) {
            console.error('Gagal load testimoni:', error);
            return;
        }
        
        testiData = data;
        console.log('Testimoni loaded dari Supabase:', testiData.length);
        
        // Render testimoni setelah data dimuat
        renderTesti(1);
    } catch (err) {
        console.error('Error load testimoni:', err);
    }
}

// ========== PROMO DATABASE ==========
let promoDb = {};

// ========== LOAD PROMO DARI SUPABASE ==========
async function loadPromo() {
    const supabase = window.supabase;
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('promo')
            .select('*')
            .eq('aktif', true);
        
        if (error) {
            console.error('Gagal load promo:', error);
            return;
        }
        
        // Convert ke object { KODE: diskon }
        promoDb = {};
        data.forEach(p => {
            promoDb[p.kode] = p.diskon;
        });
        console.log('Promo loaded:', promoDb);
    } catch (err) {
        console.error('Error load promo:', err);
    }
}

// ========== KERANJANG & VARIABEL ==========
let keranjang = [];
let diskonPromo = 0;
let metodeBayar = "";
let kategoriAktif = "all";

// ========== FUNGSI HELPER ==========
function hargaDiskon(p) {
  return p.diskon > 0 ? Math.round(p.harga * (1 - p.diskon/100)) : p.harga;
}

function formatRp(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ========== LOAD KERANJANG DARI LOCALSTORAGE ==========
function loadKeranjang() {
    const saved = localStorage.getItem('ym_keranjang');
    if (saved) {
        try {
            keranjang = JSON.parse(saved);
            updateBadge();
        } catch (e) {
            console.error('Error loading cart:', e);
            keranjang = [];
        }
    }
}

// ========== SIMPAN KERANJANG KE LOCALSTORAGE ==========
function saveKeranjang() {
    localStorage.setItem('ym_keranjang', JSON.stringify(keranjang));
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
  saveKeranjang(); // Simpan ke localStorage
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
  saveKeranjang(); // Simpan ke localStorage
  renderKeranjang();
}

function hapusItem(id) {
  keranjang = keranjang.filter(x => x.id !== id);
  updateBadge();
  saveKeranjang(); // Simpan ke localStorage
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
// 9. VIDEO LOAD
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
// 10. REALTIME SUBSCRIPTION
// ==============================================

function subscribeRealtime() {
    const supabase = window.supabase;
    if (!supabase) return;
    
    // Subscribe ke tabel produk
    supabase
        .channel('produk-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'produk' },
            (payload) => {
                console.log('🔄 Produk berubah:', payload);
                loadProdukFromDB();
            }
        )
        .subscribe();

    // Subscribe ke tabel testimoni
    supabase
        .channel('testimoni-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'testimoni' },
            (payload) => {
                console.log('🔄 Testimoni berubah:', payload);
                loadTestimoniFromDB();
            }
        )
        .subscribe();

    // Subscribe ke tabel promo
    supabase
        .channel('promo-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'promo' },
            (payload) => {
                console.log('🔄 Promo berubah:', payload);
                loadPromo();
            }
        )
        .subscribe();
}

// ==============================================
// 11. INIT
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load keranjang dari localStorage
    loadKeranjang();
    
    // Load produk dari Supabase
    loadProdukFromDB();
    
    // Load testimoni dari Supabase
    loadTestimoniFromDB();
    
    // Load promo dari Supabase
    loadPromo();
    
    // Subscribe ke realtime
    subscribeRealtime();
    
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

    renderGaleri(1);
});

// ==============================================
// END OF SCRIPT
// ==============================================