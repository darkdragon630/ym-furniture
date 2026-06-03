// ==============================================
// AUTH-ADMIN.JS - ADMIN AUTHENTICATION
// ==============================================

const supabaseClient = window.supabase;

// ===== ADMIN REGISTER =====
if (document.getElementById('adminRegisterForm')) {
    document.getElementById('adminRegisterForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nama = document.getElementById('adminNama').value.trim();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const confirm = document.getElementById('adminConfirm').value;
        
        const errorMsg = document.getElementById('errorMessage');
        const successMsg = document.getElementById('successMessage');
        
        if (errorMsg) errorMsg.style.display = 'none';
        if (successMsg) successMsg.style.display = 'none';
        
        // Validasi
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
        
        // Cek apakah email sudah terdaftar
        const { data: existingAdmin, error: checkError } = await supabaseClient
            .from('admin')
            .select('email')
            .eq('email', email)
            .single();
        
        if (existingAdmin) {
            if (errorMsg) { errorMsg.textContent = 'Email admin sudah terdaftar!'; errorMsg.style.display = 'block'; }
            return;
        }
        
        // Simpan admin ke database
        const { data, error } = await supabaseClient
            .from('admin')
            .insert([{
                nama_lengkap: nama,
                email: email,
                password: btoa(password),
                role: 'admin'
            }]);
        
        if (error) {
            if (errorMsg) { errorMsg.textContent = 'Gagal mendaftar: ' + error.message; errorMsg.style.display = 'block'; }
            return;
        }
        
        if (successMsg) {
            successMsg.textContent = 'Pendaftaran admin berhasil! Silakan login.';
            successMsg.style.display = 'block';
        }
        
        setTimeout(function() {
            window.location.href = 'admin-login.html';
        }, 2000);
    });
}

// ===== ADMIN LOGIN =====
if (document.getElementById('adminLoginForm')) {
    document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) errorMsg.style.display = 'none';
        
        if (email === '' || password === '') {
            if (errorMsg) { errorMsg.textContent = 'Email dan password harus diisi!'; errorMsg.style.display = 'block'; }
            return;
        }
        
        // Cek admin di database
        const { data: admin, error } = await supabaseClient
            .from('admin')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !admin) {
            if (errorMsg) { errorMsg.textContent = 'Email atau password salah!'; errorMsg.style.display = 'block'; }
            return;
        }
        
        // Verifikasi password (decoding)
        if (atob(admin.password) !== password) {
            if (errorMsg) { errorMsg.textContent = 'Email atau password salah!'; errorMsg.style.display = 'block'; }
            return;
        }
        
        // Generate SID
        const sid = 'SID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const loginTime = new Date().toISOString();
        
        // Update SID dan last_login di database
        const { error: updateError } = await supabaseClient
            .from('admin')
            .update({ sid: sid, last_login: loginTime })
            .eq('id', admin.id);
        
        if (updateError) {
            if (errorMsg) { errorMsg.textContent = 'Gagal login: ' + updateError.message; errorMsg.style.display = 'block'; }
            return;
        }
        
        // Simpan session
        sessionStorage.setItem('ym_sid', sid);
        sessionStorage.setItem('ym_email', email);
        sessionStorage.setItem('ym_nama', admin.nama_lengkap);
        sessionStorage.setItem('ym_login_time', loginTime);
        
        // Redirect ke dashboard
        window.location.href = 'dashboard.html';
    });
}