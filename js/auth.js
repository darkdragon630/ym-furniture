// ==============================================
// AUTH.JS - USER AUTHENTICATION (Pelanggan)
// ==============================================

// Tunggu hingga DOM siap DAN Supabase siap
document.addEventListener('DOMContentLoaded', function() {
    
    // Tunggu event supabase-ready
    document.addEventListener('supabase-ready', function() {
        initAuth();
    });
    
    // Jika Supabase sudah siap, langsung init
    if (window.supabase) {
        initAuth();
    }
});

function initAuth() {
    const supabase = window.supabase;
    
    if (!supabase) {
        console.error('Supabase tidak ditemukan!');
        return;
    }

    // ===== CEK SESSION SAAT HALAMAN DIMUAT =====
    checkSession();

    async function checkSession() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                tampilkanUser(session.user);
            }
        } catch (err) {
            console.error('Error getting session:', err);
        }
    }

    function tampilkanUser(user) {
        const authArea = document.getElementById('authArea');
        if (!authArea) return;
        
        const nama = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';
        const foto = user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nama);
        
        authArea.innerHTML = `
            <div class="profile-container">
                <img src="${foto}" alt="${nama}">
                <span class="profile-name">${nama}</span>
                <button class="profile-logout-btn" onclick="logoutUser()">Logout</button>
            </div>
        `;
    }

    // ===== LOGOUT =====
    window.logoutUser = async function() {
        await supabase.auth.signOut();
        sessionStorage.clear();
        localStorage.removeItem('ym_remember_email');
        location.reload();
    };

    // ===== TOGGLE PASSWORD =====
    window.togglePassword = function(inputId, icon) {
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
    };

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
}