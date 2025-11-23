import { REST, Routes } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('반복알림')
    .setDescription('반복 알림을 설정합니다')
    .addStringOption(opt =>
      opt
        .setName('시작시간')
        .setDescription('시작 시간 (예: 2025-04-04T10:00)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('반복간격')
        .setDescription('간격 (예: 10m, 2h, 1d)')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('메시지')
        .setDescription('알림 메시지')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('알림끄기')
    .setDescription('현재 채널의 반복 알림을 중지합니다'),
].map(command => command.toJSON());

// 특정 서버에 명령어 등록
export async function registerCommandsToGuild(clientId, guildId, token) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`📝 서버 ${guildId}에 슬래시 커맨드를 등록하는 중...`);

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(`✅ 슬래시 커맨드가 성공적으로 등록되었습니다.`);
  } catch (error) {
    console.error('슬래시 커맨드 등록 중 오류:', error);
  }
}


