# GitLab-Redmine 이슈 연동 시스템

## 프로젝트 개요
GitLab과 Redmine 간의 이슈를 자동으로 동기화하고, 변경사항을 Slack으로 알림하는 통합 개발 프로젝트 관리 시스템입니다. 개발팀의 협업 효율성을 높이고 이슈 추적을 자동화합니다.

## 시스템 구성

### 1. 메인 워크플로우 (`GitLab_event_alert 및 redmine 연동`)
- GitLab Webhook을 통한 이벤트 수신
- 이벤트 타입별 분기 처리
- 하위 워크플로우 실행 제어

### 2. 이슈 관리 워크플로우 (`gitlab,redmine_issue관리`)
- GitLab 이슈 생성 → Redmine 이슈 자동 생성
- GitLab 이슈 수정 → Redmine 이슈 동기화
- GitLab 이슈 종료 → Redmine 이슈 상태 변경

### 3. 이벤트 알림 워크플로우 (`gitlab_event_alert`)
- Push 이벤트 처리 및 알림
- Merge Request 이벤트 처리
- 브랜치 생성 알림
- 이메일 및 Slack 통합 알림

### 4. 양방향 동기화 (`Redmine->Gitlab issue 연동`)
- Redmine 변경사항을 GitLab에 반영
- 1분마다 자동 체크 및 동기화

## 주요 기능

### 1. 자동 이슈 생성 및 동기화
```
GitLab 이슈 생성 → Redmine 이슈 자동 생성
- 제목, 설명, 담당자, 우선순위 매핑
- 사용자별 ID 매핑 (youngwoo.bang → 39, sangpil.park → 17)
- Slack 채널 및 개인 DM 알림
```

### 2. 실시간 상태 동기화
```
GitLab 이슈 수정 → Redmine 이슈 업데이트
GitLab 이슈 종료 → Redmine 상태를 '거절'로 변경
Redmine 상태 변경 → GitLab 이슈 상태 동기화
```

### 3. 이벤트별 맞춤 알림

#### Push 이벤트
- 브랜치별 Push 알림
- 커밋 정보 및 작성자 표시
- Test 키워드 포함 시 특별 처리
- 개인 DM 및 팀 채널 이중 알림

#### Merge Request 이벤트
- Open, Merge, Close 상태별 처리
- 소스/타겟 브랜치 정보 표시
- 담당자별 개인화된 알림

#### 브랜치 이벤트
- 새 브랜치 생성 알림
- 브랜치명 및 생성자 정보

## 기술 스택

### API 연동
- **GitLab API**: 프로젝트 ID 188, Private Token 인증
- **Redmine API**: X-Redmine-API-Key 인증
- **Slack API**: 채널별 메시지 전송 및 사용자 매핑

### 이메일 시스템
- **SMTP**: 네이버 메일을 통한 이슈 알림
- **HTML 템플릿**: 구조화된 이메일 콘텐츠

### 데이터 처리
- **JavaScript 코드**: 사용자 ID 매핑 및 이슈 상태 판단
- **HTTP Request**: REST API 호출 및 데이터 동기화

## 설치 및 설정

### 필요한 자격 증명
```
GitLab:
- API Token: glpat-UVdur-D-wMoTY5fbSTkn
- Project ID: 188

Redmine:
- API Key: 690d6536c977dd8d7567e99a08244f8f08ecddca
- Project ID: 16

Slack:
- Bot Token: xoxb-2949640944549-9295371684437-ZQ9h7C2atDg0f1HQRwHtTVMs
- 알림 채널: C09CJM882SH

SMTP:
- 서버: 네이버 메일
- 계정: qkdduddn@naver.com
```

### Webhook 설정
```
GitLab Webhook URL: /gitlab-webhook
지원 이벤트: Push, Merge Request, Issues
```

## 워크플로우 상세

### 1. 이슈 생성 프로세스
```mermaid
graph TD
    A[GitLab 이슈 생성] --> B[사용자 ID 매핑]
    B --> C[Redmine 이슈 생성]
    C --> D[Slack 사용자 조회]
    D --> E[팀 채널 알림]
    D --> F[개인 DM 알림]
```

### 2. 상태 동기화 프로세스
```mermaid
graph TD
    A[GitLab 상태 변경] --> B[Slack 히스토리 조회]
    B --> C[이슈 매핑 확인]
    C --> D[Redmine 이슈 업데이트]
    D --> E[완료 알림 전송]
```

### 3. 양방향 동기화
```mermaid
graph TD
    A[1분마다 실행] --> B[Redmine 최근 변경 조회]
    B --> C[GitLab 이슈 상태 확인]
    C --> D[차이점 분석]
    D --> E[GitLab 이슈 업데이트]
```

## 사용자 매핑 테이블

| GitLab Username | Redmine User ID | 역할 |
|----------------|-----------------|------|
| youngwoo.bang  | 39             | 개발자 |
| sangpil.park   | 17             | 개발자 |
| case2589       | 40             | 개발자 |

## Slack 채널 구성

| 채널 ID | 용도 | 설명 |
|---------|------|------|
| C09CJM882SH | 이슈 알림 | 전체 이슈 생성/수정 알림 |
| C09D0BU6UBB | Push 알림 | Git Push 이벤트 알림 |
| C09CR0HLWF6 | Merge 알림 | Merge Request 알림 |
| C09CJH582G5 | MR 요청 | Merge Request 상세 알림 |

## 모니터링 및 로깅

### 1. 실행 상태 추적
- 워크플로우별 실행 결과 로깅
- 에러 발생 시 자동 알림
- API 응답 상태 모니터링

### 2. 데이터 무결성 보장
- 이슈 매핑 정보 검증
- 중복 생성 방지 로직
- 상태 불일치 자동 감지

## 트러블슈팅

### 1. 일반적인 문제
```
Q: 이슈가 Redmine에 생성되지 않음
A: GitLab Webhook 설정 및 API 토큰 확인

Q: Slack 알림이 오지 않음  
A: Bot 토큰 권한 및 채널 ID 확인

Q: 사용자 매핑이 안됨
A: Code 노드의 사용자명 매핑 테이블 확인
```

### 2. API 제한사항
- GitLab API: 시간당 요청 제한
- Redmine API: 동시 요청 제한
- Slack API: 메시지 전송 속도 제한

## 성능 최적화

### 1. 효율적인 데이터 처리
- 필요한 필드만 API 호출
- 배치 처리로 API 호출 최소화
- 캐싱을 통한 중복 요청 방지

### 2. 알림 최적화
- 개인별 맞춤 알림 설정
- 중요도별 알림 채널 분리
- 스팸 방지를 위한 제한 설정

## 확장 계획

- [ ] GitHub 연동 추가
- [ ] Jira 시스템 통합
- [ ] 대시보드 개발
- [ ] 자동 보고서 생성
- [ ] 성능 메트릭 수집

## 버전 정보
- **GitLab 연동**: 784978e7-aa23-4b11-b748-68620a013bda
- **이슈 관리**: 444d5692-97b8-4437-a855-0225678d9c75  
- **이벤트 알림**: 5ec57df8-f87f-4343-b48f-14deba1fc445
- **상태**: 활성화됨