import { useState, useEffect } from 'react';
import configData from './data/config.json';
import './index.css';

function App() {
  const [animes] = useState(configData.animes || []);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [covers, setCovers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCovers = async () => {
      const newCovers = { ...covers };
      let updated = false;

      for (const anime of animes) {
        if (!newCovers[anime.id]) {
          // Statik (Manuel) bir görsel tanımlanmışsa API'ı es geç
          if (anime.image) {
            newCovers[anime.id] = anime.image;
            updated = true;
            continue;
          }

          const cacheKey = `cover_${anime.id}_${anime.searchTitle}`;
          const cachedCover = localStorage.getItem(cacheKey);
          if (cachedCover) {
            newCovers[anime.id] = cachedCover;
            updated = true;
            continue;
          }

          try {
            // Jikan API rate limiter avoid 3 requests/sec
            await new Promise(r => setTimeout(r, 600));
            const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.searchTitle)}&limit=1`);
            const data = await res.json();

            if (data.data && data.data.length > 0) {
              const coverUrl = data.data[0].images.jpg.large_image_url;
              newCovers[anime.id] = coverUrl;
              localStorage.setItem(cacheKey, coverUrl);
              updated = true;
            } else {
              const noCover = "https://via.placeholder.com/300x450/1a1d24/ffffff?text=Kapak+Yok";
              newCovers[anime.id] = noCover;
            }
          } catch (error) {
            console.error("Cover fetch failed for:", anime.searchTitle, error);
          }
        }
      }

      if (updated) {
        setCovers(newCovers);
      }
    };

    if (animes.length > 0) {
      fetchCovers();
    }
  }, [animes]); // Sadece ilk yüklemede çalışır

  const handleAnimeClick = (anime) => {
    setSelectedAnime(anime);
    const firstSeason = anime.seasons?.[0];
    if (firstSeason) {
      setSelectedSeason(firstSeason);
    }
    // Player sadece bölüme tıklanınca açılacak
    setSelectedEpisode(null);
    setSelectedSource(null);
    setSearchTerm("");
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedAnime(null);
    setSelectedSeason(null);
    setSelectedEpisode(null);
    setSelectedSource(null);
  };

  const handleSeasonChange = (e) => {
    const seasonName = e.target.value;
    const season = selectedAnime.seasons.find(s => s.name === seasonName);
    setSelectedSeason(season);

    // Sezon değiştiğinde bölümü sıfırla ki player kapansın
    setSelectedEpisode(null);
    setSelectedSource(null);
  };

  const handleEpisodeChange = (e) => {
    const epNum = parseInt(e.target.value);
    const episode = selectedSeason.episodes.find(ep => ep.number === epNum);
    setSelectedEpisode(episode);
    setSelectedSource(episode?.sources?.[0] || null);
  };

  const handleSourceChange = (e) => {
    const sourceUrl = e.target.value;
    const source = selectedEpisode.sources.find(s => s.url === sourceUrl);
    setSelectedSource(source);
  };

  // Google Drive ve Voe standart linklerini iFrame formatına otomatik çevir
  const getEmbedUrl = (url) => {
    if (!url) return "";
    let processedUrl = url;
    
    // Gdrive düzeltme
    if (processedUrl.includes("drive.google.com/file/d/")) {
      processedUrl = processedUrl.replace(/\/view(\?.*)?$/i, "/preview");
    }
    
    // Voe düzeltme (Sadece video player'ın çıkması için araya 'e' ekler)
    if (processedUrl.includes("voe.sx/") && !processedUrl.includes("/e/")) {
      processedUrl = processedUrl.replace("voe.sx/", "voe.sx/e/");
    }

    // Sibnet düzeltme (Standart video linkini iframe formatına çevirir)
    if (processedUrl.includes("video.sibnet.ru/video") && !processedUrl.includes("shell.php")) {
      processedUrl = processedUrl.replace("video.sibnet.ru/video", "video.sibnet.ru/shell.php?videoid=");
    }
    
    return processedUrl;
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header" style={{ padding: "1rem 5%" }}>
        <div className="logo" onClick={handleBack}>
          <img src="./logo.png" alt="efsanewatch" style={{ height: "75px", objectFit: "contain" }} />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {!selectedAnime ? (
          /* GRID VIEW */
          <div>
            <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>
              En Yeni <span className="text-gradient">Bölümler</span>
            </h1>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Aradığınız seriyi seçerek bölümlere ulaşabilirsiniz.
            </p>

            <div className="search-container" style={{ marginBottom: "2rem" }}>
              <input
                type="text"
                className="select-box"
                style={{ width: "100%", padding: "1rem", backgroundImage: "none", fontSize: "1.1rem" }}
                placeholder="Anime Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="anime-grid">
              {animes
                .filter(anime => anime.title.toLowerCase().includes(searchTerm.toLowerCase()) || anime.searchTitle.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(anime => (
                  <div key={anime.id} className="anime-card" onClick={() => handleAnimeClick(anime)}>
                    {covers[anime.id] ? (
                      <img src={covers[anime.id]} alt={anime.title} className="anime-cover" loading="lazy" />
                    ) : (
                      <div className="loader-container" style={{ height: "100%", background: "var(--bg-secondary)" }}>
                        <span className="loader"></span>
                      </div>
                    )}
                    <div className="anime-card-overlay">
                      <h3 className="anime-title">{anime.title}</h3>
                      <div className="anime-tags">
                        {anime.tags?.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* DETAIL VIEW */
          <div className="detail-view">
            <button className="back-btn" onClick={handleBack}>
              ← Tüm Serilere Dön
            </button>

            <div className="detail-header">
              {covers[selectedAnime.id] && (
                <img src={covers[selectedAnime.id]} alt={selectedAnime.title} className="detail-cover" />
              )}
              <div className="detail-info">
                <h1 className="detail-title text-gradient">{selectedAnime.title}</h1>
                <div className="anime-tags" style={{ marginBottom: "0.5rem" }}>
                  {selectedAnime.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="detail-desc">{selectedAnime.description}</p>
              </div>
            </div>

            {/* SELECTIONS */}
            {selectedAnime.seasons && selectedAnime.seasons.length > 0 && (
              <div className="selection-row">
                {/* SEASON SELECT */}
                <div className="selection-group">
                  <label className="selection-label">Sezon</label>
                  <select className="select-box" value={selectedSeason?.name || ''} onChange={handleSeasonChange}>
                    {selectedAnime.seasons.map(season => (
                      <option key={season.name} value={season.name}>{season.name}</option>
                    ))}
                  </select>
                </div>

              </div>
            )}

            {/* EPISODE LIST (GRID/BUTTONS) */}
            {selectedSeason && selectedSeason.episodes && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>Bölümler</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {selectedSeason.episodes.map(ep => (
                    <button
                      key={ep.number}
                      onClick={() => { setSelectedEpisode(ep); setSelectedSource(ep.sources?.[0] || null); }}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: selectedEpisode?.number === ep.number ? "var(--accent-color)" : "var(--bg-glass)",
                        color: "var(--text-primary)",
                        border: selectedEpisode?.number === ep.number ? "1px solid var(--accent-hover)" : "1px solid var(--border-glass)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      Bölüm {ep.number}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOURCE SELECT & PLAYER */}
            {selectedEpisode && (
              <div style={{ marginTop: "2rem" }}>
                {selectedEpisode.sources && selectedEpisode.sources.length > 0 && (
                  <div className="selection-row" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <div className="selection-group" style={{ flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                      <label className="selection-label" style={{ margin: 0 }}>Kaynak:</label>
                      <select className="select-box" style={{ flex: 1, minWidth: "200px" }} value={selectedSource?.url || ''} onChange={handleSourceChange}>
                        {selectedEpisode.sources.map((src, index) => (
                          <option key={index} value={src.url}>{src.type.toUpperCase()} - {src.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* IFRAME PLAYER */}
                <div className="player-container">
                  {selectedSource && selectedSource.url ? (
                    <iframe
                      src={getEmbedUrl(selectedSource.url)}
                      className="player-iframe"
                      allowFullScreen
                      title="Video Player"
                    ></iframe>
                  ) : (
                    <div className="loader-container" style={{ height: "100%", flexDirection: "column", gap: "1rem", background: "var(--bg-secondary)" }}>
                      <p style={{ color: "var(--text-muted)" }}>Lütfen konfigürasyondan izlenebilecek bir kaynak (URL) ekleyin.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
