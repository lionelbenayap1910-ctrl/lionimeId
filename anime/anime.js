const BASE_URL = 'https://www.sankavollerei.com/anime';

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

async function loadAnime() {
    document.getElementById('loading').style.display = 'flex';
    
    const homeData = await fetchAPI('/home');
    
    if (!homeData) {
        showError('Gagal memuat data anime');
        return;
    }
    
    const animeList = homeData.ongoing?.animeList || [];
    renderAnimeGrid(animeList.slice(0, 20));
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

function renderAnimeGrid(animeList) {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = '';
    
    animeList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.onclick = () => window.location.href = `detail.html?slug=${anime.animeId}`;
        
        card.innerHTML = `
            <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-detail">
                <h4>${anime.title}</h4>
                <p><i class="fas fa-play-circle"></i> Episode ${anime.episodes || '?'}</p>
                <p><i class="fas fa-calendar"></i> ${anime.releaseDay || 'Ongoing'}</p>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function searchAnime() {
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

window.addEventListener('load', loadAnime);
