import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config } from 'dotenv';
import { scheduleWeeklyScrum } from './reminderManager.js';

config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN이 .env 파일에 설정되지 않았습니다.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ 봇이 로그인했습니다: ${client.user.tag}`);
  
  // 매주 일요일 오후 11시에 주간 스크럼 메시지 자동 전송 시작
  scheduleWeeklyScrum(client);
  
  console.log('🚀 주간 스크럼 봇이 실행되었습니다.');
  console.log('📅 매주 일요일 오후 11시에 주간 스크럼 스레드가 생성되고 백엔드/모바일 메시지가 전송됩니다.');
});

client.login(token);


