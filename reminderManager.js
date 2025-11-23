import cron from 'node-cron';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dayjs.extend(utc);
dayjs.extend(timezone);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const remindersPath = path.join(__dirname, 'reminders.json');
const backendTemplatePath = path.join(__dirname, 'templates', 'backend-scrum.md');
const mobileTemplatePath = path.join(__dirname, 'templates', 'mobile-scrum.md');

// 활성 알림 관리
const activeReminders = new Map();

// 알림 키 생성 (userId + channelId)
function getReminderKey(userId, channelId) {
  return `${userId}-${channelId}`;
}

// 간격 문자열을 밀리초로 변환 (예: "1d" → 86400000ms)
export function parseInterval(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('잘못된 간격 형식입니다. 예: 10m, 2h, 1d, 3d');
  }

  const value = parseInt(match[1], 10);
  const unitToMs = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return value * unitToMs[match[2]];
}

// 밀리초를 cron 표현식으로 변환
function convertMsToCron(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `0 0 */${days} * *`; // 매 N일마다 자정
  } else if (hours > 0) {
    return `0 */${hours} * * *`; // 매 N시간마다
  } else if (minutes > 0) {
    return `*/${minutes} * * * *`; // 매 N분마다
  } else {
    return `*/${Math.max(1, seconds)} * * * *`; // 매 N초마다 (최소 1초)
  }
}

// 템플릿 치환 (${날짜}, ${시간}, ${요일})
function formatTemplate(template) {
  const now = dayjs().tz('Asia/Seoul');
  const yyyy = now.year();
  const mm = String(now.month() + 1).padStart(2, '0');
  const dd = String(now.date()).padStart(2, '0');
  const hh = String(now.hour()).padStart(2, '0');
  const min = String(now.minute()).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[now.day()];

  return template
    .replace(/\$\{날짜\}/g, `${yyyy}-${mm}-${dd}`)
    .replace(/\$\{요일\}/g, day)
    .replace(/\$\{시간\}/g, `${hh}:${min}`);
}

// 알림 저장
function saveReminder(userId, channelId, startStr, intervalStr, rawMessage) {
  let reminders = [];
  
  if (fs.existsSync(remindersPath)) {
    const content = fs.readFileSync(remindersPath, 'utf-8');
    reminders = JSON.parse(content);
  }

  // 기존 알림 제거 (같은 채널에 중복 방지)
  reminders = reminders.filter(
    r => !(r.userId === userId && r.channelId === channelId)
  );

  reminders.push({
    userId,
    channelId,
    startStr,
    intervalStr,
    rawMessage,
  });

  fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2), 'utf-8');
}

// 알림 삭제
function removeReminder(userId, channelId) {
  if (!fs.existsSync(remindersPath)) return;

  const reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf-8'));
  const filtered = reminders.filter(
    r => !(r.userId === userId && r.channelId === channelId)
  );

  fs.writeFileSync(remindersPath, JSON.stringify(filtered, null, 2), 'utf-8');
}

// 알림 스케줄링
export function scheduleReminder(userId, channel, startStr, intervalStr, rawMessage, isNew = true) {
  const key = getReminderKey(userId, channel.id);

  // 기존 알림이 있으면 중지
  if (activeReminders.has(key)) {
    activeReminders.get(key).stop();
    activeReminders.delete(key);
  }

  const startTime = dayjs.tz(startStr, 'Asia/Seoul');
  const now = dayjs().tz('Asia/Seoul');
  const delay = startTime.diff(now);

  if (delay < 0) {
    throw new Error('시작 시간이 과거입니다.');
  }

  const intervalMs = parseInterval(intervalStr);

  // 메시지 전송 함수
  const sendMessage = () => {
    const formattedMessage = formatTemplate(rawMessage);
    channel.send(formattedMessage).catch(err => {
      console.error(`메시지 전송 실패: ${err.message}`);
    });
  };

  // 반복 작업 스케줄링
  const scheduleTask = () => {
    const cronExpr = convertMsToCron(intervalMs);
    const task = cron.schedule(cronExpr, sendMessage, { timezone: 'Asia/Seoul' });
    activeReminders.set(key, task);
  };

  // 시작 시간까지 대기 후 첫 메시지 전송 및 반복 시작
  if (delay > 0) {
    setTimeout(() => {
      sendMessage();
      scheduleTask();
    }, delay);
  } else {
    sendMessage();
    scheduleTask();
  }

  // 새 알림인 경우 파일에 저장
  if (isNew) {
    saveReminder(userId, channel.id, startStr, intervalStr, rawMessage);
  }
}

// 알림 중지
export function stopReminder(userId, channelId) {
  const key = getReminderKey(userId, channelId);

  if (activeReminders.has(key)) {
    activeReminders.get(key).stop();
    activeReminders.delete(key);
    removeReminder(userId, channelId);
    return true;
  }

  return false;
}

// 주간 스크럼 템플릿 읽기
export function getBackendScrumTemplate() {
  try {
    return fs.readFileSync(backendTemplatePath, 'utf-8');
  } catch (error) {
    console.error('백엔드 템플릿 파일을 읽을 수 없습니다:', error);
    return '[ 백엔드 주간 스크럼 ]\n\n템플릿 파일을 찾을 수 없습니다.';
  }
}

