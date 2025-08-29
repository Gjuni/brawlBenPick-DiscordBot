import { ChatInputApplicationCommandData, Client, ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";

// slash 명령어 타입 정의
export type SlashCommand = ChatInputApplicationCommandData & {
    execute: (client: Client, interaction: ChatInputCommandInteraction) => void;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>; // 타입 수정
};