# 직원관리 워크플로우 (Project_administration)

## 프로젝트 개요
Google Sheets에 저장된 직원 정보를 기반으로 종료 예정자를 자동 분석하고, AI가 정리한 리포트를 Slack으로 전송하는 HR 자동화 시스템입니다. 인사팀의 업무 효율성을 높이고 놓칠 수 있는 중요한 일정을 관리합니다.

## 주요 기능

### 1. Google Sheets 연동
- **실시간 데이터 조회**: 직원 정보 스프레드시트 자동 읽기
- **OAuth 인증**: 안전한 Google 계정 연동
- **구조화된 데이터**: 인원, 종료일 등 필수 정보 추출

### 2. 자동 상태 분석
- **종료된 직원**: 종료일이 지난 직원 자동 감지
- **7일 이내 종료 예정**: 긴급 처리 필요한 직원
- **30일 이내 종료 예정**: 사전 준비가 필요한 직원

### 3. AI 기반 리포트 생성
- **Google Gemini**: 분석 결과를 읽기 쉬운 형태로 정리
- **구조화된 출력**: 카테고리별 명확한 구분
- **Slack 최적화**: 메신저에서 보기 좋은 형식

## 기술 스택

### 데이터 소스
- **Google Sheets API**: OAuth2 인증을 통한 안전한 접근
- **스프레드시트 ID**: 1XGLQAGPQlrJdMxMoHzxaZ4-ASfsm-NndcMDuDzH3TF8

### AI 모델
- **Google Gemini**: 자연어 처리 및 리포트 생성
- **프롬프트**: 간략하고 명확한 요약 지시

### 알림 시스템
- **Slack API**: 개인 DM 채널 전송
- **채널 ID**: D098NQCKG3G (개인 메시지)

## 워크플로우 구성

### 1. 데이터 수집
```
Google Sheets → 직원 정보 읽기
필드: 인원(이름), 종료일
형식: 날짜 형식의 종료일 데이터
```

### 2. 날짜 기반 분류 (Code 노드)
```javascript
const today = new Date();
const upcoming7 = new Date();
const upcoming30 = new Date();
upcoming7.setDate(today.getDate() + 7);
upcoming30.setDate(today.getDate() + 30);

const finished = [];        // 이미 종료된 직원
const endingSoon7 = [];     // 7일 이내 종료 예정
const endingSoon30 = [];    // 30일 이내 종료 예정

for (const item of items) {
  const endDate = new Date(item.json["종료일"]);
  const name = item.json["인원"];

  if (endDate < today) {
    finished.push({ ...item.json, status: "종료됨" });
  } else if (endDate <= upcoming7) {
    endingSoon7.push({ ...item.json, status: "7일 이내 종료 예정" });
  } else if (endDate <= upcoming30) {
    endingSoon30.push({ ...item.json, status: "30일 이내 종료 예정" });
  }
}
```

### 3. AI 리포트 생성
```
프롬프트: "다음은 종료 예정자 목록입니다. 간략하게 정리해 주세요:

종료됨:
- 김서준 (2025-08-20)
- ...

7일 이내 종료 예정:
- 오지훈 (2025-08-26)
- ...

30일 이내 종료 예정:
- ..."

Google Gemini → 구조화된 텍스트 출력
```

### 4. Slack 알림 전송
```
채널: 개인 DM (D098NQCKG3G)
내용: AI가 정리한 직원 현황 리포트
형식: 마크다운 지원 텍스트
```

## Google Sheets 데이터 구조

### 필수 컬럼
| 컬럼명 | 데이터 타입 | 설명 |
|--------|-------------|------|
| 인원 | 텍스트 | 직원 이름 |
| 종료일 | 날짜 | YYYY-MM-DD 형식 |

### 데이터 예시
```
인원          종료일
김서준        2025-08-20
오지훈        2025-08-26
박미영        2025-09-15
이상호        2025-10-01
```

## 설치 및 설정

### 필요한 자격 증명
```
Google Sheets:
- OAuth2 인증 설정
- Google Sheets account: hVNQ79zgqRFbo0hZ
- API 권한: spreadsheets.readonly

Google Gemini:
- API Key: Google Cloud Console에서 발급
- 계정: Google Gemini(PaLM) Api account 2

Slack:
- Bot Token: 워크스페이스 관리자가 발급
- 권한: chat:write, users:read
```

### 스프레드시트 설정
```
URL: https://docs.google.com/spreadsheets/d/1XGLQAGPQlrJdMxMoHzxaZ4-ASfsm-NndcMDuDzH3TF8/edit#gid=0
권한: 읽기 전용으로 충분
공유: n8n 서비스 계정에 뷰어 권한 부여
```

