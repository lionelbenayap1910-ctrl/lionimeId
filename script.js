// ==================== KONFIGURASI ====================
const BASE_URL = 'https://www.sankavollerei.com/anime';
let currentPage = 1;
let totalPages = 1;
let currentGenre = '';
let currentKeyword = '';
let currentAlphabet = '';

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

function closeMobileMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');
    
    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== NAVIGASI ====================
function navigateTo(page, param = '', pageNum = 1) {
    closeMobileMenu();

    // Update active nav
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.getElementById(`nav-${page}`);
    if (activeLink) activeLink.classList.add('active');
    
    const activeMobileLink = document.getElementById(`nav-mobile-${page}`);
    if (activeMobileLink) activeMobileLink.classList.add('active');

    currentPage = pageNum;

    // Update URL hash
    let hash = page;
    if (param) hash += `/${param}`;
    if (pageNum > 1) hash += `/${pageNum}`;
    window.location.hash = hash;

    // Load konten
    switch(page) {
        case 'home':
            loadHome();
            break;
        case 'ongoing':
            loadOngoing(pageNum);
            break;
        case 'completed':
            loadCompleted(pageNum);
            break;
        case 'genre':
            if (param) {
                loadGenreAnime(param, pageNum);
            } else {
                loadGenreList();
            }
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'all':
            loadAllAnime();
            break;
        case 'detail':
            loadAnimeDetail(param);
            break;
        case 'episode':
            loadEpisodeDetail(param);
            break;
        case 'search':
            loadSearchResults(param, pageNum);
            break;
    }
}

function goBack() {
    navigateTo('home');
}

// Handle browser back/forward
window.addEventListener('popstate', function() {
    const hash = window.location.hash.substring(1).split('/');
    const page = hash[0] || 'home';
    const param = hash[1] || '';
    const pageNum = parseInt(hash[2]) || 1;
    navigateTo(page, param, pageNum);
});

// ==================== API CALLS ====================
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ==================== LOADING & ERROR ====================
function showLoading() {
    document.getElementById('main-content').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p style="margin-top: 20px;">Memuat data...</p>
        </div>
    `;
}

function showError(message) {
    document.getElementById('main-content').innerHTML = `
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h2 class="error-message">${message}</h2>
            <button class="retry-btn" onclick="navigateTo('home')">
                <i class="fas fa-home"></i> Kembali ke Home
            </button>
        </div>
    `;
}

// ==================== HOME PAGE ====================
async function loadHome() {
    showLoading();
    const data = await fetchAPI('/home');
    
    if (!data) {
        showError('Gagal memuat data. Periksa koneksi internet Anda.');
        return;
    }

    const ongoing = data.ongoing?.animeList || [];
    const completed = data.completed?.animeList || [];
    const bannerAnime = ongoing.slice(0, 6);

    let html = `
        <section class="banner-section">
            <h2 class="section-title">🔥 Spotlight Anime</h2>
            <div class="banner-container">
    `;

    bannerAnime.forEach(anime => {
        html += `
            <div class="banner-item" onclick="navigateTo('detail', '${anime.animeId}')">
                <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                <div class="banner-info">
                    <h3>${anime.title}</h3>
                    <p>Episode ${anime.episodes}</p>
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </section>

        <section class="content-section">
            <div class="section-title">
                <span>📺 Sedang Tayang</span>
                <a onclick="navigateTo('ongoing')">Lihat Semua →</a>
            </div>
            <div class="anime-grid">
    `;

    ongoing.slice(0, 10).forEach(anime => {
        html += createAnimeCard(anime);
    });

    html += `
            </div>
        </section>

        <section class="content-section">
            <div class="section-title">
                <span>✅ Anime Tamat</span>
                <a onclick="navigateTo('completed')">Lihat Semua →</a>
            </div>
            <div class="anime-grid">
    `;

    completed.slice(0, 10).forEach(anime => {
        html += createAnimeCard(anime);
    });

    html += `
            </div>
        </section>
    `;

    document.getElementById('main-content').innerHTML = html;
}

// ==================== ONGOING PAGE ====================
async function loadOngoing(page = 1) {
    showLoading();
    const data = await fetchAPI(`/ongoing-anime?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data ongoing.');
        return;
    }

    const animeList = data.animeList || [];
    totalPages = data.pagination?.totalPages || 1;

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">📺 Anime Sedang Tayang</h2>
        <div class="anime-grid">
    `;

    animeList.forEach(anime => html += createAnimeCard(anime));
    html += `</div>`;
    html += createPagination(page, totalPages, 'ongoing');

    document.getElementById('main-content').innerHTML = html;
}

// ==================== COMPLETED PAGE ====================
async function loadCompleted(page = 1) {
    showLoading();
    const data = await fetchAPI(`/complete-anime?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data completed.');
        return;
    }

    const animeList = data.animeList || [];
    totalPages = data.pagination?.totalPages || 1;

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">✅ Anime Tamat</h2>
        <div class="anime-grid">
    `;

    animeList.forEach(anime => html += createAnimeCard(anime));
    html += `</div>`;
    html += createPagination(page, totalPages, 'completed');

    document.getElementById('main-content').innerHTML = html;
}

// ==================== GENRE LIST ====================
async function loadGenreList() {
    showLoading();
    const data = await fetchAPI('/genre');
    
    if (!data || !data.genreList) {
        showError('Gagal memuat data genre.');
        return;
    }

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">🎭 Daftar Genre</h2>
        <div class="genre-cloud">
    `;

    data.genreList.forEach(genre => {
        html += `
            <button class="genre-tag" onclick="navigateTo('genre', '${genre.genreId}')">
                ${genre.title}
            </button>
        `;
    });

    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

