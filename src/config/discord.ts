import {
  ChatInputCommandInteraction,
  Client,
  Interaction,
  GatewayIntentBits,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const Token = process.env.DISCORD_TOKEN;

const client = new Client({
  // 봇 권한 설정
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const startDiscordBot = async () => {
  await client.login(Token);
  console.log("Discord bot is running");

  client.on("ready", async () => {
    if (client.application) {
      console.log("등록할 명령어 목록:");
      commandRouter.forEach((cmd) => {
        console.log(`- ${cmd.name}: ${cmd.description}`);
        if (cmd.options) {
          cmd.options.forEach((option: any) => {
            console.log(
              `  └─ ${option.name}: ${option.description}`
            );
          });
        }
      });

      await client.application.commands.set(commandRouter);
      console.log("Slash commands registered successfully");
    }
  });
};

client.on(
  "interactionCreate",
  async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      console.log(`명령어 실행: ${interaction.commandName}`);
      const currentCommand = commandRouter.find(
        (command) => command.name === interaction.commandName
      );
      if (currentCommand) {
        currentCommand.execute(
          client,
          interaction as ChatInputCommandInteraction
        );
      }
    }
  }
);

export default startDiscordBot;
