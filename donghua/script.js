// ==================== KONFIGURASI ====================
const BASE_URL = 'https://www.sankavollerei.com/anime/donghub';
let currentPage = 1;
let totalPages = 1;
let currentView = 'home';
let currentKeyword = '';
let currentGenre = '';

// ==================== SIDEBAR TOGGLE ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close sidebar when clicking overlay
document.getElementById('sidebarOverlay')?.addEventListener('click', toggleSidebar);

// ==================== BACK TO TOP ====================
window.addEventListener('scroll', () => {
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== UPDATE ACTIVE MENU ====================
function setActiveMenu(menuId) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(menuId)?.classList.add('active');
}

// ==================== API CALLS ====================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'success') {
            return data.data;
        } else {
            throw new Error(data.message || 'Data tidak valid');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// ==================== LOADING & ERROR ====================
function showLoading() {
    document.getElementById('main-content').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Memuat data donghua...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('main-content').innerHTML = `
        <div style="text-align: center; padding: 50px; background: #1a1a24; border-radius: 10px; margin: 20px;">
            <i class="fas fa-exclamation-circle" style="font-size: 50px; color: #ff6b1a; margin-bottom: 20px;"></i>
            <h2 style="color: #fff; margin-bottom: 20px;">${message}</h2>
            <button onclick="loadHome()" style="background: #ff6b1a; color: white; border: none; padding: 12px 30px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                <i class="fas fa-home"></i> Kembali ke Home
            </button>
        </div>
    `;
}

// ==================== HOME PAGE ====================
async function loadHome() {
    showLoading();
    setActiveMenu('menu-home');
    currentView = 'home';
    
    const data = await fetchAPI('/home?page=1');
    
    if (!data) {
        showError('Gagal memuat data. Periksa koneksi internet Anda.');
        return;
    }
    
    const slider = data.slider || [];
    const popular = data.popular || [];
    const latest = data.latest || [];
    
    let html = '';
    
    // Slider Section
    if (slider.length > 0) {
        html += `
            <section class="slider-section">
                <h2 class="section-title">🔥 Spotlight Donghua</h2>
                <div class="slider-container">
        `;
        
        slider.forEach(item => {
            html += `
                <div class="slider-item" onclick="loadDetail('${item.slug}')">
                    <img src="${item.poster}" alt="${item.title}" loading="lazy">
                    <div class="slider-info">
                        <h3>${item.title}</h3>
                        <p>${item.synopsis?.substring(0, 100)}...</p>
                    </div>
                </div>
            `;
        });
        
        html += `</div></section>`;
    }
    
    // Popular Section
    if (popular.length > 0) {
        html += `
            <section class="grid-section">
                <div class="grid-header">
                    <h2 class="section-title">🔥 Populer</h2>
                    <a class="view-all" onclick="loadPopular()">Lihat Semua →</a>
                </div>
                <div class="grid-container">
        `;
        
        popular.slice(0, 10).forEach(item => {
            html += createCard(item);
        });
        
        html += `</div></section>`;
    }
    
    // Latest Section
    if (latest.length > 0) {
        html += `
            <section class="grid-section">
                <div class="grid-header">
                    <h2 class="section-title">🆕 Update Terbaru</h2>
                    <a class="view-all" onclick="loadLatest()">Lihat Semua →</a>
                </div>
                <div class="grid-container">
        `;
        
        latest.slice(0, 10).forEach(item => {
            html += createCard(item);
        });
        
        html += `</div></section>`;
    }
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== LATEST UPDATE ====================
async function loadLatest(page = 1) {
    showLoading();
    setActiveMenu('menu-latest');
    currentView = 'latest';
    currentPage = page;
    
    const data = await fetchAPI(`/latest?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data.');
        return;
    }
    
    const items = data.data || [];
    const pagination = data.pagination || {};
    totalPages = pagination.has_next ? page + 1 : page;
    
    let html = `
        <div class="grid-header">
            <h2 class="section-title">🆕 Update Terbaru</h2>
        </div>
        <div class="grid-container">
    `;
    
    items.forEach(item => {
        html += createCard(item);
    });
    
    html += `</div>`;
    html += createPagination(page, totalPages, 'latest');
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== POPULAR ====================
async function loadPopular(page = 1) {
    showLoading();
    setActiveMenu('menu-popular');
    currentView = 'popular';
    currentPage = page;
    
    const data = await fetchAPI(`/popular?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data.');
        return;
    }
    
    const items = data.data || [];
    const pagination = data.pagination || {};
    totalPages = pagination.has_next ? page + 1 : page;
    
    let html = `
        <div class="grid-header">
            <h2 class="section-title">🔥 Populer</h2>
        </div>
        <div class="grid-container">
    `;
    
    items.forEach(item => {
        html += createCard(item);
    });
    
    html += `</div>`;
    html += createPagination(page, totalPages, 'popular');
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== MOVIES ====================
async function loadMovies(page = 1) {
    showLoading();
    setActiveMenu('menu-movies');
    currentView = 'movies';
    currentPage = page;
    
    const data = await fetchAPI(`/movie?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data.');
        return;
    }
    
    const items = data.data || [];
    const pagination = data.pagination || {};
    totalPages = pagination.has_next ? page + 1 : page;
    
    let html = `
        <div class="grid-header">
            <h2 class="section-title">🎬 Donghua Movie</h2>
        </div>
        <div class="grid-container">
    `;
    
    items.forEach(item => {
        html += createCard(item);
    });
    
    html += `</div>`;
    html += createPagination(page, totalPages, 'movies');
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== SCHEDULE ====================
async function loadSchedule() {
    showLoading();
    setActiveMenu('menu-schedule');
    currentView = 'schedule';
    
    const data = await fetchAPI('/schedule');
    
    if (!data) {
        showError('Gagal memuat data jadwal.');
        return;
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayNames = {
        'Monday': 'Senin',
        'Tuesday': 'Selasa',
        'Wednesday': 'Rabu',
        'Thursday': 'Kamis',
        'Friday': 'Jumat',
        'Saturday': 'Sabtu',
        'Sunday': 'Minggu'
    };
    
    let html = `
        <h2 class="section-title">📅 Jadwal Rilis Donghua</h2>
        <div class="schedule-container">
            <div class="schedule-tabs">
    `;
    
    // Create tabs
    days.forEach((day, index) => {
        if (data[day] && data[day].length > 0) {
            html += `<button class="schedule-tab ${index === 0 ? 'active' : ''}" onclick="showScheduleDay('${day}')">${dayNames[day]}</button>`;
        }
    });
    
    html += `</div>`;
    
    // Create content for each day
    days.forEach(day => {
        const items = data[day] || [];
        
        html += `
            <div id="schedule-${day}" class="schedule-day-content" style="display: none;">
                <div class="schedule-day-header">
                    <i class="far fa-calendar-alt"></i> ${dayNames[day]}
                </div>
        `;
        
        if (items.length === 0) {
            html += `<p style="color: #aaa; text-align: center; padding: 30px;">Tidak ada jadwal untuk hari ${dayNames[day]}</p>`;
        } else {
            items.forEach(item => {
                const episode = item.episode || item.sub || '-';
                const time = item.release_time || '';
                
                html += `
                    <div class="schedule-item" onclick="loadDetail('${item.slug}')">
                        <img src="${item.poster}" alt="${item.title}" loading="lazy">
                        <div class="schedule-info">
                            <h4>${item.title}</h4>
                            <p>Episode ${episode}</p>
                        </div>
                        <div class="schedule-time">${time}</div>
                    </div>
                `;
            });
        }
        
        html += `</div>`;
    });
    
    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
    
    // Show first day
    const firstDay = days.find(day => data[day] && data[day].length > 0);
    if (firstDay) {
        showScheduleDay(firstDay);
    }
}

// Function to show selected schedule day
function showScheduleDay(day) {
    document.querySelectorAll('.schedule-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent === getDayName(day)) {
            tab.classList.add('active');
        }
    });
    
    document.querySelectorAll('.schedule-day-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const selected = document.getElementById(`schedule-${day}`);
    if (selected) {
        selected.style.display = 'block';
    }
}

function getDayName(day) {
    const names = {
        'Monday': 'Senin',
        'Tuesday': 'Selasa',
        'Wednesday': 'Rabu',
        'Thursday': 'Kamis',
        'Friday': 'Jumat',
        'Saturday': 'Sabtu',
        'Sunday': 'Minggu'
    };
    return names[day] || day;
}

// ==================== DETAIL ====================
async function loadDetail(slug) {
    showLoading();
    currentView = 'detail';
    
    const data = await fetchAPI(`/detail/${slug}`);
    
    if (!data) {
        showError('Gagal memuat detail.');
        return;
    }
    
    const info = data.info || {};
    const genres = data.genres || [];
    const episodes = data.episodes || [];
    const recommendations = data.recommendations || [];
    
    // Format info
    const status = info.status || 'Unknown';
    const studio = info.studio || info.network || '-';
    const released = info.released || info.released_on || '-';
    const type = info.type || '-';
    const totalEpisodes = info.episodes || '-';
    
    let html = `
        <div class="detail-container">
            <div class="detail-header">
                <div class="detail-poster">
                    <img src="${data.poster}" alt="${data.title}" loading="lazy">
                </div>
                <div class="detail-info">
                    <h1>${data.title}</h1>
                    
                    <div class="detail-meta">
                        <span class="meta-label">Status:</span>
                        <span class="meta-value">${status}</span>
                        
                        <span class="meta-label">Tipe:</span>
                        <span class="meta-value">${type}</span>
                        
                        <span class="meta-label">Episode:</span>
                        <span class="meta-value">${totalEpisodes}</span>
                        
                        <span class="meta-label">Studio:</span>
                        <span class="meta-value">${studio}</span>
                        
                        <span class="meta-label">Rilis:</span>
                        <span class="meta-value">${released}</span>
                    </div>
                    
                    <div class="detail-genres">
    `;
    
    genres.forEach(genre => {
        html += `<button class="genre-tag" onclick="searchByGenre('${genre.slug}')">${genre.name}</button>`;
    });
    
    html += `
                    </div>
                </div>
            </div>
            
            <div class="detail-synopsis">
                <h3>Sinopsis</h3>
                <p>${data.synopsis || 'Sinopsis tidak tersedia.'}</p>
            </div>
            
            <div class="episode-list">
                <h3>Daftar Episode (${episodes.length})</h3>
    `;
    
    if (episodes.length === 0) {
        html += `<p style="color: #aaa; text-align: center; padding: 20px;">Belum ada episode.</p>`;
    } else {
        // Sort episodes by episode number (descending)
        episodes.sort((a, b) => parseInt(b.episode) - parseInt(a.episode));
        
        episodes.forEach(ep => {
            html += `
                <div class="episode-item" onclick="loadEpisode('${ep.slug}')">
                    <span class="episode-number">Ep ${ep.episode}</span>
                    <span class="episode-title">${ep.title}</span>
                    <span class="episode-date">${ep.date}</span>
                </div>
            `;
        });
    }
    
    html += `
            </div>
            
            <div class="grid-section">
                <h3 class="section-title">Rekomendasi</h3>
                <div class="grid-container">
    `;
    
    recommendations.forEach(item => {
        html += createCard(item);
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== EPISODE ====================
async function loadEpisode(slug) {
    showLoading();
    currentView = 'episode';
    
    const data = await fetchAPI(`/episode/${slug}`);
    
    if (!data) {
        showError('Gagal memuat episode.');
        return;
    }
    
    const title = data.title || '';
    const releaseDate = data.release_date || '';
    const navigation = data.navigation || {};
    const streams = data.streams || [];
    const animeInfo = data.anime_info || {};
    const relatedEpisodes = data.related_episodes || [];
    const recommendations = data.recommended_series || [];
    
    let html = `
        <div class="detail-container">
            <h1 style="margin-bottom: 20px;">${title}</h1>
            
            <div class="streaming-container">
                <div class="video-wrapper">
    `;
    
    // Use first stream as default
    if (streams.length > 0) {
        html += `<iframe src="${streams[0].url}" allowfullscreen></iframe>`;
    } else {
        html += `<div style="background: #000; height: 400px; display: flex; align-items: center; justify-content: center; color: #aaa;">Video tidak tersedia</div>`;
    }
    
    html += `
                </div>
            </div>
            
            <div style="margin: 15px 0; color: #aaa;">
                <i class="far fa-calendar-alt"></i> Rilis: ${releaseDate}
            </div>
    `;
    
    // Server list
    if (streams.length > 1) {
        html += `
            <div style="margin: 20px 0;">
                <h3 style="margin-bottom: 10px;">Pilih Server</h3>
                <div class="server-list">
        `;
        
        streams.forEach((stream, index) => {
            html += `<button class="server-btn ${index === 0 ? 'active' : ''}" onclick="changeServer(this, '${stream.url}')">${stream.server}</button>`;
        });
        
        html += `</div>`;
    }
    
    // Episode navigation
    html += `
            <div class="episode-navigation">
    `;
    
    if (navigation.prev_slug) {
        html += `<button class="nav-btn" onclick="loadEpisode('${navigation.prev_slug}')"><i class="fas fa-chevron-left"></i> Episode Sebelumnya</button>`;
    } else {
        html += `<button class="nav-btn" disabled><i class="fas fa-chevron-left"></i> Episode Sebelumnya</button>`;
    }
    
    if (navigation.all_slug) {
        html += `<button class="nav-btn" onclick="loadDetail('${navigation.all_slug}')"><i class="fas fa-list"></i> Semua Episode</button>`;
    }
    
    if (navigation.next_slug) {
        html += `<button class="nav-btn" onclick="loadEpisode('${navigation.next_slug}')">Episode Selanjutnya <i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button class="nav-btn" disabled>Episode Selanjutnya <i class="fas fa-chevron-right"></i></button>`;
    }
    
    html += `</div>`;
    
    // Anime Info
    if (animeInfo.title) {
        html += `
            <div style="margin-top: 30px; background: #0f0f13; padding: 20px; border-radius: 10px;">
                <h3 style="margin-bottom: 15px;">Info Anime</h3>
                <p><strong>Judul:</strong> ${animeInfo.title}</p>
                <p><strong>Status:</strong> ${animeInfo.status || '-'}</p>
                <p><strong>Studio:</strong> ${animeInfo.studio || animeInfo.network || '-'}</p>
                <p><strong>Tipe:</strong> ${animeInfo.type || '-'}</p>
                <p><strong>Episode:</strong> ${animeInfo.episodes || '-'}</p>
                
                <div style="margin-top: 10px;">
                    <strong>Genre:</strong>
                    <div class="detail-genres" style="margin-top: 8px;">
        `;
        
        if (animeInfo.genres) {
            animeInfo.genres.forEach(genre => {
                html += `<button class="genre-tag" onclick="searchByGenre('${genre.slug}')">${genre.name}</button>`;
            });
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // Related Episodes
    if (relatedEpisodes.length > 0) {
        html += `
            <div style="margin-top: 30px;">
                <h3>Episode Lainnya</h3>
                <div class="episode-list">
        `;
        
        relatedEpisodes.forEach(ep => {
            html += `
                <div class="episode-item" onclick="loadEpisode('${ep.slug}')">
                    <span class="episode-number">${ep.title}</span>
                    <span class="episode-date">${ep.posted_date || ''}</span>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    // Recommendations
    if (recommendations.length > 0) {
        html += `
            <div style="margin-top: 30px;">
                <h3>Rekomendasi</h3>
                <div class="grid-container">
        `;
        
        recommendations.forEach(item => {
            html += createCard(item);
        });
        
        html += `</div></div>`;
    }
    
    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

// ==================== SEARCH ====================
async function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) return;
    
    showLoading();
    currentKeyword = keyword;
    currentView = 'search';
    
    const data = await fetchAPI(`/search/${encodeURIComponent(keyword)}`);
    
    if (!data || data.length === 0) {
        document.getElementById('main-content').innerHTML = `
            <div style="text-align: center; padding: 50px; background: #1a1a24; border-radius: 10px;">
                <i class="fas fa-search" style="font-size: 50px; color: #aaa; margin-bottom: 20px;"></i>
                <h2 style="color: #fff; margin-bottom: 10px;">Tidak ditemukan</h2>
                <p style="color: #aaa;">Hasil pencarian untuk "${keyword}" tidak ditemukan</p>
                <button onclick="loadHome()" style="margin-top: 20px; background: #ff6b1a; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer;">Kembali ke Home</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="grid-header">
            <h2 class="section-title">🔍 Hasil Pencarian: "${keyword}" (${data.length})</h2>
        </div>
        <div class="grid-container">
    `;
    
    data.forEach(item => {
        html += createCard(item);
    });
    
    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

function handleSearchKey(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
}

// ==================== SEARCH BY GENRE ====================
async function searchByGenre(slug) {
    showLoading();
    currentView = 'genre';
    currentGenre = slug;
    
    const data = await fetchAPI(`/genre/${slug}?page=1`);
    
    if (!data) {
        showError('Gagal memuat data genre.');
        return;
    }
    
    const items = data.data || [];
    const pagination = data.pagination || {};
    
    let html = `
        <div class="grid-header">
            <h2 class="section-title">🎭 Genre: ${slug}</h2>
        </div>
        <div class="grid-container">
    `;
    
    items.forEach(item => {
        html += createCard(item);
    });
    
    html += `</div>`;
    
    if (pagination.has_next) {
        html += createPagination(1, 2, 'genre', slug);
    }
    
    document.getElementById('main-content').innerHTML = html;
}

// ==================== UTILITY FUNCTIONS ====================
function createCard(item) {
    const title = item.title || '';
    const slug = item.slug || '';
    const poster = item.poster || '';
    const episode = item.episode || item.sub || '-';
    const type = item.type || 'ONA';
    
    // Clean title (remove duplicate text)
    let cleanTitle = title;
    if (title.includes('\t\t\t\t')) {
        cleanTitle = title.split('\t\t\t\t')[0];
    }
    
    return `
        <div class="card-item" onclick="loadDetail('${slug}')">
            <img src="${poster}" alt="${cleanTitle}" loading="lazy">
            <div class="card-info">
                <h4>${cleanTitle}</h4>
                <div class="card-meta">
                    <span class="episode">Ep ${episode}</span>
                    <span class="type">${type}</span>
                </div>
            </div>
        </div>
    `;
}

function createPagination(current, total, type, param = '') {
    let html = '<div class="pagination">';
    
    html += `<button class="page-btn" ${current <= 1 ? 'disabled' : ''} onclick="loadMore('${type}', '${param}', ${current - 1})"><i class="fas fa-chevron-left"></i> Prev</button>`;
    html += `<span class="page-info">Halaman ${current} dari ${total}</span>`;
    html += `<button class="page-btn" ${current >= total ? 'disabled' : ''} onclick="loadMore('${type}', '${param}', ${current + 1})">Next <i class="fas fa-chevron-right"></i></button>`;
    
    html += '</div>';
    return html;
}

function loadMore(type, param, page) {
    if (type === 'latest') loadLatest(page);
    else if (type === 'popular') loadPopular(page);
    else if (type === 'movies') loadMovies(page);
    else if (type === 'genre') searchByGenre(param, page);
}

function changeServer(btn, url) {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const iframe = document.querySelector('.video-wrapper iframe');
    if (iframe) {
        iframe.src = url;
    }
}

// ==================== INIT ====================
window.onload = () => {
    loadHome();
};
