import { parseInterval } from './reminderManager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 테스트 결과 추적
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passedTests++;
    console.log(`✅ ${name}`);
  } catch (error) {
    failedTests++;
    failures.push({ name, error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   오류: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${expected}, but got ${actual}`
    );
  }
}

console.log('🧪 테스트 시작...\n');

// 1. 템플릿 파일 존재 확인
test('백엔드 템플릿 파일 존재', () => {
  const templatePath = path.join(__dirname, 'templates', 'backend-scrum.md');
  assert(fs.existsSync(templatePath), '백엔드 템플릿 파일이 없습니다.');
});

test('모바일 템플릿 파일 존재', () => {
  const templatePath = path.join(__dirname, 'templates', 'mobile-scrum.md');
  assert(fs.existsSync(templatePath), '모바일 템플릿 파일이 없습니다.');
});

// 2. 템플릿 파일 내용 확인
test('백엔드 템플릿 내용 확인', () => {
  const templatePath = path.join(__dirname, 'templates', 'backend-scrum.md');
  const content = fs.readFileSync(templatePath, 'utf-8');
  
  assert(content.includes('[ 백엔드 주간 스크럼 ]'), '백엔드 템플릿에 제목이 없습니다.');
  assert(content.includes('##0. 근황토크'), '백엔드 템플릿에 근황토크 섹션이 없습니다.');
  assert(content.includes('##1. 이번주 한 일'), '백엔드 템플릿에 이번주 한 일 섹션이 없습니다.');
  assert(content.includes('##2. 공유할 이슈'), '백엔드 템플릿에 공유할 이슈 섹션이 없습니다.');
  assert(content.includes('##4. 회의 필요 여부'), '백엔드 템플릿에 회의 필요 여부 섹션이 없습니다.');
});

test('모바일 템플릿 내용 확인', () => {
  const templatePath = path.join(__dirname, 'templates', 'mobile-scrum.md');
  const content = fs.readFileSync(templatePath, 'utf-8');
  
  assert(content.includes('[ 모바일 주간 스크럼 ]'), '모바일 템플릿에 제목이 없습니다.');
  assert(content.includes('##0. 근황토크'), '모바일 템플릿에 근황토크 섹션이 없습니다.');
  assert(content.includes('##1. 이번주 한 일'), '모바일 템플릿에 이번주 한 일 섹션이 없습니다.');
  assert(content.includes('##2. 공유할 이슈'), '모바일 템플릿에 공유할 이슈 섹션이 없습니다.');
  assert(content.includes('##4. 회의 필요 여부'), '모바일 템플릿에 회의 필요 여부 섹션이 없습니다.');
});

// 3. parseInterval 함수 테스트
test('parseInterval - 초 단위', () => {
  assertEqual(parseInterval('10s'), 10000, '10초는 10000ms여야 합니다.');
  assertEqual(parseInterval('1s'), 1000, '1초는 1000ms여야 합니다.');
});

test('parseInterval - 분 단위', () => {
  assertEqual(parseInterval('10m'), 600000, '10분은 600000ms여야 합니다.');
  assertEqual(parseInterval('1m'), 60000, '1분은 60000ms여야 합니다.');
  assertEqual(parseInterval('30m'), 1800000, '30분은 1800000ms여야 합니다.');
});

test('parseInterval - 시간 단위', () => {
  assertEqual(parseInterval('2h'), 7200000, '2시간은 7200000ms여야 합니다.');
  assertEqual(parseInterval('1h'), 3600000, '1시간은 3600000ms여야 합니다.');
  assertEqual(parseInterval('24h'), 86400000, '24시간은 86400000ms여야 합니다.');
});

test('parseInterval - 일 단위', () => {
  assertEqual(parseInterval('1d'), 86400000, '1일은 86400000ms여야 합니다.');
  assertEqual(parseInterval('7d'), 604800000, '7일은 604800000ms여야 합니다.');
});

test('parseInterval - 잘못된 형식 처리', () => {
  try {
    parseInterval('invalid');
    assert(false, '잘못된 형식에 대해 오류를 발생시켜야 합니다.');
  } catch (error) {
    assert(error.message.includes('잘못된 간격 형식'), '올바른 오류 메시지가 아닙니다.');
  }
});

// 4. 템플릿 파일 읽기 함수 테스트
test('템플릿 파일 읽기 함수', async () => {
  const { scheduleWeeklyScrum } = await import('./reminderManager.js');
  
  // 템플릿 읽기 함수는 내부 함수이므로 직접 테스트할 수 없지만,
  // 파일이 존재하고 읽을 수 있는지 확인
  const backendPath = path.join(__dirname, 'templates', 'backend-scrum.md');
  const mobilePath = path.join(__dirname, 'templates', 'mobile-scrum.md');
  
  const backendContent = fs.readFileSync(backendPath, 'utf-8');
  const mobileContent = fs.readFileSync(mobilePath, 'utf-8');
  
  assert(backendContent.length > 0, '백엔드 템플릿이 비어있습니다.');
  assert(mobileContent.length > 0, '모바일 템플릿이 비어있습니다.');
});

// 5. 환경 변수 확인 (선택적)
test('환경 변수 파일 존재', () => {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    assert(content.includes('DISCORD_TOKEN'), '.env 파일에 DISCORD_TOKEN이 없습니다.');
    assert(content.includes('BACKEND_CHANNEL_ID'), '.env 파일에 BACKEND_CHANNEL_ID가 없습니다.');
    assert(content.includes('MOBILE_CHANNEL_ID'), '.env 파일에 MOBILE_CHANNEL_ID가 없습니다.');
  } else {
    console.log('   ⚠️  .env 파일이 없습니다. (선택사항)');
  }
});

// 테스트 결과 출력
console.log('\n📊 테스트 결과:');
console.log(`✅ 통과: ${passedTests}`);
console.log(`❌ 실패: ${failedTests}`);
console.log(`📈 총계: ${passedTests + failedTests}`);

if (failures.length > 0) {
  console.log('\n❌ 실패한 테스트:');
  failures.forEach(({ name, error }) => {
    console.log(`   - ${name}: ${error}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 모든 테스트가 통과했습니다!');
  process.exit(0);
}

