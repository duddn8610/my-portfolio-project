# AI 챗봇 워크플로우 (Chatbot)

## 프로젝트 개요
다양한 파일 형식을 지원하고 AI 모델을 통해 지능적인 응답을 제공하는 멀티모달 챗봇 시스템입니다. 사용자의 질의에 따라 적절한 AI 모델과 도구를 선택하여 응답합니다.

## 주요 기능

### 1. 멀티모달 파일 지원
- **문서 파일**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR
- **미디어 파일**: MP3, WAV, MP4, MOV, JPG, PNG

### 2. 지능형 라우팅 시스템
- 파일 타입에 따른 자동 분기 처리
- YouTube/Gemini 키워드 감지 시 고급 AI 모델 사용
- 기본 질의는 OpenAI GPT-4 mini 모델 처리

### 3. 통합 기능
- **뉴스 검색**: Naver News API 연동으로 실시간 뉴스 검색 및 이메일 전송
- **GitLab 연동**: Push, Merge Request, Issue 관련 정보 조회
- **웹 검색**: SerpAPI를 통한 Google 검색
- **IT 뉴스**: RSS 기반 최신 IT 기사 전송

## 기술 스택

### AI 모델
- **OpenAI GPT-4.1 mini**: 일반적인 텍스트 처리
- **Google Gemini**: 복합적이거나 고급 처리가 필요한 경우

### 연동 서비스
- **MCP Server**: Model Context Protocol을 통한 외부 도구 연동
- **Naver News API**: 뉴스 검색 및 크롤링
- **GitLab API**: 개발 프로젝트 관리 정보
- **SerpAPI**: 구글 검색 결과
- **RSS Feed**: IT 뉴스 자동 수집

### 메모리 관리
- 세션별 대화 기록 유지 (Simple Memory)
- 채팅룸 ID 기반 컨텍스트 관리
- 대용량 컨텍스트 윈도우 지원 (50,000 토큰)

## 워크플로우 구성

### 1. 입력 처리 (Code1)
```javascript
// 파일 형식 감지 및 메타데이터 추출
// 채팅룸 별 세션 관리
// 삭제 요청 처리
```

### 2. 조건부 라우팅
- **If 노드**: 문서 파일 형식 검사
- **If1 노드**: 미디어/이미지 파일 검사
- **If5 노드**: YouTube/Gemini 키워드 감지

### 3. AI 에이전트
- **AI Agent1**: OpenAI 기반 일반 처리
- **AI Agent**: Google Gemini 기반 고급 처리

## 설치 및 설정

### 필요한 자격 증명
```
- OpenAI API Key
- Google Gemini API Key
- Naver News API (Client ID, Secret)
- GitLab API Token
- SerpAPI Key
- Slack API Token
```

### MCP 서버 설정
```
엔드포인트: http://localhost:5678/mcp/0deeaf78-6cdd-4de8-8c8b-58650243f0cb/sse
```

## 사용법

### 1. 기본 질문
```
사용자: "안녕하세요, 오늘 날씨는 어때요?"
봇: SerpAPI를 통해 날씨 정보 검색 후 응답
```

### 2. 뉴스 검색
```
사용자: "삼성전자 뉴스 5개 보여줘"
봇: Naver_News_Crawling 함수 호출하여 뉴스 검색

사용자: "유재석 뉴스 3개 메일로 보내줘"
봇: Naver_News_Crawling_Email 함수로 뉴스 검색 후 이메일 전송
```

### 3. GitLab 정보 조회
```
사용자: "오늘 push 작업이 몇 건 있었어?"
봇: n8n_gitlab_push_event_alert 함수로 push 이벤트 조회

사용자: "merge request 현황 알려줘"
봇: n8n_gitlab_merger_request_alert 함수로 MR 정보 제공
```

### 4. 파일 업로드
- 지원하는 파일을 업로드하면 자동으로 적절한 처리 방식 선택
- 문서는 텍스트 분석, 미디어는 Gemini 모델로 처리

## 아키텍처 특징

### 1. 모듈화된 설계
각 기능별로 독립적인 노드 구성으로 유지보수성 향상

### 2. 확장 가능성
MCP 프로토콜을 통해 새로운 도구 쉽게 추가 가능

### 3. 성능 최적화
- 조건부 실행으로 불필요한 API 호출 방지
- 적절한 AI 모델 선택으로 비용 효율성

### 4. 사용자 경험
- 자연어 처리로 직관적인 명령 인식
- 실시간 응답 및 결과 전달

## 한계사항

1. **브라우저 스토리지 미지원**: localStorage/sessionStorage 사용 불가
2. **동기 처리**: 복수 요청 동시 처리 제한
3. **API 의존성**: 외부 서비스 장애 시 기능 제한

## 향후 개선사항

- [ ] 더 많은 파일 형식 지원
- [ ] 음성 인식 기능 추가
- [ ] 대화 히스토리 영구 저장
- [ ] 다국어 지원
- [ ] 사용자별 개인화 설정

## 버전 정보
- **Version**: afd55888-2741-4944-83df-dd8151298a8b
- **Status**: Active
- **Last Updated**: 2024년 개발 완료