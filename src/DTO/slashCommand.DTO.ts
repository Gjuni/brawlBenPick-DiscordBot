import { ChatInputApplicationCommandData, Client, ChatInputCommandInteraction } from "discord.js";

// slash 명령어 타입 정의
export type SlashCommand = ChatInputApplicationCommandData & { // Slash 명령어를 정의할 때 사용하는 인터페이스
    execute : (client : Client, interaction : ChatInputCommandInteraction) => void; 
    // execute : 명령어 실행 함수
    // client : Discord 봇 클라이언트 인터페이스
    // interaction : 명령어 실행 컨텍스트와 응답 메서드들을 포함.
    // void : 함수가 값을 반환하지 않음을 나타내는 타입
};