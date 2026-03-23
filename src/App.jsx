import { useState, useEffect } from 'react';
import configData from './data/config.json';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState('anime'); // 'anime' veya 'manga'
  const [animes] = useState(configData.animes || []);
  const [mangas] = useState(configData.mangas || []);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = viewMode === 'manga' ? 'efsanemanga' : 'efsanewatch';
    
    // Favicon değişimi
    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = viewMode === 'manga' ? './favicon2.png' : './favicon.png';
    }
  }, [viewMode]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (viewMode === 'anime') {
      const firstSeason = item.seasons?.[0];
      if (firstSeason) {
        setSelectedSeason(firstSeason);
      }
      setSelectedEpisode(null);
      setSelectedSource(null);
    } else {
      setSelectedChapter(null);
    }
    setSearchTerm("");
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setSelectedSeason(null);
    setSelectedEpisode(null);
    setSelectedSource(null);
    setSelectedChapter(null);
  };

  const handleSeasonChange = (e) => {
    const seasonName = e.target.value;
    const season = selectedItem.seasons.find(s => s.name === seasonName);
    setSelectedSeason(season);
    setSelectedEpisode(null);
    setSelectedSource(null);
  };

  const handleSourceChange = (e) => {
    const sourceUrl = e.target.value;
    const source = selectedEpisode.sources.find(s => s.url === sourceUrl);
    setSelectedSource(source);
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    let processedUrl = url;
    if (processedUrl.includes("drive.google.com/file/d/")) {
      processedUrl = processedUrl.replace(/\/view(\?.*)?$/i, "/preview");
    }
    if (processedUrl.includes("voe.sx/") && !processedUrl.includes("/e/")) {
      processedUrl = processedUrl.replace("voe.sx/", "voe.sx/e/");
    }
    if (processedUrl.includes("video.sibnet.ru/video") && !processedUrl.includes("shell.php")) {
      processedUrl = processedUrl.replace("video.sibnet.ru/video", "video.sibnet.ru/shell.php?videoid=");
    }
    return processedUrl;
  };

  const items = viewMode === 'anime' ? animes : mangas;

  return (
    <div className={`app-container ${viewMode}-mode`}>
      {/* HEADER */}
      <header className="header" style={{ padding: "1rem 5%" }}>
        <div className="logo" onClick={handleBack}>
          <img 
            src={viewMode === 'manga' ? "./logo2.png" : "./logo.png"} 
            alt="efsanewatch" 
            style={{ height: "75px", objectFit: "contain" }} 
          />
          <span style={{ 
            fontSize: "0.8rem", 
            color: viewMode === 'manga' ? "#ffa9f9" : "#94b9ff",
            alignSelf: "flex-end", 
            marginBottom: "15px", 
            marginLeft: "-10px", 
            fontWeight: "700" 
          }}>v2</span>
        </div>

        <div className="mode-toggle">
          <button 
            className={`mode-btn ${viewMode === 'anime' ? 'active' : ''}`}
            onClick={() => { setViewMode('anime'); handleBack(); }}
          >
            anime
          </button>
          <button 
            className={`mode-btn ${viewMode === 'manga' ? 'active' : ''}`}
            onClick={() => { setViewMode('manga'); handleBack(); }}
          >
            manga
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {!selectedItem ? (
          /* GRID VIEW */
          <div>
            <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>
              En Yeni <span className="text-gradient">{viewMode === 'anime' ? 'Bölümler' : 'Mangalar'}</span>
            </h1>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Aradığınız seriyi seçerek {viewMode === 'anime' ? 'bölümlere' : 'okumaya'} ulaşabilirsiniz.
            </p>

            <div className="search-container" style={{ marginBottom: "2rem" }}>
              <input
                type="text"
                className="select-box"
                style={{ width: "100%", padding: "1rem", backgroundImage: "none", fontSize: "1.1rem" }}
                placeholder={`${viewMode === 'anime' ? 'Anime' : 'Manga'} Ara...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="anime-grid">
              {items
                .filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.searchTitle.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <div key={item.id} className="anime-card" onClick={() => handleItemClick(item)}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="anime-cover" loading="lazy" />
                    ) : (
                      <div className="loader-container" style={{ height: "100%", background: "var(--bg-secondary)" }}>
                        <span className="loader"></span>
                      </div>
                    )}
                    <div className="anime-card-overlay">
                      <div className="anime-titles">
                        <h3 className="anime-title">{item.title}</h3>
                        {item.titleEnglish && item.titleEnglish !== item.title && (
                          <span className="anime-title-en">{item.titleEnglish}</span>
                        )}
                        {item.titleNative && (
                          <span className="anime-title-jp">{item.titleNative}</span>
                        )}
                      </div>
                      <div className="anime-tags">
                        {item.tags?.map(tag => (
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
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.title} className="detail-cover" />
              )}
              <div className="detail-info">
                <div className="anime-titles">
                  <h1 className="detail-title text-gradient">{selectedItem.title}</h1>
                  {selectedItem.titleEnglish && selectedItem.titleEnglish !== selectedItem.title && (
                    <span className="anime-title-en">{selectedItem.titleEnglish}</span>
                  )}
                  {selectedItem.titleNative && (
                    <span className="anime-title-jp">{selectedItem.titleNative}</span>
                  )}
                </div>
                <div className="anime-tags">
                  {selectedItem.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <p className="detail-desc">{selectedItem.description}</p>
              </div>
            </div>

            {/* ANİME CONTENT */}
            {viewMode === 'anime' && (
              <>
                {selectedItem.seasons && selectedItem.seasons.length > 0 && (
                  <div className="selection-row">
                    <div className="selection-group">
                      <label className="selection-label">Sezon</label>
                      <select className="select-box" value={selectedSeason?.name || ''} onChange={handleSeasonChange}>
                        {selectedItem.seasons.map(season => (
                          <option key={season.name} value={season.name}>{season.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedSeason && (
                  <div className="episodes-section">
                    <h3 className="section-title">Bölümler</h3>
                    <div className="episodes-grid">
                      {selectedSeason.episodes.map(ep => (
                        <button
                          key={ep.number}
                          className={`episode-btn ${selectedEpisode?.number === ep.number ? 'active' : ''}`}
                          onClick={() => { setSelectedEpisode(ep); setSelectedSource(ep.sources?.[0] || null); }}
                        >
                          Bölüm {ep.number}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEpisode && (
                  <div style={{ marginTop: "2rem" }}>
                    {selectedEpisode.sources?.length > 0 && (
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
                    <div className="player-container">
                      {selectedSource && selectedSource.url ? (
                        <iframe src={getEmbedUrl(selectedSource.url)} className="player-iframe" allowFullScreen title="Video Player"></iframe>
                      ) : (
                        <div className="loader-container" style={{ height: "100%", background: "var(--bg-secondary)" }}>
                          <p style={{ color: "var(--text-muted)" }}>Lütfen kaynak ekleyin.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* MANGA CONTENT */}
            {viewMode === 'manga' && (
              <div className="manga-section">
                <h3 className="section-title">Bölümler</h3>
                <div className="episodes-grid">
                  {selectedItem.chapters?.map(chapter => (
                    <button
                      key={chapter.number}
                      className={`episode-btn ${selectedChapter?.number === chapter.number ? 'active' : ''}`}
                      onClick={() => setSelectedChapter(chapter)}
                    >
                      Bölüm {chapter.number}
                    </button>
                  ))}
                </div>

                {selectedChapter && (
                  <div className="manga-viewer" style={{ marginTop: "3rem" }}>
                    <div className="manga-pages">
                      {selectedChapter.pages.map((page, index) => (
                        <img 
                          key={index} 
                          src={page} 
                          alt={`Sayfa ${index + 1}`} 
                          className="manga-page-img"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