// ==================== GENRE ANIME ====================
async function loadGenreAnime(slug, page = 1) {
    showLoading();
    currentGenre = slug;
    const data = await fetchAPI(`/genre/${slug}?page=${page}`);
    
    if (!data) {
        showError('Gagal memuat data genre.');
        return;
    }

    const animeList = data.animeList || [];
    totalPages = data.pagination?.totalPages || 1;
    const genreName = animeList[0]?.genreList?.find(g => g.genreId === slug)?.title || slug;

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">🎭 Genre: ${genreName}</h2>
        <div class="anime-grid">
    `;

    animeList.forEach(anime => html += createAnimeCard(anime));
    html += `</div>`;
    html += createPagination(page, totalPages, 'genre', slug);

    document.getElementById('main-content').innerHTML = html;
}

// ==================== SCHEDULE ====================
async function loadSchedule() {
    showLoading();
    const data = await fetchAPI('/schedule');
    
    if (!data || !Array.isArray(data)) {
        showError('Gagal memuat data jadwal. Periksa koneksi internet Anda.');
        return;
    }

    // Urutan hari yang diinginkan
    const dayOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu', 'Random'];
    
    // Urutkan data berdasarkan dayOrder
    const sortedData = dayOrder
        .map(day => data.find(item => item.day === day))
        .filter(item => item !== undefined);

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">📅 Jadwal Rilis Anime</h2>
        <div class="schedule-container">
            <div class="schedule-tabs">
    `;

    // Buat tabs
    sortedData.forEach((item, index) => {
        html += `<button class="schedule-tab ${index === 0 ? 'active' : ''}" onclick="showScheduleDay('${item.day}', this)">${item.day}</button>`;
    });

    html += `</div>`;

    // Buat konten untuk setiap hari
    sortedData.forEach((item, index) => {
        html += `
            <div id="schedule-${item.day}" class="schedule-day-content ${index === 0 ? 'active' : ''}">
                <div class="schedule-day-header">
                    <i class="far fa-calendar-alt"></i> ${item.day}
                </div>
        `;

        if (item.anime_list && item.anime_list.length > 0) {
            item.anime_list.forEach(anime => {
                html += `
                    <div class="schedule-anime-item" onclick="navigateTo('detail', '${anime.slug}')">
                        <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
                        <div class="schedule-anime-info">
                            <h4>${anime.title}</h4>
                            <p><i class="far fa-clock"></i> Rilis setiap ${item.day}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `<p style="color: #aaa; text-align: center; padding: 30px;">Tidak ada jadwal untuk hari ${item.day}</p>`;
        }

        html += `</div>`;
    });

    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

// Function to show selected schedule day
function showScheduleDay(day, element) {
    // Update tabs
    document.querySelectorAll('.schedule-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    element.classList.add('active');

    // Update content
    document.querySelectorAll('.schedule-day-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`schedule-${day}`).classList.add('active');
}

// ==================== ALL ANIME ====================
async function loadAllAnime() {
    showLoading();
    const data = await fetchAPI('/unlimited');
    
    if (!data || !data.list) {
        showError('Gagal memuat data semua anime.');
        return;
    }

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">📚 Semua Anime</h2>
        <div class="alphabet-filter">
            <button class="alphabet-item ${!currentAlphabet ? 'active' : ''}" onclick="filterAlphabet('')">All</button>
    `;

    '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
        html += `<button class="alphabet-item ${currentAlphabet === letter ? 'active' : ''}" onclick="filterAlphabet('${letter}')">${letter}</button>`;
    });

    html += `</div><div class="anime-grid">`;

    let hasResults = false;
    data.list.forEach(group => {
        if (!currentAlphabet || currentAlphabet === '' || currentAlphabet === 'All' || group.startWith === currentAlphabet) {
            group.animeList.forEach(anime => {
                hasResults = true;
                html += `
                    <div class="anime-card" onclick="navigateTo('detail', '${anime.animeId}')">
                        <div style="background: linear-gradient(45deg, #ff6b1a, #ff9f4a); height: 120px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-film fa-3x" style="color: white;"></i>
                        </div>
                        <div class="anime-card-detail">
                            <h4>${anime.title}</h4>
                        </div>
                    </div>
                `;
            });
        }
    });

    if (!hasResults) {
        html += `<p style="grid-column: 1/-1; text-align: center; padding: 50px; color: #aaa;">Tidak ada anime dengan huruf "${currentAlphabet}"</p>`;
    }

    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

function filterAlphabet(letter) {
    currentAlphabet = letter;
    loadAllAnime();
}

// ==================== ANIME DETAIL ====================
async function loadAnimeDetail(slug) {
    showLoading();
    const data = await fetchAPI(`/anime/${slug}`);
    
    if (!data) {
        showError('Gagal memuat detail anime.');
        return;
    }

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <div class="detail-container">
            <div class="detail-header">
                <div class="detail-poster">
                    <img src="${data.poster}" alt="${data.title}" loading="lazy">
                </div>
                <div class="detail-info">
                    <h1>${data.title}</h1>
                    <p style="color: #aaa;">${data.japanese || ''}</p>
                    
                    <div class="info-table">
                        <span class="info-label">Skor:</span>
                        <span class="info-value">${data.score || 'N/A'}</span>
                        <span class="info-label">Tipe:</span>
                        <span class="info-value">${data.type || 'N/A'}</span>
                        <span class="info-label">Status:</span>
                        <span class="info-value">${data.status || 'N/A'}</span>
                        <span class="info-label">Episode:</span>
                        <span class="info-value">${data.episodes || '?'}</span>
                        <span class="info-label">Durasi:</span>
                        <span class="info-value">${data.duration || 'N/A'}</span>
                        <span class="info-label">Tayang:</span>
                        <span class="info-value">${data.aired || 'N/A'}</span>
                        <span class="info-label">Studio:</span>
                        <span class="info-value">${data.studios || 'N/A'}</span>
                    </div>
                    
                    <div class="genre-list">
    `;

    if (data.genreList) {
        data.genreList.forEach(genre => {
            html += `<button class="genre-badge" onclick="navigateTo('genre', '${genre.genreId}')">${genre.title}</button>`;
        });
    }

    html += `
                    </div>
                </div>
            </div>
            
            <div class="synopsis">
                <h3>Sinopsis</h3>
                <p>${data.synopsis?.paragraphs?.join(' ') || 'Sinopsis tidak tersedia.'}</p>
            </div>
            
            <div class="episode-list">
                <h3>Daftar Episode</h3>
    `;

    if (data.episodeList && data.episodeList.length > 0) {
        [...data.episodeList].reverse().forEach(ep => {
            html += `
                <div class="episode-item" onclick="navigateTo('episode', '${ep.episodeId}')">
                    <span class="episode-title">${ep.title}</span>
                    <span class="episode-date">${ep.date}</span>
                </div>
            `;
        });
    } else {
        html += `<p style="color: #aaa; text-align: center; padding: 20px;">Belum ada episode.</p>`;
    }

    html += `
            </div>
            
            <div style="margin-top: 30px;">
                <h3>Rekomendasi Anime</h3>
                <div class="anime-grid">
    `;

    if (data.recommendedAnimeList) {
        data.recommendedAnimeList.forEach(anime => {
            html += createAnimeCard(anime);
        });
    }

    html += `
                </div>
            </div>
        </div>
    `;

    document.getElementById('main-content').innerHTML = html;
}

// ==================== EPISODE DETAIL ====================
async function loadEpisodeDetail(episodeId) {
    showLoading();
    const data = await fetchAPI(`/episode/${episodeId}`);
    
    if (!data) {
        showError('Gagal memuat episode.');
        return;
    }

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <div class="detail-container">
            <h1>${data.title}</h1>
            
            <div class="streaming-container">
                <div class="video-wrapper">
                    <iframe src="${data.defaultStreamingUrl}" allowfullscreen></iframe>
                </div>
            </div>
            
            <div style="margin: 20px 0; color: #aaa;">
                <i class="far fa-clock"></i> ${data.releaseTime}
            </div>
            
            <div class="nav-episode">
    `;

    if (data.hasPrevEpisode) {
        html += `<button class="nav-episode-btn" onclick="navigateTo('episode', '${data.prevEpisode.episodeId}')"><i class="fas fa-chevron-left"></i> Sebelumnya</button>`;
    } else {
        html += `<button class="nav-episode-btn" disabled><i class="fas fa-chevron-left"></i> Sebelumnya</button>`;
    }

    if (data.hasNextEpisode) {
        html += `<button class="nav-episode-btn" onclick="navigateTo('episode', '${data.nextEpisode.episodeId}')">Selanjutnya <i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button class="nav-episode-btn" disabled>Selanjutnya <i class="fas fa-chevron-right"></i></button>`;
    }

    html += `</div>`;

    if (data.info) {
        html += `
            <div style="margin-top: 30px; background-color: #0f0f13; padding: 20px; border-radius: 10px;">
                <h3>Info Anime</h3>
                <p><strong>Credit:</strong> ${data.info.credit}</p>
                <p><strong>Encoder:</strong> ${data.info.encoder}</p>
                <p><strong>Durasi:</strong> ${data.info.duration}</p>
                <p><strong>Tipe:</strong> ${data.info.type}</p>
                <div style="margin-top: 10px;">
                    <strong>Genre:</strong>
                    <div class="genre-list" style="margin-top: 8px;">
        `;

        if (data.info.genreList) {
            data.info.genreList.forEach(genre => {
                html += `<button class="genre-badge" onclick="navigateTo('genre', '${genre.genreId}')">${genre.title}</button>`;
            });
        }

        html += `
                    </div>
                </div>
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById('main-content').innerHTML = html;
}

// ==================== SEARCH ====================
async function loadSearchResults(keyword) {
    showLoading();
    currentKeyword = keyword;
    const data = await fetchAPI(`/search/${keyword}`);
    
    if (!data || !data.animeList || data.animeList.length === 0) {
        document.getElementById('main-content').innerHTML = `
            <button class="back-button" onclick="goBack()">
                <i class="fas fa-arrow-left"></i> Kembali
            </button>
            <div class="error-container">
                <div class="error-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h2 class="error-message">Tidak ada hasil untuk "${keyword}"</h2>
                <button class="retry-btn" onclick="navigateTo('home')">
                    <i class="fas fa-home"></i> Kembali ke Home
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <button class="back-button" onclick="goBack()">
            <i class="fas fa-arrow-left"></i> Kembali
        </button>
        <h2 class="section-title">🔍 Hasil Pencarian: "${keyword}" (${data.animeList.length})</h2>
        <div class="anime-grid">
    `;

    data.animeList.forEach(anime => html += createAnimeCard(anime));
    html += `</div>`;

    document.getElementById('main-content').innerHTML = html;
}

function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) navigateTo('search', keyword);
}

function handleSearchKey(e) {
    if (e.key === 'Enter') performSearch();
}

// ==================== UTILITY FUNCTIONS ====================
function createAnimeCard(anime) {
    const episodes = anime.episodes || '?';
    const id = anime.animeId || anime.slug;
    
    let extraInfo = '';
    if (anime.score) extraInfo = `<span><i class="fas fa-star"></i> ${anime.score}</span>`;
    else if (anime.releaseDay) extraInfo = `<span><i class="far fa-calendar-alt"></i> ${anime.releaseDay}</span>`;
    else if (anime.lastReleaseDate) extraInfo = `<span><i class="far fa-calendar-alt"></i> ${anime.lastReleaseDate}</span>`;

    return `
        <div class="anime-card" onclick="navigateTo('detail', '${id}')">
            <img src="${anime.poster}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-detail">
                <h4>${anime.title}</h4>
                <p>Episode ${episodes}</p>
                <div class="anime-meta">${extraInfo}</div>
            </div>
        </div>
    `;
}

function createPagination(current, total, pageType, param = '') {
    return `
        <div class="page-nav">
            <button class="page-btn" ${current <= 1 ? 'disabled' : ''} onclick="navigateTo('${pageType}', '${param}', ${current - 1})">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span class="page-info">Halaman ${current} dari ${total}</span>
            <button class="page-btn" ${current >= total ? 'disabled' : ''} onclick="navigateTo('${pageType}', '${param}', ${current + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

// ==================== INIT ====================
window.onload = () => {
    const hash = window.location.hash.substring(1).split('/');
    const page = hash[0] || 'home';
    const param = hash[1] || '';
    const pageNum = parseInt(hash[2]) || 1;
    navigateTo(page, param, pageNum);
};
