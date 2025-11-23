# 디스코드 주간 스크럼 자동화 봇

매주 일요일 오후 11시에 백엔드 및 모바일 주간 스크럼 템플릿 메시지를 자동으로 전송하는 디스코드 봇입니다.

테스트 봇 실행 명령어 `npm run test-bot`

## 📋 프로젝트 정보

### 개발 환경
- **IDE**: Visual Studio Code (VS Code)
- **언어**: JavaScript (ES Modules)
- **런타임**: Node.js

### 사용 라이브러리 및 버전
- **discord.js**: `^14.14.1` - 디스코드 봇 개발 프레임워크
- **node-cron**: `^3.0.3` - 스케줄링 및 반복 작업 관리
- **dayjs**: `^1.11.10` - 날짜 및 시간 처리
- **dotenv**: `^16.3.1` - 환경 변수 관리

## 🚀 시작하기

### 1. 필수 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn
- 디스코드 봇 토큰

### 2. 디스코드 봇 토큰 발급

1. [Discord Developer Portal](https://discord.com/developers/applications)에 접속
2. **New Application** 버튼 클릭하여 새 애플리케이션 생성
3. **Bot** 탭으로 이동
4. **Reset Token** 버튼 클릭하여 토큰 발급
5. 토큰을 복사하여 안전한 곳에 보관

### 3. 봇 권한 설정

**Bot** 탭에서 다음 권한을 활성화하세요:
- Send Messages
- Read Message History
- Create Public Threads
- Send Messages in Threads

### 4. 봇을 서버에 초대

**OAuth2 > URL Generator**에서:
- Scopes: `bot`, `applications.commands` 선택
- Bot Permissions: 위에서 설정한 권한 선택
- 생성된 URL로 봇을 서버에 초대

### 5. 채널 ID 확인

1. 디스코드 설정 > 고급 > 개발자 모드 활성화
2. 백엔드 주간 스크럼을 보낼 채널 우클릭 > ID 복사
3. 모바일 주간 스크럼을 보낼 채널 우클릭 > ID 복사

### 6. 프로젝트 설정

```bash
# 의존성 설치
npm install

# .env 파일 생성
cp .env.example .env
```

`.env` 파일을 열어 다음 정보를 입력하세요:

```env
DISCORD_TOKEN=your_bot_token_here
BACKEND_CHANNEL_ID=your_backend_channel_id_here
MOBILE_CHANNEL_ID=your_mobile_channel_id_here
```

### 7. 봇 실행

```bash
# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

## 📅 기능

- **자동 스케줄링**: 매주 일요일 오후 11시 (KST)에 자동으로 스레드 생성 및 메시지 전송
- **스레드 자동 생성**: 각 주차별로 하나의 스레드를 생성 (스레드 이름: 해당 주차 일요일 날짜 및 요일)
- **템플릿 메시지**: 백엔드 및 모바일 주간 스크럼 템플릿을 하나의 스레드에 모두 전송
- **복사 가능한 형식**: 전송된 메시지를 복사하여 바로 사용 가능

## 📝 전송되는 메시지 형식

### 백엔드 주간 스크럼

📄 템플릿 파일: [`templates/backend-scrum.md`](templates/backend-scrum.md)

### 모바일 주간 스크럼

📄 템플릿 파일: [`templates/mobile-scrum.md`](templates/mobile-scrum.md)


## 🛠️ 프로젝트 구조

```
nmnb-discord-bot/
├── index.js              # 메인 봇 파일
├── reminderManager.js    # 스케줄링 및 메시지 관리
├── commandRegister.js    # 슬래시 커맨드 등록 (현재 미사용)
├── package.json          # 프로젝트 설정 및 의존성
├── .env                  # 환경 변수 (gitignore에 포함)
├── .env.example          # 환경 변수 템플릿
├── .gitignore            # Git 제외 파일 목록
└── README.md             # 프로젝트 문서
```

## 🔒 보안

- `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.
- 디스코드 토큰과 채널 ID는 절대 공개하지 마세요.

## 📦 배포

### Railway 배포 (권장)

1. [Railway](https://railway.app)에 GitHub 계정으로 로그인
2. **New Project** > **Deploy from GitHub repo** 선택
3. 이 저장소 선택
4. **Variables** 탭에서 환경 변수 설정:
   - `DISCORD_TOKEN`
   - `BACKEND_CHANNEL_ID`
   - `MOBILE_CHANNEL_ID`
5. 배포 완료 후 자동으로 봇이 실행됩니다.

## 🐛 문제 해결

### 봇이 메시지를 보내지 않아요
- `.env` 파일의 채널 ID가 올바른지 확인하세요
- 봇이 해당 채널에 접근 권한이 있는지 확인하세요
- 봇이 온라인 상태인지 확인하세요

### 타임존 오류
- 봇은 `Asia/Seoul` 타임존을 사용합니다
- 서버의 타임존 설정을 확인하세요

## 📄 라이선스

MIT License

