# 네이버 뉴스 크롤링 시스템

## 프로젝트 개요
네이버 뉴스 API를 활용하여 키워드 기반 뉴스를 검색하고, AI가 요약한 결과를 제공하거나 이메일로 전송하는 자동화된 뉴스 수집 시스템입니다. 2개의 독립된 워크플로우로 구성되어 있습니다.

## 시스템 구성

### 1. 기본 뉴스 크롤링 (`Naver_News_Crawling`)
- 키워드 검색 후 AI 요약 결과 반환
- 실시간 조회 및 즉시 결과 제공

### 2. 이메일 전송 크롤링 (`Naver_News_Crawling_Email`)
- 키워드 검색 후 AI 요약하여 이메일 자동 전송
- 개인 메일함으로 뉴스 레포트 발송

## 주요 기능

### 1. 네이버 뉴스 API 연동
- **실시간 검색**: 최신 뉴스 기사 수집
- **정렬 옵션**: 날짜순 정렬로 최신 기사 우선
- **검색량 제어**: 요청한 개수만큼 정확히 수집

### 2. AI 기반 뉴스 요약
- **Google Gemini / OpenAI GPT-4**: 이중 AI 모델 지원
- **구조화된 요약**: 제목, 내용, 링크가 포함된 HTML 형식
- **정확성 우선**: 실제 기사 데이터만 사용하여 환각 방지

### 3. 다중 입력 방식 지원
- **MCP 프로토콜**: 챗봇에서 자연어 명령 처리
- **JSON 입력**: 구조화된 데이터 입력
- **직접 실행**: 수동 트리거를 통한 즉시 실행

## 기술 스택

### API 연동
```
네이버 뉴스 API:
- Client ID: efISqZiIL4DG8gyLs3XY
- Client Secret: SUkHHARRq0
- 엔드포인트: https://openapi.naver.com/v1/search/news.json
```

### AI 모델
- **Google Gemini**: 일반 요약 처리 (Temperature: 0.1)
- **OpenAI GPT-4.1 mini**: 정밀 요약 처리

### 이메일 시스템
- **SMTP**: 네이버 메일 서버
- **HTML 템플릿**: 구조화된 뉴스 레포트 형식

## 워크플로우 상세

### 1. 입력 처리 단계
```javascript
// 다양한 입력 형식 처리
let keyword = "네이버";  // 기본값
let count = 1;           // 기본값

// Method 1: 직접 구조 전달
if (input.query && input.query.input) {
  keyword = input.query.input;
  count = input.query.count || 1;
}

// Method 2: 문자열 파싱
else if (typeof input.query === 'string') {
  const parsed = JSON.parse(input.query);
  keyword = parsed.query.input;
  count = parsed.query.count || 1;
}
```

### 2. 네이버 API 호출
```
URL: https://openapi.naver.com/v1/search/news.json
Parameters:
- query: 검색 키워드
- display: 검색 결과 개수
- sort: date (날짜순 정렬)
Headers:
- X-Naver-Client-Id: API ID
- X-Naver-Client-Secret: API Secret
```

### 3. 데이터 전처리
```javascript
// HTML 엔티티 디코딩
const decodeEntities = (text) =>
  text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// 제목 보정 (말줄임 처리)
if (title.endsWith('…')) {
  const firstSentence = description.split(/[.!?]\s/)[0];
  if (firstSentence && firstSentence.length > title.length) {
    title = firstSentence;
  }
}
```

### 4. AI 요약 생성
```
프롬프트: "당신은 뉴스 요약 전문가입니다. 
아래 '키워드' 관련 뉴스 N개의 HTML 데이터를 정확히 요약해주세요."

요약 규칙:
1. 각 뉴스를 다음 형식으로 정리
   번호. <a href="기사 링크" target="_blank">기사 제목</a><br>
   요약 내용: 핵심 내용을 2문장 이내로 간결하게 요약<br><br>

2. 반드시 지켜야 할 조건:
   - HTML 태그와 줄바꿈 태그(<br>)를 정확히 유지
   - 기사 제목은 원문 그대로 전체를 표시
   - 각 뉴스 항목 사이에 <br><br> 태그로 구분
```

## 사용법

### 1. 챗봇 통합 사용
```
사용자: "삼성전자 뉴스 5개 보여줘"
시스템: Naver_News_Crawling 함수 호출
결과: AI가 요약한 뉴스 5개 반환

사용자: "유재석 뉴스 3개 메일로 보내줘"  
시스템: Naver_News_Crawling_Email 함수 호출
결과: 이메일로 뉴스 3개 요약 전송
```