export function getMobileScrumTemplate() {
  try {
    return fs.readFileSync(mobileTemplatePath, 'utf-8');
  } catch (error) {
    console.error('모바일 템플릿 파일을 읽을 수 없습니다:', error);
    return '[ 모바일 주간 스크럼 ]\n\n템플릿 파일을 찾을 수 없습니다.';
  }
}

// 일요일 날짜와 요일을 포맷팅 (예: "2025-01-05 (일)")
function formatSundayDate() {
  const now = dayjs().tz('Asia/Seoul');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 현재 요일이 일요일이면 오늘, 아니면 다음 일요일
  let sunday = now;
  const currentDay = now.day();
  if (currentDay !== 0) {
    // 다음 일요일까지의 일수 계산
    const daysUntilSunday = 7 - currentDay;
    sunday = now.add(daysUntilSunday, 'day');
  }
  
  const yyyy = sunday.year();
  const mm = String(sunday.month() + 1).padStart(2, '0');
  const dd = String(sunday.date()).padStart(2, '0');
  const day = days[sunday.day()];
  
  return `${yyyy}-${mm}-${dd} (${day})`;
}

// 스레드를 생성하고 메시지를 전송하는 함수
async function createThreadAndSendMessage(channel, template, threadName) {
  try {
    // 스레드 생성
    const thread = await channel.threads.create({
      name: threadName,
      autoArchiveDuration: 10080, // 7일 후 자동 아카이브
      reason: '주간 스크럼 스레드 생성',
    });
    
    // 스레드가 생성되면 메시지 전송
    await thread.send(template);
    return thread;
  } catch (error) {
    throw error;
  }
}

// 스레드를 생성하고 여러 메시지를 전송하는 함수
async function createThreadAndSendMessages(channel, templates, threadName) {
  try {
    // 스레드 생성
    const thread = await channel.threads.create({
      name: threadName,
      autoArchiveDuration: 10080, // 7일 후 자동 아카이브
      reason: '주간 스크럼 스레드 생성',
    });
    
    // 스레드가 생성되면 모든 메시지 전송
    for (const template of templates) {
      await thread.send(template);
    }
    return thread;
  } catch (error) {
    throw error;
  }
}

// 매주 일요일 오후 11시에 주간 스크럼 메시지 전송
export function scheduleWeeklyScrum(client) {
  // 매주 일요일 23:00 (오후 11시)에 실행
  // cron 표현식: 0 23 * * 0 (매주 일요일 23시 0분)
  const cronExpr = '0 23 * * 0';
  
  const task = cron.schedule(
    cronExpr,
    async () => {
      console.log('📅 주간 스크럼 메시지 전송 시작...');
      
      // 채널 ID 우선순위: BACKEND_CHANNEL_ID > MOBILE_CHANNEL_ID
      const channelId = process.env.BACKEND_CHANNEL_ID || process.env.MOBILE_CHANNEL_ID;
      
      if (!channelId) {
        console.warn('⚠️  BACKEND_CHANNEL_ID 또는 MOBILE_CHANNEL_ID가 설정되지 않았습니다.');
        return;
      }
      
      const channel = client.channels.cache.get(channelId);
      if (!channel) {
        console.error(`❌ 채널을 찾을 수 없습니다: ${channelId}`);
        return;
      }
      
      // 일요일 날짜 포맷팅 (스레드 이름용)
      const threadName = formatSundayDate();
      
      // 백엔드와 모바일 템플릿 가져오기
      const backendTemplate = getBackendScrumTemplate();
      const mobileTemplate = getMobileScrumTemplate();
      
      try {
        // 하나의 스레드 생성 후 두 메시지 모두 전송
        const thread = await createThreadAndSendMessages(
          channel,
          [backendTemplate, mobileTemplate],
          threadName
        );
        console.log(`✅ 주간 스크럼 스레드 생성 및 메시지 전송 완료: ${thread.name}`);
        console.log(`   - 백엔드 주간 스크럼 메시지 전송됨`);
        console.log(`   - 모바일 주간 스크럼 메시지 전송됨`);
      } catch (err) {
        console.error('❌ 주간 스크럼 스레드 생성 실패:', err.message);
      }
    },
    { timezone: 'Asia/Seoul' }
  );
  
  console.log('✅ 주간 스크럼 스케줄이 등록되었습니다. (매주 일요일 오후 11시)');
  return task;
}

// 기존 알림 복원 (레거시 - 필요시 사용)
export function loadReminders(client) {
  if (!fs.existsSync(remindersPath)) {
    console.log('📝 저장된 알림이 없습니다.');
    return;
  }

  try {
    const list = JSON.parse(fs.readFileSync(remindersPath, 'utf-8'));
    console.log(`📋 ${list.length}개의 알림을 복원합니다...`);

    for (const r of list) {
      const channel = client.channels.cache.get(r.channelId);
      if (channel) {
        scheduleReminder(r.userId, channel, r.startStr, r.intervalStr, r.rawMessage, false);
        console.log(`✅ 알림 복원: ${channel.name} (${r.intervalStr})`);
      } else {
        console.log(`⚠️  채널을 찾을 수 없습니다: ${r.channelId}`);
      }
    }
  } catch (error) {
    console.error('알림 복원 중 오류:', error);
  }
}


