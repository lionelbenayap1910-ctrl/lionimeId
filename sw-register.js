// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Cek update
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Service Worker update found!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Tampilkan notifikasi update ke user
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    
    // Background sync
    if ('SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-data');
      });
    }
  });
  
  // Handle controller change (update)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Fungsi untuk menampilkan notifikasi update
function showUpdateNotification() {
  const updateDiv = document.createElement('div');
  updateDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff6b1a;
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    cursor: pointer;
    animation: slideIn 0.3s ease;
  `;
  
  updateDiv.innerHTML = `
    <strong>Update Tersedia!</strong>
    <p style="margin: 5px 0 0; font-size: 14px;">Klik untuk memperbarui aplikasi</p>
  `;
  
  updateDiv.onclick = () => {
    navigator.serviceWorker.ready.then(registration => {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    });
    updateDiv.remove();
  };
  
  document.body.appendChild(updateDiv);
  
  // Auto hide after 10 seconds
  setTimeout(() => {
    if (updateDiv.parentNode) {
      updateDiv.remove();
    }
  }, 10000);
}

// Check online/offline status
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function updateOnlineStatus() {
  const statusDiv = document.getElementById('online-status') || createStatusDiv();
  
  if (navigator.onLine) {
    statusDiv.textContent = 'Online';
    statusDiv.style.background = '#4CAF50';
    setTimeout(() => statusDiv.remove(), 3000);
  } else {
    statusDiv.textContent = 'Offline - Menampilkan data cache';
    statusDiv.style.background = '#f44336';
  }
}

function createStatusDiv() {
  const div = document.createElement('div');
  div.id = 'online-status';
  div.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    z-index: 9999;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(div);
  return div;
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }
}

// Call on first load
requestNotificationPermission();

// Handle beforeinstallprompt event (Add to Home Screen)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', event => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  event.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = event;
  
  // Show install button
  showInstallButton();
});

function showInstallButton() {
  const installDiv = document.createElement('div');
  installDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #ff6b1a;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  installDiv.innerHTML = `
    <i class="fas fa-download"></i>
    <span>Install Aplikasi</span>
  `;
  
  installDiv.onclick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    deferredPrompt = null;
    installDiv.remove();
  };
  
  document.body.appendChild(installDiv);
  
  // Auto hide after 30 seconds
  setTimeout(() => {
    if (installDiv.parentNode) {
      installDiv.remove();
    }
  }, 30000);
}

// Handle app installed
window.addEventListener('appinstalled', event => {
  console.log('App was installed');
  
  // Remove install button
  const installDiv = document.querySelector('[style*="install"]');
  if (installDiv) installDiv.remove();
  
  // Show success message
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
  `;
  successDiv.textContent = 'Aplikasi berhasil diinstall!';
  document.body.appendChild(successDiv);
  
  setTimeout(() => successDiv.remove(), 3000);
});
