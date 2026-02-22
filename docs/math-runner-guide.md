# Math Runner Mini-Game (3D) 구현 가이드

이 문서는 `pre-buildup-voc` (Next.js 웹 프로젝트) 내에 추가된 **3D Math Runner 미니게임**의 현재 구현 상태와 향후 개발을 이어나가기 위한 가이드입니다.

## 🛠 사용된 기술 스택
*   **프레임워크**: Next.js (App Router), React 19
*   **3D 렌더링**: `three`, `@react-three/fiber` (R3F)
*   **3D 유틸리티**: `@react-three/drei` (환경광, 카메라, 텍스트 렌더링 등)
*   **물리 엔진**: `@react-three/rapier` (충돌 판정, 중력, 이동 등)

---

## 📂 파일 구조 및 현재 구현된 모듈

현재 기본적인 3D 씬과 캐릭터 이동, 물리 엔진 충돌 체크의 뼈대가 완성되어 있습니다.

1.  **`app/math-runner/page.tsx`**
    *   게임의 메인 진입점(Route)입니다.
    *   2D UI 오버레이(상단 퀴즈 문제 표시, 점수판 등)를 HTML/TailwindCSS로 렌더링합니다.
    *   배경에 3D `Canvas`를 띄우고 `<MathRunnerScene />`을 로드합니다.
2.  **`components/math-runner/Scene.tsx`**
    *   3D 환경의 중심(Scene) 컴포넌트입니다.
    *   조명(`ambientLight`, `directionalLight`), 배경(`Sky`, `Environment`), 그리고 Rapier `<Physics>` 물리 엔진 래퍼를 포함합니다.
3.  **`components/math-runner/Player.tsx`**
    *   파란색 캡슐 형태의 플레이어 캐릭터입니다.
    *   키보드 좌우 화살표(`ArrowLeft`, `ArrowRight`)로 이동 좌표를 설정하고, `useFrame` 안에서 부드럽게(lerp) 이동합니다.
    *   카메라가 캐릭터의 뒤를 따라가도록 세팅되어 있습니다.
4.  **`components/math-runner/Track.tsx`**
    *   캐릭터가 달리는 바닥과 양옆 벽(장애물 이탈 방지용)입니다.
5.  **`components/math-runner/Gates.tsx`**
    *   정답/오답이 적혀있는 반투명 게이트입니다.
    *   `@react-three/drei`의 `<Text>` 컴포넌트를 사용하여 숫자를 띄웁니다.
    *   `RigidBody`의 `sensor` 속성을 활용해, 플레이어가 캐릭터를 통과할 때 물리적 충돌(튕겨남) 없이 이벤트를 발생시키도록 설정되어 있습니다 (`onIntersectionEnter` 로그 확인 가능).

---

## 🚀 다음으로 구현해야 할 작업 (Next Steps)

현재 뼈대가 완성되었으므로, 다음 요소들을 순차적으로 붙여나가면 완성 형태의 게임이 됩니다.

### 1. 군중(Crowd) 시스템 구현
*   현재는 캡슐 형태의 단일 캐릭터 1개만 있습니다.
*   Zustand 같은 상태 관리나 React State를 사용해 현재 '내 캐릭터의 총 개수'를 저장합니다.
*   숫자가 변할 때마다 `<Player>` 컴포넌트 주변으로 작은 캡슐(또는 스틱맨 모델) 인스턴스들을 여러 개 렌더링하도록 수정해야 합니다. (Three.js의 `InstancedMesh`를 사용하면 성능 저하 없이 수백 개를 그릴 수 있습니다.)

### 2. 게이트 통과 로직 및 수학 연산 적용
*   `<Gates>` 컴포넌트를 통과했을 때, 통과한 쪽이 '정답'인지 '오답'인지 판별합니다.
*   정답 게이트를 통과하면 앞서 만든 군중 숫자에 연산(예: `x 2`, `+ 10`)을 적용하여 캐릭터 개수를 늘립니다.
*   오답 게이트 통과 시 페널티 효과(붉은 깜빡임 쉐이더 등)와 함께 숫자를 줄입니다.

### 3. 무한 러닝(Endless Runner) 바닥 생성
*   캐릭터가 일정 거리 Z축으로 전진하면, 이전 바닥을 없애고 캐릭터 앞쪽으로 새로운 바닥과 새로운 `<Gates>`(새로운 문제)를 무한정 생성(Spawn)해야 합니다.
*   배열 기반으로 Map 구간 데이터를 관리하고 렌더링 범위를 제한하여 최적화합니다.

### 4. 에셋 교체 및 폴리싱 (마무리)
*   단순한 파란색 캡슐 대신 `.gltf` / `.glb` 포맷의 실제 졸라맨/캐릭터 3D 모델을 불러와 적용합니다 (`useGLTF` 훅 활용).
*   달리기 애니메이션 루프를 적용합니다.

---

## 💻 로컬에서 실행하기

터미널에서 다음 명령어를 실행하여 웹 서버를 띄운 뒤 테스트할 수 있습니다.

```bash
cd /Users/leo/project/pre-buildup-voc
npm run dev
```

브라우저에서 `http://localhost:3000/math-runner` (또는 활성화된 포트, 예: 3001)로 접속하시면 됩니다.
키보드 **좌/우 화살표 방향키**를 눌러 캐릭터를 움직여 보세요!
