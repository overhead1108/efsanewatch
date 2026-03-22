import fs from 'fs';

const configPath = './src/data/config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log("Starting cover fetch for all animes...");
  let updated = false;
  
  for (let anime of config.animes) {
    if (anime.image && !anime.image.includes('placeholder')) {
      console.log(`Already has cover: ${anime.searchTitle}`);
      continue;
    }
    
    console.log(`Fetching: ${anime.searchTitle}`);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.searchTitle)}&limit=1`);
      
      if (!res.ok) {
        console.log(`HTTP Error ${res.status} for ${anime.searchTitle}`);
        await delay(3000); // More delay on error
        continue;
      }
      
      const data = await res.json();
      
      if (data && data.data && data.data.length > 0) {
        anime.image = data.data[0].images.jpg.large_image_url;
        updated = true;
        console.log(`Success: ${anime.image}`);
      } else {
        console.log(`Not found.`);
        anime.image = "https://via.placeholder.com/300x450/1a1d24/ffffff?text=" + encodeURIComponent(anime.searchTitle);
        updated = true;
      }
    } catch (e) {
      console.error(`Error: ${e.message}`);
    }
    
    // Very safe delay to avoid rate limiting
    await delay(1200);
  }

  if (updated) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("Files updated successfully.");
  } else {
    console.log("No updates needed.");
  }
}

main();
