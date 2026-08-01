export interface Game {
  id: string;
  name: string;
  coverUrl: string;
  launchUrl: string;
  appScheme?: string;
}

export const GAMES_DB: Game[] = [
  { id: "roblox", name: "Roblox", coverUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Roblox_2022_logo.png/600px-Roblox_2022_logo.png", launchUrl: "https://www.roblox.com", appScheme: "roblox://" },
  { id: "minecraft", name: "Minecraft", coverUrl: "https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_The_Wild_Update-keyart.jpg", launchUrl: "https://www.minecraft.net", appScheme: "minecraft://" },
  { id: "fortnite", name: "Fortnite", coverUrl: "https://cdn2.unrealengine.com/14br-consent-landingpage-2560x1440-2560x1440-166d34e0f03e.jpg", launchUrl: "https://www.epicgames.com/fortnite" },
  { id: "pubg", name: "PUBG Mobile", coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/578080/capsule_616x353.jpg", launchUrl: "https://pubg.com", appScheme: "PUBGM://" },
  { id: "cod", name: "Call of Duty Mobile", coverUrl: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/mw3/social/mw3-meta-share.jpg", launchUrl: "https://www.callofduty.com/mobile" },
  { id: "genshin", name: "Genshin Impact", coverUrl: "https://upload.wikimedia.org/wikipedia/en/3/3f/Genshin_Impact_cover_art.jpg", launchUrl: "https://genshin.hoyoverse.com", appScheme: "yuansheng://" },
  { id: "among-us", name: "Among Us", coverUrl: "https://www.innersloth.com/wp-content/uploads/2021/08/Among-Us-Roadmap.jpg", launchUrl: "https://www.innersloth.com/games/among-us/" },
  { id: "valorant", name: "Valorant", coverUrl: "https://www.riotgames.com/typo/1200x630.jpg", launchUrl: "https://playvalorant.com" },
  { id: "apex", name: "Apex Legends", coverUrl: "https://media.contentapi.ea.com/content/dam/apex-legends/images/2023/01/apex-featured-image-16x9.jpg.adapt.1920w.jpg", launchUrl: "https://www.ea.com/games/apex-legends" },
  { id: "lol", name: "League of Legends", coverUrl: "https://www.leagueoflegends.com/static/open-graph-b580f0e77c9c7ceb89bc.jpg", launchUrl: "https://www.leagueoflegends.com" },
  { id: "gta5", name: "GTA V", coverUrl: "https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png", launchUrl: "https://www.rockstargames.com/gta-v" },
  { id: "cyberpunk", name: "Cyberpunk 2077", coverUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg", launchUrl: "https://www.cyberpunk.net" }
];