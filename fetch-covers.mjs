import fs from 'fs';

const configPath = './src/data/config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchFromAniList(title, type = 'ANIME') {
  const query = `
    query ($search: String, $type: MediaType) {
      Media (search: $search, type: $type) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          extraLarge
        }
        description
      }
    }
  `;

  const variables = { search: title, type: type };

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    return result.data && result.data.Media ? result.data.Media : null;
  } catch (error) {
    console.error(`AniList error for ${title}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting AniList metadata fetch...");
  let updated = false;
  
  // Process Anime
  if (config.animes) {
    for (let anime of config.animes) {
      console.log(`Fetching Anime: ${anime.searchTitle}`);
      const data = await fetchFromAniList(anime.searchTitle, 'ANIME');
      if (data) {
        anime.image = data.coverImage.extraLarge || data.coverImage.large;
        anime.titleEnglish = data.title.english || data.title.romaji;
        anime.titleNative = data.title.native;
        if (!anime.description || anime.description.length < 20) {
          anime.description = data.description?.replace(/<br>/g, '').replace(/<i>/g, '').replace(/<\/i>/g, '') || anime.description;
        }
        updated = true;
        console.log(`Success Anime: ${anime.titleEnglish}`);
      }
      await delay(800);
    }
  }

  // Process Manga
  if (config.mangas) {
    for (let manga of config.mangas) {
      console.log(`Fetching Manga: ${manga.searchTitle}`);
      const data = await fetchFromAniList(manga.searchTitle, 'MANGA');
      if (data) {
        manga.image = data.coverImage.extraLarge || data.coverImage.large;
        manga.titleEnglish = data.title.english || data.title.romaji;
        manga.titleNative = data.title.native;
        if (!manga.description || manga.description.length < 20) {
          manga.description = data.description?.replace(/<br>/g, '').replace(/<i>/g, '').replace(/<\/i>/g, '') || manga.description;
        }
        updated = true;
        console.log(`Success Manga: ${manga.titleEnglish}`);
      }
      await delay(800);
    }
  }

  if (updated) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Files updated with AniList metadata.");
  } else {
    console.log("No updates performed.");
  }
}

main();
