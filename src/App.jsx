import { useState, useEffect } from 'react';
import configData from './data/config.json';
import './index.css';

function App() {
  const [animes] = useState(configData.animes || []);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [covers] = useState({}); // Keep for backward compatibility if needed, but not populated now
  const [searchTerm, setSearchTerm] = useState("");

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
          <span style={{ fontSize: "0.8rem", color: "var(--accent-color)", alignSelf: "flex-end", marginBottom: "15px", marginLeft: "-10px", fontWeight: "700" }}>v1</span>
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
                    {anime.image ? (
                      <img src={anime.image} alt={anime.title} className="anime-cover" loading="lazy" />
                    ) : (
                      <div className="loader-container" style={{ height: "100%", background: "var(--bg-secondary)" }}>
                        <span className="loader"></span>
                      </div>
                    )}
                    <div className="anime-card-overlay">
                      <div className="anime-titles">
                        <h3 className="anime-title">{anime.title}</h3>
                        {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                          <span className="anime-title-en">{anime.titleEnglish}</span>
                        )}
                        {anime.titleNative && (
                          <span className="anime-title-jp">{anime.titleNative}</span>
                        )}
                      </div>
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
              {covers[selectedAnime.id] ? (
                <img src={covers[selectedAnime.id]} alt={selectedAnime.title} className="detail-cover" />
              ) : selectedAnime.image && (
                <img src={selectedAnime.image} alt={selectedAnime.title} className="detail-cover" />
              )}
              <div className="detail-info">
                <div className="anime-titles" style={{ marginBottom: "0.5rem" }}>
                  <h1 className="detail-title text-gradient" style={{ fontSize: "2.5rem" }}>{selectedAnime.title}</h1>
                  {selectedAnime.titleEnglish && selectedAnime.titleEnglish !== selectedAnime.title && (
                    <span className="anime-title-en" style={{ fontSize: "1.2rem" }}>{selectedAnime.titleEnglish}</span>
                  )}
                  {selectedAnime.titleNative && (
                    <span className="anime-title-jp" style={{ fontSize: "1rem" }}>{selectedAnime.titleNative}</span>
                  )}
                </div>
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
