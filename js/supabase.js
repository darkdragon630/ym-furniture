// ==============================================
// SUPABASE INITIALIZATION (GLOBAL)
// ==============================================

const SUPABASE_URL = 'https://ldnpbxvhfthlcyzfioup.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbnBieHZoZnRobGN5emZpb3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzODMzNjEsImV4cCI6MjA5NTk1OTM2MX0.ANvxNi1jPxG_jmDZwlSmV0QiUd0CcZXTrL0g7BYuShk';

// Tunggu hingga CDN siap
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.log('Menunggu Supabase CDN...');
        setTimeout(initSupabase, 100);
        return;
    }
    
    // Simpan ke window global
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized successfully');
    
    // Trigger event bahwa Supabase siap
    document.dispatchEvent(new Event('supabase-ready'));
}

// Mulai inisialisasi
initSupabase();