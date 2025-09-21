# SerpAPI 구글 검색 워크플로우

## 프로젝트 개요
SerpAPI를 활용하여 구글 검색을 자동화하고, AI 에이전트가 검색 결과를 분석하여 사용자 질문에 대한 정확한 정보를 제공하는 지능형 검색 시스템입니다.

## 주요 기능

### 1. 실시간 구글 검색
- **SerpAPI 연동**: 구글 검색 결과를 JSON 형태로 수신
- **검색 범위**: 일반 웹 검색, Knowledge Graph, 관련 검색어
- **결과 제한**: 상위 3개 결과로 집중된 정보 제공

### 2. AI 기반 답변 생성
- **Google Gemini 모델**: 낮은 temperature(0.1)로 정확한 답변
- **컨텍스트 분석**: 검색 결과를 종합하여 사용자 질문에 맞춤 답변
- **구조화된 응답**: 출처와 함께 체계적인 정보 제공

### 3. 통합 도구 시스템
- **HTTP Request Tool**: SerpAPI 자동 호출
- **AI Agent**: 검색 의도 파악 및 결과 해석
- **조건부 실행**: 쿼리 유효성 검사 후 실행

## 기술 스택

### API 연동
- **SerpAPI**: 구글 검색 결과 API
- **엔드포인트**: https://serpapi.com/search
- **API Key**: feac50f1b9efb76463d2376375e681291953ec6cb658be71b8084d5f5498ebb6

### AI 모델
- **Google Gemini**: 자연어 처리 및 답변 생성
- **Temperature 0.1**: 일관되고 정확한 응답
- **도구 통합**: HTTP Request Tool과 연계

## 워크플로우 구성

### 1. 쿼리 검증 (Check Query)
```javascript
조건: query 필드가 비어있지 않은지 확인
성공: AI Agent 실행
실패: 워크플로우 종료
```

### 2. AI 에이전트 실행
```
입력: 사용자 질문
도구: HTTP Request (SerpAPI)
프롬프트: "{{ $json.query }} 에 대해서 serpapi를 활용하여 Google 검색을하여 내가 물어보는 내용에 대해서 내게 정보를 제공해줘"
```

### 3. HTTP Request Tool
```javascript
자동 매개변수:
- api_key: SerpAPI 키
- q: AI 에이전트가 추출한 검색어
응답: JSON 형태의 구글 검색 결과
```

### 4. 결과 처리 (Process Search Results)
```javascript
// 검색 결과 파싱 및 정리
const results = serpResponse.organic_results.slice(0, 3).map(result => ({
  title: result.title,
  snippet: result.snippet, 
  link: result.link,
  source: result.displayed_link
}));

// Knowledge Graph 정보 추가
if (serpResponse.knowledge_graph) {
  knowledgeInfo = {
    title: serpResponse.knowledge_graph.title,
    description: serpResponse.knowledge_graph.description,
    type: serpResponse.knowledge_graph.type
  };
}
```

## 입력 형식

### 기본 쿼리 구조
```json
{
  "query": "검색하고 싶은 내용"
}
```

### 예시 입력
```json
{
  "query": "2024년 인공지능 트렌드"
}
```

## 출력 형식

### 성공 응답
```json
{
  "success": true,
  "query": "2024년 인공지능 트렌드",
  "answer": "**인공지능**\n생성형 AI가 2024년 주요 트렌드로 부상...\n\n**관련 정보:**\n1. **2024 AI 트렌드 전망**\n   최신 연구에 따르면 생성형 AI 기술이...\n   출처: techcrunch.com\n\n2. **기업용 AI 솔루션**\n   대기업들이 AI 도입을 가속화...\n   출처: forbes.com",
  "results": [...],
  "knowledge_graph": {...},
  "total_results": 45600000
}
```

### 실패 응답
```json
{
  "success": false,
  "message": "검색 결과를 찾을 수 없습니다.",
  "query": "입력된 쿼리"
}
```

