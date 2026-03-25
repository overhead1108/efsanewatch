import fs from 'fs';
import { execSync } from 'child_process';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

async function sendNotification(title, message, url, image) {
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
        console.log("OneSignal credentials missing. Skipping notification.");
        return;
    }

    try {
        const response = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${ONESIGNAL_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                headings: { en: title },
                contents: { en: message },
                included_segments: ["Subscribed Users"],
                url: url,
                chrome_web_image: image,
                big_picture: image
            })
        });
        const data = await response.json();
        console.log("Notification sent:", data);
    } catch (err) {
        console.error("Error sending notification:", err);
    }
}

function findNewContent() {
    try {
        const newConfig = JSON.parse(fs.readFileSync('src/data/config.json', 'utf8'));
        const oldConfigStr = execSync('git show HEAD~1:src/data/config.json', { encoding: 'utf8' });
        const oldConfig = JSON.parse(oldConfigStr);

        // Check Animes
        newConfig.animes.forEach(newAnime => {
            const oldAnime = oldConfig.animes.find(a => a.id === newAnime.id);
            if (!oldAnime) {
                // Completely new anime
                sendNotification(
                    "Yeni Seri Eklendi!",
                    `${newAnime.title} artık efsanewatch'da! Hemen izlemeye başla.`,
                    `https://overhead1108.github.io/efsanewatch/?mode=anime`,
                    newAnime.image
                );
            } else {
                // Check for new seasons or episodes
                newAnime.seasons.forEach(newSeason => {
                    const oldSeason = oldAnime.seasons.find(s => s.name === newSeason.name);
                    if (!oldSeason || newSeason.episodes.length > oldSeason.episodes.length) {
                        const newEp = newSeason.episodes[newSeason.episodes.length - 1];
                        sendNotification(
                            "Yeni Bölüm Geldi!",
                            `${newAnime.title} - ${newEp.number}. Bölüm yayında!`,
                            `https://overhead1108.github.io/efsanewatch/?mode=anime`,
                            newAnime.image
                        );
                    }
                });
            }
        });

        // Check Mangas
        newConfig.mangas.forEach(newManga => {
            const oldManga = oldConfig.mangas.find(m => m.id === newManga.id);
            if (!oldManga) {
                sendNotification(
                    "Yeni Manga Eklendi!",
                    `${newManga.title} efsanemanga'da başladı! Beğeneceğini düşünüyoruz.`,
                    `https://overhead1108.github.io/efsanewatch/?mode=manga`,
                    newManga.image
                );
            } else if (newManga.chapters.length > oldManga.chapters.length) {
                const newChapter = newManga.chapters[0]; // Assuming newest is first or check number
                sendNotification(
                    "Yeni Bölüm!",
                    `${newManga.title} - ${newChapter.number}. Bölüm yayında! Hemen oku.`,
                    `https://overhead1108.github.io/efsanewatch/?mode=manga`,
                    newManga.image
                );
            }
        });

    } catch (err) {
        console.error("Error detecting new content:", err);
    }
}

findNewContent();
