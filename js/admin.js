// ==============================================
// ADMIN.JS - FULL ADMIN DASHBOARD (Dengan Persistensi & Realtime)
// ==============================================

// ===== SUPABASE INIT =====
const supabaseClient = window.supabase;

// ===== SESSION CHECK =====
const sidSession = sessionStorage.getItem('ym_sid');
if (!sidSession) {
    window.location.href = 'admin-login.html';
}

// ===== TAMPILKAN SID =====
function tampilkanSID() {
    const sid = sessionStorage.getItem('ym_sid');
    const sidDisplay = document.getElementById('sidDisplay');
    if (sid && sidDisplay) {
        sidDisplay.textContent = sid;
        console.log('✅ SID ditampilkan:', sid);
    } else {
        console.error('❌ Gagal menampilkan SID. Elemen tidak ditemukan atau SID kosong.');
    }
}

// ===== NOTIFICATION HELPER =====
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifikasiList');
    if (!container) return;
    const div = document.createElement('div');
    div.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        border-left: 4px solid ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6'};
        background: var(--putih);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;
    div.innerHTML = `
        <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}</strong>
        <small style="display:block;color:var(--abu);font-size:0.8rem;margin-top:4px;">${new Date().toLocaleString()}</small>
    `;
    container.prepend(div);
}

// ===== LOG ACTIVITY =====
async function logActivity(aksi, detail = '') {
    try {
        const { error } = await supabaseClient
            .from('aktivitas_log')
            .insert([{ 
                admin_email: sessionStorage.getItem('ym_email'), 
                aksi, 
                detail 
            }]);
        if (error) console.error('Log error:', error);
    } catch (err) {
        console.error('Log error:', err);
    }
}

// ==============================================
// 1. PRODUK CRUD (Dengan Cache)
// ==============================================

async function loadProduk() {
    // Coba load dari localStorage dulu
    const cached = localStorage.getItem('ym_produk_cache');
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderProdukTable(data);
            const totalEl = document.getElementById('totalProduk');
            if (totalEl) totalEl.textContent = data.length;
            console.log('📦 Produk dari cache:', data.length);
        } catch (e) {
            console.warn('Cache produk rusak, reload dari server');
        }
    }
    
    // Load dari Supabase (update cache)
    const { data, error } = await supabaseClient
        .from('produk')
        .select('*')
        .order('id', { ascending: false });
    if (error) return showNotification('Gagal load produk: ' + error.message, 'error');
    
    // Simpan ke localStorage
    localStorage.setItem('ym_produk_cache', JSON.stringify(data));
    renderProdukTable(data);
    const totalEl = document.getElementById('totalProduk');
    if (totalEl) totalEl.textContent = data.length;
    console.log('📦 Produk dari Supabase:', data.length);
}

function renderProdukTable(produk) {
    const tbody = document.getElementById('produkTableBody');
    if (!tbody) return;
    tbody.innerHTML = produk.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>
                ${p.gambar 
                    ? `<img src="${p.gambar}" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">` 
                    : '❌'}
            </td>
            <td><strong>${p.nama}</strong></td>
            <td><span class="badge">${p.kategori}</span></td>
            <td>Rp ${p.harga.toLocaleString()}</td>
            <td>${p.diskon > 0 ? `${p.diskon}%` : '-'}</td>
            <td>
                <button class="btn-small" onclick="editProduk(${p.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small btn-danger" onclick="hapusProduk(${p.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function simpanProduk(e) {
    e.preventDefault();
    const id = document.getElementById('produkId').value;
    const data = {
        nama: document.getElementById('produkNama').value,
        kategori: document.getElementById('produkKategori').value,
        harga: parseInt(document.getElementById('produkHarga').value),
        diskon: parseInt(document.getElementById('produkDiskon').value) || 0,
        deskripsi: document.getElementById('produkDeskripsi').value,
        gambar: document.getElementById('produkGambar').value,
        baru: document.getElementById('produkBaru').checked
    };
    if (id) {
        const { error } = await supabaseClient.from('produk').update(data).eq('id', id);
        if (error) return showNotification('Gagal update: ' + error.message, 'error');
        showNotification('Produk berhasil diupdate!', 'success');
        await logActivity('Edit Produk', `Produk: ${data.nama}`);
    } else {
        const { error } = await supabaseClient.from('produk').insert([data]);
        if (error) return showNotification('Gagal tambah: ' + error.message, 'error');
        showNotification('Produk berhasil ditambahkan!', 'success');
        await logActivity('Tambah Produk', `Produk: ${data.nama}`);
    }
    closeModal('produkModal');
    // Hapus cache agar reload ulang
    localStorage.removeItem('ym_produk_cache');
    loadProduk();
}