## 설치 및 설정

### 필요한 자격 증명
```
SerpAPI:
- API Key: feac50f1b9efb76463d2376375e681291953ec6cb658be71b8084d5f5498ebb6
- 월 사용량: 100회 무료, 이후 유료

Google Gemini:
- API Key: Google Cloud Console에서 발급
- 계정: Google Gemini(PaLM) Api account 2
```

### 도구 설정
```json
HTTP Request Tool 설정:
{
  "toolDescription": "Search Google using SerpAPI",
  "url": "https://serpapi.com/search",
  "queryParameters": [
    {"name": "api_key", "value": "YOUR_API_KEY"},
    {"name": "q", "value": "{{ AI가 추출한 검색어 }}"}
  ]
}
```

## 사용 예시

### 1. 일반 정보 검색
```
입력: "파이썬 최신 버전은?"
처리: SerpAPI → 파이썬 공식 정보 검색
출력: "파이썬 3.12가 최신 버전이며, 주요 기능으로는..."
```

### 2. 시사/뉴스 검색
```
입력: "오늘 주요 뉴스는?"
처리: SerpAPI → 최신 뉴스 검색
출력: Knowledge Graph + 상위 3개 뉴스 요약
```

### 3. 기술 정보 검색
```
입력: "n8n 워크플로우 사용법"
처리: SerpAPI → 관련 튜토리얼 및 문서 검색
출력: 공식 문서 링크와 함께 사용법 설명
```

## 제한사항

### 1. API 사용량 제한
- SerpAPI 무료 티어: 월 100회 검색
- 초과 시 유료 플랜 필요

### 2. 검색 품질
- 구글 검색 알고리즘에 의존
- 실시간 정보의 정확성은 소스에 따라 달라짐

### 3. 언어 지원
- 주로 영어 검색 결과에 최적화
- 한국어 검색도 지원하지만 결과 품질 변동 가능

## 에러 처리

### 1. 쿼리 유효성 검사
```javascript
if (!$json.query || $json.query.trim() === '') {
  return "검색어를 입력해주세요.";
}
```

### 2. API 응답 검증
```javascript
if (!serpResponse || !serpResponse.organic_results) {
  return {
    success: false,
    message: "검색 결과를 찾을 수 없습니다."
  };
}
```

### 3. 네트워크 오류 처리
- API 타임아웃 설정
- 재시도 로직 구현
- 대체 검색 방법 제안

## 성능 최적화

### 1. 검색 효율성
- 상위 3개 결과로 제한하여 처리 속도 향상
- Knowledge Graph 우선 활용
- 불필요한 메타데이터 제거

### 2. AI 모델 최적화
- Temperature 0.1로 일관된 품질
- 구조화된 프롬프트로 정확한 응답
- 토큰 사용량 최적화

## 확장 계획

- [ ] 이미지 검색 지원
- [ ] 뉴스 검색 특화 모드
- [ ] 쇼핑 정보 검색
- [ ] 지도/위치 기반 검색
- [ ] 검색 히스토리 저장
- [ ] 개인화된 검색 결과

## 트러블슈팅

### Q: 검색 결과가 나오지 않음
A: SerpAPI 키 유효성과 월 사용량 한도 확인

### Q: AI 답변이 부정확함
A: 프롬프트 조정과 temperature 값 확인

### Q: 속도가 느림
A: SerpAPI 응답 시간과 네트워크 상태 점검

## 보안 고려사항

### 1. API 키 보호
- 환경 변수나 보안 저장소 사용
- 키 노출 방지를 위한 로깅 주의

### 2. 쿼리 필터링
- 악의적인 검색어 차단
- 사용량 모니터링

## 버전 정보
- **Version**: 6f505d7a-7fd2-4413-b58c-cd06bda99b34
- **상태**: 비활성화 (수동 실행 모드)
- **마지막 업데이트**: 2024년 개발 완료