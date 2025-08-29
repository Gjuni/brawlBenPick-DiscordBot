import { ApplicationCommandOptionType } from "discord.js";
import { SlashCommand } from "../DTO/slashCommand.DTO";
import * as fs from "fs";
import * as path from "path";
import { getMapRecommand } from "../function/brawlBenPick.function";

const dataPath = path.join(process.cwd(), "map-brawler-recommand", "data.json");

export const brawlPick : SlashCommand = {
    name : "brawl",
    description : "레츠 브롤",
    options : [
        {
            name: "map",
            description: "맵 타입",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "type",
                    description: "맵 타입",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: "잼그랩",
                            value: "gem-grab" // 오타 수정: gem-grap → gem-grab
                        },
                        {
                            name: "하이스트",
                            value: "heist"
                        },
                        {
                            name: "브롤볼",
                            value: "brawl-ball"
                        },
                        {
                            name: "핫존",
                            value: "hot-zone"
                        },
                        {
                            name: "녹아웃",
                            value: "knockout"
                        },
                        {
                            name: "바운티",
                            value: "bounty"
                        },
                    ]
                },
                {
                    name: "name",
                    description: "맵 이름",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true // 자동완성 활성화
                }
            ]
        },
        
    ],

    execute : async (client, interaction) => {
        const command = interaction.options.getSubcommand();

        if(command === "map") {
            try {
                const type = interaction.options.getString("type");
                const name = interaction.options.getString("name");

                const result = await getMapRecommand(name!);

                if (!result || result.length === 0) {
                    await interaction.reply({
                        content: "해당 맵의 추천 브롤러 데이터를 찾을 수 없습니다."
                    });
                    return;
                }

                // 추천 브롤러 목록을 문자열로 만듦
                let content = `추천 브롤러 (star 기준)\n\n`;
                result.forEach((brawler, i) => {
                    content += `${i + 1}. ${brawler.name} (⭐ ${brawler.star}, 승률: ${brawler.winRate})\n`;
                });

                await interaction.reply({
                    content
                });

            } catch(error) {
                const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

                if(!interaction.replied) {
                    await interaction.reply({
                        content : `데이터를 불러오는데 오류가 발생했습니다 : \n\n**오류** ${errorMessage}`
                    })
                }
            }


        }
    },

    // 자동완성 핸들러 추가
    autocomplete: async (interaction) => {
        const focusedOption = interaction.options.getFocused(true);
        const type = interaction.options.getString("type");
        if (focusedOption.name === "name" && type) {
            if (!fs.existsSync(dataPath)) {
                await interaction.respond([]);
                return;
            }
            const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
            const maps = Object.keys(data[type] || {});
            const filtered = maps.filter(map =>
                map.toLowerCase().includes(focusedOption.value.toLowerCase())
            ).slice(0, 25); // Discord는 최대 25개까지 반환 가능
            await interaction.respond(
                filtered.map(map => ({ name: map, value: map }))
            );
        } else {
            await interaction.respond([]);
        }
    }
}