### 2. JSON 직접 입력
```json
{
  "query": {
    "input": "인공지능",
    "count": 3
  },
  "tool": {
    "name": "Naver_News_Crawling"
  }
}
```

### 3. 수동 실행
- 워크플로우에서 직접 실행 버튼 클릭
- 코드 노드에서 기본값으로 실행

## 출력 형식

### 기본 뉴스 크롤링 결과
```html
"인공지능" 관련 뉴스 3개 요약해드립니다.<br><br>

1. <a href="https://news.naver.com/..." target="_blank">AI 기술 발전 가속화</a><br>
요약 내용: 최근 AI 기술이 빠르게 발전하고 있으며, 다양한 산업에 적용되고 있습니다. 특히 생성형 AI 분야에서 혁신적 성과가 나타나고 있습니다.<br><br>

2. <a href="https://news.naver.com/..." target="_blank">기업들의 AI 투자 확대</a><br>
요약 내용: 대기업들이 AI 분야 투자를 늘리고 있습니다. 관련 스타트업 인수와 R&D 투자가 증가하는 추세입니다.<br><br>
```

### 이메일 전송 형식
```
제목: "인공지능" 관련 뉴스 3개
발신: qkddudn@naver.com
수신: qkddudn@naver.com
내용: HTML 형식의 구조화된 뉴스 요약
```

## 설치 및 설정

### 필요한 자격 증명
```
네이버 개발자 센터:
- Application 등록 후 Client ID/Secret 발급
- 검색 API 이용 신청

AI 모델:
- Google Gemini API Key
- OpenAI API Key (GPT-4.1 mini)

SMTP 설정:
- 네이버 메일 계정
- SMTP 서버: smtp.naver.com
- 포트: 465 (SSL)
```

### 환경 설정
```javascript
네이버 API 제한:
- 일일 25,000회 요청
- 초당 10회 요청 제한
- 검색 결과 최대 100개
```

## 성능 최적화

### 1. API 효율성
- 필요한 필드만 요청하여 응답 크기 최소화
- 캐싱을 통한 중복 요청 방지
- 적절한 검색 결과 수 제한

### 2. AI 처리 최적화
- Temperature 0.1로 일관된 품질 보장
- 토큰 사용량 최적화된 프롬프트
- 이중 모델 구성으로 백업 및 품질 향상

### 3. 에러 처리
```javascript
// 뉴스 없음 처리
if (!newsItems || newsItems.length === 0) {
  return `"${keyword}"에 대한 뉴스를 찾을 수 없습니다.`;
}

// HTML 태그 제거
const cleanText = text.replace(/<[^>]+>/gm, '');
```

## 모니터링 및 로깅

### 1. 실행 추적
- API 호출 성공/실패율 모니터링
- 검색 키워드별 결과 품질 평가
- AI 요약 생성 시간 측정

### 2. 품질 관리
- 중복 기사 필터링
- 부적절한 내용 감지
- 링크 유효성 검사

## 확장 계획

### 단기 개선사항
- [ ] 다른 뉴스 소스 추가 (다음, 구글)
- [ ] 이미지 포함 뉴스 레포트
- [ ] 카테고리별 필터링
- [ ] 감정 분석 추가

### 장기 개선사항
- [ ] 실시간 뉴스 알림
- [ ] 개인화된 뉴스 큐레이션
- [ ] 트렌드 분석 대시보드
- [ ] 다국어 뉴스 지원

## 트러블슈팅

### 일반적인 문제들
```
Q: 뉴스가 검색되지 않음
A: 네이버 API 키 유효성 및 일일 한도 확인

Q: AI 요약 결과가 부정확함
A: 프롬프트 조정 및 입력 데이터 품질 점검

Q: 이메일이 발송되지 않음
A: SMTP 설정 및 계정 인증 상태 확인

Q: 챗봇 연동이 안됨
A: MCP 프로토콜 설정 및 함수명 매핑 확인
```

### API 제한 대응
- 일일 요청 한도 모니터링
- 요청 간격 조절로 초당 제한 회피
- 대체 검색 소스 준비

## 보안 고려사항

### 1. API 키 보호
- 환경 변수 또는 암호화된 저장소 사용
- 키 노출 방지를 위한 로깅 제한

### 2. 스팸 방지
- 이메일 발송 빈도 제한
- 악의적 키워드 필터링
- 사용량 모니터링

## 버전 정보

### Naver_News_Crawling
- **Version**: 82ed4afd-6ef2-4281-bf7f-ffbb063cb526
- **상태**: 비활성화 (수동 실행)

### Naver_News_Crawling_Email  
- **Version**: ce97bdd6-b5b3-4c4b-a211-09657fb711f3
- **상태**: 비활성화 (수동 실행)