async function editProduk(id) {
    const { data, error } = await supabaseClient.from('produk').select('*').eq('id', id).single();
    if (error) return showNotification('Gagal load data: ' + error.message, 'error');
    document.getElementById('produkId').value = data.id;
    document.getElementById('produkNama').value = data.nama;
    document.getElementById('produkKategori').value = data.kategori;
    document.getElementById('produkHarga').value = data.harga;
    document.getElementById('produkDiskon').value = data.diskon;
    document.getElementById('produkDeskripsi').value = data.deskripsi;
    document.getElementById('produkGambar').value = data.gambar || '';
    document.getElementById('produkBaru').checked = data.baru || false;
    document.getElementById('produkModalTitle').textContent = 'Edit Produk';
    openModal('produkModal');
}

async function hapusProduk(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const { error } = await supabaseClient.from('produk').delete().eq('id', id);
    if (error) return showNotification('Gagal hapus: ' + error.message, 'error');
    showNotification('Produk berhasil dihapus!', 'success');
    await logActivity('Hapus Produk', `ID: ${id}`);
    localStorage.removeItem('ym_produk_cache');
    loadProduk();
}

// ==============================================
// 2. KATEGORI CRUD (Dengan Cache)
// ==============================================

async function loadKategori() {
    // Coba load dari localStorage dulu
    const cached = localStorage.getItem('ym_kategori_cache');
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderKategoriTable(data);
            // Populate kategori dropdown
            const select = document.getElementById('produkKategori');
            if (select) {
                select.innerHTML = data.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
            }
            console.log('🏷️ Kategori dari cache:', data.length);
        } catch (e) {
            console.warn('Cache kategori rusak, reload dari server');
        }
    }
    
    // Load dari Supabase (update cache)
    const { data, error } = await supabaseClient
        .from('kategori')
        .select('*')
        .order('id', { ascending: false });
    if (error) return showNotification('Gagal load kategori: ' + error.message, 'error');
    
    // Simpan ke localStorage
    localStorage.setItem('ym_kategori_cache', JSON.stringify(data));
    renderKategoriTable(data);
    const select = document.getElementById('produkKategori');
    if (select) {
        select.innerHTML = data.map(k => `<option value="${k.nama}">${k.nama}</option>`).join('');
    }
    console.log('🏷️ Kategori dari Supabase:', data.length);
}

