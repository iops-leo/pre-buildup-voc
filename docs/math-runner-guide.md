# Math Runner Mini-Game (3D) 구현 가이드

이 문서는 `pre-buildup-voc` 내 **3D Math Runner 미니게임**의 최신 구현 상태와 확장 포인트를 정리합니다.

## 🛠 사용된 기술 스택
*   **프레임워크**: Next.js (App Router), React 19
*   **3D 렌더링**: `three`, `@react-three/fiber` (R3F)
*   **3D 유틸리티**: `@react-three/drei` (환경광, 카메라, 텍스트 렌더링 등)
*   **물리 엔진**: `@react-three/rapier` (충돌 판정, 중력, 이동 등)

---

## 📂 파일 구조 및 현재 구현된 모듈

핵심 게임 루프(문제 선택 → 게이트 통과 → 전투/장애물 → 승리/패배)가 동작합니다.

1.  **`app/math-runner/page.tsx`**
    *   게임 메인 진입점(Route)
    *   모드 선택(수학/영어), 난이도 선택, 승/패 UI, 최고 기록 UI를 담당
    *   그래픽 품질 옵션(`자동/높음/중간/낮음`) 선택 지원
    *   배경의 3D 씬과 2D HUD를 함께 렌더링
2.  **`components/math-runner/Scene.tsx`**
    *   조명/카메라/물리 엔진(`@react-three/rapier`) 설정
    *   `runId` 기반 리마운트로 게임 재시작 시 씬 내부 상태를 초기화
    *   런타임 품질 프리셋에 따라 DPR/그림자 품질 자동 조정
3.  **`components/math-runner/Player.tsx`**
    *   플레이어 이동(키보드/터치) + 카메라 추적
    *   병사 군중 렌더링 및 현재 인원 표시
    *   일정 거리 도달 시 승리 처리
4.  **`components/math-runner/Track.tsx`**
    *   트랙 지면과 양측 경계 스트립 렌더링
5.  **`components/math-runner/Gates.tsx`**
    *   정답/오답 게이트 충돌 처리
    *   정답(+10) / 오답(-10) 반영 및 다음 문제 진행
6.  **`components/math-runner/EnemyGroup.tsx`**
    *   적 그룹 충돌 시 전투 시작
    *   전투 중 적/아군이 1명씩 줄어드는 방식으로 교전 연출
    *   타격 파티클/충격파/전투 결과 텍스트 표시
7.  **`components/math-runner/Obstacle.tsx`**
    *   장애물 타입별 데미지 처리 및 피해 표시
8.  **`components/math-runner/TrackManager.tsx`**
    *   세그먼트 생성/제거, 문제 생성(수학/영어), 적/장애물 배치 담당
    *   목표 지점에 도달하면 피니시 라인 배치

---

## 🚀 다음으로 구현해야 할 작업 (Next Steps)

현재는 플레이 가능 상태이며, 다음 단계는 완성도 향상 중심입니다.

### 1. 전투 연출 고도화
*   근접 시 타격 이펙트(파티클/사운드) 다양화
*   전투 중 아군도 개별적으로 사라지는 연출 강화(지연/랜덤 방향 이탈)

### 2. 성능 최적화
*   `InstancedMesh` 기반 군중 렌더링으로 draw call 감소
*   기기 성능 기반 자동 프리셋 세분화(배터리 상태/프레임 드랍 감지 반영)

### 3. 콘텐츠 확장
*   영어 모드 문제 셋 확장(오답 후보 난이도 보정)
*   난이도별 보상/패널티 밸런싱 테이블 분리

### 4. QA 자동화
*   `useMathRunnerStore` 상태 전이 테스트 확장
*   핵심 게임 루프(시작/전투/승패) 컴포넌트 테스트 추가

---

## 💻 로컬에서 실행하기

터미널에서 다음 명령어를 실행하여 웹 서버를 띄운 뒤 테스트할 수 있습니다.

```bash
cd /Users/leo/project/pre-buildup-voc
npm run dev
```

브라우저에서 `http://localhost:3000/math-runner` (또는 활성화된 포트, 예: 3001)로 접속하시면 됩니다.
키보드 **좌/우 화살표 방향키**를 눌러 캐릭터를 움직여 보세요!
