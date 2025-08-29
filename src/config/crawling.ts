import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";

const GAME_MODES = [
  { key: "gem-grab", url: "GemGrab" },
  { key: "heist", url: "Heist" },
  { key: "bounty", url: "Bounty" },
  { key: "brawl-ball", url: "BrawlBall" },
  { key: "hot-zone", url: "KingOfHill" },
  { key: "knockout", url: "Knockout" },
];

const BASE_URL = "https://brawlify.com";

async function crawl() {
  const result: Record<string, any> = {};

  for (const mode of GAME_MODES) {
    console.log(`\n=== [${mode.key}] 모드 시작 ===`);
    const modeUrl = `${BASE_URL}/gamemodes/detail/${mode.url}`;
    const modeRes = await axios.get(modeUrl);
    const $ = cheerio.load(modeRes.data);

    result[mode.key] = {};

    // 맵 리스트 추출
    const mapBadges = $(".badge.map-name");
    for (let i = 0; i < mapBadges.length; i++) {
      const elem = mapBadges[i];
      const mapName = $(elem).text().trim();

      // 맵 상세 페이지 링크 생성
      const mapSlug = mapName.replace(/\s+/g, "-");
      const mapHref = `/maps/detail/${encodeURIComponent(mapSlug)}`;

      if (!mapName) continue;

      console.log(`\n  - 맵: ${mapName}`);

      const mapDetailUrl = BASE_URL + mapHref;
      try {
        const mapDetailRes = await axios.get(mapDetailUrl);
        const $$ = cheerio.load(mapDetailRes.data);

        // 맵 상세 페이지의 html 일부(상위 500자) 출력 (디버깅용)
        console.log(`    [${mapName}] 맵 상세 페이지 일부:`);
        console.log($$.html().slice(0, 500));

        const brawlers: { name: string; star: number; winRate: string; rank: number }[] = [];

        let count = 0;
        // 브롤러 정보 추출
        $$(".d-flex.flex-column.justify-content-center").each((idx, brawlerDiv) => {
          const name = $$(brawlerDiv).find("h3.rarity2.text-center.small.mb-1").text().trim();

          // Star 값 추출
          let star = 0;
          let winRate = "";
          let rank = idx + 1;

          // Star와 Win은 부모의 다음 형제 div에서 추출
          const parent = $$(brawlerDiv).parent();
          parent.nextAll().each((__, infoDiv) => {
            const label = $$(infoDiv).find(".text-hp2.small").text().trim();
            if (label === "Star") {
              const starText = $$(infoDiv).find(".text-orange.small").text().replace("%", "").trim();
              star = parseFloat(starText);
            }
            if (label === "Win") {
              // Win Rate: font-rank{rank} small
              const winElem = $$(infoDiv).find(`.font-rank${++count}.small`);
              winRate = winElem.text().trim();
            }
          });

          if (name && !isNaN(star)) {
            brawlers.push({ name, star, winRate, rank });
          }
        });

        // star 기준 내림차순 정렬 후 상위 8명 저장
        brawlers.sort((a, b) => b.star - a.star);

        if(brawlers.length > 0) {
            result[mode.key][mapName] = {};
            brawlers.slice(0, 8).forEach((brawler, idx) => {
                result[mode.key][mapName][`brawler${idx + 1}`] = brawler;
            });
        }

        const brawlerNames = brawlers.slice(0, 8).map(b => b.name).join(", ");
        console.log(`    추천 브롤러: ${brawlerNames}`);
      } catch (err) {
        console.error(`맵 상세 페이지 크롤링 실패: ${mapDetailUrl}`);
      }
    }
  }

  // JSON 저장
  const outputPath = path.join(process.cwd(), "map-brawler-recommand", "data.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

  console.log("\n크롤링 완료! data.json에 저장되었습니다.");
}

crawl().catch(console.error);

export default crawl;