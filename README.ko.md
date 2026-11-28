# connect-ai-marketer

**무인 AI 자율화 회사의 마케팅팀. 24시간, 일주일 내내 내 로그인된 브라우저에서 일합니다.**
CONNECT AI LAB · 모두를 위한 AI 교육 · MIT + Commons Clause 공개 코드(무료로 쓰되 판매 금지) · [ELDO](https://eldobrowser.com) 또는 [에고라이트(Ego Lite)](https://lite.ego.app) 위에서 동작

```bash
npx github:wonseokjung/connect-ai-marketer setup
```

짧은 명령 `npx connect-ai-marketer` 는 npm 배포와 함께 열립니다. 그 전까지는 위의 `github:` 한 줄을 그대로 쓰세요.

<p align="center">
  <img src="skill/assets/mascot/greet.gif" width="68" alt="조선 보부상 마케터 · 인사">&nbsp;
  <img src="skill/assets/mascot/scan.gif" width="68" alt="조선 보부상 마케터 · 탐색">&nbsp;
  <img src="skill/assets/mascot/draft.gif" width="68" alt="조선 보부상 마케터 · 초안">&nbsp;
  <img src="skill/assets/mascot/done.gif" width="68" alt="조선 보부상 마케터 · 완료"><br>
  <sub><b>조선 보부상 · 마케터</b> (CONNECT AI HQ PixelCrew) — 대화할 때 인사·댓글/채널 탐색·초안 작성·임시저장 완료 상태에 맞춰 작게 움직이며 표정이 바뀌는 픽셀 캐릭터예요.</sub>
</p>

[![connect-ai-marketer](docs/hero.webp)](docs/index.html)

## 처음이면 이 순서대로

1. **Node.js 설치**: [nodejs.org](https://nodejs.org)에서 LTS를 받아 설치합니다. 터미널(윈도우는 PowerShell)을 새로 열고 `node -v`가 v20 이상이면 됩니다(ELDO는 20 이상, 에고라이트만 쓰면 18 이상).
2. **팀이 일할 브라우저 설치**, 둘 중 하나:
   - **ELDO** (우리 브라우저, 먼저 권해요): [eldobrowser.com](https://eldobrowser.com) (free macOS / Windows). 팀은 거기서 `marketer` 에이전트로 일하고, 돌릴 때마다 새 공간에서 단계가 화면에 보여요.
   - **에고라이트**: [lite.ego.app](https://lite.ego.app)에서 받아 열고 첫 안내를 끝까지 마칩니다. 맥에서 열리지 않으면: 시스템 설정 > 개인정보 보호 및 보안 > 그래도 열기. 윈도우: 첫 안내가 끝나면 PowerShell을 새로 엽니다.
   - 둘 다 있으면 ELDO를 써요. config.json 에 `"browser": "ego"` 를 넣으면 에고라이트를 써요.
3. **바이브코딩 도구 하나**: Claude Code, ChatGPT Codex, Antigravity(Gemini) 중 쓰는 것 하나면 됩니다. 글은 이 도구가 씁니다.
4. **설치 한 줄**: 터미널에서 아래를 실행합니다. 바이브코딩 도구에게 실행해 달라고 해도 됩니다.
   ```bash
   npx github:wonseokjung/connect-ai-marketer setup
   ```
5. **그 브라우저에서 로그인**: 팀이 일할 사이트(인스타그램, X, 스레드, 유튜브 스튜디오)에 그 브라우저 안에서 로그인해 둡니다. 비밀번호와 2단계 인증은 직접 합니다.
6. **점검하고 근무 시작**:
   ```bash
   npx github:wonseokjung/connect-ai-marketer doctor
   npx github:wonseokjung/connect-ai-marketer watch
   ```

## 팀

AI 팀원 8명이 일합니다. 팀원은 하나씩 만들고 근무표(`team.json`)로 엮습니다. 글은 여러분의 에이전트(Claude Code, Codex, Antigravity)가 쓰고, 킷은 에고라이트 안에서 찾고, 확인하고, 결재함에 넣고, 입력합니다. 내 탭은 건드리지 않습니다.

| 팀원 | 하는 일 | 상태 |
|---|---|---|
| 댓글 담당 comment-replier | 인스타 새 댓글을 모으고, 댓글 단 사람의 언어로 답글 | v0.1 |
| 리스닝 담당 listener | X와 스레드에서 키워드 검색, 반응 순 정리, 리포트 | v0.1 |
| 업로드 마무리 담당 studio-finisher | 시트대로 제목, 설명, 재생목록, 태그를 채우고 저장, 새로고침해서 비교 | v0.1 |
| 게시 담당 crossposter | 채널별 초안, X 가중치 글자 수, 결재함, 승인하면 입력 | v0.1 |
| 벤치마크 담당 benchmarker | 올리기 전에 키워드로 유튜브 최근 상위 영상의 조회수, 올린 지 며칠, 길이, 하루 조회수 | v0.1 |
| 숫자 담당 analyst | 내 X · 유튜브 공개 숫자를 매일 CSV 한 줄로, 책상에 변화량 | v0.1 |
| 뜯어보기 담당 breakdown | 터진 글 · 영상의 글, 숫자, 첫 몇 초 장면 | v0.1 |
| 신청서 담당 form-filler | 크리에이터 프로그램 신청서를 채우고 제출 직전에 멈춤 | v0.1 |
| 상품 태그 담당 tagger | 쇼핑 태그 | 다음 |

## 팀이 일하는 방식

```
team before-upload ─▶ 벤치마크 담당 (리포트)
team new-video     ─▶ 업로드 마무리 ─▶ 게시 담당 (초안 → 결재함) ─▶ 댓글 담당
team daily         ─▶ 리스닝 ─▶ 숫자 담당 ─▶ 댓글 담당 ─▶ 책상
watch              ─▶ 댓글은 10분마다, daily 는 하루 한 번
```

- **역할**: `roles/<id>/` 의 `role.json` + `run.mjs`. 역할끼리는 작업 폴더의 파일로 주고받습니다.
- **순서표** `team.json`: setup 이 작업 폴더에 복사합니다. 순서를 바꾸면 나만의 팀이 됩니다. 숫자 담당과 벤치마크 담당은 선택 단계라서 `config.json` 에 아이디나 키워드를 넣어야 일합니다.
- **결재함**: 모든 게시와 답글은 `approve <id>` 전까지 기다립니다. 믿는 역할만 `config.autoSend` 에 넣으세요.
- **기본은 읽기만**: 리스닝, 벤치마크, 숫자, 뜯어보기 담당은 공개 페이지를 읽기만 합니다. 좋아요, 팔로우, 구독, 답글은 하지 않습니다.
- **책상**: `desk` 가 오늘의 결재, 답글, 업로드 확인, 내 숫자, 벤치마크, 사람들이 하는 말을 한 장으로 엽니다.
- **사람 문**: 로그인, 모든 게시, 마지막 게시 버튼(`crossposter.finalClick` 을 켜지 않으면).

명령은 영어 README와 같습니다. 작업 폴더는 `~/.connect-ai-marketer` 이고 킷 안에는 아무것도 쓰지 않습니다.

## 막힐 때

먼저 `doctor` 를 실행하세요. 안 되는 줄마다 영어와 한국어로 고치는 방법이 나옵니다. 그래도 막히면 doctor 결과를 바이브코딩 도구에 붙여 넣고 고쳐 달라고 하세요.

**윈도우: 이 시스템에서 스크립트를 실행할 수 없으므로...**
PowerShell 이 `npx` 를 막은 것입니다. `npx` 대신 `npx.cmd` 로 실행하거나(예: `npx.cmd github:wonseokjung/connect-ai-marketer setup`), 명령 프롬프트(cmd)에서 같은 줄을 실행하세요. 내 계정에서만 스크립트를 허용하려면: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**node, npx, ego-browser 를 찾을 수 없다 / command not found**
터미널은 열릴 때만 PATH를 읽습니다. Node.js 를 설치한 뒤, 또는 에고라이트 첫 안내를 마친 뒤에는 터미널을 닫고 새로 여세요. 맥에서 ego-browser 만 안 잡히면 지금 창에서 `export PATH="$HOME/.local/bin:$PATH"`

**npm 이 1 vulnerability 같은 문구를 보여 줘요**
오류가 아니라 npm 의 점검 안내이고, 설치는 끝났습니다. 이 킷은 npm 의존성이 없습니다. `doctor` 로 확인하고, 이 문구 때문에 `npm audit fix --force` 는 실행하지 마세요.

**윈도우가 에고라이트 설치를 막아요 (Windows의 PC 보호)**
추가 정보 > 실행을 누르세요. 첫 안내를 끝까지 마친 뒤 PowerShell 을 새로 여세요.

**맥, 윈도우 둘 다 되나요?**
둘 다 됩니다. 에고라이트는 맥용, 윈도우용이 따로 있고, 어느 쪽이든 Node.js 18 이상이면 됩니다.

**안티그래비티(제미나이)나 코덱스로도 되나요?**
됩니다. setup 이 찾은 도구마다 스킬을 넣습니다: Claude Code, Codex, Antigravity. 안티그래비티에서는 터미널에 설치 한 줄을 넣거나, 에이전트에게 실행해 달라고 하면 됩니다.

**스킬은 어디에 있나요?**
setup 이 `skill/SKILL.md` 를 `~/.claude/skills/connect-ai-marketer`(Claude Code), `~/.agents/skills/connect-ai-marketer`(Codex), `~/.gemini/config/skills/connect-ai-marketer`(Antigravity)에 복사합니다. 다시 넣으려면 `skill` 을 실행하고, 도구를 다시 시작해야 새 스킬이 보입니다.

**회사 컴퓨터**
회사 PC는 보안 정책으로 새 브라우저나 스크립트가 막혀 있는 경우가 많습니다. 개인 컴퓨터에서 하시거나, IT 담당자에게 에고라이트와 Node.js 허용을 문의하세요. 정책을 우회하지는 마세요.

**npx github: 가 매번 느려요**
npx 는 매번 GitHub 에서 킷을 받아 옵니다. 설치해 두려면 `npm install -g github:wonseokjung/connect-ai-marketer` 후 `connect-ai-marketer doctor` 처럼 쓰세요.

## 라이선스
MIT + Commons Clause. 읽고, 쓰고, 고치고, 나눠도 되고, 내 사업 홍보에 써도 됩니다. 이 코드를 팔거나, 이 코드로 유료 강의 · 호스팅 · 서비스를 파는 것은 안 됩니다. 자세한 내용은 LICENSE.

## 준비물
Node 20 이상(에고라이트만 쓰면 18 이상), 맥 또는 윈도우, 쓰는 사이트에 로그인된 ELDO 또는 에고라이트. 에고라이트는 별도 회사가 만든 무료 브라우저이고 약관이 따로 있습니다. NOTICE.md 참고.

<!-- team:start -->
## CONNECT AI LAB의 AI 직원들 (14명) · ELDO 브라우저

AI 직원을 오픈소스로 하나씩 만들고 있어요. 필요한 직원부터 데려가 쓰거나, [ELDO 브라우저](https://eldobrowser.com)와 [`wonseokjung/eldo`](https://github.com/wonseokjung/eldo)로 14명 전체를 한 번에 설치할 수 있어요 (`npx github:wonseokjung/eldo`).

<table>
<tr><td width="34%" valign="top"><b>ELDO 브라우저 · 통합 허브</b><br><a href="https://eldobrowser.com"><code>eldobrowser.com</code></a> · <a href="https://github.com/wonseokjung/eldo"><code>eldo</code></a></td><td valign="top">AI 직원이 일하는 무료 브라우저(macOS 공증 · Windows). 로그인은 한 번, 실행은 AI 직원이 맡고 결제와 인증은 대표님께 넘겨요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 자율 회사 본사</b><br><a href="https://github.com/wonseokjung/connect-ai-autonomous-company"><code>connect-ai-autonomous-company</code></a></td><td valign="top">삶과 AI 직원, 오토메이션, ELDO 브라우저를 하나로 연결하는 로컬 AI 자율 회사 OS예요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 개발 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-developer"><code>connect-ai-developer</code></a></td><td valign="top">한 문장 주면 가입, DB, 테스트 결제까지 붙은 서비스를 만들고 GitHub와 배포까지 연결해요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 세무회계 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-accountant"><code>connect-ai-accountant</code></a></td><td valign="top">홈택스, 카드, 통장, 메일 영수증을 모아 월 비용표와 세무사님께 드릴 폴더를 만들어요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 마케터 직원</b> · <b>지금 보는 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-marketer"><code>connect-ai-marketer</code></a></td><td valign="top">내 브라우저에서 24시간 댓글, 리스닝, 유튜브 업로드 마무리를 맡는 8인 마케팅팀이에요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 글쓰기 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-writer"><code>connect-ai-writer</code></a></td><td valign="top">영상이나 주제 하나로 리서치하고 플랫폼마다 내 말투로 글과 그림 초안을 써 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 사업 분석 직원</b><br><a href="https://github.com/wonseokjung/reversebusiness"><code>reversebusiness</code></a></td><td valign="top">사업 웹사이트 주소 하나 주면 수익 구조를 6칸으로 해부하고 내 버전을 기획해요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 이미지 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-image"><code>connect-ai-image</code></a></td><td valign="top">로컬 ComfyUI + FLUX 무료 우선, 브라우저 Gemini/ChatGPT로 플랫폼별 이미지 시리즈를 그려요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 발표 자료 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-slides-web"><code>connect-ai-slides-web</code></a></td><td valign="top">몇 줄 메모나 기존 PPT를 3D 모션 웹 슬라이드와 실제 파워포인트(.pptx) 파일로 만들어요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 3D 웹 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-three"><code>connect-ai-three</code></a></td><td valign="top">말 한마디로 Three.js 인터랙티브 3D 웹페이지와 프레임 정확한 영상까지 같이 만들어요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 모션그래픽 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-motion"><code>connect-ai-motion</code></a></td><td valign="top">글 몇 줄 주면 촬영 없이 83종 씬으로 16:9와 9:16 모션그래픽 영상을 만들어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 영상 편집 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-video-motion"><code>connect-ai-video-motion</code></a></td><td valign="top">내 영상을 주면 얼굴과 손을 피해서 빈자리에 80종 모션그래픽을 알아서 넣어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>AI XR 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-xr"><code>connect-ai-xr</code></a></td><td valign="top">한 문장 주면 메타 퀘스트에서 패스스루 AR과 VR로 열리는 WebXR 앱을 만들어 줘요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 상품 사진 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-product-photo"><code>connect-ai-product-photo</code></a></td><td valign="top">폰 상품 사진 폴더를 넣으면 원본 라벨은 선명하게 살린 플랫폼별 상품컷이 나와요.</td></tr>
<tr><td width="34%" valign="top"><b>AI 번역 직원</b><br><a href="https://github.com/wonseokjung/connect-ai-localizer"><code>connect-ai-localizer</code></a></td><td valign="top">한국어 글과 영상 자막을 내 말투 그대로 영어, 일본어, 스페인어 네이티브 글로 다시 써요.</td></tr>
</table>
<!-- team:end -->
