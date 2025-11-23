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
  console.log('🧪 테스트 모드: 스레드 생성 및 메시지 전송을 즉시 실행합니다...\n');
  
  // 테스트용: 즉시 스레드 생성 및 메시지 전송
  const backendChannelId = process.env.BACKEND_CHANNEL_ID;
  const mobileChannelId = process.env.MOBILE_CHANNEL_ID;
  
  // reminderManager의 함수들을 직접 사용하기 위해 import
  const { getBackendScrumTemplate, getMobileScrumTemplate } = await import('./reminderManager.js');
  
  // 일요일 날짜 포맷팅
  const dayjs = (await import('dayjs')).default;
  const utc = (await import('dayjs/plugin/utc.js')).default;
  const timezone = (await import('dayjs/plugin/timezone.js')).default;
  
  dayjs.extend(utc);
  dayjs.extend(timezone);
  
  const now = dayjs().tz('Asia/Seoul');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  let sunday = now;
  const currentDay = now.day();
  if (currentDay !== 0) {
    const daysUntilSunday = 7 - currentDay;
    sunday = now.add(daysUntilSunday, 'day');
  }
  const yyyy = sunday.year();
  const mm = String(sunday.month() + 1).padStart(2, '0');
  const dd = String(sunday.date()).padStart(2, '0');
  const day = days[sunday.day()];
  const threadName = `${yyyy}-${mm}-${dd} (${day})`;
  
  // 스레드를 생성하고 여러 메시지를 전송하는 함수
  async function createThreadAndSendMessages(channel, templates, threadName) {
    try {
      const thread = await channel.threads.create({
        name: threadName,
        autoArchiveDuration: 10080, // 7일 후 자동 아카이브
        reason: '주간 스크럼 스레드 테스트',
      });
      
      // 모든 메시지 전송
      for (const template of templates) {
        await thread.send(template);
      }
      return thread;
    } catch (error) {
      throw error;
    }
  }
  
  // 채널 ID 우선순위: BACKEND_CHANNEL_ID > MOBILE_CHANNEL_ID
  const channelId = backendChannelId || mobileChannelId;
  
  if (!channelId) {
    console.warn('⚠️  BACKEND_CHANNEL_ID 또는 MOBILE_CHANNEL_ID가 설정되지 않았습니다.');
    console.log('\n✅ 테스트 완료! 5초 후 봇을 종료합니다...');
    setTimeout(() => {
      client.destroy();
      process.exit(0);
    }, 5000);
    return;
  }
  
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.error(`❌ 채널을 찾을 수 없습니다: ${channelId}`);
    console.log('   사용 가능한 채널 목록:');
    client.channels.cache.forEach(ch => {
      if (ch.type === 0) { // 텍스트 채널
        console.log(`   - ${ch.name} (${ch.id})`);
      }
    });
    console.log('\n✅ 테스트 완료! 5초 후 봇을 종료합니다...');
    setTimeout(() => {
      client.destroy();
      process.exit(0);
    }, 5000);
    return;
  }
  
  // 백엔드와 모바일 템플릿 가져오기
  const backendTemplate = getBackendScrumTemplate();
  const mobileTemplate = getMobileScrumTemplate();
  
  try {
    console.log('📝 주간 스크럼 스레드 생성 중...');
    const thread = await createThreadAndSendMessages(
      channel,
      [backendTemplate, mobileTemplate],
      threadName
    );
    console.log(`✅ 주간 스크럼 스레드 생성 완료: ${thread.name}`);
    console.log(`   스레드 ID: ${thread.id}`);
    console.log(`   스레드 URL: https://discord.com/channels/${thread.guildId}/${thread.id}`);
    console.log(`   - 백엔드 주간 스크럼 메시지 전송됨`);
    console.log(`   - 모바일 주간 스크럼 메시지 전송됨\n`);
  } catch (err) {
    console.error('❌ 주간 스크럼 스레드 생성 실패:', err.message);
    console.error('   오류 상세:', err);
  }
  
  console.log('\n✅ 테스트 완료! 5초 후 봇을 종료합니다...');
  setTimeout(() => {
    client.destroy();
    process.exit(0);
  }, 5000);
});

client.login(token).catch(err => {
  console.error('❌ 봇 로그인 실패:', err.message);
  process.exit(1);
});

