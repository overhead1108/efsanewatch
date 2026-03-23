import fs from 'fs';

const configPath = './src/data/config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchFromAniList(title) {
  const query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
        }
        description
      }
    }
  `;

  const variables = { search: title };

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
  
  for (let anime of config.animes) {
    console.log(`Fetching: ${anime.searchTitle}`);
    
    // Always fetch to ensure we get titles + high quality image
    const data = await fetchFromAniList(anime.searchTitle);
    
    if (data) {
      anime.image = data.coverImage.extraLarge;
      anime.titleEnglish = data.title.english || data.title.romaji;
      anime.titleNative = data.title.native;
      
      // Update description if it was generic or missing
      if (!anime.description || anime.description.length < 20) {
        anime.description = data.description?.replace(/<br>/g, '').replace(/<i>/g, '').replace(/<\/i>/g, '') || anime.description;
      }

      updated = true;
      console.log(`Success: ${anime.titleEnglish} (${anime.titleNative})`);
    } else {
      console.log(`Not found on AniList.`);
    }
    
    // AniList rate limit is 90 per minute
    await delay(700);
  }

  if (updated) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Files updated with AniList metadata.");
  } else {
    console.log("No updates performed.");
  }
}

main();
