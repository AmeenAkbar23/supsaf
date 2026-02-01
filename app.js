const URL = 'sb_publishable_PRNy9SVQ-8yj6v_d-9oYWg_BYflyOvx';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5anNuZmh0Y2VmZndiYWJyZnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NTcxOTQsImV4cCI6MjA4NTQzMzE5NH0.dN6zmqJ2H2IsAtvb35GOi6ol1E4lNFpqEOCEwKu_IR4';
const _supabase = supabase.createClient(URL, KEY);

// 1. Show Photos
async function load() {
    const { data } = await _supabase.from('images').select('*');
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = data.map(p => `
        <div class="photo-card">
            <img src="${p.url}">
            <div style="padding:10px;"><button onclick="alert('Liked!')">❤️ Like</button></div>
        </div>
    `).join('');
}

// 2. Open Modal
document.getElementById('openModal').onclick = () => document.getElementById('uploadModal').style.display='block';

// 3. Upload Logic
document.getElementById('startUpload').onclick = async () => {
    const file = document.getElementById('fileInput').files[0];
    const words = document.getElementById('keywordsInput').value;
    
    // Upload file
    const path = `${Date.now()}_${file.name}`;
    await _supabase.storage.from('images').upload(path, file);
    const { data: { publicUrl } } = _supabase.storage.from('images').getPublicUrl(path);

    // Save to Database
    await _supabase.from('images').insert([{ url: publicUrl, keywords: words.split(',') }]);
    location.reload();
}

load();
