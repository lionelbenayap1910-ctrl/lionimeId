if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('✅ Service Worker registered'))
      .catch(err => console.log('❌ Service Worker error:', err));
  });
}

// Handle beforeinstallprompt event
let deferredPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  
  setTimeout(() => {
    const installDiv = document.createElement('div');
    installDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #ff6b1a;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    installDiv.innerHTML = '<i class="fas fa-download"></i> Install Aplikasi';
    
    installDiv.onclick = async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
      installDiv.remove();
    };
    
    document.body.appendChild(installDiv);
  }, 30000);
});
