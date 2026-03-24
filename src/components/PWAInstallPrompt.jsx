import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // IOS Detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios);

    // Initial check for iOS
    if (ios && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Wait for a few seconds before showing our custom prompt
      setTimeout(() => setShowPrompt(true), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAndroidInstall = () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-prompt shadow-in">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-header">
          <img src="/pwaicon.png" alt="App Icon" className="pwa-prompt-icon" />
          <div className="pwa-prompt-text">
            <h4>{isIOS ? 'Ana Ekrana Ekle' : 'Uygulamayı Yükle'}</h4>
            <p>Daha hızlı erişim ve tam ekran deneyimi için efsanewatch'u {isIOS ? 'ana ekranınıza ekleyin' : 'telefonunuza yükleyin'}.</p>
          </div>
          <button className="pwa-prompt-close" onClick={() => setShowPrompt(false)}>×</button>
        </div>
        
        {isIOS ? (
          <div className="pwa-prompt-footer">
            <span>Alttaki paylaş </span>
            <svg className="ios-share-icon" width="20" height="20" viewBox="0 0 50 50">
              <path fill="#007AFF" d="M30.3,13.7L25,8.4l-5.3,5.3l-1.4-1.4L25,5.6l6.7,6.7L30.3,13.7z M24,30.3V8.4h2v21.9H24z M13,19h6v2h-6v22h24V21h-6v-2h8 v26H11V19H13z" />
            </svg>
            <span> butonuna basın ve ardından <b>"Ana Ekrana Ekle"</b> seçeneğini seçin.</span>
          </div>
        ) : (
          <div className="pwa-prompt-footer" style={{ justifyContent: 'center' }}>
            <button className="episode-btn active" onClick={handleAndroidInstall} style={{ padding: '0.6rem 2rem', width: '100%', borderRadius: '12px' }}>
              Şimdi Yükle
            </button>
          </div>
        )}
      </div>
      <style>{`
        .pwa-prompt {
          position: fixed;
          bottom: 25px;
          left: 15px;
          right: 15px;
          background: rgba(20, 20, 22, 0.9);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          z-index: 9999;
          padding: 18px;
          color: white;
          box-shadow: 0 15px 50px rgba(0,0,0,0.6);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 500px;
          margin: 0 auto;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .pwa-prompt-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .pwa-prompt-header {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
        }

        .pwa-prompt-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .pwa-prompt-text h4 {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .pwa-prompt-text p {
          margin: 6px 0 0;
          font-size: 13.5px;
          color: #9ca3af;
          line-height: 1.5;
        }

        .pwa-prompt-close {
          position: absolute;
          top: -8px;
          right: -8px;
          background: rgba(255,255,255,0.06);
          border: none;
          color: #9ca3af;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        
        .pwa-prompt-close:hover {
          color: white;
          background: rgba(255,255,255,0.15);
        }

        .pwa-prompt-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 15px;
          font-size: 14px;
          line-height: 1.6;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ios-share-icon {
          display: inline-block;
          vertical-align: middle;
          margin: 0 2px;
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