function renderKategoriTable(kategori) {
    const tbody = document.getElementById('kategoriTableBody');
    if (!tbody) return;
    tbody.innerHTML = kategori.map(k => `
        <tr>
            <td>${k.id}</td>
            <td><strong>${k.nama}</strong></td>
            <td>${k.jumlah_produk || 0}</td>
            <td>
                <button class="btn-small" onclick="editKategori(${k.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small btn-danger" onclick="hapusKategori(${k.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function simpanKategori(e) {
    e.preventDefault();
    const id = document.getElementById('kategoriId').value;
    const nama = document.getElementById('kategoriNama').value;
    if (id) {
        const { error } = await supabaseClient.from('kategori').update({ nama }).eq('id', id);
        if (error) return showNotification('Gagal update: ' + error.message, 'error');
        showNotification('Kategori berhasil diupdate!', 'success');
    } else {
        const { error } = await supabaseClient.from('kategori').insert([{ nama }]);
        if (error) return showNotification('Gagal tambah: ' + error.message, 'error');
        showNotification('Kategori berhasil ditambahkan!', 'success');
    }
    closeModal('kategoriModal');
    localStorage.removeItem('ym_kategori_cache');
    loadKategori();
}

async function editKategori(id) {
    const { data, error } = await supabaseClient.from('kategori').select('*').eq('id', id).single();
    if (error) return showNotification('Gagal load data: ' + error.message, 'error');
    document.getElementById('kategoriId').value = data.id;
    document.getElementById('kategoriNama').value = data.nama;
    openModal('kategoriModal');
}

async function hapusKategori(id) {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    const { error } = await supabaseClient.from('kategori').delete().eq('id', id);
    if (error) return showNotification('Gagal hapus: ' + error.message, 'error');
    showNotification('Kategori berhasil dihapus!', 'success');
    localStorage.removeItem('ym_kategori_cache');
    loadKategori();
}

// ==============================================
// 3. TRANSAKSI (Dengan Cache)
// ==============================================

async function loadTransaksi() {
    // Coba load dari localStorage dulu
    const cached = localStorage.getItem('ym_transaksi_cache');
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderTransaksiTable(data);
            const transaksiHariIni = document.getElementById('transaksiHariIni');
            const totalPendapatan = document.getElementById('totalPendapatan');
            if (transaksiHariIni) {
                transaksiHariIni.textContent = data.filter(t => 
                    new Date(t.created_at).toDateString() === new Date().toDateString()
                ).length;
            }
            if (totalPendapatan) {
                totalPendapatan.textContent = 'Rp ' + data.reduce((sum, t) => sum + t.total, 0).toLocaleString();
            }
            console.log('📊 Transaksi dari cache:', data.length);
        } catch (e) {
            console.warn('Cache transaksi rusak, reload dari server');
        }
    }
    
    // Load dari Supabase (update cache)
    const { data, error } = await supabaseClient
        .from('transaksi')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) return showNotification('Gagal load transaksi: ' + error.message, 'error');
    
    // Simpan ke localStorage
    localStorage.setItem('ym_transaksi_cache', JSON.stringify(data));
    renderTransaksiTable(data);
    const transaksiHariIni = document.getElementById('transaksiHariIni');
    const totalPendapatan = document.getElementById('totalPendapatan');
    if (transaksiHariIni) {
        transaksiHariIni.textContent = data.filter(t => 
            new Date(t.created_at).toDateString() === new Date().toDateString()
        ).length;
    }
    if (totalPendapatan) {
        totalPendapatan.textContent = 'Rp ' + data.reduce((sum, t) => sum + t.total, 0).toLocaleString();
    }
    console.log('📊 Transaksi dari Supabase:', data.length);
}

function renderTransaksiTable(transaksi) {
    const tbody = document.getElementById('transaksiTableBody');
    if (!tbody) return;
    tbody.innerHTML = transaksi.map(t => `
        <tr>
            <td><strong>${t.kode_transaksi}</strong></td>
            <td>${t.nama_pelanggan}</td>
            <td>Rp ${t.total.toLocaleString()}</td>
            <td>
                <select onchange="updateStatus(${t.id}, this.value)" class="status-select">
                    <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                    <option value="process" ${t.status === 'process' ? 'selected' : ''}>📦 Diproses</option>
                    <option value="shipped" ${t.status === 'shipped' ? 'selected' : ''}>🚚 Dikirim</option>
                    <option value="done" ${t.status === 'done' ? 'selected' : ''}>✅ Selesai</option>
                    <option value="cancel" ${t.status === 'cancel' ? 'selected' : ''}>❌ Batal</option>
                </select>
            </td>
            <td>${new Date(t.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn-small" onclick="lihatDetailTransaksi(${t.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateStatus(id, status) {
    const { error } = await supabaseClient.from('transaksi').update({ status }).eq('id', id);
    if (error) return showNotification('Gagal update status: ' + error.message, 'error');
    showNotification('Status transaksi berhasil diupdate!', 'success');
    await logActivity('Edit Status Transaksi', `ID: ${id} → ${status}`);
    localStorage.removeItem('ym_transaksi_cache');
    loadTransaksi();
}

async function lihatDetailTransaksi(id) {
    const { data, error } = await supabaseClient
        .from('detail_transaksi')
        .select('*, produk(*)')
        .eq('transaksi_id', id);
    if (error) return showNotification('Gagal load detail: ' + error.message, 'error');
    const total = data.reduce((sum, d) => sum + d.harga * d.qty, 0);
    alert(`
        Detail Transaksi ID: ${id}
        Total Item: ${data.length}
        Total: Rp ${total.toLocaleString()}
        
        ${data.map(d => `- ${d.produk.nama} × ${d.qty} = Rp ${(d.harga * d.qty).toLocaleString()}`).join('\n')}
    `);
}

// ==============================================
// 4. TESTIMONI CRUD (Dengan Cache)
// ==============================================

async function loadTestimoni() {
    // Coba load dari localStorage dulu
    const cached = localStorage.getItem('ym_testimoni_cache');
    if (cached) {
        try {
            const data = JSON.parse(cached);
            renderTestimoniTable(data);
            console.log('⭐ Testimoni dari cache:', data.length);
        } catch (e) {
            console.warn('Cache testimoni rusak, reload dari server');
        }
    }
    
    // Load dari Supabase (update cache)
    const { data, error } = await supabaseClient
        .from('testimoni')
        .select('*')
        .order('id', { ascending: false });
    if (error) return showNotification('Gagal load testimoni: ' + error.message, 'error');
    
    // Simpan ke localStorage
    localStorage.setItem('ym_testimoni_cache', JSON.stringify(data));
    renderTestimoniTable(data);
    console.log('⭐ Testimoni dari Supabase:', data.length);
}

function renderTestimoniTable(testimoni) {
    const tbody = document.getElementById('testimoniTableBody');
    if (!tbody) return;
    tbody.innerHTML = testimoni.map(t => `
        <tr>
            <td>${t.id}</td>
            <td><strong>${t.nama}</strong></td>
            <td>${t.kota || '-'}</td>
            <td>${'⭐'.repeat(t.bintang)}</td>
            <td>${t.teks.substring(0, 50)}${t.teks.length > 50 ? '...' : ''}</td>
            <td>
                <button class="btn-small" onclick="editTestimoni(${t.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small btn-danger" onclick="hapusTestimoni(${t.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function simpanTestimoni(e) {
    e.preventDefault();
    const id = document.getElementById('testimoniId').value;
    const data = {
        nama: document.getElementById('testimoniNama').value,
        kota: document.getElementById('testimoniKota').value,
        bintang: parseInt(document.getElementById('testimoniBintang').value),
        teks: document.getElementById('testimoniTeks').value
    };
    if (id) {
        const { error } = await supabaseClient.from('testimoni').update(data).eq('id', id);
        if (error) return showNotification('Gagal update: ' + error.message, 'error');
        showNotification('Testimoni berhasil diupdate!', 'success');
    } else {
        const { error } = await supabaseClient.from('testimoni').insert([data]);
        if (error) return showNotification('Gagal tambah: ' + error.message, 'error');
        showNotification('Testimoni berhasil ditambahkan!', 'success');
    }
    closeModal('testimoniModal');
    localStorage.removeItem('ym_testimoni_cache');
    loadTestimoni();
}

async function editTestimoni(id) {
    const { data, error } = await supabaseClient.from('testimoni').select('*').eq('id', id).single();
    if (error) return showNotification('Gagal load data: ' + error.message, 'error');
    document.getElementById('testimoniId').value = data.id;
    document.getElementById('testimoniNama').value = data.nama;
    document.getElementById('testimoniKota').value = data.kota || '';
    document.getElementById('testimoniBintang').value = data.bintang;
    document.getElementById('testimoniTeks').value = data.teks;
    openModal('testimoniModal');
}

async function hapusTestimoni(id) {
    if (!confirm('Yakin ingin menghapus testimoni ini?')) return;
    const { error } = await supabaseClient.from('testimoni').delete().eq('id', id);
    if (error) return showNotification('Gagal hapus: ' + error.message, 'error');
    showNotification('Testimoni berhasil dihapus!', 'success');
    localStorage.removeItem('ym_testimoni_cache');
    loadTestimoni();
}

// ==============================================
// 5. GRAFIK
// ==============================================

let chartInstance = null;

async function loadGrafik() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    const { data, error } = await supabaseClient
        .from('transaksi')
        .select('created_at, total')
        .order('created_at', { ascending: true });
    if (error) return showNotification('Gagal load data grafik: ' + error.message, 'error');
    
    // Group by date
    const grouped = {};
    data.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + t.total;
    });
    
    const labels = Object.keys(grouped);
    const values = Object.values(grouped);
    
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Penjualan (Rp)',
                data: values,
                backgroundColor: 'rgba(196, 154, 53, 0.5)',
                borderColor: '#C49A35',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ==============================================
// 6. PROMO CRUD
// ==============================================

async function loadPromo() {
    const { data, error } = await supabaseClient
        .from('promo')
        .select('*')
        .order('id', { ascending: false });
    if (error) return showNotification('Gagal load promo: ' + error.message, 'error');
    renderPromoTable(data);
}

function renderPromoTable(promo) {
    const tbody = document.getElementById('promoTableBody');
    if (!tbody) return;
    tbody.innerHTML = promo.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><strong>${p.kode}</strong></td>
            <td>${p.nama}</td>
            <td>${p.diskon}%</td>
            <td>${p.minimal_pembelian > 0 ? 'Rp ' + p.minimal_pembelian.toLocaleString() : '-'}</td>
            <td>
                <span class="badge ${p.aktif ? 'badge-success' : 'badge-danger'}">
                    ${p.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
            </td>
            <td>
                <button class="btn-small" onclick="editPromo(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-small btn-danger" onclick="hapusPromo(${p.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function simpanPromo(e) {
    e.preventDefault();
    const id = document.getElementById('promoId').value;
    const data = {
        kode: document.getElementById('promoKode').value.toUpperCase(),
        nama: document.getElementById('promoNama').value,
        diskon: parseInt(document.getElementById('promoDiskon').value),
        minimal_pembelian: parseInt(document.getElementById('promoMinimal').value) || 0,
        aktif: document.getElementById('promoAktif').checked
    };
    if (id) {
        const { error } = await supabaseClient.from('promo').update(data).eq('id', id);
        if (error) return showNotification('Gagal update: ' + error.message, 'error');
        showNotification('Promo berhasil diupdate!', 'success');
    } else {
        const { error } = await supabaseClient.from('promo').insert([data]);
        if (error) return showNotification('Gagal tambah: ' + error.message, 'error');
        showNotification('Promo berhasil ditambahkan!', 'success');
    }
    closeModal('promoModal');
    loadPromo();
}

async function editPromo(id) {
    const { data, error } = await supabaseClient.from('promo').select('*').eq('id', id).single();
    if (error) return showNotification('Gagal load data: ' + error.message, 'error');
    document.getElementById('promoId').value = data.id;
    document.getElementById('promoKode').value = data.kode;
    document.getElementById('promoNama').value = data.nama;
    document.getElementById('promoDiskon').value = data.diskon;
    document.getElementById('promoMinimal').value = data.minimal_pembelian;
    document.getElementById('promoAktif').checked = data.aktif;
    openModal('promoModal');
}

async function hapusPromo(id) {
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    const { error } = await supabaseClient.from('promo').delete().eq('id', id);
    if (error) return showNotification('Gagal hapus: ' + error.message, 'error');
    showNotification('Promo berhasil dihapus!', 'success');
    loadPromo();
}

// ==============================================
// 7. REALTIME SUBSCRIPTION
// ==============================================

function subscribeRealtime() {
    // Subscribe ke tabel produk
    supabaseClient
        .channel('produk-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'produk' },
            (payload) => {
                console.log('🔄 Produk berubah:', payload);
                loadProduk();
            }
        )
        .subscribe();

    // Subscribe ke tabel kategori
    supabaseClient
        .channel('kategori-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'kategori' },
            (payload) => {
                console.log('🔄 Kategori berubah:', payload);
                loadKategori();
            }
        )
        .subscribe();

    // Subscribe ke tabel transaksi
    supabaseClient
        .channel('transaksi-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'transaksi' },
            (payload) => {
                console.log('🔄 Transaksi berubah:', payload);
                loadTransaksi();
            }
        )
        .subscribe();

    // Subscribe ke tabel testimoni
    supabaseClient
        .channel('testimoni-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'testimoni' },
            (payload) => {
                console.log('🔄 Testimoni berubah:', payload);
                loadTestimoni();
            }
        )
        .subscribe();

    // Subscribe ke tabel promo
    supabaseClient
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
// 8. BACKUP & RESTORE (Manual)
// ==============================================

async function backupData() {
    const tables = ['produk', 'kategori', 'transaksi', 'detail_transaksi', 'testimoni', 'aktivitas_log'];
    const backup = {};
    for (const table of tables) {
        const { data, error } = await supabaseClient.from(table).select('*');
        if (error) return showNotification('Gagal backup: ' + error.message, 'error');
        backup[table] = data;
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ym_furnitur_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showNotification('Backup berhasil!', 'success');
    await logActivity('Backup Data', `Total ${Object.values(backup).reduce((sum, arr) => sum + arr.length, 0)} records`);
}

async function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            for (const [table, records] of Object.entries(data)) {
                if (records.length > 0) {
                    const { error } = await supabaseClient.from(table).insert(records);
                    if (error) throw error;
                }
            }
            showNotification('Restore berhasil!', 'success');
            await logActivity('Restore Data', `Total ${Object.values(data).reduce((sum, arr) => sum + arr.length, 0)} records`);
            location.reload();
        } catch (err) {
            showNotification('Gagal restore: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

// ==============================================
// 9. FOOTER
// ==============================================

async function loadFooter() {
    const { data, error } = await supabaseClient
        .from('pengaturan')
        .select('*')
        .eq('key', 'footer')
        .single();
    if (error && error.code !== 'PGRST116') return;
    if (data) {
        const footerText = document.getElementById('footerText');
        const footerInstagram = document.getElementById('footerInstagram');
        if (footerText) footerText.value = data.value?.teks || '';
        if (footerInstagram) footerInstagram.value = data.value?.instagram || '';
    }
}

async function updateFooter() {
    const data = {
        teks: document.getElementById('footerText').value,
        instagram: document.getElementById('footerInstagram').value
    };
    const { error } = await supabaseClient
        .from('pengaturan')
        .upsert([{ key: 'footer', value: data }], { onConflict: 'key' });
    if (error) return showNotification('Gagal update footer: ' + error.message, 'error');
    showNotification('Footer berhasil diupdate!', 'success');
    await logActivity('Update Footer', 'Footer settings updated');
}

// ==============================================
// 10. PENGATURAN NOTIFIKASI
// ==============================================

async function loadPengaturan() {
    const { data, error } = await supabaseClient
        .from('pengaturan')
        .select('*')
        .eq('key', 'notifikasi')
        .single();
    if (error && error.code !== 'PGRST116') return;
    if (data) {
        const notifEmail = document.getElementById('notifEmail');
        const notifWA = document.getElementById('notifWA');
        if (notifEmail) notifEmail.value = data.value?.email || 'on';
        if (notifWA) notifWA.value = data.value?.wa || 'on';
    }
}

async function updatePengaturan() {
    const data = {
        email: document.getElementById('notifEmail').value,
        wa: document.getElementById('notifWA').value
    };
    const { error } = await supabaseClient
        .from('pengaturan')
        .upsert([{ key: 'notifikasi', value: data }], { onConflict: 'key' });
    if (error) return showNotification('Gagal update pengaturan: ' + error.message, 'error');
    showNotification('Pengaturan berhasil diupdate!', 'success');
    await logActivity('Update Pengaturan', 'Notification settings updated');
}

// ==============================================
// 11. UTILS
// ==============================================

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

// ==============================================
// 12. ADMIN LOGOUT
// ==============================================

function logoutAdmin() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.clear();
        window.location.href = 'admin-login.html';
    }
}

// ==============================================
// 13. INIT
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    // Tampilkan SID saat halaman dimuat
    tampilkanSID();
    
    // Load semua data (dari cache dulu, lalu update dari Supabase)
    loadProduk();
    loadKategori();
    loadTransaksi();
    loadTestimoni();
    loadPromo();
    loadGrafik();
    loadFooter();
    loadPengaturan();
    
    // Subscribe ke realtime
    subscribeRealtime();
    
    // Event listeners form
    const produkForm = document.getElementById('produkForm');
    if (produkForm) produkForm.addEventListener('submit', simpanProduk);
    
    const kategoriForm = document.getElementById('kategoriForm');
    if (kategoriForm) kategoriForm.addEventListener('submit', simpanKategori);
    
    const testimoniForm = document.getElementById('testimoniForm');
    if (testimoniForm) testimoniForm.addEventListener('submit', simpanTestimoni);
    
    // Clock
    function updateClock() {
        const now = new Date();
        const clockDisplay = document.getElementById('clockDisplay');
        if (clockDisplay) {
            clockDisplay.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
});