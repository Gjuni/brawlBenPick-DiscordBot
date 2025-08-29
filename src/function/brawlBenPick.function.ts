import path from "path";
import * as fs from "fs";

const dataPath = path.join(process.cwd(), "map-brawler-recommand", "data.json");

export const getMapRecommand = async (
    name : string
) => {
    if (!fs.existsSync(dataPath)) return null;
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    // 모든 모드에서 해당 맵 이름을 찾아서 brawler1~8 반환
    for (const mode in data) {
        if (data[mode][name]) {
            // brawler1~8만 추출
            const brawlers = [];
            for (let i = 1; i <= 8; i++) {
                const brawler = data[mode][name][`brawler${i}`];
                if (brawler) brawlers.push(brawler);
            }
            return brawlers;
        }
    }
    return null;
};