## 출력 예시

### AI 생성 리포트 형식
```
📊 직원 현황 리포트 (2024.XX.XX)

✅ 종료 완료: 1명
- 김서준 (2025-08-20 종료)

⚠️ 긴급 처리 필요 (7일 이내): 1명  
- 오지훈 (2025-08-26 종료 예정)

📋 사전 준비 필요 (30일 이내): 2명
- 박미영 (2025-09-15 종료 예정)
- 이상호 (2025-10-01 종료 예정)

💡 후속 조치:
- 종료 완료자: 계정 비활성화 및 자산 반납 확인
- 긴급 처리: 업무 인수인계 및 퇴사 절차 준비
- 사전 준비: 후임자 채용 계획 및 업무 문서화
```

## 자동화 옵션

### 1. 정기 실행 설정
```javascript
// Schedule Trigger 추가 예시
매일 오전 9시: 일일 현황 체크
매주 월요일: 주간 리포트
매월 1일: 월간 통계 리포트
```

### 2. 조건부 알림
```javascript
// 긴급 상황 감지
if (endingSoon7.length > 0) {
  // 추가 알림 채널 전송
  // 관리자에게 별도 알림
}
```

## 확장 기능

### 단기 개선사항
- [ ] 이메일 알림 추가
- [ ] 부서별 분류 기능
- [ ] 직급별 우선순위 설정
- [ ] 휴가/병가 상태 반영

### 장기 개선사항
- [ ] HR 시스템 연동
- [ ] 자동 업무 인수인계 템플릿
- [ ] 퇴사자 체크리스트 자동 생성
- [ ] 데이터 시각화 대시보드

## 에러 처리 및 예외 상황

### 1. 데이터 오류 처리
```javascript
// 날짜 형식 오류
if (isNaN(Date.parse(item.json["종료일"]))) {
  console.warn(`잘못된 날짜 형식: ${item.json["종료일"]}`);
  continue;
}

// 필수 필드 누락
if (!item.json["인원"] || !item.json["종료일"]) {
  console.warn("필수 필드 누락:", item.json);
  continue;
}
```

### 2. API 접근 오류
```
Google Sheets 접근 실패:
- OAuth 토큰 만료 → 재인증 필요
- 스프레드시트 권한 부족 → 공유 설정 확인
- API 할당량 초과 → 요청 빈도 조절
```

### 3. Slack 전송 실패
```
메시지 전송 오류:
- Bot 토큰 무효 → 토큰 재발급
- 채널 접근 권한 없음 → 봇 권한 확인
- 메시지 길이 초과 → 내용 분할 전송
```

## 성능 최적화

### 1. 데이터 처리 효율성
- 필요한 컬럼만 선택하여 데이터 전송량 최소화
- 메모리 내에서 날짜 계산 수행
- 불필요한 API 호출 방지

### 2. 응답 속도 개선
- Google Sheets 캐싱 활용
- AI 프롬프트 최적화로 처리 시간 단축

## 보안 및 개인정보 보호

### 1. 데이터 보안
- 직원 개인정보를 다루므로 접근 권한 엄격히 관리
- OAuth 토큰 암호화 저장
- 로그에서 개인정보 마스킹

### 2. 권한 관리
- HR 담당자만 워크플로우 실행 권한
- 스프레드시트 수정 권한과 읽기 권한 분리
- 정기적인 권한 검토

## 모니터링

### 1. 실행 상태 추적
- 워크플로우 성공/실패 로깅
- 데이터 품질 검증 결과
- AI 리포트 생성 시간 측정

### 2. 알림 전송 확인
- Slack 메시지 발송 성공률
- 사용자 읽음 상태 추적 (가능한 경우)

## 트러블슈팅

### Q: 스프레드시트 데이터를 읽지 못함
A: Google OAuth 인증 상태와 스프레드시트 공유 권한 확인

### Q: 날짜 계산이 부정확함
A: 서버 시간대 설정과 데이터의 날짜 형식 확인

### Q: AI 리포트가 생성되지 않음  
A: Google Gemini API 키 유효성과 입력 데이터 형식 점검

### Q: Slack 알림이 오지 않음
A: Bot 토큰과 채널 ID 확인, 봇의 메시지 권한 점검

## 버전 정보
- **Version**: 5efc29a2-6405-49d6-a27e-86bc589de5f3
- **상태**: 비활성화 (수동 실행 모드)
- **마지막 업데이트**: 2024년 개발 완료

## 관련 문서
- [Google Sheets API 문서](https://developers.google.com/sheets/api)
- [Google Gemini API 가이드](https://ai.google.dev/)
- [Slack Bot 설정 가이드](https://api.slack.com/bot-users)