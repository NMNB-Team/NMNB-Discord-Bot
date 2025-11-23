# 디스코드 봇 연결 가이드

디스코드 봇을 실제로 연결하고 실행하는 단계별 가이드입니다.

## 📋 단계별 설정

### 1단계: 디스코드 개발자 포털에서 봇 생성

1. **[Discord Developer Portal](https://discord.com/developers/applications)** 접속
2. 오른쪽 상단 **"New Application"** 버튼 클릭
3. 애플리케이션 이름 입력 (예: "주간 스크럼 봇") 후 **"Create"** 클릭

### 2단계: 봇 생성 및 토큰 발급

1. 왼쪽 메뉴에서 **"Bot"** 클릭
2. **"Add Bot"** 버튼 클릭하여 봇 생성
3. **"Reset Token"** 버튼 클릭하여 토큰 발급
4. ⚠️ **토큰을 복사해서 안전한 곳에 보관하세요!** (한 번만 표시됩니다)

### 3단계: 봇 권한 설정

**Bot** 탭에서 다음 설정을 확인/변경:

1. **Privileged Gateway Intents** 섹션:
   - ✅ **MESSAGE CONTENT INTENT** 활성화 (필수!)

2. **Bot Permissions** 섹션:
   - ✅ **Send Messages** (메시지 보내기)
   - ✅ **Read Message History** (메시지 기록 읽기)
   - ✅ **Create Public Threads** (공개 스레드 생성)
   - ✅ **Send Messages in Threads** (스레드에 메시지 보내기)

### 4단계: 봇을 서버에 초대

1. 왼쪽 메뉴에서 **"OAuth2"** > **"URL Generator"** 클릭
2. **Scopes** 섹션:
   - ✅ **bot** 체크
   - ✅ **applications.commands** 체크 (선택사항, 현재 미사용)
3. **Bot Permissions** 섹션:
   - ✅ **Send Messages**
   - ✅ **Read Message History**
   - ✅ **Create Public Threads**
   - ✅ **Send Messages in Threads**
4. 하단에 생성된 **URL 복사**
5. 브라우저에서 해당 URL 열기
6. 봇을 추가할 서버 선택 후 **"승인"** 클릭

### 5단계: 채널 ID 확인

1. 디스코드 설정 열기:
   - Windows/Linux: `Ctrl + ,`
   - Mac: `Cmd + ,`
2. **고급** > **개발자 모드** 활성화
3. 백엔드 주간 스크럼을 보낼 채널에서:
   - 채널 우클릭 > **"ID 복사"**
   - 이 ID를 `BACKEND_CHANNEL_ID`로 사용
4. 모바일 주간 스크럼을 보낼 채널에서:
   - 채널 우클릭 > **"ID 복사"**
   - 이 ID를 `MOBILE_CHANNEL_ID`로 사용

### 6단계: .env 파일 설정

프로젝트 루트의 `.env` 파일을 열고 다음 정보를 입력:

```env
DISCORD_TOKEN=여기에_2단계에서_복사한_토큰_붙여넣기
BACKEND_CHANNEL_ID=여기에_백엔드_채널_ID_붙여넣기
MOBILE_CHANNEL_ID=여기에_모바일_채널_ID_붙여넣기
```

### 7단계: 봇 실행

터미널에서 다음 명령어 실행:

```bash
# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 또는 프로덕션 모드
npm start
```

### 8단계: 연결 확인

봇이 정상적으로 연결되면 다음과 같은 메시지가 표시됩니다:

```
✅ 봇이 로그인했습니다: 봇이름#1234
✅ 주간 스크럼 스케줄이 등록되었습니다. (매주 일요일 오후 11시)
🚀 주간 스크럼 봇이 실행되었습니다.
📅 매주 일요일 오후 11시에 백엔드 및 모바일 주간 스크럼 메시지가 전송됩니다.
```

디스코드 서버에서도 봇이 온라인 상태로 표시됩니다.

## 🧪 테스트

### 즉시 테스트하고 싶다면

`reminderManager.js`의 `scheduleWeeklyScrum` 함수를 임시로 수정하여 테스트할 수 있습니다:

```javascript
// 테스트용: 1분 후 실행
const cronExpr = '*/1 * * * *'; // 매 1분마다 실행
```

⚠️ **테스트 후 원래대로 복구하세요!**

## ❗ 문제 해결

### 봇이 로그인하지 않아요
- `.env` 파일의 `DISCORD_TOKEN`이 올바른지 확인
- 토큰에 공백이나 따옴표가 없는지 확인
- 토큰이 만료되었다면 Developer Portal에서 새로 발급

### 메시지가 전송되지 않아요
- `.env` 파일의 채널 ID가 올바른지 확인
- 봇이 해당 채널에 접근 권한이 있는지 확인
- 봇이 온라인 상태인지 확인
- 채널 ID는 숫자만 있어야 합니다 (따옴표 없이)

### "Missing Access" 오류
- 봇이 서버에 제대로 초대되었는지 확인
- 봇 권한이 올바르게 설정되었는지 확인
- 봇이 해당 채널을 볼 수 있는 권한이 있는지 확인

## 📝 참고사항

- 봇은 매주 **일요일 오후 11시 (KST)**에 자동으로 메시지를 전송합니다
- 봇을 중지하려면 `Ctrl + C`로 종료하세요
- 봇을 재시작하면 스케줄이 자동으로 다시 등록됩니다
