const BASE_URL = 'https://www.sankavollerei.com/anime/donghub';

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function loadDonghua() {
    document.getElementById('loading').style.display = 'flex';
    
    const popularData = await fetchAPI('/popular');
    
    if (!popularData) {
        showError('Gagal memuat data donghua');
        return;
    }
    
    renderDonghuaGrid(popularData);
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function renderDonghuaGrid(donghuaList) {
    const grid = document.getElementById('donghuaGrid');
    grid.innerHTML = '';
    
    donghuaList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'donghua-card';
        card.onclick = () => window.location.href = `detail.html?slug=${item.slug}`;
        
        const title = item.title.replace(/\t\t\t\t/g, ' ').substring(0, 30);
        
        card.innerHTML = `
            <img src="${item.poster}" alt="${item.title}" loading="lazy">
            <div class="donghua-card-detail">
                <h4>${title}${item.title.length > 30 ? '...' : ''}</h4>
                <p><i class="fas fa-play-circle"></i> Episode ${item.episode || 'Ongoing'}</p>
                <p><i class="fas fa-tag"></i> ${item.type || 'ONA'}</p>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function searchDonghua() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    const content = document.getElementById('content');
    content.style.display = 'block';
    content.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <i class="fas fa-exclamation-circle" style="font-size: 50px; color: #ff6b1a;"></i>
            <p style="margin-top: 20px; color: white;">${message}</p>
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; background: #ff6b1a; border: none; color: white; border-radius: 5px; cursor: pointer;">
                Muat Ulang
            </button>
        </div>
    `;
}

window.addEventListener('load', loadDonghua);
