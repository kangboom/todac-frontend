# TODAC Frontend

미숙아 챗봇 프론트엔드 애플리케이션 - 모바일 최적화 웹앱

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router
- Zustand (상태 관리)
- Axios (HTTP 클라이언트)

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```
VITE_API_BASE_URL=http://localhost:8000
```

기본값은 `http://localhost:8000`입니다. 백엔드 서버 주소에 맞게 변경하세요.

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 미리보기

```bash
npm run preview
```

빌드된 앱을 미리볼 수 있습니다.

## 주요 기능

### 사용자 인증
- 회원가입 및 로그인
- JWT 토큰 기반 인증
- 자동 로그아웃 (토큰 만료 시)

### 아기 프로필 관리
- 아기 프로필 등록/수정/삭제
- 출생일, 예정일, 체중, 기저질환 등 정보 관리
- 여러 아기 프로필 관리

### 채팅 기능
- 실시간 AI 챗봇과 대화
- 응급 상황 감지 및 알림
- 세션 관리
- 참조 문서 표시

### 모바일 최적화
- 반응형 디자인
- 터치 친화적 UI
- 모바일 브라우저 최적화
- iOS Safari 주소창 대응

## 프로젝트 구조

```
src/
  ├── api/              # API 클라이언트
  │   ├── client.ts     # Axios 인스턴스 및 인터셉터
  │   ├── auth.ts       # 인증 API
  │   ├── baby.ts       # 아기 프로필 API
  │   └── chat.ts       # 채팅 API
  ├── components/       # 재사용 가능한 컴포넌트
  │   ├── Layout.tsx    # 레이아웃 컴포넌트
  │   └── ProtectedRoute.tsx  # 인증 보호 라우트
  ├── pages/            # 페이지 컴포넌트
  │   ├── Login.tsx     # 로그인 페이지
  │   ├── Signup.tsx    # 회원가입 페이지
  │   ├── Home.tsx      # 홈 페이지 (아기 프로필 목록)
  │   ├── BabyForm.tsx  # 아기 프로필 등록/수정
  │   └── Chat.tsx      # 채팅 페이지
  ├── store/            # 상태 관리 (Zustand)
  │   ├── authStore.ts  # 인증 상태
  │   └── babyStore.ts  # 아기 프로필 상태
  ├── styles/           # 스타일시트
  │   ├── global.css    # 전역 스타일
  │   ├── components.css # 컴포넌트 스타일
  │   └── mobile.css    # 모바일 최적화 스타일
  └── types/            # TypeScript 타입 정의
      └── index.ts      # 공통 타입
```

## API 엔드포인트

프론트엔드는 다음 백엔드 API와 통신합니다:

- `POST /api/v1/auth/signup` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `GET /api/v1/me` - 현재 사용자 정보
- `GET /api/v1/babies` - 아기 프로필 목록
- `POST /api/v1/babies` - 아기 프로필 생성
- `GET /api/v1/babies/{id}` - 아기 프로필 조회
- `PUT /api/v1/babies/{id}` - 아기 프로필 수정
- `DELETE /api/v1/babies/{id}` - 아기 프로필 삭제
- `POST /api/v1/chat/message` - 메시지 전송
- `GET /api/v1/chat/sessions` - 세션 목록
- `GET /api/v1/chat/sessions/{id}` - 세션 상세

## 모바일 최적화 특징

- **터치 타겟 크기**: 모든 버튼과 링크는 최소 44x44px 크기 보장
- **입력 필드**: iOS Safari 자동 줌 방지 (font-size: 16px)
- **스크롤**: 부드러운 스크롤 및 터치 스크롤 최적화
- **반응형 레이아웃**: 모바일, 태블릿, 데스크톱 지원
- **PWA 준비**: 모바일 앱처럼 사용 가능한 메타 태그 설정

## 개발 팁

### 백엔드 연결

백엔드 서버가 다른 포트에서 실행 중인 경우, `vite.config.ts`의 proxy 설정을 확인하거나 `.env` 파일에서 `VITE_API_BASE_URL`을 설정하세요.

### 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다. 새로운 상태가 필요하면 `src/store/`에 새 스토어를 추가하세요.

### 스타일링

CSS 변수를 사용하여 테마를 관리합니다. `src/styles/global.css`에서 색상 및 스타일 변수를 정의합니